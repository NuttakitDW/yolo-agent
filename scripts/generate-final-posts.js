const fs = require('fs').promises;
const path = require('path');

// Proper Thai role translations
const roleTranslations = {
  'Developer Advocate': 'Developer Advocate',
  'Software Engineer': 'วิศวกรซอฟต์แวร์',
  'Data Scientist': 'นักวิทยาการข้อมูล',
  'ML Engineer': 'วิศวกร ML',
  'NLP Engineer': 'วิศวกร NLP',
  'Tech Lead': 'Tech Lead',
  'Director': 'ผู้อำนวยการ',
  'Consultant': 'ที่ปรึกษา',
  'Teacher': 'ครู',
  'Educator': 'นักการศึกษา',
  'Researcher': 'นักวิจัย',
  'Student': 'นักศึกษา',
  'core developer': 'นักพัฒนาหลัก',
  'Engineer': 'วิศวกร'
};

// Extract key learning point from abstract
function extractKeyLearning(abstract) {
  // Remove HTML tags
  abstract = abstract.replace(/<[^>]*>/g, '');
  
  // Look for action sentences
  const sentences = abstract.split(/[.!]/).map(s => s.trim()).filter(s => s.length > 20);
  
  // Find sentences with key learning verbs
  const learningPatterns = [
    /(?:will|you'll)\s+(?:learn|explore|discover|build|create|implement)\s+(.+)/i,
    /learn(?:ing)?\s+(?:how\s+to|about)\s+(.+)/i,
    /explore\s+(.+)/i,
    /build(?:ing)?\s+(.+)/i,
    /implement(?:ing)?\s+(.+)/i,
    /master(?:ing)?\s+(.+)/i,
    /understand(?:ing)?\s+(.+)/i
  ];
  
  for (const sentence of sentences) {
    for (const pattern of learningPatterns) {
      const match = sentence.match(pattern);
      if (match) {
        return match[1]
          .replace(/\s+with\s+.+$/, '') // Remove "with..." parts
          .replace(/\s+using\s+.+$/, '') // Remove "using..." parts
          .replace(/\s+for\s+.+$/, '') // Remove "for..." parts
          .replace(/[,;].*$/, '') // Remove trailing clauses
          .trim();
      }
    }
  }
  
  return null;
}

// Get clean speaker role
function getCleanRole(bio) {
  // Common patterns in bios
  const patterns = [
    /I\s+(?:am|work)\s+as\s+(?:a|an)?\s*([^,\.]+?)\s+at\s+([^,\.]+)/i,
    /^([^,\.]+?)\s+at\s+([^,\.]+)/,
    /is\s+(?:a|an)?\s*([^,\.]+?)\s+(?:at|with)\s+([^,\.]+)/i
  ];
  
  for (const pattern of patterns) {
    const match = bio.match(pattern);
    if (match) {
      let role = match[1].trim();
      const company = match[2].trim();
      
      // Clean up role
      role = role.replace(/^(a|an|the)\s+/i, '');
      
      // Translate common roles
      for (const [eng, thai] of Object.entries(roleTranslations)) {
        if (role.toLowerCase().includes(eng.toLowerCase())) {
          role = role.replace(new RegExp(eng, 'i'), thai);
          break;
        }
      }
      
      return { role, company };
    }
  }
  
  // Try simpler pattern
  const simpleMatch = bio.match(/(?:is|am)\s+(?:a|an)?\s*([^,\.]+)/i);
  if (simpleMatch) {
    return { role: simpleMatch[1].trim(), company: null };
  }
  
  return { role: 'Python Expert', company: null };
}

// Create value propositions
function createValueProps(abstract, title, category, isWorkshop) {
  const learning = extractKeyLearning(abstract);
  
  if (learning) {
    // Clean up the learning text
    const cleanLearning = learning
      .replace(/^(the|a|an)\s+/i, '')
      .replace(/\s+\(.+\)/, '') // Remove parentheses
      .substring(0, 80);
    
    if (isWorkshop) {
      return {
        thai: `ลงมือปฏิบัติจริงกับ ${cleanLearning}`,
        eng: `Hands-on workshop on ${cleanLearning}`
      };
    }
    
    return {
      thai: `เรียนรู้การ${cleanLearning}`,
      eng: `Learn ${cleanLearning}`
    };
  }
  
  // Extract from title
  if (title.includes('How to')) {
    const topic = title.replace(/^How to\s+/i, '').toLowerCase();
    return {
      thai: `เรียนรู้วิธี${topic}`,
      eng: `Learn how to ${topic}`
    };
  }
  
  // Category-based fallback
  const categoryDefaults = {
    'Machine Learning or AI': {
      thai: 'พัฒนาทักษะ AI และ Machine Learning',
      eng: 'Develop AI and ML skills'
    },
    'Web Development': {
      thai: 'สร้างเว็บแอปพลิเคชันสมัยใหม่',
      eng: 'Build modern web applications'
    },
    'DevOps': {
      thai: 'ปรับปรุงกระบวนการ DevOps',
      eng: 'Improve DevOps processes'
    }
  };
  
  return categoryDefaults[category] || {
    thai: 'พัฒนาทักษะ Python ขั้นสูง',
    eng: 'Advance your Python skills'
  };
}

// Category emojis
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

async function generatePost(sessionFile) {
  const filePath = path.join(__dirname, '../docs/sessions', sessionFile);
  const content = await fs.readFile(filePath, 'utf-8');
  
  // Extract information
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
  const sessionType = typeMatch ? typeMatch[1] : '30-mins talk';
  const abstract = abstractMatch ? abstractMatch[1] : '';
  const isWorkshop = sessionType.includes('workshop');
  
  // Process speakers
  const speakerDetails = [];
  speakers.forEach(speaker => {
    const bioPattern = new RegExp(`### ${speaker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\n\\n([^#]+?)(?=\\n\\n###|\\n\\n##|$)`, 's');
    const bioMatch = content.match(bioPattern);
    
    if (bioMatch) {
      const { role, company } = getCleanRole(bioMatch[1]);
      speakerDetails.push({
        name: speaker,
        role,
        company,
        shortInfo: company ? `${role} @ ${company}` : role
      });
    } else {
      speakerDetails.push({
        name: speaker,
        role: 'Python Expert',
        company: null,
        shortInfo: 'Python Expert'
      });
    }
  });
  
  // Generate components
  const emoji = categoryEmojis[category] || '🐍';
  const valueProp = createValueProps(abstract, title, category, isWorkshop);
  
  // Build speaker lines
  const speakerLineThai = speakerDetails.map(s => s.name).join(' และ ');
  const speakerInfoThai = speakerDetails[0].shortInfo;
  const speakerLineEng = speakers.join(' & ');
  
  // Level in Thai
  const levelThai = {
    'Beginner': 'ผู้เริ่มต้น',
    'Intermediate': 'ระดับกลาง',
    'Advanced': 'ระดับสูง'
  }[level] || 'ทุกระดับ';
  
  // Session type text
  const sessionText = isWorkshop ? 'Workshop 90 นาที' : 'Session 30 นาที';
  
  const post = `[English Below]
${emoji} ${isWorkshop ? 'Workshop พิเศษ!' : 'อย่าพลาด!'}
👤 ${speakerLineThai}
💼 ${speakerInfoThai}
📌 "${title}"
✨ ${valueProp.thai}
🎯 ${sessionText} | ${levelThai}
🎟️ จองบัตร: https://www.eventpop.me/e/85285/pycon-thailand-2025
.
${emoji} ${isWorkshop ? 'Special Workshop!' : 'Don\'t Miss!'}
👤 ${speakerLineEng}
💼 ${speakerDetails[0].shortInfo}
📌 "${title}"
✨ ${valueProp.eng}
🎯 ${isWorkshop ? '90-min Workshop' : '30-min Talk'} | ${level}
🎟️ Book now: https://www.eventpop.me/e/85285/pycon-thailand-2025
.
#pyconth #pyconth2025 #pythonthailand`;
  
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
console.log('🚀 Generating final speaker posts...');
generateAllPosts()
  .then(() => console.log('✨ All posts generated successfully!'))
  .catch(error => console.error('💥 Generation failed:', error));