FROM node:20-bullseye-slim AS build

RUN corepack enable

WORKDIR /app

COPY package.json yarn.lock ./

RUN --mount=type=cache,target=/root/.cache/yarn \
    yarn install

COPY . .

CMD ["yarn", "build"]
