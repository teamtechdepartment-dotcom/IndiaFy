FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --only=production

# Copy source code
COPY . .

# Expose port
EXPOSE 8000

# Set Node ENV
ENV NODE_ENV=production

# Start application
CMD ["npm", "start"]
