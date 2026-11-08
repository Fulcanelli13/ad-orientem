# Sacred Art Phase 50 — within-selection physical-object dedupe and museum accession passports

Research branch: `research/sacred-art-phase48-crosswalk-recovery-20261108`. Date: 8 November 2026. **No public/gallery changes.**

## What changed

The prior Phase 49 count of **14 selected-to-989 relationships across 13 selected records** remains correct and unchanged. Comparing the owner-selected **177** photograph records *to one another*, rather than only against the 989-group register, revealed **four verified repeated physical paintings represented by eight different handpicked source-photo records**. All eight photographs remain separately selectable and preserved; this is an identity relationship, not a permission to choose one photo and discard the other.

| Selected records | Physical painting | Institutional identity |
|---|---|---|
| RECENT575::147, ::152 | Jacob van Oost, *Christ Crowned with Thorns / Doornenkroning* | Musea Brugge, **0000.GRO0672.I**, 1661, 122.1×97.8 cm; https://collectie.museabrugge.be/en/collection/work/id/0000_GRO0672_I |
| RECENT575::114, ::156 | Jacob van Oost, *Saint Anthony Raises a Man from the Dead* | Groeningemuseum / Musea Brugge, **0000.GRO0178.I**; Commons source identifies the museum's archival inventory and both photo variants; independent museum page still to be rechecked |
| RECENT575::362, ::363 | Reynaud Levieux, *Rest on the Flight into Egypt* | Musée des Beaux-Arts de Strasbourg, **44.2015.1.1**, 73.5×99 cm; https://collections.musees.strasbourg.eu/fr/document/le-repos-pendant-la-fuite-en-egypte/5ee33891461cda28a3a5d52e |
| RECENT575::398, ::477 | Dieric Bouts, *Paradise / Ascension of the Elect* | Palais des Beaux-Arts de Lille, **P.820**; https://pba-opacweb.lille.fr/fr/notice/p-820-l-ascension-des-elus-76173856-7ef8-4661-8b99-ac3dd343a80f |

Therefore **177 selected photographs are demonstrably not 177 distinct paintings**, and the collection currently contains at most **173 distinct physical objects** among these 177 rows. That upper bound does not certify a definitive count: more physical-object duplicates may remain.

Explicit within-selected *non*-aliases protect the two Bouts Lille panels, different scenes by Van Oost, and Pourbus-vs-Provoost Last Judgments.

## Museum accession passports — 15 physical works / 18 selected photo records

The new `data/artwork/phase50-institutional-object-passports.v1.json` adds primary or institutional collection evidence for the same selected 177-photo programme, with separate photo-rights gates.

**Toulouse**: four object identities from the official French POP Joconde database: Ricchi *Saint Cecilia*, inv. **2004 1 296** (05620000473); Cairo *Mystic Marriage of Saint Catherine*, **2004 1 73** (05620000316); Stella *Marriage of the Virgin*, **2004 1 75** (05620000368); Gabriel Blanchard *Purification*, **2004 1 213** (05620000017). These attest physical objects, not reusable photo rights. The Blanchard chapel cycle must not be conflated with Charles de La Fosse's *Presentation*, inv. 2004 1 237.

**Bruges**: Van Oost *Crowning with Thorns* **0000.GRO0672.I**, Pourbus *Last Supper* **1995.GRO0020.I**, Pourbus *Last Judgment* **0000.GRO0110.I**. Musea Brugge provides individual IIIF manifests, and the catalogue marks the painting representations public domain; a particular chosen derivative still needs photographic-edition review. Official links and manifests are recorded individually. Note that the 1548 Pourbus *Last Supper* is currently listed as being at Gruuthusemuseum rather than physically on display at the Groeningemuseum.

**Strasbourg**: Levieux *Rest on the Flight into Egypt* **44.2015.1.1**, official museum collection. For use of the museum photograph the collection directs visitors to its photothèque; do not assume photo reproduction rights merely from painting age.

**Lille**: Bouts *Paradise / Ascension of the Elect* **P.820**, official museum collection. Its companion panel *Fall of the Damned* **P.1808** is a different physical painting; a triptych relationship is not the same as photo identity.

**Dijon, Musée Magnin**: Fenzoni *Conversion of Saint Paul* **1938 E 401**; Jean-Baptiste de Champaigne's *Saint Paul Stoned at Lystra* **1938 F 142**; Romanelli *Moses and the Daughters of Jethro* **1938 E 466**; Badalocchio-attributed *Penitent Magdalene* **1938 E 393**; Allori *Susanna and the Elders* **1938 E 332**; and circle-of-Girolamo-Marchesi *Saint Peter Heals the Paralytic* **1938 E 520**. Evidence from Ministry POP, Musée Magnin's own catalogue/press sheets, and INHA. The **RMN/GrandPalais photo credits require a separate reuse-rights decision** for the cited museum reproductions; the original owner-selected images have not been replaced or assessed as cleared by this action. Preserve the 'attributed to' / 'circle of' caveats.

## Source integration, counts and future gates

- `data/artwork/selected-177-physical-object-aliases-phase50.v1.json`: four evidence-linked intraset identity pairs and four protected non-alias checks.
- `data/artwork/phase50-institutional-object-passports.v1.json`: 15 source passports spanning 18 selections, with inventoried evidence and a photo rights gate.
- `data/artwork/canonical-selected-photo-identity-decisions.v1.json`: references to both new ledgers. **No further selected-to-989 painting links claimed.**
- `tests/sacred-art-phase50-selected-object-aliases.mjs`: fail-closed research regression assertions.

**Counts held stable:** 989 older operational groups; 177 selected photograph records; 14 cross-register links / 13 unique selected records; 156 currently without reliable group link; eight selected identity holds; 1,599 rejected source records still excluded. **New Phase 50 information:** at least four within-177 duplicates; 15 accessions matched to institutional sources; 18 selected records served by those passports.

**Next production-oriented gate:** identify image reuse rights and highest-quality institutional photographic edition for each approved/handpicked object, then verify rendering and coverage in actual module routes. Museum object identity alone does not permit publishing an unreviewed replacement. No Vercel deployments.
