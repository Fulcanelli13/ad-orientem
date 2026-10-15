# Source references — narrow scope of PR #1229

**Purpose:** Identify sources accurately and support discreet, reliable references in the existing Ad Orientem modules. This is **not a book importer, ebook reader, new content engine or bibliography displayed by default**.

## Canonical owners and strict responsibilities

- `data/reference/canonical-works-pilot.v1.json` owns canonical work identities. This PR does not replace it or re-register works in a second catalogue.
- `data/reference/formation-canonical-source-crosswalk.v1.json` owns Formation's 408 scoped source bindings and 304 exact-URL witnesses. The resolver reads them *as-is*, preserving source scope, titles, roles, existing locators and URL identities. A URL is not proof of passage/edition identity.
- `data/source-text/witness-profiles.v1.json` records **nine** external edition-specific locator patterns (official document paragraph, witnessed section, chapter, separately printed scan locator, etc.). It is metadata for linking to external editions, not a copied text corpus.
- `src/source-text/reference-crosswalk.js` resolves existing references and returns link/display metadata. Its conservative default is an external **Read further** link; it never upgrades original-context approval, publishes source text, or infers claim-level citation verification.
- `src/source-text/{contracts,parse,edition-adapters,witness-locators}.js` remain **selected-excerpt helpers** for records that a content-owning pipeline has actually inspected and explicitly cleared. They do not crawl, acquire, store or serve whole books.

## Removed as outside scope

All three staged Gutenberg ebooks and their 1,911-paragraph indexes; the bulk-import command, job manifest and new edition-specific ebook adapters; the six speculative Mass/Prayer read-further links; the experimental ebook reading UI and lazy-book packaging; and the lengthy Fortescue page-by-page collation workbench and tests. The Fortescue article's basic printed-witness identity remains in witness metadata, but unverified draft text is not retained as an app research corpus.

## Intended user-facing citation behavior

Ordinary cards and pages should remain uncluttered. For content with a *genuinely reviewed* source binding, show a succinct author/work reference or stable locator where available. Prefer a compact **Read further** area with durable primary links. Keep Edition/translation and exact passage details in deeper source information rather than in the primary reading zone. Never add Harvard/APA footnote clutter or entire books to the interface by default.

**Importantly**, this PR does **not** automatically prove any of the 408 Formation bindings. Their existing `original_context_approved` flags remain unchanged; claims or quotations requiring exact source support must be handled by the pipeline owning that specific content. The Mass's 65-card reader, Formation text, Calendar, Prayer, Scripture and all production routes are untouched.

## Check

```sh
node tests/source-text-references.mjs
```

No runtime deployment is included. This remains a narrow draft infrastructure contribution; source binding coordination with other active research branches must occur before integration.
