# Weiser's Handbook — batch 01: 45 historical custom observations

Primary source: Francis X. Weiser, S.J., *Handbook of Christian Feasts and Customs* (1958), https://www.fisheaters.com/srpdf/Weiser--ChristianFeastsandCustoms.pdf (public viewer) and https://www.scribd.com/document/447017805/Handbook-of-Christian-Feasts-and-Customs (online text). This is copyrighted research material, not an app-text licence.

## Scope
**45 research observations** in **five of 28 chapters** (printed pp. 3–59), categorized in `data/customs/research/weiser-handbook-inventory.v0.json`. These are NOT 45 missing features or 45 canonical customs.

| Chapter | Pages | Records |
|---|---|---|
| 1. Sundays | 3–17 | 8 |
| 2. Weekdays | 18–30 | 10 |
| 3. Ember Days | 31–37 | 9 |
| 4. Rogation Days | 38–48 | 7 |
| 5. Advent | 49–59 | 11 |

## Triage
* COVERED: 11
* ENRICH: 7
* CANDIDATE: 8
* REGIONAL: 12
* HISTORY_ONLY: 5
* EXCLUDE: 2

## Insights for editorial attention
* **Sunday sermon retelling** (p. 16) is a small optional household custom; cemetery prayer (p. 16) already has `DEAD-001`.
* **Ember Days** (pp. 31–37) are already in the 1962 Calendar. Enrich current entries with charity, prayers for priestly vocations, harvest and Holy Souls; keep superseded fasting requirements historical.
* **Rogations** (pp. 38–46): field prayer and rural house/farm processions are candidates for local contextual guidance, not additions to Mass liturgy. https://www.catholicculture.org/culture/liturgicalyear/activities/view.cfm?id=1307
* **Advent domestic life** (pp. 49–59): French manger straw, children's letters, Alpine household Marian and Joseph images, German Advent scenes and Mexican `Posadas`. Manger source crosscheck: https://www.catholicculture.org/culture/liturgicalyear/activities/view.cfm?id=955
* **Advent wreath** (pp. 54–55) originated among German Protestants and was subsequently adopted by Catholic families. Do not describe it as ancient Roman liturgy.
* **Exclude superstition** (luck associated with births, magical circles) and treat 1921 indulgences as historical only.

## Scope protection
Existing `data/customs/customs-atlas-seed.v1.json`, SOT-07, Calendar, Special Days, Mass and Pray remain unchanged. The separate [PR #1512](https://github.com/Fulcanelli13/ad-orientem/pull/1512) was open when this branch began; do not repeat its BLSS-002/003/004 integration here.

This is a **first-pass reconciliation**, not an editorial release. Page-anchored entries need a second check of actual ownership and source geography before publication. Pending chapters **6–12** (Nativity to Epiphany), **13–22** (Pre-Lent to Thanksgiving), and **23–28** (Marian and saints' customs). Important: Weiser's foreword says several relatively recent feasts (including Sacred Heart and Christ the King) were not covered as standalone folklore topics; supply these from other Catholic historical sources.

No contact, fees, downloading/redistribution of a copyrighted scan, or app prayer modules.
