const puppeteer = require('puppeteer');
const fs = require('fs').promises;

async function scrapeExactSpeakerBios() {
  const browser = await puppeteer.launch({
    headless: false, // Set to true for production
    defaultViewport: null,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  const speakers = {};
  
  try {
    // Navigate to the page
    console.log('🌐 Loading PyCon Thailand 2025 sessions page...');
    await page.goto('https://sessionize.com/view/9r42h5f5/Sessions?format=Embed_Styled_Html&isDark=False&title=PyCon+Thailand+2025', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    // Wait for content to load
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Since this is an embedded view, we need to check if content is in an iframe
    const frames = page.frames();
    let targetFrame = page;
    
    // Try to find the frame with session content
    for (const frame of frames) {
      try {
        const hasContent = await frame.$('.sz-session__speakers');
        if (hasContent) {
          targetFrame = frame;
          console.log('📍 Found content in iframe');
          break;
        }
      } catch (e) {
        // Frame not accessible
      }
    }
    
    // Wait for sessions to load
    try {
      await targetFrame.waitForSelector('.sz-session__speakers a', { timeout: 10000 });
    } catch (e) {
      console.log('⚠️  Could not find speaker links in embedded view');
      // Try direct frame access
      await page.goto('https://sessionize.com/w/9r42h5f5', {
        waitUntil: 'networkidle2',
        timeout: 30000
      });
      await page.waitForSelector('.sz-session__speakers a', { timeout: 10000 });
      targetFrame = page;
    }
    
    // Get all unique speaker links
    const speakerLinks = await targetFrame.$$eval('.sz-session__speakers a', links => 
      [...new Set(links.map(link => ({
        name: link.textContent.trim(),
        href: link.href
      })))]
    );
    
    console.log(`📊 Found ${speakerLinks.length} unique speakers`);
    
    // Process each speaker
    for (let i = 0; i < speakerLinks.length; i++) {
      const speakerData = speakerLinks[i];
      console.log(`\n👤 Processing speaker ${i + 1}/${speakerLinks.length}: ${speakerData.name}`);
      
      try {
        // Find and click the speaker link
        const speakerElement = await targetFrame.$x(`//a[contains(text(), "${speakerData.name}")]`);
        if (speakerElement.length > 0) {
          await speakerElement[0].click();
          
          // Wait for modal/popup to appear
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          // Try different possible selectors for the speaker modal
          const speakerInfo = await targetFrame.evaluate(() => {
            // Look for modal elements
            const modalSelectors = [
              '.sz-speaker',
              '.modal-content',
              '[role="dialog"]',
              '.speaker-modal',
              '.sz-lightbox'
            ];
            
            let modal = null;
            for (const selector of modalSelectors) {
              modal = document.querySelector(selector);
              if (modal) break;
            }
            
            if (!modal) {
              // If no modal, check if speaker info is in the page
              const allElements = document.querySelectorAll('*');
              for (const el of allElements) {
                if (el.style.display === 'block' && el.style.position === 'fixed') {
                  modal = el;
                  break;
                }
              }
            }
            
            if (!modal) return null;
            
            // Extract speaker information
            const getText = (selectors) => {
              for (const selector of selectors) {
                const el = modal.querySelector(selector);
                if (el) return el.textContent.trim();
              }
              return '';
            };
            
            // Get bio - try multiple possible selectors
            const bioSelectors = [
              '.sz-speaker__bio',
              '.speaker-bio',
              '.bio',
              'p:not(.sz-speaker__tagline)',
              '.description'
            ];
            
            let bio = '';
            for (const selector of bioSelectors) {
              const bioEl = modal.querySelector(selector);
              if (bioEl && bioEl.textContent.length > 50) {
                bio = bioEl.textContent.trim();
                break;
              }
            }
            
            // If no bio found with selectors, try to find it by content
            if (!bio) {
              const paragraphs = modal.querySelectorAll('p');
              for (const p of paragraphs) {
                const text = p.textContent.trim();
                if (text.length > 100 && !text.includes('Speaker at')) {
                  bio = text;
                  break;
                }
              }
            }
            
            return {
              name: getText(['.sz-speaker__name', 'h2', 'h3', '.speaker-name']),
              tagline: getText(['.sz-speaker__tagline', '.tagline', '.title']),
              bio: bio,
              company: getText(['.company', '.organization'])
            };
          });
          
          if (speakerInfo && speakerInfo.bio) {
            speakers[speakerData.name] = speakerInfo;
            console.log(`✅ Successfully extracted bio for ${speakerData.name}`);
            console.log(`   Bio preview: ${speakerInfo.bio.substring(0, 100)}...`);
          } else {
            console.log(`⚠️  Could not extract bio for ${speakerData.name}`);
          }
          
          // Close the modal
          await targetFrame.keyboard.press('Escape');
          await targetFrame.click('body', { x: 10, y: 10 });
          await new Promise(resolve => setTimeout(resolve, 500));
          
        }
      } catch (error) {
        console.error(`❌ Error processing ${speakerData.name}:`, error.message);
      }
    }
    
    // Save the extracted bios
    const outputPath = './speaker-bios-exact.json';
    await fs.writeFile(outputPath, JSON.stringify(speakers, null, 2));
    console.log(`\n💾 Saved ${Object.keys(speakers).length} speaker bios to ${outputPath}`);
    
    // Generate update script
    await generateUpdateScript(speakers);
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
  } finally {
    await browser.close();
  }
}

async function generateUpdateScript(speakers) {
  // Create a script to update the session files with exact bios
  const updateScript = `const fs = require('fs').promises;
const path = require('path');

const speakerBios = ${JSON.stringify(speakers, null, 2)};

async function updateSessionFiles() {
  const sessionsDir = path.join(__dirname, '../docs/sessions');
  const files = await fs.readdir(sessionsDir);
  const mdFiles = files.filter(f => f.endsWith('.md') && f !== 'index.md');
  
  let updatedCount = 0;
  
  for (const file of mdFiles) {
    const filePath = path.join(sessionsDir, file);
    let content = await fs.readFile(filePath, 'utf-8');
    let updated = false;
    
    // Update each speaker bio
    for (const [speakerName, speakerInfo] of Object.entries(speakerBios)) {
      if (content.includes(speakerName)) {
        const bioPattern = new RegExp(
          '### ' + speakerName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\\\n\\\\n[^#]*(?=\\\\n\\\\n|\\\\n###|$)',
          'g'
        );
        
        if (speakerInfo.bio) {
          const newBio = '### ' + speakerName + '\\\\n\\\\n' + speakerInfo.bio;
          content = content.replace(bioPattern, newBio);
          updated = true;
        }
      }
    }
    
    if (updated) {
      await fs.writeFile(filePath, content);
      console.log('✅ Updated: ' + file);
      updatedCount++;
    }
  }
  
  console.log('\\\\n📊 Updated ' + updatedCount + ' files with exact speaker bios');
}

updateSessionFiles().catch(console.error);
`;
  
  await fs.writeFile('./update-with-exact-bios.js', updateScript);
  console.log('📝 Generated update script: update-with-exact-bios.js');
}

// Run the scraper
console.log('🚀 Starting exact speaker bio scraper...');
scrapeExactSpeakerBios()
  .then(() => console.log('✨ Scraping completed!'))
  .catch(error => console.error('💥 Scraping failed:', error));