# CL16 — first-party source recovery of CL15's 51 priority-one holds

**Research-only evidence overlay, 26 October 2026.** Stacked above CL15 PR #1755. This does not change the physical-venue master or published Mass-time app.

The CL15 research-only exception triage identified 197 held Mass rows, of which 51 at 13 owner/source URLs were priority 1 (inaccessible owner page, exact time contradiction or physical permission scope). CL16 directly revisits **all 51** and accepts **20 newly source-scoped 1962/John XXIII Mass-book claims**; 31 remain held. Each newly accepted claim has first-party/diocesan/organization provenance, frozen row number, source ID/group ID, exact venue day/clock match, exceptions and held public-release status.

| Reviewed institution | Rows | New 1962/JXXIII research evidence | Remain held |
|---|---:|---:|---:|
| Notre-Dame des Victoires, Angers | 8 | 8 | 0 |
| St Mary, Kalamazoo | 6 | 6 | 0 |
| Holy Rosary Cathedral, Vancouver | 2 | 2 | 0 |
| Studienkirche St Michael, Passau | 1 | 1 | 0 |
| St Aloysius, Thorold (FSSP Niagara) | 3 | 3 | 0 |
| Our Lady of Lourdes, Park Hills | 10 | 0 | 10 |
| St Rita/St Anthony, Arlington (lay source) | 8 | 0 | 8 |
| Blessed Sacrament Chapel, Gibson LA | 7 | 0 | 7 |
| St John the Beloved, Arlington (lay site) | 2 | 0 | 2 |
| Three self-referential Ad Orientem links | 3 | 0 | 3 |
| Unavailable Georgia lay blog | 1 | 0 | 1 |
| **Total** | **51** | **20** | **31** |

## First-party breakthroughs and conditions

**Angers (8).** The formerly inaccessible historical parish URL is now retrievable directly as an HTML owner Mass timetable:
[Notre-Dame des Victoires](https://cathedralestmauricenotredame.diocese49.org/la-paroisse/horaires-a-remttre-apres-ete/). It identifies *Missel St Jean XXIII* at **Sunday 10:30; Monday–Friday 18:30; Tuesday 08:30 only during school terms; Saturday 09:00**. Those eight original historical records match. The **different Sunday 09:00 and Saturday 18:30** belong to the current Missal and **must not be marked 1962**. The parish requests consultation of its weekly bulletin for holiday changes.

**Kalamazoo (6).** [St Mary's 2026 October calendar](https://stmarykazoo.org/calendar) unambiguously names a '(1962) Low Mass' each Monday, Tuesday, Wednesday, Thursday, Friday and Saturday **08:00**. This resolves owner summary's abbreviated `M S a` notation without relying on external interpretation. Future-week recurrence not released.

**Vancouver (2).** [Holy Rosary Cathedral's own Latin-Mass explanation](https://www.holyrosarycathedral.org/latin-mass/) explicitly identifies the **1962 Missal** at Sunday **16:00 sung** and Friday **18:30 low**, separately from other Roman Masses. The first-party schedule page corroborates both.

**Passau (1).** [The parish's standing Mass schedule](https://pfarrverband-passau-altstadt.bistum-passau.de/aktuelles-termine/gottesdienstzeiten-studienkirche-sankt-michael) explicitly gives a **Sunday 19:00 liturgy according to 1962**. Its [dated 25 October 2026 event listing](https://pfarrverband-passau-altstadt.bistum-passau.de/aktuelles-termine/gottesdiensttermine/p2) gives **17:00 that Sunday**. Therefore the frozen 19:00 row gains accepted *standing book/clock evidence* while preserving the date-specific 17:00 override. The frozen record is never edited.

**Thorold (3).** [FSSP St Aloysius owner homepage](https://www.fsspniagara.com/) retains Sunday **09:00 and 11:00**, Saturday **09:00**, **inside the same church** behind a temporary wall during 2026 works; the owner identifies the programme as Extraordinary Form and directly names its FSSP ministers. [FSSP Canada identifies the same named apostolate and church address](https://www.fssp.ca/apostolates/14-st-aloysius-parish); [FSSP's 2022 papal decree](https://www.fssp.org/en/decree-of-pope-francis-confirming-the-use-of-the-1962-liturgical-books/) supports the 1962 liturgical book at *institutional programme* level. This acceptance is expressly subject to each current weekly renovation bulletin and **does not infer priest identity or future occurrence**.

## Hold reasons preserved (31)

* **Park Hills, Kentucky (10).** Owner 2026 timetable and owner location page prove the original Our Lady of Lourdes church's present address/times, and archived diocesan records establish 2024 restoration from St Ann Mission. However the directly explicit diocesan **January 2024 1962** witness was about **temporary St Ann Mission**, not the 2026 Park Hills slots. An archived parish notice reportedly commits the parish to 1962 books, but was not independently visually inspected as part of CL16. **Do not mix buildings to claim exact owner evidence**.
* **Arlington, Virginia (10, two URL groups).** [July 2024 diocesan dispensation announcement](https://www.arlingtondiocese.org/2024/07/19/vatican-renews-permission-for-celebration-of-traditional-latin-mass-in-the-diocese-of-arlington-in-accordance-with-traditionis-custodes/) gave two years of authority; no later official renewal beyond summer 2026 established. St Rita, St John the Beloved and St Anthony Mission also substitute **Latin postconciliar Mass monthly**. Lay listings do not prove a current official licence.
* **Gibson, Louisiana (7).** [Houma–Thibodaux's owner chapel page](https://htdiocese.org/blessedsacramentchapel) is now fully accessible, provides 138 Carroll St and every original time, and explicitly states **Extraordinary Form**, but not the literal 1962 edition. Keep exact-edition gate held.
* **Three Ad Orientem URLs and one Una Voce Georgia blog:** only self-referential or unavailable evidence was retrieved. No promotion.

## Aggregate completeness

Original historical wording candidates **432**. Research-supported 1962-book row claims now **255**, not physical venues; **177 remain held**. Earlier CL2 has three separately accepted source-level witnesses unchanged. No approved public timetable, physical/geocoded site, Una Cum status or institutional/celebrant ownership is created here.

Reproduce via the CL15 full research SQLite build from checked-in master data and execute:

```bash
python3 tools/directory/reconcile-cl16-priority-one.py --db /tmp/ao-cl16.sqlite --out-dir /tmp/ao-cl16
```

Permanent `evidence-decisions.json` + script are committed. Exports include 51-row decisions, 13 URL summaries, 31 unresolved high-priority exceptions and summary JSON. Temporary free GitHub Actions artifacts expire after one day but can always be regenerated from the GitHub source.

**Next work:** evaluate the **remaining 177 held** source claims without rechecking the 20 newly supported rows; separate true edition absence from evidence-blocking access and source conflicts. Work toward operational release separately with current calendar exceptions, physical buildings and approval.
