# Ad Orientem · Sacred Atlas folio and card editorial/UX master
**Version:** 2026-10-31, P0 audit and first presentation correction. **State:** DRAFT / EDITORIAL AND VISUAL ACCEPTANCE REQUIRED. This is a source-bound design contract, not permission to publish research or images.

## Product purpose and immutable owners
Sacred Places is a **map-first, photographic guide to real Catholic places and their religious subjects**, using the existing MapLibre / MapCN-style A+B Explore architecture. Preserve the same physical `place_id`, atlas canvas, compact preview, expanded Place sheet and return path. Do **not** create a second map, parallel shrine/relic catalogues, unsourced saint biography layer, Customs Atlas, second media registry or automatic Place promotion.

Each Place card must explain **where this is**, **why it is sacred**, **what the pilgrim comes to venerate or see**, and **what we can actually substantiate**, without overpromising objects, photos, recognition, relic authenticity or visitor access. The principal Marian image or relic should outrank a generic façade whenever the actual subject photograph is independently identified and cleared. A Place cover **never** establishes subject-image coverage.

Canonical data owners: `data/geography/seed-registry.v1.json`, `data/geography/approved-place-media.v1.json`, `data/geography/approved-place-gallery.v1.json`, `data/explore/sacred-phenomena-seed.v1.json`, `data/shrines/**`, `data/saints/**`. All linkages are exact IDs. Derived audit: `data/geography/research/explore-folio-editorial-readiness-20261031.v1.json`. This derived file is READ-ONLY and must never become the canonical owner.

## Current audited baseline (cross-checked against 31 October main)
- 530 canonical Places, all with coordinates; 120 approved cover assets and 33 approved gallery images at 29 Places.
- 257 source-linked shrine records, each marked as having English/French introduction; only 33 have published multi-section guides. **224 still lack a complete published guide.**
- 118 Marian shrines: 22 multi-section guides and 44 current approved site covers. A site-cover count is **not** the count of original Marian icons/statues/grottos approved.
- 127 relic entries, four current exact Commons photo leads recorded as **unpublished**, and **zero approved gallery images bound by exact `subject_relic_id`** as of this audit. Three earlier P68 exact research image selections remain in acquisition stage.
- 33 apparition entries. Do not infer canonical recognition from a sourced account.
- Six Saints pilot editorial biographies, explicitly `RESEARCH_ONLY_NOT_APP_VISIBLE`; **zero certified live full biographies from that pilot**. Other Saints source-index rows are not biographies.
- The old 2026-10-21 shrine inventory has historical hero statuses. The readiness audit recomputes current media joins rather than rewriting the inventory or misreporting those historic numbers.
These are **coverage signals**, not an assessment of writing quality. Every source text still needs sentence-level, EN/FR and theological editorial review.

## Visible experience
### 1. Map and discovery
Use one existing interactive world map with source-owned venue pins; avoid new geometric features or guessed exact entrances. Initial rail: **All, Shrines, Pilgrimages, Relics, Apparitions, Saints**. Preserve More and current Bible, Network, Time/Mass modules. Search respects exact name and location, original Place identity, and does not hide legitimate relevant matches behind unsupported category assertions. Photo-led list cards supplement the map but never replace it. Logos only for verified institutions. Map labels and category counters are based on actual visible/mapped results.

### 2. Compact preview (map selection or list item)
Single legible title, truthful location and precision warning, **one approved photographic image** if any, a short source-owned narrative, and no more than a few sourced subject cues. The CTA is Discover / Découvrir; Pray and Visit only appear where their actual target exists. If a priority **exact subject photograph** is later certified, allow it to become the editorial focal photograph, preserving its explicit role and credit. Never substitute an unrelated icon of the same saint, a generic shrine image, or an uncertain nearby site. Preserve the full original image (no artificial framing or crop that changes identity).
No citation wall, technical database IDs, invented access status, unsupported Mass schedule or repetitive empty section.

### 3. Full Place folio
**Hierarchy:** Place identity and area → approved Place hero or approved exact sacred-subject hero → short sourced introduction → documented sacred treasures / exact image of the focus object where available → source-owned sanctuary story → clearly attributed uncropped gallery → deeper pilgrimage guide (timeline, features, religious practices, route stops) → linked devotions and calendar → visiting information → quiet folded sources and geographical attribution.

The gallery is available **even without** a detailed pilgrimage guide. When an exact `subject_relic_id` photograph exists, its label must distinguish the **relic, container/reliquary, representation, historical display and current display**, include a meaningful date if necessary, and use existing verified licensing and per-photo caption. Photo descriptions must never imply independent relic authentication or contemporary display.

Chapter rail scrolls within the existing Place sheet. Do not duplicate opening narrative or invent unsupported source links. At mobile width, 44px touch targets, no horizontally clipped text or images; full-screen display remains navigable back to the same map. No oversized dashboard cards, decorative statistics or repeated badges.

### 4. Variant-specific editorial requirements
| Variant | Above-the-fold focus | Mandatory narrative and qualification |
| --- | --- | --- |
| Marian sanctuary | Actual venerated image/statue/tilma/grotto where verified, not façade by default | Marian title, object identity and location, origin/tradition, nature of devotion, official vs reported apparitions, historical timeline with sources |
| Relic or tomb | Relic/reliquary/tomb photograph if directly certified | Type of relic, precise place and custodian source, distinction of reported attribution from authenticated custody, date/location warnings, separate original evidence |
| Saint's shrine | Site and venerated shrine, then approved biography only when released | Correct saint/blessed identity, significant life, vocation, historically attested association to exact Place, dates and liturgical observance only from their respective owners |
| Apparition site | Exact grotto/chapel/commemorative image | Witnesses, dates, source and recognition state; never call claims Church-approved without explicit recognition record |
| Cathedral / monastery / church | Accurate whole-building and relevant architecture | Dedication, Catholic institution, art/architecture and historical role; do not fabricate a miracle or relic |
| Traditional Mass venue | Exact church/place and independently verified institute emblem | Source-owned times and ecclesial attributes only; do not display a meaningless empty TLM accordion on every Place folio |

### 5. Histories and biographies: content acceptance
For every **published long guide**, require at least: an original-language source trail, specific EN and FR titles/introduction, non-generic context of the site, chronological history with qualified traditions, actual principal devotional subject and its known position, usable pilgrimage/visit description **without claiming current opening hours**, relevant source-backed saint/relic/apparition edges, and a discreet source reading section. Each historical assertion has traceable evidence. Do not pad a poorly sourced Place with filler.
For a **compact record with insufficient witness material**, publish a polished, brief, source-attributed synopsis and consciously label unfinished long-guide research in the editorial ledger; do not show a blank biography box or claim the guide is finished.
For Saints, prefer existing approved Catholic primary biographies and correct dates; separate feast observance from life dates. Keep the six research-only pilot lives and other source-index snippets out of the canonical live biography presentation until explicitly released. Associated saint names in Place metadata **are not** full biographies.
EN/FR must be individually inspected for accuracy, names, pronouns, accents and theological nuance; English fallback must not masquerade as final French.

### 6. Source, photo and rights acceptance
A photo promotion requires (1) exact Place/subject match, (2) Commons/source original and photographer, (3) current licence and underlying modern-art reproduction rights where relevant, (4) original-byte SHA-1 and derivative SHA-256, (5) full-resolution mobile-friendly no-crop WebP, (6) exact object/Place binding and bilingual caption, (7) reviewed PR with test and screenshot evidence. Published photo and candidate photo are separate states. No paid storage, outreach to custodians, fee-bearing licensing, scraped Google images or expiring-only asset archives.
The 395 already-selected Place covers remain final human editorial choices; do not reopen them wholesale. Technical holds do not erase original choices. The new **sacred subject** queue is distinct from exterior/site-cover approvals.

## Release sequencing and non-regression acceptance
**P0 before Nov 2 pilot:** freeze map and routing; review screenshots of the existing 33 long-guide folios and focused source-backed relic examples; verify no false picture, broken image, missing French title, empty TLM CTA, duplicate chapter, scroll-trap or unverified visitor promise. Preserve approved MapCN design direction. Unverified subjects must stay unillustrated rather than display the wrong photo. A draft PR and test source contract do **not** constitute browser or visual certification.

**P1 editorial completion:** work through the 224 guide gaps by high-demand Marian/relic/major feast and Indian Ocean/Ireland priorities, using a source-first batch. A mature compact site record need not be padded into an inaccurate essay. Every newly published full guide gets sentence-level EN/FR checks.

**P1 photographic subject completion:** independently match and verify principal Marian images at the 118 Marian sites, then the 127 relic records; use the existing 72 photo research assignments for 26 relic identities as leads, not automatic approvals. Keep the approved exterior batch campaign separate. For each subject track VERIFIED_PUBLISHED, CANDIDATE_UNVERIFIED, NO_OPEN_SOURCE_FOUND or RIGHTS_HOLD, **never** infer completeness from a Place cover.

**P2 expansion:** finish independently source-certified new sites and regional guides. Associate biography, apparition, ritual/custom, shrine and Directory information only by original owner IDs. No fabricated pins or universal claims.

## Required screenshot and QA matrix
- Place preview and expanded folio for Lourdes (Marian + shrine), Notre-Dame Paris (multiple relics), Nevers (relic/tomb), Padua (reliquary), Knock or Pontmain (gallery), and a source-only Place with no approved photo.
- EN/FR at 320, 390 and 430px phones, plus desktop; world map ready, opened Place, gallery/relic, deep history, scroll to chapter, close back to same map.
- Explicit negative tests: research candidate image never rendered, subject image not linked to another relic, no source-less biography, no empty TLM section, no truncated sacred names, no duplicated Place pin or newly imagined schedule.
- Do not merge a UX change merely because the source contract passes; inspect actual captures and obtain design approval first.

## 31 October implementation slice
Draft branch `feature/explore-place-folio-priority-and-audit-20261031`: read-only completeness ledger; source-owned exact treasures displayed immediately after the published introduction, ahead of longer historical chapters; source-aware gallery heading when exact relic images exist; no empty unlinked TLM accordion; improved single-treasure layout. **No production publish and no content invention.**


## 31 October continuation — editorial language and folio UX
- Six guide corpora audited against original `main`: **49** English/French prose fields revised across the existing 33 published guides; **no non-prose data changes**, no ID/source/rights edits. The original 127 cited narrative paragraphs remain.
- Explicit application-facing writing removed from published guide prose; doctrinal/historical qualifications are retained as natural visitor-facing descriptions. This is a copyediting pass, **not** independent factual certification or approval of Saints biographies.
- Published introduction's exact original paragraph is now presented **once**; the later guide skips only that exact same text/source match in the same language, not another historical witness.
- Documented journeys move below long-guide material, with a valid chapter navigation shortcut. When an opening exists, its story shortcut is the unique target and the later text uses a distinct history heading.
- Added actual EN/FR folio regression fixtures for source-object order, nonduplicated opening and sourced journey placement. Added 33-guide editorial-copy contracts. They are registered under the existing Place-profile test command, but full Node / browser suites have **not** been executed in this review.
- Code syntax parse and source read-back were checked. Full 320/390/430 desktop/mobile visual QA and approved Claude design fidelity remain publication blockers.

## 31 October — actual mobile preview QA slice
- **392 of 530** current Place previews are image-free after accounting for the 18 approved gallery-HERO fallback Places not included in the 120 dedicated-cover Places; **81** of these photo-free previews have names exceeding 50 characters. Do not conflate *410 without cover* with *392 without any usable preview hero*.
- Published Explore C preview now carries a data-only approved-photo flag: no-photo phones are **one column**, illustrated phones retain the approved two-column photo card. Long sacred titles are not clamped and preview images use `object-fit: contain` to preserve the licensed uncropped photograph.
- Source-only Place fallbacks retain an actual full-reader CTA and occupy the same readable grid slot as a synopsis.
- `tests/explore-p0-mobile-preview-20261031.mjs` is wired into the Place-profile contract suite. The actual page-rendering function was also dynamically evaluated against one no-photo and one exact approved-photo fixture, both producing the correct markup.
- `tests/explore-folio-phone-visual-20261031.mjs` plus `.github/workflows/explore-folio-phone-visual-20261031.yml` aim for **72 real app screenshots**: six canonical Places (Lourdes, Notre-Dame Paris, Nevers, Padua, Pontmain, source-only Saint-Denis) × EN/FR × 320/390/430 × compact preview/expanded folio. Screenshots record runtime failures, missing chapter destinations, sheet overflow, duplicate story anchors, image decoding and original Place ID. Captures are **requested by the workflow but not yet claimed as passed**. Keep reviewer approval distinct from image decode, screenshot and map canvas presence.
