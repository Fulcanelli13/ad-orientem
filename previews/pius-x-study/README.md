# St Pius X — The Study (standalone playable prototype)

**Status:** Private/editorial research review; do not publish, merge to app, or represent as a certified papal transcript.

[Open the self-contained HTML source](./SPX_Study_Standalone_20261021.html). Download the HTML file and open it directly in a recent browser. **It requires no server, network, external font, JavaScript library or image directory.** The five approved October 18 St Pius X pose images and the approved papal-study backdrop are embedded as unchanged WebP data from the existing Living Church P3 asset bank.

## Play

Enter through the first *E supremi* question, use **Continue** to reveal successive source-tethered dialogue segments, then choose another question. **Contents** browses all 34 documented exchanges grouped by *Acerbo nimis* (11), *E supremi* (10) and *Haerent animo* (13). **Ask a question** searches those documented questions and suggests candidates for **explicit selection**. Free input never directly fabricates a papal response. Switch EN / FR freely without losing the selected passage or source. **Show source and claims** reveals the original Vatican editions, historic addressee, source-locus and claim IDs for each segment.

The UI follows the approved dark fixed-sprite visual-novel format: text in a staged folio, rather than messenger chat bubbles. This prototype is a standalone review artifact **not** a replacement or merge of the existing three-guide Living Church experience, Mass reader or native 433-question Catechism.

## Fidelity and editorial holds

The content comes from the source owner's 12+22=34 completed claim-mapped turns **after** its two source-order repairs and four source-fidelity overlays. There are exactly **68 bilingual response segments**, each retaining original editorial claim IDs and Vatican citations. Nothing is paraphrased anew by this prototype. The interface labels speech **adapted editorial dialogue, not verbatim quotations**. Claims were subject to internal review only; historic/source, period voice, translations, theology and publication certification remain pending. *Haerent animo* has no original Vatican English or French translation attested in the source master; its EN/FR are unapproved editorial translations. The instructions from 1903–1908 are not presented as current universal canon law.

This is **not** an autonomous LLM or semantic retrieval engine: free-text searches rank documented question headings and current source claim glosses for navigation only. No external network or secret API key is hidden inside the HTML. A broader conversation will require an approved retrieval/model integration later; unknown questions are held.

## Tests

`node tests/pius-x-study-standalone-e2e.mjs` validates source/claim/provenance data and runs Chromium at 1280×844 and 390×844; checks keyboard/choice interactions, English/French parity, source drawer, initial and mobile reading, decoded sprites, browser runtime errors and **zero external requests**. CI uploads screenshots.

## Ownership and original references

- Source/dialogue and 34-turn editor corrections: PR #1458 (`formation/1457-pius-x-conversation-evidence`), unchanged owner records.
- Locked expressive art: Living Church P3 PR #1404 (`feature/living-church-p3-character-folio-20261018`), binary SHA identities recorded in the standalone JSON provenance.
- Original shared question router: PR #1443, **not copied into this prototype**. A future production implementation can use it as a conservative, source-safe routing layer after claims and approval.
- Visual-novel direction and expressions: approved October 18 sprite bank; no invented portraits.
