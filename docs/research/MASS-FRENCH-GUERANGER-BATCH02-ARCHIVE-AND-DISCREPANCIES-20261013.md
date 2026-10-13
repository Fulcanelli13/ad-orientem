# Mass — French-original source research, batch 2: archived findings and source-critical gaps (13 October 2026)

**Editorial status:** independent research artifacts. **Not** approved reader copy, **not** 1962 priest-rubric certification, **not** implementation of the two rails or the dynamic ribbon.

## Canonical provenance and storage

The **complete extracted research records** reside in the source-of-truth repository:

1. `data/research/mass-fr-gueranger-microguide-batch02.v1.json` — 41 *new* French micro-explanation candidates, IDs **FRG31–FRG71**, with exact `AO.SM.C####` anchors, original-French prayer/section locators, HTML line ranges, authority flags and newly written French editorial paraphrases. They augment the prior 30 candidate headings FRG01–FRG30 rather than replacing them.
2. `data/research/mass-fr-gueranger-actor-posture-evidence-batch02.v1.json` — 30 historically attested **actor-specific** posture/gesture/action records: **23 celebrant, 4 faithful, 3 deacon**. Every record contains the cited French-original location, actor, Mass form or condition, and `accepted1962Norm: false` pending verification.
3. `data/research/mass-rail-paragraph-coverage-20261013.json` — existing **279 Sung** and **275 Low** canonical cue units plus one synthetic non-liturgical pause per form; each source unit now references associated original-French explanatory candidate IDs and historical posture records. Source unit presence is not sufficient to certify a posture.
4. `docs/research/MASS-FRENCH-GUERANGER-ORIGINAL-AUDIT-20261013.md` — original 30-candidate French dossier **corrected in this batch**; the commixture is `C0221`, not `C0220`, and the Last Gospel opening is `C0269`, not `C0267`.
5. `docs/MASS-PARAGRAPH-RAILS-AND-DYNAMIC-GUIDANCE-CONTRACT-20261013.md` — governing four-surface decision: left faithful posture/gesture; right priest station/posture; in-text exact priest actions; second top ribbon replaced by contextual explanation that does not duplicate in-text priest movements.

**French witness:** Dom Prosper Guéranger, *Explication des prières et des cérémonies de la sainte Messe*, second edition, Solesmes, 1885, a posthumous compilation of conference notes. [Read original French transcription](https://www.domgueranger.net/explication-des-prieres-de-la-sainte-messe-2/); [bibliographic witness](https://books.google.com/books/about/Explication_des_pri%C3%A8res_et_des_c%C3%A9r%C3%A9mo.html?id=7Dl_LJtRf78C). All prose in batch 2 is editorial paraphrase. Its original 1885 positions, omissions and theological interpretations are **not** controlling 1962 law.

**Normative reference:** [1962 Ritus servandus](https://archive.ccwatershed.org/pdfs/5276-ritus-servandus-translated-english/download/) and [1960 General Rubrics](https://propria.org/wp-content/uploads/2019/10/the-new-rubrics-of-the-roman-missal-and-breviary-1960-by-rev.-patrick-l.-murphy.pdf), applied through existing profiles and primary-law registries.

## High-value original French discoveries

| Cue / moment | New specific content | Evidence (1885 French transcription) | Publication gate |
|---|---|---|---|
| `C0159` **Communicantes** | Guéranger says St Joseph was not named in his contemporary Canon; the 1962 source **includes him**. | `COMMUNICANTES`, lines 485–487. | Historical difference only; never describe 1962 as omitting him. |
| `C0164–C0166` **Quam oblationem** | Source differentiates *benedictam/adscriptam/ratam/rationabilem/acceptabilem*, connects rational spiritual offering with Romans 12:1, and attends to *fiat nobis*. | `QUAM OBLATIONEM`, lines 505–513. | Check theological translation against Latin; five crosses anchored to correct words. |
| `C0173–C0174` **Host Consecration** | Guéranger details immediate first genuflection *statim*, then elevation for faithful adoration, replacement and second genuflection. | `CONSÉCRATION DE L'HOSTIE`, lines 518–522. | Validate event ordering via Ritus; not all actions on one timestamp. |
| `C0184–C0185` **Unde et memores** | Signs of the Cross after Consecration are interpreted as recalling the Sacrifice, not consecrating the Species again. | `UNDE ET MEMORES`, lines 570–573. | Historic interpretation distinguished from normative rubrical movement. |
| `C0186` **Supra quae** | Three distinct Old Testament offerings Abel, Abraham and Melchisédech; Guéranger supplies a different explanation for each. | `SUPRA QUAE`, lines 574–586. | Biblical typology; avoid unsupported rigid equation of sacrificial procedures. |
| `C0187–C0190` **Supplices** | Source documents profound priestly bow, kiss of altar, two crosses over Sacred Species and self-sign; Guéranger gives interpretation of heavenly altar and `sanctus Angelus`. | `SUPPLICES TE ROGAMUS`, lines 587–600. | Angel identity as Christ is **Guéranger's interpretation**, not mandatory doctrine or rubrical description. |
| `C0192–C0194` **Memento dead** | Explains *signum fidei*, intercessory prayer and *refrigerii/lucis/pacis*. | `MEMENTO DES MORTS`, lines 603–620. | Compare 1962 Latin closely; investigate `C0194` below. |
| `C0196` **Nobis quoque** | Priest speaks briefly and strikes breast; Guéranger invites faithful to join the breast strike. | `NOBIS QUOQUE`, lines 621–623. | Priest act primary-law check; faithful act **historical customary witness only**. |
| `C0199–C0204` **Per quem / Per ipsum** | Explains a hypothesised older blessing of food and precise crosses/minor elevation, with five distinct cross movements. | `PER QUEM/IPSUM`, lines 637–650. | Historical account not prescribed present rite. |
| `C0212–C0221` **Libera nos, Fraction, Pax, commixture** | Distinct paten sign, Host fraction, three Pax crosses, placement of particle; `consecratio` here **does not** mean a second transubstantiation. | `LIBERA NOS`, lines 689–705. | Strict 1962 verification of movement sequence; Latin lexical check. |
| `C0222–C0225` **Agnus, Pax** | Plea for mercy and peace; Requiem *dona eis requiem*; ordered Pax among sacred ministers in Solemn Mass. | `AGNUS DEI / ORAISONS AVANT LA COMMUNION`, lines 707–718. | Keep Requiem and Solemn actor conditions. |
| `C0226–C0234` **Priest Communion** | Prayer asking pardon/union, reference to 1 Cor 11:29, centurion's words, triple breast strike; priest's Communion sequence. | `ORAISONS AVANT LA COMMUNION`, lines 720–740. | Priest/faithful Communion prayers must remain separate. |
| `C0247–C0248` **Ablutions** | Contrast between temporal reception and lasting spiritual remedy; thumb/index separation only after purification. | `COMMUNION`, lines 741–743. | Finger-practice exact 1962 and Ritus scope. |
| `C0254–C0273` **Conclusion** | *Oratio ad complendum*, historical Last Gospel origin, priestly genuflection at `Et Verbum caro factum est`. | `POSTCOMMUNION–DERNIER ÉVANGILE`, lines 747–772. | Proper placeholder resolves by date; 1885 Last Gospel alternatives not governing 1962. |

## Faithful posture audit (four French primary-witness records)

| Event | Cue | Source states | Authority/condition |
|---|---|---|---|
| FRP03 | `C0072` Collect | Guéranger describes a profound bow in **monastic usages**. | MONASTIC CHAPTER, not every pew. |
| FRP07 | `C0124` people incensation | He says people receiving incense stand. | HISTORICAL CUSTOM; `INCENSE_ENABLED && PEOPLE_INCENSED`. |
| FRP08 | `C0139` Sursum corda | He recommends avoiding remaining seated during the Preface dialogue if possible. | DEVOTIONAL EXHORTATION; check active profile. |
| FRP17 | `C0196` Nobis quoque | He invites the faithful to strike the breast with the priest. | HISTORICAL CUSTOM; never inferred by copying every priest chest-strike. |

The separate **23 priest position and action** records and three deacon records are actor-scoped and cue-anchored, but each still needs 1962 action-law and form reconciliation. Even after this research, all 279 Sung source units are **indexed**, but many do not have their own direct event; a lawful persistent posture/station requires correct state and clock resolution.

## Specific discrepancies to preserve — do not silently harmonize

1. **Saint Joseph in Communicantes:** 1885 French source says he is absent; 1962 Ordinary **names** St Joseph at `C0159`. This is a clear dated source difference.
2. **Commixture misanchor in earlier research:** FRG27 was wrongly attached to `C0220` (*Et cum spiritu tuo*). It is now `C0221` (*Haec commixtio*). New FRG57 correctly uses `C0221` too.
3. **Last Gospel starting point:** FRG30 was attached to `C0267` (*Dominus vobiscum*). The Gospel's actual heading starts at `C0269`; corrected.
4. **Possible Latin source-text regression:** current canonical Sung donor `C0194` visibly reads `locum refrigerii, lucis pacis` (no *et*) whereas the standard Latin prayer is `locum refrigerii, lucis et pacis`. **Research-only defect:** request distinct 1962 missal copy comparison and regression test; do not rewrite frozen Latin from a historical explanatory witness.
5. **Guéranger's ancient-ceremony history:** his explanations of food blessings at `Per quem`, Saint Joseph omission and Last Gospel substitutions are historically scoped, not the 1962 ceremonial.
6. **French source quality:** Guéranger is a posthumous transcript; historical dates, Greek-rubric claims and some word/orthography errors require independent confirmation.
7. **Current Second Confiteor:** strict 1962 omits the earlier Communion Confiteor; red booklet and Guéranger's older world do not supersede this.
8. **Modern translation rights:** Le Barroux and Clovis can be independently compared where the text is lawfully accessible; their modern French translations are not importable for worldwide commercial publication without relevant rights.

## Next certification priorities

1. Verify the **14 independent Canon segments**, first from MR62 and French-original interpretative witness, preserving exact priest gesture and voice event boundaries.
2. Resolve all form/profile-specific **faithful postures and gestures** (Low, Missa Cantata with/without incense, Solemn, Requiem, overlays) using original evidence and O'Connell; local profile observational where not supported.
3. Independently validate **priest station + posture** in the separate priest clock, and full in-text event micro-sequences where sourced actions occur inside a prayer.
4. Certify the French guidance wording against **the Latin**, source author, theological precision and copyright. No modern translation copied.
5. Only thereafter implement the dynamic second-top textual ribbon; do not alter first ribbon or regress current 64/65 LIVE presentation.

This dossier is an archive index with links to the complete machine-readable source records. It explicitly records both successes and evidence gaps, making it possible to resume future research from GitHub without relying on chat recollection.
