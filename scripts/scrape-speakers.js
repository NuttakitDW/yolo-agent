const puppeteer = require('puppeteer');
const fs = require('fs').promises;

async function scrapePyConSpeakers() {
  const browser = await puppeteer.launch({
    headless: false, // Set to true for production
    defaultViewport: null,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  const speakers = [];
  
  try {
    // Navigate to the page
    console.log('🌐 Loading PyCon Thailand 2025 sessions page...');
    await page.goto('https://sessionize.com/view/9r42h5f5/Sessions?format=Embed_Styled_Html&isDark=False&title=PyCon+Thailand+2025', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    // Wait for iframe to load since this is an embedded view
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Check if content is in an iframe
    const frames = page.frames();
    let targetFrame = page;
    
    // Look for the sessionize iframe
    for (const frame of frames) {
      try {
        const sessionExists = await frame.$('.sz-session');
        if (sessionExists) {
          targetFrame = frame;
          console.log('📍 Found sessions in iframe');
          break;
        }
      } catch (e) {
        // Continue if frame is not accessible
      }
    }
    
    // Wait for the sessions to load
    await targetFrame.waitForSelector('.sz-session', { timeout: 10000 });
    
    // Get all speaker elements
    const speakerElements = await targetFrame.$$('.sz-session__speakers a');
    console.log(`📊 Found ${speakerElements.length} speaker links to process`);

    // Track processed speakers to avoid duplicates
    const processedSpeakers = new Set();

    // Iterate through each speaker
    for (let i = 0; i < speakerElements.length; i++) {
      try {
        // Re-query speaker elements since page might have changed
        const currentSpeakerElements = await targetFrame.$$('.sz-session__speakers a');
        
        if (i >= currentSpeakerElements.length) {
          console.log(`⚠️  Speaker element ${i} no longer exists, skipping...`);
          continue;
        }

        const speakerElement = currentSpeakerElements[i];
        
        // Get speaker name from the link text
        const speakerName = await speakerElement.evaluate(el => el.textContent.trim());
        
        // Skip if already processed
        if (processedSpeakers.has(speakerName)) {
          console.log(`⏭️  Skipping duplicate: ${speakerName}`);
          continue;
        }

        console.log(`\n👤 Processing speaker ${i + 1}/${speakerElements.length}: ${speakerName}`);
        
        // Click on the speaker to open modal
        await speakerElement.click();
        
        // Wait for modal to appear - check different possible selectors
        try {
          await targetFrame.waitForSelector('.sz-modal, .sz-speaker-modal, [data-speaker-modal], .modal', { 
            visible: true, 
            timeout: 5000 
          });
        } catch (e) {
          console.log('⚠️  Modal did not appear with expected selectors');
          // Try to extract info from the page directly
        }
        
        // Small delay to ensure modal is fully loaded
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Extract speaker information from modal
        const speakerInfo = await targetFrame.evaluate(() => {
          const modal = document.querySelector('.sz-modal, .sz-speaker-modal, [data-speaker-modal], .modal');
          if (!modal) return null;

          // Helper function to safely get text content
          const getText = (selector) => {
            const element = modal.querySelector(selector);
            return element ? element.textContent.trim() : '';
          };

          // Extract basic info - try multiple possible selectors
          const name = getText('.sz-speaker__name, h2, h3, .modal-title');
          const tagline = getText('.sz-speaker__tagline, .speaker-title, .subtitle');
          const bio = getText('.sz-speaker__bio, .speaker-bio, .bio, .description');

          // Extract social links
          const linkElements = modal.querySelectorAll('.sz-speaker__social-links a, .social-links a, .links a');
          const links = Array.from(linkElements).map(link => ({
            type: link.className.split('--')[1] || link.title || 'unknown',
            url: link.href
          }));

          // Extract sessions
          const sessionElements = modal.querySelectorAll('.sz-speaker__sessions li a, .sessions a, .talks a');
          const sessions = Array.from(sessionElements).map(session => session.textContent.trim());

          return {
            name,
            tagline,
            bio,
            links,
            sessions
          };
        });

        if (speakerInfo) {
          // Parse tagline to extract title and company
          const taglineParts = speakerInfo.tagline.split(' at ');
          speakerInfo.title = taglineParts[0] || '';
          speakerInfo.company = taglineParts[1] || '';
          
          speakers.push(speakerInfo);
          processedSpeakers.add(speakerName);
          console.log(`✅ Successfully extracted info for ${speakerName}`);
        }

        // Close the modal
        const closeButton = await targetFrame.$('.sz-modal__close, .sz-speaker-modal__close, .modal-close, .close, [data-dismiss="modal"]');
        if (closeButton) {
          await closeButton.click();
          // Wait for modal to disappear
          await targetFrame.waitForSelector('.sz-modal, .sz-speaker-modal, [data-speaker-modal], .modal', { 
            hidden: true, 
            timeout: 5000 
          });
        } else {
          // Fallback: click outside the modal or press Escape
          await targetFrame.click('body', { x: 10, y: 10 });
          await targetFrame.keyboard.press('Escape');
        }

        // Small delay between speakers to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (error) {
        console.error(`❌ Error processing speaker ${i + 1}:`, error.message);
        
        // Try to close any open modal before continuing
        try {
          const closeButton = await targetFrame.$('.sz-modal__close, .sz-speaker-modal__close, .modal-close, .close');
          if (closeButton) {
            await closeButton.click();
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        } catch (closeError) {
          // Ignore close errors
        }
      }
    }

    // Save the data to JSON file
    const outputPath = './pycon-thailand-2025-speakers.json';
    await fs.writeFile(outputPath, JSON.stringify(speakers, null, 2));
    console.log(`\n💾 Saved ${speakers.length} speaker profiles to ${outputPath}`);

    // Also save a markdown summary
    const markdownContent = generateMarkdownSummary(speakers);
    await fs.writeFile('./pycon-thailand-2025-speakers.md', markdownContent);
    console.log(`📝 Saved markdown summary to pycon-thailand-2025-speakers.md`);

  } catch (error) {
    console.error('❌ Fatal error:', error);
  } finally {
    await browser.close();
  }
}

function generateMarkdownSummary(speakers) {
  let markdown = '# PyCon Thailand 2025 Speakers\n\n';
  markdown += `Total speakers: ${speakers.length}\n\n`;

  speakers.forEach((speaker, index) => {
    markdown += `## ${index + 1}. ${speaker.name}\n`;
    if (speaker.title || speaker.company) {
      markdown += `**${speaker.title}**${speaker.company ? ` at ${speaker.company}` : ''}\n\n`;
    }
    if (speaker.bio) {
      markdown += `${speaker.bio}\n\n`;
    }
    if (speaker.sessions && speaker.sessions.length > 0) {
      markdown += '### Sessions:\n';
      speaker.sessions.forEach(session => {
        markdown += `- ${session}\n`;
      });
      markdown += '\n';
    }
    if (speaker.links && speaker.links.length > 0) {
      markdown += '### Links:\n';
      speaker.links.forEach(link => {
        markdown += `- [${link.type}](${link.url})\n`;
      });
      markdown += '\n';
    }
    markdown += '---\n\n';
  });

  return markdown;
}

// Run the scraper
console.log('🚀 Starting PyCon Thailand 2025 speaker scraper...');
scrapePyConSpeakers()
  .then(() => console.log('✨ Scraping completed!'))
  .catch(error => console.error('💥 Scraping failed:', error));