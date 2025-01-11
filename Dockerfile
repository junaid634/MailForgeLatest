# Base image
FROM node:18-alpine

# Set working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the source code
COPY . .

# Build the TypeScript files
RUN npm run build
ENV MONGODB_URI=mongodb+srv://junaid634:HsUGT6CzfE6OWt7e@junaid.mk2kax5.mongodb.net/MailForge
# Expose the application port
EXPOSE 3000

# Start the application
CMD ["node", "dist/server.js"]
