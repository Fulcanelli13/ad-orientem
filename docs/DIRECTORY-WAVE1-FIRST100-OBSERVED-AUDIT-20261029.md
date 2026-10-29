# Directory exterior Wave 1 — observed 100-site audit (29 October 2026)

Source of record: `research/directory-photo-candidates:data/directory/research/photo-candidates/r49-exterior-0-100.json`. These counts are the archived **actual output**, not forecasts. The 100 venues are a subset of the 1,879 frozen R49 Directory identities; do not add them to the overlapping 516 canonical Sacred Places.

| Measure | Observed |
|---|---:|
| Frozen source venues processed | 100 |
| Venues yielding >=1 exterior candidate | 14 |
| Candidate images | 27 |
| Unique candidate URLs | 27 |
| Candidate licences reported as PUBLIC_DOMAIN | **27** |
| Explicit CC0/CC-BY/CC-BY-SA Commons sources | **0** |
| Candidates accepted by existing verified-original WebP stager | **0** |
| New image files in permanent bulk staging archive | **0 confirmed** |
| Published from batch | 0 |
| Venues with Wikidata geo/name research match | 22 |
| Openverse queries used / run budget | 20 / 20 |
| Venues denied further Openverse lookups by budget | 88 |
| Venues with Openverse errors | 5 |

Provenance of the 27 candidates: 21 main Commons category, 1 role-specific subcategory, 1 Wikidata P18, 1 Commons geotag and 3 country-constrained title searches. **This does not establish that all 27 depict the correct church.**

## Concrete false-positive and image-quality holds

The bulk shortlist contains at least the following suspect matches. These are examples, not a comprehensive adjudication of all 27.

- Eichstätt, Heilig-Kreuz-Kirche -> `01 Kirche Heilig-Kreuz Frankfurt (Oder).jpg`: title names another city. Do not publish as an Eichstätt church photo.
- Stuttgart-Zuffenhausen, St Albert -> `Albert Emil Kirchner Blick auf eine romanische Kirche.jpg`: historical painting title rather than a verified photograph of St Albert. Do not publish.
- Heidelberg and Chartres category results contain plausible architectural views, but Public Domain declarations and exact-site subject still need independent verification.
- Prague, Karlov and Bordeaux category results include historical images/scans. These must not crowd out modern, framed-façade-free photography in the primary cover shortlist.

## Correction introduced in PR #1945

When a Wikidata Commons category yields only PUBLIC_DOMAIN or otherwise non-stageable metadata, the program makes one additional bounded Commons text search for that role. Commons original SHA1 + explicit allowed CC licence candidates rise to the front, so the four-slot shortlist does not fill with historical scans ahead of actual acquirable photographs.

The correction **does not** presume Public Domain status is legally sufficient, import images from unrelated churches, treat camera geotags as subject proof, or promote anything. All candidate identity and visual quality remain editorial holds.

## Next gate

Pass offline regression and required main CI; compare a subsequent frozen Directory range using revised stageable-CC counters; then acquire files only if actual independently verified source metadata passes the same W7/W8 hard guards. Once sufficient exterior coverage exists, audit visually in broad sheets and move to interiors/altars and verified 360° panoramas. The budget is strictly €0.
