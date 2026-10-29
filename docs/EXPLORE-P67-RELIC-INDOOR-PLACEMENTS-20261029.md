# P67 — Source-attributed indoor relic locations

**Scope:** enrichment of the *existing* Sacred Treasures cards, not a second map, a relic-authenticity certificate, or an indoor routing engine.

## Measured baseline (29 October 2026)

- **122 relic/object records**, each with an original source URL.
- **92 exact canonical physical Place IDs** owning those records.
- **25 curated source-described interior locations**, at **10 exact Places**.
- **97 site-only relic records** remain in a generated research queue. No imaginary chapel, altar, indoor coordinates, public access or feast.
- **Zero new physical map pins**, Calendar changes or claims of relic authenticity.

Full records remain in `data/explore/sacred-phenomena-seed.v1.json`. New optional, append-only placement supplement: `data/explore/relic-indoor-placement.v1.json`. It stores exact existing `relic_id` and `place_id`, EN/FR position labels, type, custodial URL, limited evidence state and any dated closure notice.

The initial evidence includes the official caretakers of Assisi, Padua, Fátima, Saint Peter's Basilica, Nevers, Ars, Paray-le-Monial, Emmitsburg, Montreal and Santa Croce in Gerusalemme. These positions are **attributed to their custodians**, not fresh building surveys. Physical location can change; the application does not guarantee that a relic, room or reliquary is accessible.

### Santa Croce — unusually important access exception

The official Santa Croce website published a **16 April 2026 notice** that the Chapel of the Relics was closed for urgent renovations, with reopening to be announced. The new location card must show this warning with a direct link, rather than send pilgrims to a supposedly visitable chapel. Do not infer reopening from the ordinary information in the source page, which still mentions admission.

### Exact-location editorial rules

1. A relic's underlying source and the separate indoor-placement evidence must match the **same canonical Place and relic IDs**. Reject conflicting duplicate placement IDs, malicious URLs and non-published entries.
2. `location_en` and `location_fr` describe a room, chapel, altar, crypt or exhibition area. They never change the original Place coordinates and never cause pins or an indoor-map route.
3. The source may attest a reliquary *holding* a reported relic; it does not establish historical/scientific authentication of the relic or show that the relic itself is visibly exposed.
4. Missing indoor metadata means **site only**. Do not derive a chapel from a summary, photo, dedication, name similarity, historic location or another relic at the same sanctuary.
5. Keep exceptional/temporary access information independently dated and sourced. Any future source-check must verify the status directly before altering it.
6. Show the position only within the already-existing Explore > Place > Sacred Treasures card. Link back to the relic's source and exact record; do not duplicate a saints biography, custom or Calendar item.

## Automated completion path

Run:

```sh
node tools/audit-relic-indoor-placement-p67.mjs
node tools/audit-relic-indoor-placement-p67.mjs --jsonl > relic-indoor-unlocated-research.jsonl
```

The JSONL contains every remaining exact `relic_id`, `place_id`, existing source and research hint. A keyword hint is **research only**, never a new position. Group by custodian URL and Place ID to review numerous relics from the same treasury in one official page. Future approved rows can be added in bulk to the supplement after source inspection and tests.

**Do not begin another multi-phase hand-written inventory.** Prioritize large treasuries and church guides that simultaneously resolve many outstanding objects; reserve individual investigation for the exceptional queue.

## Validation

```sh
node tests/explore-p67-relic-indoor-placement.mjs
node tests/explore-p66-editorial-relic-cards.mjs
node tests/explore-r69-multi-place-gallery.mjs
```

Regression checks: exact Notre-Dame source still has no invented indoor position; the 25 approved source-described locations appear in correct Place cards; the 97 unlocated records stay research-only; Santa Croce has a dated EN/FR closure notice; the two Fátima transept chapels are not confused; the Carmel's relics do not leak to the Lisieux basilica.

No costs, new APIs, contact, or automatic display of unlicensed photographs.
