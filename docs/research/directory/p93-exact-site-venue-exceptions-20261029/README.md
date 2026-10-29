# P93 — seven exact church buildings, 26 research subject matches, one Mass-venue collision

This audit builds on the merged P92 canonical ledger; it **does not publish or approve images**.

## Status (385 immutable original P87 assignments)

| Classification | P92 merged | P93 staged |
| --- | ---: | ---: |
| Wrong physical images rejected | 90 | 90 |
| Exact physical subjects corroborated (research only) | 57 | **83** |
| Unresolved photographs held | 238 | **212** |
| Sites associated with unresolved photographs | 131 | **124** |
| Subject-identities fully visual/editorially approved | 0 | **0** |
| Original photo bytes/hash verified for release | 0 | **0** |
| Rights cleared for actual final image | 0 | **0** |
| App production photographs published | 0 | **0** |

P93 adds 26 research-only identities across seven physical sites:

| Contact indexes | Building | Verifiable source |
| --- | --- | --- |
| 51–54 | Church of St Peter at Poříčí, Prague | [Commons exact category](https://commons.wikimedia.org/wiki/Category:Kostel_svat%C3%A9ho_Petra_Na_Po%C5%99%C3%AD%C4%8D%C3%AD); [Una Voce exact site](https://www.unavoce.cz/kostely/praha/praha-sv-petr-porici); [Night of Churches](https://www.nockostelu.cz/kostel/1347/) |
| 69–72 | Kapelle Hl. Bruder Konrad, Kolbermoor | [Commons chapel](https://commons.wikimedia.org/wiki/Category:Kapelle_Hl._Bruder_Konrad_FSSPX_(Kolbermoor)); [SSPX official map](https://map.fsspx.org/de/places/kapelle-hl-bruder-konrad) |
| 192–195 | Our Lady of Lourdes and St Cecilia, Blandford | [Commons exact church](https://commons.wikimedia.org/wiki/Category:Church_of_Our_Lady_of_Lourdes_and_St_Cecilia,_Blandford_Forum); [Plymouth Diocese church](https://www.plymouth-diocese.org.uk/church/blandford-forum-lady-lourdes-st-cecilia/) |
| 261–264 | Madonna di Loreto chapel, Spadarolo, Rimini | [Commons exact chapel](https://commons.wikimedia.org/wiki/Category:Cappella_del_Priorato_Madonna_di_Loreto_a_Spadarolo_di_Rimini); [SSPX Italy priory](https://fsspx.it/it/priorato-madonna-di-loreto-rimini-32790) |
| 325–327 | Cathedral Basilica of Our Lady of Peace, Honolulu | [Commons exterior](https://commons.wikimedia.org/wiki/Category:Exterior_of_the_Cathedral_Basilica_of_Our_Lady_of_Peace_(Honolulu)); [Commons interior](https://commons.wikimedia.org/wiki/Category:Interior_of_the_Cathedral_Basilica_of_Our_Lady_of_Peace_(Honolulu)); [official address](https://honolulucathedral.org/contact-us/) |
| 343–346 | Holy Family Church, Saginaw | [Commons exact church](https://commons.wikimedia.org/wiki/Category:Holy_Family_Church_(Saginaw,_Michigan)); [parish address](https://holyfamilysaginaw.org/contact/) |
| 347–349 | Holy Name of Jesus Cathedral, Raleigh | [Commons exact cathedral exterior](https://commons.wikimedia.org/wiki/Category:Exterior_of_Holy_Name_of_Jesus_Cathedral_(Raleigh,_North_Carolina)); [Raleigh diocesan address](https://dioceseofraleigh.org/parish/holy-name-jesus-cathedral-raleigh) |

Per-photograph original URLs and supporting evidence are stored within **the single canonical ledger** at `p93_evidence` and `p93_research_outcome`. All earlier P88–P92 dispositions, rejected rows and indices are retained. Every photo remains non-publishable without further checks.

## Venue identity exception — Park City, Utah (indexes 371–373)

**Do not resolve merely because the Commons category contains a church with the same parish name.**

- The candidate original image series refers to modern St. Mary of the Assumption Church, **1505 White Pine Canyon Road** ([exact Commons category](https://commons.wikimedia.org/wiki/Category:St._Mary_of_the_Assumption_Church_(Park_City,_Utah))).
- [The parish's official location page](https://www.stmarysparkcity.com/visit) separately identifies its **Old Town Chapel, 121 Park Avenue**.
- [The parish's Mass/location page](https://www.stmarysparkcity.com/church) explicitly references Latin Mass at the Old Town Chapel; contemporary information can vary, therefore the canonical record's actual TLM venue must be checked against the relevant date and site, not just parish name.

The three candidate photos remain **HELD**, not automatically rejected or accepted. The per-row `p93_venue_ambiguity` exception preserves exact source evidence.

## Technical source-quality caution

Index 346 (`Holy Family - Saginaw 04.jpg`) is only **835 × 664 pixels** in the Commons category. This is a resolution concern for an app hero, not proof the subject is wrong. Preserve the image's subject corroboration while requiring actual original-byte and composition review.

The role labels for Honolulu exterior/interior derive from Commons category only; they are **NOT visual inspection or editorial approval**. Do not substitute similar web image results for the exact file IDs.

## Next gate — actual-image review, not more provisional gallery publication

Resolve the remaining 212 candidate photos by the 124 exact physical sites. Of the 26 multi-photo sites remaining, 88 photos can be grouped for economical source checks. Before any publication: (1) original file inspection at an appropriate display size, (2) precise venue/architectural-object matching, (3) composition and intended role (hero/exterior/interior/altar), (4) original file hash and attributable rights, (5) final editorial approval.

Do not confuse research corroboration, a Commons category, a source licence label or automated technical screening with an actually acceptable photograph. No contact with church owners or spend is required for research. No generic keyword-based substitute photos.

## Deterministic validation

```bash
node docs/research/directory/p91-source-pin-visual-reconciliation-20261029/verify-evidence.mjs
node docs/research/directory/p92-exact-site-bulk-20261029/generate-held-sites.mjs > /tmp/p93-held-sites.json
```

The second script now derives its totals dynamically from the authoritative ledger. It is a temporary, regenerable queue, **not** a second master.
