# Sacred Atlas — bounded relic publication phase and Marian handover

Reviewed 9 October 2026. **Release disposition: major-destination baseline can be frozen after CI; worldwide relic census remains open, with explicit source holds.** This is not a certification of the identity of individual relics or a declaration that all saint-related custody sites have been found.

## Completed in production and this branch

- Two waves previously published 39 *new* principal saint-custody sites from the original curated 66-site/71-association selection (the other 27 sites already existed as geographical destinations; selection reuse can vary by association).
- Seven previously held exceptional sacred-object custodial locations published with distinct historical-attribution and exposition notices: Turin, Aachen, Trier, Cahors, Oviedo, Fécamp and Manoppello.
- One additional major Benedictine destination recovered: **Montecassino Abbey**, with a site-level grouped Benedict/Scholastica material tradition and the original Benedictine custodian source. This is a separately attested historic monastic claim, not corroboration or refutation of Fleury's claimed transfer.
- Saint Benedict and Saint Mary Magdalene dossier-level two-custodian comparisons created. Repeated claims in the already-published Fleury, Saint-Maximin and Vézelay public profiles are now mutually qualified and linked by a stable conflict ID.
- Latest branch corpus counts: **182 canonical Places, 178 shrine profiles, 206 pilgrimages, 122 relic source records, 261 shrine source-registry entries**. These totals include shrines not classified as relic shrines, and multiple relic records may share one geographical point.
- The new 60-case subject-first expansion is stored in `data/explore/relic-final60-new-subjects.review.v1.json` and is deduplicated against the 161 prior research subjects. It contains **40 rows with a directly linked review source**, **20 unsourced leads**, plus **5 additional sourced rows still held because material/current custody evidence is inadequate**. Sourced does **not** mean authenticated. The sixty-candidate study has not generated sixty sites or sixty pins.

## Significant findings that prevent bad pins

1. Three Jesuit saints (Aloysius Gonzaga, John Berchmans, Robert Bellarmine) are attested at the **one** Church of Sant'Ignazio in Rome; see https://chiesasantignazio.it/opere-arte-chiesa/ . John Berchmans's heart is separately kept at Saint-Michel, Leuven: https://chiesasantignazio.it/sepolture-giovanni-berchmans/
2. The original Brazil **Santa Paulina** pilgrimage sanctuary is Nova Trento, whereas the sanctuary's own novena places her body at Capela Sagrada Família, **São Paulo**: https://santuariosantapaulina.org.br/wp-content/uploads/2022/06/Novena-Santa-Paulina-2022.pdf . A prominent pilgrimage shrine is not necessarily a tomb.
3. The **Syracuse** Saint Marianne Cope shrine keeps a directly documented bodily relic, not necessarily the whole body: https://saintmarianne.org/about-the-museum . Historical transfers to **Honolulu** require a distinct claim, not a second presumed full corpus.
4. Saint Joseph **Freinademetz** has a significant birthplace shrine at Oies in South Tyrol, but his first burial was at Taikia, China: https://www.freinademetz.it/it/eventi-e-news . A birthplace and tomb are separate place types.
5. At **Notre-Dame de Paris**, the Religious of the Assumption explicitly confirm a small Saint Marie-Eugénie relic in the 2024 altar: https://assumpta.org/fr/actualites/les-reliques-de-sainte-marie-eugenie-dans-le-nouvel-autel-de-notre-dame-de-paris . This should be a profile association under an *existing* Place, not a new global saint-body marker.
6. Historical custodial disputes are not adjudicated by a map: https://www.abbaye-fleury.com/st-benoicirct-pegravere-des-moines.html ; https://abbaziamontecassino.it/arte/la-tomba-di-san-benedetto-e-di-santa-scolastica/la-tomba/ ; https://paroissesaintmaximin.fr/basilique/les-saintes-reliques/ ; https://www.basiliquedevezelay.org/samedi-saint/ .

## Release and editorial controls

`tests/relic-final60-conflicts.mjs` asserts subject deduplication, evidence-checked versus unsourced holds, dispute dossier integrity, first-party source links, EN/FR qualification, one Montecassino Place, and one relic map marker per physical Place. Existing Directory Foundation census and map-validation tests continue to run.

**Next relic actions are maintenance, not grounds to postpone another major Atlas family indefinitely:** resolve the twenty unsourced subject leads before advertising them; inspect the five sourced material holds; periodically recheck source URLs and access status; verify the historical competing whole-body narratives before pronouncing an exclusive attribution. Keep the worldwide-relic census open-ended, but do not force a global-completion claim.

## Next Atlas initiative — major Marian shrines

Use [GitHub #665](https://github.com/Fulcanelli13/ad-orientem/issues/665) as the canonical next phase. The initial register already has **69 Marian-labelled shrines**, which are **not** 69 certified 'major' Marian pilgrimage destinations.

The admission framework needs (a) independently attested pilgrimage identity and (b) independently attested destination importance. Classify international/world, national and regionally consequential historic sanctuaries. A mere dedication to Our Lady is insufficient; an approved Marian apparition is **not** a requirement. Ecclesiastical shrine designation, historical pilgrimage reach and authenticity/approval of any alleged supernatural event remain separate dimensions. Include old Marian shrines, Marian images, Black Madonnas, national patronal sanctuaries and apparition-associated sites. Start by crosswalking all 69 current entries and preserve every existing canonical Place. Do not infer 1962 liturgical observance, current Mass schedules or miracle authentication.
