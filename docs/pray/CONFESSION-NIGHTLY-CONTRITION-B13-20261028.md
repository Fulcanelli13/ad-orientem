# B13 — Confession and Nightly Examination: exact prayer choices

28 October 2026 · Ad Orientem Prayer phase, following merged B08–B12.

## Existing implementation, preserved

- **Confession** already has three source-owned preparation paths: regular / returning after absence / *optional* general Confession. The original prompt corpus spans all Ten Commandments; respective examinations have five, thirteen and fourteen cards. Every path retains the same three pre-confessional rehearsal cards and three aftercare cards. General individual Confession does **not** mean collective general absolution.
- **Nightly Examination** is a distinct short private examination reader, integrated with Evening Prayer and available standalone. The last source-owned “resolve” stage already offers two Acts of Contrition. The optional **St Pius X 1905** source is originally Italian; the existing French and English are explicitly *editorial renderings*, not authenticated historical printed translations. No Latin has been admitted for this prayer.
- The canonical `sacrament_act_of_contrition` stays the default everywhere. Confession remains a preparatory aid, never a simulated rite or sacramental absolution. No sins, notes or answers are collected or saved.

## B13 changes

1. Confession: at the last examination and last rehearsal card, show a compact, one-tap choice between the established complete canonical Act and the existing St Pius X 1905 editorial EN/FR rendering. Historical source link and editorial notice accompany the latter. State is **session-only**, scoped strictly to the existing Confession reader; no permanent sensitive preference.
2. Nightly Examination: expose a small “Read the closing Act of Contrition” action without making the user swipe through the whole examination merely to reach the established two-option source picker. This is an optional *shortcut*, not a claim that the examen was performed. The integrated Evening Prayer reader retains its existing sequence, without a shortcut that alters its source-owned order.
3. No new text, invented translations, new examination methods, additional sacramental stage, mandatory prayers, personal sin storage, or tracking. Preserve the different origin and purpose of each prayer.
4. Maintain original ritual card timeline, swipe and within-card vertical scroll, existing French/Latin prayer flipping where source-owned, and separate native presentation/Traditional runtime ownership.

## Acceptance

- Existing 3/5/13/14-path and unconfessed-grave-sins examinations unchanged; historical source policy remains explicit.
- 390px French real-device acceptance tests show both Pius X and canonical prayers, correct active state, last-card scope, no chooser on question cards, and direct standalone nightly shortcut; 320px choice surfaces fit without horizontal overflow.
- Required main + owner suites and Prayer 23-route + phone acceptance pass; merge and verify production alias on correct Vercel commit. Strict €0.
