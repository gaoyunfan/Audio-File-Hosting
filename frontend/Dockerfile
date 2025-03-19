FROM node:23-alpine AS base
WORKDIR /code

COPY package.json package-lock.json* yarn.lock* pnpm-lock.yaml* ./
RUN \
    if [ -f yarn.lock ]; then yarn install --frozen-lockfile; \
    elif [ -f package-lock.json ]; then npm ci; \
    elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm install --frozen-lockfile; \
    else echo "No lockfile found" && exit 1; \
    fi

COPY . .

ENV NODE_ENV=development

ENV NODE_OPTIONS="--no-warnings --trace-warnings"
ENV NODE_DISABLE_COLORS=1

EXPOSE 3000

CMD ["pnpm", "dev"]
