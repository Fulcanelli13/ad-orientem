# Visible Mass P6 — photographic continuity review

Status: **experimental offline prototype; no production deployment or merge**. User-visible single-file artifact: `The_Visible_Mass_P6_Photographic_Continuity.html` (approximately 23.5 MB, original photographic assets embedded). It is delivered in ChatGPT, not committed as a 23 MB binary-equivalent HTML source.

P6 builds on P5 without re-authoring objects, questions, Guide events or Mass Formation. It preserves original photo identity, source licensing, London versus Dublin venue separation, six photo-specific sanctuary hotspots, 32 certified Sung Guide moments and eight Formation stages.

The P6 presentation changes are: source-labelled transitions between genuinely distinct photo viewpoints; pose retention scoped to the *exact* still photograph or 360-degree scene; a source-credited authentic Mass photograph overlay returning to the same underlying Guide; reduced repetitive marker animation; reduced-motion support; and a compact mobile scene/controls ribbon with a direct original-photo/attribution link.

There is no interpolated 3D walking, false camera geometry, fabricated liturgical gesture, ceremony at Brompton inferred from a separate church photograph, cross-scene object-coordinate transfer, or modification to the 48-card LIVE reader.

Source companion: `photographic-p6-continuity.mjs` exposes the nine known photographic viewpoint identities, provenance validation, exact-scene camera-memory rules and noninferential transition classification. Its contract test: `tests/visible-mass-p6-continuity.mjs`. The offline HTML contains the equivalent local standalone controller; neither file imports another doctrinal source. These changes are in draft PR #1309 only.

Local browser tests: on Chromium desktop 1280x820 and mobile emulation 390x844, pass view return for original 360 yaw/pitch/FOV and sanctuary still zoom/x/y; six hotspots; Communion rail -> certified Sung Guide -> genuine separately labelled photograph -> exact Guide return -> Formation -> object return; Mass Map 32 moments; no uncaught errors. The tests were run with a small structurally identical fixture and repeated on the full offline HTML with real embedded photographs for London panorama, sanctuary inspection and Communion photograph. Screenshot review triggered a mobile footer/viewpoint control correction that was rerun successfully.

Not verified: actual-device GPU texture orientation, native phone performance and six marker finger-position approval, photographic publication rights review, English/French parity, direct live source loading instead of offline text snapshots, or publication of any provisional object-to-action edge. Preserve the draft/unmerged state until these acceptance gates close.
