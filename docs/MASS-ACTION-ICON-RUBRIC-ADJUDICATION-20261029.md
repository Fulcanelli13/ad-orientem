# Mass action-icon rubric adjudication — 29 October 2026

This correction changes **no Mass words, card IDs, user-approved artwork names, image bytes, or local custom preferences**. It corrects three action-icon source-ownership errors and a reversed historical cue-to-asset crosswalk.

| Exact source cue | Published source action/text | Correct presentation |
| --- | --- | --- |
| AO.SM.C0072 | Oremus; priest turns to the Missal | Position transition only; **no** premature orans action picture |
| AO.SM.C0073 | Collect proper | Retain approved hands-extended orans graphic **where a source-owned action is present** (e.g. Low Mass) |
| AO.SM.C0125 | Lavabo; minister pours water while priest washes | Priest-action rail text-only; keep server artwork for a properly actor-owned minister lane, not a priest pictogram |
| AO.SM.C0247 | *Quod ore sumpsimus* — first wine/chalice purification | `ao_purify_chalice` / approved "Priest purify Chalice" |
| AO.SM.C0248 | *Corpus tuum* — wine-and-water ablution of fingers | `ao_purify_fingers` / approved "Priest purify Fingers" |
| AO.SM.C0253 | Oremus; priest turns to the Missal | Position transition only; **no** premature orans action picture |
| AO.SM.C0254 | Postcommunion proper | Retain approved orans only with an explicit source-owned action |

**Authority:** the 1962 *Missale Romanum, Ritus servandus*, particularly VIII (ablutions), as published at https://www.mercaba.org/LITURGIA/Tridentino/missale-romanum-1962.pdf ; the ICRSP France *Ordo Missae (1962)* at https://icrspfrance.fr/textes-liturgiques.php?article=a0003_ancien distinguishes `Quod ore`, server wine pouring, and `Corpus tuum` with finger ablution.

**Registry decisions:** The 20 October approved-image review had correctly locked **both** original artwork files and immutable user names but assigned them to the opposite consecutive cue. The canonical 21 October semantic runtime had already corrected the prayer-specific order; the frozen-names crosswalk and 65-card compatibility keys had not. This edit reconciles all mappings and retains original hashes. At C0072/C0253 the sourced action label is **TURNS TO MISSAL**, not hands extended. At C0125 the available Lavabo image is a minister pouring water; retaining it in the approved bank does not license putting a minister's act in the priest rail.

**Unchanged:** source-specific low-Mass orans C0073/C0254, Canon and elevations, special-form omissions (including Requiem), posture choice, Schola clock, priest station and text-only source rubrics. The existing remaining 113 text-only/exception crosswalk rows are deliberately **not** bulk auto-filled with substitute icons.

**Gate:** `node tests/mass-icon-canonical-coverage.mjs` verifies role/cue ownership across sung, solemn, low, original prayers and approved art; `node tests/mass-final-icon-crosswalk.mjs` certifies immutable names/hashes; `node tests/reader-final65-position-icons.mjs` checks the exact 65-card crosswalk; full Mass R17 phone CI must pass before merge.
