# Build better-sqlite3's native bindings on the full node:20 image (has python3
# + g++ + make), then copy into a slim runtime image.
FROM node:20.18.0 AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --omit=dev

FROM node:20.18.0 AS build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM node:20.18.0-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV CT_DB_PATH=/data/china-trip.db
ENV PORT=4000
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json ./
EXPOSE 4000
CMD ["node", "dist/index.js"]
