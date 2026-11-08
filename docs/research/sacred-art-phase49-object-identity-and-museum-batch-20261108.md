# Sacred Art — Phase 49: physical-object crosswalk, 8 November 2026

**Research only.** Branch: `research/sacred-art-phase48-crosswalk-recovery-20261108`. No live-gallery, Prayer, Calendar, Home, or source-photo replacements. GitHub Pages only.

## Verified result

| Measure | Phase 47 | Phase 49 |
|---|---:|---:|
| Supported selected-to-operational object relationships | 10 | **14** |
| Unique handpicked selected records linked to one or more operational groups | 10 | **13** |
| Museum-identified selected records without reliable group link | 159 | **156** |
| Selected records with unresolved physical identity | 8 | **8** |
| Explicit prohibited cross-register false-merge pairs | 4 | **6** |
| Operational research groups (not certified distinct physical paintings) | 989 | **989** |
| Rejected research source records protected | 1,599 | **1,599** |
| Photographic approvals/replacements from crosswalk | 0 | **0** |

There are **four new verified relationships for three selected records**, because the Van Dyck painting has two separately indexed older group records. Do not equate 14 relationships with 14 distinct selected paintings or 14 newly published artworks.

## Phase 49 exact-object relationships

1. **RECENT575::262 → REVIEW::kmska:zmaloe**: Anthony van Dyck, *Christ on the Cross — De lanssteek / The Lance Thrust*, Antwerp KMSKA inventory **297**, 1620, approximately 429.6×310 cm. Official KMSKA https://kmska.be/nl/meesterwerk/christus-aan-het-kruis-de-lanssteek-0 ; institutional PURL http://kmska.be/collection/work/data/zmaloe ; independent Flemish collection https://vlaamsekunstcollectie.be/en/collectie/297 . Selected Commons https://commons.wikimedia.org/wiki/File:Peter_Paul_Rubens_-_Christ_on_the_Cross_between_the_Two_Thieves_-_WGA20235.jpg . The filename retains the earlier Rubens attribution; current KMSKA attribution is Van Dyck.
2. **RECENT575::262 → CANONICAL::ART-nthony-van-yck-he-ance-hrust**: the **same KMSKA 297 painting**, already indexed under the title *The Lance Thrust* in the operational corpus, with a **different image version** https://commons.wikimedia.org/wiki/File:Anthony_van_Dyck_-_Christ_on_the_cross_between_the_two_criminals.jpg . No image replacement authorized.
3. **RECENT575::220 → REVIEW::commons:65879554**: Sébastien Bourdon, *Le Martyre de saint André*, Musée des Augustins, Toulouse, inventory **2004 1 52**. Official French Ministry culture notice https://pop.culture.gouv.fr/notice/joconde/05620000033 . Handpicked image https://commons.wikimedia.org/wiki/File:S%C3%A9bastien_Bourdon_-_Le_Martyre_de_Saint_Andr%C3%A9_-_Mus%C3%A9e_des_Augustins_-_2004_1_52.jpg ; older group image https://commons.wikimedia.org/wiki/File:Augustins_-_Le_Martyre_de_Saint_Andr%C3%A9_-_S%C3%A9bastien_Bourdon_2004_1_52.jpg . The older group's `artist=Didier Descouens` is actually the photographer credit, not the painter. Its high-resolution 5,168×6,037 photograph is CC BY-SA 4.0 and is **not automatically approved**.
4. **RECENT575::369 → REVIEW::commons:163857133**: Andrea Vaccaro, *Head of Saint John the Baptist*, Musée des Beaux-Arts Strasbourg, inventory **44.2009.3.1**, Joconde reference **00190087473**. Selected image https://commons.wikimedia.org/wiki/File:Andrea_Vaccaro,_T%C3%AAte_de_Saint-Jean_Baptiste.jpg ; older group image https://commons.wikimedia.org/wiki/File:81_Andrea_Vaccaro%2C_T%C3%AAte_de_saint_Jean-Baptiste.jpg ; collection/photo grouping https://commons.wikimedia.org/wiki/Category:Head_of_Saint_John_the_Baptist_(Andrea_Vaccaro) . The old group's `artist=DCHNwam` is a photographer/uploader credit, not the painter. As with Toulouse, artwork identity is confirmed; image rights, edition and quality are separate.

## Two additional fail-closed false merges

- **RECENT575::262 ≠ REVIEW::kmska:d7e5gq**: the latter is Van Dyck's **different** `Christ on the Cross`, KMSKA **406**, 102.5×71.7 cm. Source: https://vlaamsekunstcollectie.be/en/collectie/406 vs KMSKA 297 https://vlaamsekunstcollectie.be/en/collectie/297 .
- **RECENT575::076 ≠ CANONICAL::ART-eter-aul-ubens-courging-at-the-illar-ntwerp-osary-cycle**: Rubens's **small preparatory Flagellation oil sketch**, MSK Ghent **1910-Z**, 37.4×35.1 cm, is physically distinct from the **219×161 cm** Rosary-series Flagellation in St Paul's, Antwerp. Sources: https://commons.wikimedia.org/wiki/File:Peter_Paul_Rubens_-_The_Flagellation_of_Christ_-_WGA20432.jpg and https://commons.wikimedia.org/wiki/File:Flagellation-of-christ-_Rubens.jpg .

These cases demonstrate why exact title/artist alone is not a safe painting-identity key. Some source group `artist` fields need to be split into `creator` and `photographer`, without erasing original source attribution and provenance.

## Validation and publication

A research-branch integrity test `tests/sacred-art-crosswalk-phase49.mjs` enforces the expected Phase 49 counts, group ID membership, selected-photo protection, zero identity/false-merge overlap, and both new negative guards. The ledger was additionally checked against all **989** semantic group IDs, with all invariants passing. This does not certify actual route rendering or photograph quality.

The **16** previously checked public module photograph URLs remain a separate release inventory, not a count of all paintings displayed. Route-by-route live screen coverage is still **not certified**.

Next priority: museum inventory/object-identity joins among the remaining **156** unlinked museum-identified selections, then rights/quality evaluation for handpicked photographs and first-party institutional alternatives. Do not auto-promote unapproved Commons photographs. Preserve all explicit owner rejections and existing Prayer/Calendar artwork placements.
