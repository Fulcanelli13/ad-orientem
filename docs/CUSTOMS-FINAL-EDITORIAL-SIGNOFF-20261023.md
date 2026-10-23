# Customs — final bilingual editorial acceptance gate
23 October 2026

The 35 published custom articles have complete EN/FR text and source-level reviews. **This does not equal a final human approval** of every translation or historical claim. The existing `data/customs/calendar-copy-acceptance.v1.json` separately accepted the publication scope of 24 earlier Calendar entries; it is not a complete final signoff of all 35 bilingual folios.

This PR introduces `data/customs/editorial-final-acceptance.v1.json` as a **pending final human signoff registry**, no approvals pre-filled. It contains 35 records, 13 scope-critical and 22 standard. Each has three distinct dimensions: English, French, and historical/ritual claims. All decisions are `PENDING`, with no fake names, dates or SHA-256 approvals.

## Review procedure

Run `node tools/customs/export-final-editorial-review.mjs > customs-review.md` in the repository. The generated packet shows **all eight published EN and FR text fields**, current article sources and contextual witnesses, the earlier research claim boundary, the single most relevant reviewer question, and separate current text SHA-256 fingerprints for English, French and historical claims.

Start with the **13 CRITICAL_SCOPE** articles: Advent wreath, manger straw, Posadas, St Joseph's Table, St Blaise, St John's wine, post-childbirth blessing, Holy Thursday repose visits, Rogation family walk, votive candles, general pilgrimages, Candlemas household candles and Mary Gardens. The other 22 are a shorter standard review tier, not an automatic approval.

A responsible human reviewer records each actual decision and identity/date with the precise current-text fingerprint. The test rejects unsupported approvals, stale fingerprints, missing reviewers, and promotion of research-only/context-only identities. Any text change invalidates approval for the altered dimension. `CHANGES_REQUESTED` requires an explanatory note; it never opens the release gate.

## Unresolved evidence limitations

The original 2022 Strasbourg site still returns HTTP 502 directly. Its indexed text remains recorded, while an accessible Diocese of Metz December 2024 account corroborates an actual local St Nicholas children's visit. Likewise, individual ex-voto miracle reports and art rights, parish schedules, and historical book-edition equivalence are not certified beyond their published caveats. These **specific uncertainties can be accepted as cautions**, not silently promoted into asserted facts.

This gate changes **no public Calendar UI**, no 1962 liturgical date, rites, 35/3 publication status, Mass reader, source registration, or local event availability. It also does **not** force a new human-review meeting now: it establishes a complete exact-copy review surface and a fail-closed signoff method when the user chooses to finalize.
