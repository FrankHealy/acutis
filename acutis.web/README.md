# Acutis Web

## Development

Run the web app locally from `acutis.web`:

```bash
npm run dev
```

## Production Notes

Media binaries are not meant to live in git.

- Audio/video files under `media/` are ignored and should be restored using the existing download scripts, manifests, and seed files.
- Keep `*.ps1`, `*.json`, and manifest/list files in git so production environments can rehydrate media as part of setup.
- If a push is unexpectedly large, check whether historical commits still contain older media blobs even if the current index does not.

## Tooling Note

The lint script runs ESLint from local `node_modules` directly. This was done to avoid sandbox-specific global `npm` path issues and should not affect production runtime behavior.
