# B04 — User-configured Personal Brief in the existing Morning/Evening reader

**28 October 2026.** This batch builds on live #1822 without creating another prayer reader, changing any historical prayer text, or touching the independent draft ICKSP/ICRSP full Office work in #1800.

## Selection contract

- The live source remains St Pius X **1913** (Morning 11 / Evening 10 core cards, optional supplements separate) or **1905** (Morning 10 / Evening 8). Complete mode and its optional preconciliar prayers are unchanged.
- Personal Brief is a **user-edited sequence of entire original source prayers** within the chosen edition, daypart, and their original printed order. There are **four independent saved selections**: 1913 Morning, 1913 Evening, 1905 Morning, 1905 Evening. Absence of a custom selection uses B03's existing starting list.
- The UI is in the existing compact Customize disclosure, below edition and language, within **Personal Brief**. It shows all eligible core IDs and simple pressed/not-pressed controls with English/French source titles. 1913 Evening `examen` is explicitly a **guided reflection**, not a spoken printed prayer. Supplement records are **not** part of Brief.
- The active daypart has at least **one** stage and fewer than the edition's **full** set. For the full printed order, switch to **Complete edition**. The app blocks removing the last selected stage or selecting the last unselected stage.
- A **Restore suggested Brief selection** control resets **only the active edition/daypart**. It never removes saved optional devotions, variants, another day's selection, or preferences for the other edition.
- Switching EN/FR/LA does not alter the selected IDs, which always resolve the **same source records** in that language. No text is split, paraphrased or translated by the editor; existing source status and translation provenance remain displayed.

## Storage, migration and safety

- Reuse local `ao.pray.personal-rule.v1` (version 1). New optional nested `briefSelections.{1905|1913}.{morning|evening}` arrays contain **only source IDs**; no prayer text, confidential examination, or remote persistence. All previously saved records with no overrides remain on their existing preset/full mode, unchanged.
- Normalize source IDs against the **exact selected edition** and daypart. Reject empty, full-length, duplicate, unknown, cross-edition, or supplement overrides and use the existing curated preset in those cases.
- Recompute card content, counts and progressive horizon colours from the selected ordered source cards on every re-render. **No clock-based advancement.** Navigation and saved source ID behavior remain owned by the established dual-axis reader; manual forward/backward automatically adjusts the sky.
- Preserve reduced-motion and existing local storage failure fallback. Do not unlock the separately guarded historical Short/Complete edition manifest.

## Coverage

- `tests/daily-personal-rule.mjs` validates selected source IDs and text identity, reordering to the printed order, all 1905/1913 × morning/evening × EN/FR/LA, stored-only IDs, independent selection, daypart-local restoration, boundaries and migration.
- `tests/pray-traditional-dual-axis-phone.mjs` tests Morning add/remove/reset with dynamic horizon, independently edited Evening, language switching, 320/390/768/1440px editor geometry, and continuation through existing reader/Examen.
- Required main, traditional dual-axis phone, guided prayer cards, 23-route parity, reader focus/language parity, and regression gates before merge.

## Explicit non-goals

No additional prayer-source discovery (owned by ICKSP draft #1800), no unrelated route, no new Calendar or Office, no image acquisition or museum-artwork rollout, no new storage charges. The existing light/dark atmospheric sky is retained as a meditation synchronized to **manual** prayer progress.
