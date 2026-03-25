FROM node:20-bookworm-slim
WORKDIR /app

# Install system dependencies for node-gyp and canvas
RUN apt-get update && apt-get install -y \
    build-essential \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    python3 \
    && rm -rf /var/lib/apt/lists/*

# Install dependencies
COPY package.json package-lock.json* yarn.lock* ./
RUN npm ci || yarn install

# Copy full source and build
COPY . .
RUN npm run build || yarn build

# Expose port and start
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["npm", "start"]
