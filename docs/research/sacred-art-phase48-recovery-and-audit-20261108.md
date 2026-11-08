# Sacred Art Phase 48 — crosswalk recovery and publication audit checkpoint

Date: 2026-11-08  
Repository branch: `research/sacred-art-phase48-crosswalk-recovery-20261108`  
Classification: **research only**; not a Gallery, Prayer, Home, or Calendar release.

## Recovered evidence

The previous Phase 47 Library archive provides 989 operational groups, 177 handpicked image selections, 10 supported exact-physical-object relationships, four explicitly prohibited title-based merges, and eight object-identity holds. The remaining 159 handpicked museum-identified selections have **no reliable relationship to the existing 989 groups yet**; absence of a match is not proof that the work is distinct or new. The 1,599 previously rejected source records stay excluded.

The source in `data/artwork/canonical-selected-photo-identity-decisions.v1.json` is a **recovered digest**. The complete original CSV evidence remains in the user's Library archive `Ad_Orientem_Phase47_Verified_10_Link_Crosswalk_Source.zip`, including museum links, selected Commons photograph sources, notes, and false-merger reasons. The digest does not claim new museum evidence reviewed in Phase 48.

## Priority geography for the 159 unlinked selections

These are counts of still-unlinked handpicked records from the Phase 47 selected-to-group table, *not* independent painting identities:

| Holding | No reliable link |
|---|---:|
| Musée des Augustins, Toulouse | 15 |
| Groeningemuseum, Bruges | 14 |
| KMSKA, Antwerp | 13 |
| Palais des Beaux-Arts, Lille | 13 |
| Musée Magnin, Dijon | 12 |
| MSK, Ghent | 11 |
| Musée des Beaux-Arts, Dijon | 11 |
| Musée de Grenoble | 11 |
| Musée des Beaux-Arts, Lyon | 9 |

A fuzzy title/artist spot-screen produced **no additional confirmed links**. In fact, near-matches included known traps: Rubens's Adoration at Lyon versus the Madrid painting, Champaigne's Presentation at Dijon versus Brussels, and the two Martha-and-Mary paintings. Do not count fuzzy candidates as verified.

## Production-gallery evidence: what is and is not established

Phase 47's Library snapshot, `AO_Phase47_Live_Module_Photo_Checks.zip`, scanned production `main` at SHA `750287870dee735d5a7293cbcc91cab7d6b6e57c` and the public GitHub Pages site at the time.

* Sixteen registered module photographs returned image HTTP 200 at that snapshot.
* The scanned static production directories contained 763 image assets, including icons, symbols, church/place photography and paintings. **763 is not a painting count.**
* The source asset reference scan found 323 distinct path references: 258 files existed in that snapshot and 65 did not. The missing items were concentrated in interface / liturgical icon registries, not the 16 explicitly released painting paths.
* Source references included 18 `assets/prayer/` paths, four `assets/home/` paths and one `assets/pray/` path; these are **not distinct artwork counts**, and some are original/cropped versions.
* No route-by-route runtime-rendered painting census exists yet. The 16 registered URLs must not be described as 16 successfully rendered routes or as the overall art gallery.

The latest `main` head observed during recovery was `1107087c1d952175b4a923ffa30acb3484cba164`; the earlier production snapshot has not been re-tested as a full browser-gallery run in this phase.

## Next evidence gates

1. Verify physical-object accession numbers and collection holdings for selected records in descending holding-size batches. Preserve painting identity separately from photographic edition and licensing.
2. Treat an unlinked selected painting as a new canonical object only when museum inventory or exact physical work identification supports it; never auto-merge on title, artist, or religious subject.
3. Build a route-by-route *rendered* image census for Home, Calendar, Prayer, Angelus, Rosary, Stations and formation paths. Record route, module/card, asset URL, image byte success, physical painting ID, and selection/approval status.
4. Reconcile each published painting's source licence, photograph quality, owner/editorial approval and assignment separately. Do not replace handpicked photographs or promote unapproved Commons candidates.
5. Keep research-only changes out of public GitHub Pages until review, tests and explicit publication approval.

## Release guards

No changes to `main`, `assets`, visual Gallery, Home, Prayer, Calendar, or user artwork selections were made by this Phase 48 research branch. No Vercel deployment.
