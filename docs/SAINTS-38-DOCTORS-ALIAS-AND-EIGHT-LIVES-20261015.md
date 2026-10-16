# Saints of the Day — 38 Doctors' canonical identities and eight new holiness-first lives

15 October 2026 · Draft PR #1227 · Research and tests only; no production deployment or new 1962 celebrations.

## 1. Original ID and Calendar roster reconciliation

The fully recovered 311 components of the original frozen v43.33 Saints-of-the-Day art engine contain many Doctors under older `saint.*` names. The independent Calendar team already owns the **38 current Doctors** in `data/calendar/doctors-of-church-roster.review.v1.json`; never make a second canonical Doctor register.

Reproducible `tools/saints/reconcile-doctors-v4333-aliases.mjs` checks the Calendar person's **nominal 1962 MM-DD**, exact frozen **historical component person ID**, the original **Sanctoral source ID** and the Calendar source ID. Only explicit person aliases in `data/saints/1962-doctors-historical-id-alias-review.v1.json` are tested; a matching civil feast date without a person identity never merges same-day saints.

| Result | Doctor roster records | Meaning |
| --- | ---: | --- |
| Exact same `saint.*` person ID **and** same original source/date | **11** | Source-compatible, no new registry |
| Different historic/Calendar person ID; explicit alias, same exact source/date | **20** | Candidate alias, pending Calendar-owner acknowledgement |
| Historical-versus-current source colour disagrees; not auto-normalised | **3** | Augustine of Hippo, Alphonsus Liguori, Ephrem of Syria |
| No nominal 1962 source ID in current Doctor roster | **4** | John of Ávila, Hildegard of Bingen, Gregory of Narek, John Henry Newman |
| **Total** | **38** | No automatic name-only alias or liturgical mutation |

**Three source-code conflicts must be reviewed by the existing Calendar owner:**
- St Augustine of Hippo — nominal 28 August: `sancti:08-28:3:r` in frozen source, but `sancti:08-28:3:w` in Calendar Doctor roster.
- St Alphonsus Liguori — nominal 2 August: `sancti:08-02:3:r` versus `sancti:08-02:3:w`.
- St Ephrem of Syria — nominal 18 June: historical ID `saint.ephrem-of-syria`, current Doctor ID `saint.ephrem`, source `sancti:06-18:3:r` versus `sancti:06-18:3:w`.

These may reflect versioned source colour encoding, not different saints. Never replace the original IDs or alter the Calendar colour before source-authority adjudication. The 31 source-compatible results are **11 exact + 20 explicit aliases**, NOT 31 independently certified biographies. Four newer Doctor declarations have no claimed 1962 source; their modern honour is separately recorded without insertion into the old Missal.

The CI produces `saints-38-doctors-historical-id-review.json` next to the 311-row identity-audit result, and fails if anyone invents a 39th Doctor, silently treats a same-day companion as the Doctor, changes source values, or erases one of the three review holds.

## 2. Eight additional, substantive EN/FR Lives — staged but not published

`data/saints/holiness-first-eight-doctors-research-20261015.v1.json` now contains **eight bilingual short profiles**, each with an original editorial explanation of **why the person is holy**, **three separately attributed concrete deeds or teachings**, formal Doctor honour, descriptive role categories and direct Holy See reference links.

| Historical subject | Main editorial focus | Source |
| --- | --- | --- |
| Gregory the Great | Feeding the poor, peacemaking and humble pastoral government | Benedict XVI, general audiences 28 May / 4 June 2008 |
| John Chrysostom | Courageous preaching, charity institutions and exile | Benedict XVI, 19 / 26 September 2007 |
| Thomas Aquinas | Prayerful faith/reason theology, Dominican teaching and liturgical devotion | Benedict XVI, 2 / 16 June 2010 |
| Catherine of Siena | Caring for the sick, Church unity, reform and the Dialogue | Benedict XVI, 24 November 2010 |
| Francis de Sales | Pastoral gentleness, loving trust, spiritual direction and Visitandines | Benedict XVI, 2 March 2011 |
| Alphonsus Liguori | Evangelisation of the poor, Redemptorists, merciful moral theology | Benedict XVI, 30 March 2011 |
| Augustine of Hippo | Conversion, humility, communal prayer and continual revision of thought | Benedict XVI, 9 January / 27 February 2008 |
| Bonaventure | Franciscan poverty, contemplation, theological learning and prudent leadership | Benedict XVI, 3 / 17 March 2010 |

**24 fact claims**, source-by-source Vatican URL links, **two attributed private-revelation reports**:
- Thomas Aquinas: ancient biographical **locution** tradition associated with a crucifix. No automatic classification as a visual apparition or proven miracle.
- Catherine of Siena: reported mystical espousal and exchange-of-hearts **vision** cited from Raymond of Capua in the papal catechesis. Not presented as a compulsory object of Catholic faith.

Other profiles currently have **no individually documented extraordinary-event entries**; this does not prove absence of miracles, stigmata or visions. No miracles attributed to intercession at a shrine are silently misassigned as acts performed by the saint during life.

The eight Profiles are research only (`NOT_APP_VISIBLE`); they do not replace or duplicate the six reviewed native Explore biographies, alter the 1962 Calendar, create new physical map pins or approve artwork. This yields **6 existing native editorial pilot lives + 8 additional held life drafts**, not 14 certified app-visible profiles. Each of the eight requires a second person-level editorial review before promotion.

## 3. How to expand toward 30–50 without repetition

Next batches should prioritise **martyrs, charitable founders, missionaries, women mystics and pastors**, not merely additional Doctors. Reuse Calendar PR #1226's modern people, the canonical 311 historical instances and the relic/novena source registries; do not research an identity or life already fully drafted in another pipeline. Record each credible paranormal claim separately, not as a holiness score.

The Sacred Art W64 stream already owns two aesthetically five-rated portrait candidates for Thérèse and Margaret Mary; continue its original-object/reproduction/rights review and user exclusions, not another image-selection exercise.

**Release gate:** Saints 38-Doctor identity/8-life research CI must pass, source-owner approval of held source encodings, person-level copyedit, artwork owner checks, and live 390px UI QA. PR #1227 remains draft and unmerged.
