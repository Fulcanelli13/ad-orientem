# Red Missal 2013 collation — Wave 3: Prayers at the Foot of the Altar

**Scope:** 39 fixed 1962 Ordo Missae English cues, `AO.SM.C0001–C0039` (covering the opening, Psalm 42, Confiteors, absolution, and ascent), compared to the **actual photographed pages** of the user's *Coalition in Support of Ecclesia Dei* May 2013 Red Missal. **Not** the variable Propers, Calendar Ordo or 2013 devotional appendices.

**Direct visual page evidence:** PDF p.12 (printed 11: opening, Judica me Psalm), PDF p.14 (printed 13: responses, Confiteor, Indulgentiam and versicles), PDF p.16 (printed 15: `Aufer a nobis`, `Oramus te`). The celebrant's Confiteor is explicitly abbreviated in this booklet; do not certify its three full text cues as verbatim matches.

## Concrete outcomes

| Classification | Cues | Count | Meaning |
| --- | --- | ---: | --- |
| `VISUALLY_COLLATED_EQUIVALENT_NO_CHANGE` | 33 cues, recorded individually in `data/research/mass-ordo-red-missal-2013-editorial.v1.json` | 33 | Printed Red reading substantively matches the existing Latin-faithful English; punctuation, capitalisation and speaker notation need not force changes |
| `APPROVED_THIRD_WAVE` | C0021, C0039 | 2 | The attached booklet directly supports improvements, registered as exact English cue corrections |
| `PRIEST_CONFITEOR_ONLY_ABBREVIATED_IN_BOOKLET` | C0016–C0018 | 3 | The printed booklet abbreviates the full priest's Confiteor as `I confess to Almighty God, etc.`; ministers' version is a partial parallel but cannot certify the celebrant's complete wording |
| `KNOWN_ENGLISH_DIFFERENCE_NOT_PROMOTED` | C0023 | 1 | Red Missal reads `and you, Father`; existing English says `and thee Father` without vocative comma. The source cue has an *already-approved Latin* `oráre` correction. The one-field-per-cue canonical correction table would overwrite that Latin fix if a second English rule were keyed identically; remediation requires field-aware support and tests first |

**39/39 cues accounted for** by one of the four reviewed statuses; the 33 retained cues do not imply exact-character equality of historical English translations.

### Wave 3 amendments

- **C0021 — Confiteor, ministers/people, PDF p.14:** `and to you Father, that I have sinned` becomes `and to you, Father, that I have sinned`. The printed missal has the same vocative punctuation, and Latin `et tibi, pater` remains untouched.
- **C0039 — Oramus te, PDF p.16:** replace the awkward original `whose relics are here, and of all the Saints: that thou wouldst vouchsafe to forgive me all my sins` with the booklet's `whose relics are here, and of all the Saints, that Thou wilt deign to pardon me all my sins`. Preserve the same two canonical cues (C0038–C0039) and no new ritual events.
- **C0023 held:** expected replacement `and thee Father` → `and you, Father` **must not be introduced by duplicating the cue key** in `CANONICAL_TEXT_CORRECTIONS`. The Latin accent correction `P1-011` remains higher priority until multi-field source-correction ownership is safely implemented.

## Reconciled progress

Of the **256 fixed Ordo Missae cues**:

- **21** approved English changes across Waves 1–3 (note: nine are the repeated Kyrie);
- **33** independently visually checked against the Red Missal and **retained** as substantively satisfactory;
- **3** have only an abbreviated priest-form witness in this booklet;
- **1** has a known English correction **blocked** by the single-field canonical cue registry;
- **198** have not yet received this direct Red Missal collation.

Thus **54/256** now have an approved editorial outcome (21 changed + 33 retained), **4/256** are partially reviewed/blocked, and **198/256** remain unreviewed. This is stronger than measuring only how many replacements were made, but it is not a claim that the 1962 Latin corpus has been fully page-collated.

## Source and release protection

- Original 1962 **Latin still controls**. English editorial preference does not alter gestures, priest/server dialogue, blessing signs, calendar, Mass-form choices or optional customs.
- Frozen LOW/SUNG donor arrays stay immutable; the two new English changes are made through the **same source-correction overlay before native reader composition**.
- CI must confirm every approved English amendment is visible in both LOW/SUNG × EN/FR reader projection, French remains unchanged, and the **existing C0023 Latin `oráre pro me` correction still applies**.
- No full transcription or redistribution of the uploaded copyrighted booklet. Short necessary excerpts serve only comparison and source verification.
- Next precondition for C0023: allow **distinct `latin` and `english` corrections under a shared cue ID**, retaining both original fingerprints, both correction IDs and idempotence. This is infrastructure, not a rationale for another open-ended liturgical source survey.
