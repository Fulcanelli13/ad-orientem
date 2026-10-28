# Ad Orientem — ICKSP/ICRSP Prayer Audit, Batch 03
**Date:** 28 October 2026
**Scope:** Next five unique `prayFamilies()` items after Batch 2, in live hub order: `pray.communion_treasury`, `pray.confession`, `pray.penitential_psalms`, `pray.litany_saints`, `pray.stations`.
**Status:** EDITORIAL REVIEW ONLY — existing code examined, Institute primary references surveyed; no devotional text or runtime amended. No claim of print-facsimile certification or device acceptance.

## Priorities and outcomes
| Module | Verified current implementation | Disposition | Priority |
|---|---|---|---|
| Traditional Communion Prayers | 7 before, 4 after, shared with Before/After Mass folios; core LA/EN/FR and sourced medieval preparations | Preserve, historical-source reconciliation, fast selection and thoughtful additional options only when verified | P1 |
| Confession | Regular, returning, optional general-confession pathways; ten commandments; no sins/questions saved; rehearses sacrament before entry | Preserve privacy and doctrine; add St Pius X/older reference and verified contrition variant (joint with Batch 1); no rite duplication | P1 |
| Seven Penitential Psalms | Proper Vulgate-order Psalms 6,31,37,50,101,129,142 and modern cross-index 6,32,38,51,102,130,143; dynamic full Scripture fetch | Preserve; make canonical source resilient, validate every verse and proper numbering; optional doxology/collect only where source-supported | P1 |
| Litany of the Saints | Downloads EN 1883 and FR Corneille 1862 from Wikisource; no LA face, source explicitly uncollated; strips off appended collects | P0 research/engineering target: independently source and certify an offline Latin witness and appropriate 1962 French/English readings; distinguish personal Litany from proper public Major/Rogations, Easter Vigil, Forty Hours | P0 |
| Stations of the Cross | 14 St Alphonsus meditations with simplified mode, responsive public group posture, optional 13 inter-station Stabat Mater stanzas; French translation explicitly not independently collation-certified | Preserve; collate EN/FR/LA, optional traditional source-specific method, distinguish meditation and physical indulgenced Way of Cross | P1 |

## Module 1 — Traditional Communion Prayers
**Baseline:** `src/pray/traditional-pray-runtime.js`: `COMMUNION_BEFORE` = `sacrament_come_holy_spirit`, Acts of Faith, Hope, Charity, Contrition, `beforeThomas`, `beforeAmbrose`; `COMMUNION_AFTER` = Anima Christi, `afterThomas`, `afterBonaventure`, `enEgo`. `COMMUNION_TREASURY_V383` in `src/pray/traditional-pray-data.js` contains independently attributed prayer variants. Both `mass.prepare` and `mass.thanksgiving` reuse these; they must not be forked. Source links in code include Opus Dei French/Latin prayer collection and indulgence reference.

**ICKSP comparison:** Official `https://institute-christ-king.org/videostreamprayers` offers a different Act of Spiritual Communion and a `Method of Praying Mass Spiritually` resource. The first was already proposed for the Adoration Treasury in Batch 2; **do not reimplement**. The second is a potential separate optional devotional method, **not** a replacement for before/after Communion prayers. Institute Mass-text site contains proper postcommunions, which belong in the Mass Proper, **not** this private-prayer reader.

**Recommended:** Source-check all 11 prayer bodies and endings individually, especially older EN and FR variants; preserve stable IDs and full body text, test shared Mass Folio. Keep quick access to one prayer vs progression through the complete collection. Add a subdued handoff to sourced spiritual communion only where pastorally relevant, reusing Batch 2. Disclose that the optional preparation prayers are not the priest's Mass prayers, and there is no compulsory checklist. Avoid copying protected ICKSP translation.

**Gate:** Prayers and Mass Folios remain identical source instances; 7/4 count, translation/provenance and mobile quick access verified; no invented claim of Communion reception.

## Module 2 — Confession
**Baseline:** `src/pray/confession-paths.js` and `presentation-runtime.js` provide regular, returning and general Confession preparation; short pathway covers all Ten Commandments in four grouped cards. Longer paths include guidance, rite rehearsal and after-Confession. User-entered sin details are not collected/saved; optional time-since-last-confession is session-local. Rites do not simulate absolution or assume sacramental receipt. Current primary doctrinal references are Vatican Catechism and 1983 Code.

**ICKSP comparison:** ICKSP New Brighton maintains adult moral catechesis centered on Ten Commandments and examination of conscience: `https://icksp.org.uk/newbrighton/catechism-opportunities-this-autumn/`; this confirms compatibility of the structural approach, **not an ICKSP-certified published examination text**.

**Recommended:** Retain three modes, privacy, anti-scrupulosity guidance, distinction between general confession and general absolution, and fidelity to sacramental practice. Add historically grounded St Pius X catechism source reference and historically attested Act of Contrition as an explicit source-labelled alternative; coordinate that exact shared prayer with Batch 1 to avoid double edits. Consult 1962 Rituale Romanum sources for rite-context notes, without impersonating priest or creating sacramental simulation. Consider optional concise pre-/post-Confession prayers from independently attested preconciliar manual, not mandatory steps.

**Gate:** All pathways preserve kind/number guidance and genuine absolution distinction; no sins saved; no overlap conflicts with Batch 1.

## Module 3 — Seven Penitential Psalms
**Baseline:** `PEN_PSALMS` = `[{6,6},{31,32},{37,38},{50,51},{101,102},{129,130},{142,143}]`. Each full chapter is requested from existing canonical Scripture service; the on-screen citation carries traditional numbering, with modern cross-ref. After final psalm the UI offers a handoff to the private Litany; source texts are not concatenated.

**ICKSP comparison:** The ICRSP Major Litanies/Rogations resources confirm penitential procession context but are not themselves a certified edition of **all seven psalms**: `https://icrspfrance.fr/textes-liturgiques.php?article=a0087_nouveau`, `https://icrspfrance.fr/textes-liturgiques.php?article=a0106_nouveau`. Do not attribute a complete Seven-Psalm recension to this source without evidence.

**Recommended:** Verify all seven psalms render every expected verse in original DR/Crampon and Latin, with full-chapter integrity, correct Vulgate numbering, verse boundary and mobile caching/offline behavior. A network failure must not silently replace a psalm with paraphrase or false progress; consider prebundling verified source text for these seven chapters within free repo limits if permitted. Preserve existing seven-card focus and optional Litany continuation. Only add doxology, introductory antiphon or penitential collects as explicit source-specific optional completion when historical witnesses establish their scope.

**Gate:** 7/7 full psalms, three-language source coverage or explicit unavailable status, correct old/new numbering, no silent truncation, proper handoff and retriable failure.

## Module 4 — Litany of the Saints
**Baseline:** `src/pray/litany-source.js` documents two **different** uncollated historical editions: English `The Catholic Prayer Book and Manual of Meditations` (1883), French Pierre Corneille's Litany (1862). Runtime `ensureLitany()` downloads Wikisource prose via `guidedWsText()`, slices the Litany proper ending before the Our Father/Psalm 69 and other orations, paginates it by line. It has no liturgical Latin parallel. Source itself correctly disclaims 1962 certification. Corneille transcription has two suspected typographical readings requiring print-facsimile comparison.

**NEW ICRSP primary liturgical references:**
- `https://icrspfrance.fr/textes-liturgiques.php?article=a0087_nouveau` — Major Litanies 25 April: Latin and French Litany, connected versicles, collects and procession sequence; a materially stronger 1960/1962-era liturgical witness for this use.
- `https://icrspfrance.fr/textes-liturgiques.php?article=a0065_ancien` — 1960 rubrical discussion, changes to Major and Minor Litanies, reduced duplicated invocations, processional or alternative supplications, episcopal/local scope.
- `https://icrspfrance.fr/textes-liturgiques.php?article=a0030_nouveau` — Easter Vigil Litany in the revised Holy Saturday structure; it is **shorter and ritually distinct** from Rogations.
- `https://icrspfrance.fr/textes-liturgiques.php?article=a0106_nouveau` — Rogations context, including petitions and procession.

**Recommended architecture:**
1. Preserve the existing private, historical Litany witness as a separate **historical devotion**, while labelling its English/French editions honestly; do not present a merged faux 1962 text.
2. Create a distinct *liturgical Latin* canonical source, once independently verified against an exact historical witness. Add individually verified French and English renderings (not a rights-uncleared ICRSP translation) and support line-by-line ℣/℟ with source/variant labels.
3. Provide contextual variants or direct links to **Major/Minor Litanies** with their *proper* full public collects and processional cues; keep Easter Vigil shorter Litany in its existing proper rite; Forty Hours in Batch 2 must use its correct ceremonial text, not private Litany.
4. Bundle verified Litany text locally so it is available without network/API fetch. Preserve source provenance and edition control; never silently autocorrect uncertain historical transcription.
5. Do **not** automatically append Psalm 69, multiple collects, or Easter-Vigil segments to every private recitation.

**Priority: P0** due language/source mismatch, online-only dependence and potential misrepresentation of a private witness as a liturgical service. Source and translation verification are preconditions to publication.

**Gate:** Complete attested Latin version, source-labeled English/French, correct version-specific saint list and invocations, bounded private vs full public rites, offline functionality, no mixed orated sections, screen reader/leader-response accuracy.

## Module 5 — Stations of the Cross
**Baseline:** `renderStations()` is a fourteen-station guided/simple devotional reader; St Alphonsus meditations and prayer, common versicle and response, optional *Stabat Mater* stanza for each inter-station transition (13 transitions), optional public postures, group vs individual recitation, separate Scripture references for biblical context, and cinematic station transitions. French historical rendering is already explicitly marked `awaits independent comparison`.

**ICKSP comparison:** `https://www.institute-christ-king.org/pittsburgh-news/106-pittsburgh-news-private/1191-stations-lenten-regs` explicitly says no prescribed vocal prayer set is required for the indulgenced Way of the Cross; it is focused on meditation of the Passion, with particular conditions for physically erected stations and movement. `https://www.institute-christ-king.org/videostreamprayers` advertises the Institute's St Joseph Shrine Detroit narrated Via Crucis, but does **not** establish that its spoken script is the St Alphonsus method. `https://icksp.org.uk/newbrighton/category/schedule/` confirms local use of traditional fourteen stations especially in Lent, but is a local practice source, not an editorial text master.

**Recommended:** Preserve Simple, Guided/St Alphonsus, individual/group, postures, inter-station *Stabat Mater*, and all fourteen stations. Collate original St Alphonsus English and independent historical French version, and any source-supported Latin prayer version. Distinguish Scripture narrative from devotional tradition, e.g. Veronica/falls are *traditional meditations*, not asserted biblical incidents. Add brief info for **in church with canonically erected stations / participating in public Stations / meditating elsewhere**: avoid promising the same indulgence conditions in all contexts. A lay follower need not personally move if one leader does for a public communal exercise; do not impose a single posture custom universally. ICKSP narrated video may be an external related resource; do not copy potentially protected audio, images or transcript without rights.

**Gate:** 14/14 source-aligned stations; 13 interstation *Stabat Mater* stanzas positioned correctly; both modes, all gestures, liturgical caution and French-source verification; no compulsory prayers claims, original painting asset programme remains separate.

## Cross-batch boundaries
- Batch 1 owns shared St Pius X routine and historical Act of Contrition changes; Batch 3 only consumes approved shared variants.
- Batch 2 owns independent Adoration/Spiritual Communion and Forty Hours ceremonial work; Batch 3 links to these rather than editing their duplicated texts or the public litany in a contradictory way.
- Existing 1962 Mass Reader and Calendar remain authoritative; Mass Proper postcommunions must **not** enter private Communion Treasury; Easter Vigil Litany must be sourced in its rite.
- Source witnesses that remain unverified should be held as research records, not deployed speculatively.
- All publishing must use public-domain or demonstrably reusable text, preserve original attribution, and cost €0.

## Recommended execution order
1. P0 Litany source/version architecture + locally available text after exact edition verification.
2. P1 Communion text collation, Mass-Folio dedup and 7/4 integrity.
3. P1 full-verse Seven Psalms reliability and LA/EN/FR numbering.
4. P1 St Alphonsus French source comparison and public movement guidance.
5. P1 Confession historical cross-reference and selection of shared verified Act of Contrition, coordinated with Batch 1.
6. Mobile, focus, offline/network failure and regression tests; verify all source rights.

## Audit status and deliverables
**Five of five module code paths examined.** Not a claim of complete 1962 source certification. No production changes, no added prayer bodies, no live-device tests, no deployment.

**Independent source URLs**
- ICKSP: https://institute-christ-king.org/videostreamprayers
- ICKSP: https://www.institute-christ-king.org/pittsburgh-news/106-pittsburgh-news-private/1191-stations-lenten-regs
- ICKSP: https://icksp.org.uk/newbrighton/catechism-opportunities-this-autumn/
- ICRSP: https://icrspfrance.fr/textes-liturgiques.php?article=a0087_nouveau
- ICRSP: https://icrspfrance.fr/textes-liturgiques.php?article=a0065_ancien
- ICRSP: https://icrspfrance.fr/textes-liturgiques.php?article=a0030_nouveau
- ICRSP: https://icrspfrance.fr/textes-liturgiques.php?article=a0106_nouveau
