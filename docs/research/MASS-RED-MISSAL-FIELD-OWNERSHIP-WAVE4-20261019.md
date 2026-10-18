# Canonical Mass text corrections — independent Latin/English field ownership

**Scope:** Complete the pending 2013 Red Missal Confiteor correction `AO.SM.C0023` without silently overriding the independently approved Latin `oráre` correction. Fixed 1962 Ordo Missae only; no Propers or calendar changes.

The 21 previous English amendments were approved in Waves 1–3; 33 opening cues were retained after booklet comparison, 3 priest Confiteor cues remain only partially witnessed, and 198 have not yet been collated. This change completes the sole blocked overlapping-field case.

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

`tests/canonical-text-corrections.mjs` validates field-specific manifest rows, unchanged unrelated fields, idempotence, and the exact paired C0023 Latin/English projection in both Low and Sung donors. `tests/mass-ordo-red-missal-editorial.mjs` checks all **22** approved English cue changes in actual Low/Sung and EN/FR native reader cards, preserving C0023 Latin `oráre` and explicit 2013 printed-page provenance.

Editorial count after this patch:
- **22/256** English changes approved
- **33/256** reviewed and retained without amendment
- **3/256** shortened-priest-Confiteor witness requiring independent collation
- **198/256** pending direct comparison
- **0** blocked by overlapping correction ownership

The next substantive pass should review the next booklet pages, including Gloria, Creed and Canon. Technical QA for this field-owner upgrade does not certify the remaining 198 prayers or the copyrighted booklet's redistribution rights.
