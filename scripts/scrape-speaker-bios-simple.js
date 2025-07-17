const puppeteer = require('puppeteer');
const fs = require('fs').promises;

async function scrapeSpeakerBios() {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  const speakers = {};
  
  try {
    console.log('🌐 Loading PyCon Thailand 2025 sessions page...');
    await page.goto('https://sessionize.com/view/9r42h5f5/Sessions?format=Embed_Styled_Html&isDark=False&title=PyCon+Thailand+2025', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    // Wait for page to fully load
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Try to access the embedded content directly
    console.log('🔍 Looking for speaker links...');
    
    // Get all unique speaker names first
    const speakerNames = await page.evaluate(() => {
      const names = new Set();
      const links = document.querySelectorAll('a');
      links.forEach(link => {
        // Check if this looks like a speaker link
        if (link.textContent && link.textContent.length > 2 && link.textContent.length < 50) {
          const text = link.textContent.trim();
          // Filter out non-speaker links
          if (!text.includes('http') && !text.includes('Session') && !text.includes('PyCon')) {
            names.add(text);
          }
        }
      });
      return Array.from(names);
    });
    
    console.log(`📊 Found ${speakerNames.length} potential speakers`);
    
    // For each speaker, try to click and get bio
    for (const name of speakerNames) {
      console.log(`\n👤 Trying to get bio for: ${name}`);
      
      try {
        // Find and click the speaker link
        const clicked = await page.evaluate((speakerName) => {
          const links = document.querySelectorAll('a');
          for (const link of links) {
            if (link.textContent && link.textContent.trim() === speakerName) {
              link.click();
              return true;
            }
          }
          return false;
        }, name);
        
        if (clicked) {
          // Wait for modal/content to load
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Extract speaker info from the page
          const speakerInfo = await page.evaluate(() => {
            // Look for bio in various possible locations
            let bio = '';
            
            // Try common bio selectors
            const bioSelectors = [
              '.sz-speaker__bio',
              '.speaker-bio',
              '.bio',
              '[class*="bio"]',
              'div[style*="display: block"] p'
            ];
            
            for (const selector of bioSelectors) {
              const elements = document.querySelectorAll(selector);
              for (const el of elements) {
                const text = el.textContent.trim();
                if (text.length > 50 && !text.includes('Loading') && !text.includes('Error')) {
                  bio = text;
                  break;
                }
              }
              if (bio) break;
            }
            
            // If no bio found, look for any visible text that might be a bio
            if (!bio) {
              const allDivs = document.querySelectorAll('div');
              for (const div of allDivs) {
                const style = window.getComputedStyle(div);
                if (style.display !== 'none' && style.visibility !== 'hidden') {
                  const text = div.textContent.trim();
                  // Check if this looks like a bio (long text, not a title)
                  if (text.length > 100 && text.length < 2000 && 
                      !text.includes('Session') && !text.includes('Workshop') &&
                      !text.includes('<') && !text.includes('>')) {
                    bio = text;
                    break;
                  }
                }
              }
            }
            
            return bio;
          });
          
          if (speakerInfo && speakerInfo.length > 50) {
            speakers[name] = speakerInfo;
            console.log(`✅ Got bio: ${speakerInfo.substring(0, 80)}...`);
          } else {
            console.log(`⚠️  No bio found`);
          }
          
          // Try to close modal
          await page.keyboard.press('Escape');
          await page.mouse.click(10, 10);
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        
      } catch (error) {
        console.error(`❌ Error for ${name}:`, error.message);
      }
    }
    
    // Save results
    const outputPath = './speaker-bios-extracted.json';
    await fs.writeFile(outputPath, JSON.stringify(speakers, null, 2));
    console.log(`\n💾 Saved ${Object.keys(speakers).length} speaker bios to ${outputPath}`);
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
  } finally {
    await browser.close();
  }
}

// Run the scraper
console.log('🚀 Starting speaker bio scraper...');
scrapeSpeakerBios()
  .then(() => console.log('✨ Scraping completed!'))
  .catch(error => console.error('💥 Scraping failed:', error));