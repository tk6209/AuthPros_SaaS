FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
RUN npm ci || yarn install || pnpm install
COPY tsconfig.json ./
COPY src ./src
COPY prisma ./prisma
ENV NODE_ENV=development
EXPOSE 4000
CMD ["npm", "run", "dev"]
