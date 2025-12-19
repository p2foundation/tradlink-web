/**
 * Script to download a free stock video for the hero section
 * Run with: node scripts/download-video.js
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Try multiple video sources
const videoSources = [
  {
    name: 'Coverr - Shipping Containers',
    url: 'https://coverr.co/s3/mp4/Shipping-Containers.mp4',
  },
  {
    name: 'Pixabay - Cargo Ship',
    url: 'https://cdn.pixabay.com/video/2021/06/15/84949-540473417_large.mp4',
  },
];

const outputPath = path.join(__dirname, '../public/videos/hero-video.mp4');

// Create videos directory if it doesn't exist
const videosDir = path.dirname(outputPath);
if (!fs.existsSync(videosDir)) {
  fs.mkdirSync(videosDir, { recursive: true });
}

function downloadVideo(index = 0) {
  if (index >= videoSources.length) {
    console.error('\n❌ All video sources failed.');
    console.log('\n📝 Manual download instructions:');
    console.log('Option 1 - Mixkit:');
    console.log('  1. Visit: https://mixkit.co/free-stock-video/cargo-ship-full-of-containers-4011/');
    console.log('  2. Click "Download Free" button');
    console.log('  3. Save as: web/public/videos/hero-video.mp4');
    console.log('\nOption 2 - Coverr:');
    console.log('  1. Visit: https://coverr.co/videos/shipping-containers');
    console.log('  2. Click download');
    console.log('  3. Save as: web/public/videos/hero-video.mp4');
    return;
  }

  const videoUrl = videoSources[index].url;
  const sourceName = videoSources[index].name;
  const url = new URL(videoUrl);
  const client = url.protocol === 'https:' ? https : http;

  console.log(`\n🔄 Trying source ${index + 1}/${videoSources.length}: ${sourceName}`);
  console.log('   URL:', videoUrl);

  const file = fs.createWriteStream(outputPath);
  const options = {
    hostname: url.hostname,
    path: url.pathname + url.search,
    method: 'GET',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'video/mp4,video/*;q=0.9,*/*;q=0.8',
    },
  };

  const req = client.request(options, (response) => {
    if (response.statusCode === 200) {
      const totalSize = parseInt(response.headers['content-length'] || '0', 10);
      let downloadedSize = 0;

      response.on('data', (chunk) => {
        downloadedSize += chunk.length;
        const percent = totalSize > 0 ? ((downloadedSize / totalSize) * 100).toFixed(1) : '?';
        process.stdout.write(`\r   Progress: ${percent}% (${(downloadedSize / 1024 / 1024).toFixed(2)} MB)`);
      });

      response.pipe(file);
      file.on('finish', () => {
        file.close();
        const stats = fs.statSync(outputPath);
        console.log(`\n\n✅ Video downloaded successfully!`);
        console.log(`   Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
        console.log(`   Location: ${outputPath}`);
        console.log('\n🎉 The video is now ready to use in your hero section!');
      });
    } else if (response.statusCode === 301 || response.statusCode === 302) {
      // Handle redirect
      file.close();
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
      console.log(`\n   ⚠️  Redirected, trying next source...`);
      downloadVideo(index + 1);
    } else {
      file.close();
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
      console.log(`\n   ❌ Failed (Status: ${response.statusCode}), trying next source...`);
      downloadVideo(index + 1);
    }
  });

  req.on('error', (err) => {
    file.close();
    if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    console.log(`\n   ❌ Error: ${err.message}, trying next source...`);
    downloadVideo(index + 1);
  });

  req.setTimeout(10000, () => {
    req.destroy();
    file.close();
    if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    console.log(`\n   ⏱️  Timeout, trying next source...`);
    downloadVideo(index + 1);
  });

  req.end();
}

console.log('🎬 Starting video download...\n');
downloadVideo(0);
