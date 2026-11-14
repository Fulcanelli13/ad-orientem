# Ad Orientem — ICKSP/ICRSP Prayer Modules Audit, Batch 04
**Date:** 2026-10-28
**Scope:** Next five unique Pray hub items after Batch 03: `pray.seven_words`, `pray.tenebrae`, `pray.novenas`, `programme.first_friday`, `programme.first_saturday`.
**Disposition:** RESEARCH_ONLY editorial review. No production prayers, schemas, UI, runtime, Calendar, or Mass Reader changed; no tests/device inspection. Work on future implementation branch from latest `main`, respect parallel Batch 1–3 pipelines.
**Principle:** ICKSP/ICRSP selected prayers are relevant; not all are identical to the existing forms or meant for the same use. Historical local ceremonial witness is not a universal 1960 rubric. No cost, no permission requests, no unverified copyright import.

## Executive decisions
| Module | Confirmed existing | Main gap/opportunity | Priority |
|---|---|---|---|
| Seven Words of Our Lord | Seven precise Gospel refs, Baltimore Manual English 1889 meditations fetched live, optional separately parsed concluding prayers, Scripture service EN/FR/LA | Verified French historical witness absent, online-only meditation and source fragility; include quiet Scripture-only path | P1 |
| Tenebrae | Local 1960/61 Breviary-derived LA/EN/FR complete 3 × (Matins and Lauds), exception handling, no mandatory old 15-candle ceremony | Add optional source-identified ICKSP ceremonial companion for actual 15-candle events and progression; preserve 1960 canonical Office unchanged | P1 |
| Novenas | 16 bilingual 9-day entries, tradition vs suggested starts, calendar context, no completion assertions | ICKSP's 3 named novena **forms** are distinct from existing Moran Immaculate and 24 Glory Bes Thérèse; Divine Infant King missing; don't mislabel Tuesday perpetual form as consecutive 9 days | P1 |
| Nine First Fridays | 5 stages, optional private tracking, 9-month register, explicit Communion + reparatory intention | More precise separate historical-essential vs ICKSP local Confession/Sacred Heart devotional practice; keep intention and completion explicit | P2 |
| Five First Saturdays | 6 stages; Confession date, Communion, 5-decade Rosary, 15-minute meditation, explicit optional 5-month register | Trad 15 mysteries as program default; 'luminous mysteries · optional 2002 set' in meditation chooser needs segregation from traditional 1925 reparatory context; pastoral Confession timing caveats | P1 |

## A. Seven Words
Source-owned code `src/pray/presentation-runtime.js` `ensureSevenWords()/renderSevenWords()`; `src/pray/seven-words-witness.v1.js`. Gospel refs: Luke 23:34, 23:43; John 19:26–27; Matthew 27:46; John 19:28, 19:30; Luke 23:46. English historical meditations are loaded at runtime from `A Manual of Prayers for the Use of the Catholic Laity/The Devotion of the Seven Words upon the Cross` through Wikisource. Parser requires all seven genuine Word headings and separates the author's extra concluding devotions from the seventh Word. French experience currently explicitly exposes historical meditation *in English*, not a certified French original.

**Recommendations:**
1. Keep exact 7 Word Gospel context, one Word per card, silence, optional historical appendix. No conflation of private Seven Words devotional with the Good Friday universal public liturgy or Office.
2. Compare a source-attested French original historical *Sept Paroles* devotional witness; present as its own attributed method, not machine-translated faux Baltimore original. If absent, maintain English original and transparent French notice.
3. Package the exact public-domain English historical witness locally, including section checksums/segment boundaries, and test network-off; no invented fallback.
4. Optional 'Scripture and silence only' mode without mandatory extraneous meditation; safe contextual route from Good Friday Calendar, no new Calendar.
5. Ensure Scripture source DR/CPDV, Crampon 1923, Latin availability follows canonical Bible service; never copy unvetted translated modern protected texts.

**Priority P1.**

## B. Tenebrae
Current `src/pray/tenebrae-1960.js`, `src/pray/tenebrae-presentation.js`, `src/pray/tenebrae-guides.js` compile local 1960/61 Roman Breviary Holy Thursday, Good Friday, Holy Saturday Matins and Lauds in LA/EN/FR; every source is locally fetched from `data/pray/tenebrae-1960-source`. Explicitly disclaims critical photographic-Breviary collation and cautions against imposing a pre-1955 anticipated candle ceremony. Source handles 1960 rubrical exceptions and fails on incomplete psalm dependencies. Canonical hours and precise readings must remain untouched by this Batch 4 work.

**New ICKSP direct testimonial:** `https://www.institute-christ-king.org/pittsburgh-gallery/1633-tenebrae2024` describes their parish Tenebrae using a 15-candle hearse, extinguishing during psalms, last candle hidden then restored, the `strepitus`, and silence as congregation leaves. ICRSP France's local Holy Week schedule has evening Tenebrae in 2024/2025, showing local variation; neither source is proof the candle ritual is mandatory whenever 1960 Matins/Lauds is read.

**Recommendations:**
1. Keep `Pray the 1960 Office` as default canonical Matins/Lauds reader.
2. Add an opt-in `Follow solemn Tenebrae (local ceremonial)` presentation, with actual liturgical event cues anchored to the specific selected witnessed ceremonial recension. The 14 extinguished candles follow the genuine psalm endings; final candle hidden/returned at source-appropriate point; strepitus occurs on user-observed signal, **never** timer-driven or forced by page progress alone.
3. Reuse desired cinematic blackout/darkening style without replacing Office text or disrupting the 1960 ecclesiastical timing and candle-rubric distinction.
4. Source-label time/ceremonial variant; avoid simultaneous contradictory claims that every 1960 celebration must use the same 15-candle ritual; ensure celebrant/choir/lay roles and physical-vs-screen distinction.
5. Verify 3 days × 2 hours completeness, psalm/lesson/responsory, Benedictus and `Christus factus est` exceptions, LA/EN/FR texts, 1960 vs older editions, and reduced motion.

**Priority P1 (ceremonial enhancement); provenance-grade 1960 photofacsimile validation remains separate signoff.**

## C. Novenas
Code: `src/pray/novena-corpus.js` contains 12 original items; `src/pray/novena-corpus-v4.js` adds 4 more = **16**. `src/pray/novena-runtime.js` supplies 9-day guided/simple reader, day navigation and Calendar bridge with traditional vs suggested start distinction. Existing `immaculate_conception` is a **day-specific Moran 1883** form (Nov 29–Dec 7). Existing `st_therese` is **24 Glory Bes**, associated with Fr Putigan (1925), in a consecutive nine-day presentation. Other existing: Holy Ghost, Christmas, Corpus Christi, Sacred Heart, Annunciation, Assumption, Seven Sorrows, St Joseph, Holy Souls, Perpetual Help, Christ the King, Immaculate Heart, St Michael, and St Anthony Nine Tuesdays.

**ICKSP source-specific differences and recommendations:**
- `https://institute-christ-king.org/resources/devotions-prayers/616-devotions-prayer-infant-king` — original identity *Novena to the Divine Infant King*, attributed on site to Ven. Fr Cyril, OCD. **Not among 16**. Source verifies a single prayer body, not unique nine individual daily texts. Add a **repeat-form nine-day novena** if historical witness/rights verified; no fabricated nine meditations or fixed seasonal start without evidence. Link from Infant Jesus and Christmastide, but the novena is not identical to generic Christmas novena.
- `https://institute-christ-king.org/resources/devotions-prayers/619-devotions-novena-immaculate-conception` — ICKSP repeated prayer beginning `O Most Holy Virgin...`; 29 Nov–7 Dec. **Not identical** to Moran's 1883 day-specific nine-day source; offer as explicit alternate *ICKSP/source-specific repeat form* under same devotion family, retaining the original day-specific choice.
- `https://institute-christ-king.org/resources/devotions-prayers/621-devotions-novena-therese-child-jesus` — ICKSP **perpetual Tuesday novena**, with a recurring local communal schedule, prayer, V/R + collect and related prayer for missionaries and Benedict XV St Thérèse prayer. This is **not** the existing consecutive nine-day 24 Glory Bes method. Implement as a distinct **weekly recurring devotion** within existing Novenas experience with opt-in user calendar reminders only; do not pretend Tuesdays are nine consecutive days or carry over the specific live U.S. service hour as the user's local time.
- Do not duplicate or overwrite underlying St Thérèse prayer, Marian novena, or canonical Pater/Ave/Gloria. Give each edition/form a stable ID and metadata.
- Cross-check 16 existing prior texts, particularly French completeness and historical original source issues; avoid silently normalizing ICKSP modern EN or FR into a purported historical edition.

**Priority P1, the clearest ICKSP additions of Batch 4.** Release gate: 16 existing novenas preserved, 3 new **forms** correctly classified (two nine-day alternatives plus one weekly perpetual form) and verifiable source/reuse statuses. Existing Novena engine may need a carefully scoped recurrence model without implying a 17th nine-day novena where structurally inaccurate.

## D. Nine First Fridays
Current `programme.first_friday` in `src/pray/presentation-runtime.js`: five stages Intention, Prepare, Mass/Communion, Reparation, Finish; explicitly requires user-reported reparatory intention and Communion for month-complete report; optional local-only 9-month register, no claim to graces or sacramental validity; guides to Mass Reader, Sacred Heart prayers and optional Holy Hour. Date validation from Calendar.

**Direct Institute apostolate source:** `https://www.institute-christ-king.org/pittsburgh-about` under `First Friday Devotions` states Confession, Holy Communion and reparatory intention; describes local Low Mass, Litany, Benediction and Sacred Heart devotions. These are evidence of ICKSP *local practice*, not necessarily the essential conditions of all historical nine-First-Fridays promises.

**Recommendations:**
1. Preserve exact 5-stage baseline and 9-month self-report; no inferred spiritual state, automatic completion, virtue rating or paywalled tracker.
2. Cite historically attested Sacred Heart and St Margaret Mary source for the historic nine-First-Fridays practice, distinguish conditional state of grace/Confession needed from local practice of routine Confession. Present ICKSP's choice to go to Confession as worthy contextual practice rather than silently redefining the universal nine-month criterion.
3. Link the verified ICKSP Act of Reparation only after text-source collation, reusing existing `pray.sacred_heart`; don't duplicate Batch 2's source identity.
4. No automatic Mass/Communion certification. Respect selected calendar date, month-order and interruption; test first-Friday identification across years.

**Priority P2.**

## E. Five First Saturdays
Current `programme.first_saturday` in `src/pray/presentation-runtime.js`: six stages Intention, Confession (optional independent date field), Mass/Communion, five Rosary decades, fifteen-minute distinct mystery meditation, Finish. Optional 5-month register with user-reported completion. The meditation guide currently offers Joyful, Sorrowful, Glorious **plus `Luminous Mysteries · optional 2002 set`**. Basic `pray.rosary` follows traditional 15 mysteries. Source enforces user report and doesn't automatically mark devotion completed on timer end.

**ICKSP direct apostolate source:** `https://www.institute-christ-king.org/pittsburgh-about` under `First Saturday Devotions` spells out Confession, Communion, five Rosary decades and fifteen minutes of mystery meditation with Immaculate Heart reparatory intention.

**Recommendations:**
1. Preserve genuine four acts plus intention and a separate fifteen-minute reflection, quiet reading and handoffs; no duplicative five-decade meditation requirement.
2. Keep **the historical 15 Rosary mysteries** as the default and coherent route for a 1925-origin Fatima devotion. Segregate the post-2002 Luminous set as later optional general Marian meditation, or remove it specifically from the canonical First Saturday guided selector while preserving any unrelated user options elsewhere; test user preferences/migration.
3. Historic apparition/approved source collation for Confession date flex, grace and repair intention; never impose invented numeric pre/post-day deadlines or assert a user was sacramentally worthy. Date of Confession should be user-entered only and privacy-respecting.
4. The canonical shared Rosary player remains the owner; after Rosary return, preserve progress and require explicit completion. Independent fifteen-minute meditation never auto-certifies.
5. Optional contextual Marian prayers from ICKSP source inventory should link out rather than be inserted into the Four Acts.

**Priority P1 for historical coherence; P2 for explanatory refinements.**

## Execution plan and risk gates
1. P1 Novena source-specific form identities and recurrence model, without breaking original 16.
2. P1 Seven Words English offline source integrity and qualified French edition research.
3. P1 optional ICKSP-styled Tenebrae ceremony map with exact event positions tied to selected source edition, independent of canonical 1960/61 hours.
4. P1 First Saturday traditional mystery-set scope and account-level preference migration.
5. P2 First Friday accurate source/Confession nuance and no compulsory local rituals.
6. Test LA/EN/FR source labels; network-off; no invented translations; local timestamp/date; reduced-motion; individual/group; cross-module routing and preserving existing Mass, Rosary and Calendar; verify no parallel PR owns same files.

## Summary
5/5 current modules audited at code + source level, **no runtime modification**. Evidence supports 3 distinct ICKSP novena forms/identities for further implementation, not 3 compulsory replacements of existing texts. Public historical Tenebrae and 1960 Office must not be conflated. No full theological facsimile certification or live mobile tests yet performed.
