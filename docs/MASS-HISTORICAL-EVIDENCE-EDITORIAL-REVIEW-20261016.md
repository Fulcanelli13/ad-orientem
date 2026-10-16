# Ultra Master historical claim sources — 16 October 2026

## Work completed
A full research-only ID crosswalk now links the **139 source-author claims** in `Ad_Orientem_Ultra_Master_Research_Only_Low_Long_Guides_2026-10-16.xlsx` to existing `AO.CARD.*` Guide identities, without changing the authoritative Mass reader. All 139 claims map to at least one of **16** of the 30 ordinary Sung Guide moments (32 including before/after Mass). The two strongest concentrations are **AO.CARD.014 = 51 claim associations** and **AO.CARD.017 = 24**. These associations count claim-to-card rows, not independent original passages or user-visible approved quotations.

Historical source status:
- 69: `PASSAGE VERIFIED` as an **existing research grade**; NOT an in-app quotation approval or reproducible edition verification.
- 38: 1843 Le Brun OCR extracted / printed page identified; page-image collation pending.
- 25: digitised Jungmann OCR reviewed; original image validation pending.
- 7: other section-level/prayer-context observations.
- **0**: cleared for publication in this workflow; **0** quotation/reproduction/edition approvals inferred.

## New editorial tool
In the canonical Formation → Understand the Mass → 32 Mass moments page, adding `?massEvidenceReview=1` before opening the app enables an **editorial-only** metadata panel below a Mass moment. It does not appear in an ordinary app session, nor does it change the Guide in the ritual LIVE reader.

The panel groups claim candidates by historical author and lists their original unit ID, record ID, printed locator, interpretation type, research grade, and caution. It never displays a purported source excerpt or a clickable unverified source link. Four non-publication triage choices can be selected: hold, prioritize checking the printed original, question the scope/interpretation, or do not use. Choices persist in browser local storage and can be exported to a standalone JSON file. The export explicitly carries `publicationApproved:false`.

This is **not** an authentication/security boundary: the query parameter is a content-display guard only; the JSON contains bibliographic research metadata, not secret or licensed text.

## Separation of responsibilities

- **Mass**: R17 / published Missal, Simple and LIVE reader retains exclusive canonical ritual authority, timing, gesture and profile logic.
- **Formation**: eight existing lessons retain their source-backed claim drawer; 32 Guide moments remain an optional context-first reading route. Their existing source excerpt copy and navigational structure are not replaced.
- **Mystery**: PR #1193 keeps the separate two-chronology narrative and its independent editorial manuscript decisions.
- **Scripture**: the shared Bible contextual reader remains the only Bible reader. Source quote vs biblical parallel distinctions are unchanged.
- **Reference**: `src/learn/source-reference-panel.js` plus `src/reference/passage-packs.js` and `src/reference/passage-reader.js` own *future certified* passage rendering. This editor never creates a second public Sources drawer.
- **Ultra Master**: draft PR #1270 remains research-only; no automatic publication from this or any other workbook.

## Release gate for an exact quoted source
A candidate can become a published source passage only after **all** of: (1) exact original text collated to a specified printed edition/page, (2) author and claim scope adjudicated to a canonical Mass moment, (3) rights clearance for any reproduced translation/edition, (4) explicit editorial publication approval, (5) secure source-pack identity and stable in-app locator, (6) rendered excerpt acceptance in the shared source-panel/reader with Mass form conditions respected.

A `PRIORITIZE_COLLATION` triage choice meets **none** of those six criteria automatically.

## Scope of this PR
Add one 139-record research JSON index, one pure presentation/validation adapter, one explicitly gated Formation editor view, tests for fail-closed metadata rendering, persistence and JSON export, and a workflow. No changes to canonical ritual reader, Guide data, Scripture texts, Formation explanatory claims, Mystery manuscripts, artwork, Calendar or any external source parser. No old modules deleted.

This PR should only merge after its dedicated review tests and required application gates pass. Future source-text release is a separate editorial decision and pull request.
