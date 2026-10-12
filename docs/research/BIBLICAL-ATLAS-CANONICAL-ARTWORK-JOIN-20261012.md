# Biblical Theatre ↔ canonical sacred-art catalogue
**12 October 2026 — integration contract, no imported paintings, no release approval.**

## Ownership and release rule

The artwork source of truth is **Sacred Art PR #887** (issue #885), not the Biblical Atlas. Its candidate record schema is `AO_SACRED_ART_CANDIDATES_V1`, ownerIssue `885`, and scope `RESEARCH_CANDIDATES_ONLY`. Its own editorial workflow requires broad acquisition, 1962 day associations, one comprehensive visual review and exception-only decisions. **No original, thumbnail, Getty/Commons crop, artist or rights claim from that donor is approved for public Bible Theatre merely by appearing in the acquisition registry.** Do not copy images or create a second art catalogue here.

The Biblical Atlas's data owners remain `src/find/bible-atlas.js` for **151 selected canonical event identities** and `data/explore/biblical-cinematic-studies-review.v1.json` for **181 review scenes in 14 chapters**. They are not interchangeable.

## Join contract

| Canonical source | Required join field | Allowed use |
|---|---|---|
| Biblical Atlas event | `eventKey` (e.g. `biblical:event:jerusalem-temple-e3`) | Stable reusable identity across Calendar, genealogy, chronology and scene studies |
| Biblical Theatre scene | `scene.index`, `scene.reference`, its reviewed source relationships | Scenic composition, chapter positioning and evidence qualifications. Numeric `atlasIndex` is **not** a persistent external key |
| Sacred Art original | Canonical `artworks[].id` and verified source original hash in issue #885 catalogue | Single reusable painting asset once acquisition and artwork-level decisions are complete |
| Canonical association | Reviewed `artworkId` ↔ `eventKey` plus applicable verse range and **relation type** | One source association may legitimately appear on the 1962 Calendar, Today, Rosary and Bible Theatre without duplicating the painting |

Require a relation type from **depicts the exact episode**, **depicts a broader passage**, **traditional iconography**, or **general devotional context**. An exact-passage correspondence is neither proof that two staged events are the same nor proof that a painting depicts the specific moment. Thus John 20's empty tomb is not interchangeable with an artistic depiction of the instant of Resurrection, and John 2 cleansing is not silently equated with the Synoptic Passion cleansing.

**Release predicate:** show an image only if the canonical artwork original is available at genuine display quality, provenance and rights are vetted, the comprehensive art editorial process has approved it (including its specific biblical association and any exception), and its visual presentation/crop is accepted for the current viewport. A source URL alone, a large preview, a provisional IIIF slug, an unreviewed Commons claim or an empty exception registry before the comprehensive review **must fail closed**.

## Immediate subject alignment; not painting allocation

The Bible Theatre should request exact narrative subjects matching the scene's source, preferably reusing acquired Calendar/Prayer research. High-priority overlap includes Annunciation (Luke 1:26–38), Visitation (Luke 1:39–56), Nativity (Luke 2:1–20), Presentation (Luke 2:22–38), Finding in the Temple (Luke 2:41–52), Agony (Luke 22:39–46), Passion episodes, Crucifixion, empty tomb and Mary Magdalene (John 20:1–18), Pentecost (Acts 2), and St Paul's conversion/mission. These are **search requirements**, not certified matches. Keep individual narrative parts separate when the witness distinguishes them.

Curatorial exclusions and image acceptance: no El Greco proposals; prefer exceptional historical Catholic sacred painting, balanced fine-art aesthetic, original flat work rather than a framed photograph or shrine interior, sufficiently high native pixel dimensions for mobile/desktop, faithful subject/figure attribution, reputable original publisher and clear reproduction licence. Scripture and ecclesiastical history cannot be inferred from the artist's composition.

## Design behavior

Before approved art associations, the Theatre uses a source-based **typographic stage**, not fake images, arbitrary illustrations or an empty cinematic hero. The reader's `data-bible-scene-stage` is intentionally artwork-ready but does not fetch research originals or render an unapproved placeholder. Preserve French/English evidence notes, direct Scripture navigation, chapter scene rail, and reduced-motion behavior.

When the art team certifies its canonical joined selection, add a **read-only consumer adapter** owned by the shared art service: it will take `eventKey`/source verse/scene relation and return one approved artwork object with canonical ID, local high-quality asset URI, licence, source provenance and crop; it must never write back independent copies of art objects into the Atlas scene JSON. Re-run 320/390/768/1280 screenshots, source-matching and rights tests on the selected painting before enabling it.

**Explicit non-claims:** This integration specification does not approve a painting, date a Gospel harmony, geolocate a scene, close issue #885, or unblock publication of #1069.
