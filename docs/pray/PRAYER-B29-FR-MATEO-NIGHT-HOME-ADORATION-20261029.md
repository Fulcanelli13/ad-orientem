# Prayer B29 — Fr Mateo's Night Adoration in the Home
**29 October 2026 · AO-AQ-066 · one existing Adoration mode, not a new Prayer module**

## Source, scope and proper ecclesial distinction

Historical witness: [Night Adoration in the Home — Fr Mateo](https://sensusfidelium.com/2020/03/21/night-adoration-in-the-home-fr-mateo/) (modern online transcription of a historical English devotional booklet, with Pius XI-era correspondence conveyed by Cardinal Gasparri 4 April 1929 and Cardinal Pacelli 25 October 1930, and with later printing context).

The practical suggestions describe a **voluntary** monthly family/household hour of night prayer in reparation to the Sacred Heart, typically **9 p.m.–6 a.m.**, with individual members taking turns or praying together. The historical document states that the promise does **not** bind under pain of sin. It recommends an image of the Sacred Heart at home (if available), a crucifix, prayer for the Church and family, five Our Fathers / Hail Marys / Glory Bes in one intercession, the Eucharistic intention, optional spiritual Communion, the Act of Reparation by Pius XI, and a prayerful conclusion. It also contains a *long 1944 devotional dialogue*, historical enrollment procedures and historical indulgence language.

**These distinctions are binding for Ad Orientem:**
- A Sacred Heart **picture at home is not Eucharistic real presence**. The app never labels the family image as consecrated/exposed Blessed Sacrament, or represents a private prayer as Benediction.
- Eucharistic adoration *in spirit* and spiritual Communion remain different from physically attending the tabernacle or receiving the sacrament.
- The programme is a **source-directed practical companion with original Ad Orientem EN/FR directions**. It does **not** copy the booklet's extended and potentially copyrighted literary dialogue, nor present simulated “Jesus speaking” text as revelation.
- The source's historical indulgences and membership rules are not presented as valid present-day privileges, certifications or enrollment. No subscriptions or contacts, €0.
- The historical hour, nighttime window and monthly cadence are **contextual**. There is an opt-in 60-minute timer only; no time gate, automatic completion, forced 9 p.m. start, time enforcement, family tracking or public Calendar modification.

## Implementation — existing Adoration family

Open **Pray → Adoration & Visit → Guided forms and Eucharistic prayers → Night Adoration at Home · Fr Mateo**.

Six quiet, horizontally navigable cards using the **same** dual-axis reader (vertical local prayer focus, horizontal page changes). Each uses existing complete canonical prayers from the original 48 Prayer bank:
1. **Prepare the home** — privacy, optional Sacred Heart image/crucifix; Sign of Cross and Act of Faith.
2. **Unite with Christ** — spiritual union with tabernacles in churches; private meditation on the Mass Canon is a recommendation, **not lay impersonation of the celebrant**; use existing prayer of adoration.
3. **An act of reparation** — original 1962-oriented Pius XI **complete** canonical `sacred_heart_short_prayer` (a historical full Act despite its legacy ID) and Act of Contrition.
4. **Family and Church** — canonical Our Father, Hail Mary, Glory Be; original directions invite five repetitions each, no 15 duplicate prayer strings.
5. **Spiritual Communion** — canonical Spiritual Communion, properly labelled non-sacramental.
6. **Entrust the night** — canonical Act of Love and Sign of Cross, voluntary final silence.

Original source URL and clear source/rights disclaimer live in the **reader**, not just a developer ledger. Source: `src/pray/night-home-adoration-b29.js`; responsive design: `src/pray/night-home-adoration-styles-b29.js`. `src/pray/presentation-runtime.js` adds **only** `ADOR.mode='night'` and `ADOR.nightStep` within the existing Adoration route; the old `visit`, `open`, `holy`, `four` and `treasury` modes stay as before. Existing timer and dual-axis adapter are reused. No new top-level route, external content fetch, costly service or separate Calendar.

## Acceptance requirements
- Immutable 48 canonical Prayer IDs, 16 Novena IDs, and complete Pius XI Act of Reparation.
- `tests/pray-b29-night-home-adoration.mjs` in required `test:pray-owner`: exactly six correctly ordered source-guidance stages in **both English and French**, reuse of genuine original Prayer bodies, home-sacramental distinction and history/indulgences qualifiers.
- `tests/pray-chaplets-discovery-phone.mjs` at **320px and 390px**: enter real Adoration chooser, open new option, card timeline navigation, home warning and source, canonical full Reparation and spiritual Communion, optional 60-minute aid, no horizontal overflow, last-step exit to same chooser, no runtime JS errors.
- Exact-head required main gate and Prayer-first phone acceptance must pass before merge. Production status must be verified by exact Vercel merge commit.

## Closure and future conditions
B29 moves **AO-AQ-066** to **functional source-directed home-companion covered** without pretending that the 1944 book is imported verbatim. Historical original-page facsimile collation and editorial rights assessment matter **only if** republishing the full original text is later considered; they do not block this existing-prayer guidance release.

The remaining lower-ranked distinct chaplet candidate **AO-AQ-029 (Little Crown of the Infant Jesus)** is a separate editorial decision; it should not be bundled into this Fr Mateo release.
