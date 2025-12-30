#!/usr/bin/env node
/* eslint-disable no-undef */

/**
 * Simple script to generate placeholder PWA icons using SVG
 * This creates basic icons with the "CP" logo on teal background
 *
 * For production, replace these with professional icon designs
 */

const fs = require('fs');
const path = require('path');

const sizes = [192, 512]
const publicDir = path.join(__dirname, '../public')

// Ensure public directory exists
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true })
}

// Generate SVG icons
sizes.forEach(size => {
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="${size}" height="${size}" fill="#14b8a6" rx="${size * 0.1}"/>

  <!-- CP Text -->
  <text
    x="50%"
    y="50%"
    font-family="Inter, sans-serif"
    font-size="${size * 0.4}"
    font-weight="bold"
    fill="white"
    text-anchor="middle"
    dominant-baseline="central"
  >CP</text>
</svg>`

  const filename = `pwa-${size}x${size}.svg`
  const filepath = path.join(publicDir, filename)
  fs.writeFileSync(filepath, svg)
  console.log(`✓ Generated ${filename}`)
})

// Generate apple-touch-icon
const appleTouchIcon = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="180" height="180" viewBox="0 0 180 180" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="180" height="180" fill="#14b8a6" rx="40"/>

  <!-- CP Text -->
  <text
    x="50%"
    y="50%"
    font-family="Inter, sans-serif"
    font-size="72"
    font-weight="bold"
    fill="white"
    text-anchor="middle"
    dominant-baseline="central"
  >CP</text>
</svg>`

fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.svg'), appleTouchIcon)
console.log('✓ Generated apple-touch-icon.svg')

// Generate favicon.svg
const favicon = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="32" height="32" fill="#14b8a6" rx="6"/>

  <!-- CP Text -->
  <text
    x="50%"
    y="50%"
    font-family="Inter, sans-serif"
    font-size="14"
    font-weight="bold"
    fill="white"
    text-anchor="middle"
    dominant-baseline="central"
  >CP</text>
</svg>`

fs.writeFileSync(path.join(publicDir, 'favicon.svg'), favicon)
console.log('✓ Generated favicon.svg')

console.log('\n✅ Icon generation complete!')
console.log('\n📝 Note: These are placeholder SVG icons.')
console.log('   For production, convert to PNG using:')
console.log('   - https://realfavicongenerator.net/')
console.log('   - https://www.pwabuilder.com/imageGenerator')
console.log('   - Or design tools like Figma/Adobe XD\n')
