# Mass LIVE — all-form, all-rite coverage and integration audit
**Audit date:** 12 October 2026 · **Production source:** `main` plus proposed focused [PR #1091](https://github.com/Fulcanelli13/ad-orientem/pull/1091).  
**Owner:** `src/mass/reader-native-preview.js`; authoritative Mass/rite rules: `src/mass/session-engine.js`; authoritative text: canonical 39-source Sung model, form-specific models and independent pre-/post-rite graphs.

## Definitions — do not confuse these three quantities
- **Canonical Mass source count** is not the number of prayer-card swipes. Ordinary Sung has 39 source sections; every source paragraph and MC cue retains its original identity when presented in multiple cards.
- **Curated presentation count:** ordinary Sung LIVE = 65 total / **64 normally visible**, or 65 when the second Confiteor is explicitly selected. An Introit-entry plan (Palm, Ash, Candlemas or independently certified Rogations) = **61 total** after removing only the four foot-of-altar presentation cards; 60 normally visible before further plan-authorized omissions. This does NOT discard the canonical source data.
- **Plan-dependent visible count** further omits Gloria/Credo when actually forbidden, suppresses Last Gospel, blessing and the optional second Confiteor as applicable. Counts must be computed from resolved Mass authority, not hard-coded across feasts.

## Status matrix — native reader scope vs curated Sung parity
| Source configuration | Curated LIVE presentation | Independent authority / required safeguard | Gate |
| --- | --- | --- | --- |
| Ordinary Missa Cantata (simple/incense), full Foot prayers | 65 / 64 normal | Original 39 sources; exact MC event registry, speaker/Schola clocks, no extra gestures | Automated + physical pilot outstanding |
| Ordinary Sung with Sunday Asperges / Eastertide Vidi aquam | 65 / 64 normal | Five R20 reader screens, six ASP events; season and Passiontide Gloria omission; original Foot handoff | Browser + source checked; physical pilot outstanding |
| Palm Sunday | 61 total / 58 normal | Seven Palm prelude screens; reception & procession personal, foot prayers + Last Gospel omitted | Browser + source checked; physical pilot outstanding |
| Ash Wednesday | 61 total / 60 normal | Ash blessings/recipients and strict Introit handoff; no fabricated lay action | Browser + source checked |
| Candlemas | 61 total / 60 normal | Seven candle/precursor screens; candle-state propagation to Gospel/Canon/Pater, independent from posture | Browser + source checked |
| Rogations procession/supplications immediately preceding Mass | **61 Introit-entry candidate, PR #1091**; visible varies with Gloria/Credo | Explicit selected R25 prelude and plan.massEntry=INTROIT; distinguish authorised public supplications from walking; purple votive does not gain Gloria; Sunday Credo only if source decision allows | Proposal; full mobile gate required |
| Explicit ordinary Mass then generic following procession | **65 candidate, PR #1091** | R29 seven source records / three structural screens; action/participation explicit; no invented feast-specific chant; ordinary blessing and Last Gospel retained | Proposal; full lifecycle phone gate required |
| Explicit Corpus Christi Eucharistic procession / Benediction | **65 candidate, PR #1091**, normal visible 61 | R26 eight records, Benedicamus replacing Ite, no blessing or Last Gospel; explicit processional state only, Pange lingua/Tantum ergo cues do not run on timers | Proposal; full lifecycle phone gate required |
| Requiem + Absolution or funeral | No 65 claim | REQUIEM overlay, Requiescant in pace, omission of blessing, funeral/presence conditional and burial-procession participation | Independent certified controller; form-specific acceptance |
| Holy Thursday + translation to repose | No 65 claim | Mandatum source insertion, Holy Thursday post-Mass graph, no normal blessing/Last Gospel, separate joining action | Independent native path, not ordinary cards |
| Nuptial Mass | No 65 claim | Spousal blessings after Pater and final blessing; specific insertion cards; never use 39-source projector blindly | Independent structure/phone acceptance |
| Ember days / extended readings | No 65 claim | Correct source order and multiple lessons rather than synthetic pair numbering | Canonical reading/proper test owner |
| Low Mass | No 65 claim | Distinct priest/faithful audible vs silent/response/posture objective states; Leonine prayer conditional on the appointed Low Mass | R18 and Low reader/form tests |
| Solemn High Mass | No 65 claim | Deacon/subdeacon vs celebrant position, response, Pax and minister deltas; no MC cue extrapolation | R18 and Solemn form/ceremonial tests |
| Good Friday | No ordinary LIVE model | Distinct rite; veneration, death genuflection/pause, role-specific Holy Communion, original Good Friday source | Dedicated source/phone reader |
| Easter Vigil | No ordinary LIVE model | Baptismal font actions, lessons, unique Mass entrance, Lauds and no synthetic ordinary beginning | Separate composite owner and phone gate |
| Unsupported or composite prelude/following-action pairs | Deliberately fallback / fail closed | Do not silently combine unrelated processions or ritual overlays | Negative regression required |
| MISSAL and SIMPLE | Not governed by 65-LIVE ownership | MISSAL bilingual parallel alignment; SIMPLE what is heard, source sections and mode-preserving navigation | Dedicated phone/mode-switch tests |
| Explicit `?aoLiveCards=48` | Retained and separate | The old 48-card model is a rollback, never proof of current curated-default acceptance | 48 phone regression |

## Cross-cutting UX/release acceptance — separate evidence from implementation
1. **Horizontal cards**: exactly one title-to-title transition, both directions, finger swipe; no accidental diagonal advance while vertical paragraph scrolling.
2. **Vertical paragraphs**: active source paragraph illuminated; adjacent paragraphs subdued, current cue stable at card top and bottom, no automatic source-section jump or artificial stretched prayer text.
3. **Timeline / prayer title**: all split cards have distinct navigable titles; title is not duplicated inside the reader. Preserve mode anchor on LIVE ↔ MISSAL ↔ SIMPLE, including Introit-only form state.
4. **Actor ownership**: M./S., V./R., priest action, voice/position and faithful gesture are cue-owned; no Schola advance or hymn ticker can infer a priest movement. Independent R20–R29 ceremonial state never masquerades as spoken Mass text.
5. **Cinematics**: source-boundary transitions and source-exact paragraph cues for Incarnatus, Consecration, elevations, bells, Passion kneeling, personal veneration; do not synthesize animations when no source event exists. Honor reduced motion.
6. **Liturgical text**: canonical Latin untouched by projector; French/English prayer display/source rendering separate. Correct Proper, Preface, commemoration, oration, historical/source witness and seasonal selection must be validated independently.
7. **Forms**: LOW vs Sung simple/incense vs SOLEMN must not share priest-movement assumptions; 1962 source-rubrical exceptions explicitly override generic posture profiles.
8. **Actual deployment**: a successful merge into GitHub main is NOT proof that a given phone has refreshed its cached/PWA/Android bundle. Physical-device low-light, liturgical live timing, scroll ergonomics, and ceremony observation remain unperformed unless a human reports them.

## Independent pipelines — no duplicate or conflicting ownership
- [#1080](https://github.com/Fulcanelli13/ad-orientem/pull/1080): four-form mobile release acceptance; do not replace its existing harness or overwrite its workflow.
- [#1083](https://github.com/Fulcanelli13/ad-orientem/pull/1083), [#1088](https://github.com/Fulcanelli13/ad-orientem/pull/1088): 1962 Preface selection and date-conditional authority. Those defects are NOT cured by modifying prayer card order.
- [#1082](https://github.com/Fulcanelli13/ad-orientem/pull/1082): formation Mass–Bible study; do not blend narrative/theological connections into 1962 primary Mass rubrics.
- Source-owned R20 Asperges, R22 Palm, R23 Ash, R24 Candlemas, R25 Rogations/Absolution, R26 Corpus and R27 Holy Thursday retain their lifecycle and gestures, independent of the Mass's visual projection.

## Gates still open
- True physical Android/iOS phone review, participant/priest action verification in a real 1962 Sung Mass, in-church timing with choir interludes; automated screenshots are *not* service evidence.
- Publishable release matrix with each liturgical form, both main languages, all option states and special-day scenarios. Green CI is not a substitute for full human visual review.
- Preface/Proper reconciliation tracked separately; independent UI/UX consistency work for prayer modules is not a Mass-card fix.
- Optional combined special ceremonies (e.g. unrelated following procession after Rogations) must remain excluded until the actual combination is source-authorized and tested.

**Audit rule:** a category counts as *fully covered* only when (a) canonical source owner is identified, (b) source- and form-conditional behavior is proved, (c) production app entry is exercised on a phone, (d) backwards/forwards and mode switches are checked, and (e) any required human in-church evidence is captured. Test existence alone is not completion.
