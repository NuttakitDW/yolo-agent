const fs = require('fs').promises;
const path = require('path');

// Thai translations for common terms
const categoryTranslations = {
  'Machine Learning or AI': 'AI และ Machine Learning',
  'System Administration or DevOps': 'DevOps และการจัดการระบบ',
  'Libraries and Extensions': 'Libraries และส่วนขยาย',
  'App Development or Developer Productivity': 'พัฒนาแอปและเพิ่มประสิทธิภาพ',
  'Web Development': 'พัฒนาเว็บ',
  'Testing and Development Tool Chains': 'Testing และเครื่องมือพัฒนา',
  'Social Impact': 'ผลกระทบทางสังคม',
  'Serverless': 'Serverless',
  'Python in Education, Science, and Maths': 'Python ในการศึกษาและวิทยาศาสตร์',
  'Project Best Practices': 'Best Practices',
  'IoT': 'IoT',
  'Embedding and Extending Python': 'Embedding Python',
  'Community': 'ชุมชน',
  'Business and Scientific Applications': 'แอปพลิเคชันธุรกิจและวิทยาศาสตร์'
};

// Emoji mapping for categories
const categoryEmojis = {
  'Machine Learning or AI': '🤖',
  'System Administration or DevOps': '⚙️',
  'Libraries and Extensions': '📚',
  'App Development or Developer Productivity': '💻',
  'Web Development': '🌐',
  'Testing and Development Tool Chains': '🧪',
  'Social Impact': '🗺️',
  'Serverless': '☁️',
  'Python in Education, Science, and Maths': '🎓',
  'Project Best Practices': '✨',
  'IoT': '📡',
  'Embedding and Extending Python': '🔧',
  'Community': '🤝',
  'Business and Scientific Applications': '📊'
};

// Extract key value proposition from abstract
function extractKeyValue(abstract, title) {
  // Look for key phrases that indicate value
  const sentences = abstract.split('. ');
  
  // Find sentences with action words
  const valuePhrases = sentences.find(s => 
    s.includes('learn') || s.includes('build') || s.includes('create') || 
    s.includes('explore') || s.includes('discover') || s.includes('transform') ||
    s.includes('implement') || s.includes('develop') || s.includes('analyze')
  );
  
  if (valuePhrases) {
    return valuePhrases.replace(/^.*?(learn|build|create|explore|discover|transform|implement|develop|analyze)/i, '$1')
      .split(',')[0]
      .trim();
  }
  
  // Fallback to title-based value
  return `Discover insights about ${title.toLowerCase()}`;
}

// Shorten speaker credentials
function getShortCredential(bio, name) {
  // Extract company/role from bio
  const patterns = [
    /work(?:s|ing)? (?:as|at) (.+?)[,\.]/i,
    /is a (.+?) at (.+?)[,\.]/i,
    /(.+?) at (.+?)[,\.]/i,
    /is an? (.+?)[,\.]/i
  ];
  
  for (const pattern of patterns) {
    const match = bio.match(pattern);
    if (match) {
      return match[1].trim().replace(/^(a|an|the)\s+/i, '');
    }
  }
  
  return 'Python Expert';
}

// Generate Thai title (simplified translation)
function generateThaiTitle(title) {
  // Common word translations
  const translations = {
    'Building': 'สร้าง',
    'Introduction': 'รู้จักกับ',
    'Python': 'Python',
    'AI': 'AI',
    'Machine Learning': 'Machine Learning',
    'Web': 'เว็บ',
    'Data': 'ข้อมูล',
    'Analysis': 'วิเคราะห์',
    'Development': 'พัฒนา',
    'Testing': 'ทดสอบ',
    'Best Practices': 'แนวทางที่ดี',
    'Open Source': 'Open Source',
    'Security': 'ความปลอดภัย',
    'Cloud': 'คลาวด์',
    'Database': 'ฐานข้อมูล'
  };
  
  // For simplicity, return the English title for technical talks
  // In production, you'd want proper translation
  return title;
}

async function generatePost(sessionFile) {
  const filePath = path.join(__dirname, '../docs/sessions', sessionFile);
  const content = await fs.readFile(filePath, 'utf-8');
  
  // Extract session information
  const speakerMatch = content.match(/\*\*Speakers:\*\* (.+)/);
  const titleMatch = content.match(/# (.+)/);
  const categoryMatch = content.match(/\*\*Category:\*\* (.+)/);
  const typeMatch = content.match(/\*\*Session Type:\*\* (.+)/);
  const abstractMatch = content.match(/## Abstract\n\n(.+?)(?=\n\n)/s);
  
  if (!speakerMatch || !titleMatch) return null;
  
  const speakers = speakerMatch[1].split(', ');
  const title = titleMatch[1];
  const category = categoryMatch ? categoryMatch[1] : 'Python';
  const sessionType = typeMatch ? typeMatch[1] : '30-mins talk session';
  const abstract = abstractMatch ? abstractMatch[1] : '';
  const isWorkshop = sessionType.includes('workshop');
  
  // Extract speaker bios
  const speakerBios = {};
  speakers.forEach(speaker => {
    const bioPattern = new RegExp(`### ${speaker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\n\\n([^#]+?)(?=\\n\\n###|\\n\\n##|$)`, 's');
    const bioMatch = content.match(bioPattern);
    if (bioMatch) {
      speakerBios[speaker] = bioMatch[1];
    }
  });
  
  // Get emoji for category
  const emoji = categoryEmojis[category] || '🐍';
  
  // Generate value proposition
  const keyValue = extractKeyValue(abstract, title);
  
  // Create speaker credentials line
  const speakerInfo = speakers.map(speaker => {
    const bio = speakerBios[speaker] || '';
    const credential = getShortCredential(bio, speaker);
    return `${speaker}${credential !== 'Python Expert' ? ` (${credential})` : ''}`;
  }).join(' และ ');
  
  // Generate the post
  const thaiTitle = generateThaiTitle(title);
  const sessionTypeText = isWorkshop ? 'Workshop พิเศษ' : 'หัวข้อ';
  
  const post = `[English Below]
${emoji} ${isWorkshop ? 'Workshop พิเศษ! ' : ''}${keyValue.length < 50 ? `เรียนรู้${keyValue}` : 'พบกับผู้เชี่ยวชาญด้าน ' + (categoryTranslations[category] || category)}
พบกับ ${speakerInfo}
${sessionTypeText}: "${thaiTitle}"
✨ ${keyValue.substring(0, 80)}${keyValue.length > 80 ? '...' : ''}
🎟️ จองบัตร: https://www.eventpop.me/e/85285/pycon-thailand-2025
.
${emoji} ${isWorkshop ? 'Special Workshop! ' : ''}${keyValue.length < 50 ? `Learn to ${keyValue}` : 'Meet the expert in ' + category}
Meet ${speakers.join(' & ')}
Topic: "${title}"
✨ ${keyValue.substring(0, 80)}${keyValue.length > 80 ? '...' : ''}
🎟️ Get tickets: https://www.eventpop.me/e/85285/pycon-thailand-2025
.
#pyconth #pyconth2025 #pythonthailand${isWorkshop ? ' #workshop' : ''}`;
  
  return {
    filename: sessionFile.replace('.md', '-post.md'),
    content: post
  };
}

async function generateAllPosts() {
  const sessionsDir = path.join(__dirname, '../docs/sessions');
  const postsDir = path.join(__dirname, '../posts');
  
  const files = await fs.readdir(sessionsDir);
  const sessionFiles = files.filter(f => f.endsWith('.md') && f !== 'index.md');
  
  let generatedCount = 0;
  
  for (const file of sessionFiles) {
    try {
      const post = await generatePost(file);
      if (post) {
        const postPath = path.join(postsDir, post.filename);
        await fs.writeFile(postPath, post.content);
        console.log(`✅ Generated: ${post.filename}`);
        generatedCount++;
      }
    } catch (error) {
      console.error(`❌ Error generating post for ${file}:`, error.message);
    }
  }
  
  console.log(`\n📊 Generated ${generatedCount} posts`);
}

// Run the generator
console.log('🚀 Generating speaker announcement posts...');
generateAllPosts()
  .then(() => console.log('✨ All posts generated!'))
  .catch(error => console.error('💥 Generation failed:', error));