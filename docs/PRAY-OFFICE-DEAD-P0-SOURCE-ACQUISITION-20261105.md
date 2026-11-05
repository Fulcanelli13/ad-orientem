# Ad Orientem — Office of the Dead P0: source acquisition (5 November 2026)

**Acquisition ID:** AO-AQ-055 · originally `ROUTED_OTHER_MODULE` · **not yet a released reader**.

## Completed in this tranche

- Captured six UTF-8 Divinum Officium source leaves pinned to `b9f8c8eb15d52b2b2c02e2ca24807cfaa73758f0`: `Commune/C9.txt` and `Sancti/11-02.txt`, each in Latin, English and French.
- Captured eighteen more original source leaves, six Psalms in each language: Vespers Psalms **114, 119, 120, 129, 137**, and the **conditional** Psalm 145 in its conclusion.
- Preserved each upstream Git blob SHA and raw text; the new Node regression test independently recomputes the Git blob hashes and checks the relevant Vespers, Matins, Lauds, All Souls and Psalm markers.
- Copied the Divinum Officium MIT licence alongside those leaves. Existing Tenebrae uses precisely this pinned upstream revision and rights basis.
- Linked the source tranche to the **existing** 97-record Prayer Ultra Master, without altering its original acquisition or B31 disposition.
- Registered this test in `npm test`; no new reader route, devotional text, prayer-door item or runtime network dependency was introduced.

Sources:

- [Divinum Officium project and MIT licence](https://github.com/DivinumOfficium/divinum-officium)
- [Roman Breviary 1960 general rubrics](https://isidore.co/divinum/www/horas/Help/Rubrics/Breviary%201960.html): especially nos. 161, 180, 185, 190, 216, 238 and 240
- [1960 Changes, nos. 58 and 61](https://cdn.restorethe54.com/media/pdf/the-new-rubrics-of-the-roman-missal-and-breviary-1960.pdf): 2 November Vespers; votive Matins Invitatory and Fidelium collect
- [Traditional Office of Dead instructions](https://isidore.co/divinum/www/horas/Help/Rubrics/newbrev.pdf), Chapter X

## Liturgical distinctions that are binding on the next implementation

1. The Office of the Dead is **not** the Requiem Mass, the Requiem Absolution, Tenebrae or a De profundis card. Its historical devotional major Hours are **Vespers, Matins and Lauds**, with their own structures; All Souls' 1960 full day's Office additionally owns the proper short Hours and Compline.
2. The 1960 liturgical assignment is **Vespers of the Dead on 2 November** (with proper Compline, unless an overriding Sunday or first-class feast intervenes). The 1 November devotional service after All Saints' second Vespers is a distinct, retained local/customary practice—not an automatic replacement of All Saints.
3. For the votive Matins, the Invitatory and Psalm are always required, whether one or three nocturns. If prayed for the faithful departed in general, conclude with the proper `Fidelium` prayer; never transpose the personal-deceased variant without clear intent.
4. Do **not** append `Gloria Patri` in the Office of the Dead where the traditional `Requiem aeternam` replaces it. The usual hymn, Te Deum and common Office endings are not safe defaults.
5. **Correction:** The pinned Divinum Officium C9 source has an explicit **1960 omission** for the Psalm 145 portion of Vespers' preces, and the 1960 votive Office rendering independently confirms its absence. Some earlier Office instructions describe omission only on 2 November or the day of death/burial; those belong to separately adjudicated earlier usages. Do **not** add Psalm 145 to the 1960 votive Vespers model.
6. Source `C9.txt` contains `@`, `$` and `&` macros and partial `Sancti/11-02.txt` overrides. Raw files alone are **not** complete rendered Offices. English and French are independent Divinum Officium source versions; no Crampon / Douay-Rheims full Psalter certification has been awarded.

## Explicit remaining implementation gates

| Stage | Work | Current state |
| --- | --- | --- |
| 1. Source provenance | Six common/All Souls propers plus eighteen Vespers Psalm witnesses; MIT attribution; Git SHAs | **Acquired; branch test pending CI** |
| 2. Full Vespers | Magnificat, antiphons, macros, oration choice, conclusion, 2 November vs votive conditions | **Not assembled** |
| 3. Full Matins | Invitatory + Psalm, 9 psalms, 1/3 nocturn branches, 9 lessons/responsories, All Souls proper substitutions | **Not assembled** |
| 4. Full Lauds | Five Psalms/canticles, Benedictus, antiphons, conclusion and collect | **Not assembled** |
| 5. All Souls' proper | Short Hours and proper Compline, absence of first Vespers under 1960 rules | **Not assembled** |
| 6. Reader and audit | Offline 390px EN/FR/LA reader, source-critical print check, lint and all rubrical variants | **Not released** |

**Release gate:** no Office route, title card, or "complete Office" wording may be added until the whole chosen scope is assembled from locally pinned sources and passes explicit rubric, mobile and offline tests. Preserve the existing 9-door Prayer design. `AO-AQ-058` (Sacrosanctae after Office) remains separately unverified and must not be inserted by assumption.

## Separate four-Novena pipeline

The four unresolved source-specific candidates **AO-AQ-068/069/073/075** remain real gaps, not retroactively completed by existing litanies or family/travel/Rosary prayer. The next sourcing pass should start with Lasance 1904 for the Holy Name, historic family-prayer vs nine-day-*novena* distinctions for the Holy Family, *Raccolta* 1910 St Raphael (the nine-day practice is not necessarily nine distinct daily prayers), and the published *Raccolta* Marian sequence for Our Lady of the Rosary. Original source-text identity, multilingual witnesses and current indulgence status are separate gates; no source alone authorizes publication.


## Source-derived 1960 votive Vespers model (5 November, subsequent tranche)

- Three more Latin/English/French `Psalm232.txt` (Magnificat) sources and three `Psalterium/Common/Prayers.txt` source leaves are pinned and held in `data/research/office-dead-1960/vespers-supplemental-source-leaves.v1.json`.
- `src/pray/office-dead-vespers-1960.js` derives **11 stages per language**: five Psalms (114, 119, 120, 129, 137), the proper versicle, Magnificat, Pater noster, six preces lines, the **Fidelium** collect and the concluding responses.
- Antiphons are recited in full on both sides of each psalm and Magnificat. The source `Requiem aeternam` replaces `Gloria Patri` after all six. Source `@`, `$`, and `&` macros are resolved from named pinned sections; none is displayed verbatim as a prayer.
- A source-aware **1960-votive-specific** restriction rejects `ALL_SOULS_NOV_2`, personal-deceased and older-rubric contexts until their exact prayers and rules are independently adjudicated.
- Tests cross-check all 11 source-derived stages in Latin, English and French against the locally pinned source leaves and fail closed if any required source or edition identity disappears.

**This is an assembled research model, not a released UI reader.** The entire Office of the Dead, including Matins and Lauds, is incomplete. The 2 November proper and actual offline phone UX remain unverified. No new public route or liturgical text has been released.

Reference 1960 votive example: https://divinumofficium.hu/cgi-bin/horas/Pofficium.pl?command=prayVesperae&date1=6-10-2026&lang2=Portugues&testmode=regular&version=Rubrics+1960+-+1960&votive=C9
