# Ask the Church V5 — isolated native integration preview

## What is implemented
A source-owned, objective-first conversation guide. The visitor chooses an objective or types an informal statement, selects a situation, reads a short introduction from an existing canonical module, then explicitly chooses whether to open that module. They can go back, restart or return from the destination. English/French prompts are included.

Source:
- `data/learn/ask-church-app-route-survey.v1.json` — 7 objectives, 26 paths; routes and approval states, NOT doctrinal source text.
- `src/learn/ask-church-objective-engine.js` — pure conversation state with typed-text classification and no persistent user-question storage.
- `src/learn/ask-church-source-digest.js` — read-only summaries from the existing Apostolate, Confession preparation and Formation owners. This is *not* a new source of doctrine.
- `src/learn/ask-church-native-handoff.js` — user-initiated native owner integration; returns a failure code when a route is unavailable.
- `src/learn/ask-church-guided-preview.js` — modal preview with back/restart, source drawers, and a Return to Ask the Church control.
- `previews/ask-church-integrated.html` — isolated test host. To preview it, serve the repository root (not a file:// URL) and open `/previews/ask-church-integrated.html`.

## Test the guide inside Ad Orientem, without publishing a launcher
On a development copy of Ad Orientem, with the main app already loaded, call from the browser developer console:

```js
const { mountAskChurchGuide } = await import('./src/learn/ask-church-guided-preview.js');
const guide = await mountAskChurchGuide(window);
// Later: guide.show(), guide.reset(), guide.close()
```

Do not add this to the production shell until approved. The preview host alone cannot open native app modules and will report that limitation rather than inventing a successful handoff.

## Test cases
1. "I haven't confessed in years" -> return-to-confession situation -> Apostolate HS02 / Prayer Confession preparation / AQ02 explanation.
2. "My Protestant friend believes Scripture alone" -> apologetics situation -> ready Apostolate AQ08 and relevant other ready scenarios. Research-only APOL/Church Crisis are not exposed.
3. "I want to start family prayer" -> Prayer -> Family -> family Rosary and Morning & Evening prayer destinations.
4. "Explain the Mass" -> Formation -> Understand Mass -> Mass Explorer, without touching the 48-card LIVE reader.
5. In English and French: switch objective, back, restart, open a source drawer, and inspect its original source links.
6. In the actual app: test each native destination, navigation failure, return-to-chat control, and focus.
7. Test ambiguous inputs and personal cases to ensure the guide never solicits a confession or issues an individual moral verdict.

Run `node tests/ask-church-app-route-survey.mjs` and `node tests/ask-church-objective-engine.mjs` from the repository root.

## Publication and editorial constraints
- No runtime auto-mount, public nav tile, modified source Q&A or new doctrinal owner.
- Apostolate summaries are displayed verbatim only when their source record is `publication: 'READY'`. Formation summaries come from the existing Formation layout; Confession options use the existing Prayer Confession path descriptions.
- No publication of Apologetics/Church Crisis dossiers currently held for review.
- Conversation state is held in page memory, not localStorage or a remote store. Do not collect sins or private medical histories.
- Existing source attribution and translator/edition review continue to govern each underlying owner.
- Successful module launch is only confirmed when the native module owner reports success; Explore lens selection is not falsely claimed.

## Remaining acceptance gates
Full repository test execution, deployed-page browser acceptance (including lazy owner activation), accessibility/mobile QA, source text and bilingual editorial checks, and explicit release approval. Do not merge as a completed public product before these gates.
