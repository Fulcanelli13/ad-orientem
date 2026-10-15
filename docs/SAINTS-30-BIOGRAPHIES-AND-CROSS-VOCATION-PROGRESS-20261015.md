# Map of Saints — 30 distinct holiness-first Lives, cross-vocation first-pass research

15 October 2026 · [Saints draft PR #1227](https://github.com/Fulcanelli13/ad-orientem/pull/1227)

## Scope and completed evidence

The existing original Ad Orientem Map of Saints remains the **single native Explore lens**, with six source-backed bilingual initial pilot people, nine linked existing Places and eight geolocatable sites. Those six have native usability/phone QA; this phase does not change them.

The new source-reviewed data now supports **30 distinct PERSON biography records** across three original-owner research files, checked together for duplicated IDs by `tests/saints-thirty-life-owner-census.mjs`:

| Research source | Unique lives | Source-linked concrete fact summaries | App research status |
| --- | ---: | ---: | --- |
| `data/saints/holiness-first-editorial-pilot-20261015.v1.json` | 6 | 18 | Existing six native Explore **draft** biographies |
| `data/saints/holiness-first-eight-doctors-research-20261015.v1.json` | 8 | 24 | Research drafts only |
| `data/saints/holiness-first-sixteen-cross-vocation-research.v1.json` | **16** | **48** | Research drafts only, subject and source review still required |
| **TOTAL** | **30 distinct people** | **90** | **0 published to GitHub Pages by this PR** |

The 30 documents record **six carefully attributed extraordinary account entries**, not a miracle score or assertion that the remaining 24 performed no miracles. In the six-person pilot these include Bernadette's Marian apparition report and Margaret Mary's reported visions of Christ. The eight Doctors' research has two other traditionally attributed experiences (Thomas Aquinas's locution and Catherine of Siena's vision), and the sixteen diverse lives add Francis of Assisi's stigmata tradition and Faustina's reported Christ vision. Every entry has a specific Holy See text and differentiates visual apparition, locution and stigmata. A healing attributed to the saint's intercession is distinct from a personal action during life.

The sixteen new lives, chosen to avoid an all-Doctors catalogue:

| Area | Distinct subjects |
| --- | --- |
| Historical pastors, founders and charity | Vincent de Paul, Louise de Marillac, John Bosco, John Mary Vianney, Francis of Assisi, Charles Borromeo |
| Missionaries | Francis Xavier, Damien of Molokai |
| Martyrs | Ignatius of Antioch, Maximilian Kolbe, Maria Goretti, Teresa Benedicta of the Cross (Edith Stein) |
| Women mystics and charitable founders | Rose of Lima, Faustina Kowalska, Elizabeth Ann Seton, Jeanne Jugan |

Cross-category subjects intentionally appear under **one canonical person record**; categories are facets rather than separate databases. In particular, Damien is both a missionary and a pastor, while the martyr category describes witness in death rather than a supernatural faculty. One person may also be a pastor, theologian, spiritual writer, missionary and founder, as appropriate.

## Editorial and provenance rules

Each new life has one original EN/FR paragraph **why this person is holy**, with three discrete EN/FR historical or pastoral acts, and the specific original Holy See catechesis, papal message, homily or liturgical biography attached to the fact. **All 48 new claims are structurally source-linked and QA-checked**, but still require *second-person historical copyedit* and theological review before app publication. CI is not a substitute for expert source adjudication.

- **Seven new subjects** have precise same-ID/date correspondences to the **original v43.33 311 historical Saints-art-component ledger**. This proves recovery of an old *visual identity*, not that a specific saint's universal 1962 feast was observed every year.
- **Five newly drafted subjects** have exact person IDs in Calendar PR #1226's official post-1960 canonization index: Kolbe, Damien of Molokai, Edith Stein, Elizabeth Ann Seton, Jeanne Jugan. Faustina has an explicit **2000 canonization homily**, but is not auto-inserted as a new 1962 feast or synthesized into a missing record in that *partial* modern-owner index.
- **St Maria Goretti, St Francis of Assisi and St Louise de Marillac** do not gain a false negative “no 1962 feast” merely because the historical *Saints artwork component* source did not include their names; Calendar is the only canonical liturgical owner.
- **Blessed Jacques-Désiré Laval remains BEATIFIED_NOT_CANONIZED** and distinct from canonized François de Montmorency-Laval. Collective martyr groups remain groups and do not create unnecessary thousand-member dossiers.
- Every `artwork_master_id` is null for the 16 new drafts, and no Place pins are created. Reuse existing user five-star originals when W64/W65 explicitly links an artwork to the correct person, with object/photo identity, image reproduction rights and crop verified **within the existing Art pipeline**. No new permission outreach and no repeated user re-rating.
- The existing 1962 Calendar, Proper, commemoration priorities and 65-card Mass remain unchanged; later Saints are supplementary *Also honoured / Saints Atlas* discoverability only, not a newly invented liturgical Mass.

## Classification and visual information architecture

The updated Saints taxonomy supports Doctor, theologian, bishop, priest, pastor, founder, missionary, martyr, spiritual director, mystic, visionary witness, contemplative, charitable service, writer and historical Virgin descriptors. Formal Doctor honours are distinct from non-canonical vocation facets. The 16 new people have several explicitly sourced role facets and **two opt-in extraordinary-event records** rather than eye-catching miracle counts. Once copyedited they should appear in the native Saints lens using compact multiselect category filters; keep the historical Calendar rank and modern supplemental lives as independent criteria. The existing six-person map continues working with source-backed Places; adding a biography does not add a pin without a distinct credible real Place and source relationship.

## QA and release status

The 311 original identity audit, 38 Doctor alias audit, eight Doctor biography checks, sixteen broader biography checks, **30-person unique census**, native Saints phone+desktop journey and required main gate run as independent CI jobs. The [30-person audit](https://github.com/Fulcanelli13/ad-orientem/actions/runs/38743721699) emits `saints-30-holiness-first-person-census.json` with 30 actual IDs and their status, 90 linked facts, six qualified extraordinary accounts and **0** new published artworks/pins/profiles.

**Next logical editorial work:** second-person source review and linking additional already-rated original artwork masters, followed by an intentionally small staged native UI increment. The **30–50 research target has reached its first milestone**; this is not a claim of full Sanctoral, sacramental or artwork certification.

This PR is still **draft and unmerged**, and production GitHub Pages remains untouched.
