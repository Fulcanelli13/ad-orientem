# Sacred Art — museum-source priority and exclusion policy

**29 October 2026 · Research only · €0 · no artworks, approvals, image bytes or UI changed**

## Auditable institutional source registry

[Machine-readable institutional register (39 entries)](../data/calendar/sacred-art-institution-source-priority-registry-20261029.v1.json).

This is an **initial verified institutional directory, not a claim to include every gallery worldwide**. Its entries document policy evidence, source tiers, acquisition channels and exceptions. The licensing-first 383-work audit remains authoritative for those **specific** recorded source files. No artwork gains a publication clearance merely by belonging to a preferred museum.

| Tier | Sources/programmes | Default pipeline action |
| --- | ---: | --- |
| PRIMARY_OPEN | 22 | Search, rights-filter by exact object, collect metadata and source links; acquire only once file rights and storage plan pass |
| CONDITIONAL_REVIEW | 3 | Compare catalogue/rights text; no bulk photograph ingestion until exact-file legal clearance |
| POLICY_UNVERIFIED | 2 | Metadata-only; no image acquisition until policy review |
| REFERENCE_ONLY | 12 | Art-historical research only; **no institutional-photo scraping, crops or publication** |

### Primary open pool (22)

**American / transatlantic**: Metropolitan Museum of Art; Cleveland Museum of Art; National Gallery of Art **Washington**; J. Paul Getty Museum Open Content; Art Institute of Chicago; Walters Art Museum; Smithsonian Open Access; Yale Center for British Art; Dallas Museum of Art; Denver Art Museum; Los Angeles County Museum of Art (only designated Public Domain High Resolution images); Birmingham Museum of Art **Alabama**; Minneapolis Institute of Art (Public Domain Mark subset); Saint Louis Art Museum (public-domain content subset); Philadelphia Museum of Art **OPenn subset**.

**European**: Rijksmuseum; SMK (National Gallery of Denmark); Paris Musées (City of Paris collection portal including Petit Palais, Musée Carnavalet, Cognacq-Jay and Musée de la Vie romantique); Städel Museum; Mauritshuis; Birmingham Museums **UK** (CC0 subset only); Wellcome Collection (PDM/CC0 subset only).

These institutions differ: some publish CC0; others mark images public domain or state institution-level unrestricted reuse for eligible files. **Do not treat an entire website or its search API as an image licence.** Check exact item flags and rights metadata.

### Rights held or limited

- **Conditional**: Kunstmuseum Basel — free public-domain downloads, but exact file reuse terms require checking; Nationalmuseum Stockholm — image-specific licensing can be CC BY-SA; Belvedere Vienna — example collection images restricted to private/scientific use.
- **Policy not yet verified**: Harvard Art Museums; Yale University Art Gallery. These are deliberately distinct from Yale Center for British Art.
- **Reference only (museum-owned website/download images)**: Museo del Prado; Musée du Louvre / RMN; National Gallery **London**; Gallerie degli Uffizi; Vatican Museums; Victoria & Albert Museum; Museum of Fine Arts Boston; British Museum; Musée d’Orsay / Musée de l’Orangerie; Museo Thyssen-Bornemisza; State Hermitage; Kunsthistorisches Museum Vienna.

**Exception**: a painting physically held by a restrictive museum is not itself blacklisted. An independently obtained, image-specific legally reusable PD/CC0 or compatible Commons photograph of the **same physical work** can be evaluated without using restricted museum site photography. Do not misrepresent a Google Art Project image or a photographer's reproduction as museum Open Access. Respect source website rules and applicable laws.

### Automated acquisition order

1. Retain canonical artwork IDs, frozen approvals, historic rejections (including artist exclusions El Greco / Fra Angelico) and exact physical-work identity.
2. Mine **PRIMARY_OPEN** source metadata in bulk, prioritising relevant Baroque/Renaissance Catholic painting and the user's actual iconographic requirements. Prefer official institutional API, data dump and IIIF, complying with rate limits; distinguish licence of *data* from licence of *images*.
3. Reconcile identical paintings, museum identifiers, titles and alternate copies against existing 383. Capture rights at **image/variant/version** level and maintain object–source–photo relationships.
4. Only for suitable artworks: capture original URL, current rights label, author and institutional credit, original dimensions and colour/metadata; compute source-file SHA-256 on lawful acquisition. Preserve original image permanently at €0 using storage within documented free limits. No speculative mass downloads.
5. Exclude **REFERENCE_ONLY** institutional photo URLs from acquisition. Hold **CONDITIONAL_REVIEW** and **POLICY_UNVERIFIED** from photo ingestion until cleared. Run open-source alternatives (official CC0 or independently validated Commons files) for otherwise valuable works.
6. Exhaust the editorially suitable primary-source search before reconsidering restrictive **museum photographs**. An unavailable painting is a source problem, not a reason to unapprove the painting.
7. After the *specific* source-image licence is verified, proceed to native photographic QA: framing/support margins; full painted field; resolution and corner detail; accurate colours/white balance, absence of reflections, noise, edits, artificial upscaling, overlays/watermarks. Preserve original bytes and mark any candidate crop separately. **No automatic pristine certification and no production release**.

### Initial source-specific evidence

- [Met](https://www.metmuseum.org/policies/image-resources), [Cleveland](https://www.clevelandart.org/open-access), [NGA Washington](https://www.nga.gov/terms-and-notices), [Getty](https://www.getty.edu/legal/terms-of-use/).
- [Rijksmuseum](https://data.rijksmuseum.nl/policy), [Art Institute of Chicago API](https://api.artic.edu/docs/), [SMK rights](https://connect.smk.dk/om/rettigheder), [Paris Musées API terms](https://apicollections.parismusees.paris.fr/cgu), [Städel](https://sammlung.staedelmuseum.de/en/concept).
- [Prado image bank](https://www.imagebankmuseodelprado.com/en/license-agreement), [Louvre collections terms](https://collections.louvre.fr/en/page/cgu), [National Gallery London images](https://www.nationalgallery.org.uk/documentation/ngacuk/licences), [Vatican website](https://www.museivaticani.va/content/museivaticani/en/copyright.html), [Uffizi](https://www.uffizi.it/en/professional-services/photo-rights-reproductions), [MFA Boston](https://www.mfa.org/collections/mfa-images/licensing/frequently-asked-questions).

### Real next stage / measures of progress

- Enlarge the **institutional discovery queue** from Europe/US to other galleries **using official policy evidence, not hearsay**.
- For each of the 22 preferred programmes, collect relevant collection size and artist/subject/title matches **without downloading entire collections**.
- Rank candidates by exact iconographic fit and availability of a truly reusable original photograph, not by museum fame alone.
- Report **number of institutions screened; paintings discovered; physical-work matches to canonical artworks; per-image rights verified; photo SHA joined; frames/quality passed; releases** as separate counters.
- Do not assert that a museum has been exhausted until its documented query scope, date, coverage, filters and exception count are archived. The 22 programmes are an opening cohort, not an exhaustive world list.

**Preservation**: do not change the 383 audit dispositions, the 107 approved artwork decisions, the 22 Prayer heroes, artist exclusions, other historical rejects or production assets. No fees or fee-bearing image licences.
