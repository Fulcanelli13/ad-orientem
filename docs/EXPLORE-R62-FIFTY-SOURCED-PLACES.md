# Explore R62 — fifty more canonical bilingual Places

## Delivery
- 50 additional French sanctuary narratives; 54 source-owned French pilgrimage accounts.
- Canonical progress: **158/216** French shrine narratives and **148/206** French pilgrimage descriptions.
- Remaining: **58** untranslated shrine narratives and **58** pilgrimage descriptions. (Counts from R62 manifest and canonical registry.)
- The 20 In Focus entries remain unchanged. Physical pins, routes, Calendar bindings, TLM directory and approved media are not changed.
- Text continues to reside solely in `data/shrines/shrines-pilgrimages-seed.v1.json`; the audit manifest is a source/identity ledger.

## Editorial evidence
The batch concentrates on original-source-attached records covering the American Martyrs, Divine Mercy, Marian places, the Holy Land, French heritage and reliquary destinations. Each passage is tied to its own shrine or pilgrimage record and existing original source IDs and HTTPS URLs. No recognition claim or relic authentication is implied where source evidence does not warrant it. Access notes for special expositions (Turin, Aachen, Trier, Cahors, Oviedo) retain explicit restrictions.

Some remaining English records are research-placeholder prose. Do not copy those generically into the French public reader. The remaining 58 shrines and pilgrimage accounts need specific research/source enrichment before translation.

## Regression and integration
- `tests/explore-r62-bilingual-stories.mjs` tests the 50 Place identities and 54 pilgrim owners, original source URLs, profile chapters and selected rendered French Place readers.
- `tests/explore-surface.mjs` imports the new regression suite.
- R61 source-owner checks continue to run, and their backlog assumption was relaxed to permit later source-verified translations.
- Maintain independent Bible Atlas pipeline and reconcile any parallel edits to `src/find/place-profiles.js`.

## Boundary
This editorial pass does not fix wider Mass visual-acceptance timing or Learn touch-target defects; these should remain separately owned.
