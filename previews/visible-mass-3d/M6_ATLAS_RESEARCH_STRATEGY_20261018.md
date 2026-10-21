# M6 · Photographic Atlas — baseline and first sourcing batch

**18 October 2026 | Draft PR #1309 | research-only, no publication.**

M6 is a systematic image-coverage operation on the existing **170 canonical physical-object navigation IDs**, not the creation of 170 new glossary definitions. The existing 13-zone crosswalk remains the sole owner of proposed physical-object IDs; the canonical G### glossary, 134 pilot VMQ questions and 1962 Mass readers are unchanged.

## Concrete output

- [M6 complete machine-readable coverage registry](M6_PHOTOGRAPHIC_ATLAS_COVERAGE_20261018.v1.json): **170 entries, 13 zones**, with source-linked images, exact original scene scope, canonical G### match class and inspectable-photo gaps.
- [M6 photographic review template](m6-atlas-review-template.html) and `tools/build-visible-mass-m6-atlas-review.mjs` produce a **portable one-file review page** with category and coverage filters, individual source links and exportable 0–5 ratings/placement decisions. Preview thumbnails require optional internet; the register works offline.
- **12 authenticated M5 church photographs** and **17 pre-existing independent object-image candidates** are referenced, not copied or silently reapproved. All six provisional Brompton hotspots relate to **one original Anthony O'Neil still**: they do not represent six separate image assets.
- Prior to new research, **147/170 objects** had neither an independent image candidate nor an original photo hotspot. After this batch, the new source-backed object-photo leads for **EQ06 (altar bell)** and **AL08 (altar candles)** reduce that figure by two. **AL13** has only a separate historical illustration, and **BK02** has a historical Missal-stand discovery that still requires author/licence certification.
- **35 registered photographic/source records**, not 35 approved publishable photographs: 12 real M5 scene photos, 17 legacy object-source candidates and 6 new research records (two altar-bell photographs, one altar-linen illustration, one historic Missal-stand lead, one Catholic altar-candles photo, one Catholic altar-candlestick photo).

## Zone-by-zone object requirements

| Zone | Subjects | Existing independent object image candidates | Existing original Brompton provisional marker subjects |
|:--|--:|--:|--:|
| EN · Entrance and nave | 13 | 0 | 0 |
| DV · Devotional furnishings | 12 | 0 | 0 |
| SN · Sanctuary | 11 | 2 | 2 |
| AL · Altar and furnishings | 20 | 3 | 4 |
| SV · Sacred vessels | 13 | 4 | 0 |
| LN · Sacred linens | 8 | 5 | 0 |
| EQ · Serving equipment | 16 | 2 | 0 |
| SC · Sacristy | 10 | 0 | 0 |
| VE · Vestments | 20 | 0 | 0 |
| BK · Liturgical books | 15 | 1 | 0 |
| SA · Sacramental furnishings | 11 | 0 | 0 |
| SE · Seasonal/special-day arrangements | 14 | 0 | 0 |
| SP · Special ceremonial items | 7 | 0 | 0 |
| **Total** | **170** | **17** | **6** |

*This table describes the **previous** linked imagery; the M6 new research additions are recorded separately in the machine registry. A photo candidate is neither approved publication nor a verified appearance of that object in the original Brompton image.*

## First Commons sourcing batch — authenticated sources vs leads

- **EQ06, Mass/altar bells:** [set of altar bells](https://commons.wikimedia.org/wiki/File:Altar_Bells.JPG), Hththt, personally dedicated to public domain, 2048×1536; [single altar bell on pillow](https://commons.wikimedia.org/wiki/File:Altar_bell_on_pillow.jpg), Whoisjohngalt, CC BY-SA 4.0, 2940×2342. Two alternative object photographs, NOT photographs from Brompton.
- **AL08, altar candle(s):** [Catholic Kreuzkapelle altar candles, Dülmen](https://commons.wikimedia.org/wiki/File:D%C3%BClmen,_Kreuzkapelle,_Kerzen_--_2021_--_7127.jpg), Dietmar Rabich, CC BY-SA 4.0, 6720×4480. Original Catholic chapel source. Not an isolated candle and not evidence of beeswax material or 1962 Mass usage.
- **AL07, altar candlestick:** [Igreja do Santíssimo Sacramento de Sant'Ana, Salvador](https://commons.wikimedia.org/wiki/File:Igreja_do_Sant%C3%ADssimo_Sacramento_de_Sant%27Ana_Salvador_Altar_Candlestick_2019-1859.jpg), Paul R. Burley, CC BY-SA 4.0, 3501×5251. Separate Catholic altar-candlestick detail; does not confirm the six-candle arrangement in Brompton.
- **AL13, altar linen:** [Catholic Picture Dictionary (1948) explanatory image](https://commons.wikimedia.org/wiki/File:Catholic_Picture_Dictionary_(Pfeiffer)_-_Altar_cloth.jpg), R. and K. Wood. *Historical illustration only*, US nonrenewal public-domain claim; worldwide rights need further legal review. **Still seek a proper colour photograph.**
- **BK02, Missal stand:** [historic Japanese Christian Missal stand, Peabody Essex Museum](https://commons.wikimedia.org/wiki/File:Missal_stand,_Japan,_late_1500s_to_early_1600s_AD,_lacquered_wood,_mother-of-pearl,_gold_-_Peabody_Essex_Museum_-_DSC07672.jpg). Explicit **discovery-only** until exact author and licence are corroborated. The historical specimen may not represent a typical 1962 altar Missal rest.

## Next photographic acquisition priorities

1. **Finish 30-object pilot:** inspect the existing 17 object-source candidates for object clarity, rights and 1962 suitability; secure proper altar-linen and Missal-stand photographs; find a gradine/candle shelf close-up; label Epistle/Gospel altar sides from an exact source-owned altar viewpoint after rubrical orientation review. Don't substitute other-church geometry for Brompton hotspots.
2. **Secure one strong object detail per missing family:** 20 vestments, 15 liturgical books, 14 seasonal/special-day setups, 13 entrance/nave subjects, 12 devotional furnishings, and the 11 sacramental furnishings. Keep a source, real object/venue, photographer, legal permission, dimensions, relevance confidence, and visual rating for every candidate.
3. **Then extend multiple image roles:** context (where located), detailed object photograph (what it is), and actual traditional Mass-use photograph (when/how it is used). A context image cannot double as a genuine object close-up unless clarity is sufficient; in-use pictures must identify actual ceremony/venue.
4. **Source sequence:** the user's already curated M5/P6 original photographs first, then independently licensed Commons files in Italian/French/Irish Catholic churches and reputable museum open-access collections. Avoid Protestant/Anglican church examples masquerading as Roman Catholic context, freestanding tables implying the 1962 high altar, tourist watermarks, and generic commercial images of unresolved rights.

## Curation and release gates

A record must never assert that a separately photographed object is actually present at Brompton, or that a Newman Church photograph depicts a 1962 rite. Provenance and real scene IDs control all transitions. Preserve photographer, source URL, licence, adaptations and jurisdiction caveats. **No image is publication-approved just because it appears in this research register.**

Contract: `node tests/visible-mass-m6-photo-atlas-contract.mjs`; portable review test: `node tests/visible-mass-m6-atlas-review-browser.mjs`. Keep PR #1309 draft/unmerged, and do not touch the R17 LIVE reader or main-app Mass Explorer owner.

## Second acquisition batch — 18 October 2026

Seven additional licensed photograph records have been added, attached to seven existing canonical object IDs, with no new glossary or Mass-reader content. No image is editorially approved or released.

| Object | Photograph source | Rights | Qualification |
|:--|:--|:--|:--|
| AL13 | [Altar cloth MET 47677.jpg](https://commons.wikimedia.org/wiki/File:Altar_cloth_MET_47677.jpg) | CC0 1.0; Metropolitan Museum of Art (open-access collection photograph; individual photographer not specified) | Actual historical Roman Catholic altar linen textile in a museum collection. An individual lace cloth only: not a photograph of three linen coverings in sit |
| VE02 | [Shoulder cloth (amice), Benedictine convent of Engelberg, Switzerland, c. 1300-1310, white linen fabric, linen and colored silk embroidery - Museum Schnütgen - Cologne, Germany - DSC09888.jpg](https://commons.wikimedia.org/wiki/File:Shoulder_cloth_%28amice%29,_Benedictine_convent_of_Engelberg,_Switzerland,_c._1300-1310,_white_linen_fabric,_linen_and_colored_silk_embroidery_-_Museum_Schnütgen_-_Cologne,_Germany_-_DSC09888.jpg) | CC0 1.0; Daderot | Authentic medieval Western Benedictine amice, photographed in a Catholic-museum context. Its historic decoration and shape should not be presented as a typi |
| VE05 | [Chasuble, stole and maniple MET 27.341a-c front CP4.jpg](https://commons.wikimedia.org/wiki/File:Chasuble,_stole_and_maniple_MET_27.341a-c_front_CP4.jpg) | CC0 1.0; Metropolitan Museum of Art (open-access collection photograph; individual photographer not specified) | Stole appears in a documented three-piece Italian Catholic vestment ensemble with chasuble and maniple. Group photograph; inspect how clearly the stole is i |
| VE06 | [Maniple, with Instruments of the Passion, 1593-1597, silk, gilt silver - Mass vestments of Pope Clement VIII Aldobrandini - Sala degli Indirizzi di Pio IX - Vatican Museums - DSC00675.jpg](https://commons.wikimedia.org/wiki/File:Maniple,_with_Instruments_of_the_Passion,_1593-1597,_silk,_gilt_silver_-_Mass_vestments_of_Pope_Clement_VIII_Aldobrandini_-_Sala_degli_Indirizzi_di_Pio_IX_-_Vatican_Museums_-_DSC00675.jpg) | CC0 1.0; Daderot | An identifiable late-16th-century maniple and stole in a Vatican Museums display. Historic artefact, not proof of precise 1962 vesting or rite. |
| VE07 | [Chasuble, stole and maniple MET 11.641a-c front CP4.jpg](https://commons.wikimedia.org/wiki/File:Chasuble,_stole_and_maniple_MET_11.641a-c_front_CP4.jpg) | CC0 1.0; Metropolitan Museum of Art (open-access collection photograph; individual photographer not specified) | Genuine Italian Roman Catholic chasuble photographed with stole and maniple in a museum. Representative historic form; does not establish that it is the pre |
| VE08 | [Pianeta San Pio X Caorle.jpg](https://commons.wikimedia.org/wiki/File:Pianeta_San_Pio_X_Caorle.jpg) | CC BY-SA 4.0; Copholon | Museum-identified historical Roman-style chasuble attributed to Pope St Pius X. Original single-object photograph. Attribution to this historic garment is t |
| VE09 | [Dalmatic, 19th century, silk, view 1 - Saint Ignatius Church, San Francisco, CA - DSC02641.JPG](https://commons.wikimedia.org/wiki/File:Dalmatic,_19th_century,_silk,_view_1_-_Saint_Ignatius_Church,_San_Francisco,_CA_-_DSC02641.JPG) | CC0 1.0; Daderot | 19th-century silk dalmatic photographed at a Catholic-church exhibition, not worn during Solemn Mass. Confirm object shape and suitability for explaining th |

**Strict status after batch two:** 170 physical objects; 13 categories; 42 registered source/image records corresponding to 39 unique source URLs; 30 objects with a licensed photo candidate or original provisional photo hotspot. 140 still need a qualifying photograph or hotspot, and six of twenty vestment objects now have candidate photographs.

The earlier 147-object no-prior-reference baseline is intentionally retained as a historical metric; it treated historical illustrations as references. The current photographic metric excludes both those illustrations and the unresolved-rights BK02 historical photograph. LN04 and LN05 have been explicitly reflagged as needing photographs.

**Sanctuary-pilot items still needing photographic support:** AL10 gradine, AL17 Epistle side, AL18 Gospel side, LN04 burse, LN05 chalice veil, BK02 Missal stand. AL17/AL18 should be precise orientation labels on an authenticated original altar photograph, not independent images artificially attributed to Brompton.

Next acquisition: actual photographed gradine/candle shelf, 1962-compatible Missal support, burse and chalice-veil close-ups, plus a second vestment batch. Historical museum artefacts may explain what an item is but must never be passed off as a photograph of actual 1962 Mass use. Preserve separate photographer, source, licence, location and scene identity.

## Third acquisition batch — 18 October 2026

Six verified Commons photograph records cover eight previously missing objects: LN04 (burse), LN05 (chalice veil), VE12 (biretta), VE13 (cope), VE17 (crozier) and VE16/VE18/VE19 (mitre, pectoral cross, zucchetto). The latter three IDs share **one** small 550 × 741 Gammarelli shop-display photograph by Marie-Lan Nguyen (public-domain dedication); it is context-only and needs better close-ups. This is one photographed source, not three separate photographs.

| Object IDs | Source owner / original subject | Licence | Status and limitations |
|:--|:--|:--|:--|
| LN04 | Kleon3, Catholic Basilica of Our Lady Maastricht burse and maniple, c. 1850 | CC BY-SA 4.0 | Real historical textiles, museum case, not 1962 in use |
| LN05 | Hiart, 17th-century Spanish chalice veil at Honolulu Museum of Art | CC0 | Actual veil, not draped over a chalice |
| VE12 | Patrickwooldridge, monsignor black biretta with red pom | CC BY-SA 4.0 | Specific clerical rank; not generic priest's black pom |
| VE13 | Daderot, Clement VIII pontifical cope at Vatican Museums | CC0 | Historical artefact, not Benediction-in-use |
| VE17 | EgorovaSvetlana, Venice-region crozier in The Met Cloisters | CC BY-SA 4.0 | Historical crozier, not actual pontifical ceremony |
| VE16/VE18/VE19 | Marie-Lan Nguyen, Gammarelli window of cardinal vestments, Rome | Public-domain author release | One low-resolution contextual photograph, not isolated details |

All source URLs, photographer metadata, roles and licence links appear on the six image records under source_index M6_RESEARCH_20261018_BATCH3. No approvals have been granted.

**Strict photographic candidate coverage:** 38/170 objects, 132 still marked needs_photo; the original photo/source registry now contains 48 records on 45 unique source URLs. Of the 30 pilot subjects, 26 have a photo candidate or source-specific hotspot. Vestments have 12/20 linked photographic candidates. These are reference candidates, not approved final illustrations, and some are historical/low-resolution.

**Pilot still open:** AL10 gradine, AL17 Epistle side, AL18 Gospel side, BK02 suitable Missal stand. AL17/AL18 require source-accurate altar orientation markers, not imaginary photos. BK02's Japanese historical object remains research-only and does not substitute for a typical 1962 Missal support. Remaining vestments: VE01, VE03, VE04, VE10, VE11, VE14, VE15, VE20.

No change to M5 source geometry, G### concepts, VMQ questions, the Mass Explorer, LIVE/Simple/Missal, or production.

## Fourth acquisition batch — 18 October 2026

M6 research-only additions, all included in the same 170-object, 13-zone registry:

| Object | Original source | Licence and attribution | Use restriction |
|:--|:--|:--|:--|
| BK02 — Missal stand or cushion | [1962 Roman Missal at Latin Mass (2022, Virginia)](https://sdcason.com/1962-roman-missal-at-latin-mass-2022-virginia-usa-catholic-stock-photo/) | Shalone Cason / The Free Catholic Gallery. Photo page claims **public domain**, but the [publisher-wide copyright policy](https://sdcason.com/copyright/) says **CC BY 4.0**. Conservatively preserve CC BY 4.0 attribution and rights discrepancy pending publication review. | A genuine 1962 altar Missal on a period-compatible metal support during a contemporary TLM; not at Brompton. Source page and raw photo URL retained separately. |
| VE04 — Cincture | [Italian cincture c.1675–1700, Rijksmuseum BK-1966-54-F](https://commons.wikimedia.org/wiki/File:Cingel_van_koord_met_geborduurde_uiteinden,_met_een_patroon_van_een_hartschild_met_boom_en_dier,_tussen_twee_duiven,_BK-1966-54-F.jpg) | Rijksmuseum, CC0 1.0 | Museum object with exceptional embroidered ends, not a typical 1962 white priest's cincture. |
| VE14 — Humeral veil | [Constance of Austria's humeral veil, Munich Residence](https://commons.wikimedia.org/wiki/File:Poland_Humeral_veil_of_Constance_of_Austria_(detail)_02.jpg) | Artinpl, CC0 1.0 | Historical textile detail, not demonstrated use in 1962 Benediction. |
| VE20 — Pontifical gloves, **partial** | [Ars Regia purple pontifical gloves](https://commons.wikimedia.org/wiki/File:Chirot-viola-2.jpg) | Ars Regia / Pietro Siffi, public-domain release with Wikimedia VRT confirmation | Gloves only. Buskins and sandals remain missing; VE20 stays marked needs_photo. |

**Strict progress after batch four:** 52 registered photograph/source records linked to 49 distinct original source URLs, **41/170 object IDs with a qualifying photograph or source-specific provisional hotspot** and **129/170 needing photographic coverage**. Vestments stand at 14/20 photographically referenced objects; VE20 has only a component lead and is not counted. The thirty-object sanctuary pilot has 27 subjects with reference; AL10, AL17, and AL18 remain open.

### Sanctuary-source handling

- **AL10:** an already registered AndyScott original Brompton high-altar still (`BROMPTON_ALTAR_1`) is retained as a possible **context-only** gradine lead. The exact raised candle shelf is not isolated and its boundaries have not been visually certified, so no new photo/hotspot or coverage credit is asserted.
- **AL17 Epistle side** and **AL18 Gospel side:** nonclickable, source-specific orientation proposals attached to the original Anthony O'Neil Brompton altar still. From the congregation facing the high altar, **Epistle = viewer right**, **Gospel = viewer left**. The direction is corroborated by the [Catholic Encyclopedia's altar-side article](https://www.newadvent.org/cathen/01356e.htm) and by [Catholic TLM explanation](https://hostiamimmaculatam.substack.com/p/the-epistle-and-gospel-sides-of-the). No specific pixel bounding box or actionable hotspot is authorised without camera orientation and mirror-state validation.
- These two directional overlay proposals **do not count as independent photographs**. The one original Brompton still cannot be reused as two new image assets.

### Viewer and provenance implications

The one non-Commons photo in this batch is a direct rights-documented independent Catholic photographer source. It is explicitly allowlisted in the reviewer and M6 contract, without relaxing the original Commons-source guarantee for all other records. The offline review file embeds atlas metadata but external photos load only when connected; offline links/attributions remain inspectable.

No PR merge, liturgical assertion approval, G###/VMQ ownership mutation, or R17 reader change.

## Fifth acquisition batch — 18 October 2026

Research-only acquisition of four original licensed photographs, credited and linked to existing canonical physical-object IDs. This expands the vestment collection without creating new glossary entities or changing any published UI.

| Object | Source photographer and file | Licence and size | Representational limits |
|:--|:--|:--|:--|
| AL10 — Altar gradine | Zairon, [St Sixtus Basilica side altar, Ars-sur-Formans](https://commons.wikimedia.org/wiki/File:Ars-sur-Formans_Basilique_Saint-Sixte_Int%C3%A9rieur_Autel_Lat%C3%A9ral_3.jpg); [French state heritage description PM01002646](https://pop.culture.gouv.fr/notice/palissy/PM01002646) | CC BY-SA 4.0, 3406×4557 | A gradine is independently identified as a part of this photographed Catholic altar ensemble; exact image component boundaries unreviewed, and **not** a Brompton hotspot. |
| VE01 — Cassock | Ébner Vili, [Roman Catholic priest's cassock (Hungary)](https://commons.wikimedia.org/wiki/File:R%C3%B3mai_katolikus_papi_reverenda.JPG) | CC BY-SA 3.0, 3264×2448 | Genuine physical isolated garment; no 1962 Mass usage shown. |
| VE03 — Alb | CarlosVdeHabsburgo, [Seville Cathedral chapter chasuble and alb](https://commons.wikimedia.org/wiki/File:Casulla_y_alba.jpg) | CC BY-SA 4.0, 3240×4320 | Original Spanish Catholic ceremonial garments from Corpus Christi: alb visible with chasuble, not isolated or in use. |
| VE11 — Surplice/cotta | Maximilian775, [Catholic National Eucharistic Congress procession preparation](https://commons.wikimedia.org/wiki/File:NEC_2024_Procession_Preparation.jpg) | CC BY 4.0, 3024×4032 | Authentic Catholic choir-dress context in 2024; not an actual 1962 Mass or a clean isolated surplice specimen. |

**Updated photographic candidate coverage:** 45/170 objects with a licensed photograph or a source-specific provisional hotspot, leaving 125 without a photograph. The register contains **56 source records with 53 unique original source URLs**. Vestments: 17/20 subjects have some photo reference. Remaining vestment gaps: **VE10 tunicle, VE15 complete five-colour set, VE20 pontifical gloves/buskins/sandals**, with VE20 still only partially illustrated by gloves.

**Pilot now 28/30 referenced:** AL10 has a context-photo candidate in the Ars Basilica historic altar, supported by French state heritage identification of the gradine. Its exact image boundaries are not yet annotated, and nothing about it validates the Brompton altar's gradine. AL17 Epistle side and AL18 Gospel side remain nonclickable orientation-notes only and do not count as independent photos. The [Friends of Florence gradine restoration account](https://www.friendsofflorence.org/projects/altar-gradine-oratory-and-tabernacle-chapel-annunziata-ss-annunziata/) remains a separate **rights-unknown discovery lead**, not a photo for publication. No invented scene geometry or speculative clickable coordinates.

**Publication filters:** an original photographed vestment can be culturally and historically authentic while not depicting 1962 liturgical use. VE10 must not be falsely completed by copying a dalmatic photo; VE15 must have a complete comparison of white, red, green, violet and black on proper source photographs, not a single colour or digital illustration. VE20 must include both buskins and sandals rather than silently treating gloves as a complete pontifical set. Authentic photography, rights and separately proven liturgical correctness all remain mandatory.

No merge, no production integration; PR #1309 stays draft.

## Extended acquisition and source-frame validation — 18 October 2026

This extended pass augments the original 170 physical-object crosswalk, 13 zones, M5/P6 original-photo ownership and existing VMQ/G### IDs. It does not replace or mutate the glossary, liturgical Mass reader, Mass Explorer, or any published content. **All photographs remain research candidates awaiting visual, editorial, and rights sign-off.**

### Batch 6 — nine distinct sourced photographs

| Canonical subject | Original credited photograph | Legal permission | Source interpretation |
|:--|:--|:--|:--|
| VE10 tunicle | [Tuscany, historic Florentine `tonacella`](https://commons.wikimedia.org/wiki/File:Manifattura_fiorentina,_tonacella_di_petreto,_in_velluto_tagliato_operato_a_un_compo_e_lampasso,_1450-1500_ca.,_da_s._andrea_a_petreto,_01.jpg), Sailko | CC BY-SA 4.0 | True labeled Italian tunicella, not a substituted dalmatic or evidence of 1962 subdeacon wearing it |
| VE20 pontifical sandals | [Pisa Cathedral museum sandals](https://commons.wikimedia.org/wiki/File:Manifattura_italiana,_sandali_pontificali,_in_pelle_rivestita_di_taffetas,_1900-50_ca.,_dal_duomo_di_pisa.jpg), Sailko | CC BY 3.0 | Authentic sandals component, different provenance from gloves and buskins |
| VE20 pontifical buskins | [Columbus Museum of Catholic Art buskins](https://commons.wikimedia.org/wiki/File:Clerical_Shoes_and_Pontifical_Buskins_at_the_Museum_of_Catholic_Art_and_History_(Columbus,_Ohio).jpg), Maximilian775 | CC BY-SA 4.0 | Authentic buskins component; do not conflate fabric buskins and shoes |
| SP02 bugia | [Bishop Watterson bugia](https://commons.wikimedia.org/wiki/File:Bishop_Watterson_Bugia_1_Museum_of_Catholic_Art_and_History.jpg), Maximilian775 | CC BY 4.0 | Catholic bishop's hand candle, museum specimen rather than in-use ceremonial evidence |
| SE13 Altar of Repose | [Żebbuġ, Gozo, Holy Thursday](https://commons.wikimedia.org/wiki/File:Altar_of_repose_on_Maundy_Thursday_Żebbuġ_Gozo.jpg), Kikku33 | CC BY-SA 4.0 | Actual modern Catholic altar of repose, NOT a certified 1962 Holy Thursday ritual |
| SC01 sacristy | [Church of the Gesuiti, Venice](https://commons.wikimedia.org/wiki/File:Interior_of_Chiesa_dei_Gesuiti_(Venice)_-_sacristy.jpg), Didier Descouens | CC BY-SA 4.0 | Authentic Catholic/Jesuit sacristy room, not a 1962 preparation scene |
| BK10 Rituale Romanum | [Rituale Romanum](https://commons.wikimedia.org/wiki/File:Rituale_Romanum.jpg), Eaden | CC BY-SA 4.0 | Real Latin Roman Ritual book; this photo does NOT establish a 1962 edition |
| BK08 Liber Usualis | [1954 Liber Usualis title](https://commons.wikimedia.org/wiki/File:Liber_Usualis.jpg), Der wahre Jakob | CC BY-SA 3.0 | Actual 1954 title page, not the entire bound volume; low-resolution compared to other sources |
| SA01 baptismal font | [Église Notre-Dame-des-Blancs-Manteaux, Paris](https://commons.wikimedia.org/wiki/File:Baptismal_font_@_%C3%89glise_Notre-Dame_des_Blancs-Manteaux_@_Marais_@_Paris_(31590954501).jpg), Guilhem Vellut | CC BY 2.0 | An actual French Roman Catholic parish font, not a sacrament-in-progress photo |

VE20 is now a **three-component photographic candidate**, drawing on the pre-existing [Ars Regia gloves](https://commons.wikimedia.org/wiki/File:Chirot-viola-2.jpg) and new Pisa sandals / Columbus buskins. Three distinct source owners, different institutions, varying dates: never render them as one physical matching set without explicit labels.

### Batch 7 — initial reference in every zone

- **EN05** [Holy-water stoup in Chiesa del Carmine, Carrara](https://commons.wikimedia.org/wiki/File:Carrara,_chiesa_del_carmine,_interno,_acquasantiera_02.jpg), Sailko, CC BY 3.0.
- **DV06** [Stations of the Cross inside Corpus Christi Catholic Church, Covent Garden](https://commons.wikimedia.org/wiki/File:Covent_Garden,_Corpus_Christi_Catholic_Church,_Stations_of_the_Cross_(2).jpg), AndyScott, CC BY-SA 4.0.

These authentic Catholic objects complete the goal of **at least one independently sourced photographic candidate in all 13 physical-object zones**. A zone with one or more candidates is NOT fully covered or publication-ready.

### Verified Brompton orientation rule — two annotations, no extra photographs

The original [Anthony O'Neil 2019 Brompton high-altar photograph](https://commons.wikimedia.org/wiki/File:The_High_Altar_-_geograph.org.uk_-_6213275.jpg) documents a frontal nave-facing altar view, with raw EXIF recorded as `Normal`; 4797×3219, heading 337° and photographer-position metadata 51.497181, -0.169837. In this **unmirrored original source frame** the Epistle side (AL17) is **viewer's right** and Gospel side (AL18) **viewer's left**, consistent with Roman liturgical side conventions. Both are research-only source-specific orientation annotations—not separate photo assets and not new geometric clickable hotspots. If the scene is cropped, mirrored or rotated in the published app, confirm transforms before publication. Therefore both remain `needs_photo=true` by the strict object-photograph metric, notwithstanding directional research sign-off.

### Batch 8 — all five traditional vestment colours sourced separately

Five original photographic candidates explicitly associated with **one** canonical composite subject VE15, with `liturgical_color` metadata and separate rights:

| Colour | Original source | Photographer | Licence | Visual qualification |
|:--|:--|:--|:--|:--|
| White | [White/red chasuble in Catholic Église Saint-Venant-de-Paquette, Québec](https://commons.wikimedia.org/wiki/File:%C3%89glise_de_Saint-Venant-de-Paquette_-_chasuble_-_3.jpg) | Cantons-de-l'Est | CC BY-SA 4.0 | Historic Roman Catholic heritage church, but vestment includes red features and photo needs aesthetic approval |
| Red | [Cathédrale Sainte-Marie de Lombez, red chasuble](https://commons.wikimedia.org/wiki/File:Chasuble_rouge_-_Cath%C3%A9drale_de_Lombez.jpg) | Zzabeth | CC BY-SA 3.0 | Cathedral exhibit, no Mass-in-use claim |
| Green | [Cathédrale Sainte-Marie de Lombez, green chasuble](https://commons.wikimedia.org/wiki/File:Chasuble_vert_-_Cath%C3%A9drale_de_Lombez.jpg) | Zzabeth | CC BY-SA 3.0 | Same source venue as red, own independently photographed image |
| Violet | [Original violet chasuble photograph](https://commons.wikimedia.org/wiki/File:Chasuble.JPG) | Eugenio Hansen, OFS | CC BY-SA 3.0 | Color and creator verified; specific Catholic venue and 1962 use not established |
| Black | [Cathédrale Sainte-Marie de Lombez, black chasuble](https://commons.wikimedia.org/wiki/File:Chasuble_noire_-_Cath%C3%A9drale_de_Lombez.jpg) | Zzabeth | CC BY-SA 3.0 | Cathedral museum reference, not a photographed Requiem |

**Avoid a false single-set photograph:** these five images come from different owners, eras and venues; preserve image-by-image provenance and comparison labels. The five-colour reference requirement is fulfilled at candidate level only. Colorimetric consistency, traditional Roman style suitability and publication rights remain unapproved.

### Cumulative snapshot after batch 8

- **170 canonical physical-object subjects** unchanged; **13 zones**, all with at least one photographed reference.
- **72 separately registered source records** representing **69 unique image/source URLs**, including the twelve original M5 church photographs.
- **56/170 physical subjects** with some licensed photographic candidate or provisional source-owned hotspot; **114/170** without either by the current photo metric.
- **20/20 vestment subject IDs** have at least one photographed source or, for the two composite entries, all required separate photo components. The 20/20 is *coverage of research candidates*, not final appropriateness.
- **28/30 sanctuary pilot** have reference photo/hotspot; AL17 and AL18 are directional overlay research only and remain missing under the intentionally strict photograph metric.
- No accepted/published images, no merge, no Mass reader modifications.

**Next curation gate:** prioritize inspection/rating and photographic-quality/1962 suitability of the new sources before aggressive acquisition of the other 114 gap objects, especially because some candidates have unresolved display-resolution, tradition, editor, or venue caveats. Disallow silently treating 1954 book titles, museum pieces, or modern celebrations as documentary 1962 ceremony photography.

## Ninth acquisition batch and next release gates — 18 October 2026

Three research-only original Roman Catholic source photographs add *four* canonical object references; object count does not equal distinct photo count.

- **EQ07 thurible and EQ08 incense boat:** [1750–75 silver thurible and incense boat, Museo Diocesano Castiglion Fiorentino](https://commons.wikimedia.org/wiki/File:Bottega_toscana,_turibolo_e_navicella_in_argento,_1750-75_ca.,_da_s._agostino_a_castiglion_f.no.jpg), by Sailko, CC BY 3.0, 3174×3022. **One image, linked to both existing IDs;** not claimed as a photo taken during Mass or as items at Brompton.
- **SA05 confessional:** [Chiesa del Gesù (Casa Professa), Palermo](https://commons.wikimedia.org/wiki/File:ChiesaGesu_Confessional.JPG), by Erik den yngre, CC BY-SA 3.0, 2560×2208. Authentic Roman Catholic Jesuit church confessional in situ, no penitents or liturgical event.
- **SE01 Paschal candle:** [National Shrine Basilica of Aparecida, Brazil](https://commons.wikimedia.org/wiki/File:Paschal_candle_-_Main_altar_-_Basilica_of_Aparecida_-_Aparecida_2014.jpg), by José Luiz Bernardes Ribeiro, CC BY-SA 3.0, 1676×2556. Actual Roman Catholic modern Paschal candle, **not** evidence of the 1962 Easter Vigil nor a suitable source for reconstructing a traditional high altar.

**Cumulative after batch nine:** **75 registered records on 72 distinct original URLs**, 170 subjects / 13 zones, **60/170 with some photographic reference or source-owned hotspot**, 110 still requiring a photo, and 20/20 vestment subjects with provisional photographic coverage. The 30-object pilot still has 28 photo references plus two source-verified directional annotations that deliberately do **not** count as extra photographs. Zero photographic sources are editorially approved or published.

### Acquisition-versus-approval distinction

Further broad acquisitions should not hide the remaining quality debt. Required editorial decisions for each candidate: subject visibility (0–5), object-versus-context-versus-use role, Catholic institutional authenticity, exact photographer and file page, licence and derivative obligations, historic version versus authentic 1962 practice, clear original image dimensions, and placement (primary / supplementary / historical / elsewhere / reject). A record can support a canonical object while remaining inappropriate for the main instructional gallery. A 20/20 vestment **candidate** tally does not mean 20 adequate final selected photographs.

PR #1309 remains a draft and must not publish or merge without physical-device review, offline gallery acceptance, and all artwork-source/licensing checks. Mass Explorer, G###, VMQ and the LIVE/Simple/Missal reader remain unchanged.

## Tenth acquisition batch — photographic M5 reuse and first nave coverage

Research-only continuation after the 60/170 baseline. Seven **new** distinct Commons photograph records, plus two **existing** original M5 photo assets now linked to the correct canonical object IDs without creating source copies, cover **10 additional physical-object IDs**. This is not publication approval, hotspot certification or a change to any G###/VMQ/Mass Explorer ownership.

| Object IDs | New original source / reused original M5 asset | Creator / rights | Scope and caution |
|:--|:--|:--|:--|
| EN06, EN07, EN09 | [Brompton Oratory Nave 2, London, UK](https://commons.wikimedia.org/wiki/File:Brompton_Oratory_Nave_2,_London,_UK_-_Diliff.jpg) | David Iliff, CC BY-SA 3.0; 8043×5527 | **One** original featured photo: physical nave and pews are established, aisle in context, no additional photo or per-object hotspot geometry is invented. |
| EN06 alternative | [Newman University Church, nave south 1](https://commons.wikimedia.org/wiki/File:Dublin_Newman_University_Church_Interior_Nave_South_1.jpg) | Zairon, CC BY 4.0; 4579×3429 | Authentic Irish Roman Catholic context, **different venue** to Brompton, never presented as adjacent walking position. |
| EN01 | [London Oratory façade / Brompton Road](https://commons.wikimedia.org/wiki/File:London_Oratory_facade,_Brompton_Road_-_geograph.org.uk_-_6574411.jpg) | Robin Sones, CC BY-SA 2.0; 640×480 | Low-resolution exterior context only; actual church entrance portal boundaries not suitable for zoom hotspot. |
| EN10 | [Historic processional cross, Museu Episcopal de Vic](https://commons.wikimedia.org/wiki/File:Processional_Cross_(MEV-Museu_d%27Art_Medieval)-WUS-00683.jpg) | Wuselig / Rainer Halama, Commons CC0 1.0; 3287×4982 | Museum artefact circa 1600, NOT procession photo nor standard 1962 exemplar. Image EXIF mentions prior CC BY-SA 4.0 despite page CC0; retain as rights-review point before release. |
| BK07 | [Open Graduale Romanum, Évron Community of Saint Martin](https://commons.wikimedia.org/wiki/File:Open_graduale_romanum.jpg) | Feldbrahi, CC0; 1086×724 | Real photographed chanting book in 2024; Commons structured data also depicts Graduale Triplex. Not certified edition for 1962. |
| DV07 | [Votive candles inside Cathedral Basilica of Saint Louis](https://commons.wikimedia.org/wiki/File:Votive_candles.jpg) | Tiger Craven, CC BY-SA 4.0; 5120×3840 | Catholic devotional context: illuminated candles, physical candle stand not yet individually isolated. |
| SE10 | [Corpus Christi canopy, Fribourg](https://commons.wikimedia.org/wiki/File:Corpus_Christi_in_Fribourg_CH_FR_10_Confr%C3%A9rie_Saint-Sacrement_01.jpg) | Martin Thurnherr, CC BY-SA 4.0; 4752×3168 | Authentic Catholic canopy in **2023** Corpus Christi procession. NOT a 1962-procession-rubric or photo of traditional TLM. |
| DV01 reused | [Brompton Lady Altar](https://commons.wikimedia.org/wiki/File:The_Oratory_of_S_Philip_Neri%2C_The_Lady_Altar.jpg) | AndyScott, CC BY-SA 4.0 | Reuse original **BROMPTON_LADY_ALTAR** M5 source record; 0 new image files. |
| BK12 reused | [Newman University Church pulpit](https://commons.wikimedia.org/wiki/File:Dublin_Newman_University_Church_Interior_Nave_Pulpit.jpg) | Zairon, CC BY 4.0 | Reuse original **NEWMAN_PULPIT** M5 source record; **not** an assertion of 1962 preaching from that pulpit. |

Cumulative: **170 canonical physical objects, 13 families, 82 registered source records corresponding to 79 distinct source URLs**. **70/170** have some original photo candidate or source-bound provisional hotspot; **100/170** still require qualifying photo candidates. Counted source photographs have not been approved for production. Original 30-object pilot remains 28/30 by strict photo count, because AL17/AL18 are source-verified orientation annotations and **not** independent photos.

Review interface change: construct an inverse link index from **canonical object.candidate_assets** so one source photo can be found through multiple object searches and filters (notably BROMPTON_LADY_ALTAR => DV01, NEWMAN_PULPIT => BK12 and the new Brompton nave image => EN06/EN07/EN09). This does not mutate image identity, provenance, M5 owners or scene geometry. Keep creator/licence per original source and repeat neither attribution nor photograph as a new asset.

Remaining near-term acquisition targets: seasonal arrangements (Candlemas, palms, ashes, catafalque, funeral pall, Tenebrae), extra devotional furnishing details and liturgical books. For date-specific images, distinguish a modern celebration from 1962 ceremonial evidence. Prioritize visual review of the existing **82 records** before announcing 70 objects publication-ready.

## Eleventh acquisition batch — Catholic Holy Week, devotion and a 1961 Pontifical

Nine additional **independent and directly verified Commons source photographs**, linked to nine previously missing canonical M6 objects. The source page, image-specific author and reusable licence are preserved for each; none is approved for publication, no new object ID is invented, and all previously reviewed M5 photo records and R17 Mass reader owners remain untouched.

| Object ID | Independently licensed original photo | Credit / licence | Historical and liturgical limitations |
|:--|:--|:--|:--|
| BK11 | [1961 Pontificale Romanum](https://commons.wikimedia.org/wiki/File:1961_Pontificale_Romanum.jpg) | Darth Stabro, CC BY-SA 4.0, 3024×4032 | Actual pre-1962 Roman Pontifical title page in Archbishop Ireland Memorial Library (St Paul Seminary); not a photo of the entire volume or pontifical rite |
| BK09 | [1748 Antiphonarium Romanum, St Francis church, Évora](https://commons.wikimedia.org/wiki/File:Antiphonarium_Romanum_1748.jpg) | Georges Jansoone (edited by Micheletb), CC BY-SA 3.0, 600×590 | Authentic photographed Roman antiphonary, low resolution and much older than 1962; **historical supplementary** |
| SE02 | [Candlemas candle blessing, St Pancras Catholic Church, Ipswich](https://commons.wikimedia.org/wiki/File:Blessings_of_the_Candles_at_Candlemas.jpg) | JASpencer, CC BY-SA 3.0, 2048×1536 | Catholic church identity confirmed by its [official parish website](https://www.stpancraschurch.org.uk/). 2014 ceremony and candle visibility to confirm, NOT a certified 1962 Candlemas |
| SE03 | [Confraternity Palm Sunday procession, Rabat, Malta](https://commons.wikimedia.org/wiki/File:Palm_Sunday_Procession.jpg) | Godwin Borg, CC BY-SA 4.0, 3456×4839 | Original Catholic procession (2025), palm fronds must be visibly recognizable before image can become *primary* photographed palms |
| SE05 | [Veiled cross and icons at St Pancras, Ipswich](https://commons.wikimedia.org/wiki/File:St_Pancras_Ipswich_veiled_icons_and_cross.jpg) | A1lbs, CC BY-SA 4.0, 3024×4032 | Actual purple-veiled religious objects in Catholic parish, 5 April 2025, not photographic evidence of 1962 exact Passiontide rubric |
| SE06 | [Holy Cross veneration by Catholics in the Philippines](https://commons.wikimedia.org/wiki/File:Holy_Cross_on_Good_Friday.jpg) | Victor D. Kintanar, CC BY-SA 4.0, 3872×2592 | **Local Good Friday devotion after Stations**, NOT the 1962 Solemn Liturgical Action; do not conflate devotional use with the liturgical rite |
| SE14 | [Mainz Cathedral Tenebrae hearse](https://commons.wikimedia.org/wiki/File:Domtriangel1.jpg) | Bhuck, CC BY-SA 3.0, 1864×3710 | Original photograph of authentic fifteen-light triangular hearse in Catholic Mainz Cathedral, furnishing only, no in-ceremony claim |
| DV08 | [Cathedral of Salzburg reliquary](https://commons.wikimedia.org/wiki/File:Salzburg_Dom_St._Virgil_%26_Rupert_Innen_Reliquiar_1.jpg) | Zairon, CC BY-SA 3.0, 2048×1536 | Physical relic vessel in Catholic cathedral; no conclusion about authenticity of contained relics or liturgical use |
| DV05 | [Sacred Heart statue, Sacred Heart Catholic Church, Columbus](https://commons.wikimedia.org/wiki/File:Sacred_Heart_Catholic_Church_(Columbus,_Ohio)_-_Sacred_Heart_statue.jpg) | Nheyob, CC BY-SA 3.0, 1935×3225 | Sacred Heart devotional **statue**, not 2-D artwork, altar equipment, or in-use TLM record |

**After batch eleven:** **91 source records** from **88 distinct URLs**, **79/170 physical objects** with photographed candidate or a source-specific provisional hotspot, **91/170 still without qualifying photo**, and all 13 zones retaining at least one source-backed reference. The traditional vestment requirement remains 20/20 at *candidate-only* level. The original sanctuary pilot still has 28/30 photo references, because Epistle/Gospel directional annotations are not independent photos. Number of **publication-approved images remains zero**.

**Editorial/source gate before release:** low resolution or historical museum subject ≠ modern 1962-appropriate primary photograph; a modern Candlemas or Good Friday celebration ≠ traditional 1962 ceremony; identify privacy/consent needs in photographs containing identifiable worshippers. A canonical object may link several photos by distinct usage roles; preserve all photographer credits, licences, source venues, chronology, original filenames and image identities.

**Reject false-positive examples found in discovery:** 2017 Candlemas photo at Calvary **Episcopal** Church, Rochester, and the veiled Good Friday altar at Houston Memorial **United Methodist** Church do not belong in a Roman Catholic photographic documentary register. They have not been imported.

## Twelfth acquisition batch — Catholic devotional subjects, choir and Requiem

Ten entirely new original Commons source photographs are linked to ten previously-unreferenced canonical object IDs. No original M5 photo is duplicated, no hotspot or image of ceremony from an unrelated place is fabricated, and all records remain `SOURCE_RIGHTS_IDENTIFIED_AWAITING_EDITORIAL_APPROVAL`.

| Object | Original documented photographic source | Rights and explanatory qualification |
|:--|:--|:--|
| DV02 Blessed Virgin statue | [Basilica of Saint Joseph Proto-Cathedral, Bardstown](https://commons.wikimedia.org/wiki/File:Basilica_of_Saint_Joseph_Proto-Cathedral_(Bardstown,_Kentucky)_-_Blessed_Virgin_Mary_statue.jpg) | Nheyob, CC BY-SA 4.0, 2888×3613; genuine Catholic statue, not a ceremony |
| DV03 St Joseph statue | [St Mary's Pro-Cathedral, Dublin](https://commons.wikimedia.org/wiki/File:Statue_of_Saint_Joseph.jpg) | ManuRoquette, CC BY-SA 4.0, 2976×3968; authentic Irish Catholic church |
| DV04 another saint statue | [St Peter statue at Saint Mary's Catholic Church, Delaware, Ohio](https://commons.wikimedia.org/wiki/File:Saint_Mary_Catholic_Church_(Delaware,_Ohio)_-_side_altar,_Saint_Peter_statue.jpg) | Nheyob, CC BY-SA 4.0, 2397×3598; Catholic physical example, not Brompton |
| DV09 stained glass | [Saint Margaret Mary Chapel in Basilique du Sacré-Cœur, Paris](https://commons.wikimedia.org/wiki/File:Basilique_du_Sacr%C3%A9-C%C5%93ur_chapelle_Sainte_Marguerite_Marie_stained-glass_windows_2026-01-03.jpg) | Renée Kools, CC BY 4.0, 3000×3000; quality-assessed genuine devotional stained glass |
| DV12 devotional shrine | [Our Lady's shrine in Saint Joseph's Catholic Church, Central City](https://commons.wikimedia.org/wiki/File:Saint_Joseph%27s_Catholic_Church_(Central_City,_Kentucky)_-_Blessed_Virgin_Mary_shrine.jpg) | Nheyob, CC BY-SA 3.0, 3437×2755; wider shrine context |
| BK06 Epistolary | [1868 Notre-Dame de Paris treasury epistolary](https://commons.wikimedia.org/wiki/File:%C3%89pistolaire_du_tr%C3%A9sor_de_la_cath%C3%A9drale_Notre-Dame_de_Paris.jpg) | Tangopaso, public-domain photo dedication, 2112×2816; historical ornamental cover, not the typical 1962 solemn Mass Epistolary |
| BK13 pipe organ | [Pipe organ at Notre-Dame d'Amiens](https://commons.wikimedia.org/wiki/File:Amiens,_cathedral_Notre-Dame,_the_pipe_organ.JPG) | Dguendel, CC BY 4.0, 2632×4115; authentic Catholic church instrument, not sung liturgy photo |
| BK14 choir stalls | [Notre-Dame de Paris stalls and choir organ](https://commons.wikimedia.org/wiki/File:Cathedrale_Notre-Dame_de_Paris_stalles_orgue_choeur.jpg) | Myrabella, CC BY-SA 3.0, 3973×2393; historical pre-2019 Catholic choir furniture, not a 1962 Mass scene |
| SE11 processional banner | [Carmelite confraternity banner in San Sebastián Basilica, Manila](https://commons.wikimedia.org/wiki/File:2025-01-25_-_Processional_banner_for_the_Nuestra_Se%C3%B1ora_del_Carmen_de_San_Sebasti%C3%A1n_01.jpg) | EyeTrick, CC BY-SA 4.0, 3341×4454; Catholic exhibition object, not actual 1962 procession |
| SE12 Requiem vestments | [Requiem Mass, Strasbourg Cathedral crypt, 2013](https://commons.wikimedia.org/wiki/File:Strasbourg_crypte_de_la_cath%C3%A9drale_Notre_Dame_messe_de_Requiem_2013_06.jpg) | Claude TRUONG-NGOC, CC BY-SA 3.0, 3156×5016; categorised Tridentine Requiem with black vestments, but original garment visibility and precise form require further visual approval |

**Cumulative research coverage:** 170 canonical object IDs, 13 zones, **101 source records across 98 unique original source URLs**, **89/170** with photographic candidates or source-specific provisional hotspots, **81/170** still missing a qualifying photo. Remaining candidate gaps: DV 2, BK 4, SE 4; other zones remain incomplete. No image has been editorially approved, no source has been published and no change was made to the LIVE/Simple/Missal Mass reader.

Next investigative areas: *seasonal special-day funeral objects* (catafalque, coffin/bier, pall, Ash Wednesday ashes), *missing Roman books* (hand Missal, Book of Gospels, ribbon/tab close-ups, choir lectern), and *remaining devotional objects* (ex-voto, rosary at shrine). Selection must not substitute an Anglican/Protestant object for a Catholic one, or modern postconciliar activities as 1962 documentary proof.

Viewer/browser-test counters have been updated for 101 records; source provenance, copyright terms, photographic coverage and object links remain separate assertions, and browser-acceptance status should be confirmed from the dedicated M6 workflow before release.

## Thirteenth acquisition — Lourdes ex-voto, historic funeral and shrine objects

Seven source-owned original photographs were linked to seven canonical IDs; **six objects gain some source-qualified photograph**, while the Ash Wednesday record is **partial only** and intentionally excluded from completed photograph coverage. Distinguish historically credible traditional Catholic source imagery from merely photographed modern context.

| Object | Credited source | Rights | Why the photograph is relevant, and why it is not approved |
|:--|:--|:--|:--|
| DV10 ex-voto plaque | [Thanksgiving plaque in Basilica of the Immaculate Conception, Lourdes](https://commons.wikimedia.org/wiki/File:Ex-voto_railway_accident_Lourdes.jpg), Tangopaso | Public domain, original author dedication, 4416×3312 | A Catholic Lourdes gratitude plaque for passengers surviving a railway accident. No miracle validation or 1962 liturgical assertion. |
| DV11 rosary displayed at shrine | [Virgin Mary statue covered in deposited rosaries, Holy Hill National Shrine, Wisconsin](https://commons.wikimedia.org/wiki/File:A_statue_of_the_Virgin_Mary,_covered_in_rosaries,_at_Holy_Hill.jpg), Cmarsch | CC0 1.0, 3072×4080 | Real physical rosaries publicly displayed at a Roman Catholic national Marian shrine; photo 2024. |
| SE07 Requiem catafalque | [Funeral of Duchess of Chartres, Royal Chapel St-Louis, Dreux, 7 Nov 1925](https://commons.wikimedia.org/wiki/File:Dreux,_7-11-25,_obs%C3%A8ques_de_la_duchesse_de_Chartres_(le_catafalque_%C3%A0_l%27int%C3%A9rieur_de_la_chapelle_royale)_-_btv1b53155647t.jpg), Agence Rol / BnF Gallica btv1b53155647t | Public domain France/US (1925 anonymous/collective press work); 8638×6151; retain agency/BnF attribution and French moral rights | **Strong actual pre-1962 Catholic catafalque photograph**. Historic French aristocratic funeral, not a guarantee of universally typical 1962 rite or all catafalque details. |
| SE08 funeral bier / coffin | [Coffin display arranged for Roman Catholic funeral](https://commons.wikimedia.org/wiki/File:CoffinDisplay.jpg), Willjay | CC BY 3.0, 1024×768 | Physical coffin in staged Catholic funerary context, **not** a certified view of its supporting bier, actual funeral ceremony, black pall or 1962 Mass. |
| BK05 Book of Gospels | [Saint Francis of Assisi's evangeliary with other relics, Chiesa di San Francesco, Cortona](https://commons.wikimedia.org/wiki/File:Tunica,_cuscino_cucito_da_jacopa_settesoli_ed_evangeliario_di_san_francesco_d%27assisi,_donati_da_frate_elia.jpg), Sailko | CC BY-SA 4.0, 5003×1794 | Authentic Roman Catholic historical evangeliary, displayed with multiple relics. No claim that the object resembles the typical 1962 deacon's Gospel book. |
| BK15 choir lectern | [Medieval brass eagle lectern, Aachen Cathedral choir](https://commons.wikimedia.org/wiki/File:Adlerpult_mit_Fledermaus.jpg), ACBahn | CC BY-SA 4.0, 4160×3120 | Catholic choir furnishing, older and more ornate than a compact portable chant lectern; 19th-century bat support belongs to a historic repair. |
| SE04 ashes and ash vessel | [Ash portions dispensed in plastic take-home containers, St Augustine Parish, Baliuag, Philippines](https://commons.wikimedia.org/wiki/File:Ashes_(Ash_Wednesday_2022_during_COVID-19_pandemic_in_the_Philippines)_03.jpg), FBenjr123 | CC BY-SA 4.0, 5184×3888 | **PARTIAL ONLY**: COVID-era home containers are neither proof of a metal altar ash vessel nor appropriate illustration of 1962 Ash Wednesday preparation. SE04 remains `needs_photo=true` and cannot count toward qualified coverage. |

The distinction between **SE07 catafalque** (empty symbolic cenotaph) and **SE08 coffin/bier** (actual body/coffin) is canonically consequential; the original [Catholic Encyclopedia on catafalque](https://www.newadvent.org/cathen/03427a.htm) confirms that separation. Do not link the Dreux source to both subject IDs simply because it is funeral-related. Likewise, do not label any visible piece of funeral drapery an actual Roman funeral pall (SE09) without inspection and source evidence.

### Post-batch-13 totals and next target

**170 physical-object IDs**, 13 zones, **108 registered source/photo records across 105 unique original source URLs**, **95/170** source-qualified or original-scene provisional object references; **75/170** still without qualification. These figures are *candidate research coverage*, not approvals or published images. The earlier 20/20 vestments and 28/30 sanctuary pilot remain unchanged.

Only **four of this specifically scoped ten-object shortlist** remain without adequate source photography:

- BK03 Mass Missal ribbons/tabs: require clear photographic detail of the liturgical Missal with ribbons, and do not substitute modern commercial product imagery with ambiguous reproduction rights.
- BK04 hand Missal: require original photographer's image of real Catholic faithful hand-Missal, edition provenance if it is claimed to be 1962, and rights sufficient for in-app use.
- SE04 ash vessel and ashes: partial lead exists, but 1962 ash bowl/tray not yet documented.
- SE09 funeral pall: require physical black Catholic pall clearly draped over a coffin/bier, and a rights-clear source, not a generic cloth or an Orthodox/Anglican funeral.

No image was given editor approval; branch PR #1309 remains draft, unmerged and separate from app production. The M5 originals and all G###/VMQ/R17 ownership remain unchanged.

## Fourteenth acquisition — a real 1962 Missal, historical hand Missal and Catholic funeral pall

This pass investigated the remaining BK03, BK04, SE04 and SE09 gaps. **Four new distinct original photographs** were acquired or recorded as partial research leads, and **one existing 1962 Missal photograph was reused** without a duplicate asset. Three canonical objects gain a qualifying photographic reference; **SE04 remains missing** under the intentionally strict photo metric. No new canonical ID, M5 venue photo copy or publish approval was created.

| Object | Original photographic source | Rights | Specific limitation |
|:--|:--|:--|:--|
| BK03 — Missal ribbons and tabs | [1962 Missale Romanum Canon-page photograph](https://commons.wikimedia.org/wiki/File:Missale_romanum1962.JPG), existing `EXISTING-BK01`, MK777 | CC BY-SA 4.0; unchanged source asset | Source page visibly contains page-edge tabs and ribbons; **one shared original photo** supporting both BK01 and BK03. Individual ribbon/tab readability and exact function require visual publication review. |
| BK04 — hand Missal | [1905 *Nouveau Paroissien Romain*](https://commons.wikimedia.org/wiki/File:Nouveau_Paroissien_Romain_(1905).jpg), Perky | CC BY-SA 3.0, 1036×830 | Real Latin/French Catholic lay prayerbook, but **1905 rather than 1962** and relatively low image resolution. Historical supplementary candidate, not a representative 1962 hand-Missal hero. |
| SE09 — funeral pall | [Aachen Cathedral Treasury black velvet pall, view 1](https://commons.wikimedia.org/wiki/File:Bahrtuch_%27pall%27_eines_fran%C3%B6sischen_K%C3%B6nigs,_Domschatzkammer_Aachen,_2022_(1).jpg) and [view 2](https://commons.wikimedia.org/wiki/File:Bahrtuch_%27pall%27_eines_fran%C3%B6sischen_K%C3%B6nigs,_Domschatzkammer_Aachen,_2022_(2).jpg), Kürschner | Both CC0 1.0; 3994×2470 and 5472×3648 | **Two distinct source photographs, one historic object**: black velvet/silver-cross royal funeral pall, probably France c.1774, preserved by a Catholic cathedral treasury. Not an ordinary 1962 coffin pall nor shown draped over a coffin in use. |
| SE04 — ashes and liturgical vessel | [St Augustine Catholic Parish, Baliuag, Ash Wednesday 2022](https://commons.wikimedia.org/wiki/File:Ash_Wednesday_2022_blessing_and_distribution_of_ashes_in_Saint_Augustine_Parish_Church_of_Baliuag_10.jpg), FBenjr123 | CC BY-SA 4.0, 5184×3888 | Ash imposition scene and nearby metal dish, but dish contents and precise ash-vessel identity **not sufficiently demonstrable**. Together with prior COVID-era take-home containers, this is *partial only*; `SE04.needs_photo=true` remains mandatory. |

**After batch 14:** **170 physical object IDs**, 13 categories, **112 registered source records on 109 distinct source URLs**, **98/170** with photo research candidates or source-specific original-photo provisional hotspots, **72** still needing photographs. All 20 vestment IDs remain preliminarily referenced; the sanctuary pilot remains 28/30 under strict independent-photo counting because AL17/AL18 are direction-specific annotation research.

**Remaining gap from this focused shortlist:** SE04, a rights-clear original photo in an authentic Roman Catholic Ash Wednesday setting showing *ashes visibly inside a traditional liturgical bowl, dish or vessel*. Do not close it using a picture of an unidentified empty plate, plastic take-home containers, an illustration, or a photograph with uncertain Catholic/source licensing. Original 1962 ceremonial suitability is a separate release criterion.

**Release gates:** no source photograph has been approved, no mass reader or Mass Explorer canonical data has been replaced, no original M5 photographic ownership has changed, and draft PR #1309 remains unmerged. The offline review interface now explains reused source assets and explicitly labels unfulfilled ash-vessel components. The regression-test assertions have been updated; a dedicated M6 browser/CI run must be verified before acceptance, not inferred from source-level consistency checks.
