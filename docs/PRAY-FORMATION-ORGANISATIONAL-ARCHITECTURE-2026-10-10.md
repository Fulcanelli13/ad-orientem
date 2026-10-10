# Pray + Formation — canonical reorganisation and relationship design

**10 October 2026.** Status: **information-architecture proposal with a machine-readable crosswalk**, not a deployed visual redesign, source certificate, or browser-verified acceptance.

Machine map: [`data/app/pray-formation-organisational-map.v1.json`](../data/app/pray-formation-organisational-map.v1.json). Baseline: `main@75273300dcae8809885938d167f4a1f41b8bcced`. The complete current route inventory is `data/app/content-navigation-registry.v1.json`; the present implementation is `src/pray/presentation-runtime.js`, `src/learn/presentation.js` and `src/apostolate/contracts.js`.

## Governing decision

Reorganise **the information and relationships first**; design the visible pages second. A canonical record is owned exactly once, may be reached from several relevant contexts, and must return to the original user state.

This is a **presentation taxonomy**. The current source owners, IDs, external lazy loader, Prayer and Formation readers, five global destinations, R17 Mass and Calendar resolver remain unchanged. No title or decorative route may publish research-only material. Artwork and shortcuts are not substitutes for ownership, accessibility and purposeful hierarchy.

### What the current inventory actually says

| Surface | Canonical user entrances | Source/ownership facts |
|---|---:|---|
| Prayer | **23** (22 cards in five source families + direct Library door) | Ten cards load first-use Prayer modules. A total of 100 leaf records is *not* 100 separate modules: 48 individual prayers, 16 novena targets, 2 programmes, 14 Stations stages, 20 Rosary mysteries |
| Formation | **15** live launcher IDs | 2 Catechism, 1 Spiritual Life, 1 Sexual Ethics, 1 Scapular, 2 Mass-formation, 6 sacramental guides, 1 Latin, 1 Glossary |
| Apostolate | **36** registered scenarios + 9 skills | Three distinct practice engines: Answer, Help, Introduce; this is not a second catechism or apologetics database |
| Formation research | **60** APOL and **81** Church Crisis dossiers | Explicitly unpublished. Do not place them in public category cards or global search until certification |
| Sexual Ethics | 50 canonical topic projections, 150 questions, 55 debated-answer records | Same owner; expanded debates carry separate publication/claim gates; these records must not be counted as 255 new published articles |
| Catechism/Latin | 433 Catechism witness identifiers, 40 Latin lessons | The 54 recovered Learn-the-Faith lessons and 55 candidate order positions are research and presentation alternatives, not extra doctrinal owners |

## The proposed Pray experience

**Landing hierarchy:** one calm, contextual **Pray now** entrance using existing Prayer IDs and Calendar date/season; then four illustrated families; then a direct **Prayer Library** search. Do **not** show 23 equal tiles at the first level or assign one image per prayer. A live resumable Prayer session takes priority over a suggested seasonal prayer where the owning reader actually supports resumption.

1. **Daily & Marian Prayer** (5): `pray.morning_evening`, `pray.angelus_regina`, `pray.rosary`, `pray.meal_prayers`, `pray.nightly_examen`.
2. **Before the Blessed Sacrament** (4): `pray.adoration`, `pray.benediction`, `pray.forty_hours`, `pray.communion_treasury`.
3. **Penance & Passion** (5): `pray.confession`, `pray.penitential_psalms`, `pray.litany_saints`, `pray.stations`, `pray.seven_words`.
4. **Devotions & Novenas** (8): `pray.novenas`, `programme.first_friday`, `programme.first_saturday`, `pray.sacred_heart`, `pray.holy_name_litany`, `pray.sacred_hymns`, `pray.good_death`, `pray.dying_companion`.
5. **Prayer Library** (1): `pray.library` opens the existing 48-text searchable reader. Its individual prayers are content leaves, not 48 landing cards.

Secondary categories (Marian, Passion, Sacred Heart, for the Sick, etc.) are **facets/tags and contextual links**, not additional text owners or duplicate subtrees. Where a devotion fits two families, its **one primary family** is defined in the machine map; discovery results may reference it in other contexts.

**Depth:** Pray > family > existing canonical reader, with a direct-entry override from Pray now, search, Calendar and Formation. Internal reader navigation stays specialised: prayer text, call/response, Rosary, Stations, guided Confession, public Benediction, novena programme and library detail do not become a generic one-size-fits-all article view.

## The proposed Formation experience

Three strong user intentions, not fifteen flat competing cards:

- **Learn the Faith:** Faith & Catechism (**2**); Christian Living & Sacraments (**8**); Liturgy & Latin (**3**). This is ordered learning, with course/guide/list-reader distinctions.
- **Questions & Debates:** currently only **one independently public launcher**, `learn.sexual_ethics`; render its 50 canonical topics as the ordinary index, retain direct search of 150 questions and show deeper 55 debate records subject to source-review gates. The planned Apologetics and Church Crisis pages are reserved but **not displayed as empty/coming-soon modules** or falsely counted as published.
- **Put Faith into Practice:** Apostolate **36** scenarios, under **Answer** (AQ:8), **Help** (HS:7 + FH:8) and **Introduce** (TF:5 + DV:5 + WC:3). The nine APF skills are supporting lessons, not nine new catalogue sections.

**Reference is a service, not a fourth competing course:** the existing `learn.glossary` reader and Scripture handoffs appear through search, inline contextual definitions and optional deeper exploration. Underlying 450 concepts, 350 lexemes and 80 Latin phrases keep their canonical reference owners.

The screen should show the **three paths**, then (contextually) a featured ongoing lesson or searchable question; family detail can show tightly grouped sections. Avoid a 15-card root wall. "Christian Living" is a **display grouping only** and must never resurrect the retired `learn.catholic_life` route.

## Connections: use the codes we already have

The machine map preserves all **15 registered cross-module handoff types** and reconciles **20 candidate content-level relationships** against live owners. Of those 20, **nine already have source-wired connections** (without phone certification), including Spiritual Life → Daily Prayer, Serious Illness → Dying Companion, First Communion → Communion Treasury, Dying Companion → serious-illness Formation, First Saturday → Rosary, and four Apostolate scenario handoffs. Only **eleven are genuinely proposed/not yet wired**. This distinction prevents duplicate buttons and parallel ownership.

Concrete journeys to implement or validate:
- **Formation: Spiritual Life → Pray: Morning/Evening or Nightly Examen.** Study leads to an action; returning restores the lesson and section.
- **Formation: Serious Illness/Viaticum → Pray: Dying Companion or Good Death.** One sacramental guide, one devotional executor. Do not copy full paragraphs or invent rites.
- **Formation: First Communion → Pray: Communion Treasury.** Preparation and thanksgiving open the actual Prayer owner.
- **Formation: Moral questions → Pray: Confession** only where the context actually calls for the sacrament, without intrusive prompts.
- **Pray: Confession → Catechism/Glossary** for the doctrine of Penance; `G036` remains the single Glossary definition.
- **Pray: Rosary or Stations → Scripture** using the existing source/versification policy and actual passage provenance; no invented quotation or duplicate Bible reader.
- **First Fridays → Sacred Heart**; **First Saturdays → Rosary**; Calendar owns dates, Prayer owns execution.
- **Apostolate AQ01/AQ02 → approved Catechism/Prayer readers** as contextual references; the scenario is practice, not a substitute doctrinal article.

**Source-level evidence already exists:** `src/app/contextual-study.js` owns recognised Glossary capsule IDs; Pray's Eucharistic, Confession/Penance and Passion family entries use `G301`, `G036` and `G419` respectively. `src/pray/rosary-scripture-policy.js` owns Rosary Scripture context. `src/learn/discovery.js` searches published Formation modules plus reference/surface entries without becoming another content owner. These are **limited source witnesses**, not item-by-item verified bidirectional navigation.

**Handoff contract for every deep link:**

```text
origin: { surface, routeId, itemId?, substep?, scrollAnchor?, language, mode? }
target: { canonicalOwner, canonicalRouteId, itemId?, contextReason }
policy: { publishedOnly: true, leaveMassGuard: true, returnToOrigin: true }
```

This is a contract for future implementation, **not** a claim those fields are present in runtime today. Back must restore the origin and its position; Home is never the automatic result of closing a contextual lookup. Handle lazy-loading failure with an exact-target retry and visible error, not a silent unrelated landing.

## Guide policy

A Guide has **two separable functions**: factual/historical/ritual **context**, and **user-controlled walkthrough**. A passive prayer-text reference does not need a fabricated Next-step wizard. A Rosary or Confession reader does need a meaningful progression.

The 10 October source-level audit records **29 information follow-ups and 15 walkthrough follow-ups** across all relevant routes, not 44 proven omissions and not a demand for Guides on every hub. Guide classification for each of the 38 public Prayer/Formation entries is embedded in the machine map. Audit actual nested details before writing new guide text or adding another icon. Every factual paragraph requires source/edition clarity.

## Discovery and visual hierarchy

**Pray:** artwork/season-aware introductory illustration, one salience-ranked Prayer action, four families with short labels and restrained images, one small library search affordance. The illustration changes the mood; it does not control the taxonomy or displace resume/Prayer actions.

**Formation:** editorial frontispiece, three clear intentions, compact ongoing course, search and topic-led study. A large hero is appropriate only for a subject/topic landing, not every question result.

**Shared:** Calendar-derived typography, dark sacred palette, sensible mobile-sized text and controls, no gamification, no nested duplicate navigation ribbons. Cards should indicate a deliberate entrance or progress state; ordinary chapters/questions are lists or continuous editorial rows where that is more scannable. EN/FR text and long French titles are acceptance criteria.

## Implementation status — expanded organisational pass

The branch now contains **bounded actual presentation and routing changes**, in addition to the architecture map:

- `src/pray/presentation-runtime.js` and `src/pray/presentation-styles.js`: reorganise the Prayer home into a salient **daily** family, an **Eucharistic** family, a combined **Penance and Passion** visual group retaining its two distinct canonical readers, and **Devotions plus direct Library**. The five source-family IDs, sixth Library door, all 22 family cards and ten external lazy routes remain exactly as they were; this is not a prayer-text migration.
- `src/learn/presentation.js` and `src/learn/browser-entry.js`: place the six existing internal family doors under **Learn the Faith** (five original groups) and **Reference** (one group), plus separate direct **Questions & Debates** and **Put Faith into Practice** entrances. Questions opens `learn.sexual_ethics`, the only currently published specialist Question/controversy launcher, preserving the `spiritual-moral` family return context. Apostolate continues through its original route. No APOL/CR preview is made public.
- `src/apostolate/corpus.js` / `src/apostolate/hs-corpus.js`: replace four obsolete Prayer references. `pray.marian` becomes exact `pray.rosary` for AQ01; three `pray.holy_souls` handoffs (AQ07, HS05, HS06) become `pray.eternal_rest`. Both canonical destinations are already registered with real readers. This repairs route identity but real tap/back still requires phone validation.
- Machine map expanded with **72 live Apostolate source-defined handoffs** spanning 36 scenarios, **65 registered target routes**, **2 intra-Apostolate scenario references**, and **5 Mass-preparation handoffs** whose exact `mass.prepare` subroute is not independently resolved by the Apostolate handler. These five remain for the Mass-last workstream; do not represent them as exact Prepare-entry success. There are **zero unresolved target IDs** after the four Prayer corrections.
- Exact Prayer Library facet identities accounted for: `essentials` 15, `marian` 7, `eucharistic` 8, `massdev` 2, `holyghost` 2, `canticles` 1, `saints` 7, `hearts` 2, `dead` 4. These nine existing source categories are content filters, not independent text banks. 50 Sexual Ethics topic IDs map to 150 questions and 55 deeper debate records.

**Guide triage:** Of the 38 published Prayer/Formation entrances in this crosswalk, **25** carry a source-level PARTIAL, GAP_CANDIDATE or preview-only flag for at least one of Guide context and walkthrough. They are ranked in the machine map; this is not proof that live runtime lacks all 25 functions, nor does a passive lookup require an artificial wizard. High-value review targets include Sexual Ethics debate pathways, Holy Name litany, Communion Treasury, Good Death/Dying Companion, Prayer Library context and the Catechism guided reader.

**Tests added:** the app-shell IA contract now checks the complete 23/15/36/100 identities, that exact 72-target handoff ledger against actual corpus text, category counts, existing source definitions, absence of obsolete apostolate Prayer aliases, preservation of publication gates and the new UI linkage. This does not replace browser/phone acceptance and does not certify original texts or argument sourcing.

This batch deliberately does not alter Mass, Calendar, full Prayer readers, Apostolate scenario prose, Scripture editions or content sources. The visual system of Today v3 may be applied later after route/interaction acceptance.

## Release sequence — production work after this IA lock

1. **Integrity and routing (P0):** Validate the exact 23/15/36 IDs and all 100 Prayer leaf projections against the source owner. Preserve the ten lazy Prayer routes, three nested Prayer routes (`pray.visit_blessed_sacrament`, `pray.de_profundis`, `pray.eternal_rest`) and `pray.angelus` alias. Check return-to-origin, source errors, bilingual paths and publication gates. No visual changes.
2. **Pray IA (P1):** One contextual hero, four families + Library, correct entry-point labels, facet/search projections. Retain canonical specialised readers. Add only verified exact-ID relations; instrument tap/back/resume.
3. **Formation IA (P1):** Implement the three-path navigation, 15 launcher grouping, Questions index and same-owner search. Keep APOL/CR unpublished. Integrate Apostolate under the third path, not a permanent global tab.
4. **Context and guides (P2):** Fill independently verified source-context/step gaps; share `Glossary`, `Scripture`, `Calendar` context with precise return state. Do not create new textual owners.
5. **Visual acceptance (P2):** Apply Today v3/Full Calendar's editorial style and appropriately licensed sacred artwork; 320/360/390/430px, offline, keyboard, French and reader-focus tests; compare to the old UX.
6. **Mass last:** R17 48-card native LIVE remains protected and unaffected during phases 1–5.

**Approval gates:** no duplicate canonical IDs; no old alias falsely shown as a content card; no unapproved research surfaced; real-phone tap/back for every exposed route; no broken language/edition/source distinctions; every displayed context link points to a published exact target; Calendar and Mass still own dates and live liturgical execution.

## Current risks / unresolved choices

- Guide audits are source-level and may lag newer guide corrections; update only with actual phone and source review.
- A canonical 50-topic Sexual Ethics index is already modelled, but reader display and all expanded argument/source gates require fresh acceptance before advertising 55 independently certified debates.
- The formation question home has only one public debate-topic owner at present. Do not fake completeness by showing 141 unpublished APOL/CR items.
- Choosing art and shortening labels is **downstream** of the taxonomy. Preserve this map as a projection of live IDs and regenerate/reconcile whenever the official source changes.

The final objective is **not** a larger catalogue; it is fewer, clearer decisions and contextual movement between genuine canonical modules.
