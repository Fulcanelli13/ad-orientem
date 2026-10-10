# Sacred art — Phase 2 wave 2: source paintings, feast identities and blockers
10 October 2026 · Editorial issue [#885](https://github.com/Fulcanelli13/ad-orientem/issues/885) · Source registry PR [#887](https://github.com/Fulcanelli13/ad-orientem/pull/887)

**Research/acquisition only. No artwork is visually approved or published; the selection HTML and exportable JSON are intentionally deferred.** This report is incremental to the [frozen Phase 1 audit](SACRED-ART-LITURGICAL-FIRST-AUDIT-20261010.md) and [Phase 2 first batch](SACRED-ART-PHASE2-MAJOR-FEAST-20261010.md).

## Current verified position

| Metric | Previous wave | Current verified | Delta |
|---|---:|---:|---:|
| Painting candidates catalogued | 188 | **194** | +6 |
| Original files acquired and SHA256-recorded | 173 | **179** | +6 |
| Museum-object CC0 originals | 165 | **171** | +6 |
| Commons PD-Art originals in legal review | 3 | **3** | unchanged |
| Kress Foundation public-domain originals in legal review | 5 | **5** | unchanged |
| All subject minima met | 95/168 (56.5%) | **97/168 (57.7%)** | +2 |
| Major-feast minima met | 18/26 (69.2%) | **20/26 (76.9%)** | +2 |
| First-class 2026 days with curated exact subject-source association | 1/53 (1.9%) | **13/53 (24.5%)** | +12 |
| Production-approved painting originals | 0 | **0** | unchanged |

The 2026 full-year production resolver completed **365/365 dates**; 53 observed I-class principals, 76 II, 165 III, 71 IV, 72/72 bounded independent rubrical checkpoints and no unresolved dates. **This is not full independent liturgical-calendar certification.**

Verified CI evidence: [source-target audit](https://github.com/Fulcanelli13/ad-orientem/actions/runs/38054616566) and [calendar, exact-source-link and hash audit](https://github.com/Fulcanelli13/ad-orientem/actions/runs/38054649009).

## Six new hashed originals

Source [batch A](https://github.com/Fulcanelli13/ad-orientem/actions/runs/38054107621), original artifact `11670573051`: Met 437336, *Madonna and Child with Saints Francis and Dominic and Angels* (Giulio Cesare Procaccini), Met description supports the institution of the Rosary; Met 437578, *Christ in Glory* (Russian Painter), only a **symbolic Christ-the-King thematic association**, **not** a feast-specific image.

Source [batch B](https://github.com/Fulcanelli13/ad-orientem/actions/runs/38054264962), original artifact `11669918762`: Met 437216, *The Fifteen Mysteries and the Virgin of the Rosary* (one collective 15-mystery altarpiece, not 15 separate original images); Met 458984, *The Birth and Naming of Saint John the Baptist*; Met 438467, same subject on a **double-sided object** whose reproduced face must be checked; Met 436567, *Scenes from the Life of Saint John the Baptist* including the birth within a multi-scene narrative (requires suitable detail/crop).

All six are official museum-source CC0 originals with a 64-digit original SHA256 and pixel dimensions recorded in `data/calendar/sacred-art-candidates.v1.json`. Met 436578 (*All Saints*) and Met 437566 (*Christ's Entry into Jerusalem*) were **rejected as near-monochrome reproductions**, not counted as acquired colour originals.

## 2026 exact I-class feast-subject crosswalk

- **15 independently recorded original-to-observed-principal links** covering **13 distinct observed I-class 2026 dates**. Documented by [source-link ledger](../../data/calendar/sacred-art-1962-exact-feast-source-links.v1.json), including official object URL, SHA256, real DayResolver identity and subject evidence.
- The 13 days: Epiphany, Annunciation, Palm Sunday, Easter Sunday, Ascension, Pentecost, Trinity Sunday, Nativity of Saint John the Baptist, Saints Peter and Paul, Assumption, All Saints, Immaculate Conception and Christmas Day.
- The source ledger and master registry now agree about those 15 associations. **2 source-link entries are rights-held**: Kress Entry into Jerusalem and Commons Multscher Pentecost; none is curator approved.
- Other days are not silently marked “complete” because a general Lent/Advent, Easter octave, Holy Week or Pentecost octave image exists in a target pool. In particular, related images must not be labelled as exact appointed Gospel/lesson art without source confirmation.
- Class I mapping: **13/53 = 24.5%**; unlinked **40/53 = 75.5%**. II/III/IV-day mapping remains unstarted (0/76, 0/165, 0/71), by deliberate user priority order.
- The general [I-class day research worklist](../../data/calendar/sacred-art-first-class-2026-research-crosswalk.v1.json) covers 53/53 actual DayResolver identities; 51/53 have *potential subject-pool leads*, **not** source-certified date associations.

## Six remaining major-feast minimum deficits

| Existing target | Acquired source originals | Minimum | Additional exact originals |
|---|---:|---:|---:|
| Palm Sunday | 1 | 2 | 1 |
| All Saints | 1 | 2 | 1 |
| All Souls | 1 | 2 | 1 |
| Transfiguration | 1 | 2 | 1 |
| Christ the King | 0 | 2 | 2 |
| Sacred Heart | 0 | 2 | 2 |
| **Total** | | | **8 source-original slots** |

Exact acquisition must distinguish the following: a modern Christ-in-Glory panel is thematic but not necessarily a feast-specific *Christ the King* subject; Saint John Baptist's portrait or Beheading does not depict his **Nativity**; an All Souls painting should represent the faithful departed/Purgatory rather than any Last Judgment used without a correct caption; additional Transfiguration and Palm Sunday paintings must be **colour high-resolution** reproducible artworks.

### Blocked exact subjects

Full source investigation and rejection explanations are in [the Sacred Heart / Christ King blockers ledger](../../data/calendar/sacred-art-hard-feast-blockers.v1.json). A historically public-domain painting can nevertheless have a restricted or unresolved modern museum photograph, insufficient original pixels, an unsuitable medium (sculpture/print), or a source description too loose to count. **Neither Sacred Heart nor Christ King is falsely counted as acquired exact-source painting**, and no lower-resolution or licence-breaking workaround has been accepted.

## Next order (still Phase 2)

1. Investigate **new source institutions / photographer permissions / official CC0 pixel originals** for Sacred Heart and Christ King, and the remaining four one-original deficits (Palm, All Saints, All Souls, Transfiguration).
2. Map remaining observed I-class Holy Week, Easter octave, Pentecost octave, Lenten/Advent Sundays and unique feasts to **verified actual ritual/iconography or appointed Scripture**, preserving distinctions among exact, contextual and seasonal reuse. Recheck transferred feasts in other year patterns.
3. Independently establish the applicable **holy day of obligation** jurisdiction(s) before measuring their coverage. 1962 I-class rank must not be mistaken for present-day local obligation.
4. Continue with module deficits (Stations, Scripture, devotion, formation, saints) and then II/III/IV-class days in priority order.
5. **Last**: full review HTML with real art previews, category/rank filters, Accept/Reject/Needs Review and exportable JSON. Import that JSON into a separate final artistic, rights and mobile-crop validation step.

**Preservation caveat:** GitHub workflow original-image artifacts use finite retention (typically configured as 30 days); before the final gallery, original bytes must be durably preserved or fetched again from the official object source and validated against the recorded original SHA256. A link to an expiring artifact is not itself durable asset storage.
