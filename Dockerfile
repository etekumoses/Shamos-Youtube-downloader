# Step 1: Use an official Node.js runtime as the base image
FROM node:18-alpine

# Step 2: Install ffmpeg and yt-dlp
RUN apk add --no-cache ffmpeg curl python3 py3-pip && \
    pip install yt-dlp

# Step 3: Set the working directory inside the container
WORKDIR /app

# Step 4: Copy package.json and package-lock.json
COPY package*.json ./

# Step 5: Install dependencies
RUN npm install

# Step 6: Copy the rest of your application code into the container
COPY . .

# Step 7: Build the Next.js app
RUN npm run build

# Step 8: Expose the port on which your app will run
EXPOSE 2000

# Step 9: Start the app
CMD ["npm", "run", "start"]
