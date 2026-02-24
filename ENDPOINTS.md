# Backend API Endpoints

Backend uses **MongoDB only** (orders, contacts, analyses). No PostgreSQL.

| Method | Endpoint | Purpose | Requires |
|--------|----------|---------|----------|
| GET | `/health` | Health + MongoDB status | Nothing (always works) |
| POST | `/api/auth/login` | Admin login | `ADMIN_EMAIL`, `ADMIN_PASSWORD` (or defaults) |
| POST | `/api/book` | Create booking | **MongoDB** (`MONGO_URI`) |
| POST | `/api/contact` | Contact form | **MongoDB** (`MONGO_URI`) |
| GET | `/api/admin/orders` | List appointments | **Admin token** (Bearer) + **MongoDB** |
| PATCH | `/api/admin/orders/:id` | Update order status | **Admin token** + **MongoDB** |
| DELETE | `/api/admin/orders/:id` | Delete order (if complete) | **Admin token** + **MongoDB** |
| GET | `/api/admin/contacts` | List contact submissions | **Admin token** + **MongoDB** |
| POST | `/api/analyze` | Face analysis | **AI service** (`AI_SERVICE_URL`) + **MongoDB** (optional save) |
| GET | `/api/tryon/status` | Try-on availability | **AI service** |
| POST | `/api/tryon` | Generate try-on image | **AI service** + image upload |
| GET | `/api/hairstyle-preview/:style` | Hairstyle preview image | **AI service** |

## For all endpoints to work

1. **Backend** – Running (e.g. `npm run dev`).
2. **MongoDB** – Set `MONGO_URI` in `.env` for: book, contact, admin orders, admin contacts, and optional analysis storage.
3. **AI service** – Running at `AI_SERVICE_URL` (default `http://localhost:8000`) for: analyze, tryon, hairstyle-preview.
4. **Admin auth** – Set `ADMIN_EMAIL`, `ADMIN_PASSWORD` (and optionally `ADMIN_SECRET`) for login and admin routes.

## Quick check

```bash
# Health (MongoDB status)
curl -s http://localhost:5000/health

# Login (works with default or env)
curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin"}'
```
