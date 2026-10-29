# Directory Photography — worldwide source-first bulk harvesting (29 October 2026)

## Frozen scope

Use the previously archived **2,579 consolidated CL2 research anchors** as the one-to-one image-work units, from 2,584 historical group IDs (five same-building aliases). The 1,879 historic R49 source IDs link to 1,844 CL2 anchors; the other 735 anchors remain in the photographic research intake. The CL2 2,308 extra unadmitted leads are NOT accepted churches and remain in identity reconciliation. No app Find data changes.

## Current implementation

**Offline index** — `tools/directory/build-worldwide-photo-source-index.py` validates all 11 archived intake shard SHA256s; verifies exact CL2 manifest and original venue shards when attaching a source-pin search hint; matches the two archived first-200 R49 candidate manifests through exact source IDs; deduplicates same-file links within a physical anchor; indexes all 2,579 regardless of whether a picture is available. A conflict greater than 300 metres between frozen source pins causes a coordinate hold, not an averaged invented location. Name/coordinate or name/locality matches produce only research leads. Every record and candidate is explicitly marked no-publication and subject/rights unapproved.

**Country source harvest** — `tools/directory/harvest-wikidata-country-photo-index.py` submits only **one bounded query per country**, not one per church, using documented Wikidata P297 country, direct P31 church-building (Q16970) or cathedral (Q2977), and P18 photo. Optional coordinates and English administrative labels enable evidence-ranked local matching. One run accepts at most 16 countries and at most 3,000 response bindings per country; it runs sequentially with spacing and honours Retry-After. 60-second WDQS deadline; errors are preserved distinctly from genuinely empty indexes. Only metadata references are harvested; **no original files, licence approvals, cost, or public photos**. Direct P31/P17/P18 is intentionally a *partial* seed, not an exhaustive church census. A completed run must report omissions, truncations and errors.

**Verification** — `.github/workflows/directory-worldwide-photo-source-index.yml` runs offline fail-closed tests and reconstructs a real full-registry baseline from three existing GitHub research branches, using exact CL2 source SHA to prevent silent drift. It must find 2,579 records, 76 countries, 200 historic pilot sites, and 42 historic photo research candidates. These 42 are NOT images acquired or usable images.

## High-volume execution

After CI, a one-time country-source image harvest will target geographically diverse countries. Archive each country response and error report as immutable research data, and build the deduplicated 2,579-anchor source index. Further bounded country cohorts can follow on the exact same architecture without new scraper changes. Do not bypass rate limits, scrape Google Maps, import arbitrary third-party image bytes or silently classify no-result as coverage completion.

Only after the resulting source/identity evidence is reviewed should Commons file metadata be checked for current licence, author, source SHA1 and supported file type, then originals acquired with derivative SHA256, then contact sheets of 100–200 exteriors per user review. Interiors and high altars are second pass. The source master stays CL2; the image index is a reversible research derivative, not a rival place register.

**€0** remains a hard requirement. Audit photos by source and licence; do not infer that a CC attribution from Wikidata P18 itself establishes a usable original. Images remain unpublished until identity, authorship, licence and composition are individually approved.
