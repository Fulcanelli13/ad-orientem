# Did You Know — source-first inventory and first bilingual editorial batch
_Date: 30 October 2026 | Status: research only; not published_

## Source inventory (live `main` baseline)
| Owner | Count | Interpretation |
|---|---:|---|
| `data/glossary/concepts-{001-150,151-300,301-450}.v1.json` | 450 | Source-backed EN/FR glossary concepts, not 450 publishable facts |
| Glossary `mass_liturgy` | 74 | Primary Mass terminology |
| Glossary `sacred_places_objects` | 65 | Vestments, vessels and church interiors |
| Glossary `latin_rubrics` | 60 | Mixed rubrical commands *and* elementary Latin terms; requires editorial selection |
| Glossary `liturgical_year` | 33 | 1962 feasts, ferias, seasons and precedence |
| Combined directly relevant glossary subset | **232** | Candidate *source entries*, not already authored DYK statements |
| `data/customs/customs-atlas-seed.v1.json` | 39 | 36 `PUBLISHED` metadata; 3 `CONTEXT_ONLY`; publication flag is not fresh DYK editorial approval |
| `data/customs/editorial-final-acceptance.v1.json` | 36 reviews | Most require independent final EN, FR and claim signoffs; do not bypass |
| `data/customs/customs-atlas-seed.v1.json` attestations | 98 | Provenance records, not 98 additional facts |
| `data/mass/gesture-matrix.v1.json` | 142 | Gesture records, often multiple per cue |
| `data/presentation/reader-rubric-events.v1.json` | 57 | Rubrical events overlapping the gesture records |
| `data/mass/ordinary-sung-speaker-audit.v1.json` | 280 | Cue/voice evidence, not independently verified trivia |

## Deliverable
`data/research/did-you-know/dyk-source-first-batch01.v1.json` contains **40 original EN/FR fact drafts**:
- 16 anchored in published canonical custom identities and their attestation source IDs;
- 19 anchored in source-backed glossary concepts;
- 5 anchored in normative 1962 priest-gesture records.

Every fact contains a stable draft ID, English and French text, canonical source owner, source record IDs, scope classification, conceptual in-app destination and explicit nonpublication state. Routes are *references for future resolution*, not hard-coded guessed URLs.

## Validation performed
- Each custom exists in the canonical `PUBLISHED` subset and has ≥1 attestation source.
- Each glossary entry is `SOURCE_BACKED` and belongs to one of the three frozen concept batches.
- Each Mass gesture exists in the matrix and is marked `1962_NORMATIVE`.
- Every backing source ID resolves in the correct canonical source registry.
- Every candidate has English and French text, a destination reference and a unique ID.
- All 40 remain `EDITORIAL_DRAFT_NOT_APPROVED`; `publication_authorized=false`.
- No research record was promoted to Mass, Calendar, Glossary or Customs runtime.

## Required next gates (in order)
1. **Reconcile with the prior 53 bilingual DYK facts and 195 converted candidates.** They are not the authority for this audit and were not recovered from `main`; do not treat 40 as 40 net-new, publishable facts until stable IDs / semantic duplicates are compared. Locate the existing DYK owner before any integration.
2. **Editorial review:** bilingual accuracy, not merely literal translation, including historical, regional, optional and 1962-specific claims. Review Mass gestures against the primary 1962 rubric and source-local exceptions.
3. **Customs signoff remains independent:** metadata marked `PUBLISHED` in Customs does *not* confer new DYK editorial approval; do not shortcut existing pending signoffs.
4. **Resolve deep links against real runtime routes**, preserving canonical `record_id` ownership and Calendar's exclusive date/season calculation.
5. **Extract next tranche source-first** using the 232 glossary records and remaining canonical Customs facts; prioritize useful distinctions and explanations, not merely dictionary definitions. Then study more involved Mass choreography, form differences, bells and Schola.
6. **Expand catechism/doctrine later**, once the reusable Customs–Glossary–Mass pipeline and editorial QA are established.
7. **Publication gate:** separate editorial authorization; only then connect approved records to bilingual nonrepeating daily rotation (12/day maximum). No new paid services.

## Editorial prohibitions
- Do not portray local/regional customs, outdated discipline or optional devotion as universal Catholic obligation.
- Do not infer user posture from priest gestures or declare the latest implementation to have a legacy card count.
- Do not convert source research counts into an inflated count of finished facts.
- Do not create independent icon, customs, calendar, Mass, glossary or mapping source-of-truth structures.
- Do not present an indulgence amount, condition or current grant without independent primary-source verification.
- Do not auto-publish, auto-merge, or silently overwrite prior DYK editorial selections.
