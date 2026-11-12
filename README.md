# FacultyForm

Annual Self-Assessment (PBAS) form for JUIT faculty: React + Vite frontend, Express API gateway, PostgreSQL.

## Deploy

```bash
cp .env.example .env
```

Fill in your keys in `.env`, then run one of:

```bash
sh scripts/deploy-free.sh
```

```bash
sh scripts/deploy-aws.sh
```

`deploy-free.sh` uses Cloudflare Pages, Render and Neon, and costs nothing. `deploy-aws.sh` uses S3, CloudFront and App Runner. See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for the one-time account setup.
