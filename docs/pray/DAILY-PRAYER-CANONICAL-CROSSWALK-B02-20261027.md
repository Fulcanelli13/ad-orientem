# Morning and Evening historical texts — canonical comparison B02

**27 October 2026 · Draft research PR #1785 · not merged · no changes to app prayer content**

## Method

B01 catalogued 93 **source occurrences** from 4 historical books. B02 reconciles each occurrence with the **actual 48 prayer IDs** on `main`, distinguishes shared prayer *identity* from identical text, and records likely shared opening phrases. This is **not** an exact full-text collation and therefore cannot prove two prayers are textually identical merely from an incipit.

Machine data: `data/pray/daily-prayer-canonical-crosswalk.b02.json`.

## Results

| Crosswalk indicator | Count | Interpretation |
| --- | ---: | --- |
| Catalogued source occurrences | **93** | Occurrences across morning/evening and books, not unique prayers |
| Existing canonical prayer bank | **48** | All IDs inspected, not all used by daily routines |
| Source occurrences with an existing prayer family but differing/uncertified words | **34** | Existing identity available; text requires historical witness variant rather than silent replacement |
| Source occurrences not represented by a dedicated canonical prayer ID | **46** | Missing source-specific texts, even if other prayers serve same purpose; **not** 46 distinct new prayers |
| Prayer boundaries needing review | **10** | Combined acts, historical rubric, intercession and completion phrases |
| Confiteor with Mass-text bridge restrictions | **3** | Private devotional Confiteor does not automatically use the liturgical actor-specific Mass variant |
| Source-specific candidate family buckets | **33** | Editorial grouping; not published unique-prayer count |
| Repeated opening phrase clusters | **17** | 41 source occurrences share an incipit fingerprint |
| Distinct incipit fingerprints | **69** | Text openers only, NOT 69 distinct complete prayers |
| Exact full-prayer pairwise certifications | **0** | Remains next print-text gate |

Most frequent editorial family buckets (still provisional):

- `presence-adoration-daily`: 10 source occurrences
- `thanksgiving-daily`: 8 source occurrences
- `act-of-contrition`: 7 source occurrences
- `act-of-charity`: 5 source occurrences
- `guardian-angel`: 5 source occurrences
- `nightly-examination-historical-intro`: 4 source occurrences
- `supplication-resolution-daily`: 4 source occurrences
- `morning-offering-apostleship`: 3 source occurrences
- `confiteor-private-vs-liturgical`: 3 source occurrences
- `intercession-daily`: 3 source occurrences
- `de-profundis-psalm-129`: 3 source occurrences
- `visita-quaesumus-night`: 3 source occurrences
- `in-manus-tuas-night`: 3 source occurrences
- `act-of-faith`: 3 source occurrences
- `act-of-hope`: 3 source occurrences
- `marian-devotional`: 3 source occurrences
- `fidelium-deus`: 2 source occurrences
- `alphonsus-night-prayer`: 2 source occurrences
- `concluding-invocations`: 2 source occurrences
- `daily-consecration`: 2 source occurrences

## Concrete comparisons checked in historical witness text

1. **Lasance's Morning Act of Hope (1910 / 1911)** differs in the single adjective `all-powerful` versus `omnipotent`. Mark *minor lexical variant*; **do not automatically create a duplicate tab**.
2. **Lasance's Morning Act of Faith (1910 / 1911)** differs in clause arrangement and emphasis. Preserve edition-specific witnesses until full collation.
3. **Lasance's morning and evening Contrition (1911)** have **different resolutions**. Same title ≠ identical text; don't collapse them under the morning form.
4. **Apostleship Morning Offering:** *Blessed Be God* explicitly includes reparation and the Apostleship intention; Lasance specifies associates and the Pope's monthly intention. The existing canonical English prayer (citing modern USCCB collection) also mentions joys and Christian reunion. These are not interchangeable edition claims.
5. **Night Prayer by St Alphonsus:** explicitly present in *With God* Evening but absent as such in *Young Man's Guide*'s Daily Prayers. It should be a **Lasance 1911 witness**, not a fictitious Young Man's Guide quote.
6. **Visita quaesumus and In manus tuas** occur in both Lasance daily-night sequences, and also have Compline textual parallels. The sources need exact text collation before deciding whether variants warrant tabs.
7. **The Baltimore Manual's 'Another Form'** is not the Prime/Compline Office that occupies most of the printed chapter. Record the lay prayer as its own form; separate liturgical Office options if ever included.

Primary links:
- [Lasance With God — Morning](https://en.wikisource.org/wiki/With_God/Morning_Prayers), [Evening](https://en.wikisource.org/wiki/With_God/Evening_Prayers)
- [Lasance Young Man's Guide — Prayers and Devotions](https://en.wikisource.org/wiki/The_young_man%27s_guide/Prayers_and_Devotions)
- [Blessed Be God — Morning](https://en.wikisource.org/wiki/Blessed_be_God_(Callan)/Morning_Prayers), [Evening](https://en.wikisource.org/wiki/Blessed_be_God_(Callan)/Evening_Prayers)
- [Baltimore Manual — Morning](https://en.wikisource.org/wiki/A_Manual_of_Prayers_for_the_Use_of_the_Catholic_Laity/Morning_Prayers), [Evening](https://en.wikisource.org/wiki/A_Manual_of_Prayers_for_the_Use_of_the_Catholic_Laity/Evening_Prayers)

## User-facing product decision

The approved **category → optional historically sourced forms → saved selection** direction works with the existing 48-ID bank. New source formulations should be stored as **versioned witnesses connected to one prayer family**, not overwrite the canonical ID. A distinct prayer inside a stage gets its own canonical identity; a repeated identical text cited by multiple manuals should occupy one tab with multiple source citations.

Historical manuals' complete daily exercises should remain available as coherent **historical presets**, without assembling an ahistorical amalgam and labelling it a single manual.

## Next gate before user-facing tabs

1. Recover print facsimile and complete text *boundaries*; confirm exact wording, not just beginning.
2. Certify the 17 multi-occurrence incipit groups against the actual full prayer text and identify meaningful alternatives.
3. Expand into other previously researched English/French manuals, keeping edition and rights provenance.
4. Perform editorial shortlist by category; retain verified traditional texts and leave holds visible.
5. Wire new variant choices into **existing** Morning/Evening reader. The optional prayer timer is a separate session feature, not a prayer text/sequence owner.

**No paid services, no contacting rightsholders, no invented historical translations.**
