import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import { promises as fs } from 'fs';
import path from 'path';

const server = new Server(
  {
    name: 'yolo-agent-scraper',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'scrape_documentation',
        description: 'Scrape documentation from a URL and save it to the repo',
        inputSchema: {
          type: 'object',
          properties: {
            url: {
              type: 'string',
              description: 'The URL to scrape documentation from',
            },
            filename: {
              type: 'string',
              description: 'The filename to save the documentation as (without extension)',
            },
            selector: {
              type: 'string',
              description: 'Optional CSS selector to extract specific content',
              default: 'body',
            },
          },
          required: ['url', 'filename'],
        },
      },
      {
        name: 'bulk_scrape',
        description: 'Scrape multiple documentation pages at once',
        inputSchema: {
          type: 'object',
          properties: {
            urls: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  url: { type: 'string' },
                  filename: { type: 'string' },
                  selector: { type: 'string' },
                },
                required: ['url', 'filename'],
              },
              description: 'Array of URLs to scrape with their filenames',
            },
          },
          required: ['urls'],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case 'scrape_documentation': {
      try {
        const { url, filename, selector = 'body' } = args;
        
        // Fetch the page
        const response = await fetch(url);
        const html = await response.text();
        
        // Parse with Cheerio
        const $ = cheerio.load(html);
        
        // Extract content
        const content = $(selector).text().trim();
        
        // Extract structured data
        const title = $('title').text() || 'Untitled';
        const headings = [];
        $('h1, h2, h3').each((_, el) => {
          headings.push({
            level: el.tagName.toLowerCase(),
            text: $(el).text().trim(),
          });
        });
        
        // Create markdown content
        const markdown = `# ${title}

Source: ${url}
Scraped: ${new Date().toISOString()}

## Content

${content}

## Structure

${headings.map(h => `${'#'.repeat(parseInt(h.level[1]))} ${h.text}`).join('\n')}
`;
        
        // Save to docs directory
        const docsDir = path.join(process.cwd(), '..', 'docs', 'scraped');
        await fs.mkdir(docsDir, { recursive: true });
        
        const filePath = path.join(docsDir, `${filename}.md`);
        await fs.writeFile(filePath, markdown);
        
        return {
          content: [
            {
              type: 'text',
              text: `Successfully scraped documentation from ${url} and saved to docs/scraped/${filename}.md`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error scraping documentation: ${error.message}`,
            },
          ],
        };
      }
    }
    
    case 'bulk_scrape': {
      try {
        const { urls } = args;
        const results = [];
        
        for (const item of urls) {
          try {
            const { url, filename, selector = 'body' } = item;
            
            const response = await fetch(url);
            const html = await response.text();
            const $ = cheerio.load(html);
            
            const content = $(selector).text().trim();
            const title = $('title').text() || 'Untitled';
            
            const markdown = `# ${title}

Source: ${url}
Scraped: ${new Date().toISOString()}

## Content

${content}
`;
            
            const docsDir = path.join(process.cwd(), '..', 'docs', 'scraped');
            await fs.mkdir(docsDir, { recursive: true });
            
            const filePath = path.join(docsDir, `${filename}.md`);
            await fs.writeFile(filePath, markdown);
            
            results.push(`✓ ${filename}.md`);
          } catch (error) {
            results.push(`✗ ${item.filename}: ${error.message}`);
          }
        }
        
        return {
          content: [
            {
              type: 'text',
              text: `Bulk scraping completed:\n${results.join('\n')}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error in bulk scraping: ${error.message}`,
            },
          ],
        };
      }
    }
    
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
console.error('Yolo Agent MCP Scraper running on stdio');