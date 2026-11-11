# Sacred Art — definitive 2026 release closeout (11 November 2026)

**Source of truth for this reconciliation:** `sacred-art-2026-definitive-closeout-20261111.v1.json` (365 date rows + 267 canonical Prayer-art position rows + photo/provenance inventories). **This is a pinned, read-only snapshot, not a replacement for the live assignment registry.**

The conclusion is not that Sacred Art research is 36.7% finished. All 365 Calendar dates and all 267 Prayer positions have been examined, and the corresponding research is in different stages of production. The 36.7% number referred narrowly to 134 previous/proposed Calendar mappings **in one baseline**, excluding later reviewed-but-unreleased Class II/III candidates.

## Provenance without double counting

| Inventory | Count | What the number actually counts |
| --- | ---: | --- |
| Full 2026 Calendar | 365 | Immutable date/principal rows; 53 I, 76 II, 165 III, 71 IV |
| Calendar Class I | 53 | All already have named frozen paintings (24 previously mapped, 29 unreleased/previews/rights-held) |
| Class II follow-up dossiers | 75 | Already researched, in draft PR #2830; **not yet selected in production** |
| Class III follow-up dossiers | 131 | Merged PR #2834; **128** named proposals and **3** unresolved exact-scene or contextual choices |
| Calendar contextual mappings | 105 | 34 Class III plus 71 Class IV, requiring actual rendering verification |
| Historical Prayer art positions | 267 | Every position inventoried, not a count of unique paintings |
| Prayer positions with published exact photos | 51 | Historical production renderer states, including **four positions still referencing a rejected photograph** |
| Approved exact Prayer photo positions awaiting image | 138 | **Four** can directly reuse already released exact works via draft #2830; 134 remain after those four reuses |
| Other Prayer slot states | 78 | 31 source-ID holds; 22 provisional; 14 editorial holds; 5 inherited pools; 5 protected covers; 1 scope hold (these categories overlap no other Prayer rows) |
| Module photograph registry | 16 | Distinct registry entries on pinned main, **15** not the known rejected Bouts original |
| Master original archive | 22 selected / 20 bytes recovered | 20 previously acquired original files restored **on PR #2267**, NOT all in `main`; total 94,811,175 bytes; two not recovered |
| Bulk research downloads | 423 / 383 distinct pixel-file SHA previews | 345 Flemish + 78 SMK, produced in Actions; these are *not* 423 distinct paintings or production-ready originals |
| Separate historical painting approvals | 56 | Distinct option IDs in PR #2532; approval is of the artwork, not an automatic specific photo / Prayer-cover replacement |
| Historical many-to-many owner-accepted option edges | 507 | Option **relationships**, not 507 distinct physical paintings, in research PR #2726 |
| Many-to-many relationship rows | 1,589 | History + owner approvals + contextual reuses + Claude recommendations; **not** all owner-authorized assignments |
| Gallery research groups | 989 | 657 lexical category leads, 332 without title-level categories; gallery research is not the bottleneck to Calendar/Prayer release |
| Verified colour research JPEG sources | 10 | PR #2726, **zero** newly installed as public assets by that research branch |

The `640` targets from the external many-to-many branch are **365 Calendar + 275 Prayer/navigation**, where **eight navigation/alias targets are not part of the actual 267 canonical Prayer positions**. Treating 640 and 632 as discrepancies is incorrect.

The bulk 423 is **not necessarily retained durable source material**, because GitHub Actions research artifacts and in-branch image copies are different from assets packed for the public website. Never count an artifact manifest as a verified permanent release master.

## One production-first worklist, in strict order

### P0: remove the rejected photo that is actually published

Main still registers the **Albert Bouts, *The Annunciation*, Cleveland Museum of Art 1942.635** photo. The rejected physical painting is rendered in four Prayer positions: `STG-pray.angelus-04`, `-05`, `-06` and `STG-pray.rosary-02`. This is a violation of the owner's later rejection. Review **PR #2770**, fix its outstanding photo/UI test issues, remove the file from Pages, and verify the exact object and its aliases are absent everywhere without excluding the separately approved Champaigne *Annunciation*. Do not declare that four positions have replacement images until checked.

### P1: integrate images already present, no new acquisitions

Draft **PR #2830** contains four explicit reused-photo pins, already artist/title/source-verified in the historical Prayer master:

- `HERO-22` → Benson *Salvator Mundi* (`king`)
- `STG-programme.first_saturday-01` → Morlete Ruiz *Heart of Mary* (`heart-mary`)
- `COV-pray.adoration` and `COV-pray.forty_hours` → Ingres *Virgin Adoring the Host* (`adoration`)

The three **distinct existing originals** serve four slots. The four safe reuse records are already coded in draft; resolve its remaining photo-test failures and integrate without broad title-only matching.

### P1: finish frozen approvals and source recovery

Complete the **29 Class I** frozen painting releases. The artwork selection is not an open question. Recover existing source bytes before any fresh downloads; check PR #2267's 20 original file SHA-256 values and associated photo rights, app layout QA and exact identity. The 423 research images and 10 colour verified downloads are source archives or CI artifacts, not prescriptive editorial decisions.

For Prayer, process the **134 remaining exact-approved photo slots after four reuse pins** by deduplicated source keys (the November crosswalk identifies **73 potential source keys for all 138 originally pending slots**, not a verified count of unique originals). Reuse the archives and released module registry wherever an *exact original* is established. Keep the five protected covers unchanged.

### P2: implement existing Calendar curatorial work, one bulk review

- Class II: 75 completed dossiers from PR #2830. Rank the exact Gospel/saint works; 15 rows mark unresolved scene gaps within second-batch triage, not 15 brand-new dates without any research. Do not infer date approval.
- Class III: 128 proposed named paintings for 131 remaining dates from merged #2834; three true exact-scene gaps (Soter & Caius, Boniface, Nazarius/Celsus/Victor I/Innocent I); two partial martyr-group compositions (12 May and 10 July) must be labeled correctly.
- Preserve the **105** existing Class III/IV contextual mappings. Ordinary ferias do not require individually curated new oil paintings.

### P2/P3: leave genuine editorial exceptions explicit

Prayer crosswalk: 31 source-identity holds (do not replace selected paintings), 22 provisional selections, 14 editorial holds, 1 scope hold, 5 inherited child pools, 5 protected covers. Group all actual discretionary decisions in one batch. Do **not** force a choice for each of 267 slots or treat image QA as an artwork selection decision.

### P3: certify GitHub Pages release, not just green research tests

Check exact artworks and subject captions, photographer credits/rights, EN/FR, 320px/390px rendering, image fallback, full-painting versus cover-crop controls, no rejected objects and proper feast-date mapping. Publish only from approved static output through GitHub Actions + GitHub Pages. No Vercel.

## Ready-for-action versus researched versus already published

**Published on pinned main**: the 16 registry photo entries and 51 Prayer exact-photo positions, including the outstanding Bouts defect. These are facts of the source registry and *not* independently verified public browser screenshots.

**Already coded but not integrated**: the four exact Prayer reused-photo pins in PR #2830; selected image source patches and recovered 20-file asset bytes on separate draft PRs.

**Already curated, not production selected**: all 75 Class II and 128 Class III candidate date placements.

**Still requiring original-source/photo/release checks**: 29 frozen Class I selections and most of the 134 approved but photograph-pending Prayer slots.

**Genuinely open subject/editorial gaps**: Class III's three exact-scene gaps plus the explicitly held/provisional Prayer positions and Class II scene rows. These do not justify another general gallery crawl.

## Snapshot contract

This is intentionally a separate audit register, not a runtime source. It retains the exact prior editorial records and actual app state rather than treating research-only approvals as release authority. A subsequent merge of #2770 or #2830 changes the real app and should produce a **new** release census; it must never silently rewrite the historical evidence contained here.

Run `node tests/sacred-art-2026-definitive-closeout.test.mjs` to verify the entire 632-position join and provenance/integrity guardrails.
