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
