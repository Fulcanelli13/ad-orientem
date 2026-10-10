# Unified Mass module — actual celebration, source Proper and form

Date: 10 October 2026. Production branch: `main`. Implementation in `src/mass/browser-entry.js`, `src/mass/full-mass-preflight.js` and `src/mass/observed-mass-{selector,source}.js`.

## User-facing contract

The app Mass route has **one** Mass preparation surface. Before starting a Mass the faithful chooses independently:

1. **Actual celebration** — Mass of the day; Votive; Requiem; Nuptial; Other, delegated to the existing source-owning celebration/rubric resolver.
2. **Different actual Proper** — an additional category in that same surface. Find a liturgical source date, verify the resolved name/path, select the correct Sunday commemoration if the actual date is Sunday. The real date stays unchanged.
3. **Celebration form** — Low, Missa Cantata without incense, Missa Cantata with incense, Solemn. These are **not** different Mass Propers; one common source-owned Proper serves the actual chosen form.
4. **Rites really taking place** — Asperges, particular preliminary blessings and processions, Requiem Absolution, or post-Mass action only when allowed by the source. The calendar date never switches on a procession by itself.
5. **Reader mode** — Missal, Simple or Live (separate from Mass form); R17 owns the native 48-card LIVE product presentation and its dedicated Low/Solemn source-driven cue-state engines.

The preparation screen adds a compact **Review Mass and Proper** disclosure. It exposes the effective date, actual celebration, form, source path, source feast date, Sunday commemoration status, and counts of Collects/Secrets/Postcommunions when present. The alternative Proper is attached to the effective legacy/reader preparation object so that the review and the actual R17 reader agree; no stale host Sunday Proper is shown as the selected one. These are all **session choices**, not edits to the canonical calendar.

## Source and rubrical boundaries

The Other Proper category is **observational**, not blanket authorization for any formularies on any date. If the actual parish Mass is an authorized external solemnity, the right feast's texts can be followed, and any Sunday commemorations are explicitly chosen from the actual date's resolved source. The app marks permissions **not independently verified**. Certain Masses require their own particular resolver and may not be arbitrarily replaced: a distinct Good Friday liturgy or Easter Vigil and Requiem/Nuptial with ceremony-owned Propers. A language switch invalidates a prior selection so that incomplete French text cannot silently pass an earlier English readiness check.

The existing authoritative calendar, Rubrics and DayResolver remain unchanged. Missing Propers/vernacular translations are not fabricated. No 1954 Campion gesture is a universal 1962 rubric; no pending icon master is silently activated.

## Acceptance

- `tests/observed-mass-source.mjs`: October 2026 and 2027 Rosary, another feast date, language gate, actual Sunday orations, source-day commemoration isolation, effective selected Proper in preflight, Good Friday/Easter Vigil/Requiem/Nuptial source locks.
- `tests/full-mass-preflight-phone-e2e.mjs`: 390px phone, single parent panel with six actual Mass choices, source-date route opening inside panel, real Roman Sunday + alternate Rosary Proper, 2/2/2 orations visible in review, no choice leaked into another date, four forms, special-rite categories, and reader special-stage compatibility.
- The complete R17, phone/browser, app-shell and visual acceptance workflows must pass before merge.

## Remaining content work before universal sign-off

The application still requires complete proper-source/translation certification for all dates and languages, canonical rubrical adjudication for external solemnity/local calendars, review of 17 pending source-icon bindings (plus three station identity variants), and final manual real-rite acceptance. This merge closes **unified navigation and selection**, not those independent audits.
