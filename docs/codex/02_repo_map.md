# 02_repo_map.md

## Repository map based on the current main branch

### Root
- `public/`
- `src/`
- `.gitignore`
- `README.md`
- `eslint.config.js`
- `index.html`
- `package-lock.json`
- `package.json`
- `vite.config.js`

### `src/`
- `components/`
- `pages/`
- `App.jsx`
- `index.css`
- `main.jsx`

### `src/pages/`
- `AdminPanel.jsx`
- `Dashboard.jsx`
- `Results.jsx`
- `TestRunner.jsx`
- `Tests.jsx`
- `login.jsx`

## Observed frontend state
- React app already exists
- routing already exists
- layout/sidebar/header already exist
- current pages already render demo content
- styles already define the visual language

## Existing design language to preserve
- dark sidebar
- white header/content cards
- indigo primary accent
- rounded elements
- lightweight dashboard/admin/test UI

## Important technical note
There is likely a case-sensitivity inconsistency:
- `App.jsx` imports `./pages/Login`
- the file present in the tree is `login.jsx`

This may work on Windows but fail in Linux/cloud environments.
This should be corrected early.
