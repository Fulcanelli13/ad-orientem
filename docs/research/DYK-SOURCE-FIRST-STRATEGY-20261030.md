# Did You Know — corrected source-first research strategy
_Date: 30 October 2026 · Status: nonpublishing research; user correction incorporated_

## Governing editorial decision
**Customs DYK facts must be mined primarily from the FULL Customs Ultra-Master research collection, especially Francis X. Weiser and Giuseppe Pitrè, rather than being limited to the 39 canonical published/context Customs records.** The latter are a tiny Calendar publication layer, not the research universe.

Canonical source owner: [Customs research draft PR #1723](https://github.com/Fulcanelli13/ad-orientem/pull/1723), branch `research/customs-multibook-bulk150-20261026`, inspected head `1ba95d918c9043ec4915dfce84866ac237f1d371`. **Do not replace or merge the other Customs pipeline or create a competing identity owner.**

### Corrected inventory
| Source | Observations | Interpretation |
|---|---:|---|
| Francis X. Weiser (1958 Handbook + addenda + 1956 family book + granular details) | **1,025** | Source observations, some overlapping or authored as suggestions |
| Giuseppe Pitrè, original 1900 Sicilian source waves | **718** | Historical reported actions and local descriptions; do not imply current practice or independent eyewitnesses |
| Remaining families: Stokes, Müller/Kelly, Chaney, McLoughlin, Trapp/Berger/Newland, institutional regional source sets and other included observations | **1,960** | Other evidence observations; includes separate Palermo 1950 research |
| **Total observation index** | **3,703** | Source evidence, **not** unique customs or published DYK facts |
| Working master | **57 identities + 408 provisional groups** | Research-identity layer, *not* the full source material |
| Canonical Calendar Customs | **36 PUBLISHED + 3 CONTEXT_ONLY** | Small public/contexual layer; **not the intake limit** |

The source crosswalk records **3,703/3,703 resolved original JSON pointers** and 3,295 evidence observations without a direct 408-group identity link. This is metadata resolution, not certification of original printed folios, Catholicity, claim scope, or factual publication suitability. Original text/source records remain in PR #1723.

Machine-readable [26-bucket source map](../../data/research/did-you-know/dyk-customs-ultramaster-source-map.v1.json) records the full research inventory and pinned source owners. It is an intake *index*, not a copied second 3,703-row source database.

### Corrected first draft files
1. [30 original historical Customs DYK drafts](../../data/research/did-you-know/dyk-ultramaster-batch01.v1.json): **20 Weiser, 10 Pitrè**; EN+FR, origin record/printed-page or original OCR line, locality, source status and fail-closed publication gate. Drafts explicitly frame historical, local and author-reported material. **No one has approved publication of these facts.**
2. [24 complementary Glossary/Mass drafts](../../data/research/did-you-know/dyk-source-first-batch01.v1.json): 19 glossary + 5 Mass; EN+FR, primary registry references and pending rubric/translation checks. The earlier 16 drafts derived solely from canonical Customs have been moved into `deferred_canonical_customs_illustrations`, **outside the active candidate pool**, with their work preserved.
3. **Initial checkpoint: 54 active drafts (30 historical Customs, 19 Glossary, 5 Mass).** Extended in Batch 02 below. No runtime, Calendar or existing Customs records have been changed.

### Source-first production order
1. **Mine the Weiser 1,025 and Pitrè 718 evidence records** in useful themed batches, carefully distinguish duplicate historical action reports, recipes, regional feast celebrations, pageants, historical beliefs, parish liturgy, actual sacramentals, and family suggestions. Keep local exceptions and author/time attribution directly in the fact wording.
2. **Extend across the other 1,960 source observations**, prioritizing source-rich original/institutional evidence; avoid treating a source's recommendation as proof that a tradition existed everywhere.
3. **Apply evidence-gated editorial fact generation**: 1 observation can support multiple facts, multiple observations can support 1 fact; evaluate fact-level uniqueness separately from Customs identity-level uniqueness.
4. **Integrate glossary (450 source-backed concepts, 232 in directly relevant four categories) and Mass ceremonial research** (142 gesture records + 57 rubrical events + 280 speaker/cue evidence records, all overlapping) as equal complementary topical streams.
5. **Add catechism/doctrine only later**, after the existing Customs, glossary and Mass research has been usefully mined.
6. Dedupe against the earlier **53 bilingual DYK facts and 195 converted candidates**, whose authoritative owner was not found on `main` in this session; do not claim net-new publication or reuse without reconciliation.
7. Resolve actual app deep links; Calendar owns dates. Approval requires independent EN+FR source/claim editorial review, topical suitability, moderation of sensitive/folkloric claims and no false universal claim; then connect to existing max-12/day nonrepeating DYK implementation.

### No automatic certification
- A cited page *number* is not verification of the page image; an OCR line reference is not proof of a faithful transcription.
- Folklore and legendary motifs are historical reports, not Church teaching or ritual instructions.
- An archived description of a priest's act is not automatically a valid 1962 rubrical instruction or a current parish ceremony.
- Pitrè's descriptions of several Sicilian towns are part of one editorial compilation; do not count the towns as independent published authors.
- Indulgence claims require original work/grant verification and must not be extrapolated from historical festival descriptions.
- Do not publish historical custom observations as universal Calendar items and do not create a standalone Customs Atlas.
- Do not conflate research completion, editorial approval, public availability and current universal applicability.
- Zero paid services, zero duplicate research pipelines, no automatic publication.

## Batch 02 — completed 30 October 2026

The same nonpublishing DYK research branch now holds another **50 bilingual drafts**:
- [Batch 02A: 25 Weiser historical observations](../../data/research/did-you-know/dyk-ultramaster-batch02a-weiser.v1.json), keyed to original `BULK150` action dossiers and book printed-page pointers. **15/25** carry an explicit previously-checked original printed-folio flag; the remainder need original-page review. Distinguish author-suggested household exercises from attested regional practice. No endorsement of cross-confessional customs as universal 1962 Roman usage.
- [Batch 02B: 25 Pitrè original-1900 source observations](../../data/research/did-you-know/dyk-ultramaster-batch02b-pitre.v1.json), each keyed to a source record with **a located original printed folio, text anchor and reviewed scan-page contact sheet**. Topics cover St Rosalia, Saints Cosmas and Damian, Piazza Armerina's Assumption, Gangi, Gratteri, Geraci Siculo, and Marineo. This is original-edition page correspondence, **not** independent historical corroboration or current observance.

**Cumulative staged active drafts: 104**, comprising **45 Weiser + 35 Pitrè + 19 Glossary + 5 Mass**. All are EN/FR, all remain editorial drafts, none published; the **16 canonical-only Customs illustrations** remain separately deferred and uncounted. Source registries retain ownership. These are fact drafts, not 104 accepted/new customary identities.

The DYK [nonpublication and source integrity test](../../tests/dyk-ultramaster-draft-gates.mjs) covers draft IDs, raw observation-ID nonreuse, bilingual fields, local/temporal scope, unpublished flags, candidate totals and Pitrè page anchors. It does **not** independently validate historical claims or literary quality, and it does not resolve the older 53 facts / 195 conversion candidates outside this branch.

### Next editorial gate
1. Obtain original printed-folio checks for the outstanding Weiser rows, and compare exact Italian wording for the Pitrè drafts to avoid overstated certainty; retain historical/local specificity.
2. Reconcile the existing 53 and 195 DYK corpora before counting genuine new facts or connecting runtime. Preserve prior approvals.
3. Run human factual/FR native-language review, semantic clustering (e.g. weekday devotional associations and multi-detail local processions), source/rite separation, and no-endorsement rules for folklore.
4. Verify deep-link targets against real current runtime routes. Only human-approved, deduplicated items can enter the existing 12/day nonrepeating delivery mechanism.
