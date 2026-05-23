# Mario's Pizza 🍕

Calculadora de receita de massa de pizza napolitana com **poolish** (pré-fermento), em formato PWA instalável.

**URL:** https://pizza.marioeduardo.com.br

## O que faz

A partir de:
- quantidade de pizzas e peso de cada bolinha,
- hidratação total e % de sal,
- % da farinha que vai no poolish,
- temperatura ambiente e tempos de fermentação,

a app calcula:
- a **massa total** (farinha, água, sal, fermento) em baker's percentage,
- a quebra em **duas etapas**: poolish (farinha + água + fermento seco instantâneo) e massa final (resto da farinha + resto da água + sal),
- ajuste automático da quantidade de fermento por **temperatura ambiente** e **tempo do poolish**.

Inclui presets para **Napolitana Clássica** (60% hidratação) e **Contemporânea** (70%). A última receita é salva no `localStorage` e restaurada na próxima visita.

## Stack

- **Runtime:** Node.js + Express (servindo arquivos estáticos na porta 3000)
- **Frontend:** HTML/CSS/JS vanilla, sem build step
- **PWA:** manifest + service worker para instalação no celular e funcionamento offline
- **Persistência:** `localStorage` no dispositivo

## Estrutura

```
.
├── server.js                 # Express servindo public/
├── public/
│   ├── index.html            # UI
│   ├── styles.css
│   ├── app.js                # cálculo da receita + presets + persistência
│   ├── manifest.json         # PWA manifest
│   ├── sw.js                 # service worker
│   └── icons/                # ícones do app (svg + pngs gerados)
├── scripts/
│   └── generate-icons.js     # regenera PNGs a partir de icon.svg (usa sharp via npx)
├── Dockerfile
├── docker-compose.yml
└── deploy.sh
```

Para regenerar os ícones (caso troque o `icon.svg`):

```bash
npx --yes sharp@0.34 node scripts/generate-icons.js
```

---

## 🚀 Quick Start

This repository is set up with automatic deployment to your VPS. Just push code to `main` branch and it deploys automatically!

### Step 1: Clone Repository

```bash
git clone https://github.com/marioeduardo/mariospizza.git
cd mariospizza
```

### Step 2: Connect to Claude Code

1. Open Claude Code
2. Point it to this repository
3. Start building your pizza application!

### Step 3: Deploy

When you're ready:

```bash
git push origin main
```

**Option A: Automatic (Recommended)**
- Push to `main` branch → GitHub Actions automatically deploys to VPS
- The workflow is ready at `.github/workflows/deploy.yml`
- ⚠️ **Note:** First time, you need to configure GitHub Secrets (see below)

**Option B: Manual Deployment**
- Run: `bash deploy.sh` on the VPS
- Or push the `deploy.sh` script to server and execute it

---

## 🔐 GitHub Actions Setup (One-time)

For automatic deployment to work, add these secrets to your GitHub repository:

**Settings → Secrets and variables → Actions → New repository secret**

1. **VPS_HOST**
   - Value: `5.189.155.32`

2. **VPS_PORT**
   - Value: `2222`

3. **VPS_USER**
   - Value: `root`

4. **VPS_SSH_KEY**
   - Value: Your private SSH key from the VPS (ask Mario or use existing key)

Once these are set, the workflow `.github/workflows/deploy.yml` will automatically:
- Clone/update code on push
- Build Docker image
- Start container
- Reload Caddy reverse proxy
- Make it live at pizza.marioeduardo.com.br

---

## 🐳 Docker / Local Development

### Build and Run Locally

```bash
docker-compose up -d
```

### View Logs

```bash
docker-compose logs -f mariospizza_app
```

### Stop

```bash
docker-compose down
```

### Health Check

```bash
curl http://localhost:3000
```

---

## 📁 Project Structure

```
.
├── src/                      # Your application code
├── Dockerfile                # Container definition
├── docker-compose.yml        # Local/prod config
├── package.json              # Dependencies
├── deploy.sh                 # Manual deployment script
├── README.md                 # This file
└── .github/workflows/
    └── deploy.yml            # GitHub Actions (auto-deploy)
```

---

## 🛠️ Development Workflow

1. **Clone repo locally** or work in Cloud IDE
2. **Add your code** in `src/` or root directory
3. **Test locally** with `docker-compose up`
4. **Commit and push** to `main`
5. **GitHub Actions** automatically deploys to VPS
6. **Live at** https://pizza.marioeduardo.com.br

---

## 🌐 Access Points

| Environment | URL | Status |
|------------|-----|--------|
| Production | https://pizza.marioeduardo.com.br | ✅ Live |
| Local Dev | http://localhost:3000 | Your machine |
| Container | http://mariospizza_app:3000 | Docker network |

---

## 📝 Environment Variables

For local development, create a `.env` file:

```env
NODE_ENV=development
PORT=3000
```

The application will use the environment variables defined in `docker-compose.yml` for production.

---

## 🚨 Troubleshooting

### Application won't start
```bash
docker-compose logs mariospizza_app
```

### Port already in use
```bash
lsof -i :3000  # Find what's using port 3000
```

### Caddy not routing traffic
```bash
docker exec caddy caddy reload -c /etc/caddy/Caddyfile
```

### Manual deploy on VPS
```bash
cd /opt/stacks/mariospizza
bash deploy.sh
```

---

## 📚 Technology Stack

- **Runtime:** Node.js 20 (Alpine Linux)
- **Container:** Docker
- **Orchestration:** Docker Compose
- **Reverse Proxy:** Caddy (handles HTTPS automatically)
- **CI/CD:** GitHub Actions
- **DNS:** Cloudflare

---

## 🔗 Useful Links

- **Repository:** https://github.com/marioeduardo/mariospizza
- **Production URL:** https://pizza.marioeduardo.com.br
- **VPS IP:** 5.189.155.32
- **Deploy Directory:** `/opt/stacks/mariospizza`

---

## 📞 Support

For issues or questions:
1. Check logs: `docker logs mariospizza_app`
2. Check Caddy: `docker exec caddy caddy version`
3. Verify DNS: `nslookup pizza.marioeduardo.com.br`

---

**Created:** May 22, 2026  
**Type:** Full-stack Node.js Application  
**Deployment:** Automatic via GitHub Actions + Caddy
# Deployment test 1779507757
# Deploy fix 1779507817
