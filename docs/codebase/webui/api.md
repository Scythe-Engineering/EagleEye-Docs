# WebUI API Surface

REST/SSE endpoints power pipeline edits, settings, and telemetry. Refer to `src/webui/API_DOCUMENTATION.md` and `src/webui/API_ENDPOINTS_SUMMARY.md` for the full list.

## Typical endpoints (summary)
- `GET /api/pipelines` — list pipelines and operations.
- `POST /api/pipelines` — save pipeline structure/params (auto-creates camera entries).
- `GET /api/settings` / `POST /api/settings` — settings persistence.
- `GET /api/state` — backend restart/state info (polled by frontend).
- `GET /stream/<camera>` — MJPEG camera feed.

## Error handling
- Pipeline errors are documented in `PIPELINE_ERROR_HANDLING.md`; UI shows restart prompts and warnings.
- Backend emits state flags that the frontend uses to display warnings/indicators.

## Notes
- CORS configured for local dev; adjust for self-hosted/tunneled setups.
- Ensure authentication/network rules are set if exposing beyond localhost.



