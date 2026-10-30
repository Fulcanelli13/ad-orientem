# P103 — production photo layout and license gate, not image release

**Latest P102 visual editorial baseline**: three preferred exact-source *preview* exteriors: Hannover St Clemens #61, Kolbermoor Bruder Konrad #71, Blandford Forum #195. Their P100 hashes are verified (11 unique / 31 candidate originals), but full artistic pixel QA and app render screenshots remain outstanding. This PR does NOT download images or approve them.

## Actual app display contract inspected

From `src/find/directory-card.js`:

| Surface | Existing presentation | Implication |
| --- | --- | --- |
| TLM Directory list desktop | 116px side strip, min-height 174px; `object-fit:contain` | No forced crop, full image retained with possible letterboxing |
| List at <= 420px viewport | 100px side strip, min-height 168px; `contain` | Also no forced landscape crop |
| Map quick preview | Image height 156px; `contain` | No forced crop, credits and source included |
| Detailed venue cover | Max-height 300px; `contain` | Full image and attribution visible |
| Photo gallery grid | Image height 160px; `contain` | Full portrait or landscape within frame |

The separate MapCN editorial carousel uses 88×76px `object-fit:cover`, with a portrait exception, but it is NOT automatically the TLM Directory photo view. Thus P101's hypothetical 16:9 warning is **not a release-blocking actual Directory crop failure**. P102's composition preference remains helpful; actual browser/device screenshots are still required before final quality approval. There is no right to assert that these image candidates were tested in the live app.

## Critical exact-Place join blocker

Current canonical Geography registry: **529 Places, 22 confirmed Directory-to-Place links**. Neither Hannover St Clemens, Kolbermoor Bruder Konrad nor Blandford Forum has its corresponding canonical Place; no exact identity link can attach these candidates to the TLM card. They remain **unpublished**, irrespective of their preview quality. Source-image church name or proximity is not a substitute for exact physical worship venue identity.

This applies to these three candidates only, not to the unrelated **36 already approved Place covers** and **33 already approved Place gallery records**.

## Physical-site research advanced (still no canonical Place)

| Photograph | Research-corroborated church address | Independent/source witnesses | Open gate |
| --- | --- | --- | --- |
| #61 Hannover | Platz an der Basilika 1, 30169 Hannover | [Basilica official address](https://www.st-clemens-hannover.de/anfahrt/), [Diocese of Hildesheim](https://www.bistum-hildesheim.de/bistum/pfarrgemeinden/kirche/a/basilika-st-clemens-hannover-1/), [FSSP local community](https://petrusbruderschaft.de/pages/wo-wir-sind/deutschland/niederlassungen/hannover/home.php) | Create/reconcile precise canonical Place and exact confirmed Directory `LOCATED_AT` link |
| #71 Kolbermoor | Th.-Fontane-Str. 7, 83059 Kolbermoor | [SSPX site listing](https://map.fsspx.org/de/places/kapelle-hl-bruder-konrad), [German district](https://fsspx.de/de/priorate-und-messzentren), [SSPX Chapel service](https://fsspx.today/chapel/kolbermoor/) | Same Place/link gate, keeping SSPX affiliation explicit |
| #195 Blandford Forum | Whitecliff Mill Street, Blandford Forum DT11 7BN | [Plymouth Diocese](https://www.plymouth-diocese.org.uk/church/blandford-forum-lady-lourdes-st-cecilia/), [Parish own address](https://blandfordcatholics.org/contact-us/) | Physical church confirmed; **current Traditional Latin Mass schedule not independently established**, so do not promote a new schedule |

The existing frozen research anchor and original venue identifier are retained for each photo in `p103-app-layout-and-license-readiness.json`. The independent witness checks improve *site research* but do not create a Place, verify GPS placement, approve any source image or publish Mass schedules.

## Exact Commons file source and declared reuse rights

| P87 ID | Exact-file author | Declaration | Required if published |
| ---: | --- | --- | --- |
| [61](https://commons.wikimedia.org/wiki/File:Basilica_St_Clemens_Clemensstrasse_Calenberger_Neustadt_Hannover_Germany_02.jpg) | Christian A. Schröder (ChristianSchd) | CC BY-SA 4.0 | Author credit, exact source and license links, modification disclosure, SA terms for adapted works |
| [71](https://commons.wikimedia.org/wiki/File:Hl._Bruder_Konrad_Kolbermoor-4.jpg) | Rufus46 | CC BY-SA 4.0 | Same requirements |
| [195](https://commons.wikimedia.org/wiki/File:Church_of_Our_Lady_of_Lourdes_and_St_Cecilia,_Whitecliff_Mill_Street,_Blandford_Forum_(September_2025)_(4).jpg) | Hassocks5489 | CC0 1.0 | No mandatory attribution under CC0; preserve author/source provenance anyway |

These claims were checked on the exact Commons file pages, but **full publication rights review and final app editorial authorization are not yet complete**. No additional service costs or owner contact.

## Production safety fix

The current Directory image admission contract previously accepted a recognized license ID and **any unrelated HTTPS license URL**. P103 now requires matching canonical Creative Commons license URLs for all supported variants, including CC BY 3.0 used by already approved gallery media. Existing 69 approved media records have matching URLs. The gallery now renders the actual license hyperlink next to each photograph's credit in English and French. All other identity, source and approved-media gates remain in place.

`tests/directory-media-card-contract.mjs` now tests mismatched license identifiers, exact CC0 / public-domain / CC BY 3.0 links and gallery links. It is executed as part of `npm test` via the Directory test sequence. `verify-p103.mjs` separately ensures the research sidecar cannot be mistaken for a published image manifest.

**Next release dependency:** independently corroborate the three exact sites against canonical venues and create the appropriate Places/links only when the required evidence is present; afterward review actual source pixels and device screenshots and carry out editorial signoff. Retain the 20 pending original-download holds until Wikimedia rate limits can be respected.

No new photos added, no image license cleared by inference, and no production location counts changed.
