FROM node:20-slim AS builder

WORKDIR /workspace

COPY package*.json ./
COPY nx.json ./
COPY tsconfig*.json ./
COPY jest.config.ts ./
COPY jest.preset.js ./
COPY .eslintrc.json ./
COPY webpack.app.config.js ./
COPY webpack.lib.config.js ./

COPY apps/wallet ./apps/wallet
COPY packages/grpc ./packages/grpc
COPY packages/nestjs ./packages/nestjs
COPY packages/prisma ./packages/prisma

RUN npm install

RUN apt-get update && apt-get install -y protobuf-compiler

RUN npx nx build user

FROM node:20-slim AS runner 

WORKDIR /app

COPY --from=builder /workspace/package.json ./
COPY --from=builder /workspace/package-lock.json ./
COPY --from=builder /workspace/apps/wallet/package.json ./apps/wallet/package.json
COPY --from=builder /workspace/packages/nestjs/package.json ./packages/nestjs/package.json
COPY --from=builder /workspace/packages/prisma/package.json ./packages/prisma/package.json
COPY --from=builder /workspace/packages/grpc/package.json ./packages/grpc/package.json

ENV NODE_ENV=production

RUN npm ci

COPY --from=builder /workspace/dist ./dist

CMD ["node", "dist/apps/wallet/main.js"]