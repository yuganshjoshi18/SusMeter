FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
COPY apps/api/package.json ./apps/api/package.json
COPY packages/shared/package.json ./packages/shared/package.json
RUN npm install --no-audit --no-fund

FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build -w @susmeter/shared && npx prisma generate --schema apps/api/prisma/schema.prisma && npm run build -w @susmeter/api

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
# Use the build stage's node_modules: `prisma generate` writes the generated
# client into node_modules/.prisma/client there. The deps-stage copy only has
# the stub, which throws "@prisma/client did not initialize yet" on startup.
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps/api/dist ./apps/api/dist
COPY --from=build /app/apps/api/prisma ./apps/api/prisma
COPY --from=build /app/packages/shared/dist ./packages/shared/dist
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/apps/api/package.json ./apps/api/package.json
COPY --from=build /app/packages/shared/package.json ./packages/shared/package.json

EXPOSE 4000
CMD ["node", "apps/api/dist/server.js"]
