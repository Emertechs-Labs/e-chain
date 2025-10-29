import sharp from 'sharp';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function createFavicon() {
  try {
    const svgBuffer = readFileSync(join(__dirname, 'public', 'favicon.svg'));

    // Convert SVG to ICO format with multiple sizes
    await sharp(svgBuffer)
      .resize(32, 32)
      .png()
      .toFile(join(__dirname, 'public', 'favicon-32x32.png'));

    await sharp(svgBuffer)
      .resize(16, 16)
      .png()
      .toFile(join(__dirname, 'public', 'favicon-16x16.png'));

    // Create ICO file from the PNG
    await sharp(join(__dirname, 'public', 'favicon-32x32.png'))
      .toFile(join(__dirname, 'public', 'favicon.ico'));

    console.log('✅ Favicon created successfully!');
  } catch (error) {
    console.error('❌ Error creating favicon:', error);
  }
}

createFavicon();