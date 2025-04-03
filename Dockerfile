FROM node:18-alpine

# Step 1: Install required packages: ffmpeg + python3 (for yt-dlp) + curl
RUN apk add --no-cache ffmpeg python3 curl && \
    curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp && \
    chmod a+rx /usr/local/bin/yt-dlp

# Step 2: Set working directory
WORKDIR /app

# Step 3: Copy and install dependencies
COPY package*.json ./
RUN npm install

# Step 4: Copy the rest of your app
COPY . .

# Step 5: Build your Next.js app
RUN npm run build

# Step 6: Expose port
EXPOSE 2000

# Step 7: Run the app
CMD ["npm", "run", "start"]
