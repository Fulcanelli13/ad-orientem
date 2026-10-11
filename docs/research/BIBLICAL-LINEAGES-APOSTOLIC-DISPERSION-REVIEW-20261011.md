# Source-reviewed genealogy & apostolic dispersion pilot — 11 October 2026

## Scope
This is the next phase of research PR #1018, layered on the imported OpenBible and STEPBible indexes without overwriting the original full-corpus explorer. The **separate standalone offline HTML** is `reviews/biblical-lineage-apostolic-dispersion-cinematic-20261011.html`; its editable curated evidence source is `data/geography/research/biblical-curated-lineage-dispersion-20261011.v1.json`.

The genealogical view renders the exact **Matthew 1:2–16** source order (41 displayed identities) and **Luke 3:23–38** in reversed reading order for Adam→Christ (76 displayed identities). It does not make them one biological genealogy. The **38 explicitly referenced Genesis family connections** cover Adam through the patriarchs, and the twelve sons of Jacob. All links in the curated data include their biblical source; the text is a literary genealogy, not proof of modern biometric descent. Repeated names in a lineage are distinct person-position records, so two Josephs or two Cainan identities are not silently merged.

The Apostolic view covers **18 selectable persons**, including Our Lady, John, Peter, James the Greater, Andrew, Thomas, Philip the Apostle, **Philip the Evangelist as a different person**, Mark, Barnabas, Paul, Magdalene, Matthew, Bartholomew, Simon, Jude, Matthias and Luke. There are **53 selected entries** with precise original Scripture/patristic/sanctuary links. This is an editorial selection, not exhaustive Acts coverage, and not a fabricated Apostolic route atlas.

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
