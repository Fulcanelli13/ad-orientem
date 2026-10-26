# CL19 — complete the 39-site FSSP Germany identity-screening pilot

**26 October 2026. Research-only, stacked on CL18 #1762.** The project already has one canonical research site master; this phase adds source evidence **to existing frozen site groups**, never creates a parallel directory or publishes a map.

CL18 independently/source-locally examined 12 of the 39 German FSSP pilot worship places; CL19 systematically examines **the other 27**, retaining their exact original group IDs and named source-place IDs. Research source-screen coverage becomes **39/39**. However, source-screening is **not** door-level geocoding, and FSSP's own local subsite is not independent ownership proof.

## Evidence maturity from the new 27 site reviews

| Evidence scope | Places |
|---|---:|
| Additional **independent primary** church identity/physical address evidence (parish, diocese, municipality, operator, state heritage) | **22** |
| Additional local FSSP explanation only (same institution as national owner source) | **4** |
| Secondary heritage transcription only, no direct official local witness verified | **1** |
| **Newly source-screened** | **27** |
| Already independently/locally checked in CL18 | **12** |
| **Whole pilot with secondary-source review** | **39** |

That **22** measures independent *institutional identity* within the new 27, **not** geocoded entrances or currently confirmed future Mass dates. All public approvals stay zero. CL17's 256 supported/176 held source-scoped Missal claims and its 74 staged pilot Mass rows are unchanged.

## High-impact site and schedule corrections

* **Heidelberg St Anna, Plöck 4:** The local Mass community explicitly says 18:00 is **every Sunday/feast since 1 December 2024**. The same page retains old first-and-third-Sunday wording lower down; the more recent dated statement controls. National FSSP already lists every Sunday.
* **Düsseldorf St Dionysius:** The FSSP Cologne branch's directly dated October 2026 programme confirms 11 October Sunday Mass at **08:00 instead of the standing 10:30**. Stored as a date-specific owner override on frozen row 23, not a permanent correction to the original record.
* **Nürnberg St Georg, Bierweg 35:** The local traditional Mass organizer announces **8 and 22 November 2026 at 18:00**, matching the second/fourth Sunday pattern. These two *dated owner-announced observations* are recorded separately from the hypothetical date projections generated in CL18. They are still **not automatically approved for the public directory**, which needs its own operational/physical release gate.
* **Bad Grönenbach Schlosskapelle:** The municipality explains the chapel is in the **Ringeisenhaus**, not the adjacent Hohes Schloss. The May 2026 municipal events calendar also corroborates Sunday 10:00. Do not pin the castle courtyard as a substitute for the actual chapel.
* **Landsberg Ignatiuskapelle:** The local FSSP explicitly explains that the chapel is **on the first floor above the sacristy of Heilig-Kreuz-Kirche**, with vehicle access from Epfenhauserstraße/Malteserstraße into a kindergarten courtyard; barrier opens during Mass. A generic Heilig Kreuz street centroid is not a confirmed upstairs chapel entrance.
* **Amberg Mariahilf:** Sanctuary operator gives **Auf dem Mariahilfberg 3** for contact, while municipal monument inventory identifies church at **4** and monastery at **3**. Physical identity is clear but visitor church entrance number/coordinates remain unresolved.
* **Schwäbisch Gmünd St Leonhard:** City lists **Friedhofstraße 2**, FSSP/heritage lists **Aalener Straße 2** for the cemetery chapel. **Aalener Straße 4 is the distinct Herrgottsruhkapelle**, not a harmless number variant.
* **Stuttgart St Albert:** Catholic city directory independently identifies Wollinstraße 55 and its traditional Mass usage. Published postal codes **70439** and **70435** differ between owner-like Catholic listings; distinguish postcode discrepancy from a second church. Catholic church accessibility is documented, but no approved coordinates.
* **Nußdorf St Leonhard:** municipality identifies parish office at **Leonhardiweg 5** and distinct St Leonhard filial church *outside town*. Office street number must never become chapel door by assumption.
* **Odenthal Heilig Kreuz Chapel:** municipality independently identifies Kapellenweg 3. Another Christian congregation also lists worship at this chapel; FSSP's Friday Mass **does not establish legal ownership** of the property or sole religious use.
* **Kiel St Nikolaus:** host Catholic parish independently identifies the church at Rathausstraße 5, but a childcare facility and office share campus references. Maintain exact St Nikolaus church identity for first Sunday 16:00.
* **Blaibach St Elisabeth:** host parish identifies *church* **Kirchplatz 12**, separate *presbytery* **Benefiziatengasse 9**. First/third Sunday 11:30 FSSP celebrations belong to the church.
* **Eichstätt Heilig Kreuz:** church operator/municipality and diocese confirm Kapuzinergasse 2. Regional tourism publishes a building position **48.88995784685476 N, 11.19072854518890 E**. Record solely as `SOURCE_PUBLISHED_CHURCH_BUILDING_REFERENCE_ONLY`; a point for a building is not necessarily the worship entrance. Diocesan calendar independently identifies an extraordinary-rite Mass on 27 October, but available material does not yet establish its precise start time.
* **Oberhausen St Joseph:** host Catholic parish confirms Lothringer Straße **154**, distinct from FSSP house number **13**, and other St Josef churches in Oberhausen.
* **Bonn St Michael:** archdiocese lists Rheinbacher Straße with Sunday 18:00 and Tue 19:00. International FSSP gives house number **13**, whereas national directory lacks a number; entry/geocode verification required.

The source file `site-reviews.json` has the exact URL(s), original frozen place ID, evidential independence grade, claim and cautions **for every one of the 27**. It also includes weaker local-source-only locations rather than falsely describing all 27 as independently verified.

## Reconstruction and output

After rebuilding CL2 through CL18 research SQLite using the preceding CI:

```sh
python3 tools/directory/reconcile-cl19-remaining-site-sources.py \
 --db /tmp/ao-cl19.sqlite --out-dir /tmp/ao-cl19
```

Creates two additive, non-public tables: `cl19_second_source_review` (27 places) and `cl19_dated_source_event` (3 specific owner-calendar event reports). Outputs:

* `cl19_27_remaining_place_reviews.csv`: each site's source, independence grade, original research group, identity/entrance issue and release hold.
* `cl19_source_exceptions_for_followup.csv`: deduplicated unresolved site/address exceptions.
* `cl19_3_dated_owner_calendar_witnesses.csv`: Düsseldorf 11 Oct 08:00 historic override, Nürnberg 8 & 22 Nov 18:00 owner announcements—**not app events**.
* `cl19_summary.json`: counts, exceptions, next-gate actions.

CI asserts each site is the complement of CL18's 12 previously checked within CL17's 39-stage site table, preserving all existing source/master IDs and **zero** geocode/entrance/current-Mass/Una Cum/public approvals. One published Eichstätt **building candidate** coordinate is preserved as unapproved until independently checked against the church door.

## Next operational path

1. Resolve cross-source entrance/address conflicts—Ried, Amberg St Augustinus, Mariahilf Amberg, Schwäbisch Gmünd, Landsberg, Nußdorf, Stuttgart—and distinguish shared-campus buildings.
2. Use **dated first-party upcoming calendars** to qualify the actual occurrences and exceptions of the 74 associated Mass patterns. October source documents support October events only; don't extrapolate automatically into November/December.
3. Move only individually verified physical coordinates and future Masses through a separate controlled release PR. No auto-publishing from research sources; no fee-based maps or storage are required.
