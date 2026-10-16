# Mystery of the Mass — Priority 2 completed triage, 15 October 2026

**Research-only. Existing PR #1193. No Mass reader or public Formation publication changed.**

## Scope and count

The three source workbooks were consolidated into a single 435 Latin micro-unit reference matrix, retaining 42 historical author/source-witness pairs, 139 earlier verified author-claim records and all 955 historical evidence attachments. Priority 1's 88 clauses were reviewed separately. Priority 2 contains **180 clauses**, all now individually triaged into prayer owners and actions: **58 preparatory / Communion clauses** in the earlier workbook pass plus **122 clauses** in this pass. This is coverage of the *triage*, not certification of individual theological sources or approval of 180 published study notes.

The current 37-tab downloadable conversation workbook is `Ad_Orientem_Mass_Master_Reference_Matrix_All_P2_Reviewed_2026-10-15.xlsx`. **The binary XLSX is not in GitHub.** Its previous 33 tabs were preserved; new review tabs are `33 P2 REVIEW REMAINING`, `34 P2 FAMILY STATUS`, `35 CREED DOCTRINAL LINKS`, `36 PRIEST CUES AND SPANS`.

| Family | Remaining P2 cases | Source / output disposition |
|---|---:|---|
| Kyrie, Gloria, Collect | 23 | Kyrie repetition and Gloria MM-PRIMARY-MB05; 1962 rubric for priest's bows |
| Lessons & Gospel | 11 | Correct Gospel proclamation roles, fixed responses, actual Proper readings |
| Credo | 25 | Two clauses reuse Incarnation study MM-PRIMARY-MB08; **23 doctrinal-source crosslinks still need careful editorial verification** |
| Offertory & incensation | 21 | Psalm 25 Lavabo, Psalm 140 incensation, earlier seven prayer-owner source dossiers, conditional ceremony |
| Preface & Sanctus | 6 | Existing MM-NEW-07 / MM-PRIMARY-MB11; Benedictus needs precise scriptural crossreference |
| Roman Canon doxology | 1 | Reuse AO.CANON.14 / MM-NEW-17: no extra consecration |
| Pater, fraction & Pax | 11 | Matthew/Luke compare, MM-PRIMARY-MB21 and MM-NEW-18, published triple-cross priest rubric |
| Ablutions / Postcommunion | 4 | MM-NEW-21, prescribed day-specific Postcommunion |
| Dismissal / blessing | 6 | Ite / Benedicamus / Requiescant and Requiem / special continuation exceptions |
| Last Gospel | 14 | John 1:1–14, matching 1962 Latin, prescribed Last Gospel omissions and Incarnation genuflection |

Previously completed P2 families: 27 Preparatory; 31 Priest and faithful Communion.

## Creed distinction — important

The 44 EN/FR manuscript studies include a Creed study `MM-PRIMARY-MB08` which concentrates on *Et incarnatus* and its posture. **Do not mark the entire Nicene-Constantinopolitan Creed theologically finished on that basis.** The earlier Roman Catechism (Council of Trent), Part I, Articles I–XII, is a useful theological comparator but comments on the **Apostles' Creed**, *not* a textual witness for every clause of the Nicene-Constantinopolitan Creed sung/recited in the 1962 Mass. Keep detailed dogmatic topics (eternal Sonship, two natures, Passion, Resurrection, Judgment, Holy Ghost, `Filioque`, Baptism, resurrection of the dead and life everlasting) under the existing Credo owner with article-level references and interpretative distinctions. Source: [Roman Catechism original translated witness](https://en.wikisource.org/wiki/The_Catechism_of_the_Council_of_Trent). Do not invent original-author Scripture citation cells.

## Published gesture reuse

The existing 1962 event registry already contains published **priest** action events on six P2 cues:
- `AO.RUB.C0058.01` — `Gratias agimus tibi`, Gloria head bow
- `AO.RUB.C0064.01` — `suscipe deprecationem nostram`, Gloria head bow
- `AO.RUB.C0068.01` — `Cum Sancto Spiritu`, Sign of Cross
- `AO.RUB.C0093.01` — `Iesum Christum`, Creed head bow
- `AO.RUB.C0104.01` — `Et vitam venturi saeculi`, Sign of Cross
- `AO.RUB.C0219.01` — `Pax Domini`, three crosses with consecrated particle

These event IDs come from `data/presentation/reader-rubric-events.v1.json`, with source `MR62_RITUS`. They must **not be duplicated** in Mystery author-explanation datasets, and a priest cue is not a universal command to the faithful. Other gesture/form candidates at `AO.SM.C0096` (Incarnatus), `C0119` (Offertory sign), `C0148` (Benedictus), `C0265` (blessing) and `C0273` (Last Gospel Incarnation) need cross-registry timing and role/profile review; no new source event was certified here.

## Original clause-boundary issue

Ten microextracts start with a detached comma or otherwise have a boundary flag: `AO.V3.0225.U003`, `0229.U002`, `0230.U002`, `0231.U002`, `0243.U002`, `0244.U002`, `0245.U002`, `0226.U003`, `0227.U003`, and `0099.U002`. These are **micro-segmentation checks** against canonical donor offsets, *not* evidence that the 1962 reader itself has corrupt Latin. Keep the published text unchanged.

## Publication and next phases

The 37-tab XLSX is a **reviewed research workbook**, not a final devotional/theological publication. No new author attribution, no AI-authored sacred historical narrative, no extra LIVE Mass card, no editorial acceptance granted. Next sensible work is (1) fast family-based triage of 57 Priority 3 mostly repeated clauses; (2) close the Creed's 23 subject-to-author/doctrinal-source links in a bounded source-citation pass; (3) prioritize genuinely unique prayer-level bilingual interpretations and release-readiness against the original 65–67 curated LIVE card model; (4) preserve any unresolved page-image research as clearly flagged, rather than letting it stall the entire app.

Structured machine-readable register: `data/learn/research/mystery-mass-p2-remaining122-family-review-20261015.v1.json`; regression test `tests/mystery-mass-p2-family-review.mjs`.
