# Mass module — top-level navigation and Tenebrae LIVE (11 October 2026)

## Product architecture

Mass is a **first-class navigation destination**, like Calendar. Fresh Mass tab/shortcut navigation now opens `#ao-mass-modular-root`, a single Mass domain with the visual grammar of the native LIVE reader: compact top ribbon, contextual second ribbon, thin progress line, sacred typographic focus, liturgical colour-aware variables, and mobile-tappable controls. The old transient preflight **does not own the initial Mass landing screen**.

The landing includes (1) the actual calendar Mass identity and Proper source when resolved, (2) **Low / Missa Cantata simple / Missa Cantata incense / Solemn** form choice, (3) **LIVE / Simple / Missal** reader mode choice, (4) six **actual Mass / Proper** category routes, (5) Tenebrae as a distinct Office within Mass. The six categories are Mass of the day, Votive, Requiem, Nuptial, Special liturgy, and Other Proper (source feast date, including authorized local external solemnities). The user can enter the source-owned preflight from any Mass category. Each Mass category preserves its original rubric/Proper resolver; there is no arbitrary Mass text substitution or independent local-indult claim.

The source-owning historical **preflight remains the backend** for detailed actual Mass/Proper choices. The hub's selected form and reader mode are applied through `AO_R17_BROWSER_ENTRY.configure` before the user begins. The 48-card native R17 LIVE reader is unchanged and dismisses the Mass landing at entry. Existing resumption reopens the certified native reader rather than sending an active Mass to the hub. Home closes the hub cleanly.

## Tenebrae within Mass

The Office of Tenebrae is **not** represented as a Mass or as a Requiem. The Mass hub has its own `Tenebrae · Matins and Lauds` entry and a **LIVE-style Office reader** under the same sacred design system.

- Three Holy Week days: Thursday, Friday and Saturday. Matins **32 exact sourced sections** and Lauds **10 sections** per day, using `src/pray/tenebrae-1960.js` and the original cached local trilingual 1960/61 Roman Breviary files.
- Modes: LIVE and Simple present one focused text at a time; Missal presents Latin + English/French columns (stacking safely on narrow phones). LIVE includes the usual contextual ribbon, progress and section jumping.
- Text switching: tap the focused text to **replace** Latin with vernacular or vice versa; no translation is added underneath. Chanted psalms/versicles/responsories default to Latin; readings and silent prayers default to vernacular, with their original Latin retained for switching.
- No fictitious priest-position rail, Eucharistic elevation or Mass Schola. No automatically imposed older fifteen-candle ceremonial. The source remains Divinum Officium's locally integrated MIT-licensed corpus; critical printed-edition collation and local Tenebrae customs are not yet certified.

## Acceptance and release limits

`tests/mass-hub.mjs`: actual categorical identity, Tenebrae default Latin for chant and vernacular for reading, replacement semantics, no false priest/schola, critical collation flag, source-backed routing.

`tests/mass-hub-phone-e2e.mjs`: real 390px navigation into Mass, no old preflight or R17 reader opened prematurely, all six Mass choices, four forms and three modes, Tenebrae day/hour/translation/parallel-missal stages, no remote office fetch, Home close, no horizontal overflow.

Existing R17 form/Proper/rite integration, full Mass phone, app-shell navigation and visual acceptance remain mandatory. **Further UI convergence:** detailed source-owned preflight categories and their niche rubrical forms still have donor DOM behind the hub. They should ultimately be presented in this same LIVE-style module; this change does not certify them as fully migrated, nor does it mark all worldwide Propers as complete.
