# Migration plan

The current application is a large single HTML document containing presentation, data, application state, artwork, devotional modules, Mass logic and compatibility layers. The migration must proceed in narrow gates.

## Phase 0 — freeze and repository bootstrap

1. Preserve v43.33 unchanged under `legacy/`.
2. Record and verify its SHA-256.
3. Keep migration work isolated from `main` until parity is demonstrated.
4. Add regression documentation before extraction begins.

## Phase 1 — external assets

Extract embedded images and reusable SVG assets without changing selectors or runtime semantics.

Priorities:

- Ad Orientem branding;
- 49 canonical Lab-ora icons;
- Tier-A UI icons;
- Tier-B live participation cues;
- Rosary artwork;
- Stations cycle;
- Proper artwork;
- saint artwork;
- devotional heroes.

Create mobile delivery derivatives rather than shipping museum-master images to normal cards.

## Phase 2 — CSS

Move CSS into `styles/` while preserving the cascade deliberately. First reproduce the existing visual result, then simplify ownership.

## Phase 3 — canonical registries and data

Extract stable registries and data from runtime logic:

- icon registry;
- artwork registry and Proper map;
- calendar/liturgical-year data;
- Mass step data;
- prayers;
- saints;
- catechism/formation content.

Do not introduce fuzzy Proper or art fallback matching.

## Phase 4 — state and navigation

Extract the current authoritative navigation/state ownership. Preserve v43.33's hard Home reset, sheet ordering, Back behaviour, persistent ribbon, and ghost-surface containment.

## Phase 5 — domain modules

Extract in this order, with a regression gate after each:

1. Home / Coming Up / Rule
2. Mass shell and preflight
3. Live Mass engine and guidance
4. Pray modules
5. Learn modules
6. Calendar
7. Settings / Sources / utility surfaces

## Phase 6 — delete compatibility layers

Only remove historical compatibility code after the extracted replacement is the sole tested owner of that behaviour.

## Phase 7 — PWA and release

After parity:

- add final manifest/service worker structure;
- add automated smoke/regression checks;
- enable GitHub Pages deployment;
- tag the first modular release candidate.

## Rule

Migration commits are not feature commits. New features belong in later, explicitly scoped work after parity.
