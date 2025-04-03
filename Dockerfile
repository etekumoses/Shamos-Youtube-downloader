# Step 1: Use an official Node.js base image
FROM node:18-alpine

# Step 2: Set working directory
WORKDIR /app

# Step 3: Install yt-dlp and ffmpeg using apk (no pip headaches)
RUN apk add --no-cache curl ffmpeg && \
    curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp && \
    chmod a+rx /usr/local/bin/yt-dlp

# Step 4: Copy package files and install deps
COPY package*.json ./
RUN npm install

# Step 5: Copy remaining app files
COPY . .

# Step 6: Build the app
RUN npm run build

# Step 7: Expose the desired port
EXPOSE 2000

# Step 8: Start the Next.js server
CMD ["npm", "run", "start"]
