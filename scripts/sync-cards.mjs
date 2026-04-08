import fs from 'fs';
import path from 'path';
import https from 'https';

const API_URL = 'https://dunecardshub.com/api/cards';
const BASE_URL = 'https://dunecardshub.com';
const OUT_DIR = path.join(process.cwd(), 'public', 'images', 'cards');
const DATA_FILE = path.join(process.cwd(), 'src', 'data', 'cards.json');

async function downloadImage(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Failed to get '${url}' (${res.statusCode})`));
        return;
      }
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
      file.on('error', (err) => {
        fs.unlink(dest, () => reject(err));
      });
    }).on('error', reject);
  });
}

// Ensure directories exist
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}
const dataDir = path.dirname(DATA_FILE);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

async function run() {
  console.log('Fetching card metadata from', API_URL);
  const jsonRes = await fetch(API_URL);
  if (!jsonRes.ok) {
    throw new Error('Failed to fetch API metadata');
  }
  const cards = await jsonRes.json();
  console.log(`Found ${cards.length} cards.`);
  
  fs.writeFileSync(DATA_FILE, JSON.stringify(cards, null, 2));
  console.log('Saved metadata to', DATA_FILE);

  let downloaded = 0;
  let skipped = 0;
  let errors = 0;

  console.log('Starting image downloads...');
  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];
    if (!card.fullImagePath) continue;
    
    const imgUrl = BASE_URL + card.fullImagePath;
    const destName = path.basename(card.fullImagePath);
    const destPath = path.join(OUT_DIR, destName);

    if (fs.existsSync(destPath)) {
      skipped++;
    } else {
      try {
        await downloadImage(imgUrl, destPath);
        downloaded++;
      } catch (e) {
        console.error(`Error downloading ${imgUrl}:`, e.message);
        errors++;
      }
    }
    
    if (i % 50 === 0 && i !== 0) {
      console.log(`Progress: ${i} / ${cards.length} (Downloaded: ${downloaded}, Skipped: ${skipped}, Errors: ${errors})`);
    }
  }

  console.log('\nSync Complete!');
  console.log(`Downloaded: ${downloaded}`);
  console.log(`Skipped (already existed): ${skipped}`);
  console.log(`Errors: ${errors}`);
}

run().catch(console.error);
