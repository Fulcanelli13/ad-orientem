# Ad Orientem — ICKSP / ICRSP Prayer Module Audit, Batch 02
**Date:** 2026-10-28  
**Scope:** Next five unique Pray modules after the five Daily Prayer cards audited in Batch 01, respecting `prayFamilies()` and de-duplicating Holy Rosary: `pray.rosary_methods`, `pray.divine_mercy`, `pray.adoration`, `pray.benediction`, `pray.forty_hours`.  
**Type:** Editorial, textual and route audit. **No production implementation, merges, new prayer texts or Vercel deployment in this batch.**  
**Sources reviewed:** current `main` PRAY source files and the 2026-10-28 25-record ICKSP preliminary inventory, with additional official Institute documents discovered below.  
**Policy:** ICKSP/ICRSP selection establishes editorial relevance, not universal liturgical obligation. Separate privately prayed devotional forms from public rites; preserve 1962 tradition and source-specific language ownership. €0; no permission requests; do not copy contemporary protected translations without independent clearance.

## Executive findings
| Module | Current implementation | Recommendation | Priority |
|---|---|---|---|
| Ways to Pray Rosary | Ordinary, Dominican, two Montfort versions, scripture-linked; 15 decades supported only in ordinary method | Retain; annotate exact historical/editorial method provenance and avoid a 2002 document as primary source of preconciliar method | P2 |
| Divine Mercy Chaplet | EN/FR five-decade sequence, three Trisagion prayers and optional ending; original account in 1935 | Retain as separate, *not ICKSP-indexed* chaplet; optionally add the two opening devotions of St Faustina, as independently verified, without claiming this as Institute selection or creating Latin from English | P1 |
| Adoration & Visit | Visit, silent adoration, Holy Hour, Four Ends and Treasury; distinct reserved/exposed state and optional timer | Preserve quiet architecture; enrich with authentic Eucharistic hymns and source-backed prayers from ICRSP Corpus Christi, reparation and priests' prayers as selectable where text verified; offer ICKSP spiritual-communion English historical alternate | P1 |
| Benediction | 7 named live stages, optional Divine Praises, Christ the King supplement | Source-collate with direct ICKSP Benedictio leaflet; fix historical language/rubrical discrepancies; make local additions explicitly opt-in; supplement optional Marian prayer/chant, never impose a leaflet as universal order | P0 / P1 |
| Forty Hours | 6-stage lay visitor companion, not a complete three-day office | Retain light visitor mode and add separately sourced 3-day solemn Forty Hours context (opening/closing, second-day Peace Mass, prescribed/optional processions, public Litany); never fake clergy-led public roles | P1 programme, P2 visitor contextual enhancements |

## 1 — Ways to Pray Rosary
**Current:** `src/pray/devotional-methods-v1.js` declares canonical ordinary and Dominican, two St Louis-Marie de Montfort editions (first adapted; second French mystery clausules with editorial EN/LA translations), and Scripture-linked method; general `clausules` are explicitly held. UI `renderRosaryMethods` makes fifteen decades available only for ordinary method and exposes approved methods as user-selected.

**Institute comparison:** No distinct Rosary method documented among the nine entries at https://institute-christ-king.org/resources/devotions-prayers or the selected 13 French index entries. Do not invent a method gap, duplicate the Rosary module or silently introduce liturgically later mysteries as the default.

**Action:** Keep all five choices, label source original vs adaption, continue historical collation for clausules. Scripture-linked method currently cites a 2002 apostolic letter as source; tie the actual guided verses and interpretations to the internal approved Douay–Rheims and Crampon source registry, with the 2002 letter only as additional historical/pastoral reference. Do not enable 15 decades for all methods until canonical donor supports and tests pass.

**Decision:** PRESERVE + PROVENANCE_TIDY (P2).

## 2 — Chaplet of Divine Mercy
**Current:** `src/pray/devotional-methods-v1.js` MERCY_PRAYERS and `divineMercySteps()` implement Sign of Cross, Our Father, Hail Mary, Creed, five large beads, 50 small beads, 3 invocations and optional closing. `renderMercy` has EN/FR witnesses and a clear guide. It intentionally uses no invented Latin.

**Institute comparison:** Not enumerated in inspected US/FR Institute source selection. Date of revelation in the St Faustina account is 1935, but later official dissemination/reception differs. Do not imply this is a featured ICKSP prayer.

**Action:** Add as **optional opening prayers**, not extra compulsory beads, the two official devotional forms listed by the USCCB (the `You expired, Jesus` prayer and `O Blood and Water` invocation), sourced to attested Diary references; keep existing sequence and optional conclusion. Compare English/French before release; no unverified LA fallback.
- https://www.usccb.org/prayers/chaplet-divine-mercy
- https://www.vaticannews.va/en/prayers/divine-mercy-chaplet.html
- https://www.saint-faustina.org/chaplet-of-the-divine-mercy-history-of-the-devotion-to-the-divine-mercy/

**Decision:** OPTIONAL_ENRICHMENT (P1); no Institute mandatory gap.

## 3 — Adoration & Visit
**Current:** `renderAdoration` features Visit (seven steps), unrestricted silent adoration, Gethsemane Holy Hour, Four Ends and Eucharistic Treasury. The Treasury already contains Anima Christi, Spiritual Communion, O Salutaris, Tantum Ergo and Litany of Blessed Sacrament; public rite has priority. `adoration_spiritual_communion` is a complete prayer in EN/FR/LA and is not globally missing.

**New Institute sources:**
- ICKSP US official stream resource includes an *Act of Spiritual Communion* distinct in English wording from the app's Vatican-News-attributed witness: https://institute-christ-king.org/videostreamprayers . Preserve as a source-specific wording alternative if historic reuse evidence is cleared; do not overwrite current stable text or assert current Institute text is public domain.
- French ICRSP Corpus Christi (Fête-Dieu) has full Latin/French Eucharistic **Pange lingua gloriosi Corporis mysterium** (not Passiontide `Pange lingua gloriosi proelium certaminis`), *O Salutaris*, *Tantum Ergo*, the Mass Sequence **Lauda Sion**, and Vespers antiphon *O sacrum convivium*: https://icrspfrance.fr/textes-liturgiques.php?article=a0297_ancien
- ICKSP US selected *Prayer of Reparation* plus *Prayers for Priests* are suitable **optional** reparation/intercession source selections if independently text-collated; https://institute-christ-king.org/resources/devotions-prayers

**Action:** Add the **full Eucharistic Pange lingua** and the **Lauda Sion** as independently sourced text identities with explicit distinction `hymn` vs `Corpus Christi Mass sequence`, and situate `O sacrum convivium` in the proper liturgical context after global duplicate lookup. Keep existing *Tantum Ergo* rather than duplicating its last two stanzas. Surface them in Treasury or seasonal context and link the existing Calendar, not a duplicate Calendar. Keep silence as default, no compulsory all-prayer checklist.

**Decision:** ENRICH_TREASURY (P1); no replacement of core visitor forms.

## 4 — Benediction
**Current:** `renderBenediction()` has canonical 7 stages: Exposition (O Salutaris if sung), Adoration, Tantum Ergo, `Panem de caelo`/collect, blessing, optional Divine Praises, Reposition. Christ the King supplementary module adds optional procession, Laudes Regiae, Litany of Sacred Heart, and Act of Consecration. `CHRIST_KING_OPTION_DEFAULTS` currently sets `procession:true, royalPraises:true, sacredHeartLitany:false, consecration:true` for that optional local mode.

**Direct new Institute booklet:** https://www.institute-christ-king.org/images/chicago/Files/Prayer_to_Our_Lady_and_Benediction.pdf — *Benediction of the Most Blessed Sacrament / Prayer to Our Lady in Times of Pestilence*, 4 pages, visually inspected. Includes `O Salutaris` English version, `Stella caeli extirpavit` / Prayer to Our Lady in Times of Pestilence, Litany of Loreto (local wording includes newer invocations, e.g. Mother of the Church and Queen of Families), `Tantum Ergo` English witness, `Panem de caelo` and collect, and `Parce Domine` chant. Its combination is **local**, not proof of a universal 1962 Benediction order. The short English hymn wording of `Tantum Ergo` is substantially same as the app's current historical English witness, so do not duplicate.

**Text/rubrical candidates:**
1. **P0: seasonal versicle condition.** `benediction_versicles` is static in LA/EN/FR. The ICRSP Corpus Christi source prints `Panem de cælo … alleluia` / `Omne delectamentum … alleluia` and older traditional rubrical witnesses distinguish Eastertide responses. Implement the correct `Alleluia` when prescribed (verify precise temporal rule against an appropriate 1962 ceremonial witness), not hardcoded every day.
2. **P0: French collect ending.** Current `benediction_versicles.fr` closes `Par le Christ notre Seigneur. Amen.` whereas the attested Latin prayer directly addresses Christ and closes `Qui vivis et regnas`. Collate with the historical FR Institute source; correct the French closing according to the direct address rather than silently retaining a conflicting mediatorial conclusion.
3. **P0/P1: Christ the King local defaults.** When users switch to Christ the King, optional procession, Laudes and consecration should not all become assumed present. Use per-event opt-in / observed local sequence controls, with defaults off unless a confirmed local liturgy or user's saved selection warrants them. Existing use of 2012 Vatican *Laudes Regiae* must be clearly labelled a historical witness **not** an exact 1962 or local ICKSP performance.
4. **P1: Divine Praises source attribution.** The prayer's `provenance.witness` is a later `Holy Communion and Worship of the Eucharistic Mystery outside Mass`. Collate an independently attested preconciliar form/variant; preserve any materially different version with its source label rather than passing a later edition off as 1962.
5. **P1: Institute-specific optional items.** Register `Stella caeli extirpavit` (Prayer to Our Lady in Times of Pestilence) for Marian protection/circumstances, and `Parce Domine` as a penitential hymn; retain the existing Loreto Litany version identity instead of harmonising newer ICKSP leaflet invocations into the 1962 Litany. Add handoffs/optional stage *only when sung at the actual service*. No artificial prayer text or music.
6. **Preserve:** Benediction at the altar is clergy-led. Lay user is a responding participant, not a source of ministerial blessings. Maintain actual-rite pace, no timer, no prescribed incensation if local ceremony not verified.

**Decision:** HISTORICAL_RUBRICAL_CORRECTIONS (P0) + OPTIONAL_INSTITUTE_FORMS (P1). Critically, the previously inventoried ICKSP 25 records were **not exhaustive**: the booklet yields additional selected work identities to register separately.

## 5 — Forty Hours
**Current:** `renderFortyHours` is explicitly a six-stage lay companion: Arrive, Adore, Prayer aids, Public devotion, Benediction, Leave. Public stage warns that Litany of Saints and proper prayers belong to a public order. `pray.litany_saints` referenced under private prayer aids is a historical individual witness, not a certified solemn ceremonial. Module cites a Baltimore Manual account, not a complete 1962 ceremonial.

**New direct Institute account:** https://icksp.org.uk/institute/frequent-questions/ , `What is the Forty Hours Adoration`. Describes approximately 40 hours of devotion often over three days, reparation, practical permitted interruption at night, the traditional start/end votive Mass of the Blessed Sacrament, Litany of Saints and procession where complete ceremonies occur, and a second-day Mass for Peace. This is a strong source for the structure but **not** by itself a complete rubrical prayer script.

**Action:** Two explicitly distinguished entry paths in one module:
- `I am visiting / adoring`: retain existing six-stage quiet-first live companion; no invented hour count.
- `Follow the solemn Forty Hours ceremonies`: add an ordered three-day reference navigator with day 1 opening Mass/procession/Litany/exposition, day 2 Mass for Peace + visits, day 3 closing Mass/Litany/procession/reposition, with contingent rubric/actual sequence and source. Verify exact 1960-62 service books before supplying the complete public prayers, rubrics or timing. Reuse current Mass and Benediction components without overwriting them; relate the proper solemn Litany as an independently sourced text rather than substituting private 1883/1862 Litany.
- Link the existing liturgical Calendar as a contextual occasion when it occurs, **not** a fixed required feast or new calendar. Maintain user-provided or local-church service times only; no invented events.

**Decision:** PRESERVE_VISITOR + ADD_SOLENM_CEREMONY_CONTEXT (P1 programme). The three-day ceremonial needs a separate source-level signoff before live public text publication.

## Final prioritized change queue
| Priority | Item | Owner scope | Release criterion |
|---|---|---|---|
| P0 | French `Panem de caelo` collect conclusion collation/correction | Benediction canonical prayer | Attested Latin/FR direct-address ending and tests |
| P0 | Correct seasonal `Alleluia` at Benediction versicle and response | Benediction data/runtime | 1962 season-specific rubric verified; EN/FR/LA parity |
| P0 | Christ the King optional stage defaults not mistaken for actual local celebration | Benediction Christ King addon | Saved/local selections, no assumed procession/choir |
| P1 | Record `Stella caeli extirpavit` + `Parce Domine` + ICKSP leaflet Loreto version | ICKSP accepted research register, Marian/seasonal hymn routes | Separate identities, source versions and copy rights |
| P1 | Add full Eucharistic `Pange lingua`, `Lauda Sion` and investigate `O sacrum convivium` | Adoration treasury; Corpus Christi Calendar/Office | Global dedup and verified independent LAT/EN/FR witnesses |
| P1 | Optional two Divine Mercy opening prayers | Mercy chaplet | Authentic diary witness, correct invocation count |
| P1 | Prayer of Reparation / Priest prayers as optional Adoration aids | Adoration, source registry | Exact Institute or preconciliar attestation; no compulsory additions |
| P1 | ICKSP Spiritual Communion wording variant | Adoration treasury | Attribution, reuse rights and source identity |
| P1 | Forty Hours traditional three-day ceremonial reference path | Forty Hours | Distinct clergy/public vs private forms; rubrics and ceremony edition checks |
| P2 | Rosary method provenance and scripture witness correction | Rosary methods | Keep donor, no novel unapproved clausules |
| P2 | Preconciliar witness for Divine Praises rather than 1970s attribution only | Benediction | Version-specific source and language witnesses |

### Source constraints
1. ICKSP U.S. initial source index: https://institute-christ-king.org/resources/devotions-prayers
2. ICKSP additional official prayers and Benediction leaflet: https://institute-christ-king.org/videostreamprayers and https://www.institute-christ-king.org/images/chicago/Files/Prayer_to_Our_Lady_and_Benediction.pdf
3. ICKSP GB Forty Hours explanatory source: https://icksp.org.uk/institute/frequent-questions/
4. ICRSP FR Corpus Christi full liturgical forms: https://icrspfrance.fr/textes-liturgiques.php?article=a0297_ancien
5. Divine Mercy official texts: https://www.usccb.org/prayers/chaplet-divine-mercy
6. Historic prayer witnesses in `src/pray/canonical-data.js`, `src/pray/devotional-methods-v1.js`, `src/pray/christ-king-benediction.js`

**Status:** 5/5 module code paths inspected; recommendations prepared; new source discoveries beyond the preliminary ICKSP B01 inventory, **not** a complete census of all Institute publications. Production changes: zero. Device tests: not run for this editorial pass. No publication claims.
