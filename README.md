# Mitsumeru Desktop

**Mitsumeru Desktop** is a fork of [`dataelement/dsh-desktop`](https://github.com/dataelement/dsh-desktop) — the *DeepSeek Harness Desktop* — tracked by the Muen Collective as the base for the **Mitsumeru** product build.

> **Fork status:** this repository is a **branded fork** of upstream `dsh-desktop` (`main`). The dev channel applies Mitsumeru branding (app name, icon, appId) and is signed/notarized with a Developer ID certificate. The Muen plugin set and prod posture are applied separately.

## What upstream is

`dataelement/dsh-desktop` ("DSHDesktop") is a local-first Electron desktop shell for the [DeepSeek Harness (`@deepseek-ai/dsh`)](https://github.com/deepseek-ai/deepseek-harness). It bundles the Harness runtime and loads the DSH web UI in a hardened window. The desktop shell is infrastructure; the harness and its plugins are the product.

## What this fork changes

This fork applies Mitsumeru branding on top of upstream. The fork exists to:

1. **Serve as the dev build channel** — branded with Mitsumeru identity, signed/notarized for distribution.
2. **Hold the upstream source** that we diverge from. Upstream upgrades are merged and the Muen layer re-applied on top — never by rewriting upstream.

## Upstream sync

- Tracks upstream [`dataelement/dsh-desktop`](https://github.com/dataelement/dsh-desktop) `main`.
- Once diverged, upstream upgrades are applied as an upstream **merge** with the Muen layer re-applied on top — never by rewriting upstream.

## Build / run

The build and prerequisites are owned by upstream — see the upstream [README](https://github.com/dataelement/dsh-desktop).

```bash
git clone https://github.com/muen-collective/mitsumeru-desktop.git
cd mitsumeru-desktop
npm ci
npm run dev
```

Unsigned dev installers are produced from the `release.yml` workflow via `workflow_dispatch` (macOS arm64 + Intel x64, Windows x64). Signed/notarized releases are cut on `v*` tags once Apple signing secrets are configured.

## License

MIT — see [LICENSE](LICENSE). Attribution to upstream `dataelement/dsh-desktop`.
