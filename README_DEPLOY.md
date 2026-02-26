Deployment to Vercel
===================

Quick steps to deploy the frontend on Vercel (recommended):

- Build locally (optional check):

```bash
cd frontend/Task-Manager
npm install
npm run build
```

- Using the root helper scripts (runs install + build):

```bash
cd ..
npm run build:frontend
```

- Deploy via Vercel (CLI):

```bash
npm i -g vercel
vercel login
vercel --prod
```

- Or connect the GitHub repo in the Vercel Dashboard and point the Project's Root to `/` and set the Build Command to `npm run build:frontend` and the Output Directory to `frontend/Task-Manager/dist`.

Notes
- The repository uses a monorepo layout. `vercel.json` and `.vercelignore` are present to instruct Vercel to build only the Vite frontend.
- If you prefer to deploy the backend, host it separately (Render/Heroku/Azure) or convert endpoints to Vercel Serverless Functions.
