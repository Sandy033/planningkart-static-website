// Script to generate simple SVG placeholder images for events
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const categories = {
    'egaming': { color: '#8b5cf6', icon: '🎮', bg: '#f5f3ff' },
    'pottery': { color: '#7c3aed', icon: '🏺', bg: '#ede9fe' },
    'shoe': { color: '#6d28d9', icon: '👟', bg: '#ddd6fe' },
    'tshirt': { color: '#8b5cf6', icon: '👕', bg: '#f5f3ff' },
    'canvas': { color: '#a78bfa', icon: '🎨', bg: '#ede9fe' },
    'cooking': { color: '#7c3aed', icon: '👨‍🍳', bg: '#ddd6fe' },
    'photography': { color: '#6d28d9', icon: '📸', bg: '#f5f3ff' },
    'dance': { color: '#8b5cf6', icon: '💃', bg: '#ede9fe' },
    'music': { color: '#a78bfa', icon: '🎸', bg: '#ddd6fe' },
    'yoga': { color: '#7c3aed', icon: '🧘', bg: '#f5f3ff' },
    'comedy': { color: '#6d28d9', icon: '🎤', bg: '#ede9fe' },
    'boardgame': { color: '#8b5cf6', icon: '🎲', bg: '#ddd6fe' },
    'escape': { color: '#a78bfa', icon: '🔐', bg: '#f5f3ff' },
    'adventure': { color: '#7c3aed', icon: '⛰️', bg: '#ede9fe' }
};

const eventImages = [
    // E-Gaming
    { name: 'egaming-1.jpg', category: 'egaming', title: 'Valorant Tournament' },
    { name: 'egaming-2.jpg', category: 'egaming', title: 'VR Gaming' },
    { name: 'egaming-3.jpg', category: 'egaming', title: 'Retro Gaming' },
    // Pottery
    { name: 'pottery-1.jpg', category: 'pottery', title: 'Pottery Workshop' },
    { name: 'pottery-2.jpg', category: 'pottery', title: 'Wheel Throwing' },
    { name: 'pottery-3.jpg', category: 'pottery', title: 'Ceramic Painting' },
    // Shoe Painting
    { name: 'shoe-1.jpg', category: 'shoe', title: 'Sneaker Art' },
    { name: 'shoe-2.jpg', category: 'shoe', title: 'Graffiti Shoes' },
    { name: 'shoe-3.jpg', category: 'shoe', title: 'Kids Shoe Art' },
    // T-shirt
    { name: 'tshirt-1.jpg', category: 'tshirt', title: 'Tie-Dye' },
    { name: 'tshirt-2.jpg', category: 'tshirt', title: 'Fabric Painting' },
    { name: 'tshirt-3.jpg', category: 'tshirt', title: 'Couple Tshirts' },
    // Canvas
    { name: 'canvas-1.jpg', category: 'canvas', title: 'Acrylic Painting' },
    { name: 'canvas-2.jpg', category: 'canvas', title: 'Abstract Art' },
    { name: 'canvas-3.jpg', category: 'canvas', title: 'Landscape' },
    // Cooking
    { name: 'cooking-1.jpg', category: 'cooking', title: 'Italian Cuisine' },
    { name: 'cooking-2.jpg', category: 'cooking', title: 'Baking' },
    { name: 'cooking-3.jpg', category: 'cooking', title: 'Street Food' },
    // Photography
    { name: 'photography-1.jpg', category: 'photography', title: 'DSLR Basics' },
    { name: 'photography-2.jpg', category: 'photography', title: 'Portrait' },
    { name: 'photography-3.jpg', category: 'photography', title: 'Mobile Photo' },
    // Dance
    { name: 'dance-1.jpg', category: 'dance', title: 'Bollywood Dance' },
    { name: 'dance-2.jpg', category: 'dance', title: 'Contemporary' },
    { name: 'dance-3.jpg', category: 'dance', title: 'Salsa' },
    // Music
    { name: 'music-1.jpg', category: 'music', title: 'Guitar Jamming' },
    { name: 'music-2.jpg', category: 'music', title: 'Drum Circle' },
    { name: 'music-3.jpg', category: 'music', title: 'Vocal Training' },
    // Yoga
    { name: 'yoga-1.jpg', category: 'yoga', title: 'Sunrise Yoga' },
    { name: 'yoga-2.jpg', category: 'yoga', title: 'Meditation' },
    { name: 'yoga-3.jpg', category: 'yoga', title: 'Power Yoga' },
    // Comedy
    { name: 'comedy-1.jpg', category: 'comedy', title: 'Open Mic' },
    { name: 'comedy-2.jpg', category: 'comedy', title: 'Comedy Writing' },
    { name: 'comedy-3.jpg', category: 'comedy', title: 'Improv Night' },
    // Board Games
    { name: 'boardgame-1.jpg', category: 'boardgame', title: 'Board Game Cafe' },
    { name: 'boardgame-2.jpg', category: 'boardgame', title: 'Strategy Games' },
    { name: 'boardgame-3.jpg', category: 'boardgame', title: 'Family Games' },
    // Escape Room
    { name: 'escape-1.jpg', category: 'escape', title: 'Mystery Mansion' },
    { name: 'escape-2.jpg', category: 'escape', title: 'Zombie Apocalypse' },
    { name: 'escape-3.jpg', category: 'escape', title: 'Bank Heist' },
    // Adventure
    { name: 'adventure-1.jpg', category: 'adventure', title: 'Nandi Hills Trek' },
    { name: 'adventure-2.jpg', category: 'adventure', title: 'Rock Climbing' },
    { name: 'adventure-3.jpg', category: 'adventure', title: 'Camping' }
];

function generateSVG(event) {
    const cat = categories[event.category];
    return `<svg width="600" height="400" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad-${event.name}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${cat.color};stop-opacity:0.8" />
      <stop offset="100%" style="stop-color:${cat.color};stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="600" height="400" fill="${cat.bg}"/>
  <rect width="600" height="400" fill="url(#grad-${event.name})" opacity="0.3"/>
  <text x="300" y="180" font-family="Arial, sans-serif" font-size="120" text-anchor="middle" fill="${cat.color}">${cat.icon}</text>
  <text x="300" y="280" font-family="Arial, sans-serif" font-size="32" font-weight="bold" text-anchor="middle" fill="#1c1917">${event.title}</text>
  <rect x="20" y="20" width="560" height="360" fill="none" stroke="${cat.color}" stroke-width="4" rx="20"/>
</svg>`;
}

const imagesDir = path.join(__dirname, '..', 'public', 'images');
if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
}

eventImages.forEach(event => {
    const svg = generateSVG(event);
    const filePath = path.join(imagesDir, event.name);
    fs.writeFileSync(filePath, svg);
    console.log(`Generated: ${event.name}`);
});

console.log(`\nSuccessfully generated ${eventImages.length} event images!`);
