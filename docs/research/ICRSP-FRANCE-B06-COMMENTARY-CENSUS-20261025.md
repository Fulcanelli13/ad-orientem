# ICRSP France — Batch 06: complete 783-page commentary panel census

**As of:** 25 October 2026  
**Owner:** [issue #1665](https://github.com/Fulcanelli13/ad-orientem/issues/1665)  
**Review:** [draft PR #1666](https://github.com/Fulcanelli13/ad-orientem/pull/1666)

## First complete commentary inventory — successful

[GitHub Actions run 40204497782](https://github.com/Fulcanelli13/ad-orientem/actions/runs/40204497782) completed successfully at 15:16 UTC, having examined **783 of 783** page sources containing the explicitly named `Commentaires` section, and validated source article ID/URL and section position against the already certified **855-entry index**. The four parallel windows reported **0 fetch failures**, and the read-only merge passed with **2,856 distinct source commentary panels**.

All 783 pages have at least one panel. The numbers below count **source-page panel occurrences**, not unique historically original written passages or the rights-cleared content inventory.

| Source panel/work family | Panels |
| --- | ---: |
| Guéranger — *L'Année liturgique* | 492 |
| Blessed Ildefonso Schuster — *Liber Sacramentorum* | 472 |
| Dom Pius Parsch — *Guide dans l'année liturgique* | 542 |
| Benedict XVI catechesis labels (2006–2011 era) | 43 |
| Prudentius — *Peristephanon* | 8 |
| Other/unattributed panels | 1,299 |
| **Total** | **2,856** |

The 783 commentary-bearing articles break down as **Temporal 189, Sanctoral 449, Commons 58, particular propers 60, votives/Requiem 12, Ritual 3, Divine Office 12**. The 72 other indexed articles had no H3 `Commentaires` and were *not* counted as missing comments.

The 1,299 other panels contain **654 `Présentation`** and **520 `Office du jour`**, which are generic editorial/structural categories, not new author/work attributions. Only **125 panels** have other labels. An initial heuristic audit groups these into 30 additional traditional liturgical commentary leads, 13 papal or modern pastoral document labels, five historical/patristic study labels, 12 contemporary media-debate labels and 65 ritual explanation, biography or internal-navigation labels. These categories need manual verification; they are NOT authoritative.

The structurally corroborated labels and URLs are found in the 90-day GitHub Actions artifact `icrsp-commentary-783-merged` (artifact ID 12603378913). A 2,856-row user-downloadable CSV is also provided in the associated ChatGPT response. **The full 2 MB per-panel JSON remains in the Actions artifact/user-deliverable, not in the repository**. To prevent evidence loss, the definitive counts, source pointers and publication restrictions were permanently committed as `data/source-text/icrsp-france-commentary-783-verified-summary.v1.json`.

## Additional potential source families to triage

- **Dom Adrien Nocent, *Contempler sa gloire*** — seven panels, relevant to the Advent `O` antiphons.
- **Dom Flicoteaux, *La Noël d'été*** — six panels, connected to St John the Baptist.
- **Dom Gaspard Lefebvre**, various Missal and *Croisade liturgique* labels — potential existing Mass Explorer historical commentary.
- **Cardinal Journet**, Mary Magdalene and Resurrection; **Jean Daniélou**, Ember Days and the Feast of Tabernacles; **Cyrille Vogel**, historical liturgy — named research leads.
- **Martyrdom of St Polycarp**, Letter of the Church of Smyrna — original source and translation must be independently identified; possible Saints/patristic work, not an invented quote.
- Official papal texts, such as **Pius XII's *Munificentissimus Deus***, **Pius XI's *Miserentissimus Redemptor*** and **Pius XII's *Haurietis aquas*** — compare to the authoritative Holy See witnesses before sourcing theological claims.
- **2006–2007 Latin Mass media reports** are modern historical material and are not 1962 liturgical texts or rubrical authorities.

See `data/source-text/icrsp-france-commentary-783-owner-priority.v1.json` for domain-owner priorities, exact candidate source IDs and publication gates.

## Quality gates

Every panel had matched, duplicated structural summary/body-title labels. However, **152 panels have a recorded body character count at or below 120**; this is a parser threshold needing review, not proof that text is absent.

This pass did **not** measure repeated substantive commentary text. Content deduplication must compare text-body fingerprints, not simply labels or pages. A research-only next pass is configured for **189 Temporal commentary pages** in `tools/icrsp/fingerprint_commentary_bodies.py` and read-only CI `icrsp-temporal-panel-fingerprints.yml`. Only hashes, lengths, ordinals, source URLs and labels may be retained; no prose/translation is to be republished. It is a separate gate and its successful completion is not presumed.

**Zero new 1962 conformity certificates, zero original-work edition verifications, zero reproduction licences and zero canonical app content changes.** The separate Ordo Missae audit remains the owner of reader gesture and rubrical corrections. Existing Calendar, Mass Explorer, Saints, Customs, Scripture and reference source owners retain publication authority.

## Important limitation and priority

This is a **large, verified source-structure harvest, not a completed intellectual/critical edition of all 2,856 panels**. Release work should now focus on source-to-existing registry ID matching, original print and French translation rights, exact scripture/source citations, and high-value missing commentary/typology, rather than wholesale prose import or rebuilding the existing Calendar/reader. Do not claim all texts have been critically read or reproduced.
