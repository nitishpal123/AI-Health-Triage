FROM node:18-alpine

# Set working directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Copy all files
COPY . .

# Expose Vite's default dev ports
EXPOSE 5173
EXPOSE 5174

# Run with --host to expose to Docker network
CMD [ "npm", "run", "dev", "--", "--host" ]
