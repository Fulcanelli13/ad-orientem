# P71 — Commons batch 0 editorial preflight (research only)

Date: 2026-10-29. Priority scores rank possible review work, **not** licence or image approvals; exclusions and rights/historical holds sort below ordinary review candidates. Parent input: [P70 PR #1924](https://github.com/Fulcanelli13/ad-orientem/pull/1924), `data/geography/research/p70-commons-batch0-consolidated-review.jsonl` on branch `research/p70-commons-discovery-batch0-20261029`.

## Reconciliation

- **502 candidate-to-entity assignments**, **501 distinct Commons SHA-1 values**, **135 registry entity IDs** (**109 Place**, **26 relic**). A prior conversational report of 442 is superseded by the inspected consolidated file on the parent PR branch.
- 430 Place assignments, 72 relic assignments. These are search hits, not verified photographs of their assigned subjects.
- Claimed licences: 49 CC0, 26 public domain, one “no restrictions”, 57 CC BY, 369 CC BY-SA. All licence claims still require source-page validation and use-condition review; CC0/PD labels are not conclusive rights clearance.
- Minimum reported image dimension below 1,200 px: **51**. Resolution is metadata only, not image quality, clarity, framing or absence of visible frames.
- **No original image bytes acquired; no hashes verified; no visual/frame review completed; zero assets cleared or published**.

## Editorial triage lanes

- PLACE_EXACT_IDENTITY_MANUAL_REVIEW: **411**
- RELIC_EXACT_IDENTITY_MANUAL_REVIEW: **71**
- RIGHTS_METADATA_HOLD: **9**
- EXCLUDE_WRONG_LOCATION: **9**
- HISTORICAL_ARTWORK_GALLERY_ONLY: **1**
- RIGHTS_AND_HISTORICAL_HOLD: **1**

This is a **metadata/title/source-description preflight**, not completion of the visual review. `EXCLUDE_WRONG_LOCATION` blocks candidate-to-entity association, not the source file's possible reuse for a different correctly identified Place. All other lanes are holds/manual review, never automatic approvals. The companion JSONL preserves each original Commons SHA-1, entity ID, rights claim, image dimensions and flags.

## Nine confirmed or unambiguous wrong-place assignments

- `place:AG:holy-family-cathedral-st-johns` ← [File:Cathedral of St. John the Baptist, Savannah, GA, US (15).jpg](https://commons.wikimedia.org/wiki/File:Cathedral_of_St._John_the_Baptist,_Savannah,_GA,_US_(15).jpg) — Saint John the Baptist cathedral in Savannah, Georgia, not Holy Family Cathedral in Antigua.
- `place:AR:catedral-basilica-nuestra-senora-rosario` ← [File:Catedral Basílica Nuestra Señora del Rosario de Manizales interior.JPG](https://commons.wikimedia.org/wiki/File:Catedral_Bas%C3%ADlica_Nuestra_Se%C3%B1ora_del_Rosario_de_Manizales_interior.JPG) — Manizales cathedral is in Colombia, not Argentina.
- `place:AR:catedral-basilica-nuestra-senora-rosario` ← [File:Catedral Basílica Nuestra Señora del Rosario de Manizales puerta.JPG](https://commons.wikimedia.org/wiki/File:Catedral_Bas%C3%ADlica_Nuestra_Se%C3%B1ora_del_Rosario_de_Manizales_puerta.JPG) — Manizales cathedral is in Colombia, not Argentina.
- `place:AR:catedral-basilica-nuestra-senora-rosario` ← [File:Catedral Basílica Nuestra Señora del Rosario de Manizales virgen.JPG](https://commons.wikimedia.org/wiki/File:Catedral_Bas%C3%ADlica_Nuestra_Se%C3%B1ora_del_Rosario_de_Manizales_virgen.JPG) — Manizales cathedral is in Colombia, not Argentina.
- `place:AR:catedral-basilica-nuestra-senora-rosario` ← [File:Catedral Basílica Nuestra Señora del Rosario de Manizales fachada.JPG](https://commons.wikimedia.org/wiki/File:Catedral_Bas%C3%ADlica_Nuestra_Se%C3%B1ora_del_Rosario_de_Manizales_fachada.JPG) — Manizales cathedral is in Colombia, not Argentina.
- `place:AU:p48-sg-0743-155809136` ← [File:Red telephone box, St Paul's Cathedral, London, England, GB, IMG 5182 edit.jpg](https://commons.wikimedia.org/wiki/File:Red_telephone_box,_St_Paul%27s_Cathedral,_London,_England,_GB,_IMG_5182_edit.jpg) — St Paul's Cathedral in London, not Australian target.
- `place:CL:sanctuary-of-our-lady-of-la-tirana-chile` ← [File:Virgen de la Candelaria Oruro Bolivia 01.JPG](https://commons.wikimedia.org/wiki/File:Virgen_de_la_Candelaria_Oruro_Bolivia_01.JPG) — Oruro, Bolivia fresco, not the La Tirana shrine in Chile.
- `place:CO:chiquinquira-basilica` ← [File:Basílica de la Chinita.jpg](https://commons.wikimedia.org/wiki/File:Bas%C3%ADlica_de_la_Chinita.jpg) — La Chinita Basilica is in Maracaibo, Venezuela, not Chiquinquirá, Colombia.
- `place:MU:saint-louis-cathedral-port-louis` ← [File:Pointe de l'Isle Notre-Dame, aujourd'hui Saint-Louis - dessin - Gabriel Perelle - btv1b10303334p.jpg](https://commons.wikimedia.org/wiki/File:Pointe_de_l%27Isle_Notre-Dame,_aujourd%27hui_Saint-Louis_-_dessin_-_Gabriel_Perelle_-_btv1b10303334p.jpg) — 17th-century Île Saint-Louis in Paris, not Saint Louis Cathedral in Port Louis, Mauritius.

The false matches include one image from Georgia/USA assigned to Antigua, four Manizales (Colombia) images assigned to an Argentinian cathedral, one London image assigned to Australia, one Bolivian fresco assigned to a Chilean shrine, one Maracaibo (Venezuela) basilica assigned to Colombia, and one Paris drawing assigned to a Mauritian cathedral. Similar dedications and common words are **not** exact-site evidence.

## Priority source-page spot checks (not image or final licence approvals)

- [Saint Louis Cathedral, Port Louis](https://commons.wikimedia.org/wiki/File:Port_Louis,_Saint_Louis_Cathedral.jpg): 4,928×3,248 px, own-work photo, CC0 claim; exact site named on source page. Strong **source-review prospect**, not approved.
- [Ballintubber Abbey eastern elevation](https://commons.wikimedia.org/wiki/File:Ballintubber_Abbey_eastern_elevation.JPG): 2,592×1,944 px, own-work, CC0 claim and exact abbey caption. Strong **source-review prospect**, not approved.
- [Saint Oliver Plunkett's head](https://commons.wikimedia.org/wiki/File:St_Oliver_Plunkett%27s_head_2007-10-5.jpg): source identifies the relic inside St Peter's, Drogheda. Treat as **relic-detail/gallery candidate**, never as church-exterior hero.
- [Marie Reine de la Paix 1942 postcard](https://commons.wikimedia.org/wiki/File:Marie-Reine-de-la-Paix-Port-Louis-1942.jpg): source identifies a historical postcard and an unknown original author while also claiming CC0. **Hold for underlying-rights verification**, not a current-site hero.

Additional Commons page checks:

- [Marie Reine de la Paix 2019 (Balou46)](https://commons.wikimedia.org/wiki/File:MU-port-louis-kirche-maria.jpg): CC BY-SA 4.0, own work, exact category; subject framing remains unreviewed.
- [Ballintubber cloisters](https://commons.wikimedia.org/wiki/File:Ballintubber_Abbey_cloisters.JPG): CC0, own work, exact location; likely a gallery detail, not a main building hero.
- [Port Louis Cathedral, 1812](https://commons.wikimedia.org/wiki/File:Port-Louis_1812.jpg): engraving of the church; segregated as **historical artwork**, not a present-day photograph, despite high resolution.

## Operational constraints and next finite release gate

1. Visually inspect the priority Mauritius and Ireland images **at source-file identity**, checking full building/relic, exact location, image defects, framing, watermark, composition and whether each is suited to hero versus gallery. A title match is not a visual match.
2. Verify original-file downloads and SHA-1 against P70's `commons_original_sha1`; inspect Commons authorship, licence version, derivative artwork issues and required credit/share-alike; store the exact file provenance.
3. Only then propose a small asset PR with approved local image bytes. Do not point the live card at arbitrary Commons URLs and do not publish any research candidate.
4. Continue through the **135-identity editorial queue** before searching the next 516-Place registry batch. Retry the 12 preserved P70 unresolved requests only in a separately paced targeted recovery; never mistake 429 for absence of imagery.

Cost: €0, no paid providers or storage. This PR contains only text research metadata.
