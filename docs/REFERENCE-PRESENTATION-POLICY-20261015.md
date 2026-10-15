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
