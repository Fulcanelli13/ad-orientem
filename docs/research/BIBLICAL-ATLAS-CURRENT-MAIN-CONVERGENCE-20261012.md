# Biblical Atlas — current-main convergence, 12 October 2026

## Integration owner
This branch was created from the current production `main` at `33783c7c0043053449cd7b22f97be99255d153f6`. It selectively transfers the **151-event / 11-era** source corpus, canonical Bible-context actions, 35 source-qualified geographical anchors and interactive horizontal timeline from draft PR #998. It does not transplant old, conflicting versions of the Explore shell, map runtime, sacred places, Shrine profiles or illustrated guides.

Sources:
- [PR #998 — production candidate Atlas](https://github.com/Fulcanelli13/ad-orientem/pull/998)
- [PR #1010 — 181-scene cinematic design exploration](https://github.com/Fulcanelli13/ad-orientem/pull/1010)
- [PR #1018 — genealogies, lineage, apostolic dispersion, source and 151↔181 crosswalk](https://github.com/Fulcanelli13/ad-orientem/pull/1018)
- [PR #923 — original OpenBible/STEP source acquisition](https://github.com/Fulcanelli13/ad-orientem/pull/923)

## Product boundary
- New Atlas remains a view inside **Explore → More → Biblical Atlas**. Not a top-level destination, and not a substitute for the original Sacred Geography.
- It reuses `src/find/map-runtime.js` and the existing Scripture overlay `data-ao-scripture-context` action.
- Current main's latest Explore source, sacred place guide loaders and renderer remain intact; `allowEmpty` changes only the initial zero-pin Atlas case.
- 151 named milestones are **editorially selected, not an exhaustive 73-book biblical chronology**. Contested or unlocated scenes have no manufactured GPS pins. The 35 map anchors are provenance-qualified; publication requires further historical review.
- Genealogy source claims do **not** automatically become production relationships or travel routes. The 3,231-person bulk database remains a search-only research index; only 90 Genesis source-linked statements and separate Matthew/Luke lineage evidence have undergone targeted editorial extraction, with Vulgate/Crampon variant holds.
- The 181-scene cinematic demonstration is an alternative design sequence, not a replacement of the protected 151 events. Research crosswalk from #1018: 65 exact-reference, 29 passage-overlap and 87 unmatched design scenes; 86 source milestones lack exact design equivalents.
- Apostolic Dispersion: 20 editorial profiles and 55 entries in #1018; Scripture, patristic evidence, later tradition and holds must remain distinct.

## Release gates
1. The new CI must pass native Scripture context, no fabricated geolocations, all 151 items, and fresh mainline Explore UX/phone acceptance. Until it does, PR remains draft and is **not shipped**.
2. A textual-critical verification of Matthew and Luke as separate source lineages (incl. Jeconias, the second Cainan, St Joseph as legal/putative father, maternal relations) must happen before a genealogy page appears in app.
3. Only approve native genealogy navigation after reviewing the already working offline prototype in #1018, and avoid wholesale importing the old OpenBible/STEP corpus into the shipped bundle.
4. No automatic copying of the 181 expanded prototype's route lines or exact ancient geolocations; disputed Exodus routes especially withheld.
5. After successful regression and reviewer acceptance, close old #998/#1010 as superseded by the current-main convergence; keep #1018 as source research until genealogy certification is done. Do not merge speculative research merely to clean the PR list.

## Testing
`tests/explore-bible-atlas-timeline.mjs` and `tests/explore-bible-atlas-phone.mjs` were ported from #998. Their current-main execution is governed by `.github/workflows/biblical-atlas-current-main.yml`. The pre-existing Explore R53/R54 suites must remain green. Until workflow results are available, do not claim they passed on this new branch.
