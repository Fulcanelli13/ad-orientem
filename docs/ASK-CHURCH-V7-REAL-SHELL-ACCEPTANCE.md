# Ask the Church V7 — real-shell acceptance gate

## Evidence acquired (18 October 2026)

- Existing production project: `ad-orientem` on Vercel. **Production remains on `main`; PR #1391 has not been published there.**
- Separate project: `ad-orientem-preview`. An opt-in Git deployment was created for this branch, commit `628d6fa1ab197fde817ef2622385760f753fca4c`.
- Vercel preview deployment `dpl_CChAesTQNnhePH9Y11aG1qgB4Ln1`, `https://ad-orientem-preview-bbvpu3glg-andyfinette-2091.vercel.app`, reported **READY** by the deployment API. The project has Vercel SSO protection enabled.
- The production site does **not** have a public Ask the Church launcher; preview branch does not add one.
- Added `tests/ask-church-real-shell-phone-e2e.mjs`: a Playwright browser acceptance script which serves **real `index.html`**, imports the unpublished guide, uses the native `AO_APP_SHELL_V1`, and tests actual Confession, Apostolate HS02, Mass Explorer and Spiritual Life modules at phone and desktop sizes, plus return-to-context, French switch and research-only gate. It does not fake the native owners.

## Executed vs outstanding

| Check | Status |
| --- | --- |
| Git preview deployment build | **READY** in Vercel deployment metadata |
| PR unchanged from production / unpublished feature | **Confirmed** |
| Real-shell Playwright acceptance | **NOT RUN in this tool environment**; complete repository cannot be cloned because GitHub DNS egress is blocked, and the authenticated Vercel deployment cannot be driven through the available browser sandbox |
| Earlier isolated synthetic-shell browser tests | **PASS**, but do not constitute native owner acceptance |
| Existing Node routing and lifecycle checks | **Passed in prior isolated run**; rerun on the current branch before merge |
| Accessible Vercel preview browser inspection | **Pending authenticated browser/Work-mode run** |

### Developer execution in a full checkout

```bash
node tests/ask-church-app-route-survey.mjs
node tests/ask-church-objective-engine.mjs
node tests/ask-church-handoff-lifecycle.mjs
node tests/ask-church-real-shell-phone-e2e.mjs
```

Playwright must be installed as for the existing E2E tests, and Chromium must be available. Run in the full repository checkout, *not* the static dist directory (the E2E script starts a local server rooted at the repository).

### Manual inspection of authenticated preview

Visit the SSO-protected URL above, authenticate, and then in browser DevTools Console on the application page:

```js
const {mountAskChurchGuide} = await import('/src/learn/ask-church-guided-preview.js');
window.askChurchPreview = await mountAskChurchGuide(window);
```

Test Confession, Apostolate HS02, Mass Explorer, Spiritual Life, Rosary, Daily Catechism and Baptism/First Communion/Marriage guides. For each, verify the native owner actually opens and its content renders, then use the Return to Ask the Church control to confirm objective + branch are retained.

### Release gates

**Do not merge, enable a public launcher, or mark actual native acceptance PASS** until the real-shell automated test has executed on the current head, remaining priority destinations have been inspected in the browser, and the Confession and Mass surfaces have passed an explicit obstruction and return-focus audit. Do not alter the canonical 1962 Mass reader, Confession questions, or research-only publication flags as part of this preview test.
