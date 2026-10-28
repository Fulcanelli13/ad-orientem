# Ad Orientem — Existing Sacred Art Library Reconciliation
28 October 2026 · research-only, no production modification

## What is now inventoried

| Source | Units | Meaning |
|---|---:|---|
| Canonical museum object registry | 281 | Exact museum IDs (not all artworks ever researched) |
| Source acquisition records | 266 | Earlier archive entries and SHA-256 values; current bytes and retention **not confirmed** |
| Registry production image paths | 0 | None certified in this registry |
| Earlier curator decisions | 44 assignments, 35 originals | Exact IDs matched to the 281 inventory; these original placements are retained |
| Later historical subject selections | 101 | Original named subject approvals, not 101 guaranteed unique objects |
| Historical selections with exact URL crosswalk into the 281 | 3 | 98 remain in a parallel authority layer pending identity reconciliation |
| Ratings-eligible originals | 170 | 135 rated 3–5 and 35 carried earlier approvals, overlapping other sources |
| Rating-rejected originals | 62 | 0–2 ratings, excluded from active curation for those precise original IDs |
| Old 22-module primary heroes | 22 | Preserved but do not define all current Prayer routes |
| Previous image-option gallery | 119 | Options from the 109 and revised 119 reviews; 4 exact museum-object links, 1 tentative artist/title match, 114 not inside the 281 by verified identity |
| Additional archival gallery | 168 categories, 253 work entries, 139 photo leads | 241 unique work source IDs; not all intersect the canonical museum registry |
| Exact-matched extended photo evidence | 16 photo references across 11 museum originals | Source leads only, not certified commercial/pristine photo masters |
| User's latest review | 30 pools, 30 kept placements, 17 rejected placements, 56 undecided | Context-specific decisions, not global rejection |
| New research wave | 12 proposed works | Research leads only |

**Never add these record counts together.** The source and approval corpora overlap, and a painting may have multiple subject assignments or photographic derivatives.

## Files

- `sacred-art-existing-library-reconciled-master-20261028.v1.json`: audited structured crosswalk, exact identity, ratings, old and new selections, user decisions and unresolved queue.
- `sacred-art-existing-museum-281-audit-20261028.csv`: a row per canonical object with ID, source rights claim, SHA, ratings and selection references.
- `sacred-art-unlinked-historical-and-review-20261028.csv`: 98 historical decisions and 115 review-option IDs with no exact 281-gallery identity join. **Unlinked** does not mean rejected or missing from the wider Sacred Art collection.
- `sacred-art-existing-library-audit-20261028.html`: searchable five-source visual audit (281 museum objects, 101 historic selections, 119 previous photo choices, 253 archived research entries, 30 decision pools, 12 research leads). Historical image leads are shown only on matched subject/artist/title evidence, never as certified production photographs.
- `pray-mosaic-user-decisions-20261028-060047.json`: the user's source export preserved verbatim.

## Strict editorial and photographic rules

1. Protect the 101 historical subject approvals, the earlier 35 exact museum originals, explicit 2026 feast art decisions, and user-contextual Keep/Reject/Undecided placements independently.
2. A positively rated painting remains eligible for curatorial reuse; this is **not** an automatic final Prayer-module assignment.
3. Match a **physical artwork** only with its stable institution object ID, an exact object URL, or a verified original-image SHA. Artist/title matching alone may open an evidence queue but cannot silently merge works or move approvals.
4. Check exact commercial-photo rights; no paying, no permission requests, no fees, no paid overage. 271 objects are labelled CC0 at **object source** level, while 5 have PD-Art/PDM claims and 5 have a Kress reuse hold; an object-level claim is not final approval of every photograph.
5. Show only pristine faithful reproductions; do not use framed museum-room photos, oblique shots, glare, synthetic retouching or glow. External frame cropping can be non-destructively tested only after original painting edges are identified.
6. Restore the actual 26 current Prayer routes and their 29 initial conditional pools, plus Scripture/Evangelists as a distinct additional pool.
7. Aim at 3–5 **distinct** approved paintings per module visual pool. Rotations may use local day, time of day, canonical liturgical season and actual appointed Gospel book; protect all 15 Rosary mystery works and 14 Stations independently of generic hero images.
8. No production promotion from any of these research documents. Exact release photo bytes, display crop, licence, app route, and browser/mobile rendering all require their own checks.

## Concrete next work

**A. COMPLETED — Reconcile all 101 historic approvals.** All 101 original artwork IDs match the same subject ID in the 253-work historical archive. Of these, 16 have 18 direct photo leads; the other 85 need source-photograph acquisition. This DOES NOT mean all 101 are linked into the separate 281-object museum registry: only three have exact museum object URL matches there. See `sacred-art-historical-101-archive-crosswalk-20261028.v1.json`.

**B. COMPLETED — All 266 original acquisitions have been byte-verified and preserved.** The 35 expiring Actions ZIPs were readable. The 256 CC0-labelled original images were checked against SHA-256 and placed into 33 research-only public GitHub Release ZIP assets with a checksum manifest: `https://github.com/Fulcanelli13/ad-orientem/releases/tag/sacred-art-cc0-sources-20261028`. The remaining ten (five PD-Art/PDM; five Kress hold) were checked against SHA-256 and preserved in three separate ZIP assets in an UNPUBLISHED GitHub release draft, verified by action run `40648765567`. Draft assets remain rights-held, not commercially cleared. All original Actions artifacts were left untouched.

**C. FIRST EXISTING-LIBRARY PASS COMPLETE — 14 zero-Keep pools and seven additional underfilled/conditional pools** were reviewed against the existing historical approvals and the existing museum registry, producing 63 proposed cross-module associations. The Divine Mercy and generic Prayer Library pools must not be padded with irrelevant artwork. These are not new editorial approvals or pristine photographic sign-offs. See `pray-artwork-existing-library-priority-reuse-20261028.v1.json`.

**D. NEXT — Create a genuinely historic-first, photographic-pristine reviewer** with 3–5 high-quality candidate paintings per pool, no duplicate physical artworks, and exportable per-module decisions. Reconnect the remaining 85 previously selected historic works that lack direct image leads; use released CC0 originals in candidate displays without assuming final pristine-photo approval.

## Scope warning

The canonical 281-object registry is **one museum acquisition source**, not the entirety of the historical gallery. A high historical approval count in a separate subject ledger is not evidence that its image is available inside the 281-object registry. The 119 prior review gallery options also include valid paintings outside that museum registry. All are separately retained in the master.

## Current source backup safeguards

GitHub Releases permits files under 2 GiB and does not impose a total release-size or bandwidth cap, per GitHub's official documentation. The new preservation script runs on a public GitHub-hosted runner (standard public-repo runners are free), downloads the old Action artifacts, checks every included original's SHA-256 against the acquisition ledger, excludes ten non-CC0 sources, repacks the eligible images by artifact ID, and only publishes after the full 256-original verification succeeds. It never deletes any old artifacts or modifies the production site. Exact asset-upload verification is still required; a running CI job is not evidence that the backup is finished.

## Verified release result (2026-10-28)

Public Release: `sacred-art-cc0-sources-20261028`, 35 uploaded release assets (33 source ZIPs + two integrity indexes), 1,004,976,665 bytes total, 256 CC0 originals with SHA-256 verification in GitHub Actions run `40648374452`. Rights-held unpublished draft: `sacred-art-rights-held-draft-20261028`, four uploaded assets (three restricted source ZIPs + index), ten original SHA-256 checks in run `40648765567`, with draft status verified by GitHub CLI. A draft in a public repository is not a public release. Neither is approval for in-app publication. GitHub source archives are outside Vercel and no paid services were added.
