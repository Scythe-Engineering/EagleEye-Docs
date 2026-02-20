# WebUI Frontend

The frontend is a Vite-bundled ES6 application with Handlebars HTML templating and Tailwind CSS v4. All source lives under `src/webui/`.

## Build pipeline

```bash
cd src/webui
npm install          # installs Vite, Handlebars plugin, Tailwind, CodeMirror, Three.js, etc.
npm run build        # produces js/main.js and style.css
```

The Vite config uses `vite-plugin-handlebars` to compile `.hbs` partials into the final HTML, and `@tailwindcss/vite` for Tailwind v4. The rolldown bundler (Vite's Rust-based bundler) is used for faster production builds.

## Directory layout

```
src/webui/
├── index.hbs                  # Root Handlebars template
├── partials/                  # HBS partials (one per tab)
│   ├── views.hbs              # Camera feeds tab
│   ├── three-view.hbs         # 3D visualization tab
│   ├── pipeline-editor.hbs    # DAG pipeline editor tab
│   ├── system.hbs             # System resource monitor tab
│   ├── settings.hbs           # Settings/NT address tab
│   ├── utils.hbs              # Camera calibration tab
│   └── custom-ops.hbs         # Custom operations editor tab
├── js/
│   ├── main.js                # Vite entry point
│   ├── init3DView.js          # Three.js field + robot setup
│   ├── pipeline/              # Pipeline editor (DAG drag/drop)
│   ├── settings/              # Settings UI
│   ├── feeds/                 # Camera MJPEG feed management
│   ├── ui/                    # Shared UI components (notifications, sidebar)
│   └── dropdown/              # Dropdown component
├── css/
│   ├── sidebar.css            # Sidebar and tab navigation styles
│   ├── camera.css             # Camera feed card styles
│   └── terminal.css           # Log terminal styles
├── assets/
│   ├── no_image.png           # Placeholder for unavailable feeds
│   ├── favicon.ico
│   ├── apriltags/             # Tag ID reference PNGs
│   └── robots/                # 3D robot model files (GLTF/Draco)
└── web_server_utils/
    ├── serve_static_files.py  # Flask static helpers
    └── drako_loader/          # Draco decompressor JS assets
```

## Key JS modules

| Module | Role |
|---|---|
| `main.js` | Entry; initializes SSE connection, tab routing, all sub-modules |
| `init3DView.js` | Three.js scene: FRC field mesh, robot model, pose updates from SSE |
| `pipeline/` | DAG editor: node rendering, drag, port connections, config panel, profiling overlay |
| `feeds/` | MJPEG `<img>` management per camera; falls back to no-image placeholder |
| `settings/` | NetworkTables address form, restart button, restart-required banner |
| `ui/` | Toast notifications, sidebar state, log terminal |

## Third-party libraries

| Library | Use |
|---|---|
| [Three.js](https://threejs.org/) | 3D field and robot visualization |
| [CodeMirror 6](https://codemirror.net/) | In-browser Python editor (Custom Ops tab) |
| Tailwind CSS v4 | Utility-first styling |
| Handlebars | HTML templating (compiled at build time) |

## SSE integration

`main.js` opens an `EventSource` to `/sse/stream` and dispatches named events to the relevant modules:

```js
const es = new EventSource('/sse/stream');
es.addEventListener('system_status', e => systemModule.update(JSON.parse(e.data)));
es.addEventListener('pipeline_error', e => pipelineModule.showError(JSON.parse(e.data)));
es.addEventListener('pipeline_profile', e => pipelineModule.updateProfiling(JSON.parse(e.data)));
es.addEventListener('log_update', e => terminal.append(JSON.parse(e.data)));
```
