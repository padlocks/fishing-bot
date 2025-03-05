const fs = require('fs');
const path = require('path');
const https = require('https');

// Path to the emoji file and output directory
const emojiFilePath = path.join(__dirname, 'emojis.txt');
const outputDir = path.join(__dirname, '..', '..', 'images');

// Create the output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
  console.log(`Created directory: ${outputDir}`);
}

// Read and parse the emoji file
const emojiContent = fs.readFileSync(emojiFilePath, 'utf8');
const emojiLines = emojiContent.trim().split('\n');
const emojis = emojiLines.map(line => {
  const [name, id] = line.split(':');
  return { name, id: id.trim() };
});

console.log(`Found ${emojis.length} emojis to download.`);

// Function to download an emoji
function downloadEmoji(emoji) {
  return new Promise((resolve, reject) => {
    const fileExtension = 'png';
    const url = `https://cdn.discordapp.com/emojis/${emoji.id}.${fileExtension}`;
    const outputPath = path.join(outputDir, `${emoji.name}.${fileExtension}`);
    
    const file = fs.createWriteStream(outputPath);
    
    https.get(url, response => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${emoji.name}: HTTP ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        console.log(`Downloaded ${emoji.name}`);
        resolve();
      });
    }).on('error', err => {
      fs.unlink(outputPath, () => {}); // Delete the file if there was an error
      reject(err);
    });
  });
}

// Download all emojis with a delay between requests to avoid rate limiting
async function downloadAllEmojis() {
  console.log('Starting downloads...');
  
  for (const emoji of emojis) {
    try {
      await downloadEmoji(emoji);
      // Small delay to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`Error downloading ${emoji.name}:`, error.message);
    }
  }
  
  console.log('All downloads completed!');
}

downloadAllEmojis();
