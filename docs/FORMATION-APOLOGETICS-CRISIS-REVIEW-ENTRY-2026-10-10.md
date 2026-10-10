# Formation: Apologetics and Church Crisis — review-entry integration

10 October 2026 · editorial review branch · **unpublished**

## Purpose

Make the existing **60 Apologetics** and **81 Church Crisis** canonical dossiers directly browsable in Formation **for editorial review**, without falsely converting 141 unfinished source-linked articles into certified public Formation modules.

The branch adds a review-only pair of cards beneath **Formation → Questions & Debates**, using the existing source-of-truth `formation-recovery-review.js` reader rather than creating a second question bank. It does not add `learn.apologetics` or `learn.church_crisis` to the published 15-module Formation registry. Production navigation remains unchanged until theological, French editorial, and paragraph-level original-source acceptance.

## How to use on an app build with this branch

1. Append `?aoFormationReview=1` to the app URL (or `&aoFormationReview=1` if another query already exists).
2. Open **Formation → Questions & Debates**.
3. Select **Apologetics (60)** or **Crisis in the Church (81)**.
4. Browse the filtered canonical dossier list; search question titles/IDs or filter by thematic family.
5. Open a question for the existing bilingual draft synthesis, opposing arguments, Catholic response, original-document links and recovered source-bank details. Back returns to the index, then to the precise Formation entry. Focus is restored to the launching card.

The earlier explicit source QA entry `?aoFormationRecoveryReview=1` remains supported, with the combined 141-dossier view and 123 research-record inspection.

## Publication and source integrity

- 60 Apologetics and 81 Church Crisis canonical titles remain fixed; no new topics or duplicate owners.
- All 141 canonical source-first syntheses and the 123 independently indexed research entries remain **unpublished drafts**, without revised doctrinal text.
- All source hyperlinks are loaded from the existing canonical source registries; the reader never invents a missing source or upgrades link presence into source-text certification.
- Explicit draft status and review warnings remain visible.
- English canonical title fallback is retained if the registry has no approved French title; categories and interface copy are bilingual, and underlying draft argument text is EN/FR.
- No Mass, Scripture or Calendar source/reader changes and no change to Sexual Ethics provenance dispute `CSE038`.

## Acceptance checklist

- Normal Formation URL: Apologetics/Church Crisis preview cards are absent; published modules unchanged.
- Explicit reviewer URL: exactly two preview cards visible under Questions & Debates in EN and FR.
- Selecting Apologetics shows APOL dossiers, never CR; selecting Crisis shows CR dossiers, never APOL.
- Thematic-family selector is scoped to the selected corpus; typed search filters its current selection.
- Sources are clickable `https://` original-document references; unresolved IDs are conspicuously labeled.
- Dossier Back preserves collection and search context. Closing review returns keyboard focus to the launcher without navigating away from Formation.
- Telephone: test 320–440px viewport, swipe scroll, large taps, search focus and Back/Home, overlay stacking above Formation but below system UI as appropriate.
- Do not merge or remove the gate before independent substantive/primary-source, attribution, and native-French approvals. Existing original A/C question recovery deficiencies remain real, and must not be erased by canonical-title drafts.

## Automated regression coverage

`tests/learn-owner.mjs` validates the default hidden state, exact query flag parsing, bilingual editorial cards and stable published Formation layout.

`tests/formation-recovery-review.mjs` validates 60/81 source corpus scoping and the thematic selector, in addition to its existing 141-dossier source/HTML integrity assertions.
