# W68 — User W67 Saints R1 review: 70 numeric decisions, not two ratings
**15 October 2026 · Sacred Art owner PR #887 · Research-only / no runtime modification**

## Status and authority

The user returned `Ad_Orientem_Sacred_Art_W67_Saints_R1_Ratings_2026-10-15.json` (upload exported 2026-10-15T14:54:27.467Z). The JSON's exact file SHA-256 is `73729edb41ea3d90f0f63e3b3ba532996a43bd3156ad9f3fc074488f9e80b7d7`. All **70 cards have explicit numeric scores**; only **two** carry the *additional, separately asked* suitability response. **Do not discard 68 scored decisions or demand the user repeat ratings.** The old gallery's `completedCount=2` counts score **and** suitability, not rated images.

Canonical score overlay: [W68 new user decisions](../../data/calendar/sacred-art-w68-w67-r1-explicit-user-scores-20261015.v1.json). The existing W49/W46 ratings are retained and **no prior rated source ID overlapped any of the new 70**. The original W49 95-ID rejection snapshot is immutable; **eight new exact-ID rejects are an additive delta**, not silently merged into a 2026-10-14 source file.

| Score | User decisions | Policy |
|---|---:|---|
| 5 | 0 | No new five-star approved original |
| 4 | 28 | Pending selection or comparison; **not a 5** |
| 3 | 34 | Research-only; do not put back into gallery unless a new fit-specific request justifies it |
| 2 | 6 | Permanent rejection of reviewed original |
| 1 | 0 | — |
| 0 | 2 | Permanent rejection of reviewed original |
| **Total** | **70** | 70 numeric ratings; 68 fit null |
 
Eight rows have `flags.sourceIssue=true` but no explanation, therefore preserve the exact flag without asserting an error type or overriding the score. None has `wrongImage` or `poorCrop` checked. The source-image inspection checkbox was not checked on any card; this does not establish that the artworks were unseen in the gallery.

Two explicit `suitable_elsewhere` decisions:
- Miguel Cabrera's *Conversion of Saint Ignatius Loyola* (3/5) should remain **research/context elsewhere**, not an Ignatius calendar portrait.
- Juan Carreño de Miranda's *Apotheosis of Saint Anthony* (3/5) should remain **research/context elsewhere**, not an Anthony portrait.

No 'perfect for theme' choice is recorded.

## Key strategic finding

**31 of the 33 reviewed saint subjects already have at least one W49 5/5 candidate placement**. This does not certify physical-art image identity, saint-specific iconography, nor technical release, but means immediately asking for another broad round for these saints would duplicate established aesthetic curation.

The two subjects among these 33 with **no existing W49 5/5 placement** are **Saint Bonaventure** and **Saint Catherine of Siena**. Their newly reviewed candidates were scored 3/5 (two candidates each); neither has a new four or five. **Do not launch new research yet:** W49 already retains **one previously rated 4/5 candidate for Bonaventure** (Domenico Vaccaro's *Vision of St Bonaventura*, `C34:visionofstbonaventuradomenicovaccarosanlorenzomaggioremuseum`) and **three previously rated 4/5 candidates for Catherine of Siena** (Bernardino Mei, Cristofano Allori and Giambattista Tiepolo). Preserve these four existing scores; reconcile their exact photographed paintings and suitability before concluding the subjects need additional discovery. A four is pending user selection, not a five-star approval.

## New rejected originals (add to global exact-object exclusion union)

| Saint subject | Exact reviewed work label | Score | Reviewed candidate ID |
|---|---|---:|---|
| Saint Catherine of Alexandria | Gaspar de Crayer - The Ascension of Saint Catherine of Alexandria - NG 1211 - National Galleries of Scotland.jpg | 2 | `C32:gaspardecrayertheascensionofsaintcatherineofalexandriang1211` |
| Saint Ambrose | Filippo Lippi, St. Ambrose's Miracle of the Bees, 1441-47.jpg | 2 | `C32:filippolippistambrosesmiracleofthebees144147jpg` |
| Saint Thomas Aquinas | SMN Chiostro Grande e06 Mauro Soderini, San Tommaso d'Aquino presenta l'uffizio del Corpus Domini a Urbano IV.JPG | 0 | `C34:smnchiostrograndee06maurosoderinisantommasodaquinopresentalu` |
| Saint Thomas Aquinas | SMN Chiostro Grande e09 Cosimo Gamberucci, San Tommaso viene cinto da due angeli con cingolo di perpetua castità.JPG | 0 | `C34:smnchiostrograndee09cosimogamberuccisantommasovienecintodadu` |
| Saint Bartholomew | Bartolomeo Montagna Madonna in trono con il Bambino tra i santi Giovanni Battista, Bartolomeo, Agostino e Sebastiano e tre angeli musici Vicenza.jpg | 2 | `C34:bartolomeomontagnamadonnaintronoconilbambinotraisantigiovann` |
| Saint Anne | Camillo Procaccini, Natività Beata Vergine, chiesa a Brinzio (VA).jpg | 2 | `C35:camilloprocaccininativitabeataverginechiesaabrinziovajpg` |
| Saint Anne | Werkstatt Lucas Cranach d.Ä. - St. Anna nach der Geburt der Jungfrau.jpg | 2 | `C35:werkstattlucascranachdastannanachdergeburtderjungfraujpg` |
| Saint Anne | Hans Memling - Old Woman at Prayer with St. Anne - Google Art Project.jpg | 2 | `C35:hansmemlingoldwomanatprayerwithstannegoogleartprojectjpg` |

**Ban semantics:** eight *rated original candidate IDs* excluded immediately from further display and release; their exact Commons file URL and shown preview are recorded in W68. Excluding different catalogued objects merely because an artist or title is similar is prohibited. Conversely, verified exact duplicates/other crops of a rejected physical painting are also rejected.

## Source-provenance investigation queue

| Saint subject | Exact reviewed work label | Score (preserved) | Candidate ID |
|---|---|---:|---|
| Saint Mary Magdalene | Domenico Morelli - La Maddalena ai piedi di Gesù.jpg | 4 | `C32:domenicomorellilamaddalenaaipiedidigesujpg` |
| Saint Catherine of Alexandria | Federico barocci, martirio di santa caterina d'alessandria, 1610, 02.jpg | 4 | `C32:federicobaroccimartiriodisantacaterinadalessandria161002jpg` |
| Saint John the Baptist | Bernardino mei (attr.), san giovanni battista davanti a erode, 01.jpg | 3 | `C32:bernardinomeiattrsangiovannibattistadavantiaerode01jpg` |
| Saint Lawrence | Michael Willman Opus Magnum 2019 P06 Matyrdom of St. Lawrence (1663).jpg | 3 | `C32:michaelwillmanopusmagnum2019p06matyrdomofstlawrence1663jpg` |
| Saint Francis de Sales | Cathédrale Saint-Étienne de Toulouse – Saint François de Sales remet la règle à sainte Jeanne de Chantal - By Bertrand François (1756-1805) PM31001527.jpg | 4 | `C34:cathedralesaintetiennedetoulousesaintfrancoisdesalesremetlar` |
| Saint Francis de Sales | Corrado Giacquinto - Saint Jane Frances of Chantal and Saint Francis of Sales in adoration of the Heart of Jesus - Santa Bárbara, Madrid.jpg | 4 | `C34:corradogiacquintosaintjanefrancesofchantalandsaintfrancisofs` |
| Saint Matthew | Michael Willman Opus Magnum 2019 P14 Matyrdom of St. Matthew (1700).jpg | 4 | `C34:michaelwillmanopusmagnum2019p14matyrdomofstmatthew1700jpg` |
| Saint Benedict | Michael Willman Opus Magnum 2019 P59 Death of St. Benedict (ca 1682).jpg | 3 | `C34:michaelwillmanopusmagnum2019p59deathofstbenedictca1682jpg` |

There are five flags on 4-star candidates and three on 3-star candidates. The `sourceIssue` checkbox gives **no reason**. Investigate the specific file and catalogue identity before any release, without permission enquiries and without repeating aesthetic ratings.

## Subject-level reconciliation (this W67 batch versus earlier W49)

| Subject | New 4 | New 3 | New 0–2 | Earlier W49 5 placements |
|---|---:|---:|---:|---:|
| Saint Albert the Great | 0 | 1 | 0 | 1 |
| Saint Ambrose | 0 | 0 | 1 | 3 |
| Saint Anne | 0 | 2 | 3 | 1 |
| Saint Anthony of Padua | 0 | 3 | 0 | 3 |
| Saint Bartholomew | 0 | 0 | 1 | 1 |
| Saint Benedict | 0 | 3 | 0 | 4 |
| Saint Bernard of Clairvaux | 1 | 0 | 0 | 1 |
| Saint Bonaventure | 0 | 2 | 0 | 0 |
| Saint Catherine of Alexandria | 1 | 1 | 1 | 1 |
| Saint Catherine of Siena | 0 | 2 | 0 | 0 |
| Saint Cecilia | 1 | 0 | 0 | 2 |
| Saint Dominic | 1 | 1 | 0 | 1 |
| Saint Francis de Sales | 2 | 0 | 0 | 3 |
| Saint Francis Xavier | 3 | 0 | 0 | 1 |
| Saint Geneviève | 1 | 1 | 0 | 1 |
| Saint Ignatius of Loyola | 0 | 1 | 0 | 1 |
| Saint Joan of Arc | 0 | 2 | 0 | 1 |
| Saint John the Baptist | 0 | 3 | 0 | 1 |
| Saint Lawrence | 0 | 2 | 0 | 1 |
| Saint Louis IX | 1 | 4 | 0 | 1 |
| Saint Luke the Evangelist | 1 | 0 | 0 | 2 |
| Saint Martin of Tours | 1 | 2 | 0 | 1 |
| Saint Mary Magdalene | 1 | 0 | 0 | 4 |
| Saint Matthew | 1 | 1 | 0 | 1 |
| Saint Michael Archangel | 0 | 1 | 0 | 1 |
| Saint Nicholas | 3 | 0 | 0 | 1 |
| Saint Philip | 1 | 0 | 0 | 2 |
| Saint Raphael Archangel | 3 | 0 | 0 | 1 |
| Saint Sebastian | 1 | 0 | 0 | 1 |
| Saint Stephen | 0 | 1 | 0 | 1 |
| Saint Teresa of Ávila | 2 | 0 | 0 | 1 |
| Saint Thomas Aquinas | 2 | 0 | 2 | 1 |
| Saint Vincent de Paul | 1 | 1 | 0 | 1 |

Earlier five placements are not proven unique physical paintings or correct solo portraits. For example group imagery may be marked suitable elsewhere. This table is for **triage**, not percentage of actual calendar/saint image coverage.

## Next actions

1. **Lock recorded scores** as a new explicit W68 authority and add the eight rejected source IDs to *all future candidate filters*; do not overwrite previous score ledgers.
2. **Apply the user's sourceIssue flags** to exact photo/object technical holds; identify Commons source objects, original-photo mismatch, provenance, available licence status and actual bytes.
3. **Defer 28 four-star alternates:** these are not approvals; keep them for user-choice comparison only when needed against the existing already-approved five-star selections. Do not automatically re-display them simply to achieve five.
4. **Target actual missing iconography** (not raw date counts), after reconciling the one existing Bonaventure four-star and three Catherine of Siena four-star candidates before searching for replacement works. Avoid a broad second 70-image gallery until existing artwork IDs and cross-module reuse have been reconciled.
5. **Repair the gallery progress semantics** for any next batch: show *numeric scores recorded* and *optional suitability choices recorded* separately. The old conjunction misreported 70 scored images as 2 complete.

No imagery published, no licence sought, no permission outreach, no score altered and no live app change.
