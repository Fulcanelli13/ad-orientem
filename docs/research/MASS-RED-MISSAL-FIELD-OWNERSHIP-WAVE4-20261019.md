# Canonical Mass text corrections — independent Latin/English field ownership

**Scope:** Complete the pending 2013 Red Missal Confiteor correction `AO.SM.C0023` without silently overriding the independently approved Latin `oráre` correction. Fixed 1962 Ordo Missae only; no Propers or calendar changes.

The 21 earlier English amendments were approved in Waves 1–3. This wave resolves the previously blocked Confiteor and, after a direct comparison of the photographed Red Missal's Gloria and Creed, approves two more Creed refinements and 32 retained English readings. Three priest-Confiteor cues remain only partially witnessed.

## Why a second correction previously failed

The original `CANONICAL_TEXT_CORRECTIONS` dictionary was indexed exclusively by cue ID, not by cue ID **and field**. Its existing C0023 rule is:
- Latin `P1-011`: `orare pro me` → `oráre pro me`.

The Red Missal English evidence for the **same** C0023 (printed p13 / scanned PDF p14) reads `and you, Father`, where the original English has `and thee Father` without a vocative comma.

Declaring a second `AO.SM.C0023` key in the original dictionary would overwrite the Latin correction at JavaScript object creation time. This is now avoided structurally, not by bypassing a test.

## Minimal backward-compatible implementation

- Preserve **all** existing entries, cue keys and legacy `canonicalCorrectionId` in the primary `CANONICAL_TEXT_CORRECTIONS` registry.
- Introduce a supplementary **field-owned** registry `CANONICAL_TEXT_ADDITIONAL_FIELD_CORRECTIONS` for corrections sharing the same cue but owning a distinct field.
- `getCanonicalTextCorrections(cueId)` rejects duplicate field ownership and unsupported target fields.
- `applyCanonicalTextCorrection` applies every owned correction with exact one-instance source checks, protecting the same Latin and English donor fingerprints; `canonicalCorrectionIds` exposes both provenance IDs, retaining `canonicalCorrectionId` for existing consumers.
- The 2013 Red Missal English change `RED-EN-2013-W4-01` converts **`and thee Father, to pray`** → **`and you, Father, to pray`** while leaving Latin `oráre pro me` untouched.
- No frozen donor JSON is edited, and no change occurs in French or the ritual/role/staging layer.

## Acceptance

`tests/canonical-text-corrections.mjs` validates field-specific manifest rows, unchanged unrelated fields, idempotence, and the exact paired C0023 Latin/English projection in both Low and Sung donors. `tests/mass-ordo-red-missal-editorial.mjs` checks all **24** approved English cue changes in actual Low/Sung and EN/FR native reader cards, preserving C0023 Latin `oráre` and explicit 2013 printed-page provenance.

Editorial count after this patch:
- **24/256** English changes approved
- **65/256** reviewed and retained without amendment
- **3/256** shortened-priest-Confiteor witness requiring independent collation
- **164/256** pending direct comparison
- **0** blocked by overlapping correction ownership

The next substantive pass should review the next booklet pages, including Gloria, Creed and Canon. Technical QA for this field-owner upgrade does not certify the remaining 198 prayers or the copyrighted booklet's redistribution rights.

## Direct Red Missal Gloria and Creed page comparison

- **Gloria (PDF p.18 / printed p.17):** 17 source cues, C0053–C0069, reviewed against the complete photographed English hymn. All 17 were retained as acceptable equivalents. In particular, `Glory to God in the highest` is a legitimate translation alongside the booklet's `Glory be to God on high`; no reason to disturb the existing composition or priest/Schola ownership.
- **Nicene Creed (PDF p.22 / printed p.21):** 17 source cues, C0089–C0105, compared against the printed English Creed. Fifteen were retained. The C0100–C0101 split renders `Who together with the Father and the Son is together adored`. The booklet instead expresses **`Who, together with the Father and the Son, is adored and glorified`**, preserving `simul adoratur et conglorificatur`. Two exact English source corrections restore the correct punctuation and remove the English repetition while preserving Latin, printed signs and cue IDs.

The updated source register distinguishes **24 approved changes**, **65 retained after direct English collation**, **3 partially witnessed**, and **164 not yet collated**, totaling the same **256** canonical fixed Ordo Missae cues. No claim is made about wholesale manuscript collation, French review, or variable daily Propers.
