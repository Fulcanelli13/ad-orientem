# Mass P1 — Formation destination and non-duplication contract
_16 October 2026 · P1 product scope · draft/unmerged_

## Governing decision
**Mass is Mass.** The native LIVE / Missal / Simple reader is for prayer and immediate liturgical orientation only: text, translations, gestures, responses, state and brief rubrics. This P1 branch must **never** add historical/theological source reading, Mass Explorer calls-to-action or exploratory links to the reader.

Outside Mass, **Formation → Understand the Mass** is the single principal study destination. It offers two *views of existing owners*, not two new textual databases:
- **Follow in order**: `learn.mass_explorer` / `src/learn/mass-map.js` displays the 32 published Guide units and all 96 source text blocks with original identities and existing Guide commentary.
- **Study by subject**: eight `MF01`–`MF08` titles and summaries are projected directly from `data/learn/mass-formation-campion.v1.json` by `src/learn/mass-study-paths.js`, and launch their existing `learn.mass` owner. P1 does **not** rewrite the lessons or their evidence.

The originating study position, whether a Mass Map stop, precise prayer block or themed lesson, must survive the trip into the existing Scripture reader or Formation course and return in context.

## Demonstration path and source authority

| Step | User-visible behaviour | Source owner | Boundary |
| --- | --- | --- | --- |
| Open Formation | Choose **Understand the Mass** | Existing `learn` shell / `learn.mass_explorer` | Not the Mass reader |
| Mass Map | Jump to Offertory `AO.CARD.010` | Published 32 Guide registry | Not a new 48/65-card ceremonial owner |
| Original prayer | Select `AO.SM.B031` (*Suscipe, sancte Pater*) | Published Sung corpus and French by-cue witness | Do not generate a generic Proper or editorial translation |
| Explain | Read the original Guide context, by section | Published Guide `short`/`long` | Macro-level Guide is not separately approved claim for each microprayer |
| Thematic study | **The Offertory and your offering** `MF03` | Existing source-backed 8-stage Formation corpus | No P0 research import |
| Scripture | `MFS05`, Romans 12:1 (doctrinal parallel) | Existing Formation Scripture anchor and global Bible reader | **Not** a word-for-word attribution to `Suscipe` |
| Historical sources | Source drawer in `MF03`, Guide bibliography where supplied | Existing Formation source registry / Guide contextual link list | No certified historical passage claimed; browser links are bibliography, not an in-app full text |
| Return | Bible → MF03 → selected B031 / original Map position | Existing source owner and P1 return tokens | Exact selected source and study scroll/focus; never change reader ritual position |

## Current live/legacy user-facing owners
- `learn.mass_explorer`: P1 canonical **Understand the Mass** discovery destination (draft).
- `learn.mass`: eight-lesson original Formation course, **still accessible separately during transition** for deep links / content parity. Its older internal 32-moment Guide route is also preserved until the new Map can replace it without losing source review functionality.
- `data/presentation/guide-registry.v1.json`: one original Guide owner; used in both legacy and new entry paths.
- `data/presentation/reader-text-sung.v1.json`: original liturgical text owner; reuse, do not copy.
- `src/learn/mass-formation-scripture-context.js`: already curated independent Scripture relationships; use its exact relationship types.
- Mystery of the Mass manuscript / Ultra Master research: **not a public P1 content owner**. No standalone Mystery route is assumed here. If the separate editorial pipeline clears content, ingest by reference, not duplicate a public source.

## Public navigation consolidated (16 October 2026, follow-up)

- `Formation → Mass & Liturgy` now shows only one Mass-study card, **Understand the Mass**. `learn.mass` stays registered with its original eight lessons/24 bilingual sourced claims, but is no longer duplicated as a second family-level card or generic search result. Original content-specific links remain valid.
- `learn.mass`'s public “Explore the Mass in order” control now opens the canonical `learn.mass_explorer` Map. The original `view:"moments"` / `momentKey` deep-entry path and source-review mode retain the old Guide browser for historical parity and reviewers.
- This is **link consolidation**, not deletion of the old content or new research certification. The P1 test `tests/mass-study-consolidation-parity.mjs` compares all original 32 Guide moment identities, 96 source blocks, all eight lessons/24 claims, certified Scripture-link identities and legacy deep entry. The phone suite tests both public redirect and explicit legacy entry.
- Source reading remains deliberately scoped to the already functioning in-app Bible owner and the existing claim-level Formation source drawer. Contextual Guide bibliographies are external document links **without certified excerpt text**; no arbitrary PDF/website prose is pulled into app reader or labelled liturgically normative.

## Document and source context — original records only (16 October 2026)

- The existing MF01–MF08 Formation **Sources** disclosure retains the same source-index hyperlinks and complete claim-by-paragraph evidence. For sources actually cited in that lesson, it now also offers a separate **View source context / Voir le contexte documentaire** action.
- `src/learn/mass-source-reading.js` renders an in-app bilingual **documentary context** screen: original document title and source ID, existing registry authority/role, which **specific original lesson claims** cite this exact document, and a safe link to the recorded source URL. It does not manufacture a new document excerpt, historical quotation or independent authority status.
- Demonstration in `MF03`: `SRC-MEDIATOR-DEI` is linked to original claims `MF03-C02` and `MF03-C03` but **not** `MF03-C01` (whose witness is `SRC-MR62`). `SRC-CAMPION-1954` is linked only to `MF03-C03`. A work present in the global registry but uncited by MF03 cannot be opened as if it supported that lesson.
- The source-context view is optional, only inside Formation: it temporarily makes the underlying lesson inert and restores **the same lesson scroll position, source-button focus and source disclosure** when closed or Escape is pressed. It reuses the original vocabulary/provenance, does not affect native Mass, and does not navigate to a different Formation route.
- Source URLs continue to open the original external site (no in-app re-hosting), with explicit warning that title/link alone does **not** certify a passage, edition or reproduction rights. The Scripture owner remains the sole in-app full biblical passage reader. Full historical documents/excerpts remain on **hold** pending the separate textual and rights/certification process.
- Acceptance: source-context contract `tests/mass-source-reading-contract.mjs`, the complete Map → MF03 → Bible → Mediator Dei context → original lesson → selected prayer phone journey, and bilingual source-document screenshots in `tests/source-reference-browser-acceptance.mjs`.

## Source-passage publication gate — display only; no textual certification (16 October 2026)

P1 now supplies an **optional rendering contract**, not a second approval authority, in `src/learn/mass-passage-publication.js` and `data/learn/mass-formation-approved-passages.v1.json`. The shipped register has `status: NO_APPROVED_PASSAGES` and `entries: []` — **zero historical passages are released or rendered**. The Formation source-context viewer remains useful through original source identities, claim associations and existing external links even when the manifest is absent or inaccessible.

For a later explicitly editorially approved excerpt to appear, **every** release gate must hold:

- The entire manifest must be uniquely versioned, `scope: FORMATION_ONLY`, `status: RELEASED_FOR_FORMATION`, with a release identifier, human reviewer and approval date. It must never be derived automatically from a P0 research status, a source URL or a draft claim.
- Every entry must have an identified **exact passage, locus, edition and edition URL**, a declared language, a source ID present in the existing Formation registry, a specific MF01–MF08 lesson, and at least one claim ID **already linked to that same source** in the original lesson. This is for contextual display; it is not permission to revise those claims.
- Every entry must carry an explicitly approved publication decision, a human reviewer and date, a reproduction basis (`PUBLIC_DOMAIN`, `LICENSED`, or `PERMISSION_GRANTED`) and a separate safe URL documenting that rights basis. An incomplete or corrupted manifest fails **closed across all entries**; no text is published.
- Excerpts are displayed only inside the Formation **source context** drawer as clearly labelled document extracts, separated from the course's own explanatory claims, with independently accessible edition and rights links. Exact text is HTML-escaped; no auto-generated French translation or invented Latin text is allowed.
- A human source/editorial review is **still mandatory**: a syntactically valid JSON field or passing P1 test does not itself authenticate wording, an edition, a theological attribution or the legal rights declaration. The P0 research pipeline retains evidence/certification ownership, and approved *release* decisions must be separately adopted into this source-of-truth manifest.

The non-browser `tests/mass-source-reading-contract.mjs` exercises a **purely synthetic in-test fixture** and rejection of draft, mismatched claim/source, missing rights/reviewer, unsafe URL, empty passage, duplicate identifier and forbidden ritual scope. The full 48-case phone/desktop browser acceptance also asserts no historical excerpt appears in the current released app state. **No manuscript material has been added here.**

## Unified Formation user journey — final interface pass (16 October 2026)

The public **Understand the Mass** destination now presents an immediate, deliberate choice between **Follow the Mass in order / Suivre l’ordre de la Messe** and **Study by theme / Étudier par thème**. These are two views of *one* original corpus architecture, not separate modules.

- **Chronology**: five-phase Map with 32 original published Guide moments and all 96 original Sung source-block destinations; the text index remains an alternative representation of this chronology.
- **Thematic**: one dedicated eight-lesson landing, MF01–MF08, with all original bilingual lesson titles and summaries drawn directly from the original Formation dataset. Users do **not** have to scroll through 32 Map moments to reach the course; the same lessons are no longer duplicated beneath the long Map or its text index.
- **Cross-path continuity**: the Map and thematic path retain their last in-session reading scroll; the published Guide moment and selected source block are not converted to a Mass-reader card. A direct Map source-block entry remembers **the exact block button** and expanded disclosure, rather than only its broader Guide moment. These are presentation return tokens only, and cannot change the ceremonial sequence.
- **Study round trip**: selecting MF03 within a prayer article or from the thematic path uses the *existing* Formation owner, then the canonical Scripture reader and optional source context; closing restores the original study view, selected paragraph, open citation drawer, source-block selection, reader scroll and keyboard focus where applicable.
- **No new explanatory copy, source qualification or P0 decisions**. The standalone liturgical Mass remains a prayer-only companion; no direct Mass → Formation button is restored.
- **Acceptance:** the five-width Playwright Mass Explorer suite checks both paths, the French thematic titles, return from MF03/Scripture, expanded Map-source restoration, and switching paths without discarding scroll. All eight original lessons and cited-source relationships are preserved separately by P1 non-loss contracts.

The new UI is intentionally **draft/unmerged**. Hiding the historical Guide route, changing owner content or releasing excerpts still requires separate editorial parity and release review.

## Initial P1 release boundary and non-loss retirement gates

This release is **an initial Formation interface consolidation**, not a claim that the separate historical Mystery and unpublished Ultra Master material has passed editorial certification. The P1 UI can be accepted without making any of those unpublished materials public or removing the old source-owner routes.

| Acceptance condition | Evidence / current decision |
| --- | --- |
| 32 original published Guide moments | Automated non-loss parity and live Mass Map/legacy deep-link browser contracts; original Guide owner retained |
| 96 original Sung text blocks | Automated check of every block ID, published title and published text/explicit Proper placeholder; no generic Proper substitution |
| 8 original Formation lessons and 24 bilingual cited claims | Existing course source owner retained; dedicated eight-lesson path, claim/source index and original deep links tested |
| Scripture and documentary reading return | Original Bible and source-reference owners retained; test of Offertory → Romans 12:1 → cited original-source context → exact origin, including focus, scroll and Map drawer |
| English/French and 320/390/430/768/1280 layouts | Dedicated Playwright screenshot and interaction suites, including 48 source-reference journeys; **automated evidence, not human aesthetic approval** |
| No P0 held-text leakage or Mass ritual-reader invasion | Published Guide and Sung/catechetical originals only; historical source-passage release register deliberately empty; no `src/mass/` changes |
| Further Mystery/short/long historical Guide manuscript parity | **HELD**. These materials are not retired, newly published or substituted. Their later incorporation remains a separate editorial/knowledge integration step |
| Human product/visual approval | **PENDING** before changing PR out of draft or merging |
| Current canonical main and CI | Merge current unrelated changes without overwriting owners; rerun required workflows on the final head |

**Release decision:** P1 may be presented for acceptance as a *complete interface slice*. The final merge is conditional on the current-head automated checks plus the user's visual acceptance. Even after merge, retain original legacy/deep-link/source content until a separate, source-backed non-loss retirement decision. Never label an automated manifest validation as authorisation of an edition, copyright licence, or the theological truth of an unverified source claim.

## Intentionally not implemented by P1
- New rubrical interpretations, miracle/historical research, P0 source-by-source certification, draft manuscript publication, source-ID consolidation, or alternate reader cards.
- A historical/third-party full-text reader for bibliographic pointers **without a verified authorised passage and rights/provenance**. The existing Bible overlay is the currently functional in-app source reading experience.
- Any in-Mass educational call-to-action.
