# Prayer Corpus B20 — Practical occasional intercessions
28 October 2026. A compact reader under **Pray → Devotions & Novenas → Occasional intercessions**. It supports three real occasions, not a generic prayer-book catalogue.

| Need | Work / owner | Decision | Why |
| --- | --- | --- | --- |
| Someone is ill | *Prayer for a Sick Person*, F. X. Lasance, *With God* (1911), pp. 826–827 | Admit, historical English | Direct prayer for recovery subject to the sick person's spiritual welfare; Marian and St Joseph intercession; ordinary prayers conclude the form |
| Household/family | *Prayer to the Holy Family*, F. X. Lasance, *The Young Man's Guide* (1910), X, *Various Prayers* | Admit, historical English | Complete household prayer asking protection, assistance and perseverance; distinct from marriage blessing or a nine-day novena |
| Difficulty/adversity | *Ad te, beate Ioseph* / *To Thee, O Blessed Joseph* | **Reuse existing canonical** `devotion_ad_te_beate_ioseph` | Explicitly refers to tribulation, adversity and need; already has EN/FR/Latin. Do not multiply works merely for discoverability |
| Specific Infant Jesus healing request | Editorial AO-AQ-025 | Defer | A narrow devotional duplicate of general sickness prayer |
| 1857 *Raccolta* §§154–157 | Editorial AO-AQ-059 | Defer pending text collation | An index cluster is not one complete prayer and includes public calamity formulations not always appropriate personally |
| Holy Family novena | Editorial AO-AQ-069 | Defer | Too long for this occasional-use moment; a separate novena could be revisited if warranted |
| Baltimore prayers for the dying | Editorial AO-AQ-091 | Do not duplicate | Existing Good Death and bedside companions own those moments |

## Historical sources and source integrity
- Sick person: https://novenaregina.com/prayers/prayer-for-a-sick-person — identifies the historical work and pages; https://en.wikisource.org/wiki/With_God — contemporary print-era edition reference. The online transcription is a **digital witness**, not a fresh original page-image certification. `N.N.`, `his (or her)`, and the three final prayers are retained. No person name or medical information is saved.
- Holy Family: https://en.wikisource.org/wiki/The_young_man%27s_guide/X._VARIOUS_PRAYERS and https://en.wikisource.org/wiki/The_young_man%27s_guide — 1910 English original; the digital transcription is **not yet printed-image collation**.
- Difficulties: the exact existing canon `devotion_ad_te_beate_ioseph`, including existing EN, FR and Latin. The occasional reader references that one work; no additional copied translation or fourth work.
- Neither the old indulgence terms nor devotional outcomes are advertised as currently guaranteed. The Prayer reader does not replace professional care for an ill person or a priest's sacraments at the bedside.

## Integration and acceptance
- Exact internal route `pray.occasional_intercessions`; only one contextual button inside existing Devotions family. No additional family card in the frozen list; canonical 48 prayer objects remain unchanged.
- Three touch-sized choices. Two historical English source prayers are labelled as English when French UI is selected. The existing Joseph prayer renders in French in FR, and allows its existing Latin.
- Provenance stays in a disclosure, including explicit print-image uncertainty.
- B20 owner test checks distinct ownership, source gates, languages, exact route and runtime hooks. Existing B19 priestly and Good Death ownership must remain intact.
- Draft PR should remain **unmerged** until current-base tests and device UX checks are recorded; there is no claim here of CI passing or deployment.
