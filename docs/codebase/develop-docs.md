---
title: Develop the documentation site
---

# Develop the documentation site

The EagleEye documentation site uses Docusaurus 3 and requires Node.js 20 or newer. You only
need Git and Node.js to work on this repository.

## Clone and install

```bash
git clone https://github.com/Scythe-Engineering/EagleEye-Docs.git
cd EagleEye-Docs
npm install
```

Use the branch for the documentation change you are making. `npm install` restores the packages
recorded in `package-lock.json`.

## Run the site

```bash
npm start
```

Docusaurus prints the local address when it finishes compiling. The site normally runs at
`http://localhost:3000/EagleEye-Docs/`.

To view it from another computer on the same network:

```bash
npm start -- --host 0.0.0.0
```

Docusaurus reloads the browser after Markdown, React, CSS, or static-asset changes. User-guide
pages live in `docs/user-guide/`. Developer pages live in `docs/codebase/`. Images and download
assets live in `static/` and are referenced from the site root, for example
`/img/ui-screenshots/example.png` or `/downloads/file.pdf`.

## Build before committing

```bash
npm run build
```

The build writes the static site to `build/` and fails on broken internal links. Do not commit
`build/` output.

## Add or move pages

User-guide navigation is generated from `docs/user-guide/` and uses each page's
`sidebar_position`. Developer navigation is explicit in `sidebars.js`; add a developer page there
when you create it. Keep links relative between Markdown pages, such as
`[Setup](./develop-eagleeye)`.
