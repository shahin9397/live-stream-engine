const admin = require('firebase-admin');
const { spawn } = require('child_process');

// আপনার Firebase Service Account তথ্য (এটি পরে সেটআপ করব)
// এখন আমরা সরাসরি ডাটাবেজ কানেক্ট করছি
const dbUrl = "https://mystreamapp-200ac-default-rtdb.firebaseio.com";

admin.initializeApp({
  databaseURL: dbUrl
});

const db = admin.database();

console.log("লাইভ ইঞ্জিন চালু হয়েছে... কমান্ডের জন্য অপেক্ষা করছি।");

// ডাটাবেজে পরিবর্তনের ওপর নজর রাখা
db.ref('liveStream/').on('value', (snapshot) => {
  const data = snapshot.val();
  if (data && data.link) {
    console.log("নতুন ভিডিও লিঙ্ক পাওয়া গেছে: " + data.link);
    startStreaming(data.link, data.youtubeKey, data.fbKey);
  }
});

function startStreaming(videoUrl, youtubeKey, fbKey) {
  // FFmpeg কমান্ড যা লোগো বসাবে এবং ফেসবুক-ইউটিউবে পাঠাবে
  // ইউটিউব এবং ফেসবুকের জন্য আলাদা আউটপুট সেট করা আছে
  const args = [
    '-re', 
    '-i', videoUrl,
    '-i', 'logo.png', // আপনার লোগো ফাইল
    '-filter_complex', 'overlay=W-w-10:10', // ডানদিকের উপরে লোগো
    '-c:v', 'libx264', '-preset', 'veryfast', '-b:v', '3000k',
    '-maxrate', '3000k', '-bufsize', '6000k',
    '-pix_fmt', 'yuv420p', '-g', '50',
    '-c:a', 'aac', '-b:a', '128k', '-ar', '44100',
    '-f', 'tee', 
    '-map', '0:v', '-map', '0:a',
    `[f=flv]rtmp://a.rtmp.youtube.com/live2/${youtubeKey}|[f=flv]rtmps://live-api-s.facebook.com:443/rtmp/${fbKey}`
  ];

  const ffmpeg = spawn('ffmpeg', args);

  ffmpeg.stderr.on('data', (data) => {
    console.log(`FFmpeg Status: ${data}`);
  });

  ffmpeg.on('close', (code) => {
    console.log(`স্ট্রিমিং বন্ধ হয়েছে, কোড: ${code}`);
  });
}
