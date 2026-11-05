# St Pius X — The Study (standalone playable prototype)

**Status:** Private/editorial research review; do not publish, merge to app, or represent as a certified papal transcript.

[Open the self-contained HTML source](./SPX_Study_Standalone_20261021.html). Download the HTML file and open it directly in a recent browser. **It requires no server, network, external font, JavaScript library or image directory.** The five approved October 18 St Pius X pose images and the approved papal-study backdrop are embedded as unchanged WebP data from the existing Living Church P3 asset bank.

## P1a — In-session continuity and restrained stage direction (23 October 2026)

This **review-only, offline** increment uses the existing author-owned bilingual replies and the approved five-sprite art. A visitor can leave a documented subject, open another and return to the exact previously selected follow-up, in the same language. The passage remains unchanged. The expressive portrait now responds conservatively to the interaction: the chapter's documented scene pose on entry, *explaining* on an authored follow-up, and *thoughtful* while inspecting its source. Biography, catechetical reconstructions and partial-evidence narration still suppress the impersonating portrait. Session history is in memory only, capped at 20 entries, and is cleared upon relaunch; no visitor data is sent or saved.

The updated P6 Playwright test covers return continuity, English/French persistence, portrait state, source inspection, no new speech, and zero network calls. **This does not add generative AI, semantic free-text dialogue, approved historical quotations, publication clearance or a new question router.** The staged prototype remains a measure of conversational *presence* with the authored source text, not proof of autonomous conversation. Any later composer must reuse the single source-owned question-router work and keep quotation/claim verification separate.

## P1b — Typed-question interaction, still source-constrained (23 October 2026)

The **existing 82/94/106-chapter offline folio** now includes an English/French input for questions in the visitor's own words. An exact match to an existing authored question opens the same research-only answer already in the corpus. A non-exact, keyword-similar question **only offers candidate documented questions for explicit selection**; it never silently treats similarity as source support or fabricates a reply. Unmatched input receives an explicit no-coverage message.

Three tightly scoped contextual inputs are available without generative AI: `where is that from` / `quelle est la source` opens the existing source drawer; `shorter please` / `plus simplement` displays a preserved earlier editorial version (not a new explanation); and `tell me more` / `dites m en plus` directs the visitor to the already authored follow-ups. The interaction preserves the original branch navigation and selected language. Free text is held only during the immediate interaction; there is no remote request, cross-visit storage or hidden LLM.

This is a **conservative interaction demonstration, not a semantically capable conversational composer**. The keyword-similarity chooser is deliberately limited and carries no measured independent retrieval-quality claim. It does **not** import, replace or certify the draft Living Church shared router from PR #1443. It also does not provide dynamically generated answers, sentence-level theological verification, authenticated personal papal testimony, sacramental advice or publication approval.

The CI review workflow now includes `tests/pius-x-study-free-ask-e2e.mjs`, covering typed exact and uncertain matches, unknown questions, existing source and prior-draft commands, both viewport sizes, EN/FR commands and zero network calls. All original owner/source and publication-hold states remain unchanged.

## Play

Enter through the first *E supremi* question. The **complete two-segment editorial answer is now visible immediately**, without requiring another click. **Read related passages** reveals separately labelled, source-tethered material answering other questions in the same document. The next-question choices are curated for each of the 34 turns rather than based on incidental file order. **Contents** browses all 34 documented exchanges grouped by *Acerbo nimis* (11), *E supremi* (10) and *Haerent animo* (13). **Ask a question** searches those documented questions and suggests candidates for **explicit selection**. Free input never directly fabricates a papal response. Switch EN / FR freely without losing the selected passage or source. **Show source and claims** reveals the original Vatican editions, historic addressee, source-locus and claim IDs for each segment.

The UI follows the approved dark fixed-sprite visual-novel format: text in a staged folio, rather than messenger chat bubbles. This prototype is a standalone review artifact **not** a replacement or merge of the existing three-guide Living Church experience, Mass reader or native 433-question Catechism.


## P6: first twelve earlier documentary conversations — independent voice review

A separate review-only P6 file, `artifacts/pius-x-study-expanded/SPX_Study_Expanded_106_P6.html`, starts from the already-validated 106-chapter/423-answer P5 build. **It does not overwrite the P5 HTML, original research files, 94-chapter stage data, or source ledgers.** The P6 stage revises **22 EN/FR answer pairs in twelve of the earlier 94 chapters**, including twelve openings and ten follow-ups. The other 82 earlier subjects and all twelve newer P4 subjects remain identical to the P5 review.

Selected topics: election as Pope; adult Catechism; priests' work and prayer; restoration in Christ; lay apostolate; discouragement; sacred music; teaching adults; charity beyond almsgiving; correction without bitterness; meditation on Christ; and spiritual reading. Only chapters classified as **papal-document adaptations** can be revoiced in this pass. **Third-person biography, catechetical reconstruction and source-scope holds are intentionally excluded** rather than being given invented first-person reminiscences.

- Overlay ownership: `spx-p6-earlier-documentary-a.v1.json` (six chapters, ten answer pairs) and `spx-p6-earlier-documentary-b.v1.json` (six chapters, twelve answer pairs).
- Each change preserves the former expanded bilingual answer in `previousEditorialDraft`. The older source-owner `originalDraft` field, where present, is retained independently. The UI offers **Compare previous editorial wording** rather than conflating these two kinds of provenance.
- Each newly revised opening has a bilingual historical and translation qualification in the source drawer. Neither the voice revisions nor their EN/FR translations are certified as Pius X's exact historic speech.
- The `tools/build-pius-x-earlier-94-p6.mjs` build and `tests/pius-x-study-earlier-94-p6-e2e.mjs` browser test check conservation of the 106-subject structure, all 423 answers, 22 specific changes, twelve source notes, the unchanged later twelve subjects, EN/FR switching, accessible comparison, and zero network calls.

The workflow bundles the P6 HTML, P6 source ledger, and phone/desktop screenshots with the existing `pius-x-study-desktop-mobile-review` artifact. Original-passage collation, doctrinal review, source voice and translation review, and publication approval remain open.

## P5: all twelve recent chapters revoiced (22 October 2026)

The **106-chapter / 423 bilingual answer-pair offline study** now applies a separately reviewable editorial conversational-voice overlay to **all twelve P4 supplementary chapters (48 complete EN/FR answer pairs)**, including each chapter's opening and three follow-up exchanges. These are chapters `SPX-NEW-013` through `SPX-NEW-024`. All 94 preceding chapters and their **375 original answer pairs remain structurally unchanged**.

The source-owned P4 answers remain unchanged in `spx-p4-new-chapters-*.v1.json`. Four separate P5 overlay files hold the new text:

- `spx-p5-conversational-voice-revisions-4.v1.json`: 013, 014, 020, 021 (previous batch).
- `spx-p5-conversational-voice-next8-a.v1.json`: 015–018 (seminary formation, social action, priestly confession, retreats).
- `spx-p5-conversational-voice-next8-b1.v1.json`: 019 and 022 (priestly fraternity and young people without school religious instruction).
- `spx-p5-conversational-voice-next8-b2.v1.json`: 023–024 (adult catechesis and doctrinal knowledge in relation to moral conduct).

The builder applies overlays only to the matching P4 nodes. Before each replacement, `originalDraft` captures the previous P4 answer verbatim, and the **Compare original draft** panel remains available. Each opening has a bilingual `sourceDrawerNote`; the source drawer also shows the chapter-wide note when opened from a follow-up. Historical scope, documentary gaps, and present-day legal qualifications stay separate from the character's speech. No new autobiographical events are invented. The priestly association and fiftieth-anniversary recollections are limited to the references in the published Italian `Haerent animo`.

English/French parity, the 48 source-owned draft comparisons, twelve source notes, continued non-publication status, 375 immutable earlier answers, mobile/desktop browser interactions and zero-network operation are covered by the existing GitHub Actions workflow. A successful workflow produces `artifacts/pius-x-study-expanded/SPX_Study_Expanded_106.html` in the `pius-x-study-desktop-mobile-review` downloadable artifact.

This is **editorial review only**. Original passage-by-passage collation, precise translation approval, period-voice review, doctrine review and publication approval remain outstanding. Do not merge into the production Ad Orientem module.

## Expanded P0–P2 complete 327-answer editorial prototype — 22 October 2026 review stage

The original single-file 34-question study remains unchanged as a source-verified benchmark demo. A **separate generated HTML artifact** now reconciles the canonical original research owner's **82 chapters, 291 normal question-and-answer nodes and 36 parent-dependent continuations**. It can be built with:

`node tools/build-pius-x-expanded-standalone.mjs`

This produces `artifacts/pius-x-study-expanded/SPX_Study_Expanded_82.html`, a fully offline HTML. The CI workflow also runs `node tests/pius-x-study-expanded-82-e2e.mjs` in Chromium at desktop and phone widths and uploads the HTML plus screenshots in the downloadable workflow artifact.

P0 content and source corrections are deliberately isolated from the original research owners:

- `spx-p0-enriched-openings.v1.json` contains **34 substantial EN/FR opening-answer editorial drafts** (each at least 90 words in each language). They cover priority papal encyclicals, priestly and lay apostolate, sacramental catechesis and select biographical questions. Their exact original 34 research-draft openings remain accessible for side-by-side comparison. **The other 48 openings have now also been expanded** in three 16-record source-tethered bilingual batches: `spx-p1-openings-bio-partial-16.v1.json`, `spx-p1-openings-doctrine-16.v1.json` and `spx-p1-openings-morals-eschatology-16.v1.json`. This means **82/82 openings have substantial, review-only EN/FR editorial answers**; each retains the original shorter research draft. All **327 nodes** now have expanded editorial answers, but some direct yes/no follow-ups appropriately remain briefer than the opening answers.
- The final **245/245 follow-up answers**, including all 36 parent-dependent continuations, now have separately authored, source-scoped EN/FR explanations. Nine provenance-preserving editorial batches `spx-p2-followups-*.v1.json` add directly responsive argument and historical limits without claiming to reproduce original papal speech. The original source-owned short answers remain intact, including original unnormalized wording where a We/Nous review adaptation was necessary. The generated artifact preserves three distinct states: original source-owner short draft, period-voice-normalized short draft, and expanded review answer. **This is not independent source certification.**
- `tools/spx-p0-editorial-normalization.mjs` applies a non-authoritative We/Nous editorial-voice correction **only to source-attributed papal-document adaptations**. The earlier 44 first-person singular records were reconciled in the generated review artifact. The Unicode-aware French matching expressly protects words such as *âmes* and *système*.
- The builder classifies all **82 original chapters** as papal-document adaptation, catechetical reconstruction, biographical narrator or an editorial source-scope hold. Papally approved catechisms are never silently treated as Pius X's personal spoken words. **Nineteen chapters** retain partial/special-evidence notices; partial evidence is **not called biography**.
- Selecting a different first-level follow-up now **replaces the previous branch**, instead of appending independent alternatives into a fictitious continuous exchange. Dependent continuations are shown only under their actual parent turn.

The builder also emits `artifacts/pius-x-study-expanded/SPX_82_Source_Closure_Ledger.json`, an 82-chapter / 327-turn original-witness ledger listing original URLs, locators, historic source classes, partial-evidence flags, parent-turn links and **unverified** source-excerpt status. Source navigation does not imply original passage collation or approval. The two ambiguous inherited mode records citing the original Vatican encyclicals (*Ad diem illum* and *Pascendi*) now follow their original-document provenance rather than a generic catechism-oriented mode label.

The source panel links to the historical witness and prints its locator, but **does not yet contain exact, independently collated source quotations for every expanded claim**. These long-form answers are source-bounded editorial reconstructions, *not* verified quotations, independent translations or historical papal speech. They must not be made public until original-witness collation, doctrinal, period-voice, EN/FR and release reviews pass. No source-owner answer text was overwritten. The prototype does not provide open-ended AI chat or adjudicate individual spiritual states or current canon law.

## Fidelity and editorial holds

The content comes from the source owner's 12+22=34 completed claim-mapped turns **after** its two source-order repairs and four source-fidelity overlays. There are exactly **68 bilingual response segments**, each retaining original editorial claim IDs and Vatican citations. Nothing is paraphrased anew by this prototype. The interface labels speech **adapted editorial dialogue, not verbatim quotations**. Claims were subject to internal review only; historic/source, period voice, translations, theology and publication certification remain pending. *Haerent animo* has no original Vatican English or French translation attested in the source master; its EN/FR are unapproved editorial translations. The instructions from 1903–1908 are not presented as current universal canon law.

**Substantive limitation (observed 21 October 2026):** the 34 complete English answers contain only **33–57 words each** (median **43 words**), and each original visible segment had a median of **22 words**. This is a source-mapped conversational skeleton, not a satisfying full response corpus. The UI corrections remove artificial truncation and connect related source passages but do **not** turn these brief summaries into full historically substantiated answers. The original 34-turn UI still stands alone; the larger 82-chapter corpus is now available through a separately generated review-only HTML, with its unapproved status and remaining short drafts explicit. No historical dialogue has been silently lengthened or falsely approved.

This is **not** an autonomous LLM or semantic retrieval engine: free-text searches rank documented question headings and current source claim glosses for navigation only. No external network or secret API key is hidden inside the HTML. A broader conversation will require an approved retrieval/model integration later; unknown questions are held.

## Tests

`node tests/pius-x-study-standalone-e2e.mjs` validates source/claim/provenance data and runs Chromium at 1280×844 and 390×844; checks keyboard/choice interactions, English/French parity, source drawer, initial and mobile reading, decoded sprites, browser runtime errors and **zero external requests**. CI uploads screenshots.

## Ownership and original references

- Source/dialogue and 34-turn editor corrections: PR #1458 (`formation/1457-pius-x-conversation-evidence`), unchanged owner records.
- Locked expressive art: Living Church P3 PR #1404 (`feature/living-church-p3-character-folio-20261018`), binary SHA identities recorded in the standalone JSON provenance.
- Original shared question router: PR #1443, **not copied into this prototype**. A future production implementation can use it as a conservative, source-safe routing layer after claims and approval.
- Visual-novel direction and expressions: approved October 18 sprite bank; no invented portraits.
