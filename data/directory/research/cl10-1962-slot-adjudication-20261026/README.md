# CL10 — source-scoped 1962 Missal evidence adjudication

**26 October 2026.** Stacked on CL9 PR #1745 → CL8 #1744 → CL7 #1742.

CL9 identified 85 candidate Mass timetable rows associated with nine owner/parish sources that explicitly describe the Missal edition at slot or liturgical-programme scope. CL10 has now **individually matched all 85 rows** to the original 28-column historical timetable and the nine owner pages' day/time witness registry, including a second first-party book witness where necessary.

This is an **accepted research evidence claim**, not a public release nor a claim that every historical Mass still takes place.

| Decision | Timetable rows |
|---|---:|
| Accepted first-party book evidence, with time/slot or parish-programme scope | **77** |
| Accepted first-party 1962 evidence **conditional** on date (St John Cantius two Sunday slots, excluding 1st Sunday) | **2** |
| Held: weekday interpretation from one compressed timetable code on St Mary Kalamazoo website | **6** |
| **Total adjudicated** | **85** |

**79 of the 85 now have accepted source-scoped 1962 / John XXIII Missal evidence.** They represent **nine** historical source/group IDs, not 79 separate church buildings. The six St Mary Kalamazoo weekday records are specifically held because the site renders weekday lettering as `M S a` without independently legible individual weekday labels. Its 08:00 Sunday Low Mass and 12:00 Sunday High Mass are independently confirmed on the same owner page.

**Important: the frozen CL2 class database retains its original three owner-accepted source-level 1962 witnesses, unchanged.** The 79 additions are a *separate, narrower, celebration-row evidence ledger*, not a modification to the `classification_source.accepted_missal_edition` fields. They must never be added to three to claim 82 accepted sites.

## Owner sources and independent scope

1. Versailles Notre-Dame des Armées, 19 programme-matched rows. Owner's separate liturgical-policy page affirms the liturgical books of 1962; main Mass list is expressly **outside school holidays**, with 2025–2026 timetable reference. Does not establish exact recurrence for future school periods.
2. Huntsville Our Lady Help of Christians, 11 programme-matched rows. Homepage explicitly identifies the 1962 liturgical form and all candidate regular times, including first-Friday additional 06:45; monthly calendar can override.
3. St Louis Oratory of Ss Gregory and Augustine, 15 programme-matched rows. Canonical pastoral-programme page names 1962 Missale Romanum and separate current regular schedule. Summer 2027 changes cannot be ignored in future recurrence calculations.
4. Kalamazoo St Mary, two directly supported Sunday rows; six weekday schedule rows *held*, despite historical researcher text saying corroboration exists, until explicit weekday-level primary evidence is reviewed.
5. London Oratory, seven explicitly labelled 1962 slots; other Latin Masses at same church are **not automatically** 1962.
6. Chicago St John Cantius, six source-labelled 1962 candidate entries, two **conditional Sundays**: on each first Sunday of a month, those two time slots use the **2002 Missal instead**. The source is a mixed-Missal programme.
7. Wilmington St Patrick, six source-labelled 1962 timetable entries; this does not apply to other Downtown Catholic churches or special unlisted events.
8. Vannes Saint-Patern, five weekday/first-Saturday entries explicitly within owner `missel de 1962` section. Earlier disagreement between Sunday sources is not solved by these five.
9. Oakland St Margaret Mary, eight entries under Extraordinary Form, expressly equated on the official page to the Missal of **Pope John XXIII**. The 10:30 Latin Mass is ordinary form and does not receive a 1962 label.

## Rebuild / validate

From the repository root, Python 3 stdlib only:

```sh
python3 tools/directory/rebuild-cl7-research-index.py --output /tmp/ao-cl10.sqlite
python3 tools/directory/audit-cl-completeness.py --db /tmp/ao-cl10.sqlite --output-dir /tmp/ao-cl8
python3 tools/directory/audit-cl9-owner-evidence.py --db /tmp/ao-cl10.sqlite --cl8-csv /tmp/ao-cl8/missal_1962_reconciliation.csv --out-dir /tmp/ao-cl9
python3 tools/directory/adjudicate-cl10-missal-evidence.py --db /tmp/ao-cl10.sqlite --cl9-csv /tmp/ao-cl9/cl9_432_mass_candidates.csv --out-dir /tmp/ao-cl10
```

The adjudicator asserts all 85 source URLs, day strings, local time fields and source IDs against historical SQLite, and refuses mismatches, changed populations, missing sources, overwritten release decisions, and duplicate row-slots. It adds `cl10_owner_book_claim` and `cl10_1962_mass_evidence` **research-only** tables, plus exportable CSV/JSON. CI rebuilds and checks zero Una Cum, public venue, or current recurrence approvals.

## Next

The other **347 CL9 candidate rows** are not yet slot-adjudicated, including 154 candidates at 12 already-reviewed but insufficiently explicit source pages, and 193 rows at 108 unreviewed source URLs. Work should concentrate on extracting precise *owner* missal-edition evidence, identifying individual times and exceptions, before attempting publication. The CL2 classification and CL10 celebration-evidence metrics remain separate.
