FROM oven/bun:1.1-alpine

WORKDIR /app

# Copy dependency files
COPY package.json ./

# Install dependencies (only production)
RUN bun install --production

# Copy source code
COPY src ./src

# Expose HTTP port
EXPOSE 3000

# Set environment production flag
ENV NODE_ENV=production

# Run the application
CMD ["bun", "run", "src/index.ts"]
