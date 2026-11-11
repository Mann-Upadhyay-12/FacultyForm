# Deploying the Faculty Self-Assessment form

Two scripts, same `.env`:

| Script | Frontend | API | Database | Cost |
| --- | --- | --- | --- | --- |
| `scripts/deploy-free.sh` | Cloudflare Pages | Render (free web service) | Neon (free Postgres) | ₹0 |
| `scripts/deploy-aws.sh` | S3 + CloudFront | App Runner (Docker image in ECR) | `DATABASE_URL` (RDS or Neon) | ~US$5–25/month |

Both are POSIX `sh`. On Windows, run them from Git Bash or WSL. Both scripts are safe to run again: they find the resources they created before and update them.

## Free deployment (for testing)

### One-time setup (about 10 minutes, all free, no card needed)

1. **Neon**: sign up at https://neon.tech, create a project, and copy the *pooled* connection string.
2. **Render**: sign up at https://render.com with GitHub. Then:
   - Go to Account settings → API Keys and create a key.
   - If this repo is private, give Render access to it once: New → Web Service → GitHub → allow the repo. You can close the wizard after that; the script creates the service itself.
3. **Cloudflare**: sign up at https://dash.cloudflare.com. Then:
   - Go to My Profile → API Tokens → Create token → Custom token, with the permission **Account · Cloudflare Pages · Edit**.
   - Copy your **Account ID** from the right sidebar of the dashboard.

### Deploy

```bash
cp .env.example .env
```

Fill in section A (`DATABASE_URL`) and section B (`RENDER_API_KEY`, `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`) in `.env`. Commit and push your branch, then run:

```bash
sh scripts/deploy-free.sh
```

The API is built from GitHub, so it uses whatever is pushed on `DEPLOY_BRANCH` (default: your current branch). The frontend is built on your machine.

Options:
- `--frontend-only` redeploys only the frontend.
- `--api-only` redeploys only the API.
- `--yes` skips the "not pushed" prompt.

### Free tier limits

- **Render sleeps after 15 minutes idle.** The first request after that takes about 50 seconds. The form wakes the API as soon as a teacher opens it, so it's usually ready by the time they submit.
- **Neon free tier:** 0.5 GB of storage, which holds tens of thousands of assessments.
- Drafts are always kept in the teacher's browser, so a slow or offline API never loses their work.

## AWS deployment

Needs the [AWS CLI v2](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) and Docker. Fill in section C of `.env` (or use an existing `aws configure` profile), then:

```bash
sh scripts/deploy-aws.sh
```

What it creates (all named after `APP_NAME`):
- **ECR repository** `<app>-api`, holding the API image. Each deploy adds an image tagged with the git commit and time.
- **App Runner service** `<app>-api`, with health checks on `/health` and HTTPS by default.
- **IAM role** `<app>-apprunner-ecr-access`, which lets App Runner pull from ECR.
- **Private S3 bucket**, readable only by CloudFront through Origin Access Control.
- **CloudFront distribution**, using HTTPS and sending all paths to `index.html`.

To move the database to AWS as well:
1. Create an RDS PostgreSQL instance.
2. Set `DATABASE_URL` to it and set `DB_SSL_VERIFY=false`.
3. Re-run the script.

The table is created automatically when the API starts.

The first CloudFront rollout takes 5–15 minutes, and the form URL can return 404 until it finishes.

## Viewing submissions

Every submission is stored in the `faculty_assessments` table. To list them with the admin key from `.env`:

```bash
curl -H "x-admin-key: $ADMIN_API_KEY" "https://<api-url>/api/assessments?year=2025-2026&department=HSS"
```

To fetch one full record:

```bash
curl -H "x-admin-key: $ADMIN_API_KEY" "https://<api-url>/api/assessments/<id>"
```

Without the key, these routes return 401. Anyone can submit a form, but only the admin key can read them back.
