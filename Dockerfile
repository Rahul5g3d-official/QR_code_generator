FROM node:22-bookworm-slim AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build
RUN npm prune --omit=dev

FROM node:22-bookworm-slim AS runtime

ENV NODE_ENV=production \
    PORT=7860 \
    HOME=/home/user \
    PATH=/home/user/.local/bin:$PATH

RUN useradd -m -u 1000 user

WORKDIR /home/user/app

COPY --from=build --chown=user:user /app/package*.json ./
COPY --from=build --chown=user:user /app/node_modules ./node_modules
COPY --from=build --chown=user:user /app/backend ./backend
COPY --from=build --chown=user:user /app/dist ./dist
COPY --from=build --chown=user:user /app/supabase ./supabase
COPY --from=build --chown=user:user /app/README.md ./README.md

USER user

EXPOSE 7860

CMD ["npm", "start"]
