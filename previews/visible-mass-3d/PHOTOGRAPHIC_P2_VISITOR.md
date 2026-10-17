# The Visible Mass — Photographic P2 visitor prototype

## Approved direction
Preserve the October 17 authentic-photo experience as the only accepted visual baseline. No AI-rendered priests, invented text, incoherent stitched architecture, or automatic cuts to side chapels. The experience should be a living glossary over existing Ad Orientem knowledge, not a giant image-rating interface.

## P2 delivered as offline HTML attachment
**The_Visible_Mass_P2_Photographic_Living_Glossary.html**, reconstructed from the existing 11-photo visitor proof. Photographs and individual creator/licence attribution remain embedded. This deliverable is not yet a production route and the binary-heavy HTML is not added to this PR.

### Main route
- Nave → high altar, smoothly fading to the verified separate camera image.
- The Lady altar and Sacred Heart chapel are **optional separate locations** selected by a dedicated "Side chapels…" surface; each has an intentional location transition and "return to high altar" action.
- "Next" at high altar opens "Witness the Mass" rather than jumping to a chapel.
- Preserve pan/zoom and click-to-examine within a real photograph. Do not label this genuine 3D or claim a 360-degree interior.

### Existing formation projections
The visitor can open **Understand the Mass**, displaying exactly the existing eight `MF01…MF08` stage titles, questions and concise source-backed summaries from:
`data/learn/mass-formation-campion.v1.json` (`SOURCE_BACKED_FORMATION`).

Three authentic Mass photograph records are linked for exploratory study:
- Prayers at the foot → `MF01` and `MF02`; guide `AO.CARD.001`.
- Elevation → `MF04`, `MF05`, `MF06`; the relevant consecration guide sequence is `AO.CARD.015/016`.
- `Ecce Agnus Dei` → `MF07`; linked to the Communion segment. Validate exact guide sub-moment before publishing a direct launch.

A clicked high altar also links to existing `MF03` formation. The canonical object names and explanations remain owned by `data/glossary/concepts-*.v1.json`; the 11 photographic assets retain individual source and licence details.

## Acceptance checks (Oct 17)
- Desktop 1366×900 and mobile 390×844: complete interaction smoke tests with Chromium, using set_content because sandbox blocks both file: and localhost navigation.
- Verified real image load, nave → sanctuary, formation list (8), stage → real TLM moment, side chapel selection → return, high-altar hotspot → authentic altar card photograph, and no runtime JavaScript errors.
- HTML syntax parses; 11 embedded photographs; source panels are intact.
- The current offline file is a snapshot, **not live data binding**. For production, project approved Mass Explorer and glossary records directly from the canonical registries.

## Still not built
True free-roam 3D, multi-angle photogrammetric continuity, additional vetted high-quality TLM objects, full Mass Explorer editorial hierarchy, Scripture and verified rubrics integration, full launch into LIVE/Simple/Missal. Those must be implemented through a reconciled read-only adapter after Ultra Master parity. Do not touch production Mass reader or merge this draft until the user accepts the experience.
