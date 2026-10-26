# CL31 — reconcile 104 dated Mass sources with frozen global identities and the 296-row owner queue

**26 October 2026 · research only · stacked above CL30 #1778.**

CL30 compared **104 source-listed dated future Mass candidates** at 32 place keys to all **2,584** CL2 frozen research site groups and assigned 82 events to 27 unique *candidate* effective anchors; 22 event rows were held at five ambiguous site keys. CL31 recovers two high-quality church identities using exact local operator/host place evidence, with a **working research-only target group** but **without changing, merging, deleting or creating any frozen canonical group IDs**.

| Reconciliation stage | CL30 | CL31 |
|---|---:|---:|
| Dated source observations carried forward | 104 | 104 |
| Distinct source venue keys | 32 | 32 |
| Venue keys with one working existing CL2 anchor | 27 | **29** |
| Date records associated with working CL2 anchor | 82 | **100** |
| Venue keys without any working CL2 anchor | 5 | **3** |
| Date records without working CL2 anchor | 22 | **4** |
| Canonical ID merges / new public Mass dates / public pins | 0 | **0** |

The +18 research links do **not** constitute 18 new Masses. CL25–29's original source date/time tuples are untouched. New mapping selects the best-matched original CL2 research ID as a *nonpublic working linkage*, leaving any second historical group ID frozen and distinct until a separately approved canonical adjudication.

## Two named-address physical church corroborations

**Freiburg, Adelhauser Kirche — 14 existing dated research rows.** The [Freiburg municipal tourism service](https://visit.freiburg.de/adelhauser-kirche) identifies Adelhauser Kirche under its full dedication *Mariä Verkündigung und St Katharina*, **Adelhauser Straße 31A, 79098 Freiburg**. The [Latin Mass association announcement](https://www.pro-missa-tridentina.org/news/news_676.htm) independently lists the same name and exact church address as the site opened to the traditional liturgy in March 2025. CL2 `RG-CC7E25BA567F` is the precise street-address group chosen as the **research working anchor**. The distinct CL2 group `RG-0A6B76396C09` is preserved, not suppressed, although it likely represents the same church. Canonical effective-anchor reconciliation remains a separate hold; time-specific Freiburg source dates are not public.

**Chesham Bois, Our Lady of Perpetual Succour — four existing dated research rows.** [FSSP local operator](https://fssp.org.uk/chesham/) and the independent [host pastoral-area directory](https://saintdunstans.co.uk/pastoralarea/) both specify **30 Amersham Road, Chesham Bois HP6 5PE** for one Catholic parish church. CL2 `RG-ACE21207D458` is the precise-address **research working anchor**. The locality-only `RG-44539D308ED2` remains a separate frozen source group; no automatic alias, merge, canonical-place reassignment or new physical site admission occurs.

## Three real remaining blocks, four dated rows

- **Süderbrarup, Christ König (one dated research row):** [host Catholic parish official directory](https://pfarrei-stella-maris.de/Katholische-Kirchen-in-Flensburg-und-Angeln__2991) verifies the worship building at **Raiffeisenstraße 27**. The parish's regular Mass calendar is largely for a **different liturgical form**; it does not independently confirm a specific future Latin Mass. No correct CL2 canonical research group can yet be matched; **do not confuse it with Bonn Priorat Christ-König**. No new master venue is admitted.
- **Stephansposching–Loh, Wallfahrtskirche zum Heiligen Kreuz (two research rows):** [municipal site](https://www.stephansposching.de/freizeit-und-kultur/wallfahrtskirche-zum-hl-kreuzloh/) confirms the Catholic pilgrimage church, but [regional tourism](https://www.bayerischer-wald.de/attraktion/rokokokirche-loh-fb853a8e93) gives **Irlbacher Straße 1** whereas the secondary Mass-listing source gave **Irlbacher Straße 5**. Both location/address and actual date-specific Mass claims stay held. No invented CL2 group or public pin.
- **Holnest, UK (one dated row):** the SSPX documentation indicates a **private chapel**, while a dated district Mass PDF names only Holnest. No public street address or exact chapel entrance is independently established. Explicit privacy/location hold; **no public pin**.

## Parallel global verification: 296 rows preserved, zero overlap

A separate research PR [#1775 — CL27 full-corpus timetable review](https://github.com/Fulcanelli13/ad-orientem/pull/1775) has already isolated **296 actionable historical unverified records**, comprising **200 first-source review rows**, **71 subsequent source reviews**, and **25 secondary/owner replacement holds**, across **143** effective physical anchors.

CL31 fetched this actual frozen review data by source and row ID (not name alone) and committed a small **296-record join projection** including original historical row keys, source ID, effective anchor, day pattern, clock and URL. **0 of 104** CL25–29 source-event rows shares a research effective anchor with that 296-row queue, including the two new CL31 working anchors. This is not proof that every event is globally unique; it is proof that these two specific workstreams have **no current common candidate physical anchor**. The parallel 296 reviews are neither copied into new review tasks nor silently marked verified.

There is **one separate historic VERIFIED timetable collision** still requiring eventual review: Manchester's 1 November 2026 09:30 service corresponds to the effective anchor shared by historical `RG-D9490DF575C9` and `RG-E0C932E6CB74`; rows **313 and 540** in the separate 106-collision queue. Do not create another recurring slot.

## Original PDF document preservation status

The source-backed CL29 SSPX GB timetable has an exact public [operator-hosted PDF URL](https://fsspx.uk/sites/default/files/documents/PrioryMassTimes-261025.pdf), and the permanent GitHub source register includes its five page-level source references and transcribed original date/time facts. However, source-document **binary retrieval failed in this execution environment**. There is therefore **no verified original PDF SHA-256 and no permanently archived original PDF**. Both fields remain null/false in the evidence; the metadata is preserved but does not guarantee access if the operator removes the PDF. A source binary should be saved only after successful legitimate retrieval and checksum calculation, with permissions to redistribute taken into account. No paid storage or overage service is authorized.

## Reproducibility

Research evidence: `data/directory/research/cl31-identity-queue-20261026/evidence.json`, with **32 site verdicts, 104 phase-event tuples, two original-operator name/address reconciliations, three documented blocks, and 296 frozen global source-review row keys**.

Validator: `tools/directory/reconcile-cl31-identity-and-owner-queue.py` verifies the reconstructed CL2–30 SQLite database, original 2,584 canonical groups and 4,681 timetable records, both existing selected group IDs and competing groups, exact all-104 source event lineage, disjoint parallel 296 queue, and **zero public approvals**. It writes CSV reports for 32 site keys, 104 research-dated events and 296 parallel review-row keys, plus a JSON summary. The additive SQLite tables force `canonical_identity_merged=0`, `public_worship_site_approved=0`, `public_mass_date_approved=0` and `auto_resolved_by_dated_research=0` with `CHECK` clauses.

After CL2–30 rebuild:

```sh
python3 tools/directory/reconcile-cl31-identity-and-owner-queue.py \
 --db /tmp/ao-cl31.sqlite --out-dir /tmp/ao-cl31
```

The dedicated full research-chain CI workflow runs the validator; the previous CL27 test's literal-token bug has been corrected in every stacked descendant, but CI results must still be checked. Original research work remains **strictly €0**, and no external source, internal saved ID or staged date is automatically promoted to Ad Orientem public Mass Times or Find.

A new **on-demand**, standard-library original-file acquisition helper has been committed at `tools/directory/acquire-original-operator-pdf.py`. It requires real 200/HTTPS/PDF binary bytes, rejects unexpectedly large files or invalid PDF signatures, enforces an approved operator hostlist, calculates a real SHA-256 from the downloaded file, and creates a sidecar manifest *only on successful download*. Example:

```sh
python3 tools/directory/acquire-original-operator-pdf.py \
 --url https://fsspx.uk/sites/default/files/documents/PrioryMassTimes-261025.pdf \
 --output local-originals/PrioryMassTimes-261025.pdf \
 --manifest local-originals/PrioryMassTimes-261025.json
```

The command has **not succeeded inside the assistant runtime**, where external HTTPS binary retrieval is restricted. It requires execution where the source URL is actually downloadable, a durable €0 storage location, and a review of redistribution permission **before uploading the original third-party PDF to any public GitHub repository**. The utility neither schedules any charge-bearing task nor pretends that these files are already archived.

**Next work:** site-level canonical duplicate adjudication for Freiburg and Chesham preserving the master IDs and parallel reviewer consent; focused physical source matching for Süderbrarup and Stephansposching; original-PDF preservation only when bytes are actually obtainable; and bulk owner-page verification of the 296 separate timetable rows under the other PR, not by redoing this dated-source lane.
