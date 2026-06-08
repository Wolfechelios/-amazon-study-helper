# Modular Audit System

This app includes a drop-in TypeScript audit system for checking project health before builds and releases.

## Commands

```bash
npm run audit:app
npm run audit:routes
npm run audit:ui
npm run audit:security
```

Full reports are written into `artifacts/`.

## Included audits

- `config.required-files` checks for required scripts and environment documentation.
- `routing.empty-values` catches empty select values and hard navigation patterns.
- `ui.black-screen-guards` checks for blank startup paths and missing error-boundary protection.
- `security.secret-scan` catches obvious hard-coded credentials before commit.

## Add a module

Create a new file in `src/audit/modules/`, export it from `src/audit/modules/index.ts`, and register it in `src/audit/index.ts`.
