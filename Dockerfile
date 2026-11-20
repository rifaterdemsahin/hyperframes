FROM node:20-alpine

WORKDIR /app

# Copy application files
COPY . .

ENV PORT=8080
ENV NODE_ENV=production

EXPOSE 8080

CMD ["node", "server.mjs"]
