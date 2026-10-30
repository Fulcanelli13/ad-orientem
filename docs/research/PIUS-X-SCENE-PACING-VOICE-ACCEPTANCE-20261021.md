# St Pius X — 12-scene visual-novel pacing and voice review

**21 October 2026 · Editorial acceptance study only, not browser-tested and not deployed.**

This review compares the **unchanged** source-owned Pius X dialogue graph from [PR #1458](https://github.com/Fulcanelli13/ad-orientem/pull/1458) against the [Living Church P2 stage, PR #1402](https://github.com/Fulcanelli13/ad-orientem/pull/1402) and the [documentary voice rules, PR #1419](https://github.com/Fulcanelli13/ad-orientem/pull/1419). The stage and style branches are separate and unmerged. No source-matched approval can be inferred from browser rendering, and no code in PR #1402 was overwritten.

**Reviewable content:** [standalone 12-scene HTML review](../../previews/pius-x-12scene-visual-novel-editorial-review-20261021.html), [source-owned review fixture](../../previews/pius-x-depth12-source-owned-review-fixture-20261021.json), [three source/voice comparison samples](../../previews/pius-x-three-voice-pacing-review-candidates-20261021.json), and [dependent-flow owner](../../data/learn/research/pius-x-12chapter-dependent-dialogue-flow-20261021.v1.json). The HTML embeds its 12-scene text dataset; it does not fetch any new Q&A dynamically. Its five approved Pius X illustration variants reference the **pinned PR #1402 asset commit** `2245d762237ef36fc778200ab2b3d536c342d2d4`. Images need access to that GitHub raw host to render; if absent, dialogue remains readable.

## Findings — priority order

1. **P0 — Documentary narration is speaking through the character.** In the 12 scenes there are 84 answer passages (one opening and six possible later answers per chapter). A rough lexical screen flags **54 of 84** for source/editorial framing such as “the Catechism,” “Salzano,” “the passage,” or “the encyclical.” This count is a string-based screening flag, **not** a manual voice-verification verdict. Such language belongs in a supplementary source panel or editorial note. **Change in review:** the unchanged source wording is displayed explicitly as **EDITORIAL SOURCE READING · NOT PAPAL SPEECH**. Only three hand-authored comparative paths can be toggled to *experimental* character lines. This avoids misrepresenting the other 81 passages as approved speech.
2. **P1 — Repeated questions break momentum.** Six paths have unusually high lexical overlap between consecutive questions (Jaccard of nontrivial English content words of at least 0.25): `SPX-027/F1` (0.50 between F1 and dependent D1), `SPX-036/F2` (0.33), `SPX-010/F2` (0.29 between F2 and D1), `SPX-023/F3` (0.29 between chapter opening and F3), `SPX-034/F2` (0.29 between opening and F2), `SPX-016/F3` (0.25 between F3 and D1). This is a **screen for manual comparison**, not proof of identical meaning. In the separate three-path voice experiments, the repeated Peter/Judas and correction questions are varied without adding new doctrinal claims; a question about an *avatar* is not put in historical character.
3. **P1 — Conversation is cut off by menu navigation.** The existing P2 20-path scene implements source-owned selectable questions with menu returns; the new authoring graph supports exact F1/F2/F3 parent-specific continuation, but has not been integrated into PR #1402. The review HTML stages **opening → selected F1/F2/F3 → only that parent's dependent D1**, then offers chapter return, related topic or opt-in eligibility check. No automatic walk through sibling questions.
4. **P1 — Source limits must remain outside the dramatic persona.** A question about someone's personal sacramental state cannot be decided through a historical character. In `SPX-023` the experimental third step explicitly uses an out-of-character editorial boundary. Four other previously flagged partially supported moral chapters also remain held in their original content owners.
5. **P2 — Pacing is already reasonably short but too formulaic.** Across this sample the mean source-written response is approximately **29 English words**. The concern is therefore not automatically too much text, but repetitive framing, insufficient change in rhetorical mode, and no sense that the answer responds to the previous visitor's specific choice. Avoid blanket cuts: preserve doctrine and qualification.
6. **P2 — Character direction and navigation should be subtle.** Keep the approved fixed St Pius X five-sprite pack, deep dark study, restrained source strip, scroll-safe choices and no floating messenger bubbles. The standalone HTML offers English/French, back, reset, sources, three editorial rating dimensions, and JSON export of local review notes. It does not silently write ratings to a server.

## Three high-leverage visual/voice comparisons

| Scene | Original issue | Edited *hypothesis* in the review, not a quotation |
| --- | --- | --- |
| `SPX-010`, Peter and Judas | Opening and F2 repeat the same contrast | F2 instead tests whether repentance diminishes the seriousness of Peter's fault; D1 then considers the distinction between sorrow and despair |
| `SPX-023`, Spiritual Communion | Source narrative language; anachronistic “avatar” in personal-disposition question | Direct distinction between desire and reception, followed by a clearly separate editorial limitation on personal Communion eligibility |
| `SPX-032`, Charitable correction | “Does patience mean error is true?” / “May I say error is false?” repeat the point | D1 asks for the purpose of correction; reply returns to the good of the other person rather than argument-winning |

**Voice approval:** PR #1419 requires early-twentieth-century Catholic diction appropriate to subject and audience, but does **not** license invented spiritual remedies, new substantive papal opinions, personal memories, regular use of papal *We*, or automatic quotations. These three demonstrations are unapproved B/C editorial hypotheses and must be compared against the exact historical witness, not simply scored for elegance.

## Evidence, technical and visual acceptance status

- Original 82 chapter roots and 327 authored Q&A nodes are unchanged. New review proposals do **not** increase the canonical question count, and the 3 voice trials do **not** replace existing answer owners.
- The standalone scene includes mobile breakpoints at 770px/420px, keyboard-focus outlines and reduced-motion controls **in source**, but screen layout, legibility, approved sprite decoding and accessibility were **not browser-tested** in this branch. Do not call this phone- or desktop-visual acceptance.
- The source sprite pack is pinned to an immutable commit from the separate PR #1402, rather than copied or regenerated. If the source branch is private/inaccessible, the preview will show a text fallback; failure to display a sprite is not proof that the approved image changed.
- The P2 host has a distinct source bridge pinned to older PR #1458 material and enforces zero approved responses. **Do not repoint its pin or inject the 327-turn authoring corpus into it.** This review is isolated until both owners agree on import, voice approvals and source-safe navigation.
- PR #1458 remains draft, no merge/deployment, no claim of production approval. CI static test checks JSON ownership and embedded JS syntax only; it cannot establish a rendered browser scene.

## Go/no-go for the next stage

**Go:** curated source-versus-voice comparison of 3 paths in a standalone review, preserving all original content, approved illustrative sprites, and user-selectable branches.

**No-go:** promotion of all 84 source paragraphs into Pius X's first-person speech; automatic Chanoine answers; unverified Denzinger citations; production integration or claim that the 12-scene mobile preview has passed visual regression.

**Recommended next action:** judge the three comparisons with the stage’s built-in pacing/voice/clarity ratings; revise the highest-friction original dialogue branches; obtain PR #1419 voice review and source-owner theological approval before the P2 host imports any of the corresponding turns.
