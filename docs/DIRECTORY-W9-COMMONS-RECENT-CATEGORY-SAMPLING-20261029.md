# W9 — recent Commons category sample after the first 200 Directory exteriors

The frozen R49 first two exterior waves are archived with **200 unique venues searched**, **42 unverified research candidates across 21 venues**, and **zero staged original files**. The first 100 had 27 Commons items marked PUBLIC_DOMAIN. The second 100 had 11 Commons Public Domain items and four Openverse research leads; its actual staged-original preflight count was zero. The source-locality correction has since merged in PR #1947, with a separate v2 replay for the same 100 venues underway.

An independent algorithmic bottleneck remains: `generator=categorymembers` with no `gcmsort` sorts by **alphabetical sortkey**, and the workflow samples only the first 40 files. An exact Wikidata Commons category can therefore contain recent CC photographs without those files being reached in the first alphabetical page.

The amended researcher performs **one additional, strictly bounded query** for a matched Commons category only when the primary P18/category/child source sample has no CC original hash:

- `generator=categorymembers`, `gcmtitle=Category:<verified Wikidata category lead>`, `gcmnamespace=6`, `gcmlimit=40`, `gcmsort=timestamp`, `gcmdir=desc`.
- The timestamp sort orders **date added to category**, not photographic capture date or visual quality. This is a diversity search, not an automatic assertion of a modern photo.
- All normal Commons metadata, file size, obvious drawing/scan filtering and exact-site hold rules apply. The four-candidate cap remains unchanged, with explicit CC licence plus SHA1 candidates preferred.
- The extra query runs at most once per eligible matched category. No recursive crawling, pagination, paid APIs, image downloads, unattended schedules or photo publication.
- The source-image verification downloader still requires a current confirmed licence URL, Commons SHA1, verified downloaded original, photographer credit and derivative SHA256, then marks exact church identity **unverified until later review**.

Reference: MediaWiki's Categorymembers API documents `gcmsort=timestamp`, `gcmdir=desc`, and the caveat that `cmtype` filters are ignored when timestamp sorting is used; the implementation therefore keeps namespace 6 filtering.

This is an incremental retrieval correction; its improvement must be measured in an actual new bounded pilot, not inferred from the tests.
