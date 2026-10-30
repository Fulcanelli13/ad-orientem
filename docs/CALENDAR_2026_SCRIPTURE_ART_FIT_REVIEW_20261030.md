# 2026 Mass Calendar × Scripture × Existing Sacred Art — Phase 1 registry

This is the **current editorial review source** for Ad Orientem, using the 1962 General Roman Calendar for 2026. Created 30 October 2026; **research branch only**, no production change.

## Registered coverage
- **365 / 365 days** with named feast/feria, weekday, season, liturgical rank, colour, commemorations/alternative observances and source state.
- **365 / 365 first reading/Epistle citations**, **365 / 365 Gospel/Passion citations**; many are sourced from the pinned upstream calendar but **not independently collated against every day's actual selected Latin Proper**.
- **13 days** carry separately ordered multi-reading material; special treatment for Palm Sunday, Holy Wednesday, Good Friday, Easter Vigil and all three Christmas Masses.
- **1,154 provisional day/artwork candidates** across **178 days**, maximum 20 shown per day; another **187 days** currently have no suggested candidate (this is NOT a confirmed gap after review).
- **15 days** with a preserved date-specific user editorial decision or more recent preference, including the supersession of Ugolino da Siena by Philippe de Champaigne for Holy Thursday.
- Current data: `data/calendar/2026-calendar-scripture-art-fit-v2.json` and `data/calendar/2026-calendar-art-fit-proposals-v2.csv`. Older v1 drafts in this branch are not the active review source.

## Verified source exceptions and scope limitations
Ambo's 2026 baseline is pinned to `igorlaguiar/ambo-liturgical-calendars@af4a22a4014e9a46cadafc4c2ede4aa784f5a6f2`, `data/v1/1962/general-roman/2026.json`. Baseline known issues corrected locally include:
- Palm Sunday distinguishes the Mass Passion from the Gospel at blessing palms.
- Holy Wednesday preserves **Isaias 62:11; 63:1–7** and the second **Isaias 53:1–12** lesson, with Luke Passion.
- Good Friday is a solemn **liturgical action** (not an ordinary Mass) with Osee, Exodus and Johannine Passion.
- Easter Vigil preserves **four ordered prophecies**, the Mass Epistle and Gospel.
- Nativity 25 Dec retains **three separate Mass formularies**.
- Pentecost 24 May and St Stephen 26 Dec corrected to **red**.
Before production, every row must be reconciled with the 1962 calendar's selected Proper source path and the Latin passage boundaries, especially local observances, transferred feasts, non-contiguous lessons and special rites.

## Four editorial stages (order locked)
1. **Broad fit**: user says whether a candidate artwork belongs on a date, and may suggest any alternate gallery artwork, with many-to-many placement allowed.
2. **Exact fit**: once broadly approved, inspect depiction, biblical scene identity, liturgical context, alternative first reading/Gospel, correct image original, and historical source selection.
3. **Confirmed gaps**: only after fit and exact-fit decisions, record genuine missing coverage, not mere mechanical absence of candidate suggestions.
4. **New research**: look up additional paintings only for the confirmed gaps.

Artwork proposals derive from existing 383 canonical and 989 operational Sacred Art Scripture indices, not new image discovery. Preserve original editorial approvals, rejections, art registry identities, photo-rights gates and 2026 Class I decisions. The Holy Thursday superseded Ugolino entry remains historical only.

No human fit decision has been imported or presumed. All artworks are **review suggestions**, not publication approvals.
