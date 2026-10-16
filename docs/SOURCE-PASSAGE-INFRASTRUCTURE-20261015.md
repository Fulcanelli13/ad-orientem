# Source Parsing & On-Demand Reading — independent infrastructure

**Owner:** Source parsing pipeline. **Canonical app:** `Fulcanelli13/ad-orientem`.
This work supplements—not replaces—the Mass, Bible, Formation, Prayer,
Calendar, Explore or bibliography/reference-presentation owners.

## Existing infrastructure reused
- `data/reference/parsing-opportunities.v1.json`: the existing 37-source-family
  registry (inventoried/structured/held statuses), from merged PR #1215.
- `src/reference/text-parser.js`: pinned paragraphs and Divinum section
  parsing with explicit rights and unresolved macro holds.
- `src/scripture/*`: existing primary Bible passage service; no new Bible
  edition, no second Scripture library and no runtime changes.
- `data/reference/canonical-works-pilot.v1.json` and
  `source-witness-triage-pilot.v1.json`: prior work/edition/witness
  identities under the reference pipeline. These are not copied here.

## Added capabilities
- `parsePinnedSourceHtml`: restricted **locally supplied** text HTML,
  retaining literal copy, explicit paragraph/section anchors and source lines.
  It rejects remote/executable/unknown markup rather than sanitizing
  arbitrary Internet HTML or silently losing paragraphs.
- `compileSourcePassagePacks`: one integrity-checked JSON file per source
  section, plus a small manifest. SHA-256 binds the exact serialized bytes.
- `createSourcePackReader`: no fetch at startup; fetch one section only when
  requested, bounded LRU memory, search only at explicit user request,
  original IDs, previous/next passage navigation and source-locator metadata.
- `mountSourcePassageReader`: optional EN/FR-labelled DOM reader (source
  translation remains edition-specific), using `textContent` only; exact
  return-to-origin callback and no registration into app routes.
- `previews/reference-passage-reader-20261015.html`: standalone sample.
  Its prose is newly authored technical test content, **not Catholic
  primary text or a licensed excerpt**.

## Byte budget and demonstrator
The sample has **two** independent JSON section packs:
- Source index: **712 bytes**.
- Section 1: **517 bytes**.
- Section 2: **548 bytes**.
- Initial paragraph body fetches: **zero**.
- Body bytes loaded upon opening one section: **517** (not 1,065).
- Section cache default: two sections; tunable 1–32 with bounded eviction.

These numbers validate *lazy delivery in the pilot*, not a measured speedup
for the whole Ad Orientem app. Large corpora must be benchmarked separately;
for tiny documents, index overhead can exceed the unchunked original. No
initial application bundle or service worker changes are included.

## Reproducible local-only build
For the original demonstration:

```sh
node tools/reference/build-source-packs.mjs --check data/reference/source-demo/build-config.v1.json
```

`--write` deliberately updates the local pack outputs and is only for
approved sources; use `--check` in CI and code review. The tool makes no
network requests or copyright decisions. A new work needs a separately
reviewed and explicit edition + reproduction-rights decision. Unknown
licensing, incomplete translations, arbitrary Internet HTML, PDF OCR,
Divinum macros and draft meditations **do not become readable** just
because a file could technically be parsed.

The build config records the source file and rights-evidence scope. For
licensed external works, provide a real licence ID, reviewer and review date.
Nothing in this pilot grants rights for third-party translations or editions.

## Consumer contract (no auto integration)
1. The owning module chooses a canonical passage reference and carries its
   origin context.
2. It explicitly imports the small reader module only upon user action.
3. Its own approved fetcher serves the manifest and section files, including
   whatever offline policy it owns. **This library never fetches remote
   external URLs or writes to caches on its own.**
4. The service verifies local manifest fields, rights, section ID and SHA-256,
   then returns literal source text. It does not certify doctrinal validity.
5. The host owns `onReturn({passageId,sectionId})` to restore the exact screen
   without replacing its canonical navigation/gesture handlers.

Example:

```js
const service=createSourcePackReader(manifest,{
  loadChunk:file=>hostReadApprovedLocalText(file),
  cryptoProvider:globalThis.crypto
});
const view=mountSourcePassageReader(root,{
  reader:service,title:"Original source",language:"fr",
  initialPassageId:"witness.id:s001:p001",
  onReturn:context=>restoreOwningModule(context)
});
```

## Release gate
```sh
node tests/reference-parsing.mjs
node tests/reference-passage-packs.mjs
node tools/reference/build-source-packs.mjs --check data/reference/source-demo/build-config.v1.json
```

These tests cover original-text integrity, source anchors, exact IDs,
malformed/unsafe HTML rejection, rights/macro holds, SHA-256 tamper detection,
chapter-level fetch on demand, cache eviction, search and return context.
Separate physical/browser phone visual approval is still needed before
any new UI is offered from a public app module.
