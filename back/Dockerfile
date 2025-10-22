FROM debian:bullseye

RUN apt-get update && \
    apt-get install -y curl gnupg sqlite3 \
    build-essential libc6-dev libvips-dev libpng-dev libjpeg-dev \
    libwebp-dev libtiff-dev libgif-dev && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    npm install -g yarn && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install

COPY . .

EXPOSE 4000

CMD ["yarn", "dev"]
