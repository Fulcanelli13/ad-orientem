# Mass P1 — Formation destination and non-duplication contract
_16 October 2026 · P1 product scope · draft/unmerged_

## Governing decision
**Mass is Mass.** The native LIVE / Missal / Simple reader is for prayer and immediate liturgical orientation only: text, translations, gestures, responses, state and brief rubrics. This P1 branch must **never** add historical/theological source reading, Mass Explorer calls-to-action or exploratory links to the reader.

Outside Mass, **Formation → Understand the Mass** is the single principal study destination. It offers two *views of existing owners*, not two new textual databases:
- **Follow in order**: `learn.mass_explorer` / `src/learn/mass-map.js` displays the 32 published Guide units and all 96 source text blocks with original identities and existing Guide commentary.
- **Study by subject**: eight `MF01`–`MF08` titles and summaries are projected directly from `data/learn/mass-formation-campion.v1.json` by `src/learn/mass-study-paths.js`, and launch their existing `learn.mass` owner. P1 does **not** rewrite the lessons or their evidence.

The originating study position, whether a Mass Map stop, precise prayer block or themed lesson, must survive the trip into the existing Scripture reader or Formation course and return in context.

## Demonstration path and source authority

| Step | User-visible behaviour | Source owner | Boundary |
| --- | --- | --- | --- |
| Open Formation | Choose **Understand the Mass** | Existing `learn` shell / `learn.mass_explorer` | Not the Mass reader |
| Mass Map | Jump to Offertory `AO.CARD.010` | Published 32 Guide registry | Not a new 48/65-card ceremonial owner |
| Original prayer | Select `AO.SM.B031` (*Suscipe, sancte Pater*) | Published Sung corpus and French by-cue witness | Do not generate a generic Proper or editorial translation |
| Explain | Read the original Guide context, by section | Published Guide `short`/`long` | Macro-level Guide is not separately approved claim for each microprayer |
| Thematic study | **The Offertory and your offering** `MF03` | Existing source-backed 8-stage Formation corpus | No P0 research import |
| Scripture | `MFS05`, Romans 12:1 (doctrinal parallel) | Existing Formation Scripture anchor and global Bible reader | **Not** a word-for-word attribution to `Suscipe` |
| Historical sources | Source drawer in `MF03`, Guide bibliography where supplied | Existing Formation source registry / Guide contextual link list | No certified historical passage claimed; browser links are bibliography, not an in-app full text |
| Return | Bible → MF03 → selected B031 / original Map position | Existing source owner and P1 return tokens | Exact selected source and study scroll/focus; never change reader ritual position |

## Current live/legacy user-facing owners
- `learn.mass_explorer`: P1 canonical **Understand the Mass** discovery destination (draft).
- `learn.mass`: eight-lesson original Formation course, **still accessible separately during transition** for deep links / content parity. Its older internal 32-moment Guide route is also preserved until the new Map can replace it without losing source review functionality.
- `data/presentation/guide-registry.v1.json`: one original Guide owner; used in both legacy and new entry paths.
- `data/presentation/reader-text-sung.v1.json`: original liturgical text owner; reuse, do not copy.
- `src/learn/mass-formation-scripture-context.js`: already curated independent Scripture relationships; use its exact relationship types.
- Mystery of the Mass manuscript / Ultra Master research: **not a public P1 content owner**. No standalone Mystery route is assumed here. If the separate editorial pipeline clears content, ingest by reference, not duplicate a public source.

## Non-loss retirement gates (not passed yet)
1. Prove every original published Guide moment (32) and every Sung source block (96) is available from the new Map.
2. Prove all eight Formation lessons, claims, and their already-public source drawers are reachable without rewriting them.
3. Verify the separate Bible passage context, version, language and exact return state.
4. Inventory any additional legacy Mystery/short/long Guide material and demonstrate paragraph-level parity, editorial approvals, and no P0 held-claim leakage before suppressing a legacy route.
5. Pass real 320/390/430/768/1280 phone/tablet/desktop and EN/FR visual/accessibility checks.
6. Only after acceptance, simplify Learn navigation and retire redundant **links/pages**, never silently delete original content.

## Intentionally not implemented by P1
- New rubrical interpretations, miracle/historical research, P0 source-by-source certification, draft manuscript publication, source-ID consolidation, or alternate reader cards.
- A historical/third-party full-text reader for bibliographic pointers **without a verified authorised passage and rights/provenance**. The existing Bible overlay is the currently functional in-app source reading experience.
- Any in-Mass educational call-to-action.
