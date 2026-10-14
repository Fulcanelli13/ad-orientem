# Lanslots (1897) — Mystery of the Mass source inventory and first Scripture crosswalk

**Date:** 14 October 2026. **Status:** RESEARCH / SOURCE-INVENTORY / **NOT A COMPLETE TEXT COLLATION OR PUBLICATION APPROVAL**. Related canonical historical evidence register: #342.

## Source identity and access

Rev. D. I. Lanslots, O.S.B., *Illustrated Explanation of the Prayers and Ceremonies of the Mass* (Benziger Brothers, 1897; preface by Archbishop F. Janssens). Original digitization: https://commons.wikimedia.org/wiki/File:Illustrated_explanation_of_the_prayers_and_ceremonies_of_the_Mass_(IA_illustratedexpla00lans).pdf ; underlying original: https://archive.org/details/illustratedexpla00lans . The Commons scan is 404 **PDF** pages, distinct from the **printed** page numbering used below.

**Evidence-grade limitation:** Chapter headings and printed starting pages below are verified against the indexed *Contents* of the original volume. Several specific passages are verified against publicly indexed OCR excerpts; others are editorial search targets only. The 29 MB original PDF and complete OCR could not be fetched via the available reader for a consecutive, full-book verification; **do not state that all 25 chapters were read, all Scripture references extracted, or the bibliography exhaustively collated**. Original print pages must be checked visually before publication and in every case involving OCR uncertainty. There are no alterations to prayer text, the 1962 Missal, posture/minister cues, or native reader.

## Canonical owner reconciliation

- `data/presentation/guide-registry.v1.json`: 32 historical entries: AO.CARD.001–030 + PRE.ASPERGES + POST.MASS. The validator deliberately requires exactly 32; *do not* append Lanslots extracts as 33+ Guide records or mutate the registry's continuity status.
- `src/mass/reader-guide.js`: `guideForPresentationCard` gives the **48** visible Sung LIVE presentation moments inherited macro context. The 48 moments **are not** 48 historically approved independent Guides.
- `data/learn/mass-formation-campion.v1.json`: existing eight sequential formation stages; deepen stage claims through reviewed, separately linked sources without duplicating the course.
- `src/scripture/context.js`: single reference parser and shared Scripture owner; respects Catholic book names and Psalm numbering. No second Bible-text store; source/passage lookup must preserve card and reading position.
- `docs/research/MASS-RESEARCH-ARCHIVE-INDEX-20261013.md`: retains Guéranger first/second pass, September evidence, 1962 normative witnesses and the Guéranger-vs-1962 correction register. Lanslots complements, never supersedes, those sources.

## Full 25-chapter structural inventory (verified TOC; not certified full-text extraction)

Each `AO.CARD` designation here is a **topic-level bridge to existing 30 macro Guides**, not a final link to any of the 48 rendered moments. The eventual presentation mapping must be resolved via canonical per-card source and section IDs.

| Chapter | Printed start | Original chapter title | Provisional existing Guide owner(s) | Editorial extraction target |
|---|---:|---|---|---|
| I | 13 | The Altar | PRE.ASPERGES; AO.CARD.001 | altar theology, saints and martyrdom |
| II | 18 | Altar Decorations | AO.CARD.001 | church furnishing symbolism |
| III | 25 | The Chalice and Its Appurtenances | AO.CARD.010; AO.CARD.016; AO.CARD.026 | objects versus their sacramental use |
| IV | 30 | The Priestly Vestments | AO.CARD.001 | vestment prayers and symbolism |
| V | 40 | The Liturgical Colors | AO.CARD.001 | do not replace 1962 calendar colour authority |
| VI | 51 | The Liturgical Language | AO.CARD.001 | history and spirituality, not current discipline |
| VII | 57 | The Beginning of Mass | AO.CARD.001 | introductory penitence |
| VIII | 69 | Incensation, Introit, and Kyrie | AO.CARD.001; AO.CARD.002 | heavenly worship and penitential address |
| IX | 77 | The Gloria and the Collects | AO.CARD.003; AO.CARD.004 | angelic praise and common prayer |
| X | 86 | Epistle, Gradual, Tract, and Sequence | AO.CARD.005; AO.CARD.006 | do not derive exact variable Proper sequence |
| XI | 93 | The Gospel | AO.CARD.007 | prophetic purification and proclamation |
| XII | 100 | The Credo | AO.CARD.009 | articles of the Creed |
| XIII | 117 | The Offertory | AO.CARD.010 | types, oblation and sacrificial preparation |
| XIV | 133 | Incensing and Washing of Hands | AO.CARD.010; AO.CARD.011 | incense interpretation is not binding action count |
| XV | 145 | The Orate Fratres, the Secrets, and the Preface | AO.CARD.011; AO.CARD.012; AO.CARD.013 | communal offering and celestial praise |
| XVI | 162 | First Prayer of the Canon | AO.CARD.014 | Canon history and its ecclesial intercession |
| XVII | 175 | From the Commemoration of the Living to the Second Prayer | AO.CARD.014 | prayer for the Church living and triumphant |
| XVIII | 199 | From the Second Prayer to the Consecration | AO.CARD.014 | specific Canon petition boundaries |
| XIX | 209 | The Consecration | AO.CARD.015; AO.CARD.016 | sacrament, sacrifice, doctrinal distinction |
| XX | 221 | The First Prayer after the Consecration | AO.CARD.017 | Passion/Resurrection/Ascension; Old Testament sacrifices |
| XXI | 239 | The Second and the Third Prayer after the Consecration | AO.CARD.017 | communion of saints, intercession |
| XXII | 256 | Conclusion of the Canon, the Pater Noster, and the Libera | AO.CARD.018; AO.CARD.019; AO.CARD.020 | doxology, Lord's prayer, deliverance |
| XXIII | 272 | From the Breaking of the Host to the Communion | AO.CARD.020; AO.CARD.021; AO.CARD.022 | symbolism vs sacramental reality |
| XXIV | 287 | The Communion | AO.CARD.023; AO.CARD.024; AO.CARD.025 | Eucharistic participation; centurion saying |
| XXV | 308 | The Thanksgiving and the End | AO.CARD.026; AO.CARD.027; AO.CARD.028; AO.CARD.029; AO.CARD.030; POST.MASS | conditional 1962 endings require own authority |

## Scriptural/theological claim candidates — citation and certainty discipline

Use two evidence categories: **OCR_EXCERPT_REVIEWED** = the author's statement appears in an indexed excerpt from the original 1897 PDF (still needs scan-side image verification); **PASSAGE_TARGET_UNVERIFIED** = a strongly relevant Mass–Bible association, **not yet proven to be Lanslots's own argument**. The latter must not be presented as a quotation or assertion by Lanslots.

| ID | Book / printed locator | Topic and canonical landing | Scripture passage | Evidence | Review and source-critical instruction |
|---|---|---|---|---|---|
| LAN-001 | VIII, p.70 | Incense / AO.CARD.001; AO.CARD.002 | Revelation 5:8 | OCR_EXCERPT_REVIEWED | Lanslots explicitly interprets golden vessels of perfume as prayers of saints. Differentiate biblical heavenly worship from unsupported historical-origin claims. |
| LAN-002 | VIII, p.70 | Incense / AO.CARD.001 | Matthew 2:11 | OCR_EXCERPT_REVIEWED | Lanslots mentions the Magi's gifts of gold, frankincense and myrrh; historical polemics about their being the 'first' New Testament incensers require nuance. |
| LAN-003 | VIII, p.70 | Incense / AO.CARD.001 | Leviticus (book level; no specific passage verified) | OCR_EXCERPT_REVIEWED | He invokes Levitical sacrificial/incense prescriptions. Exact verses must be collated, not invented. |
| LAN-004 | XIV, p.134 | Offering-incensation / AO.CARD.010 | Revelation 8:3–4 (check precise allusion) | OCR_EXCERPT_REVIEWED | Text refers to an angel holding a censer, and spiritual readings of multiple cross-shaped incensations. Explicit Apocalypse verse and historical rubric provenance need confirmation. |
| LAN-005 | XX, p.221–222 | Canon / AO.CARD.017 | Revelation 5:6 | OCR_EXCERPT_REVIEWED | Lanslots relates John's Lamb standing as slain to the sacrificial memorial, while expressly saying Christ dies no more. Avoid literal 'Christ dies again' language. |
| LAN-006 | XX, p.222 | `Supra quae` / AO.CARD.017 | Genesis 4:4; Genesis 22:1–19; Genesis 14:18 | OCR_EXCERPT_REVIEWED | The Canon passage explicitly invokes Abel, Abraham, and Melchisedech. Exegete each separately; verify which biblical verses Lanslots himself prints rather than converting prayer names into alleged verse citations. |
| LAN-007 | XVI, p.162 | Canon / AO.CARD.014 | Council of Trent, session XXII, chapter 4 (non-biblical source) | OCR_EXCERPT_REVIEWED | Book quotes Trent on the sacred Canon. Identify this as dogmatic historical authority, not Scripture or 1962 rubrical law. |
| LAN-008 | I, p.13ff | Altar of martyrs / PRE.ASPERGES; AO.CARD.001 | Revelation 6:9 | PASSAGE_TARGET_UNVERIFIED | Verify Lanslots's exact relics-versus-altar reasoning and the relevant printed page. |
| LAN-009 | XI, p.93ff | `Munda cor meum` / AO.CARD.007 | Isaiah 6:6–7 | PASSAGE_TARGET_UNVERIFIED | Passage-theology alignment; inspect original text before attributing details to Lanslots. |
| LAN-010 | XV, p.145ff | `Sanctus` / AO.CARD.013 | Isaiah 6:3; Revelation 4:8 | PASSAGE_TARGET_UNVERIFIED | Confirm whether these are explicitly cited in the chapter and separate San​ctus from Benedictus. |
| LAN-011 | XIV, p.133ff | `Lavabo` / AO.CARD.010 | Psalm 25:6–12 (Vulgate) | PASSAGE_TARGET_UNVERIFIED | Psalm numbering/edition is a release gate; no unlabelled Hebrew-numbering conversion. |
| LAN-012 | XV, p.145ff | `Hosanna/Benedictus` / AO.CARD.013 | Matthew 21:9; Mark 11:9–10 | PASSAGE_TARGET_UNVERIFIED | Verse references are biblical source of liturgical words, not proof of how Lanslots interprets them. |
| LAN-013 | XXIII, p.272ff | `Agnus Dei` / AO.CARD.021 | John 1:29 | PASSAGE_TARGET_UNVERIFIED | Distinguish the Johannine title from specific threefold liturgical petition origins. |
| LAN-014 | XXIV, p.287ff | `Domine non sum dignus` / AO.CARD.024 | Matthew 8:8 | PASSAGE_TARGET_UNVERIFIED | Gospel-source association; check exactly how Lanslots applies it to priest/faithful Communion. |
| LAN-015 | XXV, p.308ff | Last Gospel / AO.CARD.030 | John 1:1–14 | PASSAGE_TARGET_UNVERIFIED | Last Gospel not universal for every 1962 ending or optional form; source/form selector is normative. |

## Theological and source-level editorial guardrails

1. Treat the book as a late-19th-century **devotional-theological commentator**, not the original cause of liturgical practices or a witness to the normative 1962 rite. Biblical typology, spiritual allegory, historical etiology and rubrical prescription are **four distinct categories**.
2. Distinguish typological fulfilment and sacramental reality. Abel, Abraham/Isaac and Melchisedech are figures of Christ's sacrifice, not sacrifices of equivalent intrinsic efficacy. The Mass represents/makes present the one sacrifice of Christ sacramentally; it is not a repeated physical death.
3. Do not promote claims such as the Gospel side “originally” representing the Gentiles, individual crosses' numerological meaning, or an incensing pattern from Lanslots alone as certified origins or universal obligations.
4. Record who acts in specific liturgical forms: the book is **not** the source for deciding 1962 deacon/celebrant roles, priest positions, or faithful postures. Exact actor-specific 1962 witnesses remain in the source registries.
5. Prefer native French writing from original French witnesses (Guéranger, Le Brun) where stronger, rather than mechanically translating an English devotional work; attribute Lanslots as one historically situated supporting witness. Compare against existing author-specific interpretation records before a new card is drafted.
6. Do not add contemporary or postconciliar Missal source links as if they explain 1962 mechanics. No implication that a common linked source is independent proof of each specific claim.
7. Source display: title / author / 1897 / chapter / printed page / exact assertion / original scan link / Scripture book-chapter-verse / interpretation type / 1962 applicability / source status / bilingual reviewed text.

## Integration disposition

- **Documented now:** complete 25-chapter indexed structure; provisional connections to all 30 ordinary Mass macro moments and relevant pre-/post-Mass contexts; 15 candidate source-passage work items graded by evidence; source/authority separation and existing owner mapping.
- **Not completed:** consecutive 404-PDF-page visual verification; full Scripture-citation extraction; item-by-item duplicate check against every original 422-record September evidence entry and 71 Guéranger topics; mapping to individual **48** LIVE card IDs; native French theological review and runtime/mobile integration.
- **Do not publish this ledger as new user-facing content.** Next research gate: acquire readable full OCR plus page images, mechanically extract all biblical citations and Mass-text phrases, classify them, then deduplicate at the *claim* level against existing records before any product change.
- **No source or test assertions run by this documentation-only pass; no Mass reader modification.**

## Original source and work-in-repo cross references

- Original scan: https://commons.wikimedia.org/wiki/File:Illustrated_explanation_of_the_prayers_and_ceremonies_of_the_Mass_(IA_illustratedexpla00lans).pdf
- Original book metadata: https://archive.org/details/illustratedexpla00lans
- Existing Guide implementation: `src/mass/reader-guide.js`; recovered registry: `data/presentation/guide-registry.v1.json`
- Current formation owner: `data/learn/mass-formation-campion.v1.json`
- Scripture context: `src/scripture/context.js`
- Existing Mass research record: `docs/research/MASS-RESEARCH-ARCHIVE-INDEX-20261013.md`
