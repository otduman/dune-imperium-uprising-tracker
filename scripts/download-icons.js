const fs = require('fs');
const https = require('https');
const path = require('path');

const outDir = path.join(process.cwd(), 'public', 'images');
const base = 'https://dunecardshub.com/icons/';
const icons = ['Spice_Blank.png', 'Solari_Blank.png', 'Recruit.png', 'Water.png', 'VictoryPoint.png'];

async function downloadImage(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error("Failed to get " + url + " (" + res.statusCode + ")"));
        return;
      }
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
      file.on('error', (err) => { fs.unlink(dest, () => reject(err)); });
    }).on('error', reject);
  });
}

(async () => {
    for(const icon of icons) {
        console.log('Downloading ' + icon);
        try {
            await downloadImage(base + icon, path.join(outDir, icon.toLowerCase()));
            console.log('Success: ' + icon);
        } catch(e) {
            console.error('Error for ' + icon + ': ' + e.message);
        }
    }
})();
