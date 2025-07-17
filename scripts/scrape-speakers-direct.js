const puppeteer = require('puppeteer');
const fs = require('fs').promises;

async function scrapePyConSpeakersDirect() {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  const speakers = {};
  
  try {
    // First, let's try the direct Sessionize API approach
    console.log('🌐 Attempting to fetch speaker data from Sessionize API...');
    
    // Navigate to the speakers view URL directly
    const speakersUrl = 'https://sessionize.com/api/v2/9r42h5f5/view/Speakers';
    
    await page.goto(speakersUrl, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    // Get the page content
    const content = await page.content();
    
    // Check if it's JSON data
    try {
      const bodyText = await page.evaluate(() => document.body.innerText);
      const speakerData = JSON.parse(bodyText);
      
      if (Array.isArray(speakerData)) {
        console.log(`✅ Found ${speakerData.length} speakers in API response`);
        
        // Process each speaker
        speakerData.forEach(speaker => {
          speakers[speaker.fullName] = {
            name: speaker.fullName,
            title: speaker.tagLine?.split(' at ')[0] || '',
            company: speaker.tagLine?.split(' at ')[1] || '',
            tagline: speaker.tagLine,
            bio: speaker.bio,
            profilePicture: speaker.profilePicture,
            sessions: speaker.sessions?.map(s => s.name) || [],
            links: speaker.links?.map(link => ({
              type: link.linkType,
              url: link.url,
              title: link.title
            })) || []
          };
        });
      }
    } catch (e) {
      console.log('❌ Not JSON data, trying alternative approach...');
      
      // Alternative: Try the GridSmart view
      await page.goto('https://sessionize.com/api/v2/9r42h5f5/view/GridSmart', {
        waitUntil: 'networkidle2',
        timeout: 30000
      });
      
      const gridContent = await page.evaluate(() => document.body.innerText);
      try {
        const gridData = JSON.parse(gridContent);
        
        // Extract speakers from grid data
        if (gridData && Array.isArray(gridData)) {
          gridData.forEach(item => {
            if (item.speakers) {
              item.speakers.forEach(speaker => {
                if (!speakers[speaker.name]) {
                  speakers[speaker.name] = {
                    name: speaker.name,
                    id: speaker.id
                  };
                }
                // Add session to speaker
                if (!speakers[speaker.name].sessions) {
                  speakers[speaker.name].sessions = [];
                }
                speakers[speaker.name].sessions.push(item.title);
              });
            }
          });
        }
      } catch (gridError) {
        console.log('❌ Could not parse GridSmart data');
      }
    }
    
    // Convert speakers object to array
    const speakersArray = Object.values(speakers);
    
    if (speakersArray.length === 0) {
      console.log('⚠️ No speakers found via API, checking if data exists on page...');
      
      // Final attempt: Check the sessions page for speaker info
      await page.goto('https://sessionize.com/view/9r42h5f5/Sessions?format=Embed_Styled_Html&isDark=False&title=PyCon+Thailand+2025', {
        waitUntil: 'networkidle2',
        timeout: 30000
      });
      
      // Wait a bit for dynamic content
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Check all frames
      const frames = page.frames();
      for (const frame of frames) {
        try {
          const speakerLinks = await frame.$$eval('.sz-session__speakers a', links => 
            links.map(link => link.textContent.trim())
          );
          
          if (speakerLinks.length > 0) {
            console.log(`📍 Found ${speakerLinks.length} speaker names in embedded view`);
            speakerLinks.forEach(name => {
              if (!speakers[name]) {
                speakers[name] = { name, sessions: [] };
              }
            });
          }
        } catch (e) {
          // Frame not accessible
        }
      }
    }
    
    // Save the data
    const outputPath = './pycon-thailand-2025-speakers.json';
    await fs.writeFile(outputPath, JSON.stringify(speakersArray, null, 2));
    console.log(`\n💾 Saved ${speakersArray.length} speaker profiles to ${outputPath}`);
    
    // Save markdown summary
    const markdownContent = generateMarkdownSummary(speakersArray);
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
        markdown += `- [${link.type || link.title}](${link.url})\n`;
      });
      markdown += '\n';
    }
    markdown += '---\n\n';
  });

  return markdown;
}

// Run the scraper
console.log('🚀 Starting PyCon Thailand 2025 speaker scraper (Direct API approach)...');
scrapePyConSpeakersDirect()
  .then(() => console.log('✨ Scraping completed!'))
  .catch(error => console.error('💥 Scraping failed:', error));