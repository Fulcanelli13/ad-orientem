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
6. Reconcile with the earlier **53 bilingual pilot DYK facts, 195 converted archival candidates and 612 branch-preview statements** now located in the private canonical research branch. These stages overlap; preserve the original runtime/approval owner and do not add counts as if unique. See the Batch 03 reconciliation below.
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
2. Continue editorial assessment of the now-located older 53 pilot, 195 archival conversion and 612 preview statement corpora, especially the 18 public drafts flagged for the same canonical source record; establish actual claim-level duplicates before consolidation. Preserve prior approvals.
3. Run human factual/FR native-language review, semantic clustering (e.g. weekday devotional associations and multi-detail local processions), source/rite separation, and no-endorsement rules for folklore.
4. Verify deep-link targets against real current runtime routes. Only human-approved, deduplicated items can enter the existing 12/day nonrepeating delivery mechanism.

## Batch 03 — wider research intake and legacy-owner discovery (30 October 2026)

Another [50 bilingual Customs research drafts](../../data/research/did-you-know/dyk-ultramaster-batch03-wider-corpus.v1.json) were prepared **outside the 150-dossier shortlist**: 25 Weiser facts from the source-screened original printed-page review, and 25 Pitrè 1900 observations from previously mapped original-edition page images. The records preserve exact source observation ID, source review ID or Italian text anchor, original page, scope limits, and publication blocks. The revised source pin was read at Customs research head `2db24c69ca5763c301b80593c209533bb140d906`. No private historical observations or final customs identities were newly approved.

**Before semantic overlap review:** 154 original bilingual drafts, 70 Weiser + 60 Pitrè + 19 Glossary + 5 Mass. **After 18-case review:** 145 active = 70 Weiser + 60 Pitrè + 10 Glossary + 5 Mass; 9 glossary drafts deferred intact. Approved: 0. Published: 0. Previously deferred canonical-only Customs examples: 16, not counted. This is draft coverage progress rather than published knowledge.

### Legacy reconciliation discovered

The original DYK **private canonical research branch** was found and inspected: `Fulcanelli13/folio-core`, `research/did-you-know-discovery-r01-20261028`. It contains the Home discovery runtime owner and source-fact generators, plus:
- **53** original R04 affirmative pilot facts, **49** eligible for branch preview (4 unpublished Formation leads excluded).
- **278** mechanically screened R05 statements.
- **285** mechanically screened R06 statements.
- The private **612-item branch-preview bank** = 49 + 278 + 285. It is **not independently approved or publicly released**.
- **195** additional R04 converted archival drafts. These overlap earlier editorial source spans and the preview cohorts; **do not add 195 to 612**.
- Home's existing research branch handles random daily rotation with a **12-per-local-day limit**, nonrepetition and language switching. Do not create a second DYK runtime in public validation or imply private preview is deployed.

The [privacy-preserving legacy crosswalk](../../data/research/did-you-know/dyk-legacy-reconciliation-v1.json) records **18 of our 154** with the *same canonical glossary source record* as at least one earlier private pilot/screened/archival item, without copying private legacy fact text/IDs into this public research PR. **0 exact identical English statements found** in the checked cohorts. **136** lack an exact matching earlier source record, which **does not establish semantic novelty or editorial acceptability**; historical related facts may still repeat themes. This is source-level triage, not a duplicate adjudication. No final merger, deletion, reallocation or publication decision has been made.

### Next mandatory editorial steps

1. Review the **18 same-source glossary pairs** and approve retain/defer/replace on *meaning*, not only source record identity. Preserve distinct facts when genuinely different.
2. Cluster historical Customs variants: multiple Pitrè reports from one festival or author are *not* independent authors or separate Customs identities, even when suited to different DYK facts. Avoid saturating daily rotation with one Sicilian festival.
3. Verify language and historical statement with the original folio, and secure appropriate native French proofreading; distinguish folk belief from Catholic teaching and historical rite from today's 1962 norm.
4. Evaluate which destination can be linked to a genuine existing glossary, Calendar, prayer, Mass or formation screen. Do not create a false live custom entry just to satisfy a deep link.
5. Only feed independently reviewed and truly distinct cards to the preexisting private canonical Home runtime, with zero paid services and no new competing bank.

The [updated 145-active-draft integrity gate](../../tests/dyk-ultramaster-draft-gates.mjs) is staged for CI execution; structural checks have been independently replicated in the available GitHub tool session, but a Node CI run has not been reported.

## Semantic overlap adjudication and destination contract — 30 October 2026

The 18 glossary source collisions flagged by the earlier reconciliation have now been **compared claim by claim** against the previously authored private DYK statements (53 original pilot, 278 R05 screened and 285 R06 screened, plus overlapping 195 archival conversions). The [18-case research triage](../../data/research/did-you-know/dyk-legacy-18-claim-semantic-triage.v1.json) distinguishes:
- **9 semantically redundant claims** — excluded from the active DYK pool, but preserved as full, reversible drafts in `deferred_legacy_semantic_duplicates`. Not deleted and not silently merged with private source.
- **9 source-overlapping but different discoveries** — retained because one canonical concept can support multiple genuinely distinct factual details. These still require claim, historical, EN/FR, and route approval.
- These are **research editorial classifications**, not human approval of either the new candidates or the previous legacy wording.

**Current tally: 145 active EN/FR drafts** = 130 original Customs source-backed historical drafts + 10 glossary + 5 Mass; nine reversible duplicates deferred in addition to 16 older canonical-Customs illustrations already deferred. **0 approved, 0 published.** This 145 tally supersedes the earlier 154-active interim checkpoints. No changes to underlying Customs master or canonical private DYK bank.

### Navigation readiness

The [exact-destination readiness register](../../data/research/did-you-know/dyk-destination-readiness-v1.json) inspects the existing private Home handler and reports:
- **10 glossary facts** have a source-specific Home destination shape supported by the existing `learn.glossary` contract with `entryId=G###`; source code verifies concept detail ID on open. **No browser acceptance test yet.**
- **5 Mass facts** are blocked for Home integration until a verified specific-card/cue entry point exists. An ordinary Mass landing screen does *not* fulfil a claim-specific link.
- **130 historical Customs research facts** have no automatically sanctioned Calendar custom profile. They need a source-specific historical article, curated context, or valid existing feast destination as appropriate, rather than invented calendar identities.
- No route is marked browser-accepted; no facts may enter production on this registry's authority alone.

### Existing Home affirmative format

The existing private DYK Home component renders the heading `DID YOU KNOW THAT…` / `LE SAVIEZ-VOUS ?` separately from its statement. Our source-research drafts retain a legacy authored question stem `Did you know that…` or `Saviez-vous que…`, often with a closing question mark. Passing them through directly would repeat the heading and break the intended affirmative visual treatment.

Added the **nonpublishing, research-only** [draft statement normalizer](../../tools/dyk/statement-normalizer.mjs) and a format gate in the structural test. It strips the drafting stem and final question mark, handles French `qu'`/`que,` openings and produces a declarative statement without changing the original source draft. This is a *syntactic* check, not French linguistic approval or a production transformation. **No new Home renderer, browser code or runtime deck is included in this PR.**

### Next signoffs before release

Original-claim and native-language editorial checks for historical/local statements, semantic review across the other 130 Customs candidates and the existing 612-item preview bank, verified direct routes, then and only then a controlled handoff to the existing private Home discovery source owner. Preserve the 12-per-local-day selection and source provenance; no cost.
