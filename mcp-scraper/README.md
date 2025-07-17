# Yolo Agent MCP Documentation Scraper

An MCP (Model Context Protocol) server that enables Claude to scrape documentation from the internet and save it to your repository.

## Setup

1. Install dependencies:
```bash
cd mcp-scraper
npm install
```

2. Add to Claude Desktop config:
   - Copy the contents of `claude_desktop_config.json` to your Claude Desktop settings
   - Or merge with existing MCP servers in `~/Library/Application Support/Claude/claude_desktop_config.json`

3. Restart Claude Desktop

## Usage

Once configured, Claude will have access to two new tools:

### `scrape_documentation`
Scrapes a single documentation page:
```
scrape_documentation(
  url: "https://docs.example.com/api",
  filename: "example-api",
  selector: ".main-content"  // optional, defaults to "body"
)
```

### `bulk_scrape`
Scrapes multiple pages at once:
```
bulk_scrape(
  urls: [
    { url: "https://docs.example.com/api", filename: "api-docs" },
    { url: "https://docs.example.com/guide", filename: "guide", selector: ".content" }
  ]
)
```

## Output

Scraped documentation is saved as markdown files in `/docs/scraped/` with:
- Original source URL
- Timestamp
- Extracted content
- Document structure (headings)

## Example Usage in Claude

"Scrape the React documentation homepage and save it"
"Bulk scrape these API docs: [list of URLs]"
"Extract the main content from this documentation page"