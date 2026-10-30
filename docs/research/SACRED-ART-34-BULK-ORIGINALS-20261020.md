# Sacred Art — 34-work batch original identity recovery

**20 October 2026 — metadata research, not publication authority**

## What has been reconciled

This is a **single batch across the 34 user-approved artworks** that previously generated 117 potentially reusable Commons photographic-file search results. We have not asked the user to re-rate any painting.

| Stage | Results | Evidence status |
|---|---:|---|
| Frozen approved artworks in discovery batch | 34 catalogue IDs | Already approved artwork subjects |
| New Commons file leads | 117; 112 distinct file hashes | Search candidates only |
| Live Commons metadata consistency | 113 coherent / 4 held | File metadata only |
| Preliminary exact-work photo comparison shortlists | 29 | Not yet visually matched against approved original |
| Separate rights/source holds | 5 catalogue entries → **3 National Gallery paintings** | Museum original known, NG NC-ND photos unusable for planned app |
| Commons structured digital-representation original artwork QIDs (P6243) | **24/29** | Community artwork identity leads |
| Leads with Wikidata collection and inventory claims | **23/29** | Need independent official museum accession confirmation |
| Structured artwork identifiers absent | **5/29** | Further original-source verification needed |
| Prado sources allowed | **0** | Permanent source embargo |
| Production photographs certified | **0** | Physical-original, rights, photo choice and handset gates remain closed |

**Corrections to earlier staging:** The first 34-work original-source register had zero *locally documented independent object pages* for the 29 new Commons shortlists. The newer **Commons MediaInfo P6243 → Wikidata** pass uncovered 24 **structured, community-maintained identity leads**, of which 23 report collection/inventory data. This is a useful discovery gain, **not 23 museums independently certifying the work**.

The five records without usable sources were not five unlocated masterpieces. Two IDs identify Anthony van Dyck's *St Ambrose Barring Theodosius* at the National Gallery London; two identify Guido Reni's *Saint Mary Magdalene* there; one identifies Guido Reni's *Susannah and the Elders* there. All three physical originals were already documented. Their NG source photographs remain blocked for noncommercial/no-derivatives limitations; group metadata must not merge/rewrite the five existing artwork IDs.

## Large-volume continuation, without new user ratings

1. **Institutional accession crosscheck, batch of 23:** Query the original collecting institution and verify the exact inventory number and artwork attribution against the Commons/Wikidata claim. Store accession + institutional URL; do not fetch commercial museum photographs without legal grounds.
2. **Sparse-provenance batch of six:** The single structured artwork record without collection/inventory details, plus five shortlisted images missing a P6243 original artwork QID. Search independent institutional and object inventories by approved artist/title, avoiding other versions and copies. Do not infer identity from search ranking.
3. **Rights-blocked group of three physical paintings:** Keep National Gallery original-object page records; source only a separately lawful photographic reproduction of those exact originals, or leave their photograph unpublished.
4. **Photographic release QA as one coherent batch:** Contrast actual pixels against the frozen approved portrait/photo, verify rights, file SHA, quality and phone crops. No automatic approval based on metadata or public-domain status of an old painting.

## Frozen and generated sources

- Canonical frozen user artwork decisions: `data/research/sacred-art-user-frozen-decisions-20261017.v1.json`.
- 451-work exact-source registry: `data/research/sacred-art-bulk-source-intake-451-20261020.v1.json`.
- 76-source discovery: `data/research/sacred-art-open-source-recovery-76-20261020.v1.json`.
- **Persistent 24 exact original artwork QID leads**: `data/research/sacred-art-24-structured-original-qid-candidates-20261020.v1.json`.
- Reproducible 29 painting QID+collection+inventory discovery: `tools/calendar/discover-sacred-art-29-wikimedia-object-ids.mjs`.
- Lossless five-entry/three-original blocked-source grouping: `tools/calendar/reconcile-sacred-art-five-licensed-aliases.mjs`.
- Image staging, photo rights and non-publication safeguards: `tools/calendar/audit-staged-sacred-art-media.mjs`.
- Current passing first full 29-work structured discovery: [GitHub Actions #39440206422](https://github.com/Fulcanelli13/ad-orientem/actions/runs/39440206422); also completed with five blocked-entry grouping in [#39440362771](https://github.com/Fulcanelli13/ad-orientem/actions/runs/39440362771).

**Release invariant:** all 24 QIDs are candidate identity links only, all 96 staging photographs remain technical QA only, and no selected painting/photograph is changed in the Calendar, Mass or any runtime module.
