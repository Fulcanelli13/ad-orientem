# CL30 — Cross-phase 104 dated Mass source records ↔ existing CL2 venue master

**26 October 2026 · research only · stacked on CL29 #1777.** This is the first phase of directly reconciling the previously staged CL25–29 *dated source* records against the **existing** frozen Ad Orientem venue master. It does **not** create a new directory, alter CL2 group IDs, add Mass calendar occurrences or publicly certify a Mass schedule.

## Actual results

| Unit | Count |
|---|---:|
| Individually date-listed research source events CL25–29 | **104** |
| Distinct source worship-site keys behind the 104 events | **32** |
| Existing frozen CL2 canonical research site groups searched | **2,584** |
| Source worship places with one candidate *effective physical anchor* | **27** |
| Individual source-date rows linked to that single *research candidate* anchor | **82** |
| Source-site identities held for multiple different anchors or poor evidence | **5** |
| Source-date rows covered by the five unresolved identities | **22** |
| New canonical sites or publicly approved future occurrences | **0** |

A proposed unique effective anchor is **not a promotion**, operator approval or certified exact church entrance. It is a reproducible crosswalk candidate backed by a named source church and matching address/city. The 32 candidate venue records are deliberately classified into separate outcomes:
- **22** unique matching named church + postcode evidence;
- **2** unique address/postcode evidence but name requires review;
- **2** unique named church/street candidates without exact postcode;
- **1** multiple historical *alias* group IDs already sharing one effective physical anchor (**Manchester**);
- **2** different effective physical anchors competing for apparently the same worship location (**Freiburg Adelhauser Kirche and Chesham Bois**);
- **3** source venues without reliable matching building (**Süderbrarup, Stephansposching–Loh, Holnest**).

The confidence score is a **research sorting aid only**, not machine learning, authority verification, or an editorial permission threshold. The original name, original address, top candidate's full frozen group ID and effective anchor, all ambiguities, and exact source-date lineage are committed in `evidence.json`. No group ID is changed; source identities remain frozen.

## Important identity findings — do not invent sites

**Manchester:** the original master already has `RG-D9490DF575C9` (SSPX chapel, 16 Deer Park Road) and `RG-E0C932E6CB74` (same church name/address). The **second is an alias** with `effective_anchor_id=RG-D9490DF575C9`; therefore the two frozen research group IDs belong to *one* physical anchor. The SSPX UK dated Mass on **1 November 2026 09:30** also intersects the parallel [CL27 master 4,681-row schedule-audit PR #1775](https://github.com/Fulcanelli13/ad-orientem/pull/1775)'s already flagged **same-site/day/time collision** involving original historic rows **313** and **540**. Do not create a third independent recurring Mass, and do not delete historical rows by assumption. The new date-listed item remains research-only.

**Warrington:** `RG-2E1FB8361143` is the existing St Mary's Church at Smith Street and `RG-4BC0694A51BE` is an old St Mary's Shrine source lacking street precision; the existing master already sets the second's effective physical anchor to `RG-2E1FB8361143`. This is **one existing worship place**, not a newly discovered shrine, even though the older 2026-10-09 LMD crosswalk lists the LMD external feed as “unmatched research lead”. A secondary lead's status does not override the newer **frozen CL2 canonical source/group lineage**.

**Freiburg:** source programme lists Adelhauser Kirche, but CL2 contains distinct `RG-0A6B76396C09` and `RG-CC7E25BA567F` whose effective anchors differ. They may represent the same building, but only source-backed canonical adjudication may collapse their identities. **14 dated Mass entries remain held at research-anchor crosswalk gate**, not duplicated or auto-merged.

**Chesham Bois:** CL2 retains `RG-ACE21207D458` (church with full 30 Amersham Road address) and `RG-44539D308ED2` (homonymous locality-only worship source) as **different effective anchors**. **4 dated source entries remain held** until the existing master adjudicates whether they are true duplicates and whether one existing anchor should be preferred. No ID override is authorized.

**Other holds:** Süderbrarup Christ König and Stephansposching–Loh have no sufficiently strong named-address CL2 matching object; Holnest has no independently established exact church at all. Do not substitute another church named Christ König, Holy Cross or an unrelated nearby parish. **4 additional date-specific candidate rows remain unlinked** across these three holds, bringing total held rows to 22.

**Vienna/Katzelsdorf:** the existing CL2 church is explicitly named St Radegundis at the supplied Kirchengasse 21, while the new diocesan feed uses generic `Pfarrkirche Katzelsdorf`. This is a **matching-address research candidate**, not proof of identical Mass chapel use or of current November dates. CL27's four Austrian search-index dates remain held because the opened parish website returned an older snapshot.

## Provenance and global timetable complementarity

CL30 directly reads **all six** permanently committed CL2 site shards (total **2,584** original groups), preserving the [CL2 manifest](../cl2-unified-20261026/manifest.json)'s six SHA-256 source digests in the evidence ledger. It reconciles **104/104** original exact date/time/source-venue tuples from CL25 (7), CL26 (14), CL27 (9), CL28 (18), and CL29 (56). Every research anchor resolves to an existing CL2 effective site group; no arbitrary string matching is allowed to manufacture a new group.

The [parallel CL27 research PR #1775](https://github.com/Fulcanelli13/ad-orientem/pull/1775) already audits **all 4,681 historical timetable rows**, identifies **296** source/day/time actionable unverified entries, and has **106** historical same-site/day/time potential collision groups. **CL30 complements, not replaces or reruns** that source-verification queue: its 104 new *date-specific* source claims are a different unit of observation than the historical recurring Mass rows.

The one shared warning (Manchester historical rows 313/540) is recorded with the exact effective anchor and schedule pattern as a *research risk*, not proof of a duplicate. Crosswalk and historical collision audit PR ancestry are pinned; CL30 never silently writes into parallel PR #1775.

## Regeneration and release invariants

Commit files:
- `evidence.json`: 32 source-venue classifications, original site group/anchor alternatives, 104 exact source-date rows and 1 historical duplication warning.
- `tools/directory/reconcile-cl30-global-104-dated.py`: deterministic standard-library SQLite/CSV validator, live cross-check against reconstructed CL2–29 DB original site IDs and all 104 phase events.
- `.github/workflows/directory-cl30-global-dated-crosswalk.yml`: full research-chain validation and release safeguards.

Rebuild CL2–29 research DB first; then:

```sh
python3 tools/directory/reconcile-cl30-global-104-dated.py \
 --db /tmp/ao-cl30.sqlite --out-dir /tmp/ao-cl30
```

Output CSVs include 32-site source-to-existing-ID crosswalk, 104-event identity crosswalk, five-site held identity queue, plus JSON summary. Every mapped effective anchor must already exist in the frozen `canonical_site` table; all source-event membership tuples must exactly correspond to CL25–29 research tables. The new CL30 SQL tables contain **hard CHECK constraints** against public mass publication, new canonical admission, and public recurring publication; the source evidence also freezes **0 public pins, 0 entrances and 0 Una Cum assignments**. No production Find or Mass reader file changes.

## Source document archiving — unfinished gate, not falsified success

The CL29 SSPX five-page PDF was visually inspected, but **the actual binary PDF has not been archived to the repository** and has no verifiable SHA-256. CL30 cannot honestly declare that original media preserved. GitHub's connected text-file writer cannot ingest PDF bytes and direct download into this runtime did not succeed. We have a reproducible source URL and permanently committed verbatim date/time/location evidence, not a reproducible binary image of its exact earlier version. Its hash must be calculated only after obtaining the original file and stored alongside a licensed, permitted source-copy if possible. Do not rely on seven-day GitHub Actions artifacts for long-term archival, and do not incur paid cloud or bandwidth billing.

**Next gate:** work with the existing CL27 global 200 + 71 first-party owner-source review queues, adjudicate the two competing historic group cases using the frozen site master, recover actual operator PDFs with full checksums, and validate document-revision/currentness before any event or recurrence can be published.
