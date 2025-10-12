#!/usr/bin/env node

const AdvancedScraper = require('./puppeteer-scraper');
const fs = require('fs').promises;
const path = require('path');

async function scrapePrizesSimple() {
    const scraper = new AdvancedScraper({ headless: true });

    try {
        await scraper.init();

        console.log('Navigating to ETHOnline 2025 prizes page...');
        await scraper.goto('https://ethglobal.com/events/ethonline2025/prizes');

        // Wait for page to fully load
        await new Promise(resolve => setTimeout(resolve, 5000));

        // Scroll to load all content
        console.log('Scrolling to load all content...');
        await scraper.handleInfiniteScroll(5, 2000);

        // Extract all prize information in a structured way
        const prizesData = await scraper.page.evaluate(() => {
            const result = {
                sponsors: [],
                allText: '',
                structuredPrizes: []
            };

            // Get all text
            const main = document.querySelector('main') || document.body;
            result.allText = main.innerText;

            // Try to find structured prize information
            // Look for common patterns in ETHGlobal prize pages
            const headings = document.querySelectorAll('h1, h2, h3, h4');
            headings.forEach(heading => {
                const text = heading.innerText?.trim();
                if (text && (text.includes('$') || text.toLowerCase().includes('prize'))) {
                    // Get the next few siblings for context
                    let details = '';
                    let current = heading.nextElementSibling;
                    let count = 0;
                    while (current && count < 5) {
                        details += current.innerText?.trim() + '\n';
                        current = current.nextElementSibling;
                        count++;
                    }

                    result.structuredPrizes.push({
                        title: text,
                        details: details.trim()
                    });
                }
            });

            // Also try to find prize sections by looking for money amounts
            const allElements = document.querySelectorAll('div, section, article');
            allElements.forEach((el, idx) => {
                const text = el.innerText?.trim() || '';
                // If it has a money amount and reasonable length, might be a prize
                if (text.match(/\$\d{1,3},?\d{3}/) && text.length > 20 && text.length < 2000) {
                    // Check if we haven't already captured this
                    const isDuplicate = result.structuredPrizes.some(p =>
                        text.includes(p.title) || p.details.includes(text)
                    );

                    if (!isDuplicate) {
                        result.sponsors.push({
                            index: idx,
                            text: text
                        });
                    }
                }
            });

            return result;
        });

        console.log(`Found ${prizesData.structuredPrizes.length} structured prizes`);
        console.log(`Found ${prizesData.sponsors.length} sponsor sections`);

        // Save raw data
        const outputDir = path.join(__dirname, '..', 'output');
        await fs.mkdir(outputDir, { recursive: true });
        await scraper.saveJSON(prizesData, path.join(outputDir, 'prizes-simple-raw.json'));

        // Format as markdown with better structure
        let markdown = `# ETHOnline 2025 Prizes\n\n`;
        markdown += `**Event:** ETHOnline 2025\n`;
        markdown += `**Source:** https://ethglobal.com/events/ethonline2025/prizes\n`;
        markdown += `**Scraped:** ${new Date().toISOString().split('T')[0]}\n\n`;
        markdown += `---\n\n`;

        // Add table of contents
        if (prizesData.structuredPrizes.length > 0) {
            markdown += `## Table of Contents\n\n`;
            prizesData.structuredPrizes.forEach((prize, idx) => {
                const anchor = prize.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                markdown += `${idx + 1}. [${prize.title}](#${anchor})\n`;
            });
            markdown += `\n---\n\n`;

            // Add detailed prizes
            prizesData.structuredPrizes.forEach((prize) => {
                markdown += `## ${prize.title}\n\n`;
                if (prize.details) {
                    markdown += `${prize.details}\n\n`;
                }
                markdown += `---\n\n`;
            });
        }

        // Add any additional sponsor sections
        if (prizesData.sponsors.length > 0) {
            markdown += `## Additional Prize Information\n\n`;
            prizesData.sponsors.forEach((sponsor, idx) => {
                markdown += `### Sponsor ${idx + 1}\n\n`;
                markdown += `${sponsor.text}\n\n`;
                markdown += `---\n\n`;
            });
        }

        // Add full page text as appendix
        markdown += `## Appendix: Full Page Content\n\n`;
        markdown += `<details>\n<summary>Click to expand full page text</summary>\n\n`;
        markdown += `\`\`\`\n${prizesData.allText}\n\`\`\`\n\n`;
        markdown += `</details>\n`;

        // Save markdown
        const docsDir = path.join(__dirname, '..', 'docs');
        await fs.mkdir(docsDir, { recursive: true });
        const markdownPath = path.join(docsDir, 'ethonline2025-prizes.md');
        await fs.writeFile(markdownPath, markdown);
        console.log(`\n✓ Prizes saved to: ${markdownPath}`);

        // Take screenshot
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
    scrapePrizesSimple()
        .then(filepath => console.log(`\n✓ Success! Prizes saved to ${filepath}`))
        .catch(console.error);
}

module.exports = scrapePrizesSimple;
