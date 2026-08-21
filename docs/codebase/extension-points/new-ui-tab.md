# Adding a New UI Tab

The current frontend uses HTML partials under `src/webui/html/tabs/`, ES modules under `src/webui/js/`, and the sidebar markup in `src/webui/index.html`.

## 1. Add markup

Create `src/webui/html/tabs/my_tab_content.html`. Add its Handlebars partial include and matching tab button/content ID in `src/webui/index.html`, following an existing tab. `vite.config.js` already registers both `html/tabs` and `html/partials` as partial directories.

## 2. Add JavaScript

Create a module under `src/webui/js/` and import/initialize it from `src/webui/js/main.js`. Follow the existing sidebar/tab-routing conventions rather than adding inline `onclick` handlers.

Use `fetch()` for request/response APIs. For live updates, attach a named listener to the existing `EventSource` for `/sse/stream`; do not open a second real-time channel unless the backend feature requires one.

## 3. Add a backend endpoint when needed

Route registration is centralized in `EagleEyeInterface._register_routes()` (`src/webui/web_server.py`) with `add_url_rule`. Put a handler in the appropriate `src/webui/web_server_utils/*_mixin.py` mixin (or add a focused mixin), then register it there.

```python
self.app.add_url_rule(
    "/my-endpoint", "my_endpoint", self.my_endpoint_handler, methods=["GET"]
)
```

The production backend is served at `http://<host>:5001`; use relative URLs in frontend code.

## 4. Build

From the repository root:

```bash
npm run build
```

Vite builds from `src/webui` into `src/webui/static/`; Flask serves the generated UI through `/`, `/js/main.js`, `/style.css`, and `/assets/<path>`. A running production backend may need its static files refreshed/restarted according to deployment practice; `npm run dev` is for frontend development.
