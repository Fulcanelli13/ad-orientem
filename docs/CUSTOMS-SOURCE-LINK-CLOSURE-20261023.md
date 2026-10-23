# Ad Orientem — Customs Source Link Closure, batch 2

**Date:** 23 October 2026  
**Authority:** non-publishing audit, does not override canonical SOT-07, Calendar, parish event records or the independent Weiser research.

## Scope and method

The source registry in `main` has **108 entries**: **103 HTTPS references** and five internal/bibliographic records without direct URLs. A preceding P0/P1 audit had assessed 12 reference IDs used by eleven recently published customs. This pass attempts to retrieve the **remaining 91 registry source IDs**, representing **90 unique HTTPS URLs** (two records reference the same Vatican Directory). For each URL, the page or PDF was fetched in a public research client on 23 October, 2026, with extracted title/subject comparison where available.

**A retrieved URL is not the same as claim corroboration.** Every record retains `claim_review=NOT_FINAL_CERTIFIED`. Copyright and image reuse rights, source credibility, first-hand historical attestation, EN/FR editorial claims, date recurrence and current parish availability remain separate gates.

## Retrieval disposition

- **80** returned webpages or texts, with the original URL accessible.
- **7** were inaccessible or timed out in this client: Altoetting ex voto, Mariazell offering candles, Ugwogo Perpetual Help shrine, Sameiro pilgrimages, US Czestochowa pilgrimage, Bermont pilgrimage, and Frielingsdorf Apollinaris octave. Do **not** call them broken without direct browser follow-up.
- **1** redirected to a documented parish **404**: `MAASTRICHT-STERRE-DER-ZEE-CUSTOM`. Its original dated 3 October 2026 article remains visible as a search-index entry in the parish's news archive: https://olv-sintpieter.nl/category/laatste-nieuws/ . Preserve the dated evidence, but find a direct replacement or archival capture before public promotion.
- **1** resolved to an ostensibly correct title but no readable content: `LITCHFIELD-LOURDES-PILGRIMAGE-CUSTOM`.
- **2** yielded PDF text but were not fully visually verifiable: `ST-PETER-CHANEL-SHRINE-CUSTOM` (screenshot 403; text attests the site and route) and `SVATA-HORA-FEAST-CUSTOM` (2025 announcement PDF returned extracted text, but screenshot redirected off the original site). The Einsiedeln 2025 monastery programme returned PDF text and cover image normally.

All 91 per-record dispositions, URLs, restrictions and review notes are preserved in `data/customs/research/customs-source-link-access-audit.20261023.v1.json`; the JSON is the machine-actionable ledger.

## Content-scope holds requiring source refinement

1. **Heiloo First Saturday**: original about-page is live but does not explicitly state the claim; a stronger official event-category source is https://olvternood.nl/mec-category/bedevaart-en-catechese/ . Use this for validation, but do not silently overwrite the canonical source.
2. **Guadalupe (Mexico)**: a sacristy page is not direct evidence for local feast celebrations; locate an official celebration-specific page.
3. **Pompeii Supplica**: the official 2026 article concerns a papal visit but does record recitation of the Supplica; restrict it to the dated event unless a lasting shrine explanation is added.
4. **Holywell St Winefride**: the target page explicitly concerns pilgrimages and group bookings in 2022; do not treat it as a current timetable.
5. **Svatá Hora and Einsiedeln**: the linked 2025 PDF programmes are historical witnesses, not 2026 schedules or perpetual ceremonial commitments.
6. **Auckland St Peter Chanel**: the route PDF establishes location and pilgrimage relevance; it does not prove an annually recurrent patronal observance.
7. **Chantelle — verified correction**: the French bishops' abbey article explicitly describes the local patronal feast on the Sunday after Ascension, including a procession of relics, while distinguishing this place-specific observance from universal Calendar scheduling. Direct check: https://eglise.catholique.fr/conference-des-eveques-de-france/guide-de-leglise/dioceses/a-decouverte-dioceses-de-france/diocese-de-moulins/493837-abbaye-de-chantelle/ .
8. **1983 Canon Law**: the `CIC-1249-1253` entry is modern canonical discipline and must not replace 1962 discipline sources.
9. **Saint Blaise**: the cited modern *Book of Blessings* (1989) must remain separate from the separately attested traditional Roman Ritual; a corresponding ritual does not imply every region or parish uses it.
10. **Notre-Dame-du-Cap**: the 2026 sanctuary lampion offer validates that year's practice, not an indefinite service or current purchase price.
11. **Nußdorf Leonhardiritt**: municipal history expressly documents this traditional horse procession and blessings, but dates are local and not automatically recurring in the app.
12. **Lourdes Grotto feast novena**: the page specifically offers a *novena of Masses* around the feast, not an automatic general public pilgrimage appointment.

## Required source publication policy

Classify a proposed public statement as one of: historical custom; regionally witnessed practice; currently attested shrine/parish event; Roman Ritual blessing; voluntary household devotion. Require identity-appropriate source and date qualification. Do **not** conflate occurrence in the Ritual with a local practice, or an event announcement with perpetual recurrence. A church's feast and a shrine's celebration do not change the universal 1962 Calendar resolver.

## Next gate

Resolve the confirmed 404 and seven access-inconclusive pages, strengthen the indirect-source claims above, and then perform claim-by-claim editorial signoff for 35 published customs across English/French text. The 4 P2 and 14 nonpublished research identities stay outside the product. Approved art placements stay at 0 until identity, copyright, quality and crop review.

**Do not alter canonical IDs or mass/calendar runtime as part of this audit.**
