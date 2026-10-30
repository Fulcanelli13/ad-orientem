# Did You Know — corrected source-first research strategy
_Date: 30 October 2026 · Status: nonpublishing research; user correction incorporated_

**Current checkpoint (later same day): 145 active bilingual drafts; 130 historical Customs source facts; 130/130 original-page or source-leaf checks; 0 publication approvals.** Historic 116/14 checkpoints below are kept as provenance of earlier progress, not current outstanding work.

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

## Customs editorial review and source-folio recovery — 30 October 2026

The [130-case source/editorial decision register](../../data/research/did-you-know/dyk-customs-130-source-editorial-screen.v1.json) matches **all 130 active historical Customs draft facts** to their own Weiser or Pitrè research records. This is full source-action and scope triage, not independent factual approval or a new Roman-rite customs identity registry. Every case stays unpublished with its original action ID.

**Editorial disposition (preliminary, reversible):** 27 priority standalone discoveries; 28 secondary cultural/contextual facts; 8 needing a correction or narrower source scope; 8 low-curiosity/common or clustered weekday items; 59 in the festival-story clustering pool. One further Pitrè historical fact is included in the 8 correction holds rather than the 59 clustering cases. All 130 are retained in the source research, not silently deleted.

**Original-page audit recovered:** The initially provisional first ten Pitrè St Joseph examples were cross-referenced to later completed source scans: one P0, one P1, eight P2 original-page reviews. Each now has its specific Pitrè 1900 printed page, original scan-page number, matched Italian anchor and an image-checked source record. Six additional Weiser draft rows were cross-referenced to already completed direct-page visual checks in the Customs primary sweep.

Consequently, **Previous checkpoint, now superseded:** 116 of the 130 active historical draft facts then had linked original folio/leaf actions (60 Pitrè and 56 Weiser), with 14 Weiser rows awaiting direct verification. The later direct-page review below closed those 14 gaps. Neither checkpoint establishes independent historical corroboration, modern continuity, certified 1962 ritual norms, editorial language approval or runtime links. Do not re-run the original Customs page-acquisition process simply to rediscover already checked Pitrè leaves.

### Twelve consolidated Sicilian festival stories

[Source-first story proposals](../../data/research/did-you-know/dyk-pitre-12-festival-stories.v1.json) recombine **27 traceable original Pitrè observations** from the **60** original distinct source-action drafts into **12 candidate story statements in EN/FR**, without replacing or automatically publishing the 60 evidence records. Each source pointer includes its verified printed original folio, Italian match anchor, source-review owner, and the source fact. The grouped themes cover Sicilian Saint Joseph hospitality and bread traditions, Palermo's Rosalia festival, Palermo's Saints Cosmas and Damian, Piazza Armerina's Marian banner, Gangi's Holy Spirit feast, Gratteri's Saint James, Geraci shepherds' Eucharistic celebration, and Marineo's Saint Cyrus street theatre.

The twelve stories are **not an additional twelve active discoveries**: zero net addition to the 145 active DYK draft count. They illustrate how a small number of interesting narratives may be editorially assembled from many source details, rather than mechanically emitting multiple repetitive daily facts about one local festival. A single Pitrè source family remains one authorial witness.

### Concrete correction and priority gates

- **Corrected:** `DYK-UM02-006` no longer says households sought reconciliation; the checked Weiser action summary supports completing work and tidying for Christmas Eve.
- **Held for narrower proof:** `DYK-UM02-015` (exact Assumption versus broader harvest cycle source context), `DYK-UM03-022` (Pantheon rose-shower liturgical feast dating), `DYK-UM01-011` (author's recommended family practice versus independently attested custom), and other rows explicitly flagged in the register.
- **Lower priority:** generic weekday-devotion statements and familiar facts that are not much of a curiosity hook; do not inflate production facts by turning every day of the week or every ceremony detail into a separate trivium.
- **Checkpoint pending work (now superseded):** fourteen individual Weiser folio joins have subsequently been completed; Italian claim/source semantics, native French review, verified exact routes, thematic uniqueness and concentration controls remain. No production or Calendar change.

The updated structural gate `tests/dyk-ultramaster-draft-gates.mjs` checks the 130 rows and the subsequently updated 130/0 source-stage counts, 12 nonpublishing story proposals with 27 page-linked references, and the corrected original facts. Source-field consistency was checked in research; no GitHub Actions/Node test completion is claimed until a run is observed.

## Weiser original-folio closure and source-claim corrections — 30 October 2026

The final 14 previously unjoined Weiser entries were checked against the scanned original **Francis X. Weiser, Handbook of Christian Feasts and Customs (1958)**. Exact source-page locators and source-scope corrections are recorded in [the 14-folio adjudication](../../data/research/did-you-know/dyk-weiser-14-original-folio-adjudication.v1.json). The printed-page to zero-based PDF page offset in the checked scan is **+17**. No bulk re-download or paid source capture was necessary.

**130/130 active Customs research facts now have source-level original-page or directly screened leaf evidence:** 60 Pitrè, 70 Weiser. **Zero** remain without this source-leaf check. This closes a provenance *mapping* gate, **not** independent historical attestation, source-meaning sign-off, live observance, native French approval, meaningful discovery quality, doctrinal validation or user-facing release permission.

### Historical corrections arising from actual source-page reading

- German Advent calendars: Weiser p.56 describes picture windows, **not** the extra chalk-mark claim. The fact was narrowed.
- Marian-image Advent visits: p.57 describes **Alpine-region** household visits, not the named Adnet parish. The named-location attribution was removed.
- Herbergsuchen: p.57 describes a **German Advent dramatic play** about the search for lodging. The previously claimed specific Großpetersdorf domestic picture was not established from the cited original and was removed.
- Christmas gift bell: p.74 confirms a bell announcing the Christ Child's gifts, without making the custom exclusively Austrian.
- Mountain-region large Nativity displays: pp.95–96 support the hundreds-of-figures room-scale crib description.
- Northern Slavic szopka: p.124 describes puppet-theatre Nativity scenes, while a **separate Hungarian account** describes carrying a Nativity representation door to door. The incorrect Polish transfer was removed.
- Mi-Carême: p.184 supports **French and Canadian festive family meals and entertainment**, not the previously asserted masked visits. Those details were removed.
- Holy Week spring cleaning: p.188 locates the custom in many countries after Palm Sunday. Polish greenery decorations are a separate detail.
- Polish Pentecost greenery: p.248 supports homes and churches and the Green Holiday appellation, not an extra claim about gates.
- French réveillon: p.76 documents **a family meal after Midnight Mass**. The contrasting Provençal Gros Souper before Mass does not appear in this source passage and was removed from this candidate.
- Martinmas: pp.270–271 locate the historic Mass-and-harvest-feast context and roast goose.
- Polish Święte Wieczory: pp.123–124 support the specific term for twelve nights between Christmas and Epiphany.
- Wednesday devotion to Saint Joseph: p.28 supports the historical weekday connection; historic indulgence text on the page is **not** carried into the fact.
- Ember Days: p.32 discusses historical seasonal prayer and thanksgiving for harvest; not current fasting law.

Four additional held claims were checked/narrowed: the Sunday sermon family conversation (Weiser p.16), letters to the Christ Child on Saint Nicholas Eve (pp.55–56), Hungarian Assumption harvest celebrations versus similar but not necessarily same-date Polish wreath processions (p.270), and the roses at the Pantheon on **the Sunday after Ascension** (p.242). The separately page-verified Pitrè p.443 Saint Joseph hospitality account remains a local report, never an implied Roman-rite obligation.

All eight previously flagged **source-precision** holds were reassessed and moved into the next editorial categories; **none were declared independently fact-verified for publication**. The [130-case review board](../../data/research/did-you-know/dyk-customs-130-source-editorial-screen.v1.json) now groups the same 130 preserved drafts as 31 priority review, 31 secondary context, 60 historical-festival story candidates and 8 repetitive/low-curiosity facts.

**Remaining:** actual claim-level editorial certification (including narrower context), genuine novelty and diversity versus the older private DYK deck, independent French review, 10 glossary browser-route acceptance tests, and fact-specific destinations for Mass and Customs. No new Calendar identity, runtime deck or publication.

## Bilingual discovery shortlist — 26 feature treatments (30 October 2026)

The [readable, source-page-linked 26-fact bilingual review sheet](DYK-26-FEATURE-FACTS-REVIEW-20261030.md) now provides a practical *retain / revise / defer* decision surface, not another bulk candidate dump.

From **31** individually screened priority Weiser drafts, [the source-preserving editorial copy file](../../data/research/did-you-know/dyk-weiser-31-edited-priority-facts.v1.json) selects **18 FEATURE, 12 RESERVE, one HOLD**. Each retains its original observation ID, historic scope warning, candidate EN/FR affirmative display text and nonpublishing flags. The hold is the 8 September seed-blessing item, where local ritual authority and exact source/feast semantics require more than a fact-page locator.

From the prior **12 composite Sicilian festival proposals**, [the revised story shortlist](../../data/research/did-you-know/dyk-pitre-12-story-editorial-shortlist.v1.json) selects **eight FEATURE**, **four RESERVE**, choosing **no more than one featured story per original Pitrè festival family**. It explicitly corrects that Palermo fishermen carried *statues* of Saints Cosmas and Damian and limits Saint Joseph hospitality generalisations to guests of appropriate historically reported status.

The **26 featured display treatments (18 + 8)** are **not added** to the active 145-draft research pool: 18 are editorial rewrites of existing Weiser fact drafts, and eight are composite story candidates drawing on source-preserved Pitrè observations. Zero claims are approved, French professionally reviewed, browser-accepted, released or published.

### Exact-destination restraint and Home compatibility

The private canonical Home DYK runtime already displays its own bilingual heading and enforces a **12-per-local-day** cap. The edited featured statements are independent declarative prose rather than a second `Did you know that...` question, and they do not create a second runtime.

Static inspection of the earlier private Home dispatcher confirmed an exact Glossary concept route contract; it did **not** establish a user-tested source-specific historical Customs destination for any of these **26** candidate treatments. Mark their deep-link state as **UNVERIFIED/UNAVAILABLE** rather than sending visitors to a generic Calendar or invented published Customs identity. A safe future option is a read-only contextual source-detail view inside the existing Home/source-owner navigation, but that is **a proposed implementation**, not a feature built in this research branch. Source links should retain original printed folios and avoid treating regional practice as universal 1962 rubrics.

### Remaining release gates

Choose/adjust the reviewed 26 copy proposals; perform final factual claims and French quality adjudication; compare substantive meanings with old private DYK preview statements; implement and browser-accept specific source destinations before any Home ingest. The 130 historical source folio checks are **complete**, so source-retrieval expansion is not a prerequisite to editorial work. Historical facts are never equivalent to indulgence grants or universal devotional obligations. Zero new paid services.

## Exact read-only historical source sheet — private owner R18 (30 October 2026)

**Implemented on the existing private Home Discovery research branch** `Fulcanelli13/folio-core:research/did-you-know-discovery-r01-20261028`, without importing any new historical fact into the 612 existing preview entries. The new file `src/home/discovery-historical-source-route.js` is wired through `src/home/browser-entry.js`, bilingual Home action labels, mobile styles and a new dedicated test `tests/discovery-exact-historical-source-r18.mjs`. The `npm run test:discovery-r18` command has been staged but **no workflow/Node test run was observed**. This is code landed in a private research branch, **not a live publication**.

The **fact-specific read-only sheet** stays on Home and displays the exact selected bilingual claim, historical/geographic scope, primary author/title/date, verified *printed book page*, canonical observation IDs, and a whitelisted original scan link; it distinguishes historical accounts from 1962 liturgical prescriptions, universal customs and indulgence grants. It closes on button, Escape, backdrop or navigation, restores focus, and fails closed on mismatched ID, unsupported source, missing printed page or untrusted source URL.

The [26 integration-handoff payloads](../../data/research/did-you-know/dyk-26-historical-home-route-handoff.v1.json) are derived from the existing 18-feature Weiser and eight-feature Pitrè editorials. Each uses `destination:{type:"route",id:"home.historical-source",factId:<exact ID>,historical_context:{...}}` with bounded source observation IDs/pages, approved scan host and EN/FR historical qualification. These records have `release:"RESEARCH_HANDOFF_NOT_PUBLISHED"` and **all editorial/publishing flags false**; they are deliberately **not accepted by the existing private compiler**, which still owns its older fixed 612-item branch-preview bank. This prevents accidental promotion merely because a destination is technically implemented.

**Route status distinction:** exact-source sheet code implemented, but **zero actual browser clickthroughs or new historical fact imports have been verified.** The previously described 130 unresolved individual historical *publishing routes* are not magically resolved by adding a generic research sheet. Only the 26 handoff records now have a concrete supported structural destination. Native French, source-claim scope, claim-level uniqueness vs private DYK, manual approval and real 320px/390px/desktop clickthrough remain outstanding. Zero-cost implementation, no new Customs Atlas or duplicate content owner.
