# Mass music timing: Introit, Communion, and pre-Mass handoff (2026-10-19)

**Status:** Source-reconciled implementation follow-up to Ultra Master 41-sheet research workbook, Schola PR #1450, and research PR #1448. This changes no liturgical text, canonical cue ID, or card identity.

## Normative source

Sacred Congregation of Rites, *De musica sacra et sacra liturgia* (3 September 1958), §27(a) and (c):
- §27(a) situates the Introit within the ministers' entrance; psalm verses can accompany a lengthy entrance, ending when the celebrant reaches the altar. A printed priestly Introit block in the Mass source is therefore **not** the start of choir singing.
- §27(c) situates the Communion chant during the priest's reception, **or during the faithful's reception when the faithful communicate**. Additional suitable verses or Latin singing may continue during distribution. A subsequent priestly reading of the Communion Proper after ablutions is a distinct source event.
- The public Postcommunion greeting is the hard terminus for stale projected Communion music. Passing it is **not** a claim that an actual choir was heard finishing.

Authority: https://adoremus.org/1958/09/instruction-on-sacred-music/

Supplementary chant-practice witness: *Psallite Sapienter*, CMAA, Asperges / Vidi aquam and immediate Introit handoff after the concluding collect:
https://media.churchmusicassociation.org/books/7848318-Psallite-Sapienter-A-Musicians-Guide-to-the-Extraordinary-Form.pdf

## Source crosswalk

| Music scene | Earliest Mass-side source | Existing curated card owner | Printed Proper | Later liturgical boundary |
|---|---|---|---|---|
| Entrance Introit | first opening card of `AO.CARD.001` | Foot of altar / preparatory cards, then `Introit` | `AO.SM.B014` | first Kyrie / next musical scene |
| Communion while priest communicates | `AO.SM.B074` / `AO.SM.C0232` | `The Priest receives the Sacred Host` | **not** `B085` | Postcommunion greeting `AO.SM.C0251` |
| Communion of the faithful, conditional | `AO.SM.B080–B082` | Faithful preparation and distribution cards | **not** `B085` | `C0251` |
| After Communion | `AO.SM.B083–B085` | `Ablutions` and `Communion Antiphon` | `AO.SM.B085` | `AO.SM.B086` first greeting |
| Asperges / Vidi aquam | native `ASP` rite graph | special-rite reader, not ordinary Mass choir track | independent of `B014` | last Asperges collect and **handoff** to first Mass card |
| Palm/Ash/Candlemas/Rogations | native conditional prelude graphs | special-rite reader | unrelated ordinary Mass Proper until handoff | respective source-led handoff to `introitOnlyCard()` |

## Operational rules

1. `activateForCard` can choose the **expected** Introit music on the first ordinary opening card. It may not project the Introit while a pre-Mass rite's own reader owns the screen.
2. Merely reading B014 must not rewind/advance the independent Schola phrase clock. Neither can ticking text or priest scroll.
3. Open a **possible** Communion music window at B074; keep it across the priest's Communion, optional old/customary second Confiteor, faithful Communion, ablutions and printed B085. No assertion is made as to whether faithful will receive or whether the choir actually sings. A later version should offer an observational choice for exact local onset, not infer it.
4. Exit the window at C0251 or on leaving `AO.CARD.026`; never mark `OBSERVED_FINISHED` from the liturgical boundary.
5. In pre-Mass and special-rite screens, native special-rite source owns its chants. **This change does not add an Asperges, Palm, Candlemas or Rogations Schola ticker** or synthesize liturgical organ actions. Those require dedicated overlays and authoritatively sourced text.
6. No change to Missal/Simple source text, LIVE 39/48/64 card maps, source cue clocks or existing 279 canonical cue IDs.

## Regression acceptance

- The first curated Foot card exposes expected Introit; B014 does not restart it.
- B074 exposes expected Communion; B076, B080, B083–B085 preserve the music scene; C0251 expires it.
- Direct access to B085 still resolves the Proper text.
- The 320px and 390px LIVE browser fixture verifies early entrance/Communion timing, existing shared Kyrie controls, and protected post-Chalice Benedictus.
- Low Mass is a structural absence of Schola (not an incidental missing track).
