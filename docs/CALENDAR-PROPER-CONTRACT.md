# Calendar and Proper contract — Wave 1 / B004

LiturgicalDay and Proper are separate pure-data objects.

resolveDay(date) resolves the liturgical day, occurrence/concurrence, candidate formularies, rank, colour and commemorations. Proper retrieval then resolves the selected formulary's ordered texts and appointed readings.

A valid LiturgicalDay does not imply that its Proper is available. The app must preserve the day and expose an explicit unavailable Proper state when the exact source/cache cannot supply the selected formulary.

Rules:

- RG60/MR62 are normative; a digital provider is a data source, not liturgical authority.
- rank and colour are resolver outputs; never infer them merely from a saint category or devotional calendar.
- a cached Proper may be used only when it matches the exact date/formulary/source contract.
- stale data may not be relabelled for a new date.
- missing Proper never falls back to fabricated generic Feria content.
- the fixed Ordinary may remain usable when the Proper is unavailable.
- multiple legitimate formularies are date-scoped choices; an invalid saved choice may fall back only to another valid candidate for that same resolved day.
- Coming Up must call the same day resolver for future dates; it must not maintain an independent feast list.

Implementation: src/calendar/contracts.js.
