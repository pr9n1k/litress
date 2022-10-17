FROM node:17.3.0 AS builder

# Create app directory
WORKDIR /app

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./
COPY prisma ./prisma/

# Install app dependencies
RUN npm ci

COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:17.3.0
ENV NODE_ENV production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
ENV PORT=3000

EXPOSE ${PORT}
CMD [  "npm", "run", "start:migrate:prod" ]