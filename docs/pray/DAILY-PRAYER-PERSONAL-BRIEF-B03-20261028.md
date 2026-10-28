# Daily Prayer B03 — Personal Brief, a curated selection of complete prayers

**28 October 2026.** Scope: Ad Orientem's existing St Pius X 1905/1913 personal Morning/Evening reader only. This is a separately labelled **app-authored personal selection**, not a printed historical “Short St Pius X” witness. It does not modify the guarded independent historical-formulation manifest.

## Exact source-ID selections

The six Morning prayers are the same for both editions, but their *texts* remain edition-specific:

| Position | Morning 1913 and 1905 source ID | Title |
| --- | --- | --- |
| 1 | `sign-of-cross` | Sign of the Cross |
| 2 | `daily-prayer` | **Combined** Morning Adoration, Thanksgiving and Offering (one complete original prayer) |
| 3 | `our-father` | Our Father |
| 4 | `hail-mary` | Hail Mary |
| 5 | `salve-regina` | Salve Regina |
| 6 | `guardian-angel` | Guardian Angel |

| Position | Evening 1913 source ID | Title |
| --- | --- | --- |
| 1 | `daily-prayer` | Evening Adoration and Thanksgiving |
| 2 | `our-father` | Our Father |
| 3 | `hail-mary` | Hail Mary |
| 4 | `examen` | Existing guided Examination of Conscience handoff, **not** falsely a spoken printed collect |
| 5 | `contrition` | Act of Contrition |

| Position | Evening 1905 source ID | Title |
| --- | --- | --- |
| 1 | `daily-prayer` | Evening Adoration and Thanksgiving |
| 2 | `our-father` | Our Father |
| 3 | `hail-mary` | Hail Mary |
| 4 | `contrition` | Act of Contrition |

A new historical examination is **not** inserted into the 1905 edition. Nothing else is silently reclassified as a printed catechism prayer. The omitted whole prayers remain accessible in the **Complete edition** selection.

## UX and data invariants

1. **Default unchanged:** 1913 Complete edition / Standard, 11 Morning and 10 Evening core cards. 1905 Complete edition remains 10 Morning / 8 Evening.
2. **Explicit opt-in:** Personal Brief selection in the existing compact customization disclosure. Its label explains that it is **Ad Orientem's** choice of complete prayers and not an independent printed short edition.
3. **Full original text:** Reuse existing row IDs, complete source texts, source URLs, original order and translation metadata; never split, summarize, invent or change a prayer paragraph. The printed 1913 Morning Adoration/Thanksgiving/Offering stays as one combined unit.
4. **Manual sky progression:** 6 Morning stages give sunrise; 5 (1913) or 4 (1905) Evening stages give sunset. Switching length starts afresh at the initial sky state. Each individual stage advances color and moving backward reverses it. Optional clock has no role in card progress.
5. **User preferences:** Add `length: "full"|"brief"` to normalized version-1 personal preferences, defaulting to `full` for all previously saved records. Chosen optional prayers, mode, language and full-routine alternative texts remain saved but **dormant** while Brief is selected. Returning to Complete restores them exactly. No separate shadow storage, personal confession data, or changed source IDs.
6. **Short is fewer complete prayers**, not a historic witness, time-based auto-advance, shortened text, or app claim to recite an entire Office. The ICKSP/ICRSP draft Compline reader remains entirely separate. The `daily-approved-formulations.js` independent historical-profile release gate stays disabled.
7. **Accessibility/phone:** Source-exact French, English, Latin; focus/reader gestures unaltered; compact selector within the existing daypart rail, not above the horizon in a new full-height panel.

## Acceptance

- Unit coverage on 1905 and 1913 × Morning and Evening × EN/FR/LA: exact chosen IDs, counts, original text/source URLs and order, complete recovery, saved prefs upgrade default, optional prayer retention, examination boundaries.
- Real 390px phone: Morning 1913 11→6→11 and sky endpoint; Evening 1905 8→4→8 and 1913 10→5→10 with guided examination; full card layout and language still fit.
- Required main regression suite, traditional daily dual-axis phone, prayer guided cards, 23-route parity and wider reader checks before production.

## Outstanding editorial choice

These exact included/omitted prayer IDs are the **first explicit opt-in Personal Brief configuration**, a reviewed product choice, not a claim to the user's final editorial preference. A future user-directed configuration may add a separate manual Brief-card selection UI with full-text constraints. Do not imply the source itself prescribed these omissions, nor turn it into a global default. Further ICKSP coverage and museum-quality rotating prayer artworks are owned by existing parallel research streams.
