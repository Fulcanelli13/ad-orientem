# Ad Orientem reference presentation — 15 October 2026

## Governing rule
Evidence is not further reading. Every substantive claim keeps its precise source membership, but the normal reader should see a clear narrative with at most one unobtrusive **Sources & further reading** disclosure per study screen. Only explicitly selected works become suggested further reading. Do not automatically turn a large research bibliography into a recommendation list.

## Current source presentation audit
- `src/learn/mass-formation.js`: each of the 24 claims across eight Mass lessons has a row of visible source chips. Initial integration pilot removes those chips from the default reading path, preserving claim-to-source evidence in a collapsed section.
- `src/learn/formation-research-preview.js`: research preview displays a list of references after each answer, objection and reply paragraph. A companion pilot can aggregate these at article scope. **Research remains unpublished.**
- `src/learn/formation-recovery-review.js`: editorial research repeats visible source lists beneath paragraphs. This is an additional candidate for migration, not part of the Mass lesson release.
- `src/learn/spiritual-life.js`: 14 bilingual lessons previously showed inline source links beneath three teaching blocks and each practice, then repeated works at the end. The integration pilot keeps the original EWTN/CCEL/Vatican source targeting but moves the 56 link clusters inside one lesson-level disclosure with an 'Evidence by section' subpanel.
- `src/learn/sexual-ethics.js`: already uses nested `<details>` for many debate-stage sources. Preserve opponent provenance and evidence scope; do not discard claim-level links.
- `src/pray/novena-source-access.v1.js`: source-level original versus modern transcription notes already exist. Preserve edition cautions.
- Sites and maps: provenance is essential for verification of pins and identities, but research links belong under an optional Information/Sources surface.

## Source model
1. **Work:** stable author/title/edition/translation identity independent of host URL.
2. **Witness:** an official original, printed page image, facsimile, scholarly edition, reproduction or secondary transcription, each labelled for its actual evidentiary status. Multiple URLs may point to the same witness.
3. **Passage:** precise paragraph, chapter, page or folio, with language, edition and stable internal locator.
4. **Evidence edge:** content claim ID -> passage/source witness IDs; no unscoped global ID merge.
5. **Further-reading edge:** optional editorial selection per screen, no inference from number of citations.
6. **Rights decision:** public-domain text, authorized licence, or explicitly held. A public URL is not republication permission.

The scoped pilot work registry at `data/reference/canonical-works-pilot.v1.json` now holds 13 work identities spanning 16 Mass Formation and Spiritual Life source IDs. `data/reference/source-witness-triage-pilot.v1.json` classifies each witness, links it to one work, records claim-locator and reproduction-rights holds, and distinguishes six reviewed public webpage URLs from unverified remaining destinations. The exact Code of Canon Law Book IV page and Tanquerey continuation were additionally opened. **This is NOT a full multi-module source migration or claim-by-claim passage certification.** Neither registry changes existing evidence edges or publication gates.

## Editorial and visual conventions
- Mass MISSAL/SIMPLE/LIVE: no visible research citation UI in the live ritual; explain through Guide/Study instead.
- Mass Formation and Spiritual Life: one folded sources panel at the end, sources separated from original passages and Scripture reader.
- Apologetics, Church Crisis and moral disputes: evidence must be fully navigable by paragraph and named speaker; source/passage distinction and opposing positions remain explicit.
- Meditation: single quiet attribution first; appropriate in-app primary-text reading if the passage and rights are cleared.
- Scripture: open through Ad Orientem's canonical Scripture reader where an exact contextual reference exists.
- Do not use Harvard/APA footnote formatting in default screens; use Catholic work abbreviations and locators where an attribution matters.
- Prefer verified Vatican original URLs for papal documents and conciliar acts; mark third-party scans and transcriptions as witnesses, not authoritative original editions.
- No link-check outcome or copyright clearance is implied merely by an HTTPS URL.

## Acceptance gates
- Every preexisting claim ID, source ID and source-to-claim edge remains intact.
- Source list remains accessible with keyboard, touch and screen reader, and unresolved references remain explicitly held.
- At most four editorially selected items appear as further reading for a section; this does not truncate evidence. Spiritual Life's source-work inventory is not itself a further-reading recommendation.
- French and English treatment equivalent.
- Native 65-card Mass structure untouched.
- Source quality/URL/rights audits and phone/browser checks still needed before certification or wider release.

## Pilot verification ledger
- GitHub Actions validation: `source-reference-presentation.yml` checks Mass Formation, unpublished Formation research and Spiritual Life readers, keeping current canonical tests.
- Official full-text webpages opened on 2026-10-15: Pius XII, *Mediator Dei*; Pius XI, *Miserentissimus Redemptor*; Paul VI, *Indulgentiarum Doctrina*; Code of Canon Law Book IV canons 959–997.
- Third-party HTML works opened: EWTN Tanquerey primary and continuation excerpts, CCEL St Francis de Sales and St Ignatius. **Successful access verifies reachability only**, not textual accuracy or license.
- Third-party PDFs and Archive.org facsimiles remain uninspected. No local reproduction, parsing or PDF rights clearance has been authorized. Their source link can remain in the evidence drawer while reading recommendations await editorial clearance.
- Remaining scope: claim-level page numbers/paragraphs, full link durability audit, local passage parsing rights and translation policy, and church-shrine/map source triage.

## Full Formation editorial reader integration — 15 October 2026
- The existing `src/learn/formation-recovery-review.js` owns all 60 Apologetics and 81 Church Crisis canonical dossiers; it is **internal draft content, not a released doctrinal module**. No competing public route is introduced.
- The default 141-dossier reading now keeps its `answer`, `documented_position`, `critical_response` and `traditional_catholic_argument` blocks uninterrupted by link lists. Original attributed speakers and positions remain visible.
- The same reader retains a folded **Sources & original texts** section with one source group for each original canonical synthesis section. Claim sources resolve within that owner's existing `sourceRegistry` Map, not by globally flattening short IDs that collide between packs.
- The 123 distinct recovered/editorial research records remain in the historical library and connected to their original dossier owners where available. Their question provenance, original wording, supporting links, and internal Bible-capsule handoffs are retained under the appropriate nested evidence section.
- The article/disputation citations are **evidence only**. No opposing theologian or contested source is automatically labeled recommended further reading; that requires explicit editor review.
- `tests/formation-recovery-review.mjs` now checks the collapsed evidence presentation and original hyperlinks for each canonical dossier in addition to preexisting coverage/ownership checks. Any failed legacy test blocks merging.
- Source-work deduplication is intentionally *not* performed globally here. The 13-work pilot is incomplete and must not be represented as the complete bibliography for the 141 dossiers. The 141 dossier-specific source registries remain authoritative until safely crosswalked.

## Formation bibliography crosswalk — 15 October 2026

- **Hosting/release boundary:** the historic `Fulcanelli13/ad-orientem` repository and GitHub Pages are the current continuation route. Folio Core and Vercel are not targets for this source-reference change; Vercel's build-rate limit is not a reason to buy a subscription or copy research to another repository. Do not merge this draft until the latest GitHub Actions checks and browser/phone acceptance pass.
- Added `data/reference/formation-canonical-source-crosswalk.v1.json` as an inspectable, **non-destructive offline index** of the eight currently consumed canonical Formation synthesis packs.
- **Coverage:** 141 dossiers (60 Apologetics / 81 Church Crisis), 564 original argument sections and 1,541 original section-to-source evidence edges. The 408 existing source records resolve to 304 **exact-URL witnesses**, including 72 reused URLs. All section source IDs resolve within their original batch.
- **Critical provenance rule:** the same short source ID recurs across 45 places/packs. There is **one case where the reused short ID spans different URLs**: `V1`, a candidate witness for Vatican I's *Pastor aeternus*. Never merge such IDs merely by their short string; each binding is keyed `FORM-SYN-XX::originalId`. Even identical URL links do **not** prove two claims have the same textual passage.
- **Twelve uncited research leads** remain in the original source registries and are separately flagged in `review_queue.uncited_sources` (Fatima, papal documents, moral theology, and other subjects). Retain these until their provenance or usefulness is reviewed; they are not attached as supporting evidence to any current canonical section.
- **Certification status:** all 408 source bindings currently lack `original_context_approved=true`. Existing printed/explanatory locator strings are preserved verbatim, not elevated to checked chapter/paragraph certification; link strings have NOT been tested for HTTP availability or exact text content in this pass.
- **Presentation:** the internal 141-dossier reader now prints the original locator beneath each cited source link *inside* the folded evidence drawer. This keeps long source descriptions off the ordinary reading screen and preserves the ability to challenge source-to-paragraph accuracy.
- **Safety:** the reader uses the shared HTTPS URL acceptance helper. The crosswalk must not re-label an opponent's original statement as a Catholic endorsement or recommended spiritual reading.
- **CI:** `tests/formation-source-crosswalk.mjs` independently rereads all eight canonical packs, confirms stable scope binding and URLs, 564 sourced sections, 1,541 evidence edges, 12 retained uncited leads, and the special `V1` collision.
- Next editorial phase: inspect sources against original document passages and classify confirmed exact passages, contextual support, contested interpretation, incomplete edition and unverified claims **at the paragraph level**; no automatic bulk certification.

### First verified cross-URL identity: Pastor aeternus
The two Vatican Latin endpoints for the **18 July 1870** dogmatic constitution `Pastor aeternus` were directly opened on 2026-10-15. The older Council archive page and Pius IX's newer document page identify the same work. Preserve both URLs (two witnesses), the four original scoped `V1` source bindings, each binding's distinct passage locator, and its distinct source-pack usage. This is a **work identity confirmation**, not a complete line-by-line textual collation of the pages or verification of every cited claim. The other 302 witness URLs in this crosswalk are not independently checked by this audit.

## Evidence relationship audit — 15 October 2026

The pilot now differentiates **evidence identity** from **what the cited document actually establishes**. `data/reference/formation-evidence-relationship-ledger.v1.json` is a separate non-destructive index of all 564 authored sections and 1,541 original section-to-source edges. It references the earlier exact-URL crosswalk and original batch scoped IDs; it never modifies text or claims certification by linkage alone.

**Structural baseline, not a new research backlog:** All 564 authored sections remain formally `NOT_CERTIFIED`. Only 248 of the 1,541 source edges carry a section-specific `source_claim_locators` field; all keep their source-level locator. Eight narrowly scoped checks were also entered here, some duplicating already corrected arguments. The other **1,533 simply lack an individual verdict in this *new* ledger**; it is incorrect to call them never-reviewed or to start a new audit of them. Earlier screening and review findings are reconciled in `data/reference/formation-prior-audit-reconciliation.v1.json`.

**Eight manually reviewed individual source relationships, without wholesale section approval:**
- APOL-012, `DIVINO`: the Vatican-hosted *Divino afflante Spiritu*, §§17–19, explicitly endorses qualified textual criticism and examining scribal mistakes. Other conclusions in the section remain unassessed.
- APOL-012, `JUSTIN71` twice: *Dialogue with Trypho* chs. 71–72 directly documents Justin's allegation and Trypho's request for examples; ch. 72 says that a Jeremiah reading persists in some synagogue copies. **This is proof of an attributable ancient allegation and its argumentative context, not independent proof of a deliberate, general Jewish alteration.** English New Advent translation consulted; Greek original not collated.
- APOL-002, `HG1950` twice: Vatican-hosted *Humani generis* §§36–37 states the Church permits qualified discussion of bodily evolution, insists on the immediate creation of souls, and separately warns against the specified forms of polygenism; no modern genetic or expanded doctrinal theory thereby certified.
- APOL-002, `BIOLOGOS2014`: BioLogos's own 2014 article, revised in 2021, directly states its ancestral population inference and acknowledges genetics cannot prove or disprove the historical existence of a particular individual. This verifies accurate opponent/author attribution only, **not** the independent truth of the genetic model or magisterial endorsement.
- CR-IDM-06, `FRANCIS-AUD23-CR` twice: Francis's 11 January 2023 audience contrasts proselytism with witness/attraction and expressly announces Jesus; it does not itself define all persuasion as coercion or offer an exhaustive magisterial definition of proselytism. Assertions concerning what it **legally** does not abrogate are reasoned editorial inferences, not verbatim declarations.

**Source hierarchy:** use the official Vatican text for magisterial claims; the author's own publication for attributed positions; identify third-party transcriptions as textual witnesses, not original-language editions; treat contested inferences as interpretation and explicitly separate them from direct textual propositions. Where a paragraph includes many substantive propositions, verify them individually rather than promoting the whole paragraph after one checked citation.

`tests/formation-evidence-relationship-ledger.mjs` verifies that this additional ledger preserves every original edge, attribution, source locator and review limitation **without implying the previously audited material needs auditing again**. It is not a measure of historical review coverage. The separate prior-audit reconciliation and its test retain earlier verdicts and supersession status; green CI does not amount to substantive final certification or visual acceptance.

## Corrective reconciliation — existing research first, 15 October 2026

**Decision:** do not launch a new claim-by-claim verification exercise based on the new ledger. A source entry absent from a newly minted checklist is *not* an unverified claim. The mistaken claim that "1,533 sources remain unreviewed" has been withdrawn. Evidence relationships must be grounded in *existing work*, with its original scope and editorial qualifications.

The canonical reuse manifest `data/reference/formation-prior-audit-reconciliation.v1.json` now links, **without rewriting audited prose or authoring more citations**, the historical merged findings and the separate in-flight independent Formation screen:

- **Open PR #1198, pinned at `3ebe6a6dc1e1dd0757f0ed80d3eefaf80e6c9f21`:** 60 Apologetics and 23 Church Crisis owners. All four original English roles, source IDs and attribution were compared to current canonical source text: **83 exact-match owners and 332 exact-match source-bearing sections**. These are *previous editorial screening*, not complete independent claim certification. Because PR #1198 remains open, its audit files are referenced by pinned SHA and have not been copied over the canonical corpus or falsely described as merged.
- **Merged PR #592:** 17 bounded original primary-context findings. **16** match the same role/source edge now; `PSV1-016` was explicitly superseded by the subsequent first-person proponent correction. Do not apply that older finding as though it were current.
- **Merged PR #491:** 123 historical research records, 622 bilingual drafted paragraphs, and existing internal/source-quality gates. Historical source checks and their status stay owned by those records, not reinterpreted as approval of an adjacent canonical synthesis.
- **Merged PR #437 and later merged corrections:** 74 Traditional Mass legacy paragraphs retain current verdicts: **36** directly anchored, **30** interpretive, **8** corrected pending editorial approval, **0** currently blocked. Earlier narrative counts of 37/30/7 were superseded; use the current original research register. This is a separate owner-level/historical-claim layer, not 74 additional canonical synthesis sections.
- The other 58 canonical dossiers without a match in these **two specific** 60+23 screening files have NOT been marked "unreviewed." They may have review records in other independent audits; the manifest explicitly records its own incomplete reconciliation coverage.

**Regression gate:** `tests/formation-prior-audit-reconciliation.mjs` compares all 141 owners, hashes of the 332 already-reviewed English paragraphs plus their original source-ID lists, all 17 merged findings and the one superseded mapping, 123 history register entries, and 74 prior Traditional Mass verdicts. This test fails if audited text or attribution is altered without rescoping its prior finding. It does not verify the theology anew.

The immediate shipping priority is the source disclosure and reading UI. Investigate only explicitly *still-blocked*, contradicted, obsolete, or genuinely undocumented claims from their original audit ownership files. No blanket reopening based on missing fields in a new format.
