# Customs — first-pass editorial certification of the 35 published articles

**Audit date:** 23 October 2026. **Branch:** `audit/customs-35-editorial-history-20261023`.

## Actual scope and disposition

- Exactly **35 PUBLISHED** canonical identities have a Calendar article. **3 CONTEXT_ONLY** identities remain outside Calendar article publication. There are **18 unpublished research identities** (four P2 provisional, fourteen restricted research master entries).
- All 35 articles were structurally checked for English and French title, description, history, meaning, voluntary practice, caution, occasion, and scope fields.
- Each of the 35 articles' source IDs matches canonical attestations and the current 108-entry source registry. No new source or custom identity was silently created.
- **11** P0/P1 articles had identical Description and History in both languages. These eleven histories have been replaced with independently worded, bounded contextual notes based on already attributed sources, with no invented antiquity, universal law or event schedule.
- **11** published claims now received targeted source-text checks, including direct confirmation and correction of Candlemas usage; the remaining **24** have a provenance crosswalk but have **not** had complete claim-by-claim original-text verification.
- Four independently verified institutional historical references are now registered in the **same source-registry file** under `historical_context_sources` (outside the original 108 customary attestation sources). The Calendar presents their links separately as Historical sources / Sources historiques for ADVT-001, ADVT-002, ADVT-003 and MARI-002.
- **0 of 35** are declared finally editorially certified. The article register is a first-pass gating instrument, not retroactive source approval.

Complete review notes and one explicit priority per custom: `data/customs/research/customs-published-35-editorial-first-pass.20261023.v1.json`.

## Highest-risk gates (13 P1 IDs)

| ID | Action before full signoff |
| --- | --- |
| LIFE-002 | Retain distinction between thanksgiving and purported impurity; verify ritual edition/scope |
| DEV-006 | Distinguish pilgrimage generally from changing local schedules and access-inconclusive links |
| DEV-010 | Separate votive practice from dated candle offerings or financial promises |
| DOM-011 | Confirm that linked Candlemas lexicon supports domestic keeping of blessed candles |
| BLSS-001 | Verify historical vs modern ritual text and distinct ministerial provisions |
| SJOS-001 | Source Sicilian origin independently of a 2026 US altar announcement |
| BLSS-003 | Traditional wine blessing, historical legend, non-Eucharistic status and parish choice |
| ADVT-001 | Cologne archdiocesan Wichern history is not yet in canonical source registry |
| ADVT-002 | Contemporary attribution to France does not establish old French provenance |
| ADVT-003 | Mexican Ministry of Culture documents contested Las Posadas origin; absent in canonical registry |
| HTHU-001 | St Philip Neri's seven Roman basilicas are not proven to be the origin of Holy Thursday repose visits |
| ROGA-001 | Private crop prayer walk vs Roman Ritual/official Rogation procession |
| MARI-002 | University of Dayton provides 1932/1951 garden chronology; not yet in canonical sources |

### Independently inspected institutional source witnesses (not all registered)

- [Cologne Archdiocese — Advent wreath origin and Catholic reception](https://www.erzbistum-koeln.de/presse_und_medien/magazin/Der-Adventskranz-Bedeutung-und-Ursprung-des-Adventskranzes/)
- [Mexico Ministry of Culture — contested Las Posadas accounts](https://www.gob.mx/cultura/articulos/54852)
- [UNESCO — Polish Corpus Christi flower carpets](https://ich.unesco.org/en/RL/flower-carpets-tradition-for-corpus-christi-processions-01743)
- [University of Dayton Marian Library — Mary's Gardens history](https://udayton.edu/marianlibrary/marysgardens/b/background-on-marys-gardens.php)
- [French Bishops — Chantelle patronal celebration](https://eglise.catholique.fr/conference-des-eveques-de-france/guide-de-leglise/dioceses/a-decouverte-dioceses-de-france/diocese-de-moulins/493837-abbaye-de-chantelle/)
- [French Bishops — Epiphany galette, poor person's portion](https://eglise.catholique.fr/approfondir-sa-foi/la-celebration-de-la-foi/les-grandes-fetes-chretiennes/epiphanie/426637-feter-lepiphanie/)
- [French Bishops — May devotion](https://eglise.catholique.fr/approfondir-sa-foi/connaitre-et-aimer-dieu/marie/499023-mois-de-marie-coutume-recente/)
- [Franciscan Ermitage — St Anthony's bread and 1890 Toulon revival](https://st-antoine.org/fr/sanctuaire/faire-un-don/loeuvre-du-pain-des-pauvres/)
- [Catholic bishops' newspaper — Holy Thursday visits](https://www.chicagocatholic.com/chicagoland/-/article/2026/03/18/visiting-seven-churches-on-holy-thursday-a-longstanding-tradition)
- [Sternsinger organisation — Germany's current Epiphany charity](https://www.kindermissionswerk.org/en/ueber-uns/the-carol-singers-campaign)

Editorial history corrections cite only source-bounded events or explicitly identify unsolved origins. Newly found sources are proposed here as research leads; adding any new authoritative citation to the product requires a separate controlled source-registry and attestation update, accounting for existing exact-count tests.

## Regression and further work

Run `node tests/customs-35-editorial-first-pass.mjs`, `node tests/calendar-customs-context.mjs` and `node tests/customs-living-library.mjs` in the PR's dedicated GitHub Action. The test locks published identity and attestation/source parity, language structure and non-duplicate historical sections. **Structural parity does not automatically approve translations.**

Next pass: review remaining 25 against exact source passages, settle the 13 P1 gates, reconcile accepted new witnesses with canonical registries, then obtain human EN/FR editorial acceptance. Do not merge research-only identities, grant art rights or create a second Calendar.
