# ICRSP B23 — 233 original webpage bodies screened, 20 new topics read, 100 ranked for editorial review

**26 October 2026** · Owner: [ICRSP source PR #1666](https://github.com/Fulcanelli13/ad-orientem/pull/1666). **Research only — not an app/content publication.**

## Actually completed, not merely prepared

| Stage | Evidence / result | Editorial interpretation |
| --- | --- | --- |
| Full website article inventory | **855 indexed article IDs**, complete metadata | All identities catalogued, not all texts critically read |
| Source commentary structures | **783 articles / 2,856 commentary panels** in existing durable archive | Source labels and author candidates, not original authorship approval |
| Prior unique articles with a directly read subject | **93** across the B10–B22 six-strand ID audit | One or more genuine article prose excerpts inspected, not all panels |
| B23 new substantive direct source reading | **20** new article IDs and source-specific topical observations, no overlap with 93 | [Source observations](../source-text/icrsp-france-b23-twenty-additional-direct-commentary-topics.v1.json) now raise directly read sample to **113/783 (14.4%)** |
| B21 prior automated body lexical scan | **140** distinct articles / **535** panels, from B20's existing 160 selection | Automatic keyword/body-hash signals only, not human review |
| B23 completed automated body lexical scan | **233** genuinely distinct articles / **1,072** panels; 5/5 shards passed, **zero fetch errors, zero panel-count mismatches** | [Permanent B23 evidence](../source-text/icrsp-france-b23-233-automated-commentary-signals.v1.json); source bodies transiently scanned, prose not copied |
| Total distinct articles with *automated* body screening in B21+B23 | **373** (140 inside B20 + 233 outside B20) / **1,607** inspected panel instances | A subset of the earlier 783 pages and 2,856 structural panels; **not additional articles or independent approved content** |
| Remaining B23 human-source-review opportunities | 213 of 233 after 20 direct reading records | A stratified [next-100 priority view](../source-text/icrsp-france-b23-next100-human-editorial-priority.v1.json) is staged; **100 ranked only, not read** |
| Publication and legal gates | **0** newly approved theological/explanatory articles, **0** original-source translation rights cleared, **0** app code/content updates | Formal acceptance by the existing app domain owners still pending |

## How B23 was executed and preserved

The corrected 233-ID input came from [B22's deduplicated manifest](../source-text/icrsp-france-b22-233-distinct-source-body-scan-queue.v1.json), which excluded 17 already-reviewed Lent/Post-Pentecost article IDs omitted by the earlier 250-list deduplication.

The new **read-only five-shard workflow** [Actions run 40305221241](https://github.com/Fulcanelli13/ad-orientem/actions/runs/40305221241) retrieved those 233 articles at a polite rate (3.5 seconds between requests in each shard). It reused the established source-article parser. For each source, it recorded the exact URL/article ID, HTML hash, commentary panel label, normalized body SHA-256, body length, candidate work-family label and vocabulary *hit categories*, with offsets and counts. **Raw ICRSP French commentary prose was never persisted.** Its five shard reports were independently downloaded, their 233 identity sets, 1,072 panel counts and 0 errors inspected, and finally reconciled against the exact existing source-ID manifest.

The corpus contains **65 excess occurrences of identical normalized panel-body SHA-256s** within this 233-article scan. This suggests reusable/repeated commentary bodies; it does **not** automatically establish the same printed work, liturgical proper, authorization or theological source. The repeat evidence should drive editorial deduplication, rather than reading each repeated body anew.

The [one-time archive workflow 40306016888](https://github.com/Fulcanelli13/ad-orientem/actions/runs/40306016888) then committed the complete **233-source, 1,072-panel, metadata-only** document in the existing branch. After validating its contents, the temporary `contents: write` workflow was **deleted** to restore repository governance. The original read-only B23 scan workflow remains; the source-of-truth data no longer depends on 30-day expiring Actions archives.

### Source-relevance signal distribution

These figures count **panel instances** showing a rough literal lexical pattern in the French source; an individual panel can appear in many categories.

| Keyword family | Panel instances |
| --- | ---: |
| Saints’ cult/history | 734 |
| Liturgical Calendar history | 591 |
| Customs, processions, blessings | 483 |
| Stational churches, Roman sacred places | 395 |
| Patristic names or Fathers references | 332 |
| Historic edition scope / dates | 238 |
| Scripture figures/parallel language | 279 |
| Period rhetoric requiring contextualization | 293 |
| Sacred art/history | 94 |

None of these values is an independently authenticated place, saint, original ancient citation, relevant practice, rubric, or missing feature in Ad Orientem. The lexical patterns have false positives and can match polemical/historic prose; all must be reviewed against their source context and actual existing owner content.

## Twenty new directly read source topics

The new [20-row research table](../source-text/icrsp-france-b23-twenty-additional-direct-commentary-topics.v1.json) covers **5 Temporal, 5 Sanctoral, 6 Commons, 4 local propers**.

**Calendar/Mass Explorer:** Thursday Easter Octave themes of baptismal initiation and Philip; an explicitly abolished pre-1955 Sacred Heart octave (which includes modern John Paul II catechesis); Advent Ember Friday and December 21 concurrency; the Christmas three separate Masses; the feast of St Stephen directly following Christmas.

**Saints:** St Timothy's calendar reception; Gregory the Great's Pastoral Rule and liturgical cult; Cyril of Jerusalem and catechumenal theology; St Lawrence of Brindisi's twentieth-century Doctor title and ©2011 papal insert; St Odile's distinctly Alsatian local observance.

**Existing Commons / reference:** Apostles' Common in the Roman Breviary (not a Mass source); Parsch's explanation of a church dedication; Marian Breviary Common; two separately indexed **abolished Apostles' Vigil** pages, `a0045_nouveau` and `a0304_ancien`, with potentially repeated Parsch content (body hash to adjudicate); a Virgin `Dilexísti` Common from Schuster's theological exposition.

**Local particular cases:** St Joseph Cafasso's 1962 supplementary rather than universal feast status; St Gengoult of Lorraine and an unverified legend; Nancy's *Notre-Dame de Bonne-Nouvelle* Marian statue, reported miracle and 1955 votive/local changes. None is promoted to a universal 1962 feast or a new sacred place.

Two editorial prohibitions are especially concrete: the former Apostles' Vigils do **not** become 1962 Mass forms simply because the website retains full texts, and the St Lawrence of Brindisi page mixes a 1962 feast presentation with **©2011 Vatican catechetical material**. The latter cannot be republished or used as liturgical authority by default.

## Next editorial queue and actual completion gates

A distinct [100-article human review queue](../source-text/icrsp-france-b23-next100-human-editorial-priority.v1.json) has been derived mechanically from the 213 not-yet-directly-read B23 subjects (20 Temporal, 60 Saints, 10 Commons, 8 particular propers, 1 Votive/Requiem, 1 Office reference). Ranks use presence of specific topic keywords, substantial source-panel bodies, repeated hash penalties and historic edition labels. **These are heuristic source leads, not new verified themes or approved text**, and the original 233-ID master stays unchanged.

The release-oriented strategy is to have existing Calendar, Saints, Mass/Common and reference owners use this queue to examine *actual named paragraphs*, verify the original edition and author, compare the substance with existing user-facing descriptions and decide whether there is a genuinely absent explanatory note. Rights and canonical liturgical authority must pass separately; no AI-produced commentary is presented as the Fathers' authentic words. A successful review produces a specific source-grounded owner decision and, only after approval, usable content—not another free-standing explanation registry.

Tests: `tests/test_icrsp_b23_twenty_source_topics.py`, `tests/test_icrsp_b23_233_persisted_signals.py`, `tests/test_icrsp_b23_next100_editorial_priority.py`.

**Production status: unchanged.** The existing Mass reader, Calendar, Saints, Customs and Scripture correspondences stay under their own owners. No new user-facing commentary has yet passed all gates.
