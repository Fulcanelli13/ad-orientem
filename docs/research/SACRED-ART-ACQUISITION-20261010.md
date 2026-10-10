# Sacred-art acquisition audit — 10 October 2026

Canonical owner: [issue #885](https://github.com/Fulcanelli13/ad-orientem/issues/885), integration PR [#887](https://github.com/Fulcanelli13/ad-orientem/pull/887).

## What has actually been completed

- Inspected the current canonical Pray, Novena, Rosary, Stations, Calendar, Home and Formation module owners; defined **145 recurring/seasonal/Scriptural/saint/portrait art subjects** plus **23 Formation/sacramental subjects** rather than inventing independent module copies.
- Added 168 explicit target keys, prioritised acquisition queries, documented exact versus related visual associations and module routes; these are editorial work items, **not a claim of all liturgical days verified**.
- The museum source master now contains **168 unique painting candidates and 153 hashed original JPEG acquisitions** at the latest 2026-10-10 10:41 UTC audit snapshot. 150 had museum CC0 status. Three Pentecost originals are Commons PD-Art/PD Mark and remain **rights-held**; these are not CC0 and must not auto-publish.
- All **15 traditional Rosary mysteries have >=2 acquired original paintings**, including Pentecost; the optional luminous mysteries have incomplete exact scenes. All 11 1962 liturgical periods have at least one acquired *seasonal* fallback painting.
- The 731 dates of 2024/2027 have a logically available period fallback. **No complete date-resolved 1962 principal feast/Gospel painting crosswalk has been audited**. No artwork has undergone final aesthetic/portrait authenticity/phone crop release review. Current live app unchanged.
- Automated all-module audit (2026-10-10 10:41 UTC): **86/168 subject minimums met**, **82 under-target**, **65 without an exact preliminary tagged candidate**. This deliberately excludes symbolic fallback when calculating exact-source completeness.

## Acquisition sources and evidence

- [Met Open Access CC0 policy](https://www.metmuseum.org/hubs/open-access) · original JPEGs in [initial Met workflow](https://github.com/Fulcanelli13/ad-orientem/actions/runs/38038829532) and [Met/Chicago follow-up](https://github.com/Fulcanelli13/ad-orientem/actions/runs/38040772457).
- [Cleveland Open Access API](https://www.clevelandart.org/open-access-api) · [first focused rosary acquisition](https://github.com/Fulcanelli13/ad-orientem/actions/runs/38041653701).
- [NGA open access](https://www.nga.gov/artworks/free-images-and-open-access) · [direct official NGA museum downloads](https://github.com/Fulcanelli13/ad-orientem/actions/runs/38042604394).
- [Commons PD-Art policy](https://commons.wikimedia.org/wiki/Commons:Reuse_of_PD-Art_photographs) · [3 verified Pentecost originals](https://github.com/Fulcanelli13/ad-orientem/actions/runs/38043276943), **separate rights gate**.
- [Five parallel museum acquisition lanes](https://github.com/Fulcanelli13/ad-orientem/actions/runs/38044853035): Calendar, traditional Rosary and Stations, Devotions, Scripture, Saints/Portraits. Complete with per-query failures and 68 acquired entries (some duplicates and false-title subjects, reconciled to canonical single ID).
- [23-subject Formation acquisition lane](https://github.com/Fulcanelli13/ad-orientem/actions/runs/38045727698): started and still processing when this note was authored; new originals **not** counted until their museum provenance and actual SHA-256 are reconciled.

### Source of truth (no competing inventories)

1. [Master candidates and 16-field tagging schema](../data/calendar/sacred-art-candidates.v1.json)
2. [Original 145-subject worklist](../data/calendar/sacred-art-subject-targets.v2.json)
3. [23 canonical Formation subjects](../data/learn/sacred-art-formation-targets.v1.json)
4. [Explicit exact-versus-symbolic crosswalk](../data/calendar/sacred-art-editorial-crosswalk.v1.json)
5. [Repeatable all-module gap audit](../tools/calendar/audit-sacred-art-modules.mjs) and [GitHub CI](../.github/workflows/sacred-art-coverage-audit.yml)

Automated reports, exact priority-gap lists, and every original JPEG are **GitHub Actions review artifacts**, not released app assets. Action artifact retention is 30 days; **copy reviewed and accepted originals into retained repository or durable storage before expiry**. Never assume artifact availability beyond its expiry.

## Remaining acquisition priorities (not a quality audit)

- **P0/P1 exact source holes:** optional Luminous preaching and Transfiguration; particular Stations with no outstanding individually identifiable panel; Regina Cæli (need another source), Holy Souls, Saint Thérèse of Lisieux, Saint Anthony of Padua, exact Our Lady of Perpetual Help, Christ King.
- **Calendar feast specificity:** Palm Sunday, Holy Innocents, All Saints, All Souls, Saint John Baptist, Transfiguration, Sacred Heart and Holy Rosary. Seasonal Christ/Mary paintings are already valid **contextual** substitutes but cannot be falsely described as the day's feast painting.
- **Sacraments/Formation:** Holy Orders, Brown Scapular, Seven Sacraments and the papacy require careful iconographic/source matching. A landscape with `Saint-Joseph` in the geographical title is not an image of Saint Joseph.
- **Modern portraits:** Pius X, Leo XIII, Pius IX, Pius XI, John XXIII and local Blessed Jacques-Désiré Laval require historically credible actual portrait likeness plus reproducible public-domain rights; later fantasy devotional paintings are not automatically genuine portraits. The Saint Thérèse case requires attention to the artist and photo copyright.
- Source differences: occasional NGA search hits called "paintings" by automated descriptions were actually **woodcuts and coloured prints** (e.g. NGA `3668` Transfiguration, `3673` Palm Sunday), excluded after examining museum **medium**; Art Institute IIIF full originals sometimes return HTTP 403, keep lead without fabricating acquired original.
- Existing **symbolic** fallback art may be used for a prayer if labelled as contextual (Virgin and Child is not necessarily Our Lady of Perpetual Help or Immaculate Heart); it is not an exact-subject acquisition.

## Remaining phases (hard distinction)

1. **Finish subject-source acquisition** to the target minima and record genuinely unfillable themes as justified symbolic choices, each with a reliable source and rights. No inferior images to fill quota.
2. **Build observed-1962-date crosswalk** for entire 2024–2027, keeping principal feast versus appointed Gospel/Epistle versus seasonal fallback provenance separate.
3. **Only then artistic review:** masterpieces, authentic subject, colour/resolution/glare/frame, safe cropping, per-image commercial reuse, French/English caption, frontend phone/desktop and offline.
4. **Production:** work through the frozen asset bank without silently promoting research images; route through the canonical UI architecture, no new 1962 calendar or Mass implementation.

**Never declare acquisition complete merely because every calendar day can fall back to one generic Christ painting.** An exact target gap stays visible in the machine-readable report until source evidence genuinely closes it.
