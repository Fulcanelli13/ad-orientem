# Source references — narrow scope of PR #1229

**Purpose:** Identify sources accurately and support discreet, reliable references in the existing Ad Orientem modules. This is **not a book importer, ebook reader, new content engine or bibliography displayed by default**.

## Canonical owners and strict responsibilities

- `data/reference/canonical-works-pilot.v1.json` owns canonical work identities. This PR does not replace it or re-register works in a second catalogue.
- `data/reference/formation-canonical-source-crosswalk.v1.json` is Formation's **historical baseline** with 408 scoped source bindings and 304 exact-URL witnesses. **It is not the latest inventory**: the current owner reconciliation `data/reference/formation-current-source-reconciliation.v2.json` on `main` records **527 bindings and 332 URL witnesses**, including 119 additions made by the existing Formation pipelines; no historical binding removals and no newly independently certified claims. The resolver reads them *as-is*, preserving source scope, titles, roles, existing locators and URL identities. A URL is not proof of passage/edition identity.
- `data/source-text/witness-profiles.v1.json` records **nine** external edition-specific locator patterns (official document paragraph, witnessed section, chapter, separately printed scan locator, etc.). It is metadata for linking to external editions, not a copied text corpus.
- `src/source-text/reference-crosswalk.js` resolves existing references and returns link/display metadata. Its conservative default is an external **Read further** link; it never upgrades original-context approval, publishes source text, or infers claim-level citation verification.
- `src/source-text/{contracts,parse,edition-adapters,witness-locators}.js` remain **selected-excerpt helpers** for records that a content-owning pipeline has actually inspected and explicitly cleared. They do not crawl, acquire, store or serve whole books.

## Removed as outside scope

All three staged Gutenberg ebooks and their 1,911-paragraph indexes; the bulk-import command, job manifest and new edition-specific ebook adapters; the six speculative Mass/Prayer read-further links; the experimental ebook reading UI and lazy-book packaging; and the lengthy Fortescue page-by-page collation workbench and tests. The Fortescue article's basic printed-witness identity remains in witness metadata, but unverified draft text is not retained as an app research corpus.

## Intended user-facing citation behavior

Ordinary cards and pages should remain uncluttered. For content with a *genuinely reviewed* source binding, show a succinct author/work reference or stable locator where available. Prefer a compact **Read further** area with durable primary links. Keep Edition/translation and exact passage details in deeper source information rather than in the primary reading zone. Never add Harvard/APA footnote clutter or entire books to the interface by default.

**Importantly**, this PR does **not** automatically prove any of the current 527 Formation bindings. Their existing `original_context_approved` flags remain unchanged; claims or quotations requiring exact source support must be handled by the pipeline owning that specific content. The Mass's 65-card reader, Formation text, Calendar, Prayer, Scripture and all production routes are untouched.

## Current-Formation owner reconciliation — completed audit

Reviewed the **current** `main` Formation owner's `formation-current-source-reconciliation.v2.json` (Git blob `ba73286fa26f8564f0dc33048551ee527b597c27`) against its preserved historical baseline. The owner has **527 scoped bindings, 332 distinct HTTPS URL witnesses, 1,529 evidence edges, 119 additional bindings, and zero missing historical source bindings**. The earlier evidence screen's 12 uncited source-registry items are *not* automatically missing source citations; the Formation owner decides whether they serve as bibliography or need attachment.

The nine edition/witness profiles in this PR were compared by **literal identical URL** with both the 408 historical bindings and the 119 current additions. Only **four** existing scoped bindings match a profiled URL:

| Existing Formation binding | Matching external witness | Result |
| --- | --- | --- |
| `FORM-SYN-02::MD47` | Pius XII, *Mediator Dei*, Vatican English | URL identity only |
| `FORM-SYN-03::MD47` | Same document, distinct source scope | URL identity only |
| `FORM-SYN-06::MD47` | Same document, distinct source scope | URL identity only |
| `FORM-SYN-02::HUME-MIRACLE-X` | Hume, *Of Miracles*, source edition | URL identity only; opposing philosophical source role preserved |

These are four **existing references**, not four new claims or four certified quotations. The other 523 current Formation bindings still have their existing URLs; lack of a matching optional profile does **not** make them missing or incorrect. No automatic work identity, translation, paragraph scope or doctrinal approval is granted from a URL match.

The Mass owner separately retains **15** printed/source-to-1962 comparison rows (`data/mass/ritus-1962-alphonsus-fortescue-parallels.v1.json`). Its normative hierarchy is the **1962 Missal**, with Alphonsus and Fortescue providing historical/ceremonial context. This PR does not redo those parallels, infer new 1962 gestures, or create a second Mass source authority.

The audit pointer and four non-promoted match keys are recorded in `data/source-text/reference-owner-handoff.v1.json`. The current owner v2 is not copied into this feature branch: its source remains the version on `main` and the tests automatically validate that actual file when it is available in the integration checkout.

## Compact presentation contract

The source reference has **one default surface**: a brief source attribution at the point of a genuinely editor-approved claim. There is no Harvard/APA-style inline bibliography. If the user chooses to explore further, an optional **Read further** section contains the original authority/title and durable external link. Full edition provenance and detailed locators can sit in the expanded source detail.

For example, a *future editorially approved* reference could be displayed compactly as **Pius XII — *Mediator Dei*, §§46–49**, with the official Vatican external link under Read further. This is **illustrative, not approval of the current three MD47 source bindings**. The existing Hume source must be identified in context as an *opposing philosophical position*, not presented as Catholic spiritual reading.

`prepareReferencePresentation()` returns **draft-only** title, preserved raw locator, unchanged author/source role, exact URL and optional witness-profile leads. It returns `publicDisplayApproved:false`, `inlineCitation:null`, `quote:null`. No app UI is changed here: module owners retain responsibility for any eventual citation approval and display.

### Genuine outstanding tasks, not blanket re-verification

- Confirm exact **claim-to-source passage fit** only where the owning Formation/Mass editor needs a claim-level citation; reuse existing prior screens and amendment dispositions.
- Resolve any *genuinely broken or inaccurate* locators specifically discovered during an owner's editorial review. A source lacking one of these nine optional profile records is **not** a reason for a new audit.
- Implement the compact *Read further* presentation only in the existing reading interfaces, after the originating content owner approves the precise link.


## Targeted section-level audit — four already-owned source links

The owner handoff was extended with `scopedEdgeReview` after inspecting `data/reference/formation-evidence-relationship-ledger.v1.json` against the **current** Formation source-owner reconciliation v2 (main Git blob `ba73286fa26f8564f0dc33048551ee527b597c27`). This is a **closed list** of the four literal-exact URL matches already identified; it is **not** an inspection of all 527 sources, and it does not supersede Formation's editorial research.

- **21 historical section-to-source edges**, one per section, use those four old source-binding keys. **Three historical edges** record a claim-specific locator; **18 do not**. All were historical `UNASSESSED` in the existing evidence ledger. The other current Formation source bindings remain outside this narrow audit, **not automatically suspect or missing**.
- Exactly **one of these 21 sections** occurs among the current owner's 22 rewritten prior-screened sections: `FORM-SYN-02::CR-LIT-07::00`. Its former answer referenced source ID **`MD47`**, but the owning Formation correction now has **`AO26_CRLIT07_ANSWE_1`**, `_2`, and `_3` instead. This existing source edge is **superseded and must not be restored by the source-reference pipeline**. The other 20 edges are **not identified as rewritten by that particular v2 list**, which does not prove they are all current or already valid.
- The historic `CR-LIT-07` edge described `Mediator Dei §§48–50, 63–65`, whereas the older `MD47` title is `§§46–49`. Its mismatch is **preserved as a recorded historical locator difference**, not reconciled into a new citation or independent passage approval. Because the edge is superseded, **no new paragraph verification is requested** here.
- The two Hume historical edges belong to `APOL-004`; the source remains the **philosophical opponent's** *First Enquiry*, Section X (*Of Miracles*), with visible `E 10.1`/`E 10.2` witness identifiers. Its source role must not be presented as Catholic endorsement.
- The Vatican English [*Mediator Dei*](https://www.vatican.va/content/pius-xii/en/encyclicals/documents/hf_p-xii_enc_20111947_mediator-dei.html) visibly numbers paragraphs 46–50. [Hume's Section X source](https://davidhume.org/texts/e/10) has Parts I–II and chapter paragraph identifiers. **Neither site's HTML fragment stability was verified**, so the user-facing target remains the documented, existing whole-document/section HTTPS URL with the original locator shown separately; never invent a `#` deep link.

`prepareScopedSourceLink()` takes the original historical evidence edge ID together with the unchanged Formation bindings and the pinned owner handoff. For the superseded `MD47` answer it returns **`SUPPRESSED_SUPERSEDED_OWNER_CITATION` and no link**. For 20 others it returns **`DRAFT_OWNER_REVIEW_ONLY`**, an optional `Read further` lead and original section/source roles. **All 21 have `publicDisplayApproved:false`, `inlineCitation:null`, no exact quotation and `historicalEdgeIsCurrentClaim:false`.** Existing Formation owners decide whether a link is still needed or whether previous reviews already cover it. Nothing was edited in that module.

The repository test suite checks these 21 actual prior edges, detects the one suppressed former source, and, when current Formation v2 is in the checkout, verifies the owner's explicit replacement source IDs. No general reverification queue was manufactured.

## Check

```sh
node tests/source-text-references.mjs
```

No runtime deployment is included. This remains a narrow draft infrastructure contribution; source binding coordination with other active research branches must occur before integration.
