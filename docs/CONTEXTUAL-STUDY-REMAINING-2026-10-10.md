# Contextual study: remaining cross-module connections

10 October 2026 · parent main merge `7812f98530620cca9729882a8fa75b5b1e839281`.

## Exact implementation boundary

The user-facing goal is **meaningful in-context study, not another grid of links or reader reset**. This pass resolves the two safe specialist-reader relationships and provides inline canonical doctrine for the other two, without pretending to have tested a high-risk Catechism deep-link.

| Origin | User-facing action | Destination and state | Back / ownership |
| --- | --- | --- | --- |
| Formation: Matrimony, living the marriage | "Marital moral questions · explore" | **Published Sexual Ethics**, canonical `marriage` section | Original Matrimony reader stays mounted; the contextual Sexual Ethics overlay restores the activating button and exact reader scroll. No duplicated moral article |
| Formation: Latin, authentic-reading reference tools | "Consult the Latin Glossary" | **Canonical Glossary** at `latin_rubrics` | Original lesson phase, active exercise, scroll and trigger persist beneath owner overlay; returning does not navigate to Formation home |
| Prayer: Confession, preparation stage | Sacrament of Penance term capsule | **Glossary G034** (sourced explanation) | Existing context bridge restores the original point; no personal sins are stored or entered |
| Prayer: Adoration, mode selection | Eucharistic Adoration term capsule | **Glossary G301** (sourced explanation) | Existing context bridge restores selection; no lookup inserted into silent adoration, Holy Hour progression or Benediction |

The requested *exact* destinations `pray.confession → learn.catechism` and `pray.adoration → learn.catechism` remain **not wired**. Their actual currently deployed in-place educational alternative is Glossary, NOT a declaration that the Catechism route works. If a Catechism journey is later justified, it must provide a return-state contract that retains sacramental preparation/adoration mode, step and focus without exposing private Confession state or obstructing worship.

## Canonical relationship ledger

- 20 editorial candidate edges reconciled.
- 18 have concrete source implementations; their independent phone acceptance must still be checked at the actual origin and return.
- Two exact Catechism links remain unwired; the relevant doctrine is available in place through the canonical Glossary.
- 15 original registry-level handoff contracts and 72 Apostolate source-defined links remain unchanged.
- No unpublished Apologetics or Church Crisis research is exposed.

## Source and publication constraints

No doctrines, moral answers, Latin exercises or prayers are authored here. No source citations are manufactured. The Sexual Ethics module keeps its existing question, answer, dispute and original-document provenance; Latin keeps its own lesson glosses, while the full external-to-lesson Glossary is owned only by the Glossary reader. The two Glossary concepts are recognized IDs in `src/app/contextual-study.js`, not user-typed arbitrary targets.

No Mass source, R17 cards, Calendar engine, prayer recording, private confession capture, devotional completion or unrelated art/styling PR is modified.

## Integration gate repair — prior failures investigated

These checks failed on the earlier PR head even though the affected files were not previously changed by this navigation batch:

1. **Sexual Ethics source provenance:** `data/learn/sexual-ethics-opponent-source-audit.v1.json` was behind the canonical source-identity and locator map in `src/learn/sexual-ethics-data/provenance.js`. All **55** audited debate cases have now been reconciled: **22** changed arrays/locators, adding **14** established canonical source references. Existing URLs, source roles and source-type assessments are retained; newly introduced references use the registry's canonical URL, title and role and are not classified as full-text certified on the basis of a link. All **55 full-passage-review holds** remain in force. No opposing or Catholic argument is fabricated, and no stage is upgraded to full-text certification.
2. **Scripture's navigation disclosure:** `tests/route-lazy-browser-e2e.mjs` had attempted to select a hidden `aoScriptureNav` child after the Scripture reader adopted citation-first progressive disclosure. The regression now opens the *actual, visible* “Browse the Bible” summary and asserts the disclosure is open before changing source edition. It still requires the chosen edition to survive expansion; it does not disable the control or bypass the user flow.
3. **Matrimony return acceptance:** The Sexual Ethics contextual Back now closes directly to the Matrimony parent, keeping the same trigger and scroll rather than unnecessarily visiting the Sexual Ethics catalogue. The phone test requires **one Back**, not two.

These are source integrity and interaction fidelity corrections, not changed Catholic doctrine. Their acceptance depends on fresh GitHub checks.

## Acceptance

Source assertions in `tests/pray-formation-organisational-map.mjs` check 18/2 states, exact section/category arguments, source ownership, and absence of false Catechism wiring. Phone/browser tests must cover both specialist overlays (open, owner visible, return to same child position/focus) and the two Prayer Glossary capsules, in EN/FR at small viewports. Remain in a draft PR until App convergence and visual, Prayer and Marian gates pass.
