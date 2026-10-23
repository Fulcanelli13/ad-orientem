# Customs research: concurrent Mueller source-pass collision, protected non-additivity

**Date:** 23 October 2026  
**Authority:** research-only; no Calendar, reader, rituals or app publication.

## Why this reconciliation was required

Two research pipelines independently indexed the SAME Therese Mueller work in the EWTN text labelled **fifth edition, 1955** (original copyright **1943**):

- Primary source worklist in `mueller-1955-kelly-1959-ewtn-action-intake.v1.json`: **122 Mueller action observations**, plus **82 Kelly** observations, indexed into the master as part of the already-counted **204** new rows.
- Second-pass source-action worklist `mueller-1955-our-childrens-year-of-grace-ewtn-first-pass.v1.json`: **100** separately indexed Mueller action/detail rows based on EWTN lines 128–316.

Since the same work and same web edition were used, the second-pass 100 **must not be advertised as new independent historical evidence or added to the 1,629 research-row total**. Its independent source-action IDs and original locator are nevertheless preserved for later fine-detail coverage review.

## Same-work source-line crosswalk

`mueller-100-second-pass-to-122-nonadditive-source-crosswalk.v1.json` explicitly traces all **100/100** secondary source rows. **95** have a primary Mueller record located at the *exact same EWTN HTML line*; **five** have no exact-line match. Same line is a source-location overlap only, not certification that two descriptions are the same underlying action or even the same sentence. The five line exceptions can still describe a narrower action from nearby source paragraphs.

**Source-count gate:** the master remains **1,629 research rows** (1,025 Weiser + 70 McLoughlin + 198 Stokes + 132 separately hosted online excerpts of Trapp/Berger/Newland + 204 Mueller/Kelly). **100 Mueller second-pass annotations are explicitly not added**. Existing **408 provisional action groups**, **56 overlapping master identities**, **0 certified distinct new customs**, and **0 app publications** remain unchanged.

## Source-routing high-volume screening

`stokes-mueller-298-source-routing-lexical-screen.v1.json` routes **298 of 298** source action/details (198 Stokes + 100 Mueller secondary annotations), compared by a conservative lexical search to the 56 existing research identities, 408 provisional group labels and 26 McLoughlin source-family names.

- **119** rows have at least one label-level retrieval hint (208 individual hints); **179** have no lexical retrieval hint.
- These hints are intentionally **not** an identity relation table: an example sharing "water" and "sprinkled" may be a completely different ritual; a missing lexical hint cannot justify a new custom.
- **Zero semantic equivalences reviewed**, **zero merges**, **zero independently corroborated source claims**, **zero approved Roman Ritual texts**, **zero publications** from this routing pass.
- Source and edition dependence remains unresolved for reused compilations (especially Stokes). No same-author mention can be counted as cross-author historical corroboration.

## Method and next gates

1. Manually reconcile the five Mueller line exceptions and a stratified sample of the 119 retrieval-hint cases, reviewing actual source snippets and contrasting actions, objects, dates, regions and rites.
2. Retain the entire 298-screen output as a **reversible search queue**, not verified practice data. It can be regenerated deterministically; source IDs persist.
3. Explicitly track **source coverage vs identity proof**. Bulk mining of independent witnesses should continue in 100–200 source-action batches, while complete original printed editions and ritual authorities are separate evidentiary gates.
4. Continue mass acquisition from authors with different textual source basis; historic excerpts from third-party sites are excerpt-only and cannot be described as exhaustive full-book scans.

All source IDs, provenance and status flags are in the JSON research files; updated integrity assertions prevent Mueller duplicate counting or accidental promotion.
