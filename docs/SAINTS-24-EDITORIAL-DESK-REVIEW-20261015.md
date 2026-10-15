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
