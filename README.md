# EagleEye Docs

Documentation site for [EagleEye](https://github.com/Scythe-Engineering/EagleEye-Vision-System), the FRC vision system by Scythe Engineering. Published at
<https://scythe-engineering.github.io/EagleEye-Docs/>.

The site has two sections:

- **User Guide** — installing EagleEye, using the web UI, building an AprilTag pipeline, and publishing robot pose to NetworkTables.
- **Developer Docs** — architecture, pipelines, device management, WebUI internals, and extension points.

Built with [Docusaurus](https://docusaurus.io/) 3.9. Requires Node.js 20+.

## Local development

```bash
npm install
npm start
```

## Build

```bash
npm run build
npm run serve
```

`npm run build` generates static content into `build/`.

## Deployment

The site is served from GitHub Pages under the `/EagleEye-Docs/` base path.

```bash
GIT_USER=<your GitHub username> npm run deploy
```

This builds the site and pushes it to the `gh-pages` branch. Use `USE_SSH=true` instead of `GIT_USER` if you authenticate over SSH.
