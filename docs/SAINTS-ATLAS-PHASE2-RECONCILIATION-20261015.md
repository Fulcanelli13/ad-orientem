# Map of Saints — Phase 2 source reconciliation and visual review (15 October 2026)

**Current state:** draft-only in PR #1227 on the original Ad Orientem repository. No production Explore, Calendar, Mass, Homepage, Place or sacred-art owner files have been modified.

## Inventory linked, without duplicate ownership

The new `data/saints/cross-module-source-reconciliation-20261015.v1.json` records the exact existing owner IDs and their original blob SHAs.

| Cohort | Reconciled source-identity results |
| --- | --- |
| Existing shrine associations | 119 distinct name strings; 145 retained shrine/Place/source relationships |
| Sacred-art W31 research master | 41 of the 119 name strings have subject matches against 75 distinct art subjects; 34 art subjects are not represented in these shrine strings |
| Relic subject research | 95 of the 119 name strings match 92 distinct subject identities out of 161; 69 subject records lie outside the shrine-string cohort |
| Novenas | 4 direct devotional addressee links (Joseph, Thérèse, Anthony of Padua, Michael); 12 others are mysteries, Marian or otherwise not direct personal saint addressees |
| Calendar semantic registry | 5 explicit saint-associated semantic candidates; **not** a full 1962 calendar crosswalk |
| Holiness-first summary pilot | 6 bilingual persons, 10 name-to-shrine associations, 9 unique physical Places (8 non-indicative map markers + 1 Russell NZ hold) |

**All counts describe source-record relationships, not unique canonized persons, app-ready portraits or fully checked biographical dossiers.**

## Identity hazards and deliberate non-merges

Explicit alias candidates include Dominic/de Guzmán, Louis de Montfort/Louis-Marie Grignion de Montfort, Nicholas/Nicholas of Myra, and abbreviated Apostle/Doctor names. The original names are preserved verbatim and no live shrine record is edited.

The compound Sens entry, Uganda Martyrs, Maurice and the Theban martyrs, Three Magi and angels cannot be treated as one ordinary human saint per row. Three entries explicitly labelled **Blessed** must remain separate from canonized saints, including Jacques-Désiré Laval.

Relic subject status `PERSON_CANONICAL_STATUS_UNREVIEWED` is **not** canonization confirmation; reported relic custody does not imply independent authenticity. Sacred-art research IDs are not approved artwork masters and have no permission to become image URLs automatically.

## Visual review (standalone, opt-in, no app changes)

`previews/saints-map-holiness-first-20261015.html` previews six source-linked bilingual profiles using the existing physical Place registry and the existing MapLibre dark map convention. It embeds the exact reviewed draft data so the preview needs no hidden separate content API. It is explicitly a **prototype**, not a second production app.

- Map: 8 non-indicative existing physical-Place markers; excludes the provisional Russell NZ school-proximity marker.
- One marker per physical Place, not one pin per saint. The Paray location can associate multiple saints.
- Mobile/desktop source-first cards lead with why the Church honours the person, then three concise meaningful facts. The Blessed is correctly labelled.
- Approved saint portraits: **zero**. An honest placeholder is shown instead of hotlinking candidate art or mislabelling shrine photographs.
- Source links are folded under Sources & further reading. No copied full-book passages, no CSS or script modifications to the app shell.

The preview is a safe design review of the **mechanism**, but image approval, editorial review, actual phone screenshots and live app navigation are not completed.

## 1962 Sanctoral and broader communion of saints

The live Calendar runtime resolves the chosen 1962 Roman principal feast/commemorations; the standalone 2026 independent-check fixture has only 72 test cases. The five `src/calendar/intelligence.js` semantic keys are contextual bridging entries, not normative liturgical observances.

Future Calendar wiring must use the **actual resolved day record** to identify principal sanctoral subject and each independently permitted commemoration, with feast rank/colour inherited from the Calendar owner. Other canonized saints, newly declared Doctors and local cults remain discoverable in the atlas without changing the 1962 Missal.

## Existing pipelines respected

- Explore and shared physical Places: `src/find` and `data/geography`
- 1962 calendar + commemorations: `src/calendar`
- Art selection and rights: sacred-art PR #887 (W31; candidate research only)
- Relic subject and authentication caveats: `data/explore/worldwide-relic-subject-census.research.v1.json`
- Novena owner: `data/pray/novena-sot.v1.json`
- Parsing rights and lazy book excerpts: PR #1215 and PR #1222
- Compact original work/witness source references: PR #1212

### Next release gates

1. Extend actual 1962 day resolver-to-saint ID crosswalk, including commemorations and displaced feasts; use full-year audited context, not the five semantic links as proxy.
2. Promote a curated group of actual saint portraits via existing art owner after rights, identity and high-resolution approval; no rating-reset request.
3. Integrate Saints into the existing Explore owner with unique Place pins, keyboard/touch navigation and real app return context, not the standalone preview.
4. Expand 6 substantive EN/FR biographies systematically from audited sources; do not publish shallow metadata-only entries.
5. Run real GitHub Pages 390px mobile and desktop visual acceptance, current Calendar and Explore regression suites and human editorial check before merge.
