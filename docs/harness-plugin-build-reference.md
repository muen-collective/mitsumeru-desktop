# Harness plugin build reference

Absorbed from the DeepSeek Harness docs (`docs/user/develop/{basic,framework}`).
Use this as the canonical checklist for every plugin we author or fork.

---

## 1. A plugin is a module that exports `apply`

```ts
import type { Context } from '@deepseek-ai/cordis'

export const name = 'my-plugin'
export function apply(ctx: Context) {
  // Register capabilities here.
}
```

The framework calls `apply(ctx)` when loading. `ctx` is where you register
capabilities (tools, services, events, timers).

### Three forms
- **Function** — `export function apply(ctx)` — enough for most plugins.
- **Object** — `export default { name, inject, apply }`.
- **Class** — `export default class extends Service` — only when the plugin
  *provides* a service to other plugins.

---

## 2. Declare dependencies with `inject`

If a plugin consumes another service, declare it so Cordis waits for it:

```ts
export const inject = ['tools']
export function apply(ctx: Context) {
  // ctx.tools is guaranteed ready here.
}
```

- **Required** dependency: list it in `inject`. Plugin won't load while absent.
- **Optional** dependency: omit `inject`, query at call time with `ctx.get()`.

If a required service disappears at runtime, dependent plugins dispose
automatically and reload when it returns.

---

## 3. Accept configuration (Schemastery schema)

Export a `Config` type AND a same-named Schemastery `Schema`. Put defaults on
the schema fields:

```ts
import type { Context } from '@deepseek-ai/cordis'
import Schema from '@deepseek-ai/schemastery'

export interface Config {
  greeting: string
  maxRetries: number
}

export const Config: Schema<Config> = Schema.object({
  greeting: Schema.string().default('Hello'),
  maxRetries: Schema.number().default(3),
})

export function apply(ctx: Context, config: Config) {
  console.log(config.greeting) // user value or schema default
}
```

Warning: do **not** export a plain object as `Config`. It must implement the
Standard Schema interface or Cordis rejects it.

### Design rules
- **Never hardcode a tunable value.** Anything two deployments may set
  differently must be a config field. The test: can `cordis.yml` change it
  without a code edit?
- **Fail loudly on invalid config.** Self-contained constraints live in the
  schema; anything requiring a service/registered resource uses DI.
- **HMR:** a config edit hot-replaces the plugin. Registrations are effects,
  so the old instance's registrations clean up automatically.

---

## 4. Bundle vs Profile — the two manifests

Two concepts, each with a `package.json` carrying a different `dsh` key:

| Kind | `dsh` key | Answers | Role |
|------|-----------|---------|------|
| **Bundle** | `dsh.bundle` | "What does this package contribute?" (a patch layer) | What you author + distribute |
| **Profile** | `dsh.profile` | "Which bundles compose this setup, in what order?" | What a user boots with `dsh --profile <name>` |

A bundle ships a `cordis.patch.yml` that inserts/overrides plugin rows. A
profile lists bundles in `dsh.profile.bundles`.

**The loader entry `name` MUST equal the package name.** If you rename the
package, update every `cordis.patch.yml` insert `name` to the new package name.
A stale `name:` → `Cannot find package '<old>'` at boot → hard crash.

### Loading order (later layers win per row)
1. Each bundle patch named in profile's `dsh.profile.bundles`, in list order.
2. The profile's own `cordis.patch.yml`.
3. Home-level `$DSH_HOME/cordis.patch.yml`.
4. Each `--patch <path>` overlay, in argv order.

A patch replaces a row's *entire* `config` value (no deep merge). To override a
row by `id`, restate every key that row needs, not just the changed one.

---

## 5. Lifecycle / Fiber state machine

```
PENDING → LOADING → ACTIVE
PENDING → LOADING → FAILED
ACTIVE  → UNLOADING → DISPOSED
```

| State | Meaning |
|-------|---------|
| PENDING | Declared but dependencies not ready |
| LOADING | Dependencies ready, `apply` running |
| ACTIVE | Running |
| FAILED | `apply` threw |
| UNLOADING | Disposing resources |

Anything registered through `ctx` (listeners, tools, timers) is cleaned up
automatically on unload. For explicit resources, use `ctx.effect(() => disposer)`.

---

## 6. Events (loose coupling)

```ts
ctx.on('event-name', (payload) => {})   // listen
ctx.emit('event-name', payload)         // broadcast
```

Modes:
- **emit** — broadcast, sync, return values ignored.
- **bail** — first non-null/false/undefined result short-circuits.
- **serial** — ordered, awaited; first non-null/... stops.
- **waterfall** — pipeline; a listener **must call `next()`** or it short-circuits.

Event names use `namespace/action` (e.g. `tools/result`, `agent/request`).
Typed via declaration merge on `@deepseek-ai/cordis` `Events` interface.
Listeners are effects — auto-removed on unload.

---

## 7. Installing from GitHub — the `prepare` script catch

Git installs fetch **sources**, not built artifacts. Nothing runs your `build`
script. To work:

- **Author** ships a `prepare` script that builds the published entry points
  from source, self-contained (transpile `src/` without project refs/typecheck).
- **User** allowlists the build in the profile's `pnpm-workspace.yaml`:

  ```yaml
  allowBuilds:
    my-plugin: true
  ```
  (pnpm ≥10 refuses to run a git dep's `prepare` until allowed — first `add`
  fails with the exact package key to copy into that file.)

Treat that allowance as permission to execute the package's code at install
time. Pin a commit (`github:you/plugin#<sha>`) so a later push can't silently
change what runs.

**Prefer distributing built artifacts** to avoid the allowlist entirely:
- Publish to npm with `lib/` built at `pnpm publish` time.
- Ship a tarball from `pnpm pack`; users run `dsh plugin add ./plugin-0.1.0.tgz`.

---

## 8. Audit summary of our owned plugins

### `dsh-advanced-panel` (fork of `dsh-better-sidebar`) ✅
- `package.json` name: `dsh-advanced-panel` — matches loader entry.
- `dsh.bundle.patch: ./cordis.patch.yml` — correct.
- Loader insert `name: 'dsh-advanced-panel'` — **matches** package name. Good.
- `dsh.client` declared with web platform. Good.

### `dsh-theme-engine` (fork of `dsh-dream-skin`) ❌ needs patch fix
- `package.json` name: `dsh-theme-engine` — but its `cordis.patch.yml`
  still inserts:
  ```yaml
  - insert:
      - id: dream-skin
        name: 'dsh-dream-skin'   # <-- STALE, must be 'dsh-theme-engine'
  ```
- The loader resolves `name` as a package spec → `Cannot find package
  'dsh-dream-skin'` → boot crash.

**Fix:** change that insert to
```yaml
- insert:
    - id: theme-engine
      name: 'dsh-theme-engine'
```
and repack.

---

## 9. Check-before-boot checklist (run before shipping a fork)

1. `package.json` `name` is the final package name.
2. Every `cordis.patch.yml` insert `name:` equals that package name.
3. `dsh.bundle.patch` points at the real patch file.
4. Config is a Schemastery schema, not a plain object.
5. Config exposes anything tunable — no hardcoded values two deploys might diverge.
6. `inject` declares all required services.
7. `apply` registers via `ctx`, uses `ctx.effect` for explicit cleanup.
8. For a git-hosted install: ship a `prepare` script OR a built tarball.
9. Test boot with `--dump-config` / a clean profile before publishing.
