# Puppeteer Advanced Web Scraper

A powerful Puppeteer-based web scraping tool for handling dynamic content, authentication, infinite scroll, and more complex web scraping scenarios.

## Installation

```bash
npm install
```

## Usage

### Command Line Interface

```bash
# Run the PyCon example
node scripts/puppeteer-scraper.js example

# Scrape a specific URL
node scripts/puppeteer-scraper.js scrape <url> [options]

# Examples:
node scripts/puppeteer-scraper.js scrape https://example.com --selector ".content" --screenshot output/page.png
node scripts/puppeteer-scraper.js scrape https://example.com --infinite-scroll --output output/page.html
```

### Programmatic Usage

```javascript
const AdvancedScraper = require('./scripts/puppeteer-scraper');

async function scrapeWebsite() {
    const scraper = new AdvancedScraper({
        headless: true,
        defaultTimeout: 30000
    });
    
    try {
        await scraper.init();
        await scraper.goto('https://example.com');
        
        // Scrape dynamic content
        const content = await scraper.scrapeDynamicContent('.dynamic-content');
        
        // Handle infinite scroll
        const items = await scraper.scrapeInfiniteScrollContent('.item', 10);
        
        // Take screenshot
        await scraper.takeScreenshot('screenshot.png');
        
        // Save results
        await scraper.saveJSON({ content, items }, 'results.json');
    } finally {
        await scraper.close();
    }
}
```

## Features

### 1. Dynamic Content Scraping
Wait for and scrape JavaScript-rendered content:
```javascript
const content = await scraper.scrapeDynamicContent('.selector', {
    timeout: 10000,
    visible: true
});
```

### 2. Authentication
Handle login flows:
```javascript
const cookies = await scraper.login(
    'https://example.com/login',
    'username',
    'password',
    {
        username: '#email-input',
        password: '#password-input',
        submit: '#login-button'
    }
);
```

### 3. Infinite Scroll
Scrape content from pages with infinite scroll:
```javascript
// Scroll and load more content
await scraper.handleInfiniteScroll(maxScrolls, scrollDelay);

// Scrape all loaded items
const items = await scraper.scrapeInfiniteScrollContent('.item-selector');
```

### 4. Popup/Modal Handling
Extract content from popups and modals:
```javascript
const popupContent = await scraper.handlePopup(
    '.trigger-button',
    '.modal-content'
);
```

### 5. Form Interaction
Fill and submit forms:
```javascript
await scraper.fillForm({
    '#name': 'John Doe',
    '#email': 'john@example.com',
    '#subscribe': true  // checkbox
});
await scraper.submitForm('#submit-button');
```

### 6. Screenshots
Capture full-page or viewport screenshots:
```javascript
await scraper.takeScreenshot('screenshot.png', {
    fullPage: true,
    clip: { x: 0, y: 0, width: 800, height: 600 }
});
```

### 7. Table Extraction
Extract structured data from HTML tables:
```javascript
const tableData = await scraper.extractTable('table.data-table');
// Returns: { headers: [...], data: [...] }
```

### 8. Metadata Extraction
Get page metadata:
```javascript
const metadata = await scraper.extractMetadata();
// Returns: title, description, keywords, og tags, etc.
```

### 9. Request Interception
Monitor or modify network requests:
```javascript
await scraper.interceptRequests((request) => {
    console.log('Request:', request.url());
    request.continue();
});
```

## Options

### Constructor Options
- `headless`: Run browser in headless mode (default: true)
- `defaultTimeout`: Default timeout for operations (default: 30000ms)
- `viewport`: Browser viewport dimensions (default: 1920x1080)
- `userAgent`: Custom user agent string

### Navigation Options
- `waitUntil`: When to consider navigation complete
  - `'load'`: Load event fired
  - `'domcontentloaded'`: DOMContentLoaded event fired
  - `'networkidle0'`: No network connections for 500ms
  - `'networkidle2'`: No more than 2 network connections for 500ms

## Error Handling

The scraper includes built-in error handling for common scenarios:
- Navigation timeouts
- Missing selectors
- Network errors
- Authentication failures

Always wrap scraper usage in try-finally blocks to ensure proper cleanup:
```javascript
try {
    await scraper.init();
    // ... scraping logic
} finally {
    await scraper.close();
}
```

## Use Cases

### Conference Website Scraping (PyCon TH 2025)
- Extract speaker information from dynamic lists
- Handle session detail popups
- Monitor ticket availability
- Scrape interactive schedules

### E-commerce
- Product listings with infinite scroll
- Price monitoring
- Inventory tracking
- Review extraction

### Social Media
- Profile data extraction
- Post content with lazy loading
- Comment threads
- Media downloads

### Data Collection
- Form submission automation
- Multi-page data extraction
- Authentication-protected content
- Real-time data monitoring

## Best Practices

1. **Respect robots.txt**: Check website's scraping policy
2. **Rate limiting**: Add delays between requests
3. **Error handling**: Implement retry logic for failures
4. **Resource cleanup**: Always close browser instances
5. **User agent**: Use realistic user agent strings
6. **Caching**: Save and reuse cookies for authenticated sessions

## Troubleshooting

### Common Issues

1. **Timeout errors**: Increase `defaultTimeout` or use specific timeout options
2. **Selector not found**: Ensure selectors are correct and wait for elements
3. **Navigation errors**: Check URL validity and network connectivity
4. **Memory leaks**: Ensure proper cleanup with `scraper.close()`

### Debug Mode

Run with headless: false to see browser actions:
```javascript
const scraper = new AdvancedScraper({ headless: false });
```

## License

ISC