FROM node:20-slim

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy application files
COPY . .

ENV PORT=8000
EXPOSE 8000

CMD ["node", "server.js"]
