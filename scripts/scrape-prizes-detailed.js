#!/usr/bin/env node

const AdvancedScraper = require('./puppeteer-scraper');
const fs = require('fs').promises;
const path = require('path');

async function scrapePrizesDetailed() {
    const scraper = new AdvancedScraper({ headless: true });

    try {
        await scraper.init();

        console.log('Navigating to ETHOnline 2025 prizes page...');
        await scraper.goto('https://ethglobal.com/events/ethonline2025/prizes');

        // Wait for prizes to load
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Get all prize cards
        const prizeCards = await scraper.page.evaluate(() => {
            const cards = [];
            // Find all prize containers/links
            const prizeElements = document.querySelectorAll('a[href*="/prizes/"], button[class*="prize"], div[class*="prize-card"]');

            // If that doesn't work, try to find by structure
            if (prizeElements.length === 0) {
                // Try finding by clickable elements with prize info
                const allLinks = document.querySelectorAll('a');
                allLinks.forEach(link => {
                    const text = link.innerText || '';
                    if (text.includes('$') && text.length > 5 && text.length < 200) {
                        cards.push({
                            text: text.trim(),
                            href: link.href
                        });
                    }
                });
            } else {
                prizeElements.forEach(el => {
                    cards.push({
                        text: el.innerText?.trim() || '',
                        href: el.href || ''
                    });
                });
            }

            return cards;
        });

        console.log(`Found ${prizeCards.length} prize cards to process`);

        const allPrizes = [];

        // For each prize card, try to get detailed information
        for (let i = 0; i < Math.min(prizeCards.length, 50); i++) {
            const card = prizeCards[i];
            console.log(`Processing prize ${i + 1}/${prizeCards.length}: ${card.text.substring(0, 50)}...`);

            try {
                // Click to see details
                const prizeSelectors = [
                    `a[href="${card.href}"]`,
                    `a:nth-of-type(${i + 1})`,
                    `button:nth-of-type(${i + 1})`
                ];

                let clicked = false;
                for (const selector of prizeSelectors) {
                    try {
                        const element = await scraper.page.$(selector);
                        if (element) {
                            await element.click();
                            clicked = true;
                            break;
                        }
                    } catch (e) {
                        // Continue to next selector
                    }
                }

                if (clicked) {
                    // Wait for modal/details to appear
                    await new Promise(resolve => setTimeout(resolve, 1000));

                    // Extract detailed prize information
                    const prizeDetails = await scraper.page.evaluate(() => {
                        // Look for modal or expanded content
                        const modal = document.querySelector('[role="dialog"], .modal, [class*="modal"], [class*="details"]');
                        if (modal) {
                            return {
                                title: modal.querySelector('h1, h2, h3, [class*="title"]')?.innerText?.trim() || '',
                                description: modal.querySelector('p, [class*="description"]')?.innerText?.trim() || '',
                                fullText: modal.innerText?.trim() || '',
                                html: modal.innerHTML
                            };
                        }
                        return null;
                    });

                    if (prizeDetails) {
                        allPrizes.push({
                            index: i,
                            cardText: card.text,
                            details: prizeDetails
                        });
                    }

                    // Close modal
                    try {
                        const closeSelectors = [
                            'button[aria-label="Close"]',
                            'button[class*="close"]',
                            '[class*="close-button"]',
                            'button[class*="modal-close"]'
                        ];

                        for (const selector of closeSelectors) {
                            const closeBtn = await scraper.page.$(selector);
                            if (closeBtn) {
                                await closeBtn.click();
                                await new Promise(resolve => setTimeout(resolve, 500));
                                break;
                            }
                        }
                    } catch (e) {
                        // If can't close, press Escape
                        await scraper.page.keyboard.press('Escape');
                        await new Promise(resolve => setTimeout(resolve, 500));
                    }
                }
            } catch (error) {
                console.log(`Error processing prize ${i}: ${error.message}`);
            }
        }

        console.log(`\nExtracted details for ${allPrizes.length} prizes`);

        // Also get all text from the page as backup
        const pageText = await scraper.page.evaluate(() => {
            return document.body.innerText;
        });

        // Save raw data
        await scraper.saveJSON({
            prizes: allPrizes,
            prizeCards: prizeCards,
            pageText: pageText
        }, 'output/prizes-detailed-raw.json');

        // Format as markdown
        let markdown = `# ETHOnline 2025 Prizes - Detailed Information\n\n`;
        markdown += `Scraped from: https://ethglobal.com/events/ethonline2025/prizes\n`;
        markdown += `Date: ${new Date().toISOString().split('T')[0]}\n\n`;
        markdown += `Total prizes found: ${allPrizes.length}\n\n`;
        markdown += `---\n\n`;

        if (allPrizes.length > 0) {
            allPrizes.forEach((prize) => {
                markdown += `## ${prize.details.title || prize.cardText}\n\n`;
                if (prize.details.description) {
                    markdown += `**Description:** ${prize.details.description}\n\n`;
                }
                if (prize.details.fullText && prize.details.fullText !== prize.details.description) {
                    markdown += `### Details\n\n${prize.details.fullText}\n\n`;
                }
                markdown += `---\n\n`;
            });
        } else {
            // Fallback to all page text if detailed extraction failed
            markdown += `## All Prize Information (Full Page Extract)\n\n`;
            markdown += `${pageText}\n\n`;
        }

        // Save markdown
        const docsDir = path.join(__dirname, '..', 'docs');
        await fs.mkdir(docsDir, { recursive: true });
        const markdownPath = path.join(docsDir, 'ethonline2025-prizes-detailed.md');
        await fs.writeFile(markdownPath, markdown);
        console.log(`Detailed prizes saved to: ${markdownPath}`);

        return markdownPath;

    } catch (error) {
        console.error('Scraping failed:', error);
        throw error;
    } finally {
        await scraper.close();
    }
}

if (require.main === module) {
    scrapePrizesDetailed()
        .then(filepath => console.log(`✓ Success! Detailed prizes saved to ${filepath}`))
        .catch(console.error);
}

module.exports = scrapePrizesDetailed;
