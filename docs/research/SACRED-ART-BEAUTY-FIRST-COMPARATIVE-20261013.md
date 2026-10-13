# Sacred Art — five benchmarks versus seven exact originals

**13 October 2026 · Draft research PR #887 · Artistic quality review, not source-coverage checklist.** All 101 earlier human artwork choices remain unchanged; no image promoted or released.

## Purpose

The artistic criteria already established for Ad Orientem had been diluted by a sequence of research-source, SHA-256 and mobile crop exercises. This batch directly compares the expressive/painterly character of known top-tier sacred works with the most promising original images now in the archive, rather than mining more museum catalogues.

**Non-negotiable principle:** an image can be excellent as a documentary Gospel illustration yet fail the sacred-art aesthetic. One does not rescue an ordinary image by adding source authenticity, a correct biblical moment, 4K colour data or CC0 rights. Every displayed painting must itself be beautiful; if not, text/map/no image is preferable.

## Reference originals

| Reference | Original institution | Why it establishes the bar |
|---|---|---|
| [Ribalta, *Christ embracing Saint Bernard*](https://www.museodelprado.es/en/the-collection/art-work/christ-embracing-saint-bernard/f878e05f-b1b9-4cb0-b182-152e611bcec5) | Prado P002804 | Devotional intensity, anatomy, expression, light and a striking intimate Christian spiritual encounter. |
| [Rubens, *Saint James the Greater*](https://www.museodelprado.es/en/the-collection/art-work/saint-james-the-greater/72f76d59-fab7-4cea-8214-af0fb98fc293) | Prado P001648 | Rich painterly drapery, vivid human expression, naturalistic weight and saintly authority. |
| [Lanfranco, *Miracle of the Loaves and Fishes*](https://onlinecollection.nationalgallery.ie/objects/10345/the-miracle-of-the-loaves-and-fishes) | National Gallery Ireland NGI.72 | 229×426 cm *full panoramic* Counter-Reformation narrative, modelled figures, Eucharistic meaning. Old square preview was a crop and should not be treated as composition evidence. |
| [Navarrete, *Abraham and the Three Angels*](https://onlinecollection.nationalgallery.ie/objects/details/3180) | National Gallery Ireland NGI.1721 | Luminous Renaissance sacred narrative and an excellent exception to the idea that Old Testament needs weaker art. |
| [Georges de La Tour, *Saint Joseph the Carpenter*](https://collections.louvre.fr/ark:/53355/cl010063817) | Louvre RF 1948 27 | Controlled human expression and candlelit contemplation; reverence without theatrical excess. |

Reference images were seen as publicly available institutionally identified previews. They were **not** copied from institutionally licensed original masters, and should not be treated as production assets.

## Seven actual original-JPEG candidates — quality first

| Tier for human aesthetic consideration | Painting | Specific painterly judgment |
|---|---|---|
| **A-level review, not approved** | [Philippe de Champaigne — *Annunciation*](https://www.metmuseum.org/art/collection/search/438724) | Strong painterly composition, luminous Gabriel and Virgin, colour saturation, figure focus, theologically reverent. Already represented in earlier history, not a newly selected artwork. |
| **A-level review, not approved** | [Francisco de Zurbarán — *Saint Lucy*](https://www.nga.gov/artworks/12209-saint-lucy) | Outstanding tactile drapery, illuminated flesh/face, dark space, quiet piety. Comparably substantial portrait character to Prado apostolate. |
| **B supporting candidate** | [Benedetto Luti — *Woman of Samaria*](https://www.metmuseum.org/art/collection/search/702752) | Beautiful clear sacred dialogue with nuanced anatomy and harmonious colours, but lower religious force than the Ribalta benchmark. |
| **B supporting candidate** | [Jacopo Bassano — *Miraculous Draught*](https://www.nga.gov/artworks/96688-miraculous-draught-of-fishes) | Accomplished Venetian figural storytelling and rich colours; proper 4096×2395 landscape, unsuitable for portrait cover cropping. |
| **B supporting candidate** | [Guercino — *Rest on the Flight*](https://clevelandart.org/art/1967.123) | Quiet painterly devotional intimacy. Strict relation is a rest, not the initial journey. Circular framing remains integral. |
| **B comparison pending** | [Carlo Maratti — *Flight into Egypt*](https://www.metmuseum.org/art/collection/search/816629) | High-quality figures and blue chromatic clarity, but decorative cloud/cherub group weakens sculptural spiritual concentration versus the benchmark. |
| **B comparison pending** | [Sébastien Bourdon — *Baptism*](https://www.metmuseum.org/art/collection/search/435755) | A dignified, plausible painting with clear baptism and oval structure, but not yet proven equivalent in artistic force to reference artworks. |

These rankings are **assistant hypotheses to help the user make comparisons**, not mathematical scores, user approvals, or a licence to replace one of the 101 selected originals. No previously rejected Velázquez/El Greco/Fra Angelico paintings were placed in the affirmative comparison gallery. The 13 already visually audited technical-originals remain useful background, but **the seven works above are the actual focused aesthetic batch**.

## Deliverables and boundaries

A new **single HTML aesthetic review gallery** was built and delivered in this chat with all five benchmark paintings and seven shortlisted full-composition reproductions. Seven candidate images are embedded as reduced previews from verified acquisition JPEGs and work offline; benchmark images are linked to remote image providers and **require internet** (with visible museum links for fallback). The HTML compares any two images, filters aesthetic tiers, and exports personal A/B/C/D evaluations. It contains no release setting and does not alter the GitHub repo when choices change.

The independent seven-original SHA hashes are preserved in [machine readable comparison](../../data/calendar/sacred-art-5-benchmarks-7-originals-beauty-review-20261013.v1.json); all seven match the existing acquisition registry.

**Next gate:** the human curator reviews works visually against the five benchmarks and chooses which merit continued art-search or actual approval. No new Old Testament image quota. For a future Home flagship, use exceptional artistically approved art only; for Bible Theatre use good supporting art when it genuinely contributes. Full-resolution rights, exact photo object identity, correct book/chapter/event link and phone display still remain later gates.

**Technical testing:** Seven embedded candidate images loaded in the local HTML browser test; all 12 cards rendered, and side-by-side comparison and preference selection worked. The full-page browser test via a `file:` URL was blocked by this environment; equivalent markup was tested via browser `set_content`. Remote benchmark images could not be loaded in the isolated environment, so actual online reference rendering cannot yet be certified there.
