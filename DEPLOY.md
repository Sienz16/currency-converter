# Deployment Guide

## CI/CD Pipeline

GitHub Actions runs on every push and PR:

- **Type Check** — Validates TypeScript
- **Lint** — Code style checks
- **Build Test** — Ensures app compiles
- **Docker Build Test** — Validates Dockerfile

## Deploy to Dokploy

### Option 1: Dokploy Builds from Git (Recommended)

1. In Dokploy dashboard, create a new application
2. Set **Source Type** to "Git"
3. Connect your GitHub repository
4. Set **Branch** to `main`
5. Set **Port** to `3000`
6. Dokploy will build and deploy automatically on every push

### Option 2: Manual Docker Build

Build and push to your registry:

```bash
# Build
docker build -t your-registry/currency-converter:latest .

# Push
docker push your-registry/currency-converter:latest
```

Then in Dokploy, use "Docker" source type with your image.

## Environment Variables

Set in Dokploy if needed:

- `NODE_ENV=production`
- `PORT=3000`

## Local Development

```bash
# Install dependencies
bun install

# Dev server
bun run dev

# Build for production
bun run build

# Build Docker image locally
docker build -t currency-converter .
docker run -p 3000:3000 currency-converter
```
