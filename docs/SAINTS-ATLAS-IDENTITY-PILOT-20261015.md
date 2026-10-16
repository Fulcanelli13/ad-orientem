# Map of Saints — phase 1: identity + holiness-first editorial contract

**15 October 2026 · Research only · No app route, public pin or 1962 Calendar changes**

The original `Fulcanelli13/ad-orientem` `main` shrine dataset contains **250 shrine records**, of which **121** name associated saints or Blesseds; this yields **145 association edges** and **119 distinct name strings**, **not** 119 confirmed distinct saints.

The immutable input for this snapshot is `data/shrines/shrines-pilgrimages-seed.v1.json` Git blob `c320c784b9b9b13a884bd3bd6d6e67a8ca82f895`. The accompanying JSON preserves every literal and source link. It is not a new authority for shrine/place records.

## Mandatory biography rule

The short profile **must tell readers why the person is honoured as holy**: the concrete witness of virtue, mercy, faith, martyrdom, missionary service, sacrifice or spiritual teaching. Birth/death dates, bibliography and location metadata are secondary.

- First line: a substantive, sourced answer to **why this person is a saint / blessed** (do not claim a particular canonical cause unless documented).
- Three to five bilingual facts, leading with lived virtues, then concrete deeds or mission, then lasting significance.
- Disputed traditions and reported visions must be attributed. Ancient saints may have longstanding Church veneration without modern canonization procedures.
- Retain source IDs for each meaningful fact. UI citations compact and collapsed; selected authoritative original text links under Further reading.
- A noncanonized **Blessed** must never become a Saint by automatic prefix normalization. Collective groups, biblical holy persons and doubtful homonyms need review.
- Artwork is selected ONLY through the existing approval/rights-cleared sacred-art catalogue, never by hotlinking.
- Use existing physical Place IDs. A saint–shrine relationship does not demonstrate that the saint lived or died there; do not mint unverified coordinates.
- Keep 1962 sanctoral observances under the existing Calendar resolver; later saints and titles belong in distinct metadata.

## Safe sequential integration

1. Reconcile the 119 string candidates with 1962 Calendar, homepage artwork subjects, relics, pilgrimages and novena data, assigning canonical person IDs only after reviewing aliases/collectives.
2. Add a small research-only EN/FR holiness-first profile sample, reusing source-backed shrine relationships and original authoritative links.
3. Reuse the existing Explore MapLibre layer, clustering and compact preview; add an opt-in Saints lens only after identity and type guards.
4. Bind approved artworks and exact Calendar identities. Do not change source/proper calculations, mass reader, app deployment or unrelated owners.
5. Run inventory-conservation tests and 390px mobile visual QA before any merge.

Related work stays independently owned: `src/find/` Explore, `data/geography/` physical Places, `src/calendar/`, sacred-art research/selection, `src/reference/` source-parsing and `src/learn/source-reference-panel.js`. No Vercel, Folio Core or wholesale source re-verification.
