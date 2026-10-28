# B11 — Preparation for a Good Death: direct purpose-based prayer choice

28 October 2026. Follow-on to merged B08 Morning/Evening, B09 Communion and B10 Adoration. This is a non-sacramental, private devotional treasury, not an emergency checklist or a required nine-part rite.

## Original prayers and purposes

Retain the nine existing prayer cards, unchanged and in their historic reader order:
- St Joseph: Litany of St Joseph, `Ad te, beate Ioseph`, Memorare to St Joseph. Three **distinct whole prayers**, not different versions of the same litany.
- Faith, hope and charity: three **distinct theological acts**, not interchangeable wordings of a single act.
- Contrition: its own canonical complete Act of Contrition.
- Our Lady: the canonical Hail Mary.
- Short invocations: the threefold Jesus, Mary, Joseph aspirations from the existing vetted source.

A visible, compact five-purpose row and the selected purpose's one-tap whole-prayer buttons precede the original reader. This makes the existing prayer immediately reachable without 8 swipes. The existing nine-position timeline and vertical scrolling remain available as secondary navigation. A purpose change simply displays the source-owned prayer card, not an extra step.

## Historical editions and sources

The pre-2021 **1909 St Joseph litany sequence** remains the default with its precise source qualification. The separately selectable 2021 expanded form remains inside the same litany card. Neither is a newly added tenth source. Their original Latin/English/French and citation distinctions stay intact. No new source wording, translation, indulgence claims, or composition is made.

## Preference scope

Persist only validated canonical source IDs per purpose in `ao.pray.good-death-purpose.v1` (local device). Invalid, cross-purpose and invented IDs fail closed. The initial default stays at the first original St Joseph card and the historical 1909 litany; the 2021 edition switch is not silently substituted by saved source IDs. Saved choices are consulted when returning to a purpose, not injected into any other module.

## Pastoral and UI safeguards

Retain the **Someone may be dying now** shortcut immediately above the reader; it still opens the separate priest-first Dying Companion. Keep its order and pastoral warnings intact. There is no compulsory completion badge, sacrament simulation, timer, custom routine editor, another route, paid service, or hidden source list.

## Acceptance

- Index exhaustively covers the exact original nine source IDs and distinguishes separate theological acts.
- Choosing a purpose or prayer displays exactly the linked full original source, without inventing a composite, extra stage or non-devotional equivalence.
- Saved selection is per purpose and fails closed on invalid/cross-purpose IDs.
- Original nine reader IDs, vertical scrolling/horizontal swiping, source notes, 1909/2021 edition switch, EN/FR/LA and the urgent Dying Companion shortcut remain intact.
- Run the B11 unit contract, Prayer owner and real 390/320px mobile flows before merger. CI and production deployment must be verified separately.

Strict €0. Do not rewrite Mass, Sacred Art, the Office, or unrelated Prayer routes.
