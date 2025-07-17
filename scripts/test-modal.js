const puppeteer = require('puppeteer');

async function analyzeModalStructure() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  
  await page.goto('https://sessionize.com/view/9r42h5f5/Sessions?format=Embed_Styled_Html&isDark=False&title=PyCon+Thailand+2025', {
    waitUntil: 'networkidle2'
  });
  
  // Wait for sessions to load
  await page.waitForSelector('.sz-session__speakers a');
  
  // Click first speaker link
  const firstSpeaker = await page.$('.sz-session__speakers a');
  const speakerName = await firstSpeaker.evaluate(el => el.textContent);
  console.log('Clicking on speaker:', speakerName);
  
  await firstSpeaker.click();
  
  // Wait for modal
  await page.waitForSelector('.sz-modal-container:not(.is-hidden)', { timeout: 5000 });
  await page.waitForTimeout(1000);
  
  // Analyze modal structure
  const modalStructure = await page.evaluate(() => {
    const modal = document.querySelector('.sz-modal-container');
    if (!modal) return null;
    
    // Get all class names in the modal
    const classes = new Set();
    modal.querySelectorAll('*').forEach(el => {
      el.classList.forEach(cls => classes.add(cls));
    });
    
    // Check specific elements
    const findSelector = (patterns) => {
      for (const pattern of patterns) {
        const el = modal.querySelector(pattern);
        if (el) return { found: true, selector: pattern, text: el.textContent?.trim().substring(0, 50) };
      }
      return { found: false };
    };
    
    return {
      modalClasses: Array.from(classes).filter(c => c.includes('speaker') || c.includes('modal')),
      nameSelector: findSelector(['.sz-speaker__name', '.sz-modal__name', '[class*="name"]']),
      bioSelector: findSelector(['.sz-speaker__bio', '.sz-modal__bio', '[class*="bio"]']),
      taglineSelector: findSelector(['.sz-speaker__tagline', '.sz-modal__tagline', '[class*="tagline"]']),
      closeSelector: findSelector(['.sz-modal__close', '.sz-modal-container__close', '[class*="close"]']),
      allClasses: Array.from(classes).sort()
    };
  });
  
  console.log(JSON.stringify(modalStructure, null, 2));
  
  setTimeout(() => browser.close(), 5000);
}

analyzeModalStructure().catch(console.error);