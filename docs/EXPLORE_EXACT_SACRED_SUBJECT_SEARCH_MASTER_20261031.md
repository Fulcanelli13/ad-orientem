# Ad Orientem — exact physical sacred subject register and photo search
**31 October 2026** · Research-only programme · strictly €0 · independent of production Explore.

## Why the original photo search failed
A church name identifies a building/Place, not necessarily the pilgrim's devotional subject. The same campus may contain an original apparition wall, later sculptures, a mosaic, a venerated statue, a shrine, a tomb, a relic container, a museum and unrelated surrounding buildings. A generic Commons search blends them all. A correct Place photo can therefore be the **wrong photograph for the subject**.

New hard rule: **canonical Place → documented physical subsite → named original object / relic / reliquary / commemorative depiction → exact photo target → Commons results → identity and rights check → editorial approval**. No search by broad shrine title alone.

## Canonical coverage / research-only baseline
- `530` existing canonical Place IDs; **no new pins**. Original coordinates, cover decisions and gallery decisions remain unmodified.
- `88` source-linked pilgrimage guide stops from the **33 existing published guides**. These may be offsite stages, routes or broad campus references. They are **not** automatically exact on-site photo subjects.
- `127` original canonical relic identities at `97` owner Places. Custody evidence does not automatically identify the reliquary's appearance or guarantee visible bodily remains.
- `33` original apparition accounts. The event itself is **not a photographable current object**. Only present-day marker, shrine, sculpture or painting may be separately researched.
- `20` individually source-documented, human-checkable, search-ready focal subjects at `10` Place owners. These are **not published media**, and are a starter set, not complete inventory of those ten sites.
- `118` canonical Marian shrine records at `118` Places; **110** still lack a precisely curated principal photographic subject. A site cover does **not** close this gap.
- `391` Places have no illustrated-guide stop, relic or apparition owner in the current joined research corpus. This indicates **unresearched photographic content**, not that those sites contain no sacred objects.
- Total current subject/context rows `268`. Only 20 have an approved *search specification*, **zero new approved photo assets**.

## Examples of source-specific physical distinctions
### Knock · `place:IE:knock-shrine`
- `subject:focus:knock-original-gable`: **original parish-church gable wall** preserved in the Apparition Chapel; event site associated with witnesses in 1879.
- `subject:focus:knock-lorenzo-ferri-marble`: **1960 Carrara marble statuary** of Our Lady, St Joseph, St John, angels and the Lamb. Later artistic representation; investigate sculptural copyright separately from photographer's license.
- `subject:focus:knock-basilica-mosaic`: later **PJ Lynch / Travisanutto apparition mosaic** in the Basilica, not the original gable or 1960 sculpture. Modern artwork copyright hold.
- Source: https://www.knockshrine.ie/plan-your-visit/the-apparition-chapel/ and https://www.knockshrine.ie/key-places-to-visit/artistic-works/

### Lourdes · `place:FR:sanctuaire-notre-dame-de-lourdes`
- Actual **Massabielle Grotto**, **Joseph-Hugues Fabisch marble statue in its niche (1864)** and **Grotto spring** are distinct physical subjects.
- Source: https://www.lourdes-france.org/en/the-grotto-of-the-apparitions-at-massabielle/

### Nevers · `place:FR:espace-bernadette-nevers`
- **St Bernadette's body in a glass shrine** in the old Saint-Gildard chapel and the **1884 reconstruction of the Lourdes grotto** are different. Never use Nevers's replica as a photograph of the Lourdes original. Do not infer visibility/authentication from a modern wax covering.
- Source: https://www.sainte-bernadette-soubirous-nevers.com/fr/le-sanctuaire/

### Padua · `place:IT:basilica-sant-antonio-padova`
- The **Treasury Chapel**, **1436 tongue reliquary**, **1350 jawbone reliquary** and **1981 vocal-apparatus reliquary** are separately depicted subjects linked to exact original relic IDs. Beware swapped captions and modern-container rights.
- Source: https://www.santantonio.org/en/content/chapel-relics-treasury-chapel

## Data and tool
- `data/geography/research/exact-sacred-subject-photo-inventory-20261031.v1.json`: read-only subject-to-Place reference joins; 20 explicitly sourced exact focal targets, 88 guide-stop research references, 127 canonical relic associations and 33 apparition contexts, plus all 530 site owner rows. It is **not** an alternative Place, relic or media registry.
- `tools/precise-sacred-subject-photo-finder.html`: one standalone self-contained HTML tool with that full inventory embedded; it can be downloaded and opened locally without hosting. Commons live image search requires internet.
- `tests/explore-exact-sacred-subject-finder-20261031.mjs`: structural referential-integrity, source, date/rights/identity and no-generic-search checks.
- `tests/explore-exact-sacred-subject-finder-browser-20261031.mjs`: **mocked** Commons browser interaction, candidate export and image-free gap flow at 320/390 pixels. Passing a mocked browser test will not certify live Wikimedia access or licenses.

## Researcher workflow
1. Download and open the standalone HTML locally (do not rely on GitHub rendering raw HTML). The full 530-site list is embedded, including 110 Marian sites currently missing a precise focal subject.
2. Select a Place. Prefer **Precisely documented subjects** to try the new exact-only queries; choose **Marian shrines missing a precise primary subject** when documenting the next site.
3. For a verified subject, read its exact expected depiction and **do not confuse with** list before searching Commons. Search multiple wordings; reject an image that shows only an adjacent building, unrelated relic, replica or souvenir.
4. For an unresearched Place, enter a specifically named object or actual chapel with an HTTPS custodian source and an exact search phrase. This is **USER_PROPOSED_UNVERIFIED**, not automatically promoted research. Generic site names cannot trigger photo searches.
5. Keep one or several Commons photo **candidates** per exact subject, record what is visibly depicted (relic itself, case, tomb or memorial), and export the decisions JSON regularly. Imported decisions **merge** rather than overwrite prior selections. Original user-approved exterior covers remain untouched.
6. In the technical acquisition/review pipeline: independently verify current subject identity and source, author, free reusable license, artwork underlying rights, provenance, original image bytes/hash, high resolution and no misleading crop; bind only an exact existing `place_id` and, where applicable, `relic_id`. Date archival views clearly. All statuses must remain false until publication is explicitly approved.

## Copyright / identity policies
A Commons file's claimed CC license does **not** automatically confer rights over a modern artwork photographed inside a shrine. In particular, Knock's 1960 marble work and the later Basilica mosaic have additional modern-art rights review holds. Avoid Google Images downloads, social-media republications and unsourced photos. Historical photos cannot be presented as current displays without verified date information. The only acceptable publication outcome is a **source-identified and legally reusable** photo, or an explicit unresolved/rights-hold state.

## Sequence of editorial completion
Start with the 110 Marian sites lacking a precise subject (original image/statue, chapel, apparition marker), prioritizing principal world Marian destinations and the Indian Ocean/Ireland. Continue with the 127 relic identity records, distinguishing relic from tomb and reliquary. Then source-attest physical features for remaining site rows. This **precedes** mass photo acquisition. Do not mark a shrine image-complete merely because its exterior or a miscellaneous gallery photo exists.

Production Explore integration and photo approvals belong to separate review: no image from this research PR is published directly. Changes are intended to be compatible with the existing map-first Sacred Atlas layout and avoid duplicate editorial approval queues.


## 31 October 2026 — Round 1 user decisions recorded

The user reviewed the **20 photographs shown in the first in-chat Sacred Atlas round** and chose **KEEP for all 20**, in the original order. This choice is binding as a *visual editorial preference*; it is **not** a certification of a particular Wikimedia Commons file, author, license or underlying sculptural rights. Never discard or redo these 20 earlier choices as though unreviewed.

Authoritative append-only ledger: `data/geography/research/sacred-atlas-chat-photo-decisions-round1-20261031.v1.json`.

Original review order: Knock Apparition Chapel; Lourdes Massabielle Grotto; Nevers Saint Bernadette's glass shrine; Padua Saint Anthony's tongue; Fátima original Marian statue; Jasna Góra Black Madonna; Guadalupe tilma; Loreto Madonna inside the Holy House; Altötting Black Madonna; Mariazell Magna Mater Austriae; Rocamadour Black Madonna; Drogheda Saint Oliver Plunkett's head; Old Goa Saint Francis Xavier's casket; Catholic Walsingham Marian statue; Chartres Notre-Dame du Pilier; Aparecida original Marian image; Sainte-Anne-de-Beaupré Saint Anne statue; Paray-le-Monial Apparitions Chapel; Banneux Chapel of the Virgin of the Poor; La Salette apparition memorial statuary.

**Current state:** 20 KEEP / 0 replace / 0 reject. Eight decisions use exact research subject IDs already present in the subject inventory; twelve use stable Round-1 review IDs awaiting source inventory reconciliation. All twenty are bound to existing canonical Place IDs. None has a verified exact Commons original. The image-query strings from the in-chat cards are preserved to help identify the displayed candidates; queries are *not* unique source file IDs, so a subsequent search result must not be silently substituted for the reviewed photograph. All rights/identity/asset/publication flags remain false.

Workflow: obtain the exact original Commons file identity for the user's approved displayed candidate, then verify the photograph's subject, physical site, resolution, legal license, photographer and underlying artwork rights, hash, crop and caption. **Preserve the KEEP vote throughout**. If the exact originally displayed photograph cannot be recovered, mark `EXACT_PREVIEW_IMAGE_UNRECOVERED` and seek user adjudication of a *replacement*, rather than treating the earlier approval as permission to choose another photograph. Existing previously approved Place media and all editorial decisions remain untouched.

The branch's contract CI now checks this ledger. This research decision record does not itself publish any photograph. It also does not mean all images of these 20 shrines are complete: the approved preview identifies one principal subject, while other distinct subsite objects remain separate coverage work.


## 31 October 2026 — photographic source and rights triage (post-approval)

Added `data/geography/research/sacred-atlas-round1-commons-rights-triage-20261031.v1.json` and `tests/explore-sacred-atlas-round1-rights-triage-20261031.mjs`.

Each of the 20 earlier user-kept subjects now has a *specific Commons candidate file-page URL*, claimed author, claimed photographer licence, claimed original dimensions, subject/site assessment and explicit rights hold. This **does not prove** that a candidate exactly reproduces the dynamically retrieved ChatGPT preview. All flags for underlying artwork rights, raw downloaded file verification/hash, final image quality, preview match and publication remain **false**. No original author, existing user approval, publication registry or pin has been changed.

Classification: **18** current/modern photograph Commons pages whose descriptions match the requested places and objects; **one** archival Banneux postcard with incomplete historical dating and rights evidence; **one** wrongly located La Salette art photograph. **0** new media published.

Two concrete errors corrected:
- The candidate `File:Apparition de Notre-Dame à La Salette (3ème phase)6.jpg` shows statuary **at La Rabatelière (Vendée)**, not the original pilgrimage sanctuary in **La Salette-Fallavaux (Isère)**. It must never be reused on that canonical Place even though the *photographer* dedicated the photograph to CC0. The user KEEP vote remains on record as a preference for the earlier displayed scene. Proper-site, photographer-CC BY-SA 4.0 alternative **not approved yet**: `File:Sanctuaire de Notre-Dame de La Salette - Statue 02.jpg` by Tylwyth Eldar, 3008×2000, source https://commons.wikimedia.org/wiki/File:Sanctuaire_de_Notre-Dame_de_La_Salette_-_Statue_02.jpg. Request visual reapproval before replacing.
- The Banneux candidate `File:Banneux-Notre-Dame. La Chapelle de la Vierge des Pauvres - De Kapel van de Maagd der Armen, GP122244 (2).jpg` is an **undated historical postcard**, not a modern photograph. Source KU Leuven Postcards collection; its public-domain claim and source identity still require review. The modern, CC BY-SA photographs `File:20140202 banneux10.JPG` and `File:20140202 banneux15.JPG` are **Saint Michael's chapel**, not a substitute for the actual Chapel of the Virgin of the Poor. Do not substitute. Photograph `File:Banneux Maagd der armen.jpg` describes the *statue and spring*, which are distinct photographic subjects.
- The Fátima official photo gallery explicitly states image use **requires licensing**: https://www.fatima.pt/pt/multimedia/images/nossa-senhora-do-rosario-de-fatima. Do not download its gallery pictures for the app. Separately, `File:Virgen de Fátima.JPG` on Commons claims photographer CC BY-SA 3.0 and underlying Thedim-sculpture public-domain dedication; that independent sculpture and jurisdiction claim still requires legal/source checking before release.

Implementation priorities following this triage: verify candidate equality with originally shown previews; evaluate underlying original work/artwork rights for each; independently confirm Commons image bytes and hashes (do not persist expiring CI artifact links as permanent archive); verify photographic quality and avoid cropped framing; then promote exact cleared assets through existing approved-media schema with correct photographer attribution and licence URL. No source claims alone certify production readiness.

All original 20 KEEP votes remain preserved. Source investigation and legal review should not be confused with a new editorial approval round.
