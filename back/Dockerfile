FROM node:20-bullseye-slim

# Enable Yarn (corepack is built into Node 20)
RUN corepack enable && \
    apt-get update && \
    apt-get install -y --no-install-recommends sqlite3 && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json yarn.lock ./

# Optional: BuildKit cache for faster rebuilds
RUN --mount=type=cache,target=/root/.cache/yarn \
    yarn install --production

COPY . .

EXPOSE 4000
CMD ["yarn", "start"]
