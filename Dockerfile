# Step 1: Use an official Node.js runtime as the base image
FROM node:18-alpine

# Step 2: Set the working directory inside the container
WORKDIR /app

# Step 3: Copy package.json and package-lock.json
COPY package*.json ./

# Step 4: Install dependencies
RUN npm install

# Step 5: Copy the rest of your application code into the container
COPY . .

# Step 6: Build the Next.js app
RUN npm run build

# Step 7: Expose the port on which your app will run
EXPOSE 2000

# Step 8: Define the command to run the Next.js app using PM2
# CMD ["npx", "pm2-runtime", "start", "npm", "--", "start"]
CMD ["npm", "run", "start"]
