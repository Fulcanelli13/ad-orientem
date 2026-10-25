# ICRSP France — 855-article metadata census and source-quality assessment
Date: 25 October 2026 · Owner: [#1665](https://github.com/Fulcanelli13/ad-orientem/issues/1665) · Draft [PR #1666](https://github.com/Fulcanelli13/ad-orientem/pull/1666).

## Verified completion and storage

Complete ICRSP France main-index census: **855 index article-link occurrences, 855 unique article IDs/URLs, 0 exact URL duplicates, 0 raw article IDs absent from the anchor list.** Section grouping is 193 Temporal, 450 Sanctoral, 61 Commons, 63 local propers, 17 votive/Requiem, 3 Ritual, 16 Office, 52 documents.

The first metadata pass fetched **all 855 article pages**, recorded H2 headings and HTML SHA-256 fingerprints, with **0 fetch failures**. Window 0–199 is committed in `data/source-text/icrsp-france-index-discovery.v1.json`. Successful remaining windows were 200–399, 400–599, 600–799, 800–854. A read-only combiner reconciled the five snapshots under [Actions run 40202997017](https://github.com/Fulcanelli13/ad-orientem/actions/runs/40202997017), producing artifact `icrsp-855-metadata-verified` (90-day Action artifact retention). A separately saved complete JSON file is supplied with the ChatGPT response; **the final 855-record combined JSON is not yet committed to the repository**. The base 855-link index is permanent in GitHub.

The first merge failed only because the raw index HTML SHA-256 changed between requests. Independent inspection confirmed the complete ordered article IDs, URLs, labels and index-section assignments matched across all four uploaded windows. The successful consolidation compares these semantic identifiers exactly and *still preserves* the differing HTML hashes. A change in links, titles or category causes failure.

## Screened metadata distribution

| Source section | Article count | With H3 Commentaires |
| --- | ---: | ---: |
| Temporal | 193 | 189 |
| Sanctoral | 450 | 449 |
| Commons | 61 | 58 |
| Local propers | 63 | 60 |
| Votive / Requiem | 17 | 12 |
| Ritual | 3 | 3 |
| Divine Office | 16 | 12 |
| Documents | 52 | 0 |
| **Total** | **855** | **783** |

Additional structural observations: **23 distinct articles** show a heading for a second or subsequent Mass formulary; **104 article links** have abbreviated day-of-week labels that must be resolved against their full page headings and surrounding liturgical context. These are *structural hints*, not 23 certified additional 1962 formularies or 783 cleared/commentary works.

## Author detector blocked

The naive whole-HTML detector marked Guéranger, Schuster and Parsch on **all 855 pages**, including reference documents. Such names are site-level contamination and are **not article-specific author evidence**. The combined JSON renames these as `unvalidatedWholePageNameMentions` and explicitly sets `authorAttributionCertification: NOT_CERTIFIED`.

Actual identification must be restricted to a named author/work block in a specific page. The manually inspected First Sunday of Advent has three explicitly headed sections for Guéranger (*L'Année liturgique*), Schuster (*Liber Sacramentorum*) and Parsch (*Guide dans l'année liturgique*). Even these are hosted text witnesses; they do not certify the original edition or translation/republication rights.

## New substantive source seeds

See `data/source-text/icrsp-france-two-article-editorial-evidence.v1.json`:
- Advent I: 3 explicitly attributed commentary divisions and **10 liturgical proper component witnesses** with Latin/French presence and precise Scripture citations, but no original text imported or comparison certified.
- Candlemas: **7 candidate Scripture/theological cross-references** from traditional Office antiphons, scriptural lessons and processional texts; **3 ceremonial observation seeds** for the blessing/procession, omitted introductory Mass prayers, and two adjacent candle-holding descriptions requiring 1962/form/actor adjudication.
- The Candlemas typology entries feed the existing *separate* biblical-parallels compendium, **never narration of Historia Salutis**.
- **No Mass reader cue, posture, Schola programme, Calendar classification or liturgical text modified.**

## Fail-closed edition problems

The index title for `a0030_nouveau` is 'Sam. saint · ap. 1955', while its H2 article title is 'Samedi Saint après 1951'. Both are retained in the 27-record pilot with a `SOURCE_INTERNAL_CONFLICT` edition status. Historical pre-1955, post-1955, 1960/1962 and post-1962 records must be distinguished by source evidence, not by `_ancien` / `_nouveau` suffix.

The 52 study/reference entries have title-only grouping in `data/source-text/icrsp-france-reference-52-triage.v1.json`; their publication authority, date and cited texts are not certified.

## Remaining gates before publishing anything

1. **Author-block and section extraction** on all 783 pages with commentary headings (structured claims and exact source locations, *not* wholesale republication). Verify explicit work attribution and separate Mass propers/Office.
2. **Canonical crosswalk** to existing registry IDs. First compare 193 Temporal + 450 Sanctoral and the 63 local-proper records, assigning EXISTING/NEW_EVIDENCE/CONFLICT/EDITION_VARIANT/RIGHTS_BLOCKED, with exact target record IDs.
3. **Textual collation** only for owner-requested gaps or conflicts; independent 1962 sources prevail on contemporary rubric compliance. Scope rites by Mass form, actors, date and local privilege.
4. **Authentic quotation/rights gate** for Guéranger, Schuster, Parsch, any third-party French translation, imagery and modern arrangement. Default is metadata + outbound source link only.
5. **Domain-owner editorial review** and existing CI before Calendar, Mass Explorer, Scripture compendium or special-day guides acquire anything new.

Actions workflow `icrsp-source-index.yml` is now manual-only, read-only, to prevent redundant high-volume recrawls on routine research commits. Complete metadata is delivered outside GitHub plus a 90-day read-only artifact; the publication source-of-truth on main is unchanged.
