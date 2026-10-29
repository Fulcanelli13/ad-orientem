# Prayer B33 — Novena source-witness reading continuity

29 October 2026 · bounded source-preserving reader correction.

## Observed bug
`src/pray/novena-runtime.js` re-renders the whole Novena reader on `data-n1-show-en` and executes `m.scrollTop=0` and a first-control autofocus on every render. Switching between a French prayer and the sourced English historical witness therefore jumps to the beginning and loses the selected control. This is not an intended day/chapter change. With long day-specific historic texts it makes the English comparison effectively unusable.

For English-only 1887 Holy Face material, the first French-unavailable notice offers an English witness button, but after switching the English view has no reverse button.

## Change
- Capture the source-text block index (not the translated text), its viewport top, exact scroll host (the nested `.aoDevoCardScroll` or the Pray mount), and scroll offset before switching.
- Render the same stage/day, then restore only that block's anchored position and focus to the *new* source-language button after the shared sequential adapter mounts. Don't restore scroll for actual navigation between days or devotional chapters.
- Keep a reversible witness control for text with verified English but **no historical French**. Returning to French displays the original honest unavailable notice; do not fabricate a translation.
- Preserve all original 16 novenas, English/French source statuses, nine-day sequences, historical qualifications, canonical prayers, navigation rail and reader architecture. No visual asset, CSS baseline or new module.
- Restore focus using `focus({preventScroll:true})`; do not scroll the whole window or steal focus to the first generic control on a witness change.

## Acceptance
`tests/pray-novena-witness-contract.mjs` runs under existing `npm run test:pray-novenas`, and a dedicated phone workflow exercises 320px and 390px Chromium journeys: French/English bilingual source witness in a historical nine-day text, same stage and viewport position, focused witness control, and reversible English-only 1887 Holy Face witness with correct unavailable-French notice. No horizontal overflow or JavaScript errors.

**Release:** merge only with successful required main and phone workflow. This is a single usability bug, not the start of further corpus acquisition or a claim that every devotional reader is visually approved. Next steps belong to actual screenshots/readability evidence, not more research inventories.
