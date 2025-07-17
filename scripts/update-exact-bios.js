const fs = require('fs').promises;
const path = require('path');

// Load the extracted speaker bios
const speakerBios = require('../speaker-bios-extracted.json');

async function updateSessionFiles() {
  const sessionsDir = path.join(__dirname, '../docs/sessions');
  const files = await fs.readdir(sessionsDir);
  const mdFiles = files.filter(f => f.endsWith('.md') && f !== 'index.md');
  
  let updatedCount = 0;
  
  for (const file of mdFiles) {
    const filePath = path.join(sessionsDir, file);
    let content = await fs.readFile(filePath, 'utf-8');
    let updated = false;
    
    // Check which speakers are in this file
    const speakerMatch = content.match(/\*\*Speakers:\*\* (.+)/);
    if (speakerMatch) {
      const speakers = speakerMatch[1].split(', ').map(s => s.trim());
      
      // Update each speaker's bio
      for (const speakerName of speakers) {
        if (speakerBios[speakerName]) {
          // Create regex pattern to find the speaker bio section
          const escapedName = speakerName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const bioPattern = new RegExp(
            `### ${escapedName}\\n\\n[^#]+?(?=\\n\\n###|\\n\\n##|$)`,
            'gs'
          );
          
          // Replace with exact bio
          const newBio = `### ${speakerName}\n\n${speakerBios[speakerName]}`;
          
          if (content.match(bioPattern)) {
            content = content.replace(bioPattern, newBio);
            updated = true;
          }
        }
      }
    }
    
    if (updated) {
      await fs.writeFile(filePath, content);
      console.log(`✅ Updated: ${file}`);
      updatedCount++;
    }
  }
  
  console.log(`\n📊 Updated ${updatedCount} files with exact speaker bios`);
}

// Run the update
console.log('🚀 Starting to update session files with exact speaker bios...');
updateSessionFiles()
  .then(() => console.log('✨ Update completed!'))
  .catch(error => console.error('❌ Update failed:', error));