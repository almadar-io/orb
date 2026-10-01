# The app's API server as a container, for Cloud Run: the `container_image` the Terraform that
# Studio exports deploys. The client is static: `pnpm --dir packages/client build` and serve its
# dist/ (that Terraform puts it on Firebase Hosting).
FROM node:22-slim AS build
WORKDIR /app
RUN corepack enable
COPY . .
RUN pnpm install && pnpm --dir packages/server run build

FROM node:22-slim
WORKDIR /app
COPY --from=build /app /app
ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080
CMD ["node", "packages/server/dist/index.js"]
