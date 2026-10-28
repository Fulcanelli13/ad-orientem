# Ad Orientem — ICKSP/ICRSP Pray Audit, Unified 25-module Implementation Register

**Snapshot:** 28 October 2026. **Status:** audit / merge-coordination master, not a deployment. **Canonical data source:** `data/pray/icksp-module-implementation-master.v1.json`. **Implementation source:** current public `Fulcanelli13/ad-orientem` with private `Fulcanelli13/folio-core` as an independently owned canonical workflow.

## Scope and limitations

The current `prayFamilies()` hub contains 25 unique module cards after de-duplicating the repeated Holy Rosary tile. Each was reviewed in one of five editorial ICKSP/ICRSP batches. This register **does not** claim that the entire Prayer Library, every canonical prayer text, full Office, Mass Propers, special rites, connected Customs or every ICKSP/ICRSP resource has been audited. The initial 25 Institute-selected source records and the 98 French Office subsection index records are not simply additive new prayers.

**25/25 researched. 10 modules covered by open implementation PRs; 2 partially staged in open PRs; 13 research-only. 0 of the 25 module audit actions is counted as production-release-certified in this consolidated review.** Existing live module baselines are of course in production and several unrelated/current daily-prayer improvements have previously merged; they are not counted as completion of pending audit actions.

**Priority:** 3 P0, 17 P1, 5 P2.

## GitHub reconciliation: accurate source of truth

- **Batch 1, private implementation:** `Fulcanelli13/folio-core` PR [#59](https://github.com/Fulcanelli13/folio-core/pull/59) is **open, non-draft, not merged**. Claims all five Batch 1 fixes; exact 1913/Hagan source and real-phone acceptance remain held. It must not be equated with public `main`.
- **Public ICKSP compilation:** `Fulcanelli13/ad-orientem` [PR #1800](https://github.com/Fulcanelli13/ad-orientem/pull/1800) is **open draft, not merged**, but now contains **implementation code**, not just research: Marian protection and priest readers, Divine Infant King repeat-form novena, source-linked St Thérèse forms and original 1925 printed prayer, and **eight Latin recensions in seven ICRSP seasonal-hymn groups**. The staged hymn reader has **11 total entries** (3 original + 8 Latin). A test being written or a smoke check is not a full Node/Playwright acceptance. Do **not** redo those features as if nothing had been started.
- **Batch 2 implementation:** [PR #1813](https://github.com/Fulcanelli13/ad-orientem/pull/1813) is **open, non-draft, not merged**. It implements changes for five modules including Benediction P0, Adoration witnesses, Divine Mercy optional source links, Forty Hours optional solemn navigator, and Rosary method provenance. It explicitly holds complete phone/rubrical acceptance and non-public-domain translations. Read it before editing any of its 19 changed files.
- **Batch 1 adjacent ongoing:** [PR #1818](https://github.com/Fulcanelli13/ad-orientem/pull/1818) is **open draft**, adding historical English bedtime material without changing full Compline. Other recent daily-prayer changes **#1799, #1810, #1814 and #1816 were merged**, but this is not evidence that #59, #1800 or #1818 were merged or that all historical source gates passed.
- **Research snapshots:** [#1806](https://github.com/Fulcanelli13/ad-orientem/pull/1806), [#1808](https://github.com/Fulcanelli13/ad-orientem/pull/1808), [#1812](https://github.com/Fulcanelli13/ad-orientem/pull/1812), and [#1817](https://github.com/Fulcanelli13/ad-orientem/pull/1817) are open, separate, research-only draft PRs for Batches 2–5. The first five Batch 1 module audit is inside #1800.

Each PR may advance after this snapshot. Before merge, query GitHub afresh. Do not treat overlapping PR counts as distinct new prayer items or deployed changes.

## Progress by audit batch

| Batch | Audited | Open implementation | Partial implementation | Research-only | Research PR |
|---|---:|---:|---:|---:|---:|
| 1 | 5 | 5 | 0 | 0 | 1800 |
| 2 | 5 | 5 | 0 | 0 | 1806 |
| 3 | 5 | 0 | 0 | 5 | 1808 |
| 4 | 5 | 0 | 1 | 4 | 1812 |
| 5 | 5 | 0 | 1 | 4 | 1817 |
| **TOTAL** | **25** | **10** | **2** | **13** | — |

## All module states

| Order | Stable module ID | Batch | Priority | Implementation stage | PR evidence |
|---:|---|---:|---|---|---|
| 01 | `pray.morning_evening` | 1 | **P1** | Open implementation PR | folio-core #59, #1800, #1818 |
| 02 | `pray.angelus_regina` | 1 | **P2** | Open implementation PR | folio-core #59, #1800 |
| 03 | `pray.rosary` | 1 | **P2** | Open implementation PR | folio-core #59 |
| 04 | `pray.meal_prayers` | 1 | **P1** | Open implementation PR | folio-core #59 |
| 05 | `pray.nightly_examen` | 1 | **P1** | Open implementation PR | folio-core #59, #1818 |
| 06 | `pray.rosary_methods` | 2 | **P2** | Open implementation PR | #1813 |
| 07 | `pray.divine_mercy` | 2 | **P1** | Open implementation PR | #1813 |
| 08 | `pray.adoration` | 2 | **P1** | Open implementation PR | #1813, #1800 |
| 09 | `pray.benediction` | 2 | **P0** | Open implementation PR | #1813 |
| 10 | `pray.forty_hours` | 2 | **P1** | Open implementation PR | #1813 |
| 11 | `pray.communion_treasury` | 3 | **P1** | Research only | #1808 |
| 12 | `pray.confession` | 3 | **P1** | Research only | #1808, folio-core #59 |
| 13 | `pray.penitential_psalms` | 3 | **P1** | Research only | #1808 |
| 14 | `pray.litany_saints` | 3 | **P0** | Research only | #1808 |
| 15 | `pray.stations` | 3 | **P1** | Research only | #1808 |
| 16 | `pray.seven_words` | 4 | **P1** | Research only | #1812 |
| 17 | `pray.tenebrae` | 4 | **P1** | Research only | #1812 |
| 18 | `pray.novenas` | 4 | **P1** | Partially staged | #1800, #1812 |
| 19 | `programme.first_friday` | 4 | **P2** | Research only | #1812 |
| 20 | `programme.first_saturday` | 4 | **P1** | Research only | #1812 |
| 21 | `pray.sacred_heart` | 5 | **P1** | Research only | #1817, #1800, #1813 |
| 22 | `pray.holy_name_litany` | 5 | **P2** | Research only | #1817 |
| 23 | `pray.sacred_hymns` | 5 | **P1** | Partially staged | #1800, #1817 |
| 24 | `pray.good_death` | 5 | **P0** | Research only | #1817 |
| 25 | `pray.dying_companion` | 5 | **P1** | Research only | #1817 |

**State semantics:** “Open implementation PR” refers to proposed unmerged code; “Partially staged” refers to an unmerged subset of the agreed work; “Research only” means no active implementation PR positively identified for that batch's principal action. No row is marked published/validated by this master; it never downgrades already-present base-module functionality.

## Three P0 corrections

- **`pray.benediction` (2)**: Fix French Christ-address collect, seasonally appropriate Panem de caelo Alleluia, explicit Christ the King options and local ICKSP witness links. **Current gate:** Historical exact 1962 rubric and complete phone/bilingual acceptance; unverified chant variants held.
- **`pray.litany_saints` (3)**: Provide attested liturgical Latin and properly verified EN/FR; separate private historical litany from Rogations, Easter Vigil and Forty Hours. **Current gate:** Existing EN 1883 and FR Corneille 1862 are distinct uncollated witnesses; exact 1962 liturgical recension and rights not yet cleared.
- **`pray.good_death` (5)**: Restore independently collated 1909/preconciliar Litany of St Joseph as historical default and retain distinct 2021 expanded identity. **Current gate:** Existing current Litany contains 2021 invocations (Custos Redemptoris, Patrone exsulum, etc.); 1909 and historical EN/FR must be collated rather than deleting lines blindly.

### Priority implementation policy

1. Safely finish and verify **Benediction P0** from #1813, with actual 1962-seasonal and multilingual testing. The existing seven-stage reader and other Batch 2 features must remain.
2. Resolve the **St Joseph Litany edition mismatch** in Good Death. Current `devotion_litany_st_joseph` contains the **2021 expanded** invocations while the traditional nine-stage experience presents it without a historical chooser. Restore attested 1909 preconciliar text as source-verified default and preserve the later recension as separately named; never simply delete lines or manufacture translations.
3. Source-collate and locally preserve the **Litany of the Saints** with historically distinguished Latin/English/French liturgical editions, and never conflate the English 1883 private source, French 1862 Corneille translation, Rogations, Easter Vigil, or Forty Hours proper prayers.

The Good Death and Litany P0 work should be sourced in distinct implementation PRs off updated `main`, with a single owner for each shared text ID.

## Action detail: 25 reviewed modules

### 01. `pray.morning_evening` — P1
**Owner and current code:** folio-core #59; supplement ad-orientem #1800, #1818; Open implementation PR. **Source:** Batch 1, research PR #1800.

**Action:** Preserve St Pius X 1913 default and 1905 alternative; audit historical prayer variants, independent Compline/bedtime links, and sunrise/sunset behavior.

**Unresolved gate:** Historic 1913/Hagan language-source collation and owner-level acceptance remain; integrate private canonical PR safely.

**Acceptance:** 1913 11/10 and 1905 10/8 unchanged; user selections, LA/EN/FR and progressive horizon tested.

### 02. `pray.angelus_regina` — P2
**Owner and current code:** folio-core #59; separate Marian-source addition ad-orientem #1800; Open implementation PR. **Source:** Batch 1, research PR #1800.

**Action:** Maintain traditional seasonal Angelus/Regina and optional historical conclusion; refer to August Queen as distinct related prayer.

**Unresolved gate:** Check seasonal posture and matching variant sources; do not insert August Queen into Angelus.

**Acceptance:** Automatic Eastertide transition and historical appendix, user choices and bilingual/trilingual original prayers remain correct.

### 03. `pray.rosary` — P2
**Owner and current code:** folio-core #59; Open implementation PR. **Source:** Batch 1, research PR #1800.

**Action:** Preserve 15 traditional mysteries, five/fifteen-decade player and historical ICKSP contextual links.

**Unresolved gate:** No new Institute rosary format established; no unverified novena or Marian prayer within decade engine.

**Acceptance:** Bead counts, mystery order, actual user modes and source attribution pass existing regressions.

### 04. `pray.meal_prayers` — P1
**Owner and current code:** folio-core #59; Open implementation PR. **Source:** Batch 1, research PR #1800.

**Action:** Collate Baltimore historical short Grace After Meals and offer full 1888 thanksgiving as optional without changing the short default.

**Unresolved gate:** Verify French historical witness and ensure not attributed falsely to English-only Baltimore original.

**Acceptance:** Both before/after forms, optional long grace and language provenance pass regressions.

### 05. `pray.nightly_examen` — P1
**Owner and current code:** folio-core #59; related ad-orientem #1818; Open implementation PR. **Source:** Batch 1, research PR #1800.

**Action:** Offer attested historic contrition variant, avoid double contrition when returning to Evening Prayer, and keep Compline a distinct Office.

**Unresolved gate:** Historic source/edition checks and non-overlap with bedtime/Compline branch remain.

**Acceptance:** Examen privacy, five-step flow, optional return and source-labelled contrition tested.

### 06. `pray.rosary_methods` — P2
**Owner and current code:** ad-orientem #1813; Open implementation PR. **Source:** Batch 2, research PR #1806.

**Action:** Clarify Montfort adaptations and source the Scripture-linked method to internal DR/CPDV/Crampon corpus.

**Unresolved gate:** Fifteen decades only where supported; original vs editorial language ownership.

**Acceptance:** Five verified methods retain exact sequences and 5/15 decade constraints; source labels correct.

### 07. `pray.divine_mercy` — P1
**Owner and current code:** ad-orientem #1813; Open implementation PR. **Source:** Batch 2, research PR #1806.

**Action:** Preserve complete five-decade chaplet; expose optional 'You expired' and 'O Blood and Water' as separate witnessed prayers.

**Unresolved gate:** The #1813 solution is source links, not imported modern protected wording; confirm presentation meets product acceptance.

**Acceptance:** Core bead count unchanged; options clearly distinguished, link-only holds explicit.

### 08. `pray.adoration` — P1
**Owner and current code:** ad-orientem #1813; Open implementation PR. **Source:** Batch 2, research PR #1806.

**Action:** Add verified original Latin Eucharistic Pange lingua, complete Lauda Sion, O sacrum convivium and source-identified optional ICKSP prayer links.

**Unresolved gate:** ICKSP modern Spiritual Communion, priest prayers and Golden Arrow may remain link-only until text-reuse clearance; no duplicate source IDs.

**Acceptance:** Five established modes remain; complete texts categorized as hymn, Mass sequence, Office antiphon; 3-language availability honest.

### 09. `pray.benediction` — P0
**Owner and current code:** ad-orientem #1813; Open implementation PR. **Source:** Batch 2, research PR #1806.

**Action:** Fix French Christ-address collect, seasonally appropriate Panem de caelo Alleluia, explicit Christ the King options and local ICKSP witness links.

**Unresolved gate:** Historical exact 1962 rubric and complete phone/bilingual acceptance; unverified chant variants held.

**Acceptance:** Seven stages unchanged, seasonal date tests and optional local rites correct; clergy-only blessing never assigned to laity.

### 10. `pray.forty_hours` — P1
**Owner and current code:** ad-orientem #1813; Open implementation PR. **Source:** Batch 2, research PR #1806.

**Action:** Preserve six-stage visitor and add distinct source-bounded solemn three-day public ceremonial participant path.

**Unresolved gate:** Full 1962 ceremonial recension and actual local scheduling still cannot be universally assumed.

**Acceptance:** Visitor and solemn choices independently available, links to Mass/Benediction, clergy roles and timing qualified.

### 11. `pray.communion_treasury` — P1
**Owner and current code:** Batch 3 implementation not yet assigned; Research only. **Source:** Batch 3, research PR #1808.

**Action:** Collate seven pre-Communion and four after-Communion prayers; enable direct selection; preserve shared Mass folios.

**Unresolved gate:** Independent historic LA/EN/FR prayer/source checks; spiritual communion shared with Batch 2.

**Acceptance:** 7/4 titles and wording intact; no duplicated private prayers or invented Eucharistic rite.

### 12. `pray.confession` — P1
**Owner and current code:** Batch 3; shared contrition belongs to folio-core #59; Research only. **Source:** Batch 3, research PR #1808.

**Action:** Preserve regular/returning/general Confession, private ten-commandment cards and no stored sins; source-align older catechesis.

**Unresolved gate:** Historical St Pius X references and exact shared contrition owner reconciliation.

**Acceptance:** Three paths, no simulated absolution, no saved sin responses and correct kind/number instruction.

### 13. `pray.penitential_psalms` — P1
**Owner and current code:** Batch 3 implementation not yet assigned; Research only. **Source:** Batch 3, research PR #1808.

**Action:** Validate and ideally locally ensure seven complete Vulgate-numbered psalms in authentic source languages.

**Unresolved gate:** Full-chapter verse integrity and independent source availability if offline.

**Acceptance:** 7/7 chapter coverage, correct 6/31/37/50/101/129/142 mapping, no paraphrase on failure, optional Litany handoff.

### 14. `pray.litany_saints` — P0
**Owner and current code:** Batch 3 implementation not yet assigned; Research only. **Source:** Batch 3, research PR #1808.

**Action:** Provide attested liturgical Latin and properly verified EN/FR; separate private historical litany from Rogations, Easter Vigil and Forty Hours.

**Unresolved gate:** Existing EN 1883 and FR Corneille 1862 are distinct uncollated witnesses; exact 1962 liturgical recension and rights not yet cleared.

**Acceptance:** Offline verified version-specific texts, invocation alignment, separate public rite proper prayers, faithful response roles.

### 15. `pray.stations` — P1
**Owner and current code:** Batch 3 implementation not yet assigned; Research only. **Source:** Batch 3, research PR #1808.

**Action:** Collate St Alphonsus French; preserve guided and simple modes while explaining public erected-stations context.

**Unresolved gate:** No unverified historical French translation; indulgence conditions must not be generalized.

**Acceptance:** 14 stations, 13 interstation Stabat stanzas, no compulsory vocal prayer, modes and public/private cues tested.

### 16. `pray.seven_words` — P1
**Owner and current code:** Batch 4 implementation not yet assigned; Research only. **Source:** Batch 4, research PR #1812.

**Action:** Preserve 7 scriptural words; package historical English meditation locally; source-collate French or label unavailable; optional Scripture-only path.

**Unresolved gate:** French historical original not yet collated; current Baltimore meditation relies on external transcription.

**Acceptance:** Seven correct Gospel refs, appendix separated from Seventh Word, offline and language behavior tested.

### 17. `pray.tenebrae` — P1
**Owner and current code:** Batch 4 implementation not yet assigned; Research only. **Source:** Batch 4, research PR #1812.

**Action:** Maintain locally compiled 1960/61 Matins/Lauds for three days; optionally accompany source-specific ICKSP 15-candle ceremony.

**Unresolved gate:** Historical candle-event alignment, recension and local usage must not be assumed universal; printed-Breviary facsimile collation pending.

**Acceptance:** 3 days × 2 hours canonical integrity; historically qualified local candle cues and reduced-motion safe.

### 18. `pray.novenas` — P1
**Owner and current code:** ad-orientem #1800 staged; Batch 4 residual; Partially staged. **Source:** Batch 4, research PR #1812.

**Action:** Preserve 16 novenas; integrate Institute Divine Infant King repeat-form and source-labelled St Thérèse perpetual Tuesday and distinct Immaculate Conception repeated form.

**Unresolved gate:** #1800 stages Infant King original text and links for St Thérèse; distinct repeated Immaculate Conception prayer and all reuse tests require reconciliation.

**Acceptance:** Sixteen existing forms preserved; supplementary identities and 9-day vs weekly recurrence correct; full Node/phone gate passed.

### 19. `programme.first_friday` — P2
**Owner and current code:** Batch 4 implementation not yet assigned; Research only. **Source:** Batch 4, research PR #1812.

**Action:** Preserve nine-month private report and reparatory Communion; clarify historical essential conditions versus ICKSP local devotions.

**Unresolved gate:** Source-specific Sacred Heart/Confession historical conditions; do not edit Batch 5 Sacred Heart canonical text simultaneously.

**Acceptance:** Five-stage flow, date detection, no inferred Communion or grace, optional month reports.

### 20. `programme.first_saturday` — P1
**Owner and current code:** Batch 4 implementation not yet assigned; Research only. **Source:** Batch 4, research PR #1812.

**Action:** Preserve the four acts and 15-minute meditation; prioritize historically traditional 15 mysteries instead of post-2002 Luminous set.

**Unresolved gate:** Fatima/1925 historical source collation, confession date timing nuance, saved preference migration.

**Acceptance:** Six-stage flow, separate Rosary/meditation, explicit reporting, authentic traditional default.

### 21. `pray.sacred_heart` — P1
**Owner and current code:** Batch 5 implementation; ICKSP optional priest prayers owned #1813/#1800; Research only. **Source:** Batch 5, research PR #1817.

**Action:** Preserve Pius XI Iesu dulcissime, litany and human-race consecration; register Golden Arrow Holy Face reparation and ICKSP King Dedication as DISTINCT prayer identities.

**Unresolved gate:** Golden Arrow vs Iesu dulcissime and Dedication vs Consecration are non-equivalent; independently clear source reuse.

**Acceptance:** Direct prayer choice, precise historic identities and source references, no duplicate priest prayer.

### 22. `pray.holy_name_litany` — P2
**Owner and current code:** Batch 5 implementation not yet assigned; Research only. **Source:** Batch 5, research PR #1817.

**Action:** Preserve local LA/EN/FR historical litany and guided seven-section read; check invocation alignment and external chant references.

**Unresolved gate:** Equal section count does not independently validate line-by-line translation; score redistribution not licensed.

**Acceptance:** Full/guided exact text, invocation/response order, access from Holy Name feast and role cues.

### 23. `pray.sacred_hymns` — P1
**Owner and current code:** ad-orientem #1800 staged; Batch 5 residual; Partially staged. **Source:** Batch 5, research PR #1817.

**Action:** Preserve 3 core source hymns and reconcile 8 additional Latin seasonal recensions staged in #1800; grow authentic EN/FR access without duplication.

**Unresolved gate:** #1800 full suite not release certified; 8 recensions vs 7 groups, pre-1632 Easter alternate not universal 1962; modern score rights unclear.

**Acceptance:** 11 historical hymn entries on staged reader, source-true Latin-only labels and authentic language witnesses, no overlapping Batch 2 texts.

### 24. `pray.good_death` — P0
**Owner and current code:** Batch 5 implementation not yet assigned; St Joseph source common with canonical Prayer; Research only. **Source:** Batch 5, research PR #1817.

**Action:** Restore independently collated 1909/preconciliar Litany of St Joseph as historical default and retain distinct 2021 expanded identity.

**Unresolved gate:** Existing current Litany contains 2021 invocations (Custos Redemptoris, Patrone exsulum, etc.); 1909 and historical EN/FR must be collated rather than deleting lines blindly.

**Acceptance:** All 9 stages preserved; full LA/EN/FR preconciliar and explicit 2021 alternatives; no changes to urgent bedside pathway.

### 25. `pray.dying_companion` — P1
**Owner and current code:** Batch 5 implementation not yet assigned; Research only. **Source:** Batch 5, research PR #1817.

**Action:** Retain priest-first urgent bedside sequence, prayer and commendation; critically collate Proficiscere original Roman and historical French texts.

**Unresolved gate:** Existing Latin linked to Monastic 1963; French linked to Scribd historical transcription; no certified 1962 Roman facsimile.

**Acceptance:** Urgent offline mobile access, correct lay/priest roles, no simulated sacraments, switch to prayers for the dead after death.


## Cross-pipeline non-conflation register

| Collision | Identity / category | Hard rule | Implementation owners |
|---|---|---|---|
| C01 | Golden Arrow vs Sacred Heart Act | ICKSP Golden Arrow is a Holy Face/Holy Name reparation, not Pius XI Iesu dulcissime. | Batch 5 Sacred Heart content identity; Batch 2 Adoration links; Batch 1 #1800 staged registry. |
| C02 | Christ the King Dedication vs Consecration | ICKSP Dedication is not the complete Consecration of the Human Race, nor optional Christ the King Benediction rite. | Batch 5 Sacred Heart; Batch 2 Benediction. |
| C03 | Full Eucharistic Pange lingua vs Passiontide Pange lingua | Corporis mysterium vs proelium certaminis are different historical hymns; Tantum Ergo is excerpt of the former. | Batch 2 Adoration canonical text; Batch 5 Hymns links; avoid duplicate IDs. |
| C04 | St Thérèse devotions | Twenty-Four Glory Bes 9-day Novena, Institute Tuesday Perpetual Novena, 1925 printed Benedict XV-associated prayer, and mission intercession remain distinct. | Batch 4 Novenas; #1800 staged text/link registry. |
| C05 | Immaculate Conception novenas | 1883 Moran 9-day day-specific prayers differ from ICKSP repeat-form O Most Holy Virgin, 29 Nov–7 Dec. | Batch 4 Novenas; existing 16 preserved. |
| C06 | Saint Joseph Litany editions | 1909 preconciliar vs 2021 seven-expanded invocation recension must be separate, not silently mixed. | Batch 5 Good Death + St Joseph Prayer Library shared ID. |
| C07 | Litany of the Saints ritual contexts | Private 1883/1862 witness is not a verified universal 1962 Rogation litany; Easter Vigil and Forty Hours have separate ceremonial conditions. | Batch 3 Litany + Batch 2 Forty Hours + Holy Week proper. |
| C08 | Compline vs Nightly Examination | Complete Office of Compline is not an optional five-step Nightly Examen and must not be introduced as undocumented St Pius X 'Short' form. | Batch 1 #59, #1800, #1818; released daily routines. |
| C09 | Rosary Mystery historical sets | 15 Joyful/Sorrowful/Glorious are traditional Fatima baseline; Luminous set is post-2002 and must be labelled and not imposed on First Saturdays. | Batch 1 Rosary, Batch 2 Rosary Methods, Batch 4 First Saturdays. |
| C10 | Marian protection vs Angelus | August Queen of Heaven is a separate sourced prayer, not extra Angelus line, Regina Caeli variant or original Rosary step. | Batch 1 Angelus, #1800 staged Marian route. |
| C11 | Office hymn vs score vs proper | An ICKSP chant score does not create a new lyric identity or confer paid-app redistribution permission; Latin-only recensions must not be passed off as EN/FR. | Batch 5 Hymns, #1800 staged 8/7, Batch 2 Eucharistic hymns. |
| C12 | Prayer for Priests variants | ICKSP Eternal Priest prayer from separate historical witness is staged English in #1800; second Institute prayer has text-corruption hold, not a verified substitution. | Batch 2 Adoration, #1800 staged canonical route. |
| C13 | Private Communion Treasury vs Mass prayers | 7/4 Communion selections feed Mass folios; they are not Postcommunion proper texts and should have one canonical prayer identity. | Batch 3 Communion, Mass Reader maintained. |
| C14 | 1955 Tenebrae ceremony vs 1960/61 Breviary | 15-candle public ceremonial witness may coexist with 1960 Matins/Lauds but is not mandatory identical rubrics for all parish services. | Batch 4 Tenebrae canonical Office. |
| C15 | Dying companion vs Sacramental Rites | Proficiscere is prayer/commendation with source-specific roles, not an app-administered Anointing, Viaticum, absolution or Apostolic Blessing. | Batch 5 Dying Companion, Good Death, Learn Serious Illness. |

## Recommended implementation waves

**Wave 0 — Freeze IDs and source ownership (mandatory):** Verify the latest public and private PR status, audit diff overlap, update the master; do not “green” any previously failed source/copyright test by omission. Ensure each canonical prayer has one owner and stable source/incpit/recension ID. Split PR #1800's draft implementation from research if that is needed for a safe merge.

**Wave 1 — Source integrity, P0:** Finish #1813 Benediction verification, develop private-versus-public Litany of Saints versioning, repair St Joseph 1909 versus 2021 default. Keep each independent of other Batch 5 visual work.

**Wave 2 — Existing implementation gates:** Resolve #59 canonical/private source QA; synchronize with public #1800, reconcile 8 Latin ICRSP hymn additions and St Thérèse/Infant King staging; approve #1813 only after full reader phone/locale tests, not merely from PR body description.

**Wave 3 — Quality and remaining historical imports:** Seven-Psalm full-verse offline, Seven Words French and offline, St Alphonsus French, Communion direct selection, Confession historical references, Tenebrae optional local ceremonial mode, Fatima First Saturday mystery selection and precise Confession timing, source-worthy Good Death/Dying Companion Proficiscere.

**Wave 4 — Enrichment:** Clear and surface missing ICKSP distinct formulas (Golden Arrow, King Dedication, separate Immaculate Conception novena), keep modern source links for held translations; finish authentic EN/FR hymn translations, Holy Name recitation QA and First Friday contextual refinements.

**Wave 5 — Release signoff and hygiene:** Execute all release gates, verify exact live Vercel SHA after merged PRs, maintain rollback; update per-row `implementation_state`, `verification_state` and `deployment_state` based on evidence, then mark delivered.

## Release gates

1. Verify current main and both public/private PR owners; resolve merge conflicts and do not double-edit canonical prayer IDs.
2. Original text/provenance and separately reusable translation validated; unavailable or held witnesses explicitly labelled.
3. Latin/English/French displays are attested, with no AI-filled prayers or unlicensed PDF/audio.
4. Traditional 1962 vs 1909/2021 vs optional local usage clearly distinguished.
5. Canonical Prayer, Rosary, Mass, Devotions, Office, and Calendar reuse single text identity rather than copy blocks.
6. Targeted Node/source and state regression plus Playwright mobile/language/low-connectivity tests pass.
7. Merged pull request is on current main and exact deployed Vercel commit is verified against live navigation, with protected rollback retained.
8. No paid services, hosting migration, artificial timeline/sacramental completion, or new parallel Calendar.

## Work explicitly outside 25-module research census

- Prayer Library and its entire canonical text bank
- Additional ICKSP/ICRSP source catalogues beyond 25 preliminary selected works and 98 indexed Office entries
- My Customs and other non-Pray module routes
- Full Office Compline, Holy Week public ceremonial and special rites
- External connected canonical folio-core implementation and published deployment state

The next research programme should separately inventory and reconcile the Prayer Library, extra ICKSP/ICRSP Office material, special rites and calendar-linked devotional contexts. Do not launch a parallel Calendar or new Prayer Library merely to complete this register.

**Cost constraint:** strictly €0 incremental expense, no paid rights clearance, metered cloud migrations or paid services; link to resources if reproduction rights cannot be established.
