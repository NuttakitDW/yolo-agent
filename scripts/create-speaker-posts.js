const fs = require('fs').promises;
const path = require('path');

// Manual mappings for better quality
const sessionHighlights = {
  'garcia-introduction-to-polars': {
    thai: 'เรียนรู้ Polars library ที่เร็วกว่า pandas สำหรับการวิเคราะห์ข้อมูล',
    eng: 'Learn Polars - the blazing fast alternative to pandas for data analysis'
  },
  'liashkov-spatial-data-science-for-traffic-safety-analyzing-collision-patterns-with-pysal': {
    thai: 'วิเคราะห์ข้อมูลเชิงพื้นที่เพื่อหาจุดเสี่ยงอุบัติเหตุด้วย Python',
    eng: 'Analyze spatial data to identify traffic collision hotspots with Python'
  },
  'sandford-overcoming-your-imposter-syndrome-with-github-copilot': {
    thai: 'เอาชนะ Imposter Syndrome ด้วย AI pair programming',
    eng: 'Overcome imposter syndrome using AI-powered pair programming'
  },
  'acosta-ai-driven-automation-in-open-source-metadata-platforms': {
    thai: 'สร้างระบบ AI อัตโนมัติสำหรับจัดการ metadata',
    eng: 'Build AI-driven automation for metadata management'
  },
  'anirudha-bringing-python-to-webassembly': {
    thai: 'รัน Python บน WebAssembly สำหรับ web apps สมัยใหม่',
    eng: 'Run Python in WebAssembly for modern web applications'
  },
  'benoy-how-i-ended-up-maintaining-a-python-package-with-1m-downloads': {
    thai: 'เรียนรู้การดูแล Python package ที่มีคนใช้กว่า 1 ล้านครั้ง',
    eng: 'Learn how to maintain a Python package with 1M+ downloads'
  },
  'champeethong-boosting-operational-productivity-with-python-and-textual': {
    thai: 'สร้าง Terminal UI สวยงามด้วย Python และ Textual',
    eng: 'Build beautiful Terminal UIs with Python and Textual'
  },
  'chaowvasin-making-rag-application-with-evaluation-using-ollama': {
    thai: 'สร้าง RAG chatbot พร้อมระบบประเมินด้วย Ollama',
    eng: 'Build RAG chatbot with evaluation system using Ollama'
  },
  'chiu-how-we-built-an-entire-bank-from-scratch-with-python': {
    thai: 'เบื้องหลังการสร้างธนาคารดิจิทัลทั้งระบบด้วย Python',
    eng: 'Behind the scenes: Building an entire digital bank with Python'
  },
  'chotepanit-create-agentic-financial-solution-using-mcp-and-a2a': {
    thai: 'พัฒนา AI Agent สำหรับการเทรดหุ้นด้วย MCP',
    eng: 'Create AI agents for stock trading using MCP'
  },
  'coghlan-do-you-want-to-get-more-involved-in-open-source': {
    thai: 'เริ่มต้นมีส่วนร่วมกับ Open Source อย่างมีความหมาย',
    eng: 'Start contributing meaningfully to open source'
  },
  'flower-python-portfolios-and-pull-requests-building-a-culture-of-code-in-the-classroom': {
    thai: 'สอน Python แบบมืออาชีพด้วย GitHub workflow',
    eng: 'Teach Python professionally using real GitHub workflows'
  },
  'garcia-whats-new-in-pandas-30': {
    thai: 'ฟีเจอร์ใหม่ที่น่าตื่นเต้นใน pandas 3.0',
    eng: 'Exciting new features coming in pandas 3.0'
  },
  'hirata-how-to-transform-ml-apis-into-an-llm-compatible-mcp-server-with-python': {
    thai: 'แปลง ML APIs ให้ใช้งานกับ LLM ผ่าน MCP',
    eng: 'Transform ML APIs to work with LLMs via MCP'
  },
  'kharinskii-from-scratch-to-scale-open-source-stack-for-recommendation-systems': {
    thai: 'สร้างระบบแนะนำที่ scale ได้ด้วย open source stack',
    eng: 'Build scalable recommendation systems with open source stack'
  },
  'kirillov-deploying-operating-streamlit-web-app-in-azure': {
    thai: 'Deploy Streamlit app บน Azure แบบมืออาชีพ',
    eng: 'Deploy and operate Streamlit apps on Azure professionally'
  },
  'kothari-revolutionizing-observability-python-logging-for-asynchronous-cloud-native-systems': {
    thai: 'ระบบ logging ขั้นสูงสำหรับ async cloud-native apps',
    eng: 'Advanced logging for async cloud-native applications'
  },
  'lokko-ai-in-open-source-project-management-more-than-just-code': {
    thai: 'ใช้ AI จัดการ open source project อย่างมีประสิทธิภาพ',
    eng: 'Use AI to manage open source projects effectively'
  },
  'mahapatra-peeking-under-the-hood-of-api-instrumentation-agents': {
    thai: 'เจาะลึกการทำงานของ API monitoring tools',
    eng: 'Deep dive into how API instrumentation agents work'
  },
  'merced-open-standards-and-lakehouse-ai-development-arrow-flight-apache-iceberg-and-mcp': {
    thai: 'พัฒนา AI บน Data Lakehouse ด้วย open standards',
    eng: 'Build AI on Data Lakehouse using open standards'
  },
  'misra-whats-really-going-on-in-your-model-a-python-guide-to-explainable-ai': {
    thai: 'ทำให้ AI model อธิบายการตัดสินใจได้ด้วย Python',
    eng: 'Make your AI models explainable with Python techniques'
  },
  'padinharayil-securing-ai-models-and-ml-pipelines-best-practices-and-pitfalls-to-avoid': {
    thai: 'รักษาความปลอดภัย AI/ML pipeline แบบมืออาชีพ',
    eng: 'Secure your AI/ML pipelines like a pro'
  },
  'rathee-pydanticai-demystified-building-smarter-generative-ai-systems': {
    thai: 'สร้าง Generative AI ที่แข็งแกร่งด้วย PydanticAI',
    eng: 'Build robust Generative AI systems with PydanticAI'
  },
  'rathnayake-why-python-developers-need-better-platforms-and-what-that-actually-looks-like': {
    thai: 'Platform ในอุดมคติสำหรับนักพัฒนา Python',
    eng: 'The ideal platform for Python developers'
  },
  'sarmiento-optimizing-dependency-management-and-deployment-for-serverless-python-applications-with-uv-and-pants': {
    thai: 'จัดการ dependencies และ deploy serverless อย่างมีประสิทธิภาพ',
    eng: 'Optimize dependency management and serverless deployment'
  },
  'shershebnev-developing-production-ready-apps-in-collaboration-with-ai-agents': {
    thai: 'พัฒนา production app ร่วมกับ AI agents',
    eng: 'Develop production-ready apps with AI agents'
  },
  'sripheanpol-best-practices-for-building-graph-based-rag-from-multiple-documents-with-python': {
    thai: 'สร้าง Graph RAG จากเอกสารหลายไฟล์อย่างมีประสิทธิภาพ',
    eng: 'Build efficient Graph RAG from multiple documents'
  },
  'srirattanamet-python-as-a-system-language-how-python-is-used-in-a-linux-system': {
    thai: 'Python ในระดับ system - การใช้งานใน Linux OS',
    eng: 'Python at system level - how it powers Linux'
  },
  'umarye-pings-patterns-python-making-sense-of-300-million-iot-events-a-day': {
    thai: 'จัดการข้อมูล IoT 300 ล้าน events ต่อวันด้วย Python',
    eng: 'Handle 300 million IoT events daily with Python'
  },
  'vaswani-build-modern-ci-pipelines-in-python': {
    thai: 'สร้าง CI/CD pipeline ทันสมัยด้วย Python',
    eng: 'Build modern CI/CD pipelines with Python'
  },
  'vorathammathorn-building-a-quantum-ai-model-with-python': {
    thai: 'พัฒนา Quantum AI model ด้วย Python',
    eng: 'Build Quantum AI models with Python'
  }
};

// Get clean role from bio
function getCleanRole(bio) {
  const patterns = [
    /work(?:s|ing)?\s+as\s+(?:a|an)?\s*([^,\.]+?)\s+at\s+([^,\.]+)/i,
    /^([^,\.]+?)\s+at\s+([^,\.]+)/,
    /is\s+(?:a|an)?\s*([^,\.]+?)\s+(?:at|with)\s+([^,\.]+)/i
  ];
  
  for (const pattern of patterns) {
    const match = bio.match(pattern);
    if (match) {
      const role = match[1].trim().replace(/^(a|an|the)\s+/i, '');
      const company = match[2].trim();
      return `${role} @ ${company}`;
    }
  }
  
  // Simpler patterns
  if (bio.includes('core developer')) return 'Core Developer';
  if (bio.includes('Engineer')) return 'Engineer';
  if (bio.includes('Consultant')) return 'Consultant';
  if (bio.includes('Developer')) return 'Developer';
  if (bio.includes('Student')) return 'Student';
  
  return 'Python Expert';
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
  
  if (!speakerMatch || !titleMatch) return null;
  
  const speakers = speakerMatch[1].split(', ');
  const title = titleMatch[1];
  const category = categoryMatch ? categoryMatch[1] : 'Python';
  const level = levelMatch ? levelMatch[1] : 'All levels';
  const sessionType = typeMatch ? typeMatch[1] : '30-mins talk';
  const isWorkshop = sessionType.includes('workshop');
  
  // Get session key for highlights
  const sessionKey = sessionFile.replace('.md', '');
  const highlight = sessionHighlights[sessionKey] || {
    thai: 'พัฒนาทักษะ Python ในหัวข้อพิเศษ',
    eng: 'Advance your Python skills in this special topic'
  };
  
  // Get speaker info
  const speakerInfo = [];
  speakers.forEach(speaker => {
    const bioPattern = new RegExp(`### ${speaker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\n\\n([^#]+?)(?=\\n\\n###|\\n\\n##|$)`, 's');
    const bioMatch = content.match(bioPattern);
    if (bioMatch) {
      speakerInfo.push({
        name: speaker,
        role: getCleanRole(bioMatch[1])
      });
    } else {
      speakerInfo.push({
        name: speaker,
        role: 'Python Expert'
      });
    }
  });
  
  // Get emoji
  const emoji = categoryEmojis[category] || '🐍';
  
  // Level in Thai
  const levelThai = {
    'Beginner': 'ผู้เริ่มต้น',
    'Intermediate': 'ระดับกลาง', 
    'Advanced': 'ระดับสูง'
  }[level] || 'ทุกระดับ';
  
  // Build the post
  const speakerNames = speakers.join(' & ');
  const mainSpeakerRole = speakerInfo[0].role;
  
  const post = `[English Below]
${emoji} ${isWorkshop ? 'Workshop พิเศษ!' : 'อย่าพลาด!'}
👤 ${speakerNames}
💼 ${mainSpeakerRole}
📌 "${title}"
✨ ${highlight.thai}
🎯 ${isWorkshop ? 'Workshop 90 นาที' : 'Session 30 นาที'} | ${levelThai}
🎟️ จองบัตร: https://www.eventpop.me/e/85285/pycon-thailand-2025
.
${emoji} ${isWorkshop ? 'Special Workshop!' : 'Don\'t Miss!'}
👤 ${speakerNames}
💼 ${mainSpeakerRole}
📌 "${title}"
✨ ${highlight.eng}
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
console.log('🚀 Generating speaker announcement posts...');
generateAllPosts()
  .then(() => console.log('✨ All posts generated successfully!'))
  .catch(error => console.error('💥 Generation failed:', error));