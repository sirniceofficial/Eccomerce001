# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Deploying this repository to Vercel with Supabase

For the Vite app at the repository root, use `npm run build` as the build command and `dist` as the output directory. In Vercel, set these environment variables for Production (and Preview if needed):

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

Use the URL and publishable key from the same Supabase project referenced by `supabase/config.toml`. The Vite app does not read `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Save the variables and redeploy because Vite embeds them at build time. Never expose a Supabase secret or database password in a `VITE_` variable.

Apply the migrations in `supabase/migrations` and deploy the functions in `supabase/functions` to that same Supabase project. The `ai-recommendations` function also requires the server-side `LOVABLE_API_KEY` Supabase secret; without it, recommendations are unavailable. Do not add this key to Vercel frontend variables.

This repository is configured for Supabase project `pmydkqawndyttdapnqis`. After authenticating the Supabase CLI and configuring the Edge Function secrets (including a rotated `SUPABASE_SECRET_KEY` and `LOVABLE_API_KEY`), deploy the functions with `npm run functions:deploy`. Apply database migrations separately with the Supabase CLI after confirming the target project.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
