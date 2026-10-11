# Source-reviewed genealogy & apostolic dispersion pilot — 11 October 2026

## Scope
This is the next phase of research PR #1018, layered on the imported OpenBible and STEPBible indexes without overwriting the original full-corpus explorer. The **separate standalone offline HTML** is `reviews/biblical-lineage-apostolic-dispersion-cinematic-20261011.html`; its editable curated evidence source is `data/geography/research/biblical-curated-lineage-dispersion-20261011.v1.json`.

The genealogical view renders the exact **Matthew 1:2–16** source order (41 displayed identities) and **Luke 3:23–38** in reversed reading order for Adam→Christ (76 displayed identities). It does not make them one biological genealogy. The **90 explicitly referenced Genesis family connections** cover Adam through the patriarchs, and the twelve sons of Jacob. All links in the curated data include their biblical source; the text is a literary genealogy, not proof of modern biometric descent. Repeated names in a lineage are distinct person-position records, so two Josephs or two Cainan identities are not silently merged.

The Apostolic view covers **20 selectable persons**, including Our Lady, John, Peter, James the Greater, Andrew, Thomas, Philip the Apostle, **Philip the Evangelist as a different person**, Mark, Barnabas, Paul, Magdalene, Matthew, Bartholomew, Simon, Jude, Matthias and Luke. There are **55 selected entries** with precise original Scripture/patristic/sanctuary links. This is an editorial selection, not exhaustive Acts coverage, and not a fabricated Apostolic route atlas.

### Evidence categories
- **Scripture** = named person and location/event in the original passage; illustrated stops connect schematically, never as archaeologically proven ancient roads.
- **Patristic** = ancient Christian witness such as Eusebius or Irenaeus, often a region or ecclesial association rather than a dated journey.
- **Later tradition** = expressly qualified tradition, without conflating a shrine's devotional significance with proof of residence or travel.
- **Hold** = person can be selected but no itinerary has been verified. No pin or line should be manufactured to fill the map.

### Specific critical holds
- Joseph must not be presented as Christ's biological father; the named brethren of Jesus must not be silently treated as sons of Our Lady. The parents of Mary are not derived from Luke 3.
- Matthew and Luke are two **different textual sequences**, even where names coincide; divergent patristic interpretations of their relationship can be added with commentary, not as verified identities.
- Revelation 1:9 names John, but the identity with John son of Zebedee involves traditional attribution and needs a separate qualifier.
- Acts 8 and Acts 21 describe **Philip the Evangelist**, not automatically Philip the Apostle.
- Our Lady's **Jerusalem Dormition/tomb** association (Franciscan Custody) and **Ephesus** alternative (Catholic Encyclopedia) are competing later traditions; neither is a proven historical travel segment. Sources: https://www.custodia.org/en/news/celebrations-feast-assumption-mary-heaven-tomb-mary/ ; https://www.newadvent.org/cathen/02006b.htm.
- The 2006 catechesis of Benedict XVI describes the **India/Syria/Persia mission of Thomas as ancient tradition** and mentions the apocryphal Acts of Thomas; it does not provide a certified linear itinerary: https://www.vatican.va/content/benedict-xvi/en/audiences/2006/documents/hf_ben-xvi_aud_20060927.html .
- Provençal **St Mary Magdalene/Sainte-Baume** belongs exclusively to a visibly marked French Catholic later tradition: original Dominican sanctuary https://www.saintebaume.org/grotte/ . No assertion that canonical Scripture documents the crossing to Provence.
- **Patmos** is associated with the author of Revelation, but the seven churches are intended recipients of letters, not proof of seven personal visits.
- Place coordinates are illustrative context anchors derived from existing biblical location research; regions have intentionally broad approximate foci. No physical-site/pin certification has happened.

### UX acceptance
Two top-level modes: Genealogies; Apostolic Dispersion. Genealogies include Matthew, Luke, split David branches comparison, and individually expandable Genesis lines. The chapter-control advances visible generations rather than showing thousands of names at once. Apostolic Dispersion keeps a single per-person chronological sequence, showable map markers with evidence styling, coastline map (not modern borders), draggable and resynchronizable map, link to original evidence, and bilingual review surface.

The UI is an **offline design review**. It does not include the complete Catholic Bible text and is not wired to the production Scripture app. The full 3,231 people and their unverified records remain in the original research prototype. The 155 genealogy items (41+76+38) are **text positions and links**, not 155 distinct biological individuals.

### Next gates
1. Run browser regression at 320/390/768, attach screenshots, resolve any test findings.
2. Edge-by-edge historical/text-critical review especially Matthew/Luke name spellings and omissions, and exact Greek/Vulgate/Crampon correspondence.
3. Replace demonstration geography with already verified Sacred Geography place identities; avoid importing region centroids as precise sites.
4. Extend patristic source dossiers for named Apostles and refuse unnamed, undated tradition as definite routes.
5. Port only the approved navigation/cinematic interactions into the production Atlas PR #998; keep the wider 151+ biblical-event corpus and linked Scripture reader.


## Corrective review pass (11 October 2026, follow-up)
- Corrected all 117 displayed genealogy references from chapterless verse labels to Matthew 1:2–16 and Luke 3:23–38, preserving separately sourced sequences.
- Fixed two ancestral Joseph records incorrectly tagged `legal-or-putative`: the status now applies only to St Joseph in Luke 3:23 and Matthew 1:16 in this pilot.
- Added five *named or specifically described women* to Matthew's source positions, without artificially inserting them as extra paternal ancestors: Tamar, Rahab, Ruth, the wife of Urias (Bathsheba) and the Blessed Virgin Mary.
- Changed split David-branch viewer to independently controlled Matthew and Luke tracks. Visually aligned positions are not asserted to be equivalent generations.
- Added James son of Alphaeus and Judas Iscariot as separately selectable figures (20 profiles, 55 entries); corrected St Luke's hold citation to Colossians 4:14. Judas Iscariot is distinguished from Jude/Thaddeus.
- Outside-basemap broad associations (India) now appear as text-only, with a clearly visible warning, not as a floating precise pin on ocean/cartographic blank space. A certified wider map is still required before a plotted India region.
- Added regression gates for embedded-data parity, precise verse references, legal/putative designation, independent lineages, additional profiles, associated women, and India map extent.
- Research-only review branch remains unmerged; the full 3,231-person index and production Atlas are not modified by this pass.

## Phase: source-defined family expansion and shared chronology preview

- Updated the curated Genesis registry to **90** Scripture-linked father-child statements and **91** distinct person IDs, with source URLs for every edge. Cain's Enoch and Jared's Enoch, and the two Lamechs, are distinct entities; Reuben's Hezron and Judah/Perez's Hezron are not silently merged. The fathers named Joseph in Luke remain distinct as before.
- Source editions and name spelling can differ (particularly Genesis 10 / 46); the bilingual Vulgate/Crampon and Greek reference crosswalk remains an explicit editorial gate before canonical publication. The graph contains no date estimates.
- The reviewer now uses subtree-width layout, user-driven expand/collapse, keyboard activation, generation reveal, and high-level focus controls for Adam, Noah, Abraham, Jacob and Joseph. The separate 3,231-person prototype retains its entire unreviewed corpus.
- A separately editable [chronology bridge](../../data/geography/research/biblical-atlas-lineage-chronology-bridge-20261011.v1.json) snapshots the **151 existing milestones** from production-integration PR #998 at source head `99656bf2c7057c5169df34be82b774c0a0cfb725`. It maps 10 Genesis persons, 7 Apostolic profiles and 17 episode-qualified entries to *related narrative contexts*. It is not an alternative 151-scene chronology, proof of age/date, or a deployed component of the live application.
- Refined the bridge to suppress false associations: Philip's Samaritan preaching (Acts 8:5–13) is not the Ethiopian baptism scene (Acts 8:26–40). An unanchored patristic/later episode does not inherit an unrelated Scripture scene merely because the person matches.
- Reader has a third **Atlas chronology preview** surface for reviewing the source-derived joining keys and retaining era continuity. Future convergence must reconcile PR #998's latest head and source records, then insert just the approved interactions into its continuous source timeline; this research PR is still unmerged.
- No new historical pilgrimage pins, post-biblical journeys, Vatican authority claims, or exact Ancient-road reconstructions are inferred from source proximity.

### Review acceptance additions
- Browser assertions compare the embedded bridge byte-for-byte in parsed form against its source registry, verify all 151 numbered milestones, and check generation expansion and Apostolic chronology deep links at 320, 390 and 768 px.
- Correct generated genealogical labels and maintain separate Matthew/Luke textual lineages; preserve the strict evidence distinctions Scripture, patristic witness, later tradition, identification qualification and holds.
- Ensure authoring changes to the 151-event Atlas invalidate the pinned snapshot pending re-review; do not merge this snapshot automatically with an independent 181-scene design pilot.

## Cinematic 151↔181 source reconciliation (11 October 2026)

This is a **research crosswalk**, not a third competing chronology, and it does not touch PR #998 production code or PR #1010's 181-scene design review. The source-pinned editable file is [biblical-atlas-151-181-crosswalk-20261011.v1.json](../../data/geography/research/biblical-atlas-151-181-crosswalk-20261011.v1.json).

- Source heads: existing 151-milestone PR #998 at `99656bf2c7057c5169df34be82b774c0a0cfb725`; 181-scene prototype PR #1010 at `3d4c99d84627e161a24153a41ac9a113e8a3d1b3`.
- **65** of the 181 scenes share an exact normalized chapter/verse reference with one of the 151 Atlas milestones. Exact source citation **does not by itself approve the same event, pin, or historical date**.
- **29** more 181 scenes overlap chapter-and-verse ranges from existing Atlas events. These are candidate comparisons **only** and are not merged automatically.
- **87** of the 181 scenes have no direct biblical passage match in the 151 corpus. They remain valid research candidates without being invented or force-fit into the source Atlas.
- **86** of the 151 source milestones have no exact-citation cinematic equivalent, including Creation, Judges/prophetic history, much of the exile and Greek additions, and Revelation. All remain protected rather than removed to accommodate the four cinematic story arcs.
- The **14** cinematic chapters now expose their existing art references only upon an explicit comparison action in the standalone genealogy review. Nine have proposed artwork URLs, five rely on a dark textual fallback. Artwork remains external to the HTML, with source credit where supplied; network failure leaves the source review functional. No image is cleared for app shipping by this change.
- The review gallery identifies exact-reference matches versus overlapping-verses proposals. Each reference is accompanied by a warning that the matching does not certify ancient coordinates, travel routes, or chronological dating. The full 181-scene prototype is still independently accessible.
- Textual-edition holds are explicit for Matthew 1:11/Jeconias, Luke 3:36/the second Cainan, Joseph’s legal role, Catholic Greek Esther and Daniel chapter numbering, and Luke 2:21's malformed single-verse display reference. Edition-aware Vulgate, Douay and Crampon crosswalks remain outstanding; this batch does not claim their completion.
- The browser suite validates correspondence against the embedded crosswalk at 320, 390 and 768 px. Only a validated scene *selection* may open a chapter artwork; selecting a matching Scripture chapter never automatically assigns the artwork as an authoritative historical image.

**Integration policy:** the original 151-event source chronology remains authoritative for the live Atlas until the final approved merged research plan. The 181-scene work contributes candidates, verified references and art direction only. Changes to either source PR head require a regenerated crosswalk and fresh review.
