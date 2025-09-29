# HealthSync Hospital – Backend API

TypeScript + Express API that powers the HealthSync Hospital platform. It exposes authentication, patient management, appointments, payments, medicine catalog, blood bank workflows, and more. The service connects to MongoDB, integrates with Stripe, and provides utilities for media storage via Cloudinary and transactional email.

## Tech Stack

- **Runtime:** Node.js 18+ (Bun optional for dev hot reload)
- **Framework:** Express 5 with TypeScript
- **Database:** MongoDB via Mongoose
- **Auth:** JWT access/refresh tokens (with optional OTP & password reset tokens)
- **Payments:** Stripe (with placeholders for SSLCommerz & ShurjoPay)
- **Uploads:** Cloudinary (Multer storage adapter)

## Prerequisites

- Node.js ≥ 18
- npm (or bun) installed locally
- MongoDB connection string
- Stripe account (secret key)
- Cloudinary account (if you plan to allow media uploads)

## Installation

```bash
# clone if you haven’t already
# git clone <repo-url>

cd HealthSyncHospitalServer
npm install
```

> The project ships with `npm` lockfiles. If you prefer Bun, run `bun install` instead.

## Environment Configuration

Create a `.env` file in the project root. Below is a complete list of keys referenced by the codebase—omit the ones you do not need, but **the required values must be present**.

```bash
# Core
NODE_ENV=development
PORT=5000
DB_URL=mongodb+srv://<user>:<password>@cluster-url/db-name
BCRYPT_SALT_ROUNDS=12

# JWTs (use strong, unique values)
JWT_ACCESS_SECRET=...
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_SECRET=...
JWT_REFRESH_EXPIRES_IN=7d
JWT_OTP_SECRET=...
JWT_PASS_RESET_SECRET=...
JWT_PASS_RESET_EXPIRES_IN=10m

# Admin bootstrap (seed user)
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=ChangeMe123!
ADMIN_PROFILE_PHOTO=https://...
ADMIN_MOBILE_NUMBER=+8801...

# Cloudinary (optional if image uploads are disabled)
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# Email sender (used for notifications)
SENDER_EMAIL=no-reply@example.com
SENDER_APP_PASS=app-specific-password

# Stripe
STRIPE_SECRET_KEY=sk_test_...

# Frontend base (for CORS, redirects, emails)
NEXT_BASE_URL=http://localhost:3000
```

If you enable the ShurjoPay or SSLCommerz integrations in the future, uncomment the relevant config values in `src/app/config/index.ts` and populate their environment variables.

## Running the Server

### Development

The project includes a Bun-powered hot reload script. Use it if you have Bun installed:

```bash
bun run dev   # runs bun --hot src/server.ts
```

If you prefer pure Node.js:

```bash
npx ts-node-dev --respawn src/server.ts
```

(Alternatively, create your own script in `package.json`.)

### Production Build

```bash
npm run build   # transpiles TypeScript to dist/
npm run start   # starts dist/server.js with Node
```

The compiled server reads the same `.env` file.

## Useful Scripts

| Command                 | Description                                      |
|-------------------------|--------------------------------------------------|
| `npm run dev` / `bun run dev` | Hot-reload development server (requires Bun) |
| `npm run build`         | Compile TypeScript into `dist/`                  |
| `npm run start`         | Run compiled JS with Node                        |
| `npm run create-module` | Generate a module scaffold (ts-node script)      |

## Database Seeding

The project ships with a seeding utility (`src/app/DB/seed`). It is currently commented out in `src/server.ts`. If you need the default admin and sample data:

1. Uncomment `//await seed();` inside `bootstrap()`.
2. Run the server once.
3. Comment the line again to avoid duplicate inserts.

## API Base URL & CORS

The app listens on the port defined by `PORT`. Ensure your frontend uses the same origin (default `http://localhost:5000`). RTK Query in the frontend is preconfigured for `/api/v1`.

If you deploy the frontend to a different host, update CORS settings in `src/app/app.ts` (`cors({ origin: "http://localhost:3000", credentials: true })`).

## Stripe Webhooks

Stripe checkout sessions are created by `POST /payment/create-checkout-session`. Configure your webhook endpoint on Stripe to call the corresponding backend route (see `src/app/modules/payment`). Remember to use the same secret key across environments.

## Troubleshooting

- **Database connection fails** – verify `DB_URL` and that your IP address has access to the cluster.
- **401/403 responses** – make sure the frontend shares cookies and that JWT secrets match the ones used by Next.js middleware.
- **Uploads fail** – confirm Cloudinary credentials and that the folder exists.
- **Stripe errors** – ensure `STRIPE_SECRET_KEY` is set and the publishable key matches on the frontend.

## Project Structure

```
HealthSyncHospitalServer/
├── src/
│   ├── app/
│   │   ├── modules/        # Feature modules (auth, patient, payments, etc.)
│   │   ├── middleware/     # Global middleware and error handling
│   │   ├── utils/          # Helpers (cloudinary config, catchAsync, etc.)
│   │   └── routes/         # Aggregated route registrations
│   ├── app.ts              # Express app configuration
│   └── server.ts           # Bootstrap & database connection
├── package.json
├── tsconfig.json
└── README.md
```

## Contributing / Extending

- Add new modules via `npm run create-module`.
- Follow the established folder structure (`module/controller.ts`, `module/service.ts`, etc.).
- Update the OpenAPI documentation (if you maintain one) when endpoints change.
- Run `npm run build` locally before pushing to ensure type safety.

---

See the [frontend README](../health-sync-hospital-frontend/README.md) for instructions on running the Next.js client that consumes this API.
