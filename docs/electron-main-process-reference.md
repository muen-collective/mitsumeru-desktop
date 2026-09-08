# Electron main-process reference

Absorbed from the Electron docs (`app`, `BrowserWindow`, `Security`, `Process Model`).
Use this as the checklist for every Electron change in this repo. Verdicts below are
the result of auditing `src/main/index.ts`, `src/main/security.ts`,
`src/main/close-to-tray.ts`, and `src/main/launchd-guard.ts`.

---

## 1. Process model

- One **main process** (Node env) — app entry, window/lifecycle control, native APIs.
- One **renderer process per BrowserWindow** — web content, no Node access by default.
- **Preload script** — runs in the renderer before content loads, has Node access,
  but is **context-isolated** from the renderer's main world. Expose APIs only via
  `contextBridge.exposeInMainWorld`.

### Verdict ✅
Every `BrowserWindow` / `WebContentsView` uses:
```ts
webPreferences: {
  contextIsolation: true,
  nodeIntegration: false,
  preload: join(import.meta.dirname, '../preload/index.cjs'),
  sandbox: true,
  webSecurity: true
}
```
This matches the security guidance exactly (no Node integration + context isolation + sandbox).

---

## 2. App lifecycle (the `app` module)

### Events to wire

| Event | Purpose | Our status |
|-------|---------|-----------|
| `ready` / `whenReady()` | Do main-process init after Electron is ready | ✅ `app.whenReady().then(bootstrap)` |
| `activate` (macOS) | Re-open/re-show when dock icon clicked | ✅ handled (re-shows or launches harness) |
| `window-all-closed` | Quit on non-mac; keep alive on mac | ✅ `if (process.platform !== 'darwin') app.quit()` |
| `before-quit` | Clean shutdown before closing windows | ✅ `preventDefault`, flush storage, stop runtime/mobile, then `app.quit()` |
| `second-instance` (single instance) | Focus the running app | ✅ guarded by `isUserInitiatedInstance` |
| `child-process-gone` | React to spawned child crashes | ✅ logged / handled |

### Single-instance lock
✅ `app.requestSingleInstanceLock()`; if not acquired → `app.quit()`. `second-instance`
handler re-raises the running window. Correct pattern.

### Quit-on-close nuance
`window-all-closed` quits on non-macOS. On Windows there is a **tray** and
`shouldKeepRunningInBackground('win32', quitting)` keeps the app alive on window
close (window hides instead of destroying). This is a deliberate design choice —
not contradicting the default, because `before-quit` still destroys the tray and
flushes storage on a real quit. ✅

### Note on `will-quit` / `quit`
`before-quit` is the cleanup hook (already used). `will-quit`/`quit` are not
strictly required because `before-quit` covers the shutdown path. Fine.

---

## 3. Window creation (BrowserWindow)

Recommended to avoid a visual flash:
- `show: false` + `once('ready-to-show', () => win.show())`, **or**
- `show` immediately + a `backgroundColor` close to the app background.

### Verdict ✅
Windows are created with `show: false` and `backgroundColor` set to the app theme
(`#141416` dark / `#f8f8f6` light). The app opens the splash first, then swaps the
main window to the harness URL. The `backgroundColor` avoids a white flash.

`frame: process.platform !== 'darwin'`; macOS uses native traffic lights and
`setWindowButtonPosition`. Windows uses a hidden title bar with `autoHideMenuBar`.
All correct per platform.

---

## 4. Security checklist

Electron's security guidance (we satisfy all of these):
- ✅ `contextIsolation: true` in every renderer / view.
- ✅ `nodeIntegration: false` everywhere.
- ✅ `sandbox: true` everywhere.
- ✅ `webSecurity: true` (never disabled).
- ✅ `setWindowOpenHandler(() => ({ action: 'deny' }))` (no new windows).
- ✅ `will-navigate` blocked / allowed only for the harness origin.
- ✅ `setPermissionRequestHandler` restricted in the session.
- ✅ No `<webview allowpopups>`; no `allowRunningInsecureContent`; no experimental blink features.
- ✅ Content-Security-Policy present in the recovery / safe-mode HTML (`default-src 'none'`).

### IPC
- ✅ Renderer/`ipcRenderer.invoke` → `ipcMain.handle`. Sender origin validated
  (`event.senderFrame === mainWindow.webContents.mainFrame`) for privileged routes.

### One area to keep an eye on
- Preloads (`index.cjs`, `windows-menu.cjs`) bridge a small, explicit API. Keep the
  surface narrow and re-audit after adding any new exposed method (see
  `contextBridge` discipline — nothing is attached directly to `window`).

---

## 5. Renderer loss / recovery

The main process tracks `render-process-gone`, `did-fail-load`, and `unresponsive`
on the main window and auto-reloads after a renderer loss. This is a strong,
proactive resilience pattern (matches the "keep the app alive" ethos).

---

## 6. Diagnostic / error surface

- `showUnexpectedError` → native error box.
- `showPluginRecovery` → recovery page (already fixed to render parseable JS).
- Startup harness failure → native dialog with **Open Log / Safe Mode / Quit**.

Good separation: crash/channel errors surface to the user; plugin problems route to
the recovery flow.

---

## 7. macOS specifics to keep correct

- `open-file` / `open-url` (macOS) should be registered **early** (before `ready`)
  to catch dock/URL launches. We do not currently handle `open-file`/`open-url`.
  If Mitsumeru should open files or deep links on launch, add early listeners
  calling `event.preventDefault()`.
- `activate` already handled.
- `did-become-active` / `did-resign-active` not needed for current features.

---

## 8. Checklist before shipping an Electron change

1. New renderer? Set `contextIsolation:true`, `nodeIntegration:false`, `sandbox:true`.
2. New privileged API? Expose via `contextBridge.exposeInMainWorld`, validate sender.
3. New window? `show:false` + `backgroundColor`, `setWindowOpenHandler` deny.
4. New session/remote content? Restrict permissions, channel policy, CSP.
5. Shutdown cleanup? Do it in `before-quit`, then `app.quit()`.
6. Avoid white flash: set `backgroundColor` always.
7. Keep Node out of any renderer that touches untrusted content.
