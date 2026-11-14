# Ad Orientem — ICKSP/ICRSP Prayer Audit, Batch 05

Date: 28 October 2026.
Scope: next five unique Pray hub items after Batch 04: pray.sacred_heart; pray.holy_name_litany; pray.sacred_hymns; pray.good_death; pray.dying_companion.
Status: RESEARCH ONLY. No source prayer text, runtime, interface, Calendar, Mass Reader or deployment changed. Implementation belongs in separate branches from current main and must avoid collisions with Batches 1–4. No expenses, permissions requests or unverified copyright imports.

## Executive findings

| Module | Verified existing | Main action | Priority |
|---|---|---|---|
| Sacred Heart of Jesus | Three modes: Litany; Pius XI Iesu dulcissime Act of Reparation; consecration of human race | Preserve. Institute Golden Arrow Prayer of Reparation is a DISTINCT Holy Face/Holy Name prayer; Institute Christ the King Dedication is DISTINCT from existing consecration | P1 |
| Holy Name Litany | Complete locally stored LA/EN/FR Roman historical litany with full and seven-section guided reading | Preserve, verify line-level parallelism; link Holy Name context; Golden Arrow must remain separate | P2 |
| Sacred Hymns & Canticles | Only Te Deum, Veni Creator and Ave Maris Stella in LA/EN/FR | Expand by verified distinct hymn identities, not by importing hundreds of chant-score settings or mass propers | P1 |
| Preparation for a Good Death | Nine prayer stages, St Joseph, theological acts, Marian prayer, Jesus Mary Joseph | **Current St Joseph litany is 2021 expanded version**; historical preconciliar 1909 text should be verified and offered as traditional default, retain later expansion labelled | P0 |
| Dying Companion | Three pastoral stages: now, pray, commend; priest-first action, Proficiscere and after-death links | Preserve. Source-collate Roman commendation and French witness, protect roles and urgent/offline accessibility | P1 |

## 1. Sacred Heart of Jesus

Current ownership: src/pray/traditional-pray-runtime.js renderSacredHeart() and src/pray/traditional-pray-data.js SACRED_HEART_DEVOTIONS_V382, with canonical-data.js sacred_heart_short_prayer. Existing three modes are Litany, Reparation and Consecration; the latter is the historical consecration of the human race to Christ the King. The misleading internal key sacred_heart_short_prayer actually holds the full Pius XI Act of Reparation, Latin incipit Iesu dulcissime, cuius effusa in homines caritas. Do not replace this with a shorter source or rename globally without migration and tests.

CRITICAL ICKSP source: https://institute-christ-king.org/resources/devotions-prayers/613-devotions-reparation . The Institute's Prayer of Reparation is the short Golden Arrow / Holy Face prayer associated with Sr Marie de Saint-Pierre OCD, beginning May the most Holy, most Sacred, most Adorable... Its purpose is reparation for blasphemy and irreverence. It is not the same text as Iesu dulcissime. Import as an independently sourced prayer ID after text-reuse verification; link from appropriate Holy Name / Holy Face and Sacred Heart context, never as an alias for Pius XI.

Second distinct Institute work: https://institute-christ-king.org/resources/devotions-prayers/611-devotions-dedication-christ-king . The Dedication to Christ the King begins O Lord Jesus Christ, I acknowledge Thee King of the Universe and includes renewal of baptismal promises and an Act of Christ's Kingship. It is not identical to the full human-race consecration; preserve both with distinct IDs and link the existing Christ the King Calendar where relevant.

Third Institute work: https://institute-christ-king.org/resources/devotions-prayers/614-devotions-prayer-priests . Its two Prayers for Priests have Sacred Heart / Eternal Priest intercessory themes, but the Batch 2 Adoration pipeline owns their primary import. Reuse verified records rather than duplicate.

UI recommendation: surface three existing selectable modes clearly, not only as selectors buried in a Sources/Options disclosure. Avoid making all three required steps. Preserve historical source identity and existing LA/EN/FR prayer bodies.

Priority P1, and P0 cross-batch collision alert should any parallel import identify the Golden Arrow as Pius XI reparation.

## 2. Litany of the Holy Name

Current ownership: HOLY_NAME_LITANY_V381 in traditional-pray-data.js, renderHolyName() in traditional-pray-runtime.js. Contains local LA/EN/FR texts: 1925 Roman Ritual Latin reference, historical English and French prayer witnesses. Both full-text and guided seven-section reading are implemented. The code treats seven blank-line-separated sections in each language as sufficient to enable the guided form, so verify the correspondence of individual invocations, responses, versicles and two concluding collects; do not assume equal section counts prove accuracy.

ICKSP's https://www.institute-christ-king.org/resources/sacred-music lists Holy Name Litany chant versions from Downside plainsong and Solesmes. These are different music settings, NOT a reason to replace the prayer text. The Golden Arrow is a related short Holy Face/Holy Name reparation, not a new Litany verse. Link to Feast of the Holy Name in the existing Calendar, with source-specific external chant-score links if useful; do not import score PDFs without explicit reuse rights.

Priority P2: integrity tests, accessibility (leader/response), contextual access, no extensive redesign.

## 3. Sacred Hymns & Canticles

Existing corpus: SACRED_HYMNS_V381 has exactly three hymn keys te_deum, veni_creator, ave_maris_stella, with historical Latin, English and French texts and stanza-preserving UI. French witnesses include pinned Divinum Officium, 1858 Comtesse de Ségur and historical Pierre Corneille. The three-hymn collection is intentionally small, but ICKSP and ICRSP use a much broader body of hymns.

Official music register: https://www.institute-christ-king.org/resources/sacred-music . It distinguishes Mass propers, Office hymns, Eucharistic procession texts, Marian antiphons, Benediction chant settings and other liturgical music. The site permits FREE DOWNLOAD FOR STUDY/PERFORMANCE; this DOES NOT itself grant republishing modern scores in a paid app.

ICRSP French liturgical/Office source: https://icrspfrance.fr/textes-liturgiques.php . Relevant candidates, subject to independent textual collation and global de-duplication, include:
- Eucharistic: Adoro te devote; Sacris solemniis; Verbum supernum; complete Eucharistic Pange lingua is already Batch 2 owner.
- Marian: Alma Redemptoris Mater; Ave Regina caelorum; Salve Regina; Regina caeli (many may already exist in Canonical Prayer or Angelus).
- Penitential / Passion: Audi benigne Conditor; Pange lingua gloriosi proelium; Lustra sex; Vexilla regis, each checked against historically attested liturgical text. Crucially distinguish Passiontide Pange lingua from Eucharistic Pange lingua.
- Existing Te Deum, Veni Creator, Ave Maris Stella should be retained, not duplicated.

First implementation tranche: source-collate 8–12 distinct TEXT identities, with stable IDs and separate pronunciation/chant-setting metadata. Lyrics may be used as prayer; Mass propers and score pages have their own correct functions and should never be imported indiscriminately. Show attested LA/EN/FR where available, otherwise transparent missing witness; no invented translations or audio playback. Link seasonal suggestions to the existing Calendar and related modules, no competing module or Calendar.

Priority P1 phased source-backed expansion.

## 4. Preparation for a Good Death

Current nine stages (GOOD_DEATH_STAGES, traditional-pray-runtime.js):
1 Litany St Joseph; 2 Ad te beate Ioseph; 3 Memorare St Joseph; 4 Act Faith; 5 Act Hope; 6 Act Charity; 7 Act Contrition; 8 Hail Mary; 9 Jesus Mary Joseph aspirations.
Separate urgent bedside handoff correctly opens Dying Companion.

P0 verified historical issue: current canonical-data.js devotion_litany_st_joseph contains seven postconciliar 2021 additions, e.g. Custos Redemptoris, Fulcimen in difficultatibus, Patrone exsulum, Patrone afflictorum and Patrone pauperum. Vatican 1 May 2021 decree https://press.vatican.va/content/salastampa/en/bollettino/pubblico/2021/05/01/210501b.html confirms exactly seven new invocations added to the litany approved in 1909 (AAS 1 [1909] pp. 290–292). Existing metadata in prayer-edition-witnesses.v1.js ALREADY records 2021 expanded identity, so this is a presentation/default inconsistency, not an undiscovered version. DO NOT pretend 2021 form is the 1909/pre-1962 form. Independently collate original preconciliar Latin and authentic EN/FR (including collects), create preserved distinct IDs/labels, choose traditional version as default within Good Death, and preserve later version elsewhere as explicitly current. No naive seven-line deletion or unverified translations.

Continue to preserve the 1922 source-locked Jesus Mary Joseph aspirations, all remaining nine stages, and the urgent bedside route. Shared Act of Hope French formula and Act of Contrition are Batch 1 owner; link rather than concurrent edit. Keep no compulsory timed countdown, no invented final perseverance promise and no presumptions about death.

Priority P0.

## 5. Dying Companion

Existing code: renderDyingCompanion() in traditional-pray-runtime.js; three distinct tabs now (call priest), pray (short acts, Marian and St Joseph prayers), commend (Proficiscere, prayers for deceased once death occurs); dying-companion-flow.js controls 3-stage progression. It clearly asks priest for Penance, Anointing, Viaticum and Apostolic Blessing; no sacramental simulation. GOOD_DEATH_DYING_V384 in good-death-data.js contains Latin/EN/FR Proficiscere and prayers, with historical 1922 Jesus–Mary–Joseph aspirations.

Source caveats: current Latin Proficiscere links a Monastic-1963 online witness; source ownership is not automatically the exact 1962 Roman Ordo Commendationis Animae. French Proficiscere witness currently links Scribd historical manual; unsuitable to treat as stable primary print facsimile or publication rights guarantee. Collate with specific freely accessible printed Roman Ritual and historical French Catholic manual, record edition, page, variant and rights. Preserve current prayer body until a verified alternative is approved, and do not say print-collated when not.

UX: retain priest-first action as immediate, high-contrast, available offline. No lengthy question tree, sensitive health data collection, simulated Viaticum, priest action or local telephone number invention. Individual prayers should have direct access and appropriately labelled lay/clerical functions; after death handoff to Eternal Rest and De profundis. If immediate medical distress, seek professional emergency help separately from priest contact. Check source-specific privacy and offline/mobile. Cross-module St Joseph link must use resolved historical/form variant from P0 good-death correction, not an unlabelled 2021 form.

Priority P1.

## Cross-batch collision protection

- B1 owns shared St Pius X Morning/Evening, Act of Hope and Contrition variants: no parallel correction.
- B2 owns Adoration Eucharistic texts and the institute's Prayers for Priests; IMPORTANT: correct its 'Prayer of Reparation' candidate to Golden Arrow identity, not existing Sacred Heart Act. Also cross-link new Sacred Hymns rather than duplicate Pange lingua.
- B3 owns public vs private Litany of Saints; Dying Companion must not substitute an arbitrary version for the Roman death prayers.
- B4 owns First Friday tracker and its Sacred Heart practices; Sacred Heart module may link it but not create a second tracker.
- All 25 Pray hub modules now reviewed across five research batches, but the Prayer Library, My Customs, Calendar, Mass Reader, rites and other integrated contexts are NOT claimed comprehensively audited.
- No paid services, score/audio republishing without cleared rights, new infrastructure or secret migration.

## Recommended implementation order and verification

A. P0 rectify historic St Joseph Litany variant ownership, preserving 2021 with verified 1909/1962 default. Tests across Good Death and all other St Joseph routes.
B. P1 register Golden Arrow and distinct ICKSP Christ the King dedication in their proper prayer families; no text identity conflation, coordinate with B2.
C. P1 stage source-backed hymn text additions, avoid duplicate prayer IDs and distinguish chant settings/lyrics/proper Mass roles.
D. P1 independently source-collate Roman dying commendation and test offline urgent bedside behavior.
E. P2 strengthen Holy Name section/response alignment and historical chant-source links.
F. Full LA/EN/FR, mobile swipe/focus, offline, prior saved preferences, source edition/reuse, Blessed Sacrament, Mass, Calendar and adjacent Batch regressions.
G. No implementation PR should report success until targeted and integration tests pass and the exact merged commit is verified in deployment.

## Research sources

ICKSP selected devotions: https://institute-christ-king.org/resources/devotions-prayers
ICKSP Golden Arrow: https://institute-christ-king.org/resources/devotions-prayers/613-devotions-reparation
ICKSP Christ the King Dedication: https://institute-christ-king.org/resources/devotions-prayers/611-devotions-dedication-christ-king
ICKSP Prayers for Priests: https://institute-christ-king.org/resources/devotions-prayers/614-devotions-prayer-priests
ICKSP sacred music: https://www.institute-christ-king.org/resources/sacred-music
ICRSP French liturgical index: https://icrspfrance.fr/textes-liturgiques.php
Holy See 2021 St Joseph additions: https://press.vatican.va/content/salastampa/en/bollettino/pubblico/2021/05/01/210501b.html

Five module source code paths examined. No implementation, no printing/source critical certification where separately flagged, no live device testing, no deployment changes.
