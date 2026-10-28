# Stage C — native special-rite music in the Schola dock

The source-validated registry (`data/research/mass-special-rite-music-events-20261019.v1.json`) already declares **47 music events across ten distinct native rites**. This feature does not invent a new Mass or ceremony.

`projectSpecialRiteMusicItinerary` uses **the native controller's actual ordered stage IDs** together with that existing registry and its pinned source payload. It exposes the expected music *at the current stage* and a tentative next music event in **rite order**. It does not transfer the independent Schola ticker, move a stage, infer that any choir is singing or copy a word of the original rite's chant text.

Supported source owners: Asperges/Vidi aquam; Palm; Candlemas; Rogations; Corpus Christi; Holy Thursday post-Mass; Requiem Absolution; Good Friday; Easter Vigil. Generic procession explicitly retains `SOURCE_HOLD` with **no invented chant**. Ash Wednesday currently has no indexed special-music event in this authority and receives no manufactured one.

## Branch safety
- Ordinary `Asperges me` and Easter `Vidi aquam` never appear together; without verified formula context neither is forecast.
- Optional `In paradisum` is absent unless the burial procession was explicitly selected.
- Easter Vigil in-church vs separate baptistery branches filter their own stage IDs, and the Mass handoff stage has no inherited ceremony music.
- Good Friday's death pause and rite-ending silence suppress both active and anticipatory labels. A `SOURCE_HOLD` generates no visible chant.
- The special events appear in the **same bottom Schola dock** in LIVE, SIMPLE and MISSAL modes, but with static `EXPECTED · RITE MUSIC` and `NEXT` information. No Schola phrase controls, progressive ticker, organ permission guesses, custom programme edits or duplicate central prayer text.
- When a native pre-Mass or post-Mass ceremony hands back to the Mass, its forecast disappears. The ordinary Mass's independent Schola timeline resumes only from the existing Mass source.
- The 1958 instrument-permission layer remains separate: predicted chant does not imply organ permission.

The regression suite `tests/reader-schola-special-rite-itinerary.mjs` checks native ordering, all 47 indexed events/alternatives, optional condition gates, exact source references, Good Friday silence, Asperges handoff, and absence of new chant words/score imports. The source registry and native controllers remain untouched.
