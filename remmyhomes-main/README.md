# Remmy HomesHub

An independent storefront for kitchen, home, and office essentials, built with React, TypeScript, Vite, and Supabase.

## Development

Requirements: Node.js with npm, or Bun.

```sh
npm install
npm run dev
```

## Production hosting

The frontend is a static Vite app and can be deployed to Vercel from this repository:

1. Import the repository into Vercel and keep the defaults: build command `npm run build`, output directory `dist`, and install command `npm install`.
2. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` as Vercel environment variables for Production (and Preview if needed). These are public client settings; never add server secrets with a `VITE_` prefix.
3. Deploy. `vercel.json` routes client-side paths such as `/orders` back to the SPA entry point.
4. Apply the Supabase migrations before deploying the Edge Functions. The storefront catalog migration adds product IDs and stock reservation functions used by checkout.
5. Deploy Supabase Edge Functions separately with `npm run functions:deploy` after authenticating the Supabase CLI. Configure `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`, and `SUPABASE_JWKS_URL` as Supabase Edge Function secrets first; do not use Vercel variables for them.
6. In Supabase Auth URL Configuration, set the deployed Vercel URL as the Site URL and add it to the Redirect URLs allowlist. Enable/configure Google sign-in if the app uses it.
7. Sign in to the admin panel and use **Import existing catalog** on the Products page before opening checkout to customers. This adds the existing storefront products to Supabase; product price and stock changes are then validated against the database.

Do not deploy the root `.env` to Vercel. The file is gitignored; set only the two `VITE_` frontend variables in Vercel and set server-side function values in Supabase.

Set the Supabase project URL and publishable key in `.env`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

The Edge Functions read server-side settings from their Deno runtime environment. For local development, load the root `.env` into that environment with the Supabase CLI:

```sh
npm run functions:serve
```

The file must also define `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`, and `SUPABASE_JWKS_URL`. Supabase CLI injects these values into the local function runtime; `Deno.env.get(...)` is how Edge Functions access them. Do not read `.env` directly from function code: deployed functions do not have access to the local file. Keep secret values server-side, never add a `VITE_` prefix to them, and configure them as Supabase Edge Function secrets before deploying.

Google sign-in must be enabled and configured in the Supabase project's Authentication providers. Add the local and deployed app URLs to the Supabase redirect URL allowlist.

## Checks

```sh
npm run test
npm run lint
npm run build
```

## Supabase

Apply migrations in `supabase/migrations` and deploy the functions in `supabase/functions`. The `shopping-recommendations` function generates suggestions from the signed-in customer's browsing activity without an external AI provider.

Drizzle migration commands use `DATABASE_URL` for the PostgreSQL connection string.
