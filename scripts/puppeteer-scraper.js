#!/usr/bin/env node

const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

class AdvancedScraper {
    constructor(options = {}) {
        this.options = {
            headless: true,
            defaultTimeout: 30000,
            viewport: { width: 1920, height: 1080 },
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            ...options
        };
        this.browser = null;
        this.page = null;
    }

    async init() {
        this.browser = await puppeteer.launch({
            headless: this.options.headless,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        this.page = await this.browser.newPage();
        await this.page.setViewport(this.options.viewport);
        await this.page.setUserAgent(this.options.userAgent);
        await this.page.setDefaultTimeout(this.options.defaultTimeout);
    }

    async close() {
        if (this.browser) {
            await this.browser.close();
        }
    }

    async goto(url, options = {}) {
        try {
            await this.page.goto(url, {
                waitUntil: 'networkidle2',
                ...options
            });
        } catch (error) {
            console.error(`Failed to navigate to ${url}:`, error.message);
            throw error;
        }
    }

    async scrapeStaticContent(selector) {
        return await this.page.evaluate((sel) => {
            const element = document.querySelector(sel);
            return element ? element.innerText : null;
        }, selector);
    }

    async scrapeDynamicContent(selector, waitOptions = {}) {
        try {
            await this.page.waitForSelector(selector, waitOptions);
            return await this.scrapeStaticContent(selector);
        } catch (error) {
            console.error(`Failed to find selector ${selector}:`, error.message);
            return null;
        }
    }

    async clickAndWait(selector, waitForSelector, waitOptions = {}) {
        await this.page.click(selector);
        await this.page.waitForSelector(waitForSelector, waitOptions);
    }

    async handlePopup(triggerSelector, contentSelector) {
        await this.page.click(triggerSelector);
        await this.page.waitForSelector(contentSelector, { visible: true });
        
        const content = await this.page.evaluate((sel) => {
            const element = document.querySelector(sel);
            return element ? element.innerHTML : null;
        }, contentSelector);
        
        const closeButton = await this.page.$('[aria-label="Close"], .close, .modal-close, button[class*="close"]');
        if (closeButton) {
            await closeButton.click();
            await this.page.waitForSelector(contentSelector, { hidden: true });
        }
        
        return content;
    }

    async login(url, username, password, selectors = {}) {
        const defaultSelectors = {
            username: 'input[name="username"], input[name="email"], input[type="email"], #username, #email',
            password: 'input[name="password"], input[type="password"], #password',
            submit: 'button[type="submit"], input[type="submit"], button:contains("Login"), button:contains("Sign in")'
        };
        
        const sel = { ...defaultSelectors, ...selectors };
        
        await this.goto(url);
        
        await this.page.type(sel.username, username);
        await this.page.type(sel.password, password);
        
        await Promise.all([
            this.page.click(sel.submit),
            this.page.waitForNavigation({ waitUntil: 'networkidle2' })
        ]);
        
        const cookies = await this.page.cookies();
        return cookies;
    }

    async handleInfiniteScroll(maxScrolls = 10, scrollDelay = 1000) {
        let previousHeight = 0;
        let scrollCount = 0;
        
        while (scrollCount < maxScrolls) {
            const currentHeight = await this.page.evaluate('document.body.scrollHeight');
            
            if (currentHeight === previousHeight) {
                break;
            }
            
            previousHeight = currentHeight;
            await this.page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
            await this.page.waitForTimeout(scrollDelay);
            scrollCount++;
        }
        
        return scrollCount;
    }

    async scrapeInfiniteScrollContent(itemSelector, maxScrolls = 10) {
        await this.handleInfiniteScroll(maxScrolls);
        
        const items = await this.page.evaluate((selector) => {
            const elements = document.querySelectorAll(selector);
            return Array.from(elements).map(el => ({
                text: el.innerText,
                html: el.innerHTML,
                attributes: Array.from(el.attributes).reduce((acc, attr) => {
                    acc[attr.name] = attr.value;
                    return acc;
                }, {})
            }));
        }, itemSelector);
        
        return items;
    }

    async fillForm(formData) {
        for (const [selector, value] of Object.entries(formData)) {
            const element = await this.page.$(selector);
            if (!element) {
                console.warn(`Form field not found: ${selector}`);
                continue;
            }
            
            const tagName = await element.evaluate(el => el.tagName);
            const type = await element.evaluate(el => el.type);
            
            if (tagName === 'SELECT') {
                await this.page.select(selector, value);
            } else if (type === 'checkbox' || type === 'radio') {
                if (value) {
                    await element.click();
                }
            } else {
                await this.page.type(selector, value, { delay: 50 });
            }
        }
    }

    async submitForm(submitSelector) {
        await Promise.all([
            this.page.click(submitSelector),
            this.page.waitForNavigation({ waitUntil: 'networkidle2' })
        ]);
    }

    async takeScreenshot(filename, options = {}) {
        const screenshotOptions = {
            fullPage: true,
            ...options
        };
        
        await this.page.screenshot({
            path: filename,
            ...screenshotOptions
        });
        
        console.log(`Screenshot saved to: ${filename}`);
    }

    async extractTable(tableSelector) {
        return await this.page.evaluate((selector) => {
            const table = document.querySelector(selector);
            if (!table) return null;
            
            const rows = Array.from(table.querySelectorAll('tr'));
            const headers = Array.from(rows[0]?.querySelectorAll('th, td') || [])
                .map(cell => cell.innerText.trim());
            
            const data = rows.slice(1).map(row => {
                const cells = Array.from(row.querySelectorAll('td'));
                return cells.reduce((acc, cell, index) => {
                    acc[headers[index] || `column_${index}`] = cell.innerText.trim();
                    return acc;
                }, {});
            });
            
            return { headers, data };
        }, tableSelector);
    }

    async waitForAjax(timeout = 5000) {
        await this.page.waitForLoadState('networkidle', { timeout });
    }

    async interceptRequests(callback) {
        await this.page.setRequestInterception(true);
        this.page.on('request', callback);
    }

    async extractMetadata() {
        return await this.page.evaluate(() => {
            const getMetaContent = (name) => {
                const meta = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`);
                return meta ? meta.content : null;
            };
            
            return {
                title: document.title,
                description: getMetaContent('description') || getMetaContent('og:description'),
                keywords: getMetaContent('keywords'),
                author: getMetaContent('author'),
                ogTitle: getMetaContent('og:title'),
                ogImage: getMetaContent('og:image'),
                ogUrl: getMetaContent('og:url'),
                canonical: document.querySelector('link[rel="canonical"]')?.href
            };
        });
    }

    async saveJSON(data, filename) {
        const dir = path.dirname(filename);
        await fs.mkdir(dir, { recursive: true });
        await fs.writeFile(filename, JSON.stringify(data, null, 2));
        console.log(`Data saved to: ${filename}`);
    }

    async saveHTML(filename) {
        const html = await this.page.content();
        const dir = path.dirname(filename);
        await fs.mkdir(dir, { recursive: true });
        await fs.writeFile(filename, html);
        console.log(`HTML saved to: ${filename}`);
    }
}

async function pyconExample() {
    const scraper = new AdvancedScraper({ headless: true });
    
    try {
        await scraper.init();
        
        console.log('Scraping PyCon TH 2025 example...');
        await scraper.goto('https://th.pycon.org/en/');
        
        const speakers = await scraper.scrapeInfiniteScrollContent('.speaker-card', 5);
        console.log(`Found ${speakers.length} speakers`);
        
        const metadata = await scraper.extractMetadata();
        console.log('Page metadata:', metadata);
        
        await scraper.takeScreenshot('output/pycon-homepage.png');
        
        const sessionDetails = [];
        for (let i = 0; i < Math.min(3, speakers.length); i++) {
            try {
                const popupContent = await scraper.handlePopup(
                    `.speaker-card:nth-child(${i + 1}) .details-button`,
                    '.modal-content'
                );
                sessionDetails.push(popupContent);
            } catch (error) {
                console.log(`Could not get details for speaker ${i + 1}`);
            }
        }
        
        await scraper.saveJSON({
            metadata,
            speakers: speakers.slice(0, 10),
            sessionDetails
        }, 'output/pycon-data.json');
        
    } catch (error) {
        console.error('Scraping failed:', error);
    } finally {
        await scraper.close();
    }
}

async function main() {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        console.log('Usage: node puppeteer-scraper.js <command> [options]');
        console.log('Commands:');
        console.log('  example     - Run PyCon TH scraping example');
        console.log('  scrape <url> [options] - Scrape a specific URL');
        console.log('Options:');
        console.log('  --selector <selector> - CSS selector to scrape');
        console.log('  --screenshot <filename> - Take a screenshot');
        console.log('  --infinite-scroll - Handle infinite scroll');
        console.log('  --output <filename> - Save results to file');
        return;
    }
    
    const command = args[0];
    
    if (command === 'example') {
        await pyconExample();
    } else if (command === 'scrape') {
        const url = args[1];
        if (!url) {
            console.error('URL is required for scrape command');
            return;
        }
        
        const scraper = new AdvancedScraper();
        try {
            await scraper.init();
            await scraper.goto(url);
            
            const selectorIndex = args.indexOf('--selector');
            if (selectorIndex !== -1 && args[selectorIndex + 1]) {
                const selector = args[selectorIndex + 1];
                const content = await scraper.scrapeDynamicContent(selector);
                console.log('Scraped content:', content);
            }
            
            const screenshotIndex = args.indexOf('--screenshot');
            if (screenshotIndex !== -1 && args[screenshotIndex + 1]) {
                await scraper.takeScreenshot(args[screenshotIndex + 1]);
            }
            
            if (args.includes('--infinite-scroll')) {
                const scrolls = await scraper.handleInfiniteScroll();
                console.log(`Scrolled ${scrolls} times`);
            }
            
            const outputIndex = args.indexOf('--output');
            if (outputIndex !== -1 && args[outputIndex + 1]) {
                await scraper.saveHTML(args[outputIndex + 1]);
            }
            
        } finally {
            await scraper.close();
        }
    }
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = AdvancedScraper;