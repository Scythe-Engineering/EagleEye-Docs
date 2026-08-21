# WebUI Frontend

The frontend is a Vite-bundled ES module application with Handlebars HTML templating and Tailwind CSS v4. Source lives under `src/webui/`, but the Vite project is rooted at the repository root: `vite.config.js`, `package.json`, and `node_modules/` are all top-level.

## Build pipeline

```bash
npm install          # from the repository root
npm run build        # vite build --debug
npm run dev          # vite dev server, host 0.0.0.0
npm run watch        # vite build --watch
```

`vite.config.js` sets `root` to `src/webui` and `build.outDir` to `src/webui/static`, with `emptyOutDir: true`. Entry points are `src/webui/js/main.js` and `src/webui/index.html`; output file names are forced to `bundle.js` (entry and chunks) plus `[name].[ext]` for assets, minified with `rolldown`. `vite-plugin-handlebars` registers `src/webui/html/tabs` and `src/webui/html/partials` as partial directories, and `@tailwindcss/vite` handles Tailwind v4. Three.js and its `OrbitControls`, `GLTFLoader`, and `DRACOLoader` examples are aliased explicitly.

Flask serves the built files at `/js/main.js`, `/style.css`, `/assets/<path>`, and `/`.

## Directory layout

```
src/webui/
├── index.html                 # Root template (Handlebars partials inlined at build)
├── html/
│   ├── tabs/                  # One partial per tab
│   │   ├── camera_views_tab_content.html
│   │   ├── 3d_tab_content.html
│   │   ├── pipeline_tab_content.html
│   │   ├── system_status_tab_content.html
│   │   ├── settings_tab_content.html
│   │   └── utils_tab_content.html
│   └── partials/              # Shared markup fragments
├── js/
│   ├── main.js                # Vite entry point
│   ├── config.js
│   ├── init3DView.js          # Three.js field + robot setup
│   ├── pipeline/              # DAG editor, model library and MX3 modals
│   ├── settings/              # Settings, network manager, terminal, updates, assets
│   ├── system/                # System status view
│   ├── feeds/                 # Camera MJPEG feed management
│   ├── camera-config/         # Calibration and extrinsics UI
│   ├── dropdown/              # Robot and field dropdowns
│   ├── ui/                    # Shared components (modal, toast, sidebar, tooltip, ...)
│   └── utils/                 # Camera config helpers, field-space transforms
├── css/
├── assets/                    # background.webp, favicon.ico, no_image.png, apriltags/, robots/, fields/
├── public/
├── generated_assets/
├── static/                    # Build output (bundle.js, main.css)
└── web_server_utils/
    ├── serve_static_files.py  # Flask static helpers
    └── drako_loader/          # Draco decoder assets
```

## Key JS modules

| Module | Role |
|---|---|
| `main.js` | Entry; opens the SSE connection, wires tab routing and sub-modules |
| `init3DView.js` | Three.js scene: field mesh, robot model, pose updates from SSE |
| `pipeline/` | DAG editor: node rendering, drag/drop, connections, minimap, history, config popups, profiling overlay |
| `pipeline/modelLibraryModal.js`, `mx3CompilationModal.js` | Model library management and MX3 compilation UI |
| `feeds/cameraFeedHandlers.js` | MJPEG `<img>` management per camera, with the no-image placeholder |
| `camera-config/` | Calibration capture flow and extrinsics editing |
| `settings/` | NT address, Wi-Fi, terminal, system update, robot/field/test-video asset management |
| `system/systemStatus.js` | Renders the `system_status` event |
| `ui/` | Modals, toasts, sidebar, connection status, upload progress |

## Third-party libraries

| Library | Use |
|---|---|
| [Three.js](https://threejs.org/) | 3D field and robot visualization |
| Tailwind CSS v4 | Styling |
| Handlebars (`vite-plugin-handlebars`) | HTML partials, compiled at build time |
| `socket.io-client` | Present as a dependency; live UI updates use SSE |

## SSE integration

`main.js` opens an `EventSource` to `/sse/stream` and dispatches named events to the relevant modules, for example:

```js
const es = new EventSource('/sse/stream');
es.addEventListener('system_status', e => systemStatus.update(JSON.parse(e.data)));
es.addEventListener('pipeline_operation_errors', e => pipeline.showErrors(JSON.parse(e.data)));
es.addEventListener('profiling_update', e => pipeline.updateProfiling(JSON.parse(e.data)));
es.addEventListener('log_update', e => terminal.append(JSON.parse(e.data)));
```

The full event list is in [SSE & Real-time](../architecture/sse-realtime).
