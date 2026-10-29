# P99 — Commons source-file metadata triage (no original bytes)

This is **not an original-file verification pass**. The 31 P98 original-file candidates were checked against available Commons file pages or category evidence. The local network could not fetch image originals, so the actual SHA1/SHA256 recomputation and pixel-level inspection are **0**.

## Results

| Research stage | Files |
|---|---:|
| Exact file page opened; source-listed pixel dimensions, creator and license transcribed | **23** |
| Exact file page blocked; category only supplies a file name/dimension | **3**: #15 Maria Lebing, #52 Prague, #140 Versailles |
| Exact file page not reliably retrievable in this pass | **5**: #62 Hannover crypt, #119 Ingouville, #147 Duingt interior, #263 Rimini interior, #376 Ann Arbor |
| Actual originals downloaded and independently SHA1/SHA256 hashed | **0** |
| Full-resolution aesthetics / publication rights / editorial release cleared | **0** |

The separate P97 *preview* exceptions #77, #110, #204 and #261 remain completely held; these 4 are not P98 candidate originals.

## Notable checks

- #195 Blandford Forum is listed as **CC0** (3,400×2,600) by its exact source page. Preserve photographer provenance even though CC0 does not impose mandatory credit.
- #378 St John Cantius exterior also claims **CC0**, but the 1,267×1,810 file is less suitable for a primary hero than the already preferred #380 interior.
- #202 Oxford interior is only **1,600×1,200**; #205 Oxford exterior only **900×1,200**. Both are Geograph images credited to Bill Nicholls, CC BY-SA 2.0; they warrant stricter hero-resolution checks.
- #12 Fatimakapelle is **1,280×960**, under the typical high-density display requirement. Source license is CC BY 3.0 (not ShareAlike).
- #156 Toulon has explicit requested credit **© Raimond Spekking / CC BY-SA 4.0 (via Wikimedia Commons)** on its own file page. An author credit is not automatically a license clearance.
- #164 Tours Saint-Grégoire offers **multiple license options** (including GFDL and several CC BY-SA versions); P99 selects no distribution license or derivative terms.
- #178 Wrexham's file-page date reads 1899 despite a 2013 monuments competition tag. Treat the source date as inconsistent, not as a capture date.
- #96 Bayonne's filename mentions Sainte-Cécile, while its source description identifies the correct Sainte-Marie cathedral. Preserve canonical site identity.
- #20 Sydney has an unusually detailed creator attribution policy; its ordinary CC BY-SA license and obligations need proper assessment before use.

## Release gate

1. Fetch each **original JPEG**, not just a screenshot, category page or Wikimedia preview.
2. Recompute SHA1 and SHA256 and cross-check both source object's current hash and existing P91 SHA1 claim (the existing claim is not independently verified).
3. Inspect original pixels, focus, exposure, framing, obstructions, cropping at actual app aspect ratios; avoid frames, detail-only substitutes and unsuitable art.
4. Verify exact built church and precise worship venue; source-page identity alone is insufficient for active Mass location.
5. Record publication attribution, accurate source link, chosen compatible CC license, adaptation disclosure and ShareAlike requirements where applicable.
6. Obtain editorial acceptance and run the full canonical identity/image integrity checks before publication.

P99 is entirely **research-only**. Do not merge images, flip publication booleans or claim a successful checksum audit from the metadata in this document. The underlying identity state remains **385 = 90 rejected + 83 corroborated + 212 held**. €0, no contacting authors, no publication.

## Automated sidecar validation

Run `node docs/research/directory/p99-commons-file-page-check-20261029/verify-p99.mjs` and the existing P91 verification gate before release.
