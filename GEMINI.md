# Reach-RS (Rust/Tauri)

Reach-RS is the high-performance desktop implementation of the Reach Matrix client, ported from the original React web application. It leverages Tauri and Rust to provide a native, secure, and resource-efficient chat experience.

## Core Mandates

### Architecture
- **Hybrid Model:** The UI remains React-based (migrated from `reach`), while heavy-duty operations or system-level integrations should be moved to Rust Tauri commands.
- **Matrix Integration:** Currently using `matrix-js-sdk`. Future iterations may explore `matrix-rust-sdk` for core logic.
- **Security:** Prioritize Rust for sensitive operations. Ensure E2EE state is handled securely between the webview and the Rust backend.

### Performance
- Leverage Rust for performance-critical tasks like message parsing, crypto, and local storage.
- Minimize bridge overhead by batching calls between JS and Rust.

### UX & Design
- Maintain the "Discord-like" aesthetic established in the original project.
- Use Tauri's windowing capabilities to enhance the calling interface (e.g., Picture-in-Picture for video calls).

## Tech Stack
- **Backend:** Rust + Tauri v2
- **Frontend:** React 19 + TypeScript + Vite 8
- **Styling:** Tailwind CSS v4
- **State Management:** Zustand
- **Protocol:** Matrix (matrix-js-sdk + Rust WASM Crypto)

## Development Workflow
1. **Frontend:** Located in `ui/`. Run `npm run dev` for hot-reloading.
2. **Backend:** Located in `src-tauri/`. Use `cargo tauri dev` to run the full application.
3. **Synchronization:** Ensure `ui/package.json` and `src-tauri/tauri.conf.json` are kept in sync regarding build paths.

## Project Structure
- `src-tauri/`: Rust logic, Tauri configuration, and system integrations.
- `ui/`: React frontend (migrated from `reach`).
- `ui/src/core/`: Service singletons (bridging to Rust when applicable).
- `ui/src/store/`: Zustand stores.

## Progress Tracking
- [x] Initial port of React frontend to `ui/`.
- [x] Configure Tauri to serve the frontend.
- [x] Bridge basic system notifications to Rust.
- [x] Implement native window controls (Rust backend + UI component).
- [ ] Explore `matrix-rust-sdk` integration.

### Feature Roadmap (Parity & Enhancements)
- [ ] Mentions & Autocomplete (High Priority)
- [ ] In-App Device Verification (SAS) (High Priority)
- [ ] Interactive Polls
- [ ] Voice Messages
- [ ] Native Rust-based Search
- [ ] Multi-window support for separate chats
