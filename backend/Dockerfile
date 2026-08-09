FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install build dependencies & production modules
RUN apk add --no-cache python3 make g++ && \
    npm install --omit=dev --legacy-peer-deps

# Copy source code
COPY . .

# Expose port
EXPOSE 8000

# Set Node ENV
ENV NODE_ENV=production

# Start application
CMD ["npm", "start"]
