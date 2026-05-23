# MariosPizza

Pizza delivery platform

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Development
npm run dev

# Production
npm start
```

## 🐳 Docker

```bash
# Build and run
docker-compose up -d

# View logs
docker-compose logs -f mariospizza_app

# Stop
docker-compose down
```

## 🔗 Access

- **Production URL:** https://pizza.marioeduardo.com.br
- **Local Development:** http://localhost:3000

## 📝 Deployment

Deployment is automatic on push to `main`, `master`, or `develop` branches via GitHub Actions.

The workflow:
1. Clones the latest code to `/opt/stacks/mariospizza`
2. Builds Docker image
3. Starts container on VPS
4. Reloads Caddy reverse proxy
5. Application is live at pizza.marioeduardo.com.br

## 📚 Tech Stack

- Node.js 20 (Alpine)
- Docker & Docker Compose
- GitHub Actions CI/CD
- Caddy reverse proxy

## 🛠️ Environment Variables

Create a `.env` file for local development:

```env
NODE_ENV=development
PORT=3000
```

## 📖 Project Structure

```
.
├── Dockerfile              # Container definition
├── docker-compose.yml      # Local/prod container config
├── package.json            # Dependencies
├── .github/
│   └── workflows/
│       └── deploy.yml      # Auto-deploy pipeline
└── src/                    # Application source (add as needed)
```

---

**Created:** May 22, 2026  
**Author:** Mario Eduardo
