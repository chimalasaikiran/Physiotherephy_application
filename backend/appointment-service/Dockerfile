# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./

RUN npm ci

COPY src ./src

RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5002

COPY package*.json ./

RUN npm ci --only=production

COPY --from=builder /app/dist ./dist

EXPOSE 5002

USER node

CMD ["node", "dist/server.js"]
