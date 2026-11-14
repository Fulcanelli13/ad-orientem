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

## Complete Claude new-proposal editorial assessment — batches 7 and 8

**Source-assessed: 114/114 Claude `NEW_PROPOSAL` relationships, as editorial evidence only.** This closes the *counted review queue*, **not** the independent object-identity, rights, exact-photo, owner approval, crop, access or release gates. The unchanged 1,589 relationship edges and 507 owner-accepted Prayer alternatives remain the authoritative historical crosswalk. No display assignment, public image or canonical asset file has been modified.

- **Batch 7, 15 liturgical/feast proposals**: `data/artwork/research/m2m-liturgical-batch7-20261109.v1.json`. Every remaining saint/feast painting was reviewed, with explicit catalogued-object, episode, artist-credit and image-source limits.
- **Batch 8, 21 thematic/scriptural relationships**: `data/artwork/research/m2m-thematic-scriptural-batch8-20261109.v1.json`. Fifteen are thematic and six are scriptural. The same nine proposed paintings can legitimately connect to several dates without duplicating any physical painting or claiming exact passages by mere subject resemblance.

### Particularly important corrections

1. **14 September (Le Brun)**: Musea Brugge object `0000.GRO0470.I` is a **copy after Edelinck's print after Le Brun**, not an autograph Le Brun. It remains Exaltation-of-the-Cross iconography.
2. **11 November (Bourdon)**: Musée Magnin `1938 F 97` is the reduced replica of Bourdon's earlier destroyed *Miracle of Saint Martin* for Cologne. Its old St Gregory Thaumaturgus title was superseded by the current scholarly identification. RMN photo rights remain held.
3. **4 August (Coello)**: Prado `P000662` is indeed Coello's St Dominic. Preserve earlier approval records, but **never introduce a Prado photograph contrary to owner's source restriction**.
4. **3 March (Jordaens)**: Lille `P103` portrays Christ teaching the Pharisees, with a cartouche indicating Matthew 5:20; Claude's claim of literal Matthew 23:1–12 is not established.
5. **28 March (Rubens)**: Dijon museum identifies the *Entry into Jerusalem* as a predella panel depicting John 12:12–19, within the day's larger John 12:10–36. Claude's artist field is the Commons photo author, not Rubens; exact painter/workshop balance is qualified in Dijon literature.
6. **4 July and 7 November (Allori)**: KMSKA `896` is catalogued under Alessandro Allori, while KMSKA's **2008 annual report** calls the same object *copy after Alessandro Allori*. Retain this internal institutional attribution conflict rather than silently choosing one.
7. **9, 12, 15, 19, 23 December (Brueghel)**: Bruges `0000.GRO1561.I` is a **workshop copy** after Pieter Bruegel I's 1566 Budapest original. Matthew 11:2–10 and John 1:19–28 concern different interactions from a general preaching scene; Luke 3:1–6 describes John preaching, but the exact depicted verse cannot be proven solely by the canvas.
8. **10, 14, 17, 22 December (Moreelse)**: Adult portrait of the Baptist is a thematic saint match, not John in prison, the Jerusalem delegation's interrogation or literal preaching to the crowd.
9. **Recurring Marian themes**: Nicolas Mignard's Marseille *Virgin and Child*, Sassoferrato's Strasbourg `44.2019.2.11`, Jan van Eyck's Bruges `0000.GRO0161.I`, KMSKA's Allori-associated `896`, and Petit Palais's Glycophilousa `PPP4869` may all have distinct Marian-calendar links. **None illustrates the Luke 11:27–28 woman's exclamation as a literal narrative**. The Glycophilousa child's scroll instead references Luke 4:18.

### Still outstanding after relationship review

Physical-object and accession exceptions (including Bonn/Vaccaro and Magnin Elizabeth/Pierre), work/copy/workshop distinctions, incompatible or uncertain photographic rights, original-photo quality and mobile cropping, historical global rejection precedence (**Bouts `cma-122338`**), owner source exclusions (Prado), historical artist/title/ID reconciliation, missing canonical artwork IDs, and the 170 unmatched Calendar targets remain separate tasks. They are **not** covered by the 114/114 relevance-review metric.

The crosswalk and regression tests must stay research-only and the PR must remain **draft and unmerged** until conflicts and runtime-safe import criteria are separately resolved.

## Fail-closed release-gate crosswalk (9 November)

The **editorial** relevance audit is complete (114/114 Claude new proposals). The subsequent release-readiness check is **not** complete. Two new research manifests explicitly prohibit new assignment/import:

- `data/artwork/research/m2m-new-assignment-gate-edges-20261109.v1.json`: **1,589 distinct edges** with relationship-level evidence, owner-decision class, exact rejected-original checks, unverified image rights and crop flags, and `new_assignment_authorised: false` for every edge. All 507 previously user-accepted Prayer alternatives remain distinct scoped options, not auto-selected displays.
- `data/artwork/research/m2m-destination-release-gates-640-20261109.v1.json`: **640 destination gates** (365 Calendar, 275 Prayer). Working categories: **298 preserve historical display**, **145 proposal/QA holds**, **170 unmatched/no autofill**, **27 protected/no assignment**. All have `new_assignment_authorised: false`. These are editorial categories, not claims about whether an image is already visible or was deployed earlier.

Source evidence in this crosswalk includes **46 preserved primary destinations with missing canonical identity links**; separately, **197 edges across all 1,589** have a null artwork ID, including historical contextual and alternative relationships. Do not confuse the 197 edge occurrences with 197 distinct missing works. There are **five Prado destination source holds**, **two historical Prayer scope holds**, and one further Prayer editorial hold; these statuses overlap other groups.

### New global rejection discovery — Bouts, Cleveland `cma-122338`

The 15 October global exact-original rejection (score 2) covers Albert Bouts's *Annunciation* (Cleveland 1942.635). The later 1 November Prayer master preserves mentions of that same rejected original; however, it does not establish an explicit later owner reversal. The earlier four implicated Angelus/Rosary destinations omitted a **fifth**: `STG-novena.christmas-01`, where the painting is an *accepted alternative*, not the current primary.

The combined historical Prayer and Claude preservation data contain **13 distinct edge records referring to the rejected exact original across five destinations**. All 13 are retained as historical evidence and hard-blocked from new assignment by exact ID or the Cleveland object URL. The Angelus 25 March historical current entry has a null crosswalk ID but its exact museum URL independently identifies the same prohibited work, so null ID must not bypass the hold.

**No replacement is inferred.** The user may explicitly resolve the chronological choice later; until then, the global original rejection controls release eligibility for that physical work, not unrelated *Annunciation* paintings.

### Import contract and checks

Only the source research layers and the two gate manifests are changed here; no actual import payload has been created. Zero candidates satisfy all required proof categories in these records: explicit scope-specific owner placement authority, verified physical object, eligible exact photo reuse, actual bytes/attribution, mobile crop and approval, and global rejection clearance.

Run `node tests/sacred-art-release-gates-research.test.mjs` together with `node tests/sacred-art-many-to-many-research.test.mjs`. The former asserts the 1,589-edge and 640-target totals, the 507 accepted options, 114 reviewed new proposals, all 13 Bouts references, 170 unmatched Calendar targets, 46 missing primary links and that **both manifests publish no assignments**. These tests are committed but require CI execution before reporting a green gate.

Next research work should target (1) 46 primary identity links without inventing artworks; (2) the 23 metadata differences and five Prado source holds with source/copy attribution; (3) photograph provenance and mobile QA as distinct approvals; (4) original owner chronology for the Bouts dispute. Do not merge, import, rotate Prayer covers, or deploy from these research manifests.

### Protected 46-ID internal identity triage

A further evidence-only queue is stored in `data/artwork/research/m2m-protected-missing-id-46-20261109.v1.json`. These are the 46 **preserved primary artworks without a canonical ID in Claude's crosswalk**, not 46 permissions to choose replacements. Comparing exact source URLs, artist names and titles across all 1,589 original edge records yielded:

- **11** destinations with at least one exact source-URL match to a prior ID-bearing record; these need verification of what that ID denotes and, separately, of the physical work.
- **6** additional destinations with only normalized artist/title equality; these are weak leads, not identity proof.
- **29** with no candidate in the currently reconstructed internal records. Some are selected AI visual drafts or multi-image Easter Vigil selections requiring local asset reconciliation rather than a museum accession.
- **0** canonical artwork IDs have been certified or assigned. In particular, editorial identifiers such as `primary:2026-05-23` and `APPROVED_REVIEW::...` must not be mistaken for canonical artwork IDs.

This queue guides the next exact-source inventory search without discarding approved paintings, inventing object identities, or implicitly clearing media rights. The regression test checks the 11/6/29 split and the zero-automatic-link rule.

## Source-URL leads and Prayer metadata adjudication (batches 9–10)

The 46 missing protected-primary-ID queue is still **unresolved** at the app-canonical-ID level; the latest pass has done source and work grouping without altering approvals. Its **11 exact-source-URL leads correspond to five different work groups**, with each destination retained separately in `m2m-exact-url-identity-batch9-20261109.v1.json`:

| Physical work | Destination references | Evidence/hold |
| --- | ---: | --- |
| Maíno *Pentecost* — Museo del Prado institution object URL 49c1d551… | 1 | Original selection retained; Prado photo-source prohibition applies |
| David Teniers II *Ascension* after Leandro Bassano — Wallace Collection P635 | 2 | A small 1650s copied panel, not autograph Leandro; Commons JPEG 553×800 and Wallace/Art UK credit, untested photo release |
| Mateo Cerezo *Descent of the Holy Spirit* — Museo de Huesca 00029 | 5 | Confirmed in Spain's CER.es inventory under Cerezo; older Huesca guide says original *or school*; existing Commons JPEG 567×479 is too modest for blind high-quality promotion |
| Tintoretto's *Circumcision* — Scuola Grande di San Rocco, Sala Terrena 1587 | 2 | In-situ official institution establishes canvas; substantial workshop participation (especially Domenico) must be retained |
| Solesmes, Église St-Martin, fourth Station of the Cross | 1 | Commons user's CC0 photo establishes church/scene. 'Delacroix' work attribution from filename/category remains insufficient for an autograph identification |

These five groups account for **11 target relationships** but are not *11 newly certifiable app canonical works*. No object/ID promotion, photograph licence/byte QA, crop certification or new gallery import is authorised. In particular, historical `primary:...` and `APPROVED_REVIEW::...` references remain editorial, not physical-object IDs. In the 46-case triage, the other **six title/artist-only** leads and **29 no-internal-lead** cases remain open.

The original **23 Prayer metadata differences** now have source-scoped adjudication in `m2m-prayer-metadata-23-batch10-20261109.v1.json`:

- **12 San Polo Via Crucis** labels differ by title and station number, but are the same Giandomenico Tiepolo cycle, per Chorus Venezia. Each individual numbered panel must remain distinguishable.
- **2 distinct-object conflicts**: `STG-pray.rosary-03` and `COV-weekday_magnificat` have a historical Princeton *Visitation* (`y1994-17`, 1643–48, Philippe de Champaigne) but Claude nominated a different Geneva `1942-0009` painting (workshop attribution indicated in external catalogues). Preserve Princeton as the current selection; Geneva is not a mere title alias. Provenance of any later explicit owner approval must be established independently.
- **2 Sodoma-related artist cases**: Cleveland `1916.786` is currently catalogued as by a **follower of Sodoma**, not decisively autograph Sodoma. The `HERO-10` current source URL is that exact Cleveland object; `STG-pray.seven_words-06` has a generic current name/artist without original URL and must not be assumed to be the same painting solely from its title.
- **1 photographer-as-artist correction**: `HERO-11` Rubens, *Christ Triumphant over Death and Sin*, is Strasbourg `MBA 235`, not the photographer/uploader DCHNwam. The Strasbourg photographic source explicitly calls for contacting its photothèque.
- **1 unresolved Rubens *Assumption* identity**: `COV-prayer.hymns` has two different editorial IDs and no source URL; several distinct Rubens versions, modelli and copies share the title, so no physical canvas has been fixed.
- The other **5 flags** comprise two Ghent Altarpiece credit/title order variants, one MNAC *Virgin of Seven Sorrows* article variant (`008327-000`), one Domenichino artist-string truncation with an unchanged source file, and one Baclaran Perpetual Succour poster-source description truncation with an unchanged file. The poster scan must not be presented as the original Roman icon.

All 23 original discrepancy flags are retained as historic QA evidence; the new classifications are added as a separate layer. **Nothing has been replaced, automatically selected, licensed or deployed**. The research tests check all 11, 23, five underlying work groups, the two Princeton/Geneva object conflicts, and the zero-new-assignment requirement.

Next: resolve the six weak title/artist-only candidates and 29 unmatched protected selections from independent source records and local asset hashes. Keep AI-derived owner artwork and multi-scene Easter Vigil selections as distinct asset classes, not museum paintings.

## Final protected identity queue triage (batches 11–12)

The **remaining six title/artist-only source leads** are independently assessed in `m2m-title-artist-leads-6-batch11-20261109.v1.json`. These represent three works reused across two destinations each:

- **Van Dyck** *Entry of Christ into Jerusalem* — Indianapolis Museum of Art at Newfields **58.3**, circa 1617; already selected for 29 March and its Palm Sunday Prayer hero. No change to the earlier source or crop.
- **John Martin** *The Great Day of His Wrath* — Tate **N05613**, 1851–53; same selected artwork for Advent I (29 November) and Advent hero. Tate object-page retrieval was denied, so the accession was corroborated through Tate-linked collection references and museum-associated reproductions, not independently by that page.
- **Ludovico Carracci** *An Angel Frees the Souls of Purgatory* — a small work cited at the Vatican Pinacoteca by WGA, possibly a sketch with workshop involvement, but **no primary institutional accession established**. Preserve the two All Souls/Prayer-hero relationships without upgrading its attribution.

The **29 protected selections without an internal match** are triaged in `m2m-no-internal-lead-29-batch12-20261109.v1.json` by source and asset type, as follows:

| Source/asset category | Protected destinations |
| --- | ---: |
| Ordinary physical-artwork catalogue or local-asset lookup | 20 |
| AI-derived local artwork requiring original generated-file/hash crosswalk | 4 |
| Multiple event-specific works within one Easter Vigil editorial selection | 1 |
| Historical photographic portrait rather than oil painting | 1 |
| San Polo Stations XIII and XIV (same Giandomenico Tiepolo cycle; photographic/app-ID link missing) | 2 |
| Possible exact-work cross-reference to batch9 Tintoretto/San Rocco Circumcision | 1 |
| **Total** | **29** |

Chorus Venezia documents both San Polo original Stations XIII and XIV; this is an *in-situ subject identification*, not photographic release or an invented accession. The selected 1 January *Circumcision* is a high-priority possible cross-reference to the San Rocco Tintoretto/workshop object identified for Prayer, but the actual current user asset and pixels must be checked first.

**All 46 owner-preserved missing-ID cases now have a provenance/asset-type triage category (11 + 6 + 29), and 23 historic Prayer metadata discrepancies have separate classification. None has been auto-assigned a canonical app artwork ID.** A named museum accession cannot by itself prove the exact selected digital file, owner release authority, or image reuse. These records are held entirely outside runtime.

New independent tests assert the three-work grouping, 29-case category distribution, unique union of all 46 identities, historical approvals unchanged, and **zero automatic publication, photo clearance or replacement**.

## Protected selected-file recovery — batch 13 (9 November)

**New evidence file:** `data/artwork/research/m2m-protected-asset-provenance-batch13-20261109.v1.json`. This is a separate, **research-only** layer over the 29 protected selections without an internal ID candidate. It does not overwrite the source 46-case queue, owner-selected artwork, runtime photo or accepted alternatives. Known artwork asset directories, explicit provenance manifests and Home preview registries were checked; unlocated does not establish that an image was never uploaded or saved elsewhere.

| Source-asset status | Protected destinations |
| --- | ---: |
| Existing local file with linked provenance | **3** |
| Existing remote Home source preview, not an offline master | **2** |
| Selected AI derivative, final generated file/hash not in the checked asset records | **4** |
| Two approved Easter Vigil prophecy scenes needing separate image assets | **1** |
| Current exact selected image still not located in checked records | **19** |
| **Total** | **29** |

### Recovered physical files

- **`STG-pray.stations-13`**: `assets/stations/san-polo/station-13.webp`, **818,664 bytes**, repository blob `2f7b01404d4b75d71c4c0d085e46c3607ac93038`, documented SHA-256 `213b617d1a39ae4a07d5d0558f51fb66900cae17d61aa9753988717a170bd3c7`, **1853×2400**.
- **`STG-pray.stations-14`**: `assets/stations/san-polo/station-14.webp`, **1,134,956 bytes**, repository blob `c1288aefec1e44f3df6873f3b1de4e8b51a39b8b`, documented SHA-256 `74ccdf8a9fc9406b980b4a553cbfea64d0379ac9d5ce400add0e1f41bb9f6da5`, **1920×2146**.
- Both are byte-identical at the repository Git blob level to `data/prayer/stations/san-polo-tiepolo-oils-1747/images/station-13.webp` and `station-14.webp`. The existing `acquisition-results.v1.json`, `research-stage-bindings.v1.json` and `assets/stations/san-polo/LICENSE-ATTRIBUTION.md` identify the paintings and each Didier Descouens photograph. The **specific fourteen-Stations CC BY-SA 4.0 exception is already authorized**, but attribution, source and change notice, share-alike, native-pixel examination, 320/390px crop QA and explicit release sign-off remain required. The files are archived, **not enabled in the live Stations reader**. The recorded SHA-256 values were read from the source ledger; they were **not independently recalculated from binary bytes** in this pass.
- **`COV-novena.st_therese`**: `assets/prayer/user-approved/st-therese-lisieux-historical-portrait.webp`, **48,294 bytes**, blob `138e198234ec931ecf8fb1602a919b9249ac47f7`. `assets/prayer/user-approved/source-provenance.v1.json` documents derivative SHA-256 `705cfd23686a8721faaf62ecaa50ccae1be7c227ceccffdde9f1ca09d73e909d`, source portrait 362×498, PD status in France/USA and **`FINAL_PHOTOGRAPH_APPROVED`**. Do not confuse this authentic historical photo with later paintings; its existing approval is not a licence to assign a different image elsewhere.

### Remote images versus absent originals

`src/home/approved-2026-other-date-previews.js` already identifies exact selected remote Commons previews for **22 February, Kramskoi *Christ in the Desert* (Tretyakov 651)** and **1 May, La Tour *Saint Joseph the Carpenter* (Louvre RF 1948 27)**. Both remain uncached previews, with neither a locally archived approved master nor newly cleared mobile crop.

Four selected **AI-derived artworks** (8 March after Cavedone, 22 March after Lucas van Doetechum, 8 April after Tissot, 29 May after Wierix) still lack a traceable final generated file/hash in the checked repository asset records. Brooklyn/Rijksmuseum URLs are original artistic reference works, **not** the final approved AI output. The **4 April Easter Vigil** is two previously selected scriptural pictures (Tissot Genesis and Martin Exodus), not a single painting or hero slot that can be silently collapsed.

The remaining **19** selections still need original selected-file paths, source photos or local-asset evidence; do not substitute a generic Commons scene, different attribution, copy or museum object. The approved date-artwork register `data/artwork/2026-prior-date-artwork-evidence.v1.json` and `data/artwork/home-2026-27-frozen-selected-release-triage.v1.json` remain source-of-truth for selected titles and prior holds.

### Separate P0 legacy release collision

`src/art/released-module-paintings.v1.js` still declares **`bouts`** for Cleveland **1942.635 / `cma-122338`**, with `assets/prayer/released/bouts-annunciation-original.jpg` and PR **#2340** as its previous release source. This is the exact physical painting rejected on 15 October (score 2) and already hard-blocked for **new** placement by the 13-edge/five-destination historical reconciliation. The research manifest **cannot revoke an existing released-photo registry or public asset file**. A separate runtime/public-route audit must determine actual display exposure and appropriate remediation under owner decision precedence. This PR does **not** delete or alter live media.

Run `node tests/sacred-art-release-gates-research.test.mjs` to confirm the batch13 3/2/4/1/19 split, mirror provenance, absence of new releases, and legacy collision flag. No gallery import, owner override, JavaScript runtime adjustment, image upload, CI bypass or deployment is implied.

## Approved AI drafts found in user-owned Library — batch 14

A search beyond the checked GitHub asset directories recovered **two original user-accepted generated PNGs** from earlier saved reference files. These were not missing from the user's earlier visual review: they were saved in the user's Library reference bank, not checked into the app repository.

The 20 October `AO_Easter_2026_Tissot_Wierix_Visual_Drafts_Manifest_2026-10-20.json` contains two explicit `USER_ACCEPTED_AI_DERIVATIVE_VISUAL_DRAFT` entries. The corresponding **image files themselves** were located and their byte lengths and image dimensions read from the user's Library. The source manifest's SHA-256 values have **not** been independently recalculated:

| 2026 date | Exact saved original PNG | Dimensions | Size | SHA-256 (source manifest) |
| --- | --- | --- | ---: | --- |
| 8 Apr, Easter Wed John 21 | `AO_Easter_Wednesday_John21_Tissot_AI_Visual_Approved_Draft_2026-10-20.png` | 1586 × 992 | 2,484,404 bytes | `69eba31523b5fb15c781475e186f02bba193cab15e2d596e17b724cde128e3b2` |
| 29 May, Pentecost Ember Friday Luke 5 | `AO_Pentecost_Ember_Friday_Luke5_Wierix_AI_Visual_Approved_Draft_2026-10-20.png` | 1402 × 1122 | 2,289,365 bytes | `b116bcac8883b6d4559d1dc54fad7336f4365940d8996cc2eb22c075a20cad5a` |

The historical models remain distinct: Tissot, Brooklyn Museum **00.159.345** and Wierix, Rijksmuseum **RP-P-OB-9347**. **The recovered images are generated interpretations, not faithful recolourings or photographic editions of those originals.** The user accepted these *visual drafts*, not final production masters; source and crop QA and final release remain pending.

There are therefore **two, not four, approved AI-derived visual drafts still unlocated across the checked repository and Library**: 8 March after Giacomo Cavedone and 22 March after Lucas van Doetechum. Lack of a saved-file match must not be treated as rejection of the images or authorization to regenerate substitutes.

The complete cross-source 29-case inventory becomes **3 local GitHub files + 2 user Library draft originals + 2 remotely linked Home previews + 2 AI originals still unlocated + 1 two-scene Vigil + 19 other exact-source gaps = 29**. The original repository-only snapshot in batch 13 remains valid in its narrower scope.

The nonpublishing provenance supplement is `m2m-recovered-user-library-derivatives-batch14-20261109.v1.json`. It deliberately omits private Library file handles, stores only reproducible filenames and public-project artwork metadata, and grants no new app assignment, upload, permissions or publication.

### P0 follow-up to rejection conflict

Repository code confirms **static Home C3 gallery reachability** for the previously released `released-photo:bouts` (Cleveland rejected original `cma-122338`): `src/art/released-gallery-batch1.v1.js` builds its list from all `RELEASED_MODULE_PAINTINGS` entries; `src/art/sacred-art-taxonomy-v1.js` includes the Bouts entry; `src/home/c3-gallery.js` exposes it under the default `all` category and `src/home/browser-entry.js` binds that gallery action. This is **not a public Pages browser verification**, and it does not establish exactly when or where an end user saw the photograph. A standalone P0 remediation issue [#2761](https://github.com/Fulcanelli13/ad-orientem/issues/2761) now tracks the exposure test and a separate regression-gated code correction. Draft PR #2726 remains research-only and does not modify runtime.

## Complete four-image AI original recovery (batch 15)

The two AI-derived source originals still missing from the 9 November batch14 Library search have now been **recovered from named user-owned image files**, visually checked for the intended gospel scenes, and hashed directly from the saved image bytes. This is an **asset recovery**, not a new artistic approval or publication.

- **8 March 2026, Third Sunday of Lent:** `Christ Commands the Shadows.png` (1,086×1,448; 2,287,238 bytes), recomputed SHA-256 `a7a7a1972f7e7954576cc7580c8f42bfc68b6628be2b51df36de032031db6016`. The hash **matches** the standalone 19 October `Christ Commands the Shadows — provenance.json`, which explicitly marks the AI oil-style reinterpretation after Giacomo Cavedone's Birmingham Museum of Art drawing 1981.142 as `EDITORIAL_APPROVED` for this day. The original is *not* a painting by Cavedone; source-image verification, crop, rights and integration are all false in the approval record.
- **22 March 2026, Passion Sunday:** `Christ Retreats from the Angry Crowd.png` (1,536×1,024; 2,517,813 bytes), newly recomputed SHA-256 `6f25e25484a78737e87cb4ef007e083b8598938d8ed014163404f6194e768c6b`. The file is an AI artwork showing Jesus withdrawing from men raising stones, iconographically consistent with John 8:59 and the earlier 19 October approved *reinterpretation after Lucas van Doetechum*. However, no separate **hash-bound source-provenance approval record** for this exact saved PNG was found; later 21 October Class I visual comparison materials include unresolved photographic/engraving alternatives. **Preserve the AI visual and original engraving separately; keep final chosen image and release gate open** until the user-decision chronology is reconciled. Do not assume a saved AI image outranks a later original engraving preference.

The complete cross-source **29-case accounting** is now: **three existing GitHub provenance assets, four user Library original AI PNGs, two existing uncached remote previews, one two-illustration Easter Vigil decision, and nineteen other selected artworks whose exact photographs remain to be located**. This does **not** mean all four AI files are production-ready; zero are newly published or cleared for phone crops.

The new source-side record is `data/artwork/research/m2m-ai-original-files-batch15-20261109.v1.json`, with standalone hashes, dimensions, artist distinctions and date-selection controls. Neither PNG was uploaded to GitHub or linked into the Calendar runtime. The file does not carry private Library IDs.

The public deployment verification for the separately identified Bouts source-level C3 gallery risk remains incomplete; [issue #2761](https://github.com/Fulcanelli13/ad-orientem/issues/2761) distinguishes statically reachable source code from a browser-confirmed GitHub Pages publication.

## Exact physical-artwork provenance for ten of nineteen held selections (batch 16)

The ten targeted destinations below are recorded in `data/artwork/research/m2m-original19-institutional-batch16-20261109.v1.json`. Official museum collection pages or the institutional Fondazione Zeri catalogue support their physical object research; **they do not certify that the exact previously approved photographic reproduction has been found**. All original date/Prayer approvals remain unchanged.

| Destination | Work and verified provenance | Open decision or image gate |
| --- | --- | --- |
| 1 Mar | Raphael, *Transfiguration*, Vatican Pinacoteca Room VIII | Exact earlier user-chosen file, museum photo rights/crop |
| 6 Apr | Caravaggio, *Supper at Emmaus*: **London National Gallery NG172 (1601)** versus **Milan Brera 2296 (1606)** | **Two different autograph paintings**; source selection says only artist/title—cannot select one without original approval/file evidence |
| 9 Apr | Rembrandt, *Christ and St Mary Magdalen at the Tomb*, Royal Collection **RCIN 404816** | Royal Collection photographic file and rights/crop |
| 10 Apr | Tommaso Minardi, *Missione degli apostoli*, signed **1864 fresco** at Palazzo del Quirinale, Fondazione Zeri record 99995 | Previous title only; do not call this a portable oil canvas or reuse an archival photograph by default |
| 11 Apr | Eugène Burnand, *Peter and John Running to the Sepulchre*, Musée d'Orsay **RF 1153**, 1898 | Museum page credits RMN-Grand Palais photographs; media reuse not certified |
| 25 May | Henry Ossawa Tanner, *Nicodemus*, PAFA **1900.1**, 1899 | PAFA artwork no-known-copyright note does not independently select an approved photo |
| 26 May | *Parable of the Good Shepherd*, Figge Art Museum **25.0032** | Figge headline attributes Bruegel Elder, but description explicitly allows son/contemporary copyist; retain dispute |
| 2 St Anthony Prayer slots | Antonio del Castillo, *Aparición del Niño a San Antonio*, Córdoba **DJ0033P**, ca. 1650 | Two distinct Prayer placements for one physical canvas; original Commons photographic identity and crop not checked |
| Confession third Prayer card | Giuseppe Molteni, *La confessione*, 1838, Fondazione Cariplo, Gallerie d'Italia Milan | Museum institution established; selected Commons file exact pixel/rights not reviewed |

The latter 3 Prayer slots plus seven date slots make **ten destination relationships**. The destination classification is **10 institutional research cases reviewed; 9 remaining**, *not* 10 newly approved works or photographs. Multiple museum objects may be alternatives for a single selected title (Emmaus), and multiple destinations may deliberately reference one real artwork (St Anthony).

The next nine physical-source lookups are: 1 January Tintoretto/workshop *Circumcision*; 30 March Rubens/van Dyck *Anointing at Bethany*; 7 April van Dyck *Appearance of Christ to His Disciples*; 28 May *Sending of the Twelve*; 30 May John Bridges *Peter's Mother-in-Law*; 24 June Andrea Sacchi *Birth of John the Baptist*; 6 December Michael Willmann *Family of Christ*; 13 December Bernardo Strozzi *Baptist Interrogated*; 20 December Gaulli *Preaching of St John*. Existing selections must be reconciled against the precise physical works and source photographs; do not convert general pictorial resemblance into approval.

The 9 November batch 15 recovers all **four source-image files** for user Calendar-linked AI works, but no new publication; Cavedone is hash-bound to a 19 October editorial approval, while 22 March AI-vs-engraving preference is held pending final chronology. [P0 #2761](https://github.com/Fulcanelli13/ad-orientem/issues/2761) independently tracks the statically reachable rejected Bouts gallery photograph; public Pages browser confirmation is still absent.

## Last nine unreconciled selected source artworks — batch 17

After the batch16 ten-destination institutional survey, the remaining **nine exact selected-artwork destinations** were investigated and entered in `data/artwork/research/m2m-original19-institutional-batch17-20261109.v1.json`. Distinguish physical-work evidence from the correct user-selected image file at every stage:

- **1 Jan, Tintoretto/workshop *Circumcision***: likely the same in-situ 1587 San Rocco painting as the Prayer batch9 identity; workshop participation preserved; original Calendar photo remains unlinked.
- **30 Mar, Rubens/van Dyck *Anointing at Bethany***: several secondary sources associate the 1618 composition with the State Hermitage, St Petersburg; **no independently fetched Hermitage accession**, original photo still held.
- **7 Apr, van Dyck *Appearance of Christ to His Disciples***: Commons photograph description identifies a 1625–26 Hermitage painting; **no primary museum object record verified**, so do not auto-promote it.
- **28 May, *Sending Out of the Twelve Disciples***: Centraal Museum Utrecht catalogue **2474**, ca. 1573, anonymous North Netherlandish oil painting.
- **30 May, John Bridges *Jesus Restoring to Health Peter's Wife's Mother***: Birmingham Museum of Art **1978.29**. Official painting catalogue states **1833** and gives signed 'Roma 1833'; the Commons image description instead dates it **1839**. Record a metadata discrepancy while preserving the original work and not assuming the Commons file was approved for reuse.
- **24 Jun, Andrea Sacchi *Birth of St John the Baptist***: Prado catalogue-linked work **P000003** via exact original object UUID in Commons source; Prado web object page not directly accessible during this review. A separate later Sacchi Lateran cycle and related prints exist. **Prado photograph source exclusion applies even where the photo is reposted on Commons**. Do not publish this Prado-sourced photo.
- **6 Dec, Michael Willmann *Family of Jesus Christ***: National Museum Wrocław digital collection, 1677–79 oil on oak; external image metadata associates inventory **MNWr VIII-2328**, which requires direct file/provenance comparison.
- **13 Dec, Bernardo Strozzi *St John the Baptist Interrogated***: National Trust, Kedleston Hall **NT 108873**; previously mis-titled *Incredulity of Saint Thomas*, and independent of Strozzi's *Christ and Woman of Samaria* **NT 108872**.
- **20 Dec, Gaulli *La Prédication de saint Jean Baptiste***: Louvre collection **INV 20298**, historically deposited at Dijon 1811–1968; not Natoire's drawn copy or another Tiepolo Baptist scene.

**Result of batches 16 + 17:** all **19/19** previously unlinked selected artwork destinations have an explicit physical-work research disposition, but **none** of the user's **19 exact selected digital photographs** has been certified or newly published. Two Hermitage cases remain secondary-only, the Sacchi Prado work identity depends on catalogue-linked secondary corroboration while museum page fetch was inaccessible, and the Caravaggio Emmaus selected version remains ambiguous (London versus Brera). The next phase is selected image/file reconstruction and independent licence, pixel fidelity, attribution, frame removal, mobile crop and owner sign-off—not reselecting paintings from generic title matches.

All previous source decisions, the Bouts exact-global rejection, the narrow San Polo CC BY-SA exception, the separate Prado ban, 1,589 relationship edges and 507 accepted options are unchanged.

## Byte-level four-derivative supplemental cross-check

A supplemental independent file-integrity pass on the four user Library originals is recorded in `m2m-ai-derivative-four-file-hash-audit-batch15-20261109.v1.json`. It complements—not supersedes—the earlier `m2m-ai-original-files-batch15-20261109.v1.json` and the 20 October Tissot/Wierix saved-draft manifest.

| Calendar date | Exact saved image | Recomputed SHA-256 | Dimensions |
| --- | --- | --- | --- |
| 8 March | `Christ Commands the Shadows.png` | `a7a7a1972f7e7954576cc7580c8f42bfc68b6628be2b51df36de032031db6016` | 1086 × 1448 |
| 22 March | `Christ Retreats from the Angry Crowd.png` | `6f25e25484a78737e87cb4ef007e083b8598938d8ed014163404f6194e768c6b` | 1536 × 1024 |
| 8 April | `AO_Easter_Wednesday_John21_Tissot_AI_Visual_Approved_Draft_2026-10-20.png` | `69eba31523b5fb15c781475e186f02bba193cab15e2d596e17b724cde128e3b2` | 1586 × 992 |
| 29 May | `AO_Pentecost_Ember_Friday_Luke5_Wierix_AI_Visual_Approved_Draft_2026-10-20.png` | `b116bcac8883b6d4559d1dc54fad7336f4365940d8996cc2eb22c075a20cad5a` | 1402 × 1122 |

All four SHA-256 hashes were **recomputed from raw Library PNG bytes**, not merely copied from text manifests. Three match existing independent provenance notes; the 22 March image gains a stable hash where no prior image-specific hash was recovered. A saved image, its liturgical scene relevance, its final owner-selected placement and its photo-publication permission remain **four separate assertions**. The October 21 proposal to use the historical engraving instead of the AI interpretation for 22 March is labelled *undecided*; it cannot silently supersede earlier user selection. In particular, `Christ Retreats from the Angry Crowd.png` cannot be promoted as final without resolving its image-specific selection provenance.

The additional `m2m-nine-institutional-object-leads-batch16-20261109.v1.json` is a **nine-destination corroboration subset** of the already committed authoritative **19/19** source-study pair `m2m-original19-institutional-batch16-20261109.v1.json` and `m2m-original19-institutional-batch17-20261109.v1.json`. **Do not add nine to nineteen.** The total 19 separate destination paintings have source-work research dispositions; none of those 19 exact owner-selected digital photograph masters has been independently identified and certified. The additional nine are not new production assignments or physical-art acquisition decisions.

The public GitHub Pages page and image URL could not be accessed by the available web reader; local browser access was also unavailable in this session. The **Bouts P0 remains a statically established UI reachability path**, not an independently witnessed live browser rendering. See [issue #2761](https://github.com/Fulcanelli13/ad-orientem/issues/2761) for production verification and a separate corrective PR if required. No change to source-gallery code or GitHub Pages occurred in this research pass.

## Historic Prayer Commons source filename checks — batch 18

Two exact Commons file **page links** previously recorded as *current* Prayer selections were checked against their current file-page metadata, then stored without importing a new photo in `m2m-exact-commons-source-metadata-batch18-20261109.v1.json`.

- **St Anthony apparition** — the **same exact Commons filename and Córdoba physical painting `DJ0033P`** is referenced by two distinct historical Prayer slots, `COV-novena.st_anthony_nine_tuesdays` and `COV-devotion_st_anthony_lost_items`. Commons currently reports **3400×4477 JPEG, 5,093,782 bytes, SHA-1 `7f8376ce...`**, upload updated 4 June 2017. This is the **142×110 cm Museo de Bellas Artes de Córdoba painting** and is not necessarily the distinct similarly titled Castillo 125×103 cm picture appearing at auction. The Commons original URL is historically selected, but **the actual bytes, source-photographer reuse entitlement and phone crop have not been independently verified**.
- **Molteni `La confessione`** — `STG-pray.confession-03` references the **exact Commons file-page filename** for the **1838 Fondazione Cariplo/Gallerie d'Italia work**. Commons currently reports **1295×1600 JPEG, 507,136 bytes, SHA-1 `45965d...`**, last upload 6 June 2012. The Commons file page includes PD-Art reproduction language but also carries structured-data CC BY-SA attribution metadata; **do not infer a complete cross-border photo-release licence** solely from this. Do not substitute the earlier Crespi *Confession*.

**Three existing destination relationships, two physical paintings, two previously selected Commons source URLs, zero independent binary hashes and zero photographic rights/crop approvals.** The historical 507 accepted Prayer alternatives remain unchanged. This stage is a source-file provenance advance, not a media acquisition or runtime assignment. The original referenced image URLs and their artwork attribution remain subject to independent image inspection.
