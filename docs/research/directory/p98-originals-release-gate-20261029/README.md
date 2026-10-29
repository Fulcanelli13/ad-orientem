# P98 — evidence-backed original verification queue (not publication)

P97 (#2014) is merged. The original 385-row identity ledger is unchanged. This P98 sidecar **does not** mark any additional image as visually reviewed, original-hash verified, rights-cleared, editorially approved or published.

## Exact baseline

- 385 source-image assignments: 90 wrong-site rejects; 83 research corroborated (26 buildings); 212 held/unverified.
- 79 of the 83 have genuine rendered preview inspections. Four are held, **#77 Grafing, #110 Réville, #204 Oxford, #261 Rimini**.
- **0 original-image byte/hash verifications, 0 final editorial approvals and 0 new images published.**

## Candidate workload

- 31 distinct candidate photographs across 24 churches. **16 preview-preferred**, 15 other viable.
- 2 church sites cannot yet produce a church-wide original verification candidate from the existing reviewed pool: Chapelle Saint-Eloi (SOURCE_PREVIEW_EXCEPTION_ONLY); Prieuré de la Sainte Croix (NO_PREVIEW_VIABLE_CHURCH_WIDE_CANDIDATE).
- First-pass queue selects no more than one candidate per architectural role (interior/exterior) at each site; this is *not* an editorial guarantee. Candidate order is conservative: preview-preferred, then viable, then secondary. Detail-only/hero-rejected images are excluded from this initial full-size pass, but remain in the canonical record.

## Four exact preview exceptions

| P87 ID | Church | Exact file | Additional non-visual source finding | Disposition |
|---|---|---|---|---|
| #77 | Grafing Marktkirche | [Marktplatz10 Grafing-03.JPG](https://commons.wikimedia.org/wiki/File:Marktplatz10_Grafing-03.JPG) | [Church category](https://commons.wikimedia.org/wiki/Category:Allerheiligste_Dreifaltigkeit_(Grafing)) corroborates church, **not** preview content | HOLD — exact preview still unseen |
| #110 | Chapelle Saint-Éloi, Réville | [Réville 20130817-01.JPG](https://commons.wikimedia.org/wiki/File:R%C3%A9ville_-_Chapelle_Saint-%C3%89loi_20130817-01.JPG) | [Commons Quality Images category](https://commons.wikimedia.org/wiki/Category:Quality_images_of_Manche) lists 5,168×3,446 file, ~7.3 MB | HOLD — exact preview still unseen |
| #204 | Oxford Oratory | [Porch 8095195.jpg](https://commons.wikimedia.org/wiki/File:Porch_on_Oxford_St_Aloysius_Gonzaga_-_geograph.org.uk_-_8095195.jpg) | [Commons Oxford category](https://commons.wikimedia.org/wiki/Category:Oxford_Oratory) lists 900×1,200 file; [photographer's Geograph page](https://www.geograph.org.uk/photo/8095195) labels it **porch**, by Bill Nicholls | HOLD — likely architectural detail, exact Commons preview still unseen |
| #261 | Rimini Madonna di Loreto | [Spadarolo 02.jpg](https://commons.wikimedia.org/wiki/File:Rimini_-_Spadarolo_-_Cappella_del_Priorato_Madonna_di_Loreto02.jpg) | [Dedicated church category](https://commons.wikimedia.org/wiki/Category:Cappella_del_Priorato_Madonna_di_Loreto_a_Spadarolo_di_Rimini) lists 3,456×4,608 file, ~3.34 MB | HOLD — exact preview still unseen |

The category dimensions and photographer statements above are source-page observations, not independent original-byte, EXIF, or publication-rights verifications. Never copy neighboring images' license to one of these files.

## Required release gates

1. Download **the exact Commons originals** and retain their revision URLs, original SHA1 and recomputed SHA1/SHA256. Source hashes in the queue are claims from the older ledger and remain unverified.
2. Review at original resolution for image fidelity, technical quality, visual relevance, framing, cropping, frame exclusion and obstructions.
3. Check the exact church against the frozen physical Mass location and the right venue, not merely a matching name.
4. Record creator, complete license and version, attribution, links, adaptations, and ShareAlike duties from the exact image page. No fees or owner contact.
5. Seek explicit editorial acceptance; only then propose any production image references, behind separate CI and integrity gates.

### Integrity requirements

Before publication: run `node docs/research/directory/p91-source-pin-visual-reconciliation-20261029/verify-evidence.mjs`; preserve 385/90/83/212, historic IDs, and all P94–P97 records. This P98 sidecar is inert, and must not be treated as an app image manifest. **Zero new production files or approvals.**
