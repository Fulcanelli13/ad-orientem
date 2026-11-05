# Ad Orientem Prayer — Prototype Fidelity Recovery Ledger (4 November 2026)

**Status: open. Not a deployment or completion certificate.**

## Authorities and precedence

1. `Ad_Orientem_Prayer_ULTRA_MASTER_v5.1_PUBLISHED_178_Sheets.xlsx` (31 October; 178 sheets): the saved editorial, content, route and design master. Historical sheets and later explicit approvals are preserved.
2. `ad-orientem-prayer-mosaic-prototype.html` (27 October): approved *visual and interaction study* for discovery and category entry. Its **eight study categories do not supersede the final nine canonical doors**; do not delete, duplicate or remap a door to match a screenshot.
3. Claude correction pack (30 October) and subsequent user-approved Prayer readers: specific reader-level visual authority. Identify a precise screenshot/spec before changing a specialised reader.
4. Current main: source of canonical prayer data, original Lab Ora Rosary donor, source provenance, release-cleared photo registry and actual navigation owners. Code existence or CI success **does not establish visual acceptance**.

## Non-negotiable preservation

- No invented, unreleased, candidate, or borrowed art; door painting assignment must pass the existing exact-slot editorial and rights gates.
- Latin/vernacular source distinction and personal-group roles are not flattened into a generic reader.
- Rosary remains original bead-by-bead source-owned engine. Scripture quotation certification and its visual phase are separate.
- Confession privacy, sacramental sequencing, original examination, historical-source qualifications and approved paths remain intact.
- Benediction is a public rite, not simulated clergy actions; preserve its seven-stage source owner.
- Nine primary Prayer doors, their unambiguous canonical routes, search, return navigation and My Customs remain discoverable.
- No repackaging functional test passes as “pixel-identical”.

## Restoration queue

| Area | Verified 4 Nov baseline | Change/status | Visual sign-off |
| --- | --- | --- | --- |
| Landing/discovery | Existing nine-door pilot uses small icon-led grid; older study uses full-bleed responsive painting gallery and first-tap reveal | R1 in draft PR #2426: dark masonry, source-gated photos, nine doors, second-activation routing | **PENDING** real 320/390/desktop screenshots |
| Category interiors | Previous two-column conventional cards, faceted filters and source-gated cover | **R2 IMPLEMENTED ON DRAFT**: study-style artwork header, overlaid title, numbered linear prayer rows and existing functional filters; preserves exact images and canonical route identities | **PENDING** live 320/390/desktop comparison |
| Essential Prayers F01 | Original Claude Holy Card source and three-column lace fan survived but the default route selected the newer continuous reader | **R3 IMPLEMENTED ON DRAFT**: original reversible Holy Card as default for all 32, artwork-first face, Latin incipit, source prayer reverse and Aa language selection; continuous flow retained only with `?aoEssentialFlow=1`, with no new art or texts | **PENDING** complete 320/390 real-browser test and source-to-golden screenshot sign-off |
| Choir / litanies | Specialised invocations and role/response rails exist; Loreto display pilot is opt-in | **OPEN** assess each approved family prototype before changing defaults | PENDING |
| Chaplets F07 | Five Wounds / Precious Blood / Little Crown source-owner readers active; Mercy F07 pilot opt-in | **OPEN** finish m1/m2/m3 phone visual comparisons and approved spacing/footer | PENDING |
| Confession F12 | Three paths, examinations, nine rite guidance cards, privacy preserved | **OPEN** compare every 320/390 screen with correction pack, no simulated sacramental outcomes | PENDING |
| Adoration / Benediction | Specialised source-owned modes and seven-stage rite in main | **OPEN** compare image chooser, stage cards, incipits, rubrics and safe public/private distinction | PENDING |
| Angelus / Regina Cæli | Source-owned season/hour entry, bell group and gesture/cinematic policies | **OPEN** storyboard fidelity and exact approved artwork gates | PENDING |
| Daily Prayer, Stations, novenas | Specialised routines, 14 Stations, programme owners exist | **OPEN** visual and stage-by-stage comparison; source text verification separately tracked | PENDING |
| Original Rosary | Lab Ora prayer/bead owner retained; per-bead quotation releases source-gated | **DEFERRED BY USER** until Prayer journeys are reconciled | NOT STARTED |

## R1 acceptance checklist

- [x] Preserve the later approved **nine** doors; don't copy the eight-category study inventory.
- [x] Source-code introduction of two-step reveal + visual gallery, without new image publication or prayer data changes.
- [x] Source contract and 320/390 primary mobile test updated for intentional interaction difference.
- [x] R2 source-level category interiors restored without redirecting canonical prayers, changing artwork licenses or removing filters.
- [x] R3 F01 default restored to original Claude Holy Card with 3-column tilted lace fan and 500ms Y-flip; the later continuous reader is now explicit opt-in.
- [x] F01 source contract, 32-card mobile checks, original 3-column gallery geometry checks, and explicit flow regression test staged.
- [ ] Real screenshots of F01 collection/front/reverse compared directly to Claude 30 October golden screenshots at 320 and 390px.
- [x] Route/offline/artwork phone tests updated to exercise the intentional two-step landing navigation; released painting uses contain to prevent unauthorized crops.
- [x] Source checks and full PR CI green on HEAD `6703a20a1c702cdb999ea343ad0da74ef0057584`: 41/41 completed successfully (verified 4 Nov 2026); repair **real** regressions rather than loosening independent tests.
- [ ] Real 320, 390 and desktop comparison at matching viewport, text language and artwork states.
- [ ] User visual sign-off against study, acknowledging licensed/approved artwork gaps.
- [ ] Merge and exact production SHA validation.

**No merge of R1/R2 while open gates remain.** This ledger is a review aid, not a rewrite of the 178-sheet master. Subsequent rounds append evidence and actual screenshots, not just completion labels.


## 4 November 2026 — current-head implementation and review evidence

**Head / acceptance.** PR #2426 head is \`6703a20a1c702cdb999ea343ad0da74ef0057584\`. Its 41 pull-request GitHub Actions workflow runs have **41 completed successes, no reported failure or skip**, including Required main, app convergence, Visual acceptance capture, 41-route EN/FR 320/390 entry, Rosary prayer-first, F01 source-face, source integrity, Confession dual-axis/privacy, Benediction and Adoration. The earlier PR-body claim of pending post-correction CI is superseded for this exact HEAD. Refer to the [PR checks](https://github.com/Fulcanelli13/ad-orientem/pull/2426/checks), the [visual acceptance run](https://github.com/Fulcanelli13/ad-orientem/actions/runs/41882312063), and the [canonical Prayer capture run](https://github.com/Fulcanelli13/ad-orientem/actions/runs/41882312322). This is **not** original-print certification or personal-device acceptance.

**Real browser screenshot inspection.** The canonical-phone artifact \`canonical-prayer-source-faces\` (run \`41882312322\`, artifact \`13350343157\`) contains discovery, eight shelf views, F01 collection/front/reverse, Angelus and Adoration at 320/390. The latest capture shows (i) a masonry discovery surface with functional floating controls and nine source-owned doors, (ii) numbered and thin-ruled category text rows without the prior orphaned image-credit fragments, (iii) the reversible F01 Holy Card with prayer reverse and published artwork where available, and (iv) one published Ingres cover with legible but visually prominent source credit in the Eucharistic shelf. Some non-cleared door slots and individual Holy Card faces deliberately use empty/icon states. Screenshot inspection does not substitute for side-by-side signed acceptance against the **original Claude golden** at corresponding viewport/artwork state; desktop and the explicit visual-exception decision remain open.

**Artwork exact-slot census, separately controlled by [issue #2449](https://github.com/Fulcanelli13/ad-orientem/issues/2449).** Of **nine** discovery covers: **one** already published (D5 Ingres, protected); **three** have selected works but lack verified exact-file publication (D2 van Balen Trinity, D3 Caravaggio Madonna of the Rosary, D8 Franceschini Guardian Angel); **five** have no authorised fixed cover or rotation (D1, D4, D6, D7, D9). Source-reported Commons SHA-1 and original dimensions for the three selected works do **not** constitute local-byte SHA-256, native quality inspection, licence jurisdiction review or cleared responsive derivatives. Preserve fail-closed publication. The 15 R5D source-owner artwork anchors are **not** 15 released photographs; [draft #2398](https://github.com/Fulcanelli13/ad-orientem/pull/2398) remains the exact-file/rights/quality research hold.

**Code integration.** Current main has moved ahead of this branch with unrelated Mass, Atlas, Schola and GitHub Pages changes. Commit comparison reports 19 newer main commits and no overlapping changed filenames in the two diff sets at this snapshot; GitHub's PR metadata subsequently reported \`mergeable:true\`. Do not infer that the old PR-head CI automatically certifies the future merge commit. Refresh the source and re-run the required release checks at final integration.

**Decision and next operational queue.** (1) Finish screenshot-to-golden visual judgement or list explicit, approved placeholder exceptions; (2) resolve any real visual findings on #2426 without modifying Prayer content, Confession, or Rosary; (3) release exact three selected paintings only after their original-file and local rights/pixel QA, leaving five unassigned door covers for separate user editorial disposition; (4) give a final GitHub Pages build/readiness + SHA check after merge. **Do not merge #2426 or publish art solely on green automation.** No Vercel deployment is permitted.
