# Catechism of St Pius X — unified reader contract

Status: implementation contract; guided course unpublished pending certification (2026-10-09).

## Single public owner

The existing `learn.catechism` remains the sole owner of the St Pius X Catechism and its 433 numbered question/answer records. Do not introduce a public `learn.faith` sibling destination, duplicate doctrine owner, or second Catechism corpus.

Inside `learn.catechism`, present two modes:
1. **Catechism / Catéchisme**: faithful numbered Q&A, searchable, navigable by source section and question number; retain all existing reader features.
2. **Guided study / Parcours guidé**: the proposed 55 lessons, grouped by theme, with bilingual explanatory claims and links to the authoritative original Q&A. This is a learning view, not a new catechism.

The guided-study tab is **not yet visible publicly**. It may be enabled only after the explicit publication gates below. Do not replace or redirect the already-published Q&A reader during development.

## Data ownership and stable identity

- Source Q&A: existing 433-question canonical St Pius X data; retain stable numbered IDs.
- Candidate lesson crosswalk: `data/learn/learn-the-faith-55-proposed-reconciliation-2026-10-09.v1.json`.
- Claims: `data/learn/learn-the-faith-certification-001-018.v1.json` and `data/learn/learn-the-faith-certification-019-054.v1.json`.
- Archival lessons: `data/learn/learn-the-faith-recovered-54.v1.json`; preserve all historical versions.
- Guided-study UI keys use `displayLessonId` (LTF-001..055), not archival lesson IDs. LTF-046 is the proposed Precepts lesson; the archival LTF-046 (prayer) becomes display LTF-047.
- Each Catechism question has exactly one primary lesson assignment; cross-links from other lessons must not create duplicate Q&A owners.
- Link each sourced claim to the exact numbered question and, where necessary, a supplemental original authority. Avoid citing only a generic index page.

## Reader behavior

A user in Catechism mode sees unchanged original questions and answers. From a question, a **Study this topic / Étudier ce sujet** link opens its primary guided lesson when that lesson is approved; prior to approval the link must be absent. Guided study lessons display: title, concise explanatory prose, inline claim-level source hyperlinks, related original Q&A, next/previous lesson, and a clear return to the source question. French and English must maintain claim parity without synthetic translations being passed off as historical source text. Preserve position when switching modes where feasible; avoid gamified indicators.

## Certification and release gates

All 181 bilingual claims, including the three Precepts claims, require exact original-passage verification, scope and doctrinal checks, and native-French editorial review. Identify historical disciplinary norms (fasting, marriage, orders, rites, etc.) distinctly from current binding law. Require independent competent doctrinal/canonical sign-off, working hyperlinks, and real phone/desktop reader acceptance. Until each release gate is recorded as passed, keep the guided-study surface behind a nonpublic development/test flag; do not advertise or route users to it.

## Acceptance tests

- 433 unique numbered Q&A remain searchable and accessible from the same `learn.catechism` route.
- 55 unique display lessons in proposed order; 54 preserved archival IDs and variants unchanged.
- 433/433 questions have exactly one primary lesson mapping, every cross-reference resolves.
- Display LTF-046 is Precepts; historical LTF-046 is preserved and maps to display LTF-047.
- Both directions of Q&A↔guided-lesson navigation resolve in approved test fixtures.
- No public guided mode before all gate booleans are true; zero changes to Mass, PRAY, Apologetics, or Church Crisis ownership.
