FROM node:20-alpine

# Set working directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Copy all files
COPY . .

# Expose Vite's dev port
EXPOSE 3000

# Run with --host to expose to Docker network
CMD [ "npm", "run", "dev", "--", "--host" ]
