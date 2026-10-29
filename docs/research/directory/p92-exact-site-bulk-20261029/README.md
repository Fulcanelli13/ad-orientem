# P92 — 40 exact church-building identity matches, research only

**P91 is merged.** P92 updates its canonical 385-record evidence JSON in place and preserves all 90 negative decisions, prior 17 corroborations, original IDs/filenames and all historic P88/P89/P90/P91 observations. No second gallery or alternative source of truth is created.

**Effective P92 status:** 90 wrong images rejected, 57 subject identities corroborated (40 P92 new, across ten sites), 238 photos held across 131 physical sites. These are **building identity checks**, *not* visually chosen images or permission to publish. Original bytes verified: 0. Rights cleared: 0. Editorial approvals: 0. Production publications: 0.

## Ten newly corroborated buildings

| P87 contact indices | Target site | Exact Commons category and independent physical-site corroboration |
| --- | --- | --- |
| 55–58 | Adelhauser Kirche, Freiburg | [Commons church](https://commons.wikimedia.org/wiki/Category:Adelhauser_Kirche_(Freiburg_im_Breisgau)), [interior](https://commons.wikimedia.org/wiki/Category:Interior_of_Adelhauser_Kirche_(Freiburg_im_Breisgau)), [Freiburg official visitor record](https://visit.freiburg.de/en/adelhauser-kirche) |
| 137–140 | Notre-Dame des Armées, Versailles | [Commons chapel](https://commons.wikimedia.org/wiki/Category:Chapelle_Notre-Dame-des-Arm%C3%A9es_de_Versailles), [parish locations](https://notredamedesarmees.fr/paroisse/lieux/) |
| 147–150 | Saint-Germain, Duingt | [Commons church](https://commons.wikimedia.org/wiki/Category:%C3%89glise_Saint-Germain_de_Duingt), [independent local history](https://www.tourisme-haute-savoie.com/les-plus-beaux-villages/duingt/), [place de l'Église](https://www.lac-annecy.com/itineraire-de-randonnee-pedestre/la-boucle-de-duingt-saint-jorioz-par-les-sentiers-duingt/) |
| 155–158 | Saint-François-de-Paule, Toulon | [Commons church](https://commons.wikimedia.org/wiki/Category:%C3%89glise_Saint-Fran%C3%A7ois-de-Paule_de_Toulon), [parish exact address](https://saintfrancoisdepaule.org/la-paroisse/localisation/) |
| 162–165 | Saint-Grégoire des Minimes, Tours | [Commons church and absidal chapel](https://commons.wikimedia.org/wiki/Category:%C3%89glise_Saint-Gr%C3%A9goire_des_Minimes), [SSPX church address](https://laportelatine.org/lieux/prieure-saint-martin/saint-gregoire-tours) |
| 175–178 | Our Lady of Sorrows Cathedral, Wrexham | [Commons Wrexham Cathedral](https://commons.wikimedia.org/wiki/Category:Wrexham_Cathedral), [diocese cathedral location](https://www.rcdwxm.org.uk/st-marys-cathedral-wrexham) |
| 202–205 | Oxford Oratory, St Aloysius Gonzaga | [Commons Oxford Oratory](https://commons.wikimedia.org/wiki/Category:Oxford_Oratory), [Oratory contact](https://www.oxfordoratory.org.uk/contact.php), [Archdiocese of Birmingham](https://www.birminghamdiocese.org.uk/the-oratory-st-aloysius-oxford?title=the-oratory-st-aloysius-oxford) |
| 339–342 | Holy Family Log Church, Cahokia | [Commons historic log church](https://commons.wikimedia.org/wiki/Category:Church_of_the_Holy_Family%2C_Cahokia), [ICKSP Mass location](https://institute-christ-king.org/cahokia-home), [parish building history](https://www.holyfamily1699.org/log-church.html) |
| 374–377 | St Thomas the Apostle, Ann Arbor | [Commons church](https://commons.wikimedia.org/wiki/Category:Saint_Thomas_the_Apostle_Church_(Ann_Arbor%2C_Michigan)), [official address](https://sta2.org/church/contact-us/) |
| 378–381 | St John Cantius, Chicago | [Commons church](https://commons.wikimedia.org/wiki/Category:St._John_Cantius_Church_(Chicago)), [parish contact](https://www.cantius.org/contact-us) |

Each matched record has P92 evidence and URL provenance, with the historic status retained separately. A named sub-building detail (e.g., an apse chapel) corroborates the parent building but **does not** qualify as a suitable hero image.

## Next bulk verification strategy

The remaining 238 unresolved images are grouped into 131 physical sites. **33 multi-photo sites contain 114 images** and should be resolved first as an exact-building batch, followed by the remaining 98 sites. Region counts: GB 61, France 44, US 43, Italy 22, Germany 20, and other countries 48.

Generate a fresh site-first work queue on demand using:

```bash
node docs/research/directory/p92-exact-site-bulk-20261029/generate-held-sites.mjs > /tmp/p92-held-sites.json
node docs/research/directory/p91-source-pin-visual-reconciliation-20261029/verify-evidence.mjs
```

The first command generates a disposable derivative from the single existing canonical JSON; it does **not** introduce a new saved gallery or candidate master.

**Release gate:** independent exact physical-building identification → original photographic visual inspection and composition/role selection → original file hash/rights check → explicit editorial acceptance → production. No stage is implicitly granted by the previous one. No spend, paid storage, contact requests, or public publication in P92.
