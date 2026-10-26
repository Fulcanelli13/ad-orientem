# CL5 — Evidence-backed physical intake, institutional provenance and additional address recovery

**26 October 2026 · Research-only extension of CL2 → CL3 → CL4.**

## Actual work

| Gate | Before CL5 | In CL5 | Remaining / note |
|---|---:|---:|---|
| Classification-only B92 sources not admitted to CL2 canonical sites | 34 | **17 named Mass-site physical leads corroborated** via parish, host, SSPX, Jesuit, diocesan or local organizer sources | 17 without equivalent provenance captured |
| Historical CL2 identity exception flags | 40 | 17 physically evidenced + four with institutional evidence, **none canonicalized** | 40 original flags retained; these are *not* new joins |
| B98-only site groups missing full classification rows | 6 | **4 source-scoped institutional relationships documented** | 2 still without an equivalent first-party institutional witness |
| Outstanding physical descriptions after CL4 | 63 | **5 new owner/diocesan Canadian addresses** | **58 blank descriptions** |
| Public pins or current timetable approvals | 0 | **0** | Release gates unchanged |

**Do not report 2,579+17 as the canonical site count.** The CL2 2,579 provisional distinct physical anchors are unchanged. The 17 are separate physical intake records, identified by the frozen B92 source IDs, suitable for subsequent same-building deduplication and controlled canonical admission. Absence of an exact literal address collision in CL2 is not proof that the venue is new. CL5 *corroborates real worship-site names* and gets them into a queryable candidate ledger, not production.

## 17 first-party/local-organizer corroborations

- **France — 3:** Bormes [parish's Saint-François chapel](https://www.paroissedebormes.fr/horaires-des-offices/); Ollioules [Saint-Laurent parish](https://ollioules.frejustoulon.fr/la-paroisse/horaires-et-informations-pratiques/) (church identity **only**, page does not itself document a traditional Mass); Font-Romeu [SSPX's Sainte-Colombe de Vià](https://laportelatine.org/lieux/fabregues/font-romeu) (only certain summer Sundays, not weekly by default).
- **Gdańsk region — 6:** St Barbara, St Jan Bosko, Immaculate Conception, Our Lady Queen of the Polish Crown, Jesuit St Stanisław Kostka school chapel in Gdynia, and Holy Cross church in Rumia are named in [the archdiocesan Latin Mass apostolate's published location list](https://tradycjagdansk.pl/gdzie-i-kiedy/). The site **explicitly instructs readers to consult weekly notices** and indicates some other Masses are suspended; no static schedule published from the list.
- **Bielsko region — 4:** Chapel of Our Lady of Częstochowa (Bielsko-Biała), Bonifraters' church (Cieszyn), St Jan Kanty (Kęty), and **St Mark's chapel** (Żywiec), identified in the [October 2026 organizer notices](https://tridentina-bielsko.blogspot.com/2026/10/?m=1). The legacy name for the latter says “Kościół”; the organizer calls it “kaplica”. Hold church-versus-chapel physical-type reconciliation.
- **Four other Polish sites:** [Jesuit Holy Trinity church in Radom](https://radom.jezuici.pl/msza-trydencka/), [rectoral St Catherine in Zamość](https://www.katarzynazamosc.pl/kategorie/msze_swiete), [All Saints chapel in Łódź](https://www.tradycjalodz.com/kontakt), and [Holy Family shrine at Wyszków](https://tridentina-wyszkow.blogspot.com/p/terminy-mszy-swietej.html). The first three are first-party owner/organizer sources, and Wyszków's group lists monthly announcements.

A canonical site with the *same normalized name but a different city/street* exists for Église Saint-Laurent (**Épinal**, not Ollioules) and Immaculate Conception (**Warsaw**, not Gdańsk). These are **not safe deduplication matches**. Each candidate preserves its original building description and its frozen research group/source IDs.

## Four bounded institutional attestations

- **São José Operário (Barra Mansa):** the [diocese](https://diocesevr.com.br/noticia/2414/co-catedral-nossa-senhora-da-conceicao-acolhe-comunidade-sao-jose-operario-de-barra-mansa) says this community belongs to the co-cathedral parish; this does not assert who celebrates a future old-rite Mass.
- **Capelania Nossa Senhora do Perpétuo Socorro (Volta Redonda):** [diocesan parish listing](https://www.diocesevr.com.br/paroquia/47/capelania-pessoal-nossa-senhora-do-perpetuo-socorro) confirms personal chaplaincy and its street address.
- **Santuário do Bom Jesus (Montes Claros):** [SSVM](https://ssvm.org.br/missa-tridentina/) describes its Tridentine Mass apostolate in the city, but the page does not independently establish building ownership or the individual celebrant at the sanctuary.
- **Chiesa San Donato (Siena):** the [archdiocese](https://www.arcidiocesi.siena.it/siena-la-chiesa-di-s-donato-assegnata-dallarcidiocesi-allordine-equestre-del-santo-sepolcro-di-gerusalemme/) documents the September 2025 custodianship transfer to the Equestrian Order. Current old-rite use and times remain unresolved.

All six B98-only exceptions remain in the CL2 identity queue until real classification-source admissions, not simply evidence notes, are reconciled with their frozen IDs. **No Una Cum or canonical-recognition claims are inferred.**

## Five Canada physical descriptions

1. Our Lady of Fatima Parish, Kingston — [owner](https://www.fatimakingston.com/): **588 Division Street**.
2. Saints Joachim & Ann, Aldergrove — [owner](https://aldergrovecatholic.com/contact): **2827 273 Street**; do not use the mailing PO box as building location.
3. **Mater Dei**, Sudbury/Coniston — [diocese](https://dioceseofsaultstemarie.org/latin-mass-community): Mass building is **St Michael's Ukrainian Catholic Church, 48 William Avenue, Coniston**. The community office at 21 Ste-Anne Road in Sudbury is *not* the Mass location. Keep building owner/rite, organizer and schedule separate.
4. St Augustine's, Moncton — [archdiocese](https://www.diocesemoncton.ca/en/paroisses/31): **340 Dominion Street**.
5. St Patrick's, Schomberg — [archdiocese](https://stpatrickssc.archtoronto.org/en/contact-us/parish-information/): **91 Church Street**; not the Nobleton mailing office.

All five are research-only literal postal descriptions, not released geocoded public venues, and none of these addresses alone certifies use of the 1962 Missal.

## Reproducible queryable database

No extra packages; Python 3 stdlib.

```sh
python3 tools/directory/validate-cl3-reconciliation.py
python3 tools/directory/validate-cl4-owner-screening.py
python3 tools/directory/validate-cl5-provisional-intake.py
python3 tools/directory/rebuild-cl5-research-index.py --output /tmp/ad-orientem-cl5.sqlite
```

The final script rebuilds the **entire original CL2 SQLite** from the 25 checksum-verified committed JSON parts and adds four **separate** tables:

- `cl5_provisional_physical_intake` — 17 original group/source IDs and sources;
- `cl5_institutional_evidence` — four group-linked institutional claims;
- `cl5_address_backfills` — five site-group ID and description entries;
- `cl5_identity_queue` — all 40 original open exception keys with dispositions.

```sql
SELECT country, site_name, source_url FROM cl5_provisional_physical_intake;
SELECT historical_group_id, organization FROM cl5_institutional_evidence;
SELECT COUNT(*) FROM canonical_site; -- 2584 frozen CL2 historical IDs
```

**No insert into CL2 canonical_site, change to public Place IDs, or Mass timetable rows.** The source-of-truth remains the existing repository and its stacked PR chain, not a detached replacement register.
