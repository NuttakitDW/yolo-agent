#!/usr/bin/env node

const AdvancedScraper = require('./puppeteer-scraper');
const fs = require('fs').promises;
const path = require('path');

async function scrapePrizes() {
    const scraper = new AdvancedScraper({ headless: true });

    try {
        await scraper.init();

        console.log('Navigating to ETHOnline 2025 prizes page...');
        await scraper.goto('https://ethglobal.com/events/ethonline2025/prizes');

        // Wait for the page to load - use setTimeout promise instead
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Extract all prize information
        const prizesData = await scraper.page.evaluate(() => {
            const prizes = [];

            // Find all prize sections
            const prizeCards = document.querySelectorAll('[class*="prize"], [data-testid*="prize"], article, section[class*="sponsor"]');

            // If specific selectors don't work, try to get all content
            const mainContent = document.querySelector('main') || document.body;
            const allText = mainContent.innerText;

            // Try to find prize containers more generically
            const containers = document.querySelectorAll('div[class*="card"], div[class*="item"], div[class*="sponsor"]');

            containers.forEach((container, idx) => {
                const text = container.innerText || '';
                // Only include containers that likely contain prize info (have $ signs or "prize" text)
                if (text.includes('$') || text.toLowerCase().includes('prize')) {
                    prizes.push({
                        index: idx,
                        text: text.trim(),
                        html: container.innerHTML
                    });
                }
            });

            return {
                prizes,
                fullPageText: allText,
                url: window.location.href
            };
        });

        console.log(`Found ${prizesData.prizes.length} potential prize sections`);

        // Save raw data for debugging
        await scraper.saveJSON(prizesData, 'output/prizes-raw.json');

        // Format as markdown
        let markdown = `# ETHOnline 2025 Prizes\n\n`;
        markdown += `Scraped from: ${prizesData.url}\n`;
        markdown += `Date: ${new Date().toISOString().split('T')[0]}\n\n`;
        markdown += `---\n\n`;

        if (prizesData.prizes.length > 0) {
            prizesData.prizes.forEach((prize, idx) => {
                markdown += `## Prize Section ${idx + 1}\n\n`;
                markdown += `${prize.text}\n\n`;
                markdown += `---\n\n`;
            });
        } else {
            // If structured extraction failed, use full page text
            markdown += `## All Prize Information\n\n`;
            markdown += `${prizesData.fullPageText}\n\n`;
        }

        // Save markdown
        const docsDir = path.join(__dirname, '..', 'docs');
        await fs.mkdir(docsDir, { recursive: true });
        const markdownPath = path.join(docsDir, 'ethonline2025-prizes.md');
        await fs.writeFile(markdownPath, markdown);
        console.log(`Prizes saved to: ${markdownPath}`);

        // Take screenshot for reference
        const outputDir = path.join(__dirname, '..', 'output');
        await fs.mkdir(outputDir, { recursive: true });
        await scraper.takeScreenshot(path.join(outputDir, 'prizes-page.png'));

        return markdownPath;

    } catch (error) {
        console.error('Scraping failed:', error);
        throw error;
    } finally {
        await scraper.close();
    }
}

if (require.main === module) {
    scrapePrizes()
        .then(filepath => console.log(`✓ Success! Prizes saved to ${filepath}`))
        .catch(console.error);
}

module.exports = scrapePrizes;
