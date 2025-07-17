const fs = require('fs').promises;
const path = require('path');

// Better Thai translations and descriptions
const thaiDescriptions = {
  'AI': 'ปัญญาประดิษฐ์',
  'Machine Learning': 'การเรียนรู้ของเครื่อง',
  'WebAssembly': 'เทคโนโลยี WebAssembly',
  'Database': 'ฐานข้อมูล',
  'Testing': 'การทดสอบ',
  'DevOps': 'DevOps',
  'Cloud': 'คลาวด์',
  'Open Source': 'โอเพนซอร์ส',
  'API': 'API',
  'Workshop': 'เวิร์คช็อป',
  'Serverless': 'Serverless',
  'IoT': 'IoT',
  'Data Science': 'วิทยาการข้อมูล'
};

// Category-specific value props in Thai
const categoryValueProps = {
  'Machine Learning or AI': 'สร้างระบบ AI ที่ทรงพลัง',
  'System Administration or DevOps': 'จัดการระบบอย่างมืออาชีพ',
  'Libraries and Extensions': 'ใช้งาน Python libraries อย่างเต็มประสิทธิภาพ',
  'App Development or Developer Productivity': 'พัฒนาแอปพลิเคชันได้รวดเร็วขึ้น',
  'Web Development': 'สร้างเว็บแอปพลิเคชันที่ทันสมัย',
  'Testing and Development Tool Chains': 'ทดสอบโค้ดอย่างมีประสิทธิภาพ',
  'Social Impact': 'ใช้ Python เพื่อสร้างผลกระทบเชิงบวกต่อสังคม',
  'Serverless': 'พัฒนาระบบ Serverless ที่ปรับขนาดได้',
  'Python in Education, Science, and Maths': 'ประยุกต์ใช้ Python ในงานวิชาการ',
  'Project Best Practices': 'พัฒนาโปรเจกต์อย่างมีมาตรฐาน',
  'IoT': 'เชื่อมต่ออุปกรณ์ IoT ด้วย Python',
  'Embedding and Extending Python': 'ขยายความสามารถของ Python',
  'Community': 'สร้างและพัฒนาชุมชน Python',
  'Business and Scientific Applications': 'ใช้ Python ในงานธุรกิจและวิทยาศาสตร์'
};

// Emoji mapping
const categoryEmojis = {
  'Machine Learning or AI': '🤖',
  'System Administration or DevOps': '⚙️',
  'Libraries and Extensions': '📚',
  'App Development or Developer Productivity': '💻',
  'Web Development': '🌐',
  'Testing and Development Tool Chains': '🧪',
  'Social Impact': '🌍',
  'Serverless': '☁️',
  'Python in Education, Science, and Maths': '🎓',
  'Project Best Practices': '✨',
  'IoT': '📡',
  'Embedding and Extending Python': '🔧',
  'Community': '🤝',
  'Business and Scientific Applications': '📊'
};

// Extract concrete learning points from abstract
function extractLearningPoints(abstract, title) {
  const sentences = abstract.split('. ');
  
  // Look for specific learning outcomes
  const learningIndicators = [
    /will (learn|explore|discover|understand|build|create|implement)/i,
    /learn (how to|about)/i,
    /explore (how|the)/i,
    /hands-on/i,
    /practical/i,
    /real-world/i,
    /techniques/i,
    /strategies/i
  ];
  
  for (const sentence of sentences) {
    for (const indicator of learningIndicators) {
      if (indicator.test(sentence)) {
        // Clean up the sentence
        return sentence
          .replace(/^.*?(learn|explore|discover|will|we'll|you'll)/i, '')
          .replace(/^\s*(how\s+to|about)\s*/i, '')
          .trim();
      }
    }
  }
  
  // Extract from title if no clear learning in abstract
  if (title.includes('How to')) {
    return title.replace(/^How to\s+/i, '').toLowerCase();
  }
  
  return null;
}

// Get speaker's main credential (short)
function getSpeakerCredential(bio) {
  // Look for current role
  const rolePatterns = [
    /(?:work(?:s|ing)?|is|am)\s+(?:as\s+)?(?:a|an)?\s*([^,\.]+?)\s+at\s+([^,\.]+)/i,
    /^([^,\.]+?)\s+at\s+([^,\.]+)/i,
    /(?:is|am)\s+(?:a|an)?\s*([^,\.]+?)(?:\.|,|$)/i
  ];
  
  for (const pattern of rolePatterns) {
    const match = bio.match(pattern);
    if (match) {
      const role = match[1].trim();
      const company = match[2] ? match[2].trim() : '';
      
      // Shorten long roles
      const shortRole = role
        .replace(/with.*$/i, '')
        .replace(/who.*$/i, '')
        .replace(/focusing.*$/i, '')
        .replace(/specializing.*$/i, '')
        .trim();
      
      if (company && company.length < 30) {
        return `${shortRole} ที่ ${company}`;
      }
      return shortRole;
    }
  }
  
  return 'ผู้เชี่ยวชาญ Python';
}

// Create Thai-friendly title
function createThaiTitle(title) {
  // For technical titles, keep English but add context
  const commonPatterns = {
    'Building': 'สร้าง',
    'Introduction to': 'รู้จักกับ',
    'How to': 'วิธี',
    'Best Practices': 'แนวทางปฏิบัติที่ดี',
    'Getting Started': 'เริ่มต้นกับ',
    'Understanding': 'เข้าใจ',
    'Implementing': 'พัฒนา',
    'Creating': 'สร้าง',
    'Deploying': 'ติดตั้ง',
    'Managing': 'จัดการ',
    'Optimizing': 'เพิ่มประสิทธิภาพ'
  };
  
  // Check if title has common patterns
  for (const [eng, thai] of Object.entries(commonPatterns)) {
    if (title.startsWith(eng)) {
      return title.replace(eng, thai);
    }
  }
  
  return title; // Keep original for technical terms
}

// Generate value proposition based on session type
function generateValueProp(abstract, title, category, isWorkshop) {
  const learning = extractLearningPoints(abstract, title);
  
  if (isWorkshop && learning) {
    return {
      thai: `ฝึกปฏิบัติจริงเรื่อง ${learning.substring(0, 60)}`,
      eng: `Hands-on practice with ${learning.substring(0, 60)}`
    };
  }
  
  if (learning) {
    return {
      thai: `เรียนรู้วิธี${learning.substring(0, 60)}`,
      eng: `Learn how to ${learning.substring(0, 60)}`
    };
  }
  
  // Fallback to category-based
  return {
    thai: categoryValueProps[category] || 'พัฒนาทักษะ Python ขั้นสูง',
    eng: `Master ${category.toLowerCase()} techniques`
  };
}

async function generatePost(sessionFile) {
  const filePath = path.join(__dirname, '../docs/sessions', sessionFile);
  const content = await fs.readFile(filePath, 'utf-8');
  
  // Extract all information
  const speakerMatch = content.match(/\*\*Speakers:\*\* (.+)/);
  const titleMatch = content.match(/# (.+)/);
  const categoryMatch = content.match(/\*\*Category:\*\* (.+)/);
  const typeMatch = content.match(/\*\*Session Type:\*\* (.+)/);
  const levelMatch = content.match(/\*\*Level:\*\* (.+)/);
  const abstractMatch = content.match(/## Abstract\n\n(.+?)(?=\n\n##)/s);
  
  if (!speakerMatch || !titleMatch) return null;
  
  const speakers = speakerMatch[1].split(', ');
  const title = titleMatch[1];
  const category = categoryMatch ? categoryMatch[1] : 'Python';
  const level = levelMatch ? levelMatch[1] : 'All levels';
  const sessionType = typeMatch ? typeMatch[1] : '30-mins talk session';
  const abstract = abstractMatch ? abstractMatch[1] : '';
  const isWorkshop = sessionType.includes('workshop');
  
  // Get speaker bios
  const speakerInfos = [];
  speakers.forEach(speaker => {
    const bioPattern = new RegExp(`### ${speaker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\n\\n([^#]+?)(?=\\n\\n###|\\n\\n##|$)`, 's');
    const bioMatch = content.match(bioPattern);
    if (bioMatch) {
      speakerInfos.push({
        name: speaker,
        bio: bioMatch[1],
        credential: getSpeakerCredential(bioMatch[1])
      });
    } else {
      speakerInfos.push({
        name: speaker,
        bio: '',
        credential: 'ผู้เชี่ยวชาญ Python'
      });
    }
  });
  
  // Generate components
  const emoji = categoryEmojis[category] || '🐍';
  const valueProp = generateValueProp(abstract, title, category, isWorkshop);
  const thaiTitle = createThaiTitle(title);
  
  // Build speaker line
  const speakerLineThai = speakerInfos.map(s => `${s.name} (${s.credential})`).join(' ร่วมกับ ');
  const speakerLineEng = speakers.join(' & ');
  
  // Level indicator
  const levelThai = {
    'Beginner': 'ระดับเริ่มต้น',
    'Intermediate': 'ระดับกลาง',
    'Advanced': 'ระดับสูง'
  }[level] || 'ทุกระดับ';
  
  // Create the post
  const post = `[English Below]
${emoji} ${isWorkshop ? 'เวิร์คช็อปพิเศษ 90 นาที!' : 'พบกับหัวข้อที่น่าสนใจ!'}
👤 ${speakerLineThai}
📌 "${thaiTitle}"
✨ ${valueProp.thai}
📊 เหมาะสำหรับ: ${levelThai}
🎟️ จองบัตรเลย: https://www.eventpop.me/e/85285/pycon-thailand-2025
.
${emoji} ${isWorkshop ? 'Special 90-min Workshop!' : 'Don\'t miss this talk!'}
👤 ${speakerLineEng}  
📌 "${title}"
✨ ${valueProp.eng}
📊 Level: ${level}
🎟️ Get tickets: https://www.eventpop.me/e/85285/pycon-thailand-2025
.
#pyconth #pyconth2025 #pythonthailand${isWorkshop ? ' #workshop' : ''} #${category.toLowerCase().replace(/\s+/g, '')}`;
  
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

// Run
console.log('🚀 Generating improved speaker posts...');
generateAllPosts()
  .then(() => console.log('✨ All posts generated!'))
  .catch(error => console.error('💥 Generation failed:', error));