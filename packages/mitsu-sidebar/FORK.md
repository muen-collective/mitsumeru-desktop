# @muen/mitsu-sidebar — owned fork of DSH-better-sidebar

**Package:** `@muen/mitsu-sidebar` · **Muen version:** `0.1.0`
**Upstream base:** [`omdsh-dev/DSH-better-sidebar`](https://github.com/omdsh-dev/DSH-better-sidebar)
**Upstream version:** `v0.18.0` · **Upstream commit:** `9e1a03452794532cda1f6ac677b72579dff48dfc`
(merge of PR #537 "feat/adapt-dsh-0.1.2-rc.1" — the dsh `0.1.2-rc.1` base the desktop app runs)
**Built artifacts sourced from:** live harness generation `dsh-better-sidebar+0.18.0+11f33eae7d6d`

## Why we own it

Upstream `dsh-better-sidebar` is a great workbench, but it is **not Mitsu's product vision**:

- We want a **Kun-style vertical icon rail** with **persistent surfaces** — no `+` add-surface menu, no bottom panel, a **single icon toggle** for the right sidebar.
- Upstream is a horizontal tab strip + `+` menu + bottom panel workbench. Divergence is a product decision, not a config flag.
- Owning the fork gives us upstream control (sync cadence, surface set, icon system, design tokens) while staying on the same DSH host contract (`registerTab`, `registerFileViewer`, `ctx.betterSidebar`, per-tab settings in the Side card).

## Layout

- `src/`, `tests/`, `tsdown.config.ts`, `cordis.patch.yml`, `dsh.plugin.json` — vendored from upstream `v0.18.0` (git history intentionally not carried; this folder is the Muen-owned source).
- `lib/` — built runtime artifacts copied from the live 0.18.0 harness generation so the fork is installable/testable without a rebuild. Regenerate with `npm run build` (`tsc -p tsconfig.build.json && tsdown`) after editing `src/`.
- `package.json` — renamed to `@muen/mitsu-sidebar`, own versioning from `0.1.0`. All DSH metadata (`dsh.bundle.patch`, `dsh.client.inject`, exports incl. `./client`) preserved byte-for-byte so host behavior is identical at the seam.

## Product direction (maps to product epics)

- **epics/78** — Mitsu Side Rail: thin fork of the TabBar presentation into a vertical rail; single sidebar toggle; four persistent surfaces (Files, Docs, Browser, Gallery); no `+`; no bottom panel.
- **epics/80** — Gallery is a **Brand asset adapter** surface (empty primitive until adapter lands).
- **Icons** — reuse DSH `Icon*Outline` glyphs for built-in surfaces; add **Tabler** only for gaps (Docs `IconBook`, Gallery `IconPhoto`).

## Upstream sync

To track a future upstream release: diff upstream tag against this tree (`src/`, `cordis.patch.yml`, `package.json` deps), apply to `src/`, rebuild `lib/`, bump Muen version. Never merge wholesale — the rail presentation and surface set are Muen-owned.
