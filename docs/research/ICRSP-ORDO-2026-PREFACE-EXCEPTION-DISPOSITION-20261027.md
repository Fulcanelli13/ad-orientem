# 2026 ICRSP-style Ordo — exact Preface exception disposition (B01, 27 October 2026)

**Research and release-gating only.** Input: [production Calendar year audit #40450753867](https://github.com/Fulcanelli13/ad-orientem/actions/runs/40450753867), artifact `calendar-1962-2026-audit`, file `1962-2026-preface-review.json`, generated against Ordo PR #1739 commit `7088c31543717877baa9b5d284775e99b831578e`. Preserve canonical day identity, 1962 Mass reader, art assets and established Proper ownership. No auto-publication, no rewritten prayers and no second calendar.

## Verified totals

| Audit status | 2026 dates | Interpretation |
|---|---:|---|
| `RULE_TEXT_AGREE` | 117 | Heading, trilingual text and reviewed category agree; **0 editorially certified** |
| `SOURCE_CONFLICT` | 52 | Selected raw Proper Preface heading disagrees with the expected 1960 rubric |
| `UNMAPPED` | 194 | Insufficient source-scoped rule coverage; **not evidence of 194 defective Masses** |
| `NOT_MASS` | 1 | Good Friday, 3 April: distinct rite, not a Mass |
| `WITHHELD` | 1 | All Souls, 2 November: special Mass profile, out of general-principal-Mass comparison |
| **Total** | **365** | **365/365 days resolved, 72/72 independent Calendar checkpoints passed** |

### All 52 raw source-heading conflicts, assigned by owner

| Exact principal-Mass scope | Count | Next disposition |
|---|---:|---|
| Lent weekdays `Tempora/Quad1–4` | **22** | Existing source owner [PR #1747](https://github.com/Fulcanelli13/ad-orientem/pull/1747), named Quadragesima recovery; confirm against real 2026 dates and reader, **not a second fix in this PR** |
| Pentecost Vigil and octave `Tempora/Pasc6-6, Pasc7-0…6` | **8** | Existing source owner PR #1747, Holy Spirit recovery; no duplicate |
| Easter/post-Easter/Ascension `Tempora/Pasc0-1…Pasc6-0` | **12** | Existing [PR #1751](https://github.com/Fulcanelli13/ad-orientem/pull/1751), source-exact Easter Preface cases; **Ascension source separately attest** |
| Five named sanctoral feasts: **19 Mar, 25 Mar, 1 May, 7 Oct, 8 Dec** | **5** | Proper owner: Joseph, Marian, Rosary/Immaculate source-specific selection and text provenance; do not change unresolved source merely to satisfy audit |
| Advent Sundays **29 Nov, 6 Dec, 20 Dec** | **3** | Source-owner check of 1960 §494(b) Trinity Preface; raw `Communis` needs source retrieval, no display substitution |
| Sundays after Pentecost **7 Jun / 14 Jun** | **2** | **High-priority wrong named source**: `Tempora/Pent02-0r` contains `de Nativitate Domini`, `Tempora/Pent03-0r` contains `de sacratissimo Cordis Jesu`, both instead of the §494(b) Sunday Trinity Preface; verify donor path, original 1962 books, native reader and exclude feast-proper inheritance |
| **Total** | **52** | No calendar-only patch can certify Mass source corrections |

The **50 Common-heading conflicts** above exclude the two June incorrectly named headings. At least 30 conflicts have existing source-repair owners (#1747's 22 + 8); another 12 fall within the Easter/Ascension investigation represented by #1751. These counts are disjoint in this baseline, but do **not** imply those PRs are merged, production-failing tests are green or every case is fixed.

### Full 194 genuinely *unmapped* source decisions

| Research family | Dates | Treatment |
|---|---:|---|
| Individual Sanctoral feast, not yet source-certified | **142** | Review particular/seasonal priority; do not infer `COMMUNIS` from saint name or vestment colour |
| Unmapped named Temporal days | **19** | Includes 1 post-Easter Sunday, 1 Corpus Christi, 3 September Ember days and 14 Advent days. Distinguish proper, seasonal, and valid Common Preface |
| BVM Saturday Common `Commune/C10*` | **12** | Determine actual form/season and any Marian versus common Preface privilege; `Commune` source-path title alone is not an authorization |
| Generic feria `:feria:4:w`, outside the witnessed Paschal/Ascension cases | **10** | Includes Jan/Pre-Lent; borrowed Sunday proper and colour alone do not certify seasonal entitlement |
| Exact source-anchored Paschal/Ascension inherited ferias | **9** | Candidate for independent seasonal rule match, **not yet published**; see precise dates below |
| Later optional Prefaces in raw source | **2** | `2026-06-24` Saint John Baptist; `2026-11-09` Dedication of a Church — see 2020-source hold |
| **Total** | **194** | No silent `UNMAPPED`→`MATCH` promotion |

**Nine candidate inherited white IV-class ferias with matching complete Latin/EN/FR source text:** `2026-04-15` `04-16` `04-17` (`Tempora/Pasc1-0`, Paschalis), `04-20` `04-23` (`Tempora/Pasc2-0`, Paschalis), `05-06` `05-08` (`Tempora/Pasc4-0`, Paschalis), `05-21` `05-22` (`Tempora/Pasc6-0`, Ascensio). **Do not decide solely from `:feria:4:w`.** Before promoting, require an independently verified liturgical-season date range, exact reused source path/selection, no overridden form, and original 1960 §§489(b), 490(b) applicability. This is a high-confidence investigation queue rather than nine approved user-facing additions.

**2020 optional-preface boundary:** `2026-06-24` has `de S. Joannis Baptistæ`; `2026-11-09` has `in Dedicatione Ecclesiae` in the raw selected texts. These are not merely headings missing from the 1960 `classify1962PrefaceHeading` regex. [Holy See Quo magis decree](https://www.vatican.va/roman_curia/congregations/cfaith/documents/rc_con_cfaith_doc_20200222_decreto-quo-magis_en.html) and [interpretive note](https://www.vatican.va/roman_curia/congregations/cfaith/documents/rc_con_cfaith_doc_20200222_nota-decreto-quomagis_en.html) identify seven **ad libitum** Prefaces approved in 2020 (some existed as particular grants before then). Keep them distinct from the **original general Roman 1962 mandatory baseline**, and from any legally applicable later permissions, institute/local usages, and particular books. They may not be silently treated as universal or mandatory. No current-live permission judgment is made here.

### Execution/release sequence

1. Re-run the current 2026 production audit **after** actual owner-specific source corrections (#1747, #1751 and any later authentic repairs) land. Compare original source identity, Latin/EN/FR and true reader-facing selection; no raw heading-only fixes.
2. Separately collate 7 and 14 June original Sunday Proper selection and two named source headings; hold until proper/seasonal owner is established.
3. Investigate the **9 source-anchored** Paschal ferias using 1960 §§489–490; add a narrowly tested read-only rule only once full annual applicability is established, without a duplicate day resolver.
4. Group-screen the 142 sanctoral cases using named original 1962 Proper first; retain per-form/local/2020 optional distinctions. Group screen 19 Temporal, 12 BVM and 10 generic ferias separately.
5. Keep current Ordo release status **DRAFT** until Required Main, R17 and App CI pass (currently blocked by unrelated Sacred Art GitHub Actions write-permission hygiene issue [#1756](https://github.com/Fulcanelli13/ad-orientem/issues/1756)), plus manual EN/FR mobile visual acceptance. No bypass of `test:tree-hygiene`.

**Primary rubric:** [1960 General Rubrics of the Roman Missal, §§482–499](https://isidore.co/divinum/www/horas/Help/Rubrics/Missal1960%20rubrics.html). `RULE_TEXT_AGREE` is an evidence signal, **not** independent certification of a source edition, particular calendar, valid current permissions or reader completeness.


## B02 — production source correction reconciled (27 October 2026)

**This section supersedes B01's operational counts while retaining B01's original findings as an audit trail.**

Mass source [PR #1783](https://github.com/Fulcanelli13/ad-orientem/pull/1783) MERGED as 5564ecd5fbcab7c6d1558d6142f217eeefdffb14 after source-authenticated 1960 tests and all Required Main, App, Calendar and R17 checks passed. The narrow source-owner fix selects the authenticated Trinity Preface for **7 June 2026** (Tempora/Pent02-0r) and **14 June 2026** (Tempora/Pent03-0r); all 50 other Sundays are outside its intervention scope.

The [fresh full-year Calendar audit #40459791585](https://github.com/Fulcanelli13/ad-orientem/actions/runs/40459791585) PASSED on Ordo head e2a312775c3fed25998b34f74875f36ff83ad39a. It resolves 365/365 dates with 0 missing titles/ranks/colours and 72/72 independent Calendar checks matched. Full-year independent source certification is **not complete**.

| Preface audit status | B01 before | B02 after | Change |
|---|---:|---:|---:|
| Rule/text agreement (not certified) | 117 | **119** | +2 |
| Raw source conflict | 52 | **50** | -2 |
| Unmapped source rule | 194 | **194** | 0 |
| Good Friday non-Mass + All Souls held | 2 | **2** | 0 |
| Total audited dates | 365 | **365** | 0 |
| Fully editorially certified Prefaces | 0 | **0** | 0 |

Remaining **50 source conflict owners**: 22 Lenten weekdays plus 8 Pentecost Vigil/octave = 30 in unmerged PR #1747; 12 Easter/Ascension cases in stacked PR #1751 or separate source-owner investigation; 5 named sanctoral cases; 3 Advent Sundays. Historical B01 entries for the two June wrong-named Sunday Prefaces are now resolved, **not outstanding**.

Remaining **194 unmapped cases** retain all their separate source/permission/particular-Ordo holds, including later 2020 optional Prefaces. Gloria/Credo screen remains 295 Gloria supported, 256 Credo supported, 220 both supported, 145 dates with at least one withheld. Screening is not local/votive permission.

**Production sequencing:** source PR #1747 before dependent #1751 then #1761, rerun this actual 365-date audit after each source merge, and never introduce a Calendar-only fake Preface correction. Unmergeable historical broad PR #1083 remains research rather than a second live global resolver. The €0 art security issue #1756 was resolved in merged #1765; permanent art originals remain in guarded research branches and production workflow permissions remain read-only.

**Release hold:** Ordo PR #1739 remains DRAFT and unmerged pending supported source gates, EN/FR mobile visual acceptance and explicit approval. No art/photo, local custom, 2020 Preface or Office entitlement approval is implied.
