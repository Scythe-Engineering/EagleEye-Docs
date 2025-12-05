# WebUI Frontend

Client-side code lives under `src/webui/js/`, with templates in `src/webui/html/` and styles in `src/webui/css/`. Three.js powers 3D visuals; Tailwind-style utilities are used in CSS.

## Structure (partial)
```
src/webui/
├── index.html
├── js/
│   ├── main.js          # entry point
│   ├── init3DView.js    # Three.js setup
│   ├── pipeline/        # pipeline editor logic
│   ├── settings/        # settings UI
│   ├── ui/              # shared UI components
│   ├── feeds/           # camera feed handling
│   └── dropdown/        # dropdown helpers
├── css/                 # component styles (sidebar, camera, terminal)
├── assets/              # robots, fields, apriltags, images
└── web_server_utils/
```

## Behaviors
- Pipeline editor: drag/reorder operations; saves automatically and shows restart state.
- Camera feeds: renders MJPEG streams; supports multiple cameras.
- 3D view: robot + field visualization via Three.js.
- Notifications: backend state warnings animate to draw attention.

## Styling cues
- Dark theme with gold accent (`#f9c84a`) to match the frontend palette.
- Scrollbars and notification animations customized in CSS (`sidebar.css`, `camera.css`, `terminal.css`).

## Build
- Some features require a frontend build step (`npm run build`) before serving from Flask.



