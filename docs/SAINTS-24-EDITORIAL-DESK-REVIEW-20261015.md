# Saints — first editorial desk review of the 24 held lives

15 October 2026 · PR #1227 · non-public research stage

## Outcome

All **24** previously held distinct persons have now been examined as *individual* editorial subjects against the existing source-linked biography files. This is a **desk review by the research pipeline**, not a second human editor's certification and not publication approval.

| Criterion | Result |
| --- | ---: |
| Held biographies covered by specific review record | 24 / 24 |
| Direct primary-source spot checks made | 11 |
| Still requiring deeper source verification | 13 |
| Bilingual narrative revisions to support the approved compact reader | 6 |
| Biographies still under 110 English words (joined holiness paragraph + three fact claims) | 19 |
| Biographies released to the native Explore Saints lens from this batch | 0 |
| Human second-editor approved biographies from this batch | 0 |
| Newly approved artwork, feasts, Mass options and pins | 0 |

The authoritative person facts, date/source links, identity and tags remain in the **two original research files**. The single companion register `data/saints/held-24-editorial-desk-review.v1.json` stores review decisions and unresolved editorial points keyed by their existing person IDs; it is not a fourth saint catalogue.

## Six bilingual profiles revised against cited sources

- **Thomas Aquinas:** includes preaching outside the university and Eucharistic liturgical texts for Corpus Christi, alongside reason and revelation; retains the attributed locution as a distinct tradition. Benedict XVI, 2 June 2010.
- **Catherine of Siena:** situates her spiritual guidance, charitable work and reform alongside her Dominican tertiary vocation; 1970 Doctor proclamation remains historically dated, and reported mystical accounts are attributed to Raymond of Capua. Benedict XVI, 24 Nov 2010.
- **Ignatius of Antioch:** strengthens the historical importance of his letters, defence of Christ's humanity and early usage of *Catholic Church*. He is **not** assigned the formal Doctor of the Church honour because the Pope's "Doctor of Unity" is a description. Benedict XVI, 14 Mar 2007.
- **Francis of Assisi:** replaces a duplicate stigmata fact with the independently relevant 1219 visit to Sultan al-Kamil and expands his Eucharistic/fraternal vocation. The 1224 stigmata account remains source-attributed. Benedict XVI, 27 Jan 2010.
- **Maximilian Kolbe:** clarifies the starvation bunker and fatal phenol injection, and includes the Militia Immaculatae and print apostolate in Poland and Japan from Paul VI's 1971 Angelus and Benedict XVI's 2008 account. No pictures or museum photographs are imported.
- **Jeanne Jugan:** more clearly explains care for the elderly, institutional expansion and the years of hidden service. The Holy See page's defective top heading '(1839–1894)' must not overwrite the body-supported **1792–1879** chronology.

Each source-backed fact and translation remains under editorial review; no direct narrative from the cited biographies is copied into the application.

## Precision and important holds

1. **History is not inferred from a feast date.** Ignatius' birth is unknown; Francis Xavier's death date is reported as 2 or 3 December 1552; Vincent de Paul's birth date/year is contested; Louise de Marillac's birthplace is disputed; Edith Stein's exact death day is probable, not certain.
2. **A place's shrine link does not imply birth, death or relic location.** Saints Atlas uses existing verified physical Places only.
3. **Distinct types of religious testimony remain distinct:** stigmata, visions and locutions are attributed and not made into miracle counts or doctrines.
4. **Doctor titles have dates.** Catherine's proclamation as Doctor in 1970 cannot be retrospectively called a Doctor designation *in* the 1962 calendar.
5. **The traditional Calendar remains the liturgical owner.** A modern canonization or a person present in the old Saints artwork library does not establish a universal 1962 feast, rank or Mass.
6. **The Sacred Art pipeline retains the art source of truth and the user's existing ratings**; portraits stay unbound until exact certified usable open reproductions are available, without permissions outreach.

## Remaining work before native integration

The next pass should take the other **18** held biographies through source-level paragraph strengthening in both languages, while resolving specific factual holds from the machine-readable review record. The first six revised lives are **not** automatically accepted as definitive biographies: run exact claim-to-source and language copyediting before integration.

The approved native compact layout remains the model: portrait area, formal name and vocation, born/date/place, died/date/place, appropriately scoped celebration, continuous 110–150-word holiness-first biography, and external-only 'Read further'. Do not create empty topical panels.

This phase affects only research and QA on draft PR #1227. Public GitHub Pages and other owner pipelines are untouched.


## Phase 14 — all remaining 18 biographies expanded, source-anchored research (15 Oct 2026)

This section supersedes the **six revised / 19 under-target** *length* figures in the historical Phase 13 snapshot above. It does not retroactively turn a desk review into editorial acceptance.

- The remaining **6 Doctors** and **12 cross-vocation Saints** have now been revised in the original two research source files; **all 24/24** English biographies meet the 110–150-word working target when the holiness-led paragraph and three recorded concrete facts are read together. The French accounts have also been expanded and are protected by bilingual minimum-length tests.
- Each of the 18 new substantive revisions carries a person-specific `editorial_expansion` field with existing source IDs/URLs and an explicit **not approved** review state. The first six revised in Phase 13 retain their prior review entries, likewise still not approved.
- Source-linked new details include Gregory sending Augustine to England; Chrysostom's exile and support for the poor; Alphonsus's evening chapels; Augustine's ongoing conversion and *Revisions*; Bonaventure's *Journey of the Mind into God*; Francis Xavier's India/Moluccas/Japan mission and unrealised mainland-China plan; Vianney's Eucharistic life and long confessional ministry; Louise's supervision of the Daughters of Charity; Faustina's *Diary* presented distinctly from doctrine; and Edith Stein's deportation with her sister Rosa.
- Quality guard: **meeting a word-count target is not source verification, human editorial acceptance, or an instruction to pad text.** The current joined `why_honoured` + three fact claims must still be copyedited for repetitions, precise source-to-clause match and natural EN/FR prose. The 13 previously held for deeper source adjudication stay held. Earlier uncertain dates/places and any historical 1962 versus later feast disagreements remain unresolved unless their respective owner approves.
- No changes to Calendar, 1962 rubrics, Mass selection, app-visible Saints, map pins, individual artwork ratings, art licenses, or public Pages.

Dedicated 8-Doctor, 16-vocation and 30-person QA asserts the expanded records and keeps all 24 profiles `NOT_APP_VISIBLE` / `eligible_for_publication:false`.

**Next substantive editorial gate:** settle sentence-level source and translation issues, resolve high-priority chronology exceptions (especially disputed birth/death facts), and eliminate overlapping claims before any of the 24 profiles reaches the native reader. The native six-person card layout remains the implementation reference.

## Phase 15 — source-level check of 13 deeper-held lives and clean reader copy

15 October 2026 · PR #1227 · **research edits only, no second-editor certification**

### What changed

All **13** biographies previously marked for deeper inspection now have a separate `reader_biography.en/fr` field within their ORIGINAL owning research record. This is a coherent, self-contained account for the approved compact Saint profile, NOT another set of canonical identity records. It avoids appending the older `why_honoured` paragraph and three individual research facts together, which had introduced repetitive wording. The earlier `why_honoured` and sourced facts remain intact for auditing rather than being rendered as a second biography.

- Doctors (5): John Chrysostom; Francis de Sales; Alphonsus Liguori; Augustine of Hippo; Bonaventure.
- Cross-vocation Saints (8): Vincent de Paul; John Bosco; Charles Borromeo; Maximilian Kolbe; Damien of Molokai; Louise de Marillac; Faustina Kowalska; Elizabeth Ann Seton.

Primary texts were directly inspected for all 13; the linked research reviewer entry records the exact source and the fact checked. **This is not a claim that all 13 biographies have passed sentence-level historical verification.** The remaining **11** held biographies still need the same nonrepetitive reader-copy transformation. Every one of the **24** is still editorially unapproved and not app-visible.

### Verified adjustments and remaining distinctions

| Saint | Source check / resolution | Remaining hold |
| --- | --- | --- |
| John Chrysostom | Benedict XVI, 26 Sep 2007, corroborated by independent Catholic biographical reference: **forced** exile; death at Comana in Pontus, 14 Sep 407 | Final bilingual copyedit |
| Francis de Sales | Benedict XVI, 2 Mar 2011: spiritual crisis, 1593 ordination, 1602 episcopacy and Annecy, lay holiness and Visitation | Final bilingual copyedit; dates from existing linked document |
| Alphonsus Liguori | Benedict XVI, 30 Mar 2011, and Redemptorist biography: evening chapels, pastoral moral theology; born Marianella, died Pagani | Final bilingual copyedit |
| Augustine | Benedict XVI, 27 Feb 2008: baptism in 387 was a milestone, not a completed single-stage conversion | Preserve Tagaste/Hippo separate geography |
| Bonaventure | Benedict XVI, 17 Mar 2010: Journey of the Mind into God; contemplative theology and death during Lyon council | Birth year remains approximate |
| Vincent de Paul | 2017 Vatican message: mission, poor and priestly formation; Vincentian scholarly chronological dictionary and historical Coste discussion disagree on birth day/year | **Keep birth date contested**, never a fake precise ISO |
| John Bosco | Pope Francis, 21 Jun 2015: Turin street beginnings and travelling oratory; Salesian founder chronology supports date and Castelnuovo | Avoid unsourced precise hamlet |
| Charles Borromeo | Benedict XVI, 2010 letter: seminaries and charity in plague of 1576; independent historical biographies corroborate dates and Arona/Milan | Final bilingual copyedit |
| Maximilian Kolbe | Benedict XVI, 13 Aug 2008, and Auschwitz-Birkenau State Museum: substituted for another prisoner, died after starvation bunker by phenol injection, 14 Aug 1941 | Respectful tone; source distinctions |
| Damien de Veuster | Vatican canonization biography: volunteered in 1873 and remained at Kalaupapa, dying in 1889 | Avoid collapsing forced Hawaiian settlement into birthplace |
| Louise de Marillac | *Dilexi te* §51 and the Daughters of Charity: actual formation/leadership and 1657 letter | **Birthplace disputed (Paris vs Le Meux)** |
| Faustina | John Paul II, 30 Apr 2000: Diary, two rays and active Christian mercy | Distinguish attributed private experience from doctrine; no invented 1962 feast |
| Elizabeth Ann Seton | Paul VI, 14 Sep 1975: wife, mother, widow, convert and religious; Daughters of Charity original family paper archive | Final direct document-level review for individual life events |

### Quality gates retained

- Research source files keep 30 unique person IDs; zero new place markers, zero app-visible held Saints, zero approved portraits, zero publication changes.
- 13 standalone bilingual reader paragraphs each keep their independent source references. The current native Explore pilot remains **only six** biographies.
- All 13 have a `reader_biography.editorial_status=SOURCE_CHECKED_READER_DRAFT_NOT_SECOND_EDITOR_APPROVED` lock. The reviewer register explicitly requires **line-by-line copy and source adjudication** before release, even though page-level primary documents were inspected.
- Existing six reported extraordinary-event claims stay separate and appropriately attributed. There is no private revelation or miracle score.
- Calendar remains sole owner of traditional/modern feast claims and Mass/Proper decisions; Sacred Art remains sole owner of artwork metadata and existing user aesthetic ratings. No permission outreach.
- Next: prepare clean text for the other 11 and then compare all 24 bilingual accounts to the final primary-source evidence.

### Source anchors

- John Chrysostom: https://www.vatican.va/content/benedict-xvi/en/audiences/2007/documents/hf_ben-xvi_aud_20070926.html
- Francis de Sales: https://www.vatican.va/content/benedict-xvi/en/audiences/2011/documents/hf_ben-xvi_aud_20110302.html
- Vincent de Paul: https://wiki.famvin.org/en/Chronological_Dictionary_of_Vincent%27s_Life/Chapter_01
- Kolbe: https://www.auschwitz.org/en/museum/news/sixty-ninth-anniversary-of-the-death-of-st-maximilian-kolbe,723.html
- Louise: https://press.vatican.va/content/salastampa/en/bollettino/pubblico/2025/10/09/251009h.html
- Seton: https://via.library.depaul.edu/seton_family_papers/

The complete source links for all other records are stored in each saint's original `source_urls` and `reader_biography.source_urls` fields.


## Phase 16 — remaining 11 standalone Saints biographies complete (15 October 2026)

The final **11** held people now have complete, bilingual `reader_biography.en/fr` records in the **existing** 8-Doctor and 16-vocation research sources. This finishes the non-repetitive *reader-copy drafting* pass for **24/24 held people**.

New reader texts this phase: Gregory the Great; Thomas Aquinas; Catherine of Siena; Ignatius of Antioch; Francis Xavier; John Mary Vianney; Rose of Lima; Francis of Assisi; Maria Goretti; Teresa Benedicta of the Cross (Edith Stein); Jeanne Jugan.

Sources were checked against their original papal general audiences, letters, messages or Holy See saint biographies. Illustrative integrity controls:
- Gregory's `Pastoral Rule`, famine relief, Lombard peace efforts and Augustine's English mission all appear in Benedict XVI's two catecheses of May–June 2008.
- Urban IV commissioned Aquinas for the feast of Corpus Christi; Thomas's alleged locution remains a separately attributed historical devotional report.
- Catherine's deeds for the sick, appeals for Gregory XI's return and writings precede her distinct **1970** Doctor designation. Her reported mystical espousal belongs to Raymond of Capua's attributed testimony.
- Ignatius's seven letters and the early term *Catholic Church* are from the 14 March 2007 papal catechesis; **Doctor of Unity** is descriptive, not a formal Doctor of the Church title; birthplace unknown and martyrdom date traditional.
- Francis Xavier's catechism in local languages, Japan journey and death at Shangchuan without landing in mainland China are documented. **2 or 3 December 1552 remains disputed**.
- Vianney's extended confessional ministry and Eucharistic life are source supported.
- Rose of Lima is principally represented through prayer and care for the sick/poor rather than invented miracle counts.
- Francis of Assisi's 1219 meeting with al-Kamil and reported 1224 La Verna stigmata remain carefully attributed.
- Maria Goretti's assault at Le Ferriere is not confused with her **6 July 1902** death in a Nettuno hospital. Her pardon is not depicted as excusing the attacker or violence.
- Edith Stein's deportation with Rosa and murder at Auschwitz are presented without inventing certainty about the precise killing date.
- Jeanne Jugan's **1792–1879** dates come from the body of the Vatican biography; its misleading search/page-title lifespan is NOT transcribed.

### Evidence and editorial status

| Measure | After Phase 16 |
| --- | ---: |
| Research lives (unique Saints/Blessed persons) | 30 |
| Native pilot biographies, unchanged and draft | 6 |
| Held research biographies with self-contained EN/FR reader prose | **24/24** |
| Earlier 13 deeper-held profiles now source-reviewed with their own reader texts | 13 |
| Last 11 profiles newly converted into reader text | 11 |
| Subject-specific research review records | 24/24 |
| Second-editor certified / published from this research batch | **0** |
| New map sites, saints promoted into 1962 sanctoral, or new approved artworks | **0** |

The older `why_honoured` and three claim-linked fact records are retained **only as research evidence**. They must **not** be rendered as a second series of paragraphs or expandable 'Read more' within the profile. The user-approved profile instead displays the single continuous narrative and reserves 'Read further' for external biographies.

Human/editorial certification is **not implied** by passing word-count, source-link or syntax checks. All 24 remain research-only, all 24 require a final EN/FR sentence-to-source copyedit, and exceptional dates/places remain explicitly qualified. Artwork selection and feast observances are owned by the pre-existing Art and Calendar pipelines. Public Pages unchanged.


## Phase 17 — source-owned expansion beyond 30 biographies (15 October 2026)

User direction: move on from repetitive historical biography reviews to **working application coverage**. The existing native Saints section now offers separate source-based browse lists:

| Native Saints list section | Recorded coverage | Editorial meaning |
| --- | ---: | --- |
| Complete profile-shaped bilingual research lives | **30** | Six original Place-backed pilots + 24 source-linked drafts, no artwork promotion |
| Historical sanctoral archive | **307 distinct source-subject IDs** from **311 components / 252 dates** | Archive index, **not** 307 unique canonized people or current observed feast rulings |
| Official post-1960 canonization reference | **258 named people + 13 group records** | Source-index identification, not fabricated lives or inserted 1962 observances |
| Doctors of the Church owner-roster | **38 source roster records** | Integrated read-only source bridge; titles and dates stay Calendar-owned |
| Sacred Art five-star leads for first six | **2 candidate paintings** | User score retained; neither reproduction is approved to display |

The shared read-only snapshot is `data/saints/read-only-calendar-art-index-20261015.v1.json`. It embeds the exact original Git blob SHAs and source branch IDs for the historical archive (Saints owner), the Calendar Doctors and post-1960 canonization registries (PR #1226), and Sacred Art five-star candidates (PR #1231). This is a **reproducible derived view**, not another canonical inventory: update/reconcile it when its owner sources advance.

### What the user sees in the draft app

In Explore > Saints > List, the source-provenance tabs are **30 biographies**, **Historical sanctoral**, and **Later canonizations**. Opening a source-only reference shows the exact source name, archived subject date or canonization date, group description where the Calendar owner supplied one, and original official links for post-1960 canonizations. It **does not show** invented birthplaces, holiness biographies, fake portraits, feast ranks or map pins. The earlier category chips operate only within the 30 actual biography profiles.

The Explore > Saints > Map still uses the source-owned nine physical sites / eight published-precision pins, with the original six profiles linked to their associated Places. Historical subjects, newly canonized names and martyr collectives do not generate map points.

The test `tests/saints-source-index.mjs` asserts exact **307**, **258+13**, **38**, **2** counts, unique references, scope rendering in EN/FR, no artwork or new pins, and no mass/feast inference. The established `tests/saints-catalogue-native.mjs` continues to protect the 30-profile catalogue.

### Next integration boundary

As source-owner projects deliver a source-backed life, an exact identity link, Calendar observance or an approved reproduction, attach it to that *one* canonical person's reader entry. Do not backfill biographies through AI prose, repeat the user's artwork ratings, or infer personal identities from saint names/regions/groups. No permissions requests. No unrelated pipeline mutation, PR auto-merge, or GitHub Pages release from this work.


## Phase 18 — exact-ID navigation across Saints, Calendar and source records

15 October 2026 · Native Explore implementation on existing draft PR #1227.

The **30 reading profiles** now carry buttons to their genuinely matching **historical sanctoral source**, **post-1960 official canonization record**, or **38-Doctor roster record**. The relation is made **only** when the underlying source IDs are exactly the same; similarity of names, historical artwork labels, shared dates and proposed aliases do not establish an identity. Each source-only record has a reverse **Read the full Saints profile** button when it has an exact native profile owner.

| Cross-reference | Exact profile matches |
| --- | ---: |
| Historical source subject to full reader | 13 |
| Later official canonization record to reader | 6 |
| Doctor of the Church roster to reader | 8 |
| Distinct of 30 reader profiles with any exact match | **22** |
| Combined exact buttons across the 30 profiles | **27** |

The **Doctors (38)** list is a dedicated fourth Saints source-reference tab, distinct from the existing 30 biography list and the user-approved Doctor category filter. New Doctor titles declared after 1962 remain **post-1962**, even if an older Mass calendar already commemorated that person; source index entries are not newly assigned feast observances.

Native Saint profile cards now display **Open this date in Calendar** only when the pre-existing identity bridge supplies a verified, actually observed **2026** civil date and original source ID. Archived nominal dates and modern canonization dates **never** trigger that handoff. The existing standard Explore-to-Calendar shell route is reused, with source-authority failure handling, rather than introducing another calendar engine.

Navigation is fully delegated and validates each proposed target against the currently projected canonical record list. It clears stale search and filter state, does not open unknown IDs, and returns exactly to a source record or biography. This has no change to any map pin, artwork approval, user's artwork ratings or Mass/Proper assignment.

CI now checks 13+6+8 exact links, 22 unique matched readers, 38 Doctor titles and historically scoped declarations. Phone/desktop Playwright acceptance also clicks Doctor → full biography → historic source → full biography. This is **feature implementation**, not another research or approval round.

The no-auto-promotion policy remains. PR #1227 is draft/unmerged, and public Pages remains unchanged.
