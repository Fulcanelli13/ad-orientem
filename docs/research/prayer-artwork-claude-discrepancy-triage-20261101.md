# Prayer artwork — Claude workbook audit triage (1 November 2026)

**Status:** read-only reconciliation note on draft PR #2144, source head `cce27384f298eb335be31f47105a416663d424f9`. No approved assignment, original user decision, image asset, production flag, runtime route, or release changed by this note.

## Inputs and interpretation

- User-supplied 1 Nov Claude report (16 groups C01–C16 labelled confirmed violations; 18 questions U01–U18; 14 prior holds). These are **audit classifications**, not 34 automatically approved corrections.
- Preserved `data/calendar/prayer-art-reviewed117-user-decisions-20261028.v1.json` (47 KEEP, 51 REJECT, 6 ELSEWHERE, 13 BETTER PHOTO).
- `data/prayer/artwork-editorial-20261030/decision-ledger-b01-b05.v1.json` (250 records, 28 verbatim semantic instructions).
- `data/prayer/artwork-editorial-20261030/approved-unified-b06-b11-from-user-message.v1.json` (107 accepted-as-shown; unshown options **not rejected**).
- `data/prayer/artwork-editorial-20261101/curatorial-master-267-20261101.v1.json` (267 mapped current selections), family candidate shards, accepted-alternative lists and source crosswalk.

## Verified priority conflicts

| Item | Slot(s) | Verified evidence | Safe next disposition |
| --- | --- | --- | --- |
| C01 Morning cover | `COV-daily.morning` | October 28 `morning::morning--primary` **KEEP**; primary currently Sassoferrato rather than retained `morning--primary` | Reconnect original artwork ID before any live change; no fresh candidate substitution |
| C02 Evening cover | `COV-daily.evening` | October 28 `evening--primary`, `morning--millet-angelus`, `confession--latour-magdalen` **KEEP**; `morning--millet-angelus` moved to Evening | Recover each kept purpose; distinguish exact cover from accepted secondary uses |
| C03 Hymns | `COV-prayer.hymns` | October 28 Rubens `historic:peter paul rubens:assumption of the virgin` **KEEP**, but no primary painting | Restore kept ID and correct missing family after identity validation |
| C06 Penitential Psalms | `COV-pray.penitential_psalms`, `STG-pray.penitential_psalms-02` | October 28 `penitential-psalms::confession--primary` **REJECT**; current primary uses Murillo `Return of the Prodigal Son` | HOLD these two placements; **do not** remove the valid Confession lock |
| C07 Lochner | `COV-pray.montfort_consecration` | B04 note on `REVIEW::cma:143761`: “explicit mystery in rosary” with target `rosary_coronation_of_virgin`; primary is a Montfort cover | HOLD primary pending explicit non-Coronation approval; retain as approved Coronation option |
| C08 Carracci Coronation | Loreto/Litany primaries and other inherited placements | `REVIEW::met:435853` has the **same Coronation mystery instruction**; scope must not be broadened by originally proposed slots | Scope-reconcile all placements, preserving other independent approvals if any |
| C09 Raphael/Romano Visitation | Rosary Visitation | `CANONICAL::ART-aphael-and-iulio-omano-he-isitation` B03: “explicitly a mystery in the rosary”, current active slots empty | Add approved **option for exact mystery**; no forced primary override |
| C10 Baptism | `HERO-03` options | Bassano `met-440393` / Tintoretto `cma-127746` comments target a **Rosary Baptism** mystery, not Epiphany hero | Remove semantic mislabelling; future slot requires Rosary product contract, not invented now |
| C15 Regina Caeli | `COV-pray.angelus_regina` | B01 Rubens `ART-eter-aul-ubens-esurrection-of-hrist` note explicitly says **Regina Caeli replaces Angelus cover during Easter** + Glorious Rosary Resurrection | Restore direct editorial target, while retaining previously accepted Ricci in historical options |
| C16 Good Death | `COV-prayer.good_death`, `STG-prayer.good_death-01` | Oct28 Altomonte and Giordano KEEP; Joseph REJECT; later B01 says Joseph “also fits for prayer for good death” | HOLD ambiguous cover, preserve Altomonte better-photo request and distinct dying/Good Death scopes |
| C12 St Anthony rejected Rubens | `COV-novena.st_anthony_nine_tuesdays`, `COV-devotion_st_anthony_lost_items` | Oct28 reject `historic:peter paul rubens:saint anthony of padua with the christ child`; matching Rubens original remains two active candidate rows | Exact-work exclusion on both placements, without global delisting of other originals |
| C13 Mass of St Gregory | `COV-pray.for_priests` | Batch02 `CANONICAL::met-437722` `NOT_RELEVANT_TO_PRAYER_ONLY`; same original is held primary and active proposal | HOLD primary and exclude original from suggestion list; **do not conflate** with other artists’ same-titled paintings |
| C11 double-listed alternatives | 11 placement/work pairs | Claude reports appearance in accepted-alternative and excluded-suggestions ledgers | Crosswalk by **original-object identity** and enforce exclusions; historic acceptance retained as evidence |

Also carry forward the earlier **three primary holds**: Franceschini Last Communion (`COV-adoration_lord_i_am_not_worthy`), Champaigne Communion cover (`COV-prayer.communion`), and Spanish Painter Mass of Saint Gregory (`COV-pray.for_priests`). Ugolino's **six later-veto placements** and Lochner's **five Coronation-scope alternatives** remain blocked from automatic use.

## Do not elevate audit heuristics into editorial authority

1. The 244 “earlier approved/inherited link” total is **not** 244 exact-slot user sign-offs. Conversely, the 57 research-table status disagreements in Claude's U14 are **not proof** that 57 primaries were never approved: research candidate eligibility and an inherited primary editorial rationale are different records. Reconcile per original-work ID, date, destination and written scope.
2. The source contract has 15 traditional Rosary mysteries. The reported missing Luminous stages (U04) require explicit reconciliation with the Rosary's existing agreed structure; do not add mysteries as a mechanical spreadsheet fix or infer this would allow Ugolino's previously vetoed image.
3. No stage replacement inferred solely from an artwork's broad suitability (“fits anywhere crucifixion”); use the exact prayer context and approved scope. The Lance Thrust (C05/U11) must retain the Oct28 Seven Words KEEP without silently selecting a specific word.
4. Some provisional home heroes are assigned a **conditional** same-occasion rotation policy: do not infer automatic rotation currently happens. Never put provisional artwork in a live rotation.
5. Keep three precise cover locks: user-supplied St Thérèse photograph, Lorenzo Lotto Rosary, MNAC Seven Sorrows; also protect established Ingres Adoration/Benediction. Keep unframed 90–95% paint-only crop requirements. Source identity alone is neither photographer-rights clearance nor image-pixel QA nor deployment permission.
6. Explicit user **REJECT placement** must not silently be promoted to a global artwork blacklist unless the original wording says so. Conversely, a different source ID for the **same original work** does not evade a scoped rejection.
7. Audit export bugs must be fixed before review: `[object Object]` in held slot fields, misleading “Explicit active slot IDs” copied from proposals, uploader names erroneously treated as artists, and photo-quality requirements omitted from the output workbook.

## Implementation gates (in order)

- **Gate A: decision identity.** Reconcile each original historic artwork ID, original-object link, action, comment, and exact scope. Reconstruct the per-slot authority ledger; eliminate erroneous active-proposal-to-approval inheritance.
- **Gate B: mandatory exclusion/hold overlay.** Deny both primary and alternative use for explicitly rejected original-work + placement pairs. Review C01–C16 and U01–U18 without silently making new decisions.
- **Gate C: deterministic restores only.** Apply direct *KEEP / ELSEWHERE / cover-replacement* assignments (Morning, Evening, Hymns, Rubens Regina Caeli etc.) when the exact source work is recovered; preserve current painting as an alternative only if independently eligible. Resolve Good Death, Communion and other genuine conflicts via user review instead.
- **Gate D: display/photo QA.** Correct family, fixed covers, one artwork per Rosary mystery (stable across beads), one artwork per Station, stage changes by meaningful stages; no auto-rotation of options. Verify source reproduction, rights, frame-free crop, device pixels and no Prado photographs.
- **Gate E: runtime and tests.** Only then wire vetted master to Prayer UI, run regression tests and perform visual device review. PR #2144 remains draft until gates are met.

**No external artwork research, new approvals, publication, or asset replacement is authorised by this triage.**
