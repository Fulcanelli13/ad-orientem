# CL6 — Final B92-only source pass; research addresses, not map release

**26 October 2026 · Stacked on CL5 PR #1738 (CL4 #1735 → CL3 #1732 → CL2 #1729).** All data here are additive research records. No CL2 record or public Find a Mass JSON was edited.

## Exact progress

| Research gate | Starting CL6 | New in CL6 | Still outstanding |
|---|---:|---:|---:|
| Classification-only sources without additional independent evidence after CL5 | 17 | **7 evidence packages recorded** | 10 |
| Original physical description blanks after CL5 | 58 | **9 address/location descriptions recovered** | **49** |
| Original B98+B92 identity flags | 40 | **0 canonical admissions** | 40 |
| Public Mass site pins or current timetable approvals | 0 | 0 | 0 |

**757 / 806 original missing physical descriptions** have a documented replacement from the B99–CL6 pipelines (94%); these are research descriptions, not 757 released map pins. The frozen CL2 research master still has **2,584 canonical historical IDs**, **2,579 distinct provisional physical anchors**, and **4,681 preserved historical Mass rows**.

## 17 fully inventoried source-review cases

Seven have **additional** source evidence, captured with the exact frozen B92 group/source IDs in `overlay.json`:

- Brazil, Campos: Nossa Senhora do Terço — parish's [own public Facebook listing](https://www.facebook.com/paroquiadoterco/?locale=pt_BR) supports Avenida Sete de Setembro 268. This does not certify a schedule.
- Poland, Oświęcim: Fatima chapel — [Bielsko Latin Mass organizer, October 2026](https://tridentina-bielsko.blogspot.com/2026/?m=1) names the chapel for 11 October. A date-specific event is not a permanently recurring Mass.
- Poland, Tarnów: St Joseph's Academic Church — [the traditional-Mass group's own site](https://trydencka.tarnow.pl/msza-w-tarnowie) identifies Dwernickiego 1 and published recurrence; do not import without schedule release verification.
- Poland, Łomża: Corpus Christi parish — [the parish](https://bozecialo.lomza.pl/pg_info_msze.php) lists Sunday Tridentine Mass. Its **chapel within the church** must not be assumed to be a separate building.
- Poland, Starachowice: Our Lady of Częstochowa — [the parish's October 2026 schedule](https://parafialazy.pl/) records Tridentine Masses on 18 and 25 October. Not an automatic indefinite recurrence.
- Italy, Rivarolo: [September–October 2026 parish bulletin](https://parrocchia.rivarolocanavese.org/settembre-ottobre-2026-foglio-parrocchiale-n-7/) documents *rito antico* at **San Rocco**; confirm whether this is exactly the archived *Confraternita dei Santi Rocco e Carlo* building.
- France, Carnoux: [current specialist directory](https://iterfidei.com/it/messa-in-latino-dove/francia/marseille) and older SSPX operator bulletins identify Oratoire Saint-Marcel, but street descriptors differ. This is *historical/current-directory corroboration*, **not** verified 2026 operation or pinpoint geometry.

The **other ten** B92-only records remain research sources but without sufficiently independent CL6 address/physical corroboration: nine Brazilian Apostolic Administration parishes and the Austrian FSSP Werfen church. The [FSSP's currently posted Austria Mass-locations list](https://petrusbruderschaft.de/pages/wo-wir-sind/oesterreich/messorte.php) does not list Werfen; absence is **not proof of closure**. The original Brazilian official catalogue URL returns 403 to the research browser and is retained as an original reference. **No artificial canonical admissions.**

## Nine new description backfills

| Original group | Research physical description | Source / condition |
|---|---|---|
| `RG-34FDCB6355B4` | San Ferdinando, Piazza Trieste e Trento, Naples | Italian [state heritage catalogue](https://catalogo.beniculturali.it/detail/ArchitecturalOrLandscapeHeritage/1500074652A); civic number not verified |
| `RG-AAFBD16C4CD5` | Rosariello, Piazza Cavour 124, Naples | [Naples Archdiocese](https://www.chiesadinapoli.it/wd-annuario-enti/chiesa-di-santa-maria-del-rosario-alle-pigne-detta-rosariello-2822/) |
| `RG-4A061E5815D0` | Gesù e Maria, Piazza Gesù e Maria, Naples | [Naples Archdiocese](https://www.chiesadinapoli.it/wd-annuario-enti/3-decanato-22-parrocchie-quartieri-spagnoli-montesanto-pizzofalcone-1305/parrocchia-s-maria-di-montesanto-napoli-430/); [Italian ministry flags disuse](https://beniabbandonati.cultura.gov.it/beni/chiesa-di-gesu-e-maria/)—no active use inferred |
| `RG-C2F1E09958E7` | San Giacomo degli Spagnoli, Piazza Municipio, Naples | [Naples Archdiocese](https://www.chiesadinapoli.it/wd-annuario-enti/3-decanato-22-parrocchie-quartieri-spagnoli-montesanto-pizzofalcone-1305/parrocchia-s-maria-incoronatella-napoli-439/); civic-complex entrance held |
| `RG-5125511C9FE5` | Sant'Antonio Abate, Via Foria 302, Naples | [Naples Archdiocese](https://www.chiesadinapoli.it/wd-annuario-enti/parrocchia-di-s-antonio-abate-napoli-289/) |
| `RG-FC9C1D79B1FC` | Santa Maria della Vittoria, Piazza della Vittoria, Naples | [Naples Archdiocese](https://www.chiesadinapoli.it/wd-annuario-enti/3-decanato-22-parrocchie-quartieri-spagnoli-montesanto-pizzofalcone-1305/parrocchia-s-maria-della-mercede-napoli-396/) |
| `RG-37D25B28AB60` | FSSP Südtirol, Seiserleite 78a, Vahrn | [FSSP institutional directory](https://www.fssp.org/en/find-us/where-are-we/) — **residence, not a Mass church** |
| `RG-64C25445EA3F` | Herz-Jesu church, Altenmarktgasse 17, Brixen | Same [FSSP owner directory](https://www.fssp.org/en/find-us/where-are-we/) — distinct Mass-site entry |
| `RG-91475601ED97` | St James, 2777 Townline Road, Abbotsford | [Parish first-party contact](https://stjamesabby.com/contact) |

## Critical safeguard discovered

**Kęty church:** CL5's B92 source says **Mickiewicza 2**, while the [Bielsko organizer's published location list](https://tridentina-bielsko.blogspot.com/2024/09/uwaga-zmiana-miejsca-celebracji-w.html) gives **Mickiewicza 4**. Both are retained; hold an exact entrance geocode until checked. Similarly, San Rocco/Rocco-Carlo, Carnoux address variants and the Vahrn residential site are held. Do not mistake a church building, an institutional residence, an organizer, and a 1962 celebration for equivalent site types.

## Rebuild independently

From the repository root (Python 3 standard library; no paid services):

```sh
python3 tools/directory/validate-cl3-reconciliation.py
python3 tools/directory/validate-cl4-owner-screening.py
python3 tools/directory/validate-cl5-provisional-intake.py
python3 tools/directory/validate-cl6-source-reconciliation.py
python3 tools/directory/rebuild-cl6-research-index.py --output /tmp/ad-orientem-cl6.sqlite
```

CL6 re-creates the **whole checksum-verified CL2 SQLite and CL5 supplemental tables** from committed JSON, then appends `cl6_source_review` (17), `cl6_address_backfill` (9), `cl6_identity_holds` (40), and `cl6_safeguards` (6). Original IDs and research/publication separation are enforced by checks and constraints.

Example:

```sql
SELECT country, name, disposition, source_url FROM cl6_source_review;
SELECT site_name, description, site_type FROM cl6_address_backfill;
SELECT COUNT(*) FROM canonical_site; -- 2584 unchanged
```

**Follow-on:** establish first-party corroboration for ten outstanding B92 records and handle six original B98 classification gaps; cross-link corroborated physical candidates into existing canonical IDs only via explicit admission decisions. The remaining 49 description gaps need locale-specific owner/institutional research, especially Italy, Spain and Canada. Publication remains a separate release gate.
