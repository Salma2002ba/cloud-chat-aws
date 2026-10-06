# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Set environment variables for build
ARG VITE_CHAT_API_URL=http://localhost:3002
ARG VITE_AUTH_API_URL=http://localhost:3001
ENV VITE_CHAT_API_URL=${VITE_CHAT_API_URL}
ENV VITE_AUTH_API_URL=${VITE_AUTH_API_URL}

# Build the app
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Install serve to run the static files
RUN npm install -g serve

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 3000

# Start the app
CMD ["serve", "-s", "dist", "-l", "3000"]
