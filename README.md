# Acutis Monorepo (split)

This repository previously contained the web app (Next.js), API (ASP.NET Core), and mobile app (React Native). It has now been split into three dedicated repositories:

- Web (Next.js): https://github.com/FrankHealy/acutis.web
- API (ASP.NET Core): https://github.com/FrankHealy/acutis.api
- Mobile (React Native): https://github.com/FrankHealy/acutis.mob

Current state:
- The API and Mobile histories have been preserved in their new repos.
- The Web repo currently contains a working snapshot; a GitHub Action is provided to export full web history.

## Export Web History (optional)
Run the workflow in this repository to export the web-only history and force-push it to `acutis.web`:

1) Add a repo secret `WEB_PUSH_PAT` with write access to `FrankHealy/acutis.web`.
2) Go to Actions → "Export Web History" → Run workflow.

The workflow uses `git-filter-repo` to keep only:
`src/`, `public/`, `types/`, `next.config.ts`, `package.json`, `package-lock.json`, `tsconfig*.json`, `postcss.config.cjs`, `eslint.config.js`, `.env.local*`.

## Local Development (web)
If you are working on the web app in this monorepo snapshot:

```
npm install
npm run dev
```

For API and mobile development, use their dedicated repositories.
