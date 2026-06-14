FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

RUN npm ci --only=production && npm cache clean --force

RUN mkdir -p /app/data

EXPOSE 4444

CMD ["node", "dist/index.js"]