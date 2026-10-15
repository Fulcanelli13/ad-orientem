# Historical Saints of the Day — original v43.33 311-instance recovery

Date: 15 October 2026 · [Saints draft PR #1227](https://github.com/Fulcanelli13/ad-orientem/pull/1227)

## Result: exact historical blocker retired

The **real** old Saints-of-the-Day art runtime was recovered from the fully reassembled `legacy/v43.33.parts/` historical baseline. This is not a table inferred from archived month totals.

Source and method:
- Complete frozen HTML: **37,954,985 bytes**, SHA-256 **`7032ed01a76c747805a81d4290cf85fb8692153568767ad9d1bd66f1dc88ada3`**.
- Source parser: original v43.33 Browserify module 5, `parseCalendarSources`, not a fresh reimplementation. Calendar sources downloaded at precisely pinned Missale Meum revision `f43359b7a79a5a299158651eedf75cdaf0e43c94`.
- Historical editorial reducer: original inline `ao-saint-art-runtime-v1-js`, run unchanged in a sandbox, `SAINT_COMPONENTS.generate()`; no DOM renderer, calendar owner, network Commons promotion, or live app code modified.
- The extraction is reproducible from `tools/saints/extract-v4333-original-sanctoral.mjs`. Each CI run reconstructs the archived HTML, verifies its SHA, executes both original parsers and **asserts deep equality with the version committed to GitHub**, rather than comparing only the numeric counts.

The source's fixed Sanctoral block contains **338 original source observances across 274 nominal dates**. The original historical Saints *art* reducer excludes **38 out-of-scope observations** and applies **27 explicit date-level art-identity overrides**, then yields exactly **252 saint-art dates and 311 individual/group component occurrences**. All **12 historic monthly date/component targets pass** independently; none was padded.

The permanent, individually serialized original inventory is:

[**`data/saints/historical-v4333-311-components.recovered.v1.json`**](https://github.com/Fulcanelli13/ad-orientem/blob/saints/2026-10-15-identity-and-holiness-pilot/data/saints/historical-v4333-311-components.recovered.v1.json)

For each historical date it preserves original raw source IDs, English titles and inclusion/exclusion reasons. For each one of the **311 distinct component IDs** it preserves the historical canonical ID, display name, representation/group model, corresponding source date, explicit override and original identity QA state. The old app produces **307 distinct historical identity keys**; this must **not** be described as 307 unique canonized saints. The historical component representations include **253 'individual'**, **54 exact groups**, **three exact-liturgical-tradition** and **one hybrid exact-plus-group**. These labels reproduce the old engine; they do not settle every historical martyr identity or canonization question.

An archived `RESOLVED` identity means only that v43.33 assigned an ID; it does **not** certify that the person is independently source-verified, nor that an old historically 'approved' artwork still satisfies the user's later 0–5 original-specific scores, present exclusions, image rights or crop rules.

## Original history vs the actually observed 2026 Calendar

The independent source-join `tools/saints/join-historic-components-to-observed-year.mjs` reads the committed 311 occurrences and **365 actual 2026 day-resolver records**, matching original fixed `sancti` source IDs against the observed principal and named commemoration source IDs. It refuses title-substring identity substitution and deliberately leaves all new app person and artwork IDs null.

The initial joined audit conserved **311 historical components on 252 dates**, represented by **314 historical source-observance occurrences on those dates**:
- **142** exact source IDs observed as principal, **99** exact source IDs found as named commemorations, and **73** not observed under the identical source ID on that nominal day.
- Date-level evidence: **142** dates with at least one principal match; **60** dates with matches through commemoration only; **50** dates without an exact match. These are *not 50 missing saints*.
- Of the 50 no-exact-ID dates, **47** have an observed Temporale principal (including **31 Sundays**). Three have a Sanctoral principal with the same named subject/source path but different rank or colour code in the newer resolver: **St Ubaldus (16 May, old class IV versus new class III), St Didacus (13 November, old IV versus new III), St Josaphat (14 November, old white versus newer red)**. These are explicit version-change review cases, not confirmed saint-ID absence.
- Original historical groups/tradition presentation remains attached to the 311 component records (58 represented as something other than 'individual'). Explicit historic override assignments cover 47 components across 27 dates.

These 2026 observations establish source-display behaviour in one year, **not an independent complete 1962 Sanctoral and commemoration rubrics certification**. Transfers, locally applicable calendars and future years remain separate Calendar-source checks. Calendar PR #1226 remains the legal/rubrical owner.

## Exact handoff and next job

- **Sacred Art PR #1231 (W59/W62/W63)** now has all 311 real component/date/identity records, not just expected monthly counts. Its existing 281 physical-original master catalogue, historical painting mappings, prior 0–5 user ratings, and original rejection list must be joined to these 311 IDs. The art team owns original images and approves them; no portrait or artwork is published here.
- **Calendar PR #1226** may consume exact nominal historical source IDs where useful, but should never add the old artwork slots as liturgical observances or duplicate its own modern Saints/Doctors registries.
- **Saints draft PR #1227** owns the source-preserving link into the current Map of Saints. The six researched EN/FR profiles and eight mapped physical Place pins remain intact and separately governed; the 311 historic rows are research data, not 311 automatically published biographies.

The real next acceptance gate is **identity-by-identity reconciliation of historically generated keys against verified person/group IDs**, then source-grounded biographies and user-approved image matches. Deriving coverage solely from historical 311/311 component recovery would overstate editorial and art readiness.

No production Calendar/Mass/Place/assets or live GitHub Pages files were modified or merged for this recovery.
