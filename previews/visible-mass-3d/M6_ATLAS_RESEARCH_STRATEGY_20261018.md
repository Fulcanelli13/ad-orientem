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
