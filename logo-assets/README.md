# Thunder Portal Logo Assets

This directory contains all logo variations for the Thunder Portal project.

## Main Logo Files

### Primary Logos (Pro Design)
- `logo-main.png` - Main logo with transparent background (1024x1024)
- `logo-dark.png` - Logo on dark background (1024x1024)
- `logo-light.png` - Logo on light background (1024x1024)

### Icon Versions
- `logo-icon-transparent.png` - Icon only, transparent background (512x512)
- `logo-icon-dark.png` - Icon only, dark background (512x512)
- `logo-small.png` - Small square version (256x256)
- `favicon.png` - Favicon size (32x32)

### Banner Formats
- `logo-banner-transparent.png` - Wide banner with transparent background (2000x600)
- `logo-banner-dark.png` - Wide banner with dark background (2000x600)

## Usage Guidelines

### For GitHub
- Repository icon: Use `logo-icon-transparent.png`
- README header: Use `logo-banner-transparent.png` or `logo-banner-dark.png`

### For Presentations
- Title slides: Use `logo-main.png` or `logo-dark.png`
- Header/footer: Use `logo-banner-transparent.png`
- Slide icon: Use `logo-icon-transparent.png`

### For Web
- Favicon: Use `favicon.png`
- Header logo: Use `logo-banner-transparent.png`
- Square profile: Use `logo-icon-transparent.png`

### For Print/Swag
- Use the highest resolution versions
- Transparent background versions work best for most applications

## Logo Elements

The Thunder Portal logo combines:
- **Lightning bolt**: Representing speed and "Thunder"
- **Portal rings**: Showing the connection between chains
- **Bitcoin/Ethereum arcs**: Indicating the two blockchain networks
- **Energy effects**: Demonstrating the atomic swap mechanism

## Color Palette
- Lightning: `#FFE600` to `#FF9500` gradient
- Portal: `#00D4FF` to `#FF00FF` gradient
- Bitcoin accent: `#F7931A`
- Ethereum accent: `#627EEA`

## Archived Designs

Previous logo iterations are stored in the `out/archive/` directory for reference.

## Rendering New Formats

To render logos in different sizes or formats:

```bash
# Start Remotion studio to preview
npm start

# Render all final formats
npm run render:all-final

# Render specific format
npm run render:final-banner
```

See `package.json` for all available render commands.