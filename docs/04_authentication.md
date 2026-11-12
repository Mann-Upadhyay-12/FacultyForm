# Authentication

Teachers must sign up / log in before they can open the assessment form.

## How it works

- **Where:** implemented directly in the API gateway (`api-gateway/src/auth.js`, `src/routes/auth.js`), backed by the same PostgreSQL database (`DATABASE_URL`). Tables are created/updated automatically on boot (`src/db.js`, idempotent). Without a database, login answers 503 rather than letting anyone in.
- **Passwords:** hashed with scrypt + a random per-user salt. Plain passwords are never stored or logged.
- **Sessions:** on login the server issues a random 256-bit token. Only its SHA-256 is stored in `user_sessions`, so a database leak doesn't expose usable sessions. The browser keeps the token in `localStorage` and sends it as `Authorization: Bearer …`.
  - Default lifetime is 30 days (`SESSION_TTL_DAYS`), extended while the account is in use. Log Out deletes the session server-side.
  - Bearer tokens rather than cookies because the frontend (Cloudflare Pages / CloudFront) and API (Render / App Runner) are on different domains, where browsers such as Safari block cross-site cookies.
- **Identity:** one account per email (case-insensitive, unique). The assessment is stored per `(user_id, academic_year)`, so re-submitting updates the same record and no duplicate users or assessments are created. The owner always comes from the session, never from the request body.
- **Drafts:** still auto-saved in the browser (now per account), and sent to the account on Save Draft / Ctrl+S, on submit, and on log out. On login the account's saved copy is restored unless the browser holds newer edits.
- **Older submissions:** rows submitted before accounts existed keep `user_id = NULL`. They stay visible to admins but aren't linked to any account.
- **Roles:** every sign-up gets `role = 'faculty'`. There is no admin sign-up.

## API

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/api/auth/register` | – | `{email, password}` → `{token, user}` (409 `EMAIL_TAKEN` if it exists) |
| POST | `/api/auth/login` | – | `{email, password}` → `{token, user}` (401 `INVALID_CREDENTIALS`) |
| GET | `/api/auth/me` | ✓ | current user (401 `SESSION_EXPIRED` / `SESSION_INVALID`) |
| POST | `/api/auth/logout` | ✓ | revoke current session |
| GET / PUT | `/api/assessments/me` | ✓ | load / save draft of own assessment |
| POST | `/api/assessments` | ✓ | final submission |
| GET | `/api/assessments` | admin | list all assessments (`?year=&department=`) |
| GET | `/api/assessments/:id` | admin | one full assessment |

"Admin" means the `x-admin-key` header matching `ADMIN_API_KEY` (as before), or a logged-in account with `role = 'admin'`.

Login and register allow 30 **failed** attempts per IP per 15 minutes. Successful logins don't count, so a whole campus behind one IP isn't locked out.

## Managing admins (SQL)

```sql
UPDATE users SET role = 'admin' WHERE email = 'someone@juit.ac.in';
UPDATE users SET role = 'faculty' WHERE email = 'someone@juit.ac.in';
-- force-logout a user everywhere
DELETE FROM user_sessions WHERE user_id = (SELECT user_id FROM users WHERE email = 'someone@juit.ac.in');
```
