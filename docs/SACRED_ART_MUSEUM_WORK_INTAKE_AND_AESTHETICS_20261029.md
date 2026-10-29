# Sacred Art — European museum art registration and aesthetic triage

29 October 2026 · no newly invented aesthetic approvals or image release · €0

## What is registered and what is not

- **186** institutional source programmes registered, each with access tier and scan state; **0** asserted completely exhausted.
- **383** canonical distinct artwork IDs preserved, including **107** historically approved choices.
- **281** earlier research candidates crosslinked by exact artwork ID or same recorded source URL; **174** such links, **107** still identity-unresolved.
- **83 Breviarium plates** registered as visual-source references (not automatically 83 separate physical paintings).
- **654** B1 Rijksmuseum/KMSKA source metadata leads joined (B1 optional; absent or unfinished means zero leads, not an empty collection).
- **0** new human aesthetic approvals; **0** source-image legal clearances; **0** photo QA releases.
- B1 title prefilter: **322** explicit sacred-title matches, **175** ambiguous, **157** unsupported/likely unrelated or non-painting records.
- The Flemish OAI feed currently yields Musea Brugge collection URLs, **not 374 confirmed KMSKA holdings**. Museum holder and medium must be confirmed independently.

## Strict aesthetic gates (not an artist-only score)

1. **Exceptional painterly beauty**: accomplished drawing/anatomy, chromatic richness, strong coherent composition, emotional restraint or depth.
2. **Sacred devotional intensity**: reverence, spiritual gravity, transcendence and visual power; reject generic illustration or merely antiquarian documentation.
3. **Precise Catholic iconography**: actual saint, scene and rite; no incorrect event or location or workshop conflation.
4. **Source and presentation**: legally reusable exact photograph; rich tonal fidelity; no physical frame, glare, digital manipulation or clipped original; mobile composition.

A work cannot pass on source rights, iconographic relevance, a preferred artist name, or a numerical average alone. Grade A/B/C/D requires original-image visual review and explicit human approval where applicable.

### Negative controls

- El Greco and Fra Angelico excluded from new selection; old records preserved.
- Global user ratings 0–2 remain rejected even if present in a new museum; existing high-rated works may not be re-offered as newly discovered.
- Previously approved works are never replaced by a new museum scan.
- Photography rights restrictions do not prohibit art-historical object research or independent rights-verified photographs.

## Existing human aesthetic calibration and priority preview

The existing [rating reconciliation](../data/calendar/sacred-art-rating-reconciliation-20261013.v1.json) contains **197 rated originals**: **54 rated 4–5**, **81 rated 3**, and **62 rated 0–2**. The 54 are historical strong-rating examples, not 54 newly assessed works; the 62 are global rejects under the user’s rules. Also retain 35 earlier subject approvals and all 107 locked canonical approvals without simply adding them together.

The discovery collector's high-scoring **title/artist metadata** includes:
- Tintoretto — *Angel from the Annunciation to the Virgin* (Rijksmuseum object 20026408);
- Murillo — *Annunciation to the Virgin* (Rijksmuseum object 20025782);
- Tiepolo — *De Onbevlekte Ontvangenis* (Rijksmuseum object 200108011);
- Ludovico Carracci — *Het visioen van de heilige Franciscus van Assisi* (Rijksmuseum object 200109177);
- Tintoretto — *Christ with the Adulterous Woman* (Rijksmuseum object 20028546).

These are **priority candidates for original-image visual comparison only**. Attribution, painting-versus-graphic medium, exact physical work, rights and aesthetic tier A/B/C/D are not verified by title alone. Do **not** infer a Rubens/Van Dyck-level beautiful painting from a name, and do not assign a user rating without visual evidence.

The 654 newly registered metadata leads contain **322** explicit sacred-title hits, **175** ambiguous, and **157** likely unrelated/unsupported or non-painting title records after preliminary title screening. The Flemish initial page coverage is limited and currently reflects Musea Brugge identifiers from a **multi-museum OAI aggregator**; this is not a KMSKA-only painting census. Do not call these 322 verified paintings.

## Next actual museum mining job

Rijksmuseum and KMSKA are configured. Then use official source/terms-safe metadata from Belvedere, KMSKA/Art in Flanders, Paris Musées where the free token can be obtained, and other open feeds. Keep source-specific queries, total inventory claims, pagination and failure counts.

Full machine-readable linked records: data/calendar/sacred-art-museum-work-intake-and-aesthetic-gates-20261029.v1.json.
