# JBN - Continue From Here (v1.7.1)

## Current Status
- Frontend: v1.7.1 (Next.js 14, React Three Fiber, Framer Motion)
- Backend: v1.7.0 (Express, Drizzle ORM, PostgreSQL)
- Repo: https://github.com/kkhsigma/japanburiburinetwork

## What's Done
- All code is pushed to GitHub on `main` branch
- Vercel project is connected to the repo with Root Directory set to `frontend`
- Production branch is set to `main`
- Removed broken secret references from `frontend/vercel.json`

## What You Need To Do (Vercel Deploy Fix)

### Step 1: Fix Environment Variables in Vercel
Go to **Vercel Dashboard -> Project Settings -> Environment Variables**

1. **Delete** the existing `NEXT_PUBLIC_API_URL` entry (it has a broken secret reference to `jbn-api-url`)
2. **Create a new** `NEXT_PUBLIC_API_URL` with value: `https://placeholder.com`
   - (Replace later with your real backend URL once backend is deployed)
3. **Delete** the existing `NEXT_PUBLIC_VAPID_PUBLIC_KEY` if it references `jbn-vapid-public-key`
4. **Create a new** `NEXT_PUBLIC_VAPID_PUBLIC_KEY` with value: (leave empty or `""`)

**Important**: You must DELETE and RECREATE the variables, not just edit them, to fully clear the broken secret references.

### Step 2: Trigger Redeploy
- Go to **Deployments** tab in Vercel
- Click **Redeploy** on the latest deployment
- It should now succeed

### Step 3 (Later): Deploy Backend
The backend (Express API) is not deployed yet. To get full functionality:
1. Deploy backend to Railway, Render, or Fly.io
2. Update `NEXT_PUBLIC_API_URL` in Vercel to the real backend URL (e.g. `https://jbn-backend.up.railway.app/api`)

## Project Structure
```
japanburiburinetwork/
  frontend/          <- Vercel deploys from here
    src/
      app/           <- Next.js pages (universe, cannabis)
      components/    <- React components
      data/          <- Static data
    vercel.json      <- Vercel config (secrets removed)
    .env.local       <- Local dev env vars
  backend/           <- Express API (not deployed yet)
    src/
    Dockerfile
```

## Key Pages
- `/` -> Universe page (3D starfield with Three.js)
- `/cannabis` -> Cannabis Intelligence page
- Dashboard with floating substance cards and filters

## Dev Server
```bash
cd frontend
npm run dev
# Opens at http://localhost:3000
```
