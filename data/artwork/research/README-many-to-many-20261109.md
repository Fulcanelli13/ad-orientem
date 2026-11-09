# Ad Orientem Sacred Art — owner-decision many-to-many reconciliation

**Status:** Research-only editorial crosswalk, 9 November 2026. **Not for import, display, release, licensing, deployment or assignment replacement.**

## Why this exists

Claude's 640-target map is predominantly one principal artwork and one alternative per destination. It does not preserve the owner's original multiple accepted options, contextual reuses, placement-specific approvals, or scope restrictions. This batch reconstructs those relationships **without changing the approved current artwork**.

### Source layers

| Layer | Records | Meaning |
| --- | ---: | --- |
| Prayer-slot historical current paintings | 248 | Current editorial primary, not automatic release |
| Prayer-slot owner-accepted alternatives | 507 | Approved as an option for a specific slot/scope; NOT auto-display |
| Earlier contextual reuses | 84 | Prior relationship evidence; no new date/slot approval |
| Original owner *keep* references | 11 | Preserve earlier kept relationship |
| Known misrouted option notes | 2 | Evidence only, never treat as HERO-03 approval |
| October subject selections | 101 | Approved subject links, not automatic Calendar/Prayer assignments |
| Historical 2026 date selections | 53 | Date-specific selection evidence, subject to later owner overrides |
| Claude v3 recommended primary relationships | 443 | Uncertified suggestions/preservation overlay |
| Claude v3 research alternative relationships | 140 | Uncertified alternatives |
| **Relationship records** | **1,589** | Multiple artworks/destination and multiple destinations/artwork |

Other context: 640 distinct Claude targets (365 Calendar, 275 Prayer); 267 master Prayer slots; 235 historical subjects, of which 134 remained research-only; 103 rejected original artwork IDs from the 15 October blocklist.

The authoritative files are the historical 267-slot Prayer master in `main`, historical 2026 date selections in `main`, the 12 October subject ledger and 15 October rejected-original ledger on `platform/885-sacred-art-candidates`, and the uploaded editorial-only Claude v3 mapping. Their references and exact blob SHAs are preserved in the index.

### Read the index first

`data/artwork/research-sacred-art-many-to-many-editorial-20261109.v1.json` points to five readable shards:

1. `data/artwork/research/m2m-prayer-852-20261109.v1.json`
2. `data/artwork/research/m2m-calendar-subject-154-20261109.v1.json`
3. `data/artwork/research/m2m-claude-583-20261109.v1.json`
4. `data/artwork/research/m2m-destinations-640-20261109.v1.json`
5. `data/artwork/research/m2m-qa-evidence-20261109.v1.json`

Every edge has an independent ID, target namespace/ID, artwork reference (or a documented missing ID), relationship type, authority, scope or rationale, display-priority boundary, photo-release boundary, and provenance pointer. The same physical artwork can recur; aliases have **not** been merged without exact-object proof.

## Blocking conflicts and relevance audit

- **Four protected Prayer placements refer to one globally rejected original**: Albert Bouts, *The Annunciation*, Cleveland 1942.635, object ID `cma-122338`, score **2** in the effective 15 October blocklist. Placements: `STG-pray.angelus-04`, `-05`, `-06`, `STG-pray.rosary-02`. The 1 November slot master nevertheless retains/accepts this work. Hold the exact artwork pending a narrow chronological owner-decision check: do NOT silently rescind either decision.
- **114 new Claude proposals have not been independently iconographically certified**, regardless of Claude's confidence label. The *actual depicted episode*, not title keywords, must establish direct-scene claims. For example, paralytic healing at Bethesda versus Capernaum, Jericho versus John 9 blind healing, and feeding-miracle pericopes need identification.
- **46 protected Claude selections still lack a canonical artwork ID**; preserve the selected work and identity proof.
- **23 title/attribution discrepancies** exist between the 267-slot master and Claude. Many are likely display-name changes (including Station numbers, institutional artist formatting), not proof of a changed physical artwork. Reconcile by accession or exact image before treating these as replacement decisions.
- **Five Prado-associated photographic sources** remain held under the user's sourcing policy; the painting/placement decision and reproduction rights are distinct.
- **Two historical Prayer scope/editorial holds** remain binding.
- **170 Calendar targets remain unmatched** by the selected-pool rule; none should be filled with unrelated saint portraits or simply because another date has the same Gospel.

An earlier automatic audit found 101 Claude Prayer primary recommendations also among the original slot-accepted options. That is concordance of owner-option scope, **not** independent scene/rights or new display authorization.

### Required next editorial verification

1. Reconcile exact canonical physical work identities and approval chronology, prioritising the single Bouts rejection conflict, protected ID gaps, and scope holds.
2. Review each of Claude's 114 new primary proposals against the original painting description, primary catalogue page, depicted persons and events, actual 1962 Proper/Gospel context, and owner's prior ratings. Classify as direct iconography, liturgical subject, Scripture correspondence, theological/typological option, or unsupported.
3. Keep *all* accepted options in the relational index. Assign display priority separately, never force a single-choice gallery relation or automatic rotation. Rosary mystery art remains fixed throughout a decade; fixed Prayer covers remain fixed.
4. Check photography source, licence, attribution, exact bytes and mobile crop **after** art relevance decisions. A public-domain artwork is not automatically a cleared photographic edition.
5. Export an import manifest only from relationships with explicit assignment authority, clear scope, actual-object verification, eligible photograph, and phone QA. **None of these new proposals have that complete gate here.**

No `src/` change, runtime import, publication workflow, Vercel change, merge or deployment is part of this draft.

Check the shards with:

```bash
node tests/sacred-art-many-to-many-research.test.mjs
```

## 9 November source-backed scene adjudication — batch 1

The first targeted verification is in `data/artwork/research/m2m-scene-adjudication-batch1-20261109.v1.json` and is linked from the index. Of ten Calendar relations inspected against published institutional/object records:

- **Five** are documented as a **different Gospel episode** than the date's reading. Ricci *Christ Healing the Blind Man* on 15 and 17 February, and Le Sueur's same-title work on 16 February, depict **John 9** rather than Luke 18 (Jericho). Van Dyck's *Healing of the Paralytic* on 27 September and 1 October depicts **Bethesda, John 5** rather than Matthew 9 (Capernaum).
- **Two** have the **correct Gospel episode supported by catalogue records, but still lack exact photo release gates**: Van Dyck at Bethesda on 27 February (John 5), Le Sueur's blind-from-birth scene on 18 March (John 9). Le Sueur is supported by an object-catalogued engraving **after** the original, so the precise painting object still needs independent confirmation.
- **Three** remain qualified: Aivazovsky's 1888 water-walking scene (Peter detail unverified), Perugino's Ascension painting for the 13 May Vigil (feast anticipation, not the actual John 17:1–11 Gospel), and de Crayer's Lille miraculous catch (museum documents the general scene, not which Gospel account).

**Source/rights caveat:** the National Galleries of Scotland official photograph of Ricci is supplied under a personal/non-commercial use agreement, not a blanket commercial app licence; the Louvre/Lille photographic credits and Commons mirrors must not be read as independent photo-release permission. No image was fetched or released in this PR.

**Historical warning:** the exact rejected Bouts Cleveland object `cma-122338` is still preserved as a later Prayer-slot selection; this conflict is held, not resolved by an assumption that every later import was a deliberate owner's override.

The original 1,589 relationship edges and 507 accepted options remain unchanged. Adjudication is a **separate evidence layer**, not an automatic mutation of the source selections.

## 9 November targeted relevance adjudication — batch 2 (15 new Claude proposals)

See `data/artwork/research/m2m-scene-adjudication-batch2-20261109.v1.json`. All records retain owner decisions and the photo-release hold.

- **Three labelled "DIRECT_SCENE" require narrower relationship types:** 13 January, Ribera's *Baptism of Christ* = feast event/recollection in John 1:29–34 rather than the literal narrated testimony; 22 November, Provoost's *Last Judgment* = eschatological thematic context for Matthew 24:15–35, not a direct rendition of a Matthew 25 Last Judgment; 26 December, Lauri's *Stoning of St Stephen* = directly related to the feast and the Epistle (Acts 7), **not** Matthew 23:34–39, the appointed Gospel.
- **Twelve source-supported scene/iconography placements**: Vignon's Child Jesus among Doctors (Grenoble MG 211); Pourbus *Last Judgment* for Monday in Lent (Bruges GRO0110.I, Matthew 25 eschatological iconography, not a literal every-verse depiction); Rubens *Transfiguration* (Nancy 71, also a lower-register epileptic child episode); Veronese *Mother of Zebedee* (Grenoble MG 6, correcting a historic title that conflated hemorrhage healing); Rembrandt *Raising of Lazarus* (LACMA M.72.67.2); atelier replica of Jouvenet *Meal at Simon the Pharisee* (Musée Magnin 1938 F 552) on 26 March **and** 25 September; Courtois *Good Samaritan* (Besançon D.970.2.1); Michel II Corneille *Calling of Peter and Andrew* (Rennes INV 801.1.24); Giordano *Presentation in the Temple* (Rennes D.1955.3.1 / Louvre INV 299); Boullogne *Christ and the Woman with a Hemorrhage* (Rennes 1811.1.7) on 3 **and** 6 November. Some are directly narrated episodes; others are scene families or partial Gospel episodes as noted in the JSON.
- **Do not merge physically different works:** Corneille's Rennes small 1673 painting versus the Arras 1672 large painting; Giordano's Rennes signed original versus an anonymous Voltaggio Giordano-school picture; Boullogne Rennes original versus a separate Carnavalet preparatory oil sketch.
- **Exact-photograph rights are still not certified.** LACMA credits its own reproduction; the French Ministry of Culture explicitly notes permission requirements for the Courtois and Jouvenet/RMN photos. An independently uploaded Commons photograph must be audited on its own merits; its presence does not inherit museum image rights or imply the image was approved for mobile use.

**Progress:** 25/114 new Claude proposals have now received individual external/source adjudications (10 in batch 1, 15 here); 89 remain. The underlying 1,589 many-to-many relationship records, 507 owner-approved Prayer option entries and 301 protected placement decisions are not modified by these research-only findings.

## 9 November institutional direct-scene audit — batch 3 (20 new proposals)

Source crosswalk: `data/artwork/research/m2m-scene-adjudication-batch3-20261109.v1.json`.

**20 Calendar relations**, including two uses of Quantin’s Circumcision triptych (Dijon CA439), Jan Brueghel I’s Magi (KMSKA 922), Cornelis de Vos’s Magi (KMSKA 108) and Samaritan Woman (MSK Ghent 1900-A), Antoon van den Heuvel’s Shepherds (Ghent S-89), Zurbarán’s Shepherds (Grenoble MG1324), Francken’s Cana (Toulouse RO862), Jordaens’s Prodigal Son among swine (Lille work, object number pending), Nancy’s Van Hemessen Temple Cleansing (inv.90), Maerten de Vos’s Doubting Thomas (KMSKA 77 on April 15, April 17, and December 21), Caravaggio’s Thomas (Potsdam GK I5438), Mathieu Le Nain’s Martha and Mary (Rennes object ID pending), Rubens’s Transfiguration (Nancy inv.71 reused on August 6), Cortbemde’s Good Samaritan (KMSKA 370), and Caravaggio’s Annunciation (Nancy).

**Important holds**:
- 19 January, Cornelis de Baellieur *Cana* is **title-level plausible only**; physical object, attribution, exact source and photo not independently established. It must not be promoted to a verified-object status.
- 14 March, Giandomenico Tiepolo *Christ and the Woman Taken in Adultery* is the specific Marseille **MNR 84 / D 53-1** object, a wartime recovered artwork still under a restitution regime. Its provenance and RMN photography are distinct holds. Do **not** conflate with Louvre RF 1961 80, RF 1975 1 or LACMA M.2005.119, all with very similar scenes/titles.
- 7 March Jordaens’s swineherd illustrates *part* of Luke 15, not the whole parable. 18 August Cortbemde’s Samaritan differs from Courtois’s Besançon painting approved for 16 August.
- KMSKA master images may offer CC0 photographs but its professional-use language and exact file, pixel-quality, crop and owner placement scope still require separate gates.
- The exact Maerten de Vos altarpiece may map to three dates without implying three paintings or enabling automatic image rotation.

**Census:** 45/114 new Claude proposals individually source-adjudicated after batches 1–3; **69 remain**, including **7 still unaudited direct-scene labels**. The 1,589 base many-to-many edges, 507 owner-accepted Prayer alternatives, all historic locks and global rejection evidence are unmodified. No production or image release authorization is created.

## 9 November direct-scene closure — batch 4 (last seven new direct-scene proposals)

`data/artwork/research/m2m-scene-adjudication-batch4-20261109.v1.json` records the final seven new DIRECT_SCENE proposals: 9 January Zurbarán's Magi (Grenoble MG1325, distinct from its MG1324 Shepherds); 18 April Crucifixion with Mary, Magdalene and John (proper Saturday of Our Lady Gospel **John 19:25–27**; attribution to Bertholet Flémal **unverified**); 2 July Visitation (Geneva MAH **1942-0009**, *workshop* of Philippe de Champaigne in cross-gallery record, not the distinct Princeton y1994-17 or Villeneuve PL86.1.5 paintings); 29 August Beheading of John (Met **32.100.127**, exact Mark 6:17–29 and Met open-access object); 21 September Van Oost Calling of Matthew (Our Lady Church Bruges, **not automatically** a Groeningemuseum owned painting; Matthew 9:9–13); 30 December Carracci Shepherds (Orléans inv.192, supported by Commons/Wikidata but no independently current institutional attribution yet); and 31 December Jordaens Shepherds (Grenoble **MG84**, Louvre-owned and on loan, verified by both official collection pages). Both 30/31 December feria Masses use **Luke 2:15–20**.

For 18 April, 2 July and 30 December, the object/attribution source is explicitly insufficient for an unqualified gallery metadata release. The others also still need **exact photographic source, image dimensions, licence, phone crop and owner placement authority**.

**Direct-scene research queue complete**: 52/114 Claude new proposals individually source-adjudicated across batches 1–4; **62 remaining proposals** are thematic, liturgical, scriptural or typological and still require their own independent relevance audit. There are now **zero outstanding new DIRECT_SCENE labels**, but not every direct-scene object or photo is fully certified. Base 1,589 relationships and all 507 previously accepted Prayer-option rows remain untouched.

## 9 November thematic / saint-feast audit — batch 5 (14 high-risk relationships)

Detailed source/object evidence: `data/artwork/research/m2m-liturgical-thematic-batch5-20261109.v1.json`.

**Five reuse links to the same Lorenzo Monaco *Christ Giving the Keys to Saint Peter* (NGA 1958.8.105):** This is a **vellum illuminated miniature**, not an oil painting. Papal iconography is broadly relevant but the 1962 Mass Gospel is different on three dates (16 Jan Marcellus Matt 16:24–27, 22 Apr Soter/Caius John 15:5–11, 12 Nov Martin Luke 14:26–33). For 14 Oct Callistus the Keys scene **does** illustrate the actual Matthew 16:13–19 Gospel, although not Callistus himself. **11 Dec Damasus** has unresolved sources: the 2026 FSSPX Ordo gives Matt 24:42–47 while LatinMassPropers gives Matt 16:13–19. Do not silently overwrite the date's reading or claim exact Gospel identity pending rubrical reconciliation.

**Other object and depicted-subject corrections:**
- Jan31 De Vriendt Christ with children = charitable analogy to Don Bosco, not a Bosco portrait.
- Feb11 Reni *Immaculate Conception* (Met 59.32) = Lourdes doctrinal title connection, NOT an apparition image.
- Feb12 Isenbrandt *Seven Sorrows* = Servite spirituality, NOT depiction of seven founders.
- Feb25 *Shipwreck of Jonah* = legitimate Jonah-sign **typology** from Matt12, NOT the Gospel scene. Current Lille online catalogue says **entourage de Paul Bril**, inventory **976.3.1**, while older official Joconde identifies **Paul Bril**, inventory **P1904**. Exact-object crosswalk not proven, so provenance, attribution and RMN photo remain held.
- Mar27 Honthorst Christ before High Priest = Passion foreshadowing, NOT the actual John11 council deliberation Gospel.
- Jun26 Guercino's 1632 *Martyrdom of Sts John and Paul* = painter **Giovanni Francesco Barbieri**, NOT photo uploader Didier Descouens; Toulouse 2004.1.53. Official metadata's 'Paul of Tarsus' subject label conflicts with the feast's Roman martyrs, so precise saint identity must remain a verification gate.
- Aug5 Cretan Glycophilousa = general Marian iconography, NOT the particular **Salus Populi Romani** image or Santa Maria Maggiore.
- Oct6 Sellitto *St Bruno* = painter **Carlo Sellitto**, NOT Commons photographer Edelseider; Strasbourg museum inv 432 according to Commons, current institutional attribution unverified.
- Nov9 Rivalz *Urban II Consecrating Saint-Sernin Toulouse* = painter **Antoine Rivalz**, NOT Commons photographer Didier Descouens; Toulouse inv 2004.1.266. A *different basilica* from the Lateran, and definitely not the day's Zacchaeus Luke19 Gospel.

**Cumulative proposal audit:** 66 of Claude's 114 new date assignments individually source-assessed; **48 remain** (liturgical/thematic/scriptural only). All 52 direct-scene labels were handled in batches 1–4, albeit without any blanket photo or pixel certification. The historical 1,589 relationship edges and 507 accepted Prayer alternatives are unchanged. New findings do not authorize app changes, photo source reuse or owner-preference overrides.

## Liturgical feast audit — batch 6 (12 relationships)

Source-backed editorial classifications, **not assignments**, are recorded in `m2m-liturgical-batch6-20261109.v1.json`. Total **78/114** Claude NEW_PROPOSAL links individually reviewed; **36 remain** (**15 liturgical, 15 thematic, 6 scriptural**). The source 1,589-edge graph and all 507 user-accepted Prayer alternatives have not been modified.

Key corrections and qualifications:

- 21 January: Wautier's KMSKA 599 portrays unidentified girls **as** St Agnes and St Dorothea, not biographical scenes from their lives. Saint association remains, classified `PORTRAIT_HISTORIE`.
- 30 January: Cortona's *St Martina Refuses to Worship Idols* proposed Commons photograph points to the **Granet oil-on-copper INV107/MR413**, not Princeton 1998-38 or Pitti versions. The painting is relevant, but variants must not be collapsed.
- 13 June: Murillo's Berlin *Saint Anthony of Padua with Christ Child*, Gemäldegalerie **414 / obj:862397**, is catalogued by the institution as **probably destroyed in May 1945**. It cannot be represented as an extant work in the gallery; historical-photo identity and reproduction gate remain open.
- 14 August: Van der Goes's *Death of the Virgin* (Musea Brugge 0000.GRO0204.I) depicts a **Dormition tradition** for the Assumption vigil, not the appointed Gospel or corporeal Assumption.
- 17 August: Carracci's *Virgin and Child Appearing to St Hyacinth*, Louvre **INV186**, is a saint's visionary event, distinct from a Louvre preparatory drawing.
- 25 August: Cabanel's *Glorification of St Louis* has Versailles ownership **MV7669**, on deposit at Montpellier, not an unqualified permanent Musée Fabre object.
- 15 October: Seghers's *Ecstasy of St Teresa*, KMSKA **509**, is institutionally documented; the Claude-proposed Commons JPEG is low resolution and is not automatically the best reproduction.
- 21 November: Baugin's *Presentation of the Virgin* (Granet **860.1.408**) is traditional noncanonical Marian subject matter; preserve as liturgical iconography, not a Gospel event or the separate Rennes sketch.
- 23 November: Fungai's *St Clement Finding His Family*, Strasbourg **453.b**, has an INHA cross-reference that mistakenly calls the associated panel 453.a; hold cross-reference harmonisation before publication.

The other confirmed feast subjects in this batch are de Vos's *Temptation of St Anthony* (KMSKA 103), de Vos's *Restitution to St Norbert* (KMSKA 107), and Jacopo Bassano's Dijon *Martyrdom of St Sebastian* (older museum catalogue gives a different Bassano attribution; object inventory reconciliation still necessary).

This PR must remain draft. **No source image, exact photo licence, crop, visual pixels, original owner selection, or live app assignment was cleared or modified.** The regression suite now verifies unique proposal coverage and derives cumulative totals instead of asserting contradictory historical intermediate totals against the current index.
