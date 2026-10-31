# Ad Orientem — Prayer sacred-art editorial closure (31 October 2026)

This is an **editorial decision reconciliation**, not a new wave of approvals.
Canonical source: `data/prayer/artwork-editorial-20261031/11-gap-subjects-66-candidates-reconciled.v1.json`.
Historical assignments and user-led decisions remain in PR #2110, which is too divergent to merge wholesale. This branch reintroduces no artwork runtime or massive registry overwrite.

## Current factual counts
- **11** researched subject groups; **66** originally proposed alternatives.
- **12** of the 66 were already approved in the actual 30 October assignment ledger and remain approved; **one** (Lybaert) is explicitly rejected.
- **6** Benediction visuals are photography/print reference material, **not oil paintings**, so they are not valid options for a painted exact-rite illustration.
- **1** Céline Martin St Thérèse painting has underlying-artwork rights outstanding. She died in 1959, so ordinary French life-plus-70 copyright protection extends through the end of 2029 (absent a different applicable rights exception or licence).
- **46** remaining proposals are unreviewed oil paintings, frescoes or analogous paintings, rather than 'missing paintings'. They do not override earlier selections.
- **3** approved semantic associations exist for optional Luminous mysteries but stable runtime card IDs do not yet exist.
- **No photographs in this reconciliation are marked production-ready.**

## Editorially resolved subjects — stop asking for the same selection
- Precious Blood **Circumcision**: four paintings already approved in the research ledger, including Tintoretto, Pieter van Lint, Rubens, Gentileschi. The Presentation is **not** a substitute.
- Fourth Sorrow **Mary encounters Jesus carrying the Cross**: Giandomenico Tiepolo, San Polo, and Solesmes fourth Station approved in the historical snapshot; **Lybaert explicitly rejected later**. Do not use Pietà, burial or standalone Cross scenes as literal equivalents.
- Rosary **Visitation**: Philippe de Champaigne and Raphael/Giulio Romano previously approved.
- Rosary **Ascension**: Artus Wolffort and Hans Süss von Kulmbach historically approved; two additional 30 Oct approved alternatives (Teniers and Perugino).
- Rosary **Pentecost**: Jean II Restout already approved and Mateo Cerezo approved in later 30 Oct decision.
- Optional Luminous **Wedding at Cana**: previously approved Sebastiano Ricci and Giuseppe Maria Crespi *as semantic proposals*. Do not invent a live card ID.
- Optional Luminous **Institution of the Eucharist**: previously approved Lanfranco semantic association; **Philippe de Champaigne's La Petite Cène** explicitly preferred to da Siena. Do not count an optional mystery as a missing part of the traditional fifteen-mystery Rosary.

## 31 October explicit user decisions — no unsolved editorial subject gaps in the eleven-group batch
1. **Benediction:** user chose Hubert/Jan van Eyck *The Adoration of the Mystic Lamb* (Ghent Altarpiece lower central panel) for thematic heavenly/Eucharistic adoration. The oil painting depicts the Lamb amid the saints, **not the priest giving Benediction**. It does not replace the already user-approved Ingres *The Virgin Adoring the Host* cover. Permanent source file: `assets/prayer/user-approved/benediction-mystic-lamb.webp`; Commons faithful public-domain two-dimensional art reproduction, 2725×1577. Display only during the Benediction adoration stage, not the moment of liturgical blessing.
2. **St Thérèse of Lisieux:** user chose the exact Commons historical photographic portrait [Therese_lisieux_portrait.jpg](https://commons.wikimedia.org/wiki/File:Therese_lisieux_portrait.jpg), original 362×498, explicitly marked PD in France and the US. It is archived permanently at `assets/prayer/user-approved/st-therese-lisieux-historical-portrait.webp`, with no artificial upscaling. Novena entry screen updated. The previous `Thérèse aux roses` painting by Céline Martin remains unresolved copyright and is not used.
3. Both image hashes and source records are preserved in `assets/prayer/user-approved/source-provenance.v1.json`; workflow that briefly required `contents: write` was removed after collecting sources to preserve repository read-only CI security.
4. This closes the **two editorial subject gaps**, not all technical rights/image QA across the broader app. One external separate programme remains held: **Rauth fourteen copyright-claimed photographs** (PR #2125).

## Four identified no-cost image sources (needs native-file QA)
1. Philippe de Champaigne, **La Petite Cène** (Louvre INV 1125), 2816×2112 Commons file released into PD by photographer Tangopaso; verify native photograph crop/frame. [Original Commons PD-self photograph](https://commons.wikimedia.org/wiki/File:Philippe_de_Champaigne_-_La_Petite_C%C3%A8ne_(Louvre,_INV_1125).jpg). Do not substitute French RMN photo credited to Hervé Lewandowski, marked permission required.
2. Hans Süss von Kulmbach, **The Ascension of Christ** (Met 21.84), Met Open Access Public Domain; painting user-approved, native QA pending. [The Met object](https://www.metmuseum.org/art/collection/search/436835).
3. Philippe de Champaigne, **The Visitation** (Princeton y1994-17), 1487×2000 Commons PD-Art reproduction, previous user approval. [Source](https://commons.wikimedia.org/wiki/File:Philippe_de_Champaigne_-_The_Visitation_-_y1994-17_-_Princeton_University_Art_Museum.jpg).
4. Jacopo Tintoretto, **The Circumcision**, 1385×976 Commons faithful PD-Art reproduction. The artwork is already user-approved for the Precious Blood stage; native crop/frame QA pending. [Source](https://commons.wikimedia.org/wiki/File:Tintoretto-Circumcision.jpg).

Photo copyrights and artistic approval remain separate. Do not automatically enable these images or substitute low-quality source reproductions simply to hit a 100% metric.

## Complete Stations programme
Peter Rauth 14 painted canvases (Edinburgh, 1871–74) **prioritized by user** over visually poor Feuerstein Commons set and San Polo Tiepolo. See [PR #2125](https://github.com/Fulcanelli13/ad-orientem/pull/2125) for the 14 official native photos (13 ≥900 px short side, one 886 px), 14 old restoration photos (far too small), per-source hashes and legal evidence. **0/14 are certified PD/CC0 photos**, so stage release is blocked; preserve existing individual approved paintings rather than hotlinking ©2019 gallery as if free.

## Order for remaining execution
1. Keep existing stage approvals and app structure intact; skip redundant painting review for subjects already editorially solved.
2. Finish native photo review for the other previously approved artworks. The user-chosen van Eyck and historical St Thérèse sources are now permanently archived and reader-scoped.
3. **Do not reopen Benediction or St Thérèse for artistic research** unless the user requests a change. Optional Luminous associations remain secondary; traditional fifteen-mystery Rosary must not be disrupted.
4. Separately settle 14 Rauth photo rights (not artist rights); don't merge a draft that simply indexes copyrighted photo links.
5. Before activation, verify exact card/scene, French/English layout, mobility, original Rosary bead-by-bead scripture structure, users' rejections, image crop/clarity, attribution and rights. Never auto-enable on editorial approval alone.

All licensing expenditure and rights-holder outreach are forbidden by current project constraints.
