# Catholic Esther — complete source correspondence (9 October 2026)

## Verified text sequence, not a Protestant or abbreviated Esther

Two Catholic editions contain the same extended Esther corpus in a **different order**:
- **Douay–Rheims Challoner** edition witness, with 16 numbered chapters: https://ebible.org/engDRA/EST01.htm
- **CPDV original author's edition**, with 15 numbered chapters: https://sacredbible.org/catholic/OT-19_Esther.htm

Comparison of **all 274 CPDV author-master verses** against **all 275 Douay–Rheims verses** produces a complete, non-overlapping alignment. A single CPDV verse, **7:14**, encompasses two Douay verses, **4:12–13**. The difference is a segmentation choice: the content is preserved, not omitted.

| CPDV author-order chapter | Douay–Rheims verse sequence |
|---|---|
| 1 | 11:2–12 |
| 2 | 12:1–6 |
| 3 | 1:1–22 |
| 4 | 2:1–23 |
| 5 | 3:1–13 |
| 6 | 13:1–7, then 3:14–15 |
| 7 | 4:1–9, 15:2–3, 4:10–14, 15:1, 4:15–17, 13:8–18 |
| 8 | 14:1–19 |
| 9 | 15:4–19, then 5:1–14 |
| 10 | 6:1–14 |
| 11 | 7:1–10 |
| 12 | 8:1–12 |
| 13 | 16:1–24, then 8:13–17 |
| 14 | 9:1–32 |
| 15 | 10:1–13, then 11:1 |

**Review exception:** CPDV 7:14 = D–R 4:12–13 (a combined statement; one CPDV verse corresponds to a two-verse Douay range). The proper-name spellings of Esther 14:7 / D–R 9:7 also vary by transliteration.

### Execution rules
- The complete crosswalk is encoded in `src/scripture/esther-catholic-crosswalk.js`; reverse lookups preserve combined-verse identity.
- **Single-verse switching** between the two specified Catholic edition witnesses is now source-mapped, rather than inheriting the same numeric chapter.
- **Multi-verse ranges** remain fail-closed where they span non-contiguous Catholic additions; never flatten/rewrite source order or misrepresent a disjoint range as contiguous.
- Bookmarks must include their specific edition, and older bookmarks with no edition must not be silently assigned. Switching restores each edition's separate reading position.
- The GitHub Scripture source audit verifies the entire 274↔275 lookup against both downloaded sources with nonblank-verse coverage and lexical-overlap checks. The two-verse split and proper-name orthography are explicit exceptions.
- **Scope:** This is source-text *correspondence*, not independent theological approval of all translations. The full CPDV Bible remains disabled pending that distinct editorial gate.
- **Psalms and Song of Songs remain unresolved across editions** and must not inherit Esther's release status.

The larger purpose is that when a user is reading Douay–Rheims Esther 11:2 and chooses CPDV, the reader should point to CPDV Esther 1:1, **not** CPDV Esther 11:2.
