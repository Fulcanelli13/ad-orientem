# Tenebrae — seasonal in-app reader implementation B11

**State:** Source-derived working PRAY reader for six Matins/Lauds views; printed-1961 Breviary text-critical certification remains open. Date: 10 October 2026.

## What has actually been implemented

The source-of-truth is still the Divinum Officium team, pinned at [commit `b9f8c8eb15d5`](https://github.com/DivinumOfficium/divinum-officium/commit/b9f8c8eb15d52b2b2c02e2ca24807cfaa73758f0). Nine previously recovered Proper files are now joined to **37 distinct Psalm/Canticle source files in Latin, English and French**, for a total of **111 additional preserved source leaves**, aggregated in nine local Psalm bundles (three per language). Upstream [MIT copyright/license](../data/pray/tenebrae-1960-source/LICENSE) remains present. No text request to the upstream website is necessary in the browser.

The six independently selectable reading paths are:

| Day | Matins Psalms (Vulgate) | Lauds II (Vulgate and canticle source keys) |
| --- | --- | --- |
| Holy Thursday | 68, 69, 70; 71, 72, 73; 74, 75, 76 | 50, 89, 35, `224` (Moses Exodus 15), 146, plus Benedictus |
| Good Friday | 2, 21, 26; 37, 39, 53; 58, 87, 93 | 50, 142, 84, `225` (Habacuc 3), 147, plus Benedictus |
| Holy Saturday | 4, 14, 15; 23, 26, 29; 53, 75, 87 | 50, 91, 63, `226(1–27)` (Moses Deuteronomy 32), 150, plus Benedictus |

Matins render **9 Psalms with repeated antiphons, 3 nocturn versicle pairs, 9 full lessons, 9 proper responsories, silent Pater, and the proper oration** (32 reading steps). Lauds render **5 Psalms/canticles with antiphons, versicle, `Benedictus`, `Christus factus est`, Pater and collect** (10 reading steps). The 1960 Sunday/weekday scheme and rubrics control the selected text. Source @references and selected 1960 substitutions are resolved rather than printed literally, including exceptional French text-source shortcomings; file absence, unseen references and empty language bodies fail closed. Latin/English/French share exact row IDs.

PRAY surface: **Penance and the Passion → Office of Tenebrae**. The existing owner `AO_PRAY_V435930` serves it; no new navigation root, no external reader, no general Divine Office or music feature. Three day buttons, Matins/Lauds switch, direct text steps with prev/next, Latin/vernacular toggle, historical/source notes, and the existing mobile PRAY back/home behavior.

## 1960 rubrical choices, not pre-1955

From the [1960 Code of Rubrics](https://www.divinumofficium.com/www/horas/Help/Rubrics/Breviary%201960.html): §§144–145 (Matins may be anticipated by good reason after 2 PM; Lauds belongs in the morning), §197 (Lauds II ferial scheme), §201 (omit Gloria Patri in the Triduum), §208 (omit Matins absolution/blessings), §230 (omit Gloria Patri and reprise the complete responsory in Passiontide), §246 (oration at end of separately said Matins, omitted when recited together with Lauds). The reading paths do not simulate pre-1955 candle extinction, hiding, or *strepitus* as prescribed current rites.

## Acceptance and textual holds

- `npm run test:reader-tenebrae`: all six office views in all three languages, correct Psalm source IDs, full lessons/responsories, zero raw `@`/`$`/`&Gloria` to users, suppressed obsolete variant instructions, local Psalter and French substitution recovery.
- `npm run test:tenebrae-phone`: actual 390px phone path, day/hour switch, source row navigation, Latin/vernacular toggles, locally loaded texts only, no horizontal overflow.
- No original photographed 1961/1962 printed Breviary page-by-page full collation. The output is **source-derived** from the 1960 library, not text-critically certified. Some shared Hour-ending/ordinary formulas still require comparison and may warrant further reader steps.
- A parish's traditional anticipated evening Tenebrae may reflect another historical custom; this app does not claim that ceremonial is mandatory under the 1960 books.

Acquisition history remains in [the original 9-file report](TENEBRAE-1960-TRILINGUAL-SOURCE-RECOVERY-2026-10-10.md); the machine status is [source registry](../data/pray/tenebrae-source-registry.v1.json). Previous Holy Week work is preserved; no Mass content was replaced.

**Next phase:** edition-critical printed Breviary collation and a visual quality pass, then Good Friday source-safe EN/FR translation promotion and remaining Mandatum antiphons. No re-transcription from scratch.
