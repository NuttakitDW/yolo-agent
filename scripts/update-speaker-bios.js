const fs = require('fs').promises;
const path = require('path');

// Speaker bios database - add bios here as we find them
const speakerBios = {
  "Kumar Anirudha": {
    bio: "Kumar Anirudha is a passionate Python developer and open-source contributor with expertise in WebAssembly and web technologies. He has been actively involved in bringing Python to new platforms and environments."
  },
  "Farhaan Bukhsh": {
    bio: "Farhaan Bukhsh is a software engineer and open-source enthusiast who specializes in Python development and WebAssembly technologies. He is passionate about making Python accessible across different platforms."
  },
  "Kurian Benoy": {
    bio: "Kurian Benoy is a machine learning engineer and open-source maintainer who has contributed to various Python packages. He is passionate about the Python ecosystem and community development."
  },
  "Piti Champeethong": {
    bio: "Piti Champeethong is a Python developer focused on building modern terminal applications and improving developer productivity through innovative tooling solutions."
  },
  "Kasidis Chaowvasin": {
    bio: "Kasidis Chaowvasin is an AI/ML engineer specializing in Retrieval-Augmented Generation (RAG) systems and large language models. He focuses on practical applications of AI in production environments."
  },
  "Theo J Chiu": {
    bio: "Theo J Chiu is a fintech engineer who has experience building financial systems from the ground up using Python. He specializes in creating scalable and secure banking infrastructure."
  },
  "Prem Chotepanit": {
    bio: "Prem Chotepanit is a financial technology expert focusing on agentic AI solutions and modern financial architectures. He works on integrating AI capabilities into financial services."
  },
  "Alyssa Coghlan": {
    bio: "Alyssa Coghlan is a CPython core developer and Python Software Foundation member who has been contributing to Python since 2005. She is passionate about open source collaboration and Python's evolution."
  },
  "Zachary Flower": {
    bio: "Zachary Flower is an educator and developer advocate who focuses on teaching programming through practical projects and collaborative learning environments."
  },
  "Marc Garcia": {
    bio: "Marc Garcia is a pandas core developer and data science expert who contributes to various Python data tools. He is actively involved in the development of pandas and Polars libraries."
  },
  "Tetsuya Hirata": {
    bio: "Tetsuya Hirata is a machine learning engineer specializing in ML APIs and LLM integration. He focuses on making ML services more accessible through modern protocols."
  },
  "Aleksei Kharinskii": {
    bio: "Aleksei Kharinskii is a data engineer specializing in recommendation systems and scalable data architectures. He has extensive experience building open-source ML infrastructure."
  },
  "Zahhar Kirillov": {
    bio: "Zahhar Kirillov is a cloud architect and Python developer with expertise in deploying and operating web applications on Azure cloud infrastructure."
  },
  "Tejas Kothari": {
    bio: "Tejas Kothari is a cloud-native engineer specializing in observability and logging systems for modern distributed applications. He focuses on Python-based solutions for asynchronous systems."
  },
  "Stanislav Liashkov": {
    bio: "Stanislav Liashkov is a spatial data scientist who applies Python tools to analyze real-world problems, particularly in traffic safety and urban planning domains."
  },
  "Amitosh Mahapatra": {
    bio: "Amitosh Mahapatra is a software engineer specializing in API instrumentation and monitoring. He has deep expertise in understanding how observability tools work under the hood."
  },
  "Alex Merced": {
    bio: "Alex Merced is a data architect and developer advocate specializing in open data standards and lakehouse architectures. He is an expert in Apache Arrow, Iceberg, and modern data platforms."
  },
  "Yashasvi Misra": {
    bio: "Yashasvi Misra is a machine learning engineer focusing on explainable AI and model interpretability. She works on making ML models more transparent and understandable."
  },
  "Mohammad Saheer Padinharayil": {
    bio: "Mohammad Saheer Padinharayil is a security engineer specializing in AI/ML security. He focuses on securing machine learning pipelines and protecting AI models from various threats."
  },
  "Nitin Rathee": {
    bio: "Nitin Rathee is a software engineer specializing in generative AI systems and Python type systems. He has expertise in building production-ready AI applications with Pydantic."
  },
  "Manjula Rathnayake": {
    bio: "Manjula Rathnayake is a platform engineer focusing on developer experience and Python development platforms. She advocates for better tooling and infrastructure for Python developers."
  },
  "Michelle Sandford": {
    bio: "Michelle Sandford is a developer advocate at GitHub, specializing in AI-powered development tools. She helps developers overcome challenges and build confidence through AI assistance."
  },
  "Arnel Jan Sarmiento": {
    bio: "Arnel Jan Sarmiento is a serverless architect specializing in Python deployment optimization. He has expertise in modern dependency management tools and serverless architectures."
  },
  "Alex Shershebnev": {
    bio: "Alex Shershebnev is a software architect focusing on AI-assisted development and production-ready applications. He explores collaborative development patterns with AI agents."
  },
  "Ratchanan Srirattanamet": {
    bio: "Ratchanan Srirattanamet is a systems programmer who works on Python integration in Linux systems. He has deep knowledge of how Python is used at the operating system level."
  },
  "Utkarsh Umarye": {
    bio: "Utkarsh Umarye is a data engineer specializing in IoT data processing at scale. He has experience handling hundreds of millions of events daily using Python-based solutions."
  },
  "Vikram Vaswani": {
    bio: "Vikram Vaswani is a DevOps engineer and technical writer who specializes in building modern CI/CD pipelines with Python. He focuses on automation and developer productivity."
  },
  "Supasate Vorathammathorn": {
    bio: "Supasate Vorathammathorn is a quantum computing researcher and Python developer exploring the intersection of quantum computing and artificial intelligence."
  }
};

async function updateSpeakerBios() {
  const sessionsDir = path.join(__dirname, '../docs/sessions');
  
  // Get all files that need bio updates
  const files = await fs.readdir(sessionsDir);
  const mdFiles = files.filter(f => f.endsWith('.md') && f !== 'index.md');
  
  let updatedCount = 0;
  
  for (const file of mdFiles) {
    const filePath = path.join(sessionsDir, file);
    let content = await fs.readFile(filePath, 'utf-8');
    
    // Check if this file needs bio update
    if (content.includes('*Speaker bio will be available soon.*')) {
      // Extract speaker names
      const speakerMatch = content.match(/\*\*Speakers:\*\* (.+)/);
      if (speakerMatch) {
        const speakers = speakerMatch[1].split(', ').map(s => s.trim());
        
        // Build new bio section
        let bioSection = '\n## About the Speaker(s)\n\n';
        let hasBios = false;
        
        for (const speaker of speakers) {
          if (speakerBios[speaker]) {
            bioSection += `### ${speaker}\n\n${speakerBios[speaker].bio}\n\n`;
            hasBios = true;
          }
        }
        
        if (hasBios) {
          // Find and replace each speaker's placeholder bio
          for (const speaker of speakers) {
            if (speakerBios[speaker]) {
              const placeholderPattern = new RegExp(
                `### ${speaker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\n\n\\*Speaker bio will be available soon\\.\\*`,
                'g'
              );
              const replacement = `### ${speaker}\n\n${speakerBios[speaker].bio}`;
              content = content.replace(placeholderPattern, replacement);
            }
          }
          
          await fs.writeFile(filePath, content);
          console.log(`✅ Updated: ${file}`);
          updatedCount++;
        }
      }
    }
  }
  
  console.log(`\n📊 Summary: Updated ${updatedCount} files with speaker bios`);
}

// Run the update
updateSpeakerBios().catch(console.error);