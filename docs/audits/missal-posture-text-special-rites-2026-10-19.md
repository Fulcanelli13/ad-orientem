# Missal Posture Pagination — Source Integrity and Special-Rite Audit
_Date: 19 October 2026. Scope: PR #1441 (draft, not released)._

## Governing rule
The canonical 1962 Mass/rite source, not page design, owns every prayer,
paragraph, Proper, response, rubric, gesture and event. Missal page boundaries
are presentation only. User swipes cannot advance a ceremony clock.

## P0 defects and disposition

1. **Lenten Prayer over the People dropped in granular Missal projection.**
   `augmentReaderCardsWithPrayerOverPeople` appends its four paragraphs
   after B086–B088 in canonical AO.CARD.027. The old granular
   `subsections` rebuilt only registered B-blocks and silently dropped
   those paragraphs from Missal Mode. **Fixed in this PR** by retaining the
   four exact source paragraph objects on a new *display-only* reading page,
   with a fail-closed error for any other unowned insertion rather than
   silently dropping it. Does not add a canonical liturgical event.

2. **Zero-text source-block metadata drifted to the wrong posture page.**
   The first posture splitter put every empty B-block on the first page
   even when the original block belonged after a later prayer. This could
   misplace omitted/state-only rubric metadata. **Fixed in this PR**
   by keeping the metadata with the preceding text-bearing source block.
   A test checks both preservation and correct ownership.

3. **No rigorous source-to-page audit at each projection boundary.**
   **Fixed in this PR** by two fail-closed parity checks:
   canonical source → granular Missal, then granular Missal → posture
   pages. Exact paragraph object identity preserves source text, Latin
   and translation, metadata and cue IDs. Tests also check B-block counts,
   order, navigation identities, source-to-page offsets and manual turns.

4. **Holy Week French source selection used English in French mode.**
   The native Good Friday/Easter Vigil stage adapter picked
   `row.vernacular` (English) even where the Easter Vigil source contained
   `row.french`. **Fixed** with an explicit language-selected witness:
   English prefers recorded English; French uses recorded French and
   otherwise leaves the translation absent rather than mislabeling English.
   Distinct-rite speaker roles are retained with each paragraph.
   Tested against all real 1962 Easter Vigil font-blessing source lines.

5. **Propers with a separate BLOCK_START posture had no text cue on
   their first displayed line.** The posture cue at B030 was invisible to
   page navigation because the dynamic Proper's replacement paragraph
   contains no original C0109 ID. **Fixed** by using only the exact
   registered B030 R17 source boundary; no text search or guessed cue time.

## Source form verification

Automated source preservation cases:
- Low Mass (ordinary and Requiem): original text preserved; generic
  Sung posture controller remains unsupported and is not guessed.
- Missa Cantata, unincensed and incensed (ordinary and Requiem).
- Solemn Mass (ordinary and Requiem).
- Nuptial Mass overlay, including its insertions.

The following require separate editorial/phone signoff despite existing
unit or lifecycle coverage: Ember/extended lessons with
Flectamus/Levate, Holy Thursday Mandatum, Prayer over the People
on actual Lenten calendar dates, and the distinct Easter Vigil Mass
composite (which bypasses the ordinary Mass Missal projection).

## Separate rites and page status

These are independent event-driven readers, **not** a rearranged
30-card ordinary Mass. This PR offers an advisory *next page posture*
from the following source-owned stage, only in Missal Mode. Existing stage
boundaries and handoffs remain intact. Posture is suppressed if the
source is local/indeterminate, minister-only, recipient-only or unchanged.

| Rite or action | Existing owner | Page rule | Source-text limitation |
| --- | --- | --- | --- |
| Asperges / Vidi aquam | R20 | Existing six-record sequence, distinct pages | Pinned Latin rite text; not certified parallel vernacular |
| Blessing/distribution of Palms, procession | R22 | Stage pages, participant-only motion | Pinned Latin; vernacular not certified |
| Blessing/distribution of Ashes | R23 | Stage pages, no universal recipient kneeling | Latin-only payload; source hydration audited separately |
| Candlemas blessing, candles and procession | R24 | Stage pages, candle recipient scoped | Five long orations still share one stage page; Latin-only |
| Rogations and Greater Litanies | R25 | Stand → kneel at Litany, processional action conditional | Long Litany still shares stage pages; Latin-only |
| Requiem Absolution and burial | R26 | Source events and conditional burial handoff | Latin-only |
| Corpus Christi procession and Benediction | R27 | Only explicit following action, not date inference | Latin-only |
| Generic following procession | R29 | No invented global posture or text | Source process is primarily observational |
| Holy Thursday translation to altar of repose | R31 | Processional participation remains conditional | Text still requires separate bilingual certification |
| Good Friday | R28 | Source stages and exact formula/person-specific kneeling | Latin canonical; vernacular is separate layer |
| Easter Vigil fire, candle, Lumen Christi, Exsultet, prophecies | R33 | Source stages, no clock invented by page turns | Mixed donor/1962 witness; baptismal text branch explicitly incomplete |

**Not yet certified as complete:** splitting the long special-rite
orations and litany inside a single ceremonial stage while preserving
step-level event identity; complete side-by-side Latin/vernacular for
these Latin-only or mixed witnesses; full editable page-by-page UI
inspection for every rite, every branch and every language. Do not
advertise those as completed.

## Regression gates

- Missal posture-page source integrity and source-owned special-stage cue QA
- Reader-model / mode-switch / R17 cue-state contracts
- Reader focus mode/language parity and Missal phone screenshots
- Required main gate, app convergence, R17 Mass phone, Corpus/Requiem,
  special-Mass focus, native Mass print, and LIVE contrast

No merge or release should be inferred from unit tests alone; actual
phone parity and all required workflows must finish successfully.
