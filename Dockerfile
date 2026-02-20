# নতুন এবং দ্রুত ভার্সন ব্যবহার করছি
FROM node:18-slim

# FFmpeg ইনস্টল করার সঠিক কমান্ড
RUN apt-get update && \
    apt-get install -y ffmpeg && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# ফাইলগুলো কপি করা
COPY package.json ./
RUN npm install

COPY . .

# অ্যাপ চালু করা
CMD ["node", "index.js"]
