const fs = require('fs');
const path = require('path');

// Define the sessions directory path
const sessionsDir = path.join(__dirname, '..', 'docs', 'sessions');
const outputPath = path.join(__dirname, '..', 'pycon-thailand-2025-sessions.csv');

// Function to extract session info from markdown file
function extractSessionInfo(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  let sessionInfo = {
    name: '',
    topic_name: '',
    time: '',
    photo: '' // Left blank as requested
  };
  
  // Extract topic name from the first H1 heading
  const titleMatch = content.match(/^# (.+)$/m);
  if (titleMatch) {
    sessionInfo.topic_name = titleMatch[1].trim();
  }
  
  // Extract speaker names (handle both "Speaker" and "Speakers")
  const speakerMatch = content.match(/\*\*Speakers?:\*\*\s*(.+)/);
  if (speakerMatch) {
    sessionInfo.name = speakerMatch[1].trim();
  }
  
  // Extract session type/time (handle both "Session Type" and "Type")
  let sessionTypeMatch = content.match(/\*\*Session Type:\*\* (.+)/);
  if (!sessionTypeMatch) {
    // Try alternate format
    sessionTypeMatch = content.match(/\*\*Type:\*\*\s*(.+)/);
  }
  if (sessionTypeMatch) {
    sessionInfo.time = sessionTypeMatch[1].trim();
  }
  
  return sessionInfo;
}

// Read all markdown files in the sessions directory
const sessionFiles = fs.readdirSync(sessionsDir)
  .filter(file => file.endsWith('.md') && file !== 'index.md');

// Extract information from each session file
const sessions = [];
for (const file of sessionFiles) {
  const filePath = path.join(sessionsDir, file);
  const sessionInfo = extractSessionInfo(filePath);
  sessions.push(sessionInfo);
}

// Sort sessions by speaker name
sessions.sort((a, b) => a.name.localeCompare(b.name));

// Create CSV content
let csvContent = 'name,topic_name,time,photo\n';
for (const session of sessions) {
  // Escape quotes in fields
  const name = session.name.includes(',') ? `"${session.name}"` : session.name;
  const topic = session.topic_name.includes(',') ? `"${session.topic_name}"` : session.topic_name;
  const time = session.time.includes(',') ? `"${session.time}"` : session.time;
  
  csvContent += `${name},${topic},${time},\n`;
}

// Write CSV file
fs.writeFileSync(outputPath, csvContent);

console.log(`✅ Successfully created CSV file: ${outputPath}`);
console.log(`📊 Total sessions processed: ${sessions.length}`);