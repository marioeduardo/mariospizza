// One-shot icon generator. Not part of runtime.
// Run with: node scripts/generate-icons.js
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const SVG_PATH = path.join(__dirname, '..', 'public', 'icons', 'icon.svg');
const OUT_DIR = path.join(__dirname, '..', 'public', 'icons');

const svg = fs.readFileSync(SVG_PATH);

const sizes = [
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
  { name: 'icon-180.png', size: 180 },
  { name: 'icon-maskable-512.png', size: 512, maskable: true },
];

async function run() {
  for (const { name, size, maskable } of sizes) {
    const out = path.join(OUT_DIR, name);
    if (maskable) {
      // Maskable precisa de área de segurança ~10% das bordas.
      const innerSize = Math.round(size * 0.8);
      await sharp({
        create: {
          width: size,
          height: size,
          channels: 4,
          background: '#c0392b',
        },
      })
        .composite([
          {
            input: await sharp(svg).resize(innerSize, innerSize).png().toBuffer(),
            gravity: 'center',
          },
        ])
        .png()
        .toFile(out);
    } else {
      await sharp(svg).resize(size, size).png().toFile(out);
    }
    console.log(`✓ ${name}`);
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
