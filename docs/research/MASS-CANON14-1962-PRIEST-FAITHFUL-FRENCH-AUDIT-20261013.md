# Mass Canon 1962 — fourteen prayer units, priest and faithful actions, independent French audit (13 October 2026)

**Research complete for this bounded batch; publication NOT certified.** No production reader code, Latin prayer text, cue IDs, cards or user-facing translations changed.

## Controlling method

1. The **source text** and canonical cue sequence remain `data/presentation/reader-text-sung.v1.json`, `reader-text-low.v1.json` and the **14 source-first Canon units** in `reader-canon-source-map.v1.json`. Current default LIVE projection remains **65 curated cards / 64 usually visible**, with **48 rollback**.
2. **Priest actions and voice** are read directly from the **1962 Latin Ritus servandus VIII–IX, and X.1 for the audible conclusion**; French sentences in the new audit are **independently authored short rubrics**, not copies of the 2007 copyrighted French translation:
   - [1962 Latin Ritus VIII](https://www.intratext.com/IXT/LAT0820/_PJ.HTM)
   - [1962 Latin Ritus IX](https://www.intratext.com/IXT/LAT0820/_PK.HTM)
   - [French–Latin 1962 Ritus parallel text, published French translation 2007](https://fr.scribd.com/document/542057936/Ritus-Servandus-1962), paragraphs VIII.1–8, IX.1–4
   - [Existing 1962 Ritus English witness](https://archive.ccwatershed.org/pdfs/5276-ritus-servandus-translated-english/download/)
3. **Faithful postures are not inferred from priest rubrics.** The `reader-postures.v1.json` events at `C0150` (kneel under specified Sung profile) and `C0182` (conditional stand under post-consecration profile) are kept qualified. Default in absence of a sourced selected local profile remains `FOLLOW_CONGREGATION_OBSERVATIONAL`.
4. The priest stays at the **altar centre, facing liturgical east** through the ordinary Canon, but bends/genuflects/etc. during precisely anchored actions; the right rail must preserve the **independent priest clock**. There is **no in-Canon station transition** in the sparse priest-position registry, which is correct if the station persists.
5. **Do not copy the historical devotional gesture** from Guéranger to every faithful cue. He invited the faithful's breast strike at `Nobis quoque`; that is not a 1962 universal pew instruction.

## Files saved in this batch

| Source-controlled record | Exact content |
|---|---|
| [14-Canon micro-actions](../../data/research/mass-canon-14-ritus1962-french-microactions-20261013.json) | **58 canonical source cues** (C0150–C0207), **58** source-verified priest action or persistent-state items, **4** separate server/bell/response items; 14 segment IDs. Source references, Latin trigger words, new French in-text draft and forms/clock warnings. |
| [Canon faithful profile map](../../data/research/mass-canon-faithful-postures-and-gestures-58-cues-20261013.json) | Every Canon cue represented; explicit selected Sung/community kneel vs optional stand, separate Low/profile review, sourced vs historical lay gestures, unsupported duplicated Nobis prompts. |
| [Independent French DTC study](../../data/research/mass-canon-french-dtc-independent-audit-20261013.json) | **14 Canon segment-level comparisons**, sourced to H. Moureau's original French [1909 article](https://fr.wikisource.org/wiki/Dictionnaire_de_th%C3%A9ologie_catholique/CANON_DE_LA_MESSE), distinguishing historical hypotheses and contested theological interpretations from 1962 rubric. |
| [Source-to-presentation rubric gap audit](../../data/research/mass-canon-14-rubric-registry-gap-audit-20261013.json) | **58 cues**, of which **13 have an existing detailed priest in-text rubric cue** (20 event entries); **42 currently lack detailed event entries despite source actions/precise posture/voice**, and **10 major review issues**. Some cues have no new action, but retain persistent state. |
| [SOT v12 snapshot 1](../../data/research/archive/mass-sot-v12-library-parsed-lines-0001-1000.snapshot.json) | Original parsed workbook lines 1–1000, read-only |
| [SOT v12 snapshot 2](../../data/research/archive/mass-sot-v12-library-parsed-lines-1001-2000.snapshot.json) | Original parsed workbook lines 1001–2000, read-only |
| [SOT v12 snapshot 3](../../data/research/archive/mass-sot-v12-library-parsed-lines-2001-2810.snapshot.json) | Original parsed workbook lines 2001–2810, read-only |

**Archive verification:** three contiguous ranges, **2,810 / 2,810 parsed workbook lines**, **22 / 22 distinct named tabs**. The original `Ad_Orientem_1962_Mass_Source_of_Truth_v12_ORGANISED.xlsx` remains separately held in the user's file Library; these snapshots are parsed text/cell values **not exact binary .xlsx reproduction**. The ten-tab September compendium and its **422 independent source records** were already archived in previous PR. Together these close the main workbook *content* preservation gap without overwriting provenance.

## Precise 14-unit Canon ceremonial audit

| Canon | Cue span | Primary source and actor action | Left rail / guidance decision |
|---|---|---|---|
| 01 Te igitur | C0150–0153 | Profound bow, altar kiss, three crosses over both oblations, hands extended; Ritus VIII.1–2. | Faithful: active local kneel/stand profile only; explanation: prayer for Church and pastors. |
| 02 Memento living | C0154–0156 | Hands joined near face/chest; genuine discretionary remembrance, return to extended hands; Ritus VIII.3–4. | No manufactured timed pause; guide: offer intentions without guessing priest silence length. |
| 03 Communicantes | C0157–0160 | Extended hands, head bow at Iesu Christi, hands joined at Per eundem; seasonal text exceptions. | 1962 includes St Joseph, contra dated Guéranger 1885 omission. |
| 04 Hanc igitur | C0161–0162 | Both hands extended palms down over offerings, then joined; Ritus VIII.4. | Server warning bell is *shortly before* Consecration, not mandated on an exact word; conditional. |
| 05 Quam oblationem | C0163–0167 | Three crosses on both offerings, Host cross at Corpus, chalice cross at Sanguis, hands joined/head bowed; Ritus VIII.4. | French guide should explain words and anticipation of Consecration, not just crosses. |
| 06 Host Consecration | C0168–0174 | Holds Host, eyes up, bow, Host cross, consecratory words, immediate genuflection → elevation → replacement → genuflection. Joined thumb/index state begins. | Do **not** display physical Fraction at narrated *fregit*; it occurs after Pater. Bell belongs to server. |
| 07 Chalice Consecration | C0175–0181 | Chalice handling and cross, words, chalice replaced at *Hæc quotiescumque*, first genuflection, elevation for adoration, replacement/cover, second genuflection. | Two Consecrations and their elevations must remain four independent key moments. |
| 08 Unde et memores | C0182–0185 | Hands extended/joined; three crosses over both Species, then one over Host and one over chalice; Ritus IX.1. | **Existing action registry only says signs Host** at C0185: explicit chalice part requires verification in implementation. Stand at C0182 only for selected profile. |
| 09 Supra quae | C0186 | Priest continues with hands extended; Ritus IX.1. | Abel, Abraham and Melchisédech explain comparative sacrifices; do not imply Christ's offering is deficient. |
| 10 Supplices te rogamus | C0187–0191 | Profound bow, altar kiss, separate Host and chalice crosses, cross on priest himself, hands joined; Ritus IX.1. | «Saint Ange» identity remains interpretively contested (Guéranger vs DTC). |
| 11 Memento dead | C0192–0195 | Hands lifted, gaze at Blessed Sacrament, discretionary commemoration, arms extended, hands joined/head bowed; Ritus IX.2. | Keep <em>lucis et pacis</em> canonical-text regression tracked in [issue #1145](https://github.com/Fulcanelli13/ad-orientem/issues/1145). |
| 12 Nobis quoque | C0196–0198 | One priest breast strike and brief raised voice at C0196, then secret voice and extended hands; Ritus IX.3. | Existing repeated faithful gestures C0197/C0198 **not supported** as extra universal cues; quarantine. |
| 13 Per quem | C0199–0200 | Hands joined; three signs over both Species; Ritus IX.3. | DTC documents competing historic fruit/milk/honey interpretations; no such rite invented for 1962. |
| 14 Per ipsum | C0201–0207 | Genuflect and take Host; three crosses with Host over chalice, two between chalice and priest, slight elevation, replace, cover, genuflect; audible concluding Per omnia; Ritus IX.3/X.1. | Canon minor elevation different from major elevations. Solemn deacon assistance only in correct form. |

## Findings requiring the next implementation/certification batch

1. **In-text rubrics incomplete:** only 13/58 Canon cues currently carry a detailed `reader-rubric-events` priest entry. There are **42 cue positions** with source-backed action/state information and no matching detailed in-text entry. **Do not blindly turn all 42 into new visible annotations**; state persistence and text-action deduplication decide which words need annotations.
2. **Faithful posture authority:** preserve local/period custom. 1962 priest rubrics are not an all-pews law; no default artificial universal kneel or stand across all 58 cues.
3. **Separate priest timeline:** canonical cue progression as *read* by the user is not direct measurement of the silent Canon as celebrated. A right-rail exact claim requires actual priest-progress input, not schola/public clock guess.
4. **Consecrations and hand discipline:** preserve order and the start of joined finger/thumb state after Host consecration; separate server ringing from priest action.
5. **Historical source criticism:** H. Moureau (1909) documents distinct possible meanings of the `sanctus Angelus` and historical hypotheses of `Per quem`. Original Guéranger (1885) makes more definite claims; neither displaces literal prayer text or liturgical authority.
6. **Text integrity:** `C0194` missing *et* in current canonical source remains a separately tracked issue; research PR must not silently rewrite frozen donor.
7. **French and copyrights:** French 2007 Ritus translation is only a checking witness, not a licensable reproduction. Le Barroux and Clovis translations remain commercial comparison targets with no bulk copy. The 1909 DTC Wikisource transcription is marked only 50%-proofread, so use with textual caution.
8. **Postures of ministerial actors:** solemn deacon and subdeacon positions/reverences must never be reused as Low or Missa Cantata priest actions.

**Success criterion for eventual UI:** one state → one surface; in-text rubrics describe what the priest *does*, right rail shows *where/posture he is*, left rail shows sourced congregation participation, changing second top textual guidance explains the meaning/norm without repeating the same gesture. This research PR does **not** implement that UI.
