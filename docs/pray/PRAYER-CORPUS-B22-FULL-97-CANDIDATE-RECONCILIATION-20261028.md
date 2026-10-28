# Prayer Corpus B22 — Full 97-Group Reconciliation
**28 October 2026 · research-only · no reader modifications**

## Purpose
The 97 entries in `data/pray/prayer-corpus-editorial-acquisition-master.v1.json` were collected before B16–B21. Its `ADD`, `ADD_LATER` and `ALTERNATIVE` are **historical editorial proposals, not today's outstanding-to-do counts**. Do not rewrite, flatten or delete those original decisions. This document and `data/pray/prayer-corpus-release-crosswalk-b22.v1.json` supply a second, current assessment for **every exact AO-AQ identifier**.

## Audited status (97 / 97 mapped)

| Current assessment | Rows | Meaning |
| --- | ---: | --- |
| LIVE_EXACT | 6 | Exact candidate work released to an existing reader, with named merged PR witness |
| EXISTING_OWNER | 25 | Already tracked by a canonical work, Novena, liturgical or supplemental owner; **not** a proof every alternative is on screen |
| INTENT_COVERED | 21 | Practical need already served by a different existing prayer; proposed historical alternative **not** imported |
| OTHER_MODULE | 5 | Belongs in Calendar, Divine Office or Holy Week rather than copied into Prayer |
| DISTINCT_CANDIDATE | 5 | Possible new guided devotional experience, **research only** |
| SOURCE_BLOCKED | 12 | Source recension, textual integrity, rights, translation, authorship or doctrine needs resolution |
| EDITORIAL_DEFER | 19 | Niche/diminishing return; not worth new UI now |
| EXCLUDE | 4 | Deliberately outside scope |
| **Total** | **97** | **No rows omitted or double counted** |

**57/97 already released, served, owned, or assigned to a more appropriate module.** The five candidates are the only present **format-distinct growth queue**, not five new prayers approved for immediate release. 12 held entries are *source work*, not 12 automatic additions. 19 are deliberate economy-of-prayers decisions.

### Recent release evidence, not inferred from legacy flags
- #1871 Five Wounds guided chaplet; #1873 full 33-Our-Father Precious Blood chaplet.
- #1874 three priest intercessions (one anonymous 1914 English, two 1910 Raccolta EN/LA).
- #1864 original Aquinas `Concede mihi` before reading and Lasance *After Meditation*; **Lasance's longer Before Meditation remains HELD**, so AO-AQ-078 is source-blocked despite same practical purpose served.
- #1859 historically sourced Ignatian Suscipe in existing Morning Offering.
- #1879 B20 sick, family and canonical St Joseph difficulties; #1880 B21 peace, travel and state-of-life decision; neither changes original frozen 48 canonical works.
- #1799 Pius X 1905/1913 historical Morning/Evening, distinct from unimported Lasance and Baltimore wording alternatives.
- Existing ownership register includes 48 canonical prayer records and 16 original Novena programmes plus separately added programmes. **Do not sum these as a new number of unique public prayers.**
- The old B20/B21 manifests still say `STAGED` because they are historic branch-era admission snapshots. The merged PRs and production commits are the current release evidence. Do **not** rewrite historical snapshots to falsify their original stage.

## Five actually distinctive candidates (no release approved)

| Rank | ID | Candidate | Why it is different | Exact gate and destination |
| --- | --- | --- | --- | --- |
| 1 | AO-AQ-053 | **St Joseph — Seven Sorrows and Seven Joys** | Seven sequential paired mysteries, unlike Joseph Litany, *Ad te* or Joseph novena | Match seven pairs and closing prayers against a single historical *Raccolta* edition; preserve separate bilingual witness approvals; use **existing St Joseph / guided sequence** |
| 2 | AO-AQ-062 | **Holy Face nine-day novena** | Nine-day reparatory journey, distinct from one-off Golden Arrow | Compare the candidate Sensus novena with **1887 Manual of the Archconfraternity** original; avoid representing nonmatching recensions as one original; use **existing Novenas reader** |
| 3 | AO-AQ-065 | **Montfort consecration preparation** | A 12-day preliminary phase and three weeks, with a meaningful end date | Base theological spine on *True Devotion* §§227–233 and historical original language; **do not copy copyrighted 1987 Montfort Missionaries English** or confuse a modern 33-day day-by-day schedule with Montfort's own words; use **existing Marian/Calendar programme** |
| 4 | AO-AQ-066 | **Night Adoration at home** | Monthly one-hour household practice, not just another stand-alone prayer | Compare Fr Mateo Crawley-Boevey's **1927/1930** descriptions; explicitly differentiate watching at home before Sacred Heart image from Eucharistic Adoration at church; attach only to **existing Adoration timer / First Friday** |
| 5 | AO-AQ-029 | **Little Crown of Infant Jesus** | Bead sequence might justify guided treatment | Verify bead count, exact sequence and independent practical demand; otherwise defer to avoid chaplet proliferation |

### Source leads for the five
- St Joseph: historical *Raccolta* §115 (edition numbering to reconcile); Oblates of St Joseph's seven-pair devotional witness: https://www.osjusa.org/prayers-to-st-joseph/seven-sorrows-and-joys-of-st.-joseph . Modern Oblates wording is **not** automatically the historical *Raccolta* text.
- Holy Face: acquisition proposal https://sensusfidelium.com/2022/02/18/novena-to-the-holy-face-of-jesus-february-20-28/ ; primary-edition scan lead referenced at https://visitationproject.org/pages/holy-face-novena , which links the 1887 Archconfraternity manual. The source identity must be resolved before mining nine days.
- Montfort: official Congregation translation/explanation at https://montfort.org.uk/Writings/TD.php confirms the 12+three-weeks plan but expressly claims copyright **1987** for that edition. A separate historical public-domain English or original French text must be chosen, with licensing verified.
- Home Night Adoration: Fr Mateo's *Jesus, King of Love*, chap. IV (1927 appeal), https://www.sing-prayer.org/jesus-king-of-love/jesus-king-of-love-chapter-4-night-adoration-in-the-home . The historical text calls for an hour at home, preferably near First Friday. It does not replace exposition or liturgical Eucharistic Adoration.
- Little Crown: pending exact witness and production-value decision. Do not use an unnamed third-party bead-count diagram as a source.

## Next implementation sequence and stopping conditions
**B23:** high-volume two-subject collation of **St Joseph + Holy Face**, using 1857 / 1910 and 1887 historical evidence respectively. First output is two structured source edition comparisons with original words, prayers vs meditations, closing text, rights and EN/FR/Latin status. Only then admit an existing-owner guided extension, subject to phone tests.
**B24:** Montfort rights and original-text calendar sequence audit, 33-day planner mapping without writing fictional words for Montfort. Prefer reuse of existing verse/Prayer texts.
**B25:** Fr Mateo household practice as an optional Adoration timer preset only if its context is correct and it adds value.
**B26:** reconsider Little Crown only against concrete demand and verified source.

Stop expansion if the candidate merely restyles an existing prayer, repeats another litany, adds a devotional niche with low repeat use, or requires unsourced vernacular text. Never create top-level family cards for these candidates. Unrelated Morning/Evening, Mass, Scripture, Office, Rosary and Novena owners must not be disturbed.

## Release contract
This B22 audit **must not** update the historical acquisition master, original decisions, public Prayer texts, canonical 48 prayer IDs, Novena content, reader navigation, styles, package scripts or deployments. B22 alone is a research-only crosswalk. Its 97-row test enforces one-to-one IDs, immutable original decisions, status counting and no invented public release assertions.

**Edition note:** None of the external online texts or scans listed here has been silently certified as fully collated print by this register. The new report is an editorial coverage audit, *not* a photographic source certification and not an assertion that all 57 entries have UI buttons.
