# Adding a New UI Tab

To add a new tab to the WebUI, you need four things: a Handlebars partial for the HTML, an ES6 JS module, a sidebar entry in the tab navigation, and optionally a new backend API route.

## 1. Create a Handlebars partial

**`src/webui/partials/my-tab.hbs`:**

```handlebars
<div id="my-tab" class="tab-content hidden">
  <div class="p-4">
    <h2 class="text-xl font-semibold mb-4">My Tab</h2>
    <div id="my-tab-content">
      <!-- Tab content here -->
    </div>
  </div>
</div>
```

Register the partial in your Vite/Handlebars config (in `vite.config.js`):

```js
handlebars({
  partialDirectory: resolve(__dirname, 'partials'),
})
```

Include it in `index.hbs`:

```handlebars
{{> my-tab}}
```

## 2. Create a JS module

**`src/webui/js/my-tab/index.js`:**

```js
export function initMyTab() {
  const container = document.getElementById('my-tab-content');

  async function loadData() {
    const res = await fetch('/my-endpoint');
    const data = await res.json();
    render(container, data);
  }

  function render(container, data) {
    container.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
  }

  loadData();
}
```

Import and call `initMyTab()` from `main.js`:

```js
import { initMyTab } from './my-tab/index.js';

// In the initialization block:
initMyTab();
```

## 3. Add a sidebar navigation entry

In the sidebar HTML (inside `index.hbs` or a sidebar partial), add a tab button:

```handlebars
<button
  class="sidebar-tab"
  data-target="my-tab"
  onclick="switchTab('my-tab')"
>
  My Tab
</button>
```

The `switchTab()` function (defined in the shared UI module) shows/hides tab content divs based on the `data-target` attribute.

## 4. Add a backend route (optional)

If your tab needs server-side data, add a route in `web_server.py`:

```python
self.app.add_url_rule(
    "/my-endpoint",
    "my_endpoint",
    self.my_endpoint_handler,
    methods=["GET"],
)
```

```python
def my_endpoint_handler(self) -> tuple[dict, int]:
    return {"data": "hello"}, 200
```

## 5. Rebuild the frontend

```bash
cd src/webui
npm run build
```

The new tab is live after the build completes. No backend restart needed (the Flask server serves the updated static files immediately on the next request).

## Styling notes

- Use Tailwind utility classes for layout and spacing.
- Dark theme colors: background `#1a1a1a`, surface `#242424`, accent `#f9c84a`.
- Custom styles for complex components go in `src/webui/css/`.
