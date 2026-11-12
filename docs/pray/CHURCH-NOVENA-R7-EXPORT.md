# Prayer Church R7 — Source-owned novena review export

**Status:** review-only integration aid. It does not replace the Pray runtime, change the Church, or publish a new prayer corpus.

## Reason

The R6 standalone Prayer Church prototype lists nineteen novena IDs but embeds only the historical Moran St Joseph reader. The *production application*, meanwhile, already owns sixteen source-scoped bilingual V4 programmes plus three specialist forms through `src/pray/novena-runtime.js`.

The Church needs source-complete review fixtures without another independently authored set of prayers. The R7 exporter produces a **deterministic, read-only JSON snapshot of those exact nineteen existing source objects**, preserving text, day order, repeated-prayer forms, source descriptions, language fields and provenance. The snapshot is an export, **not a new authoritative dataset**.

## Usage

```sh
node tests/pray-church-novena-review-export.mjs
node tools/pray/export-church-novena-review.mjs --output /tmp/church-novenas-r7.json
```

Or run the **Prayer Church novena source export (R7)** GitHub Actions workflow and download the short-lived artifact. No Vercel deployment, external geocoding or paid service is required. The JSON is not committed to `data/pray`, not published to GitHub Pages, and not used to overwrite canonical content.

Each record contains:

- `canonicalId`: e.g. `st_joseph`
- `prayerChurchId`: e.g. `novena:st_joseph`
- `sourceOwner`: one of the current `src/pray` source modules
- `programme`: a JSON-native copy of the **original programme**, including its nine prayer occasions

## Integration contract

When the production Pray runtime is present, the Church should resolve `novena:<id>` to `id` and invoke **the existing** `AO_NOVENAS_V3.open({novenaId:id})`. Keep the selected Church gallery and restore it upon return; the novena runtime remains the day/stage/language owner.

The JSON may be used for offline visual and source-parity QA of a Church prototype. It must **not** become a parallel runtime in production or supersede Calendar Intelligence's feast/window resolution.

Only the lectern opens the complete Tabula. Individual family doors open their own collections. Novenas remain accessed through the Votive Candles family or relevant contextual Church locations; no overhead map or separate Prayer Book tab is reintroduced.

## Evidence and limits

- **19 source programme IDs; 171 prayer occasions.** `NOVENA_CORPUS_V4` supplies sixteen; the ICKSP Divine Infant King, ICKSP Immaculate Conception, and Janvier Holy Face records supply three.
- **Nine Tuesdays of St Anthony** remains nine weekly Tuesdays, **not nine consecutive days**.
- The Institute's Immaculate Conception source remains separate from the Moran nine-day source.
- Repeated-form novenas keep their documented repeat prayer; the export does not fabricate nine themes or nine new prayers.
- Common Our Father, Hail Mary, Glory Be and 1962 Loreto references remain identifiers. Readers resolve them through the canonical prayer system.
- No gamified completion, devotional histories or intention logging is introduced.
- Source presence, bilingual fields and an unmodified export do **not** mean that all historical print witnesses, translation statuses or devotional components have received final certification. Consult `docs/pray/NOVENA-WHOLE-19-COMPONENT-AND-UI-AUDIT-20261029.md`.
- The R6 ZIP's St Joseph local reader is a separately sourced **Moran 1883 review presentation**, not an overwrite of the production runtime's identity.

## Release criteria

This PR only introduces source export and regression QA. The Church UI itself is not modified, and no new production route is declared complete until the runtime/reader return journey has been exercised in the real app shell, including English/French source distinctions, the nine stage transitions, 320px/390px, screen-reader accessibility and Back-to-gallery behaviour.

**Deployment policy:** GitHub Actions + GitHub Pages only; nothing in this PR deploys the application.

## R8 — Church direct-route bridge

The review branch now includes `src/pray/church-novena-ids.v1.js` (the light route allowlist) and `src/pray/church-novena-route.v1.js` (the actual **lazy production reader bridge**). The source exporter imports the same allowlist, so IDs cannot drift independently.

The established production Prayer app exposes:

```js
await window.AO_PRAY_APP_V1.openChurchNovenaRoute("novena:st_joseph", {
  returnContext: {gallery: "joseph", camera: "existing Church camera receipt"},
  returnToChurch: ({context}) => restoreChurchGallery(context)
});
```

This is a host-integration interface. The callback restores the Church's *own* gallery and camera when the novena reader's Back action closes it. The N3 reader still owns all nine days, language, textual source and calendar. Unknown routes fail closed; invalid day parameters cannot override Calendar Intelligence. There is no new prayer-writing engine and no duplicate source corpus.

The R8 compatibility HTML in the **standalone** Church review package prefers this production entry when the host provides it, but cannot itself bundle the 18 other production readers. The standalone St Joseph text continues to be available as its existing offline exception.

Run `node tests/pray-church-novena-direct-route.mjs` for all nineteen route IDs, lazy reader invocation, unknown-route rejection and one-time Church return. The GitHub Actions workflow runs both this bridge regression and the read-only source snapshot parity check. These contracts are necessary but **not substitutes** for full 19-reader UI regression with the hosted Church shell.

## R9 — Actual served-app browser acceptance

The second workflow job, `integrated-reader-phone`, runs
`tests/pray-church-novena-integrated-phone.mjs` in Chromium against the
repository's **real HTTP-served `index.html` and production N3 reader**.

At **320px and 390px**, in **English and French**, it checks all 19
`AO_PRAY_APP_V1.openChurchNovenaRoute("novena:<id>")` entries. It follows
the genuine reader's Day 1/Day 9 controls and Back control and checks that a
single once-only Church return callback receives the original gallery and
camera receipt. Unknown IDs must fail without loading the reader. Failures
and phone screenshots are preserved as workflow artifacts. This is **76 real
reader-entry journeys**, separate from the source corpus's existing exhaustive
171-day/684-stage validation.

**Precise limitation:** the production GitHub repository does not yet contain
the standalone Claude 3D Church as a hosted module. The test injects a
representative Church return callback to verify the live reader/bridge contract;
it does not claim to walk through or visually validate that separate 3D
prototype, restore its actual renderer, or certify a public GitHub Pages release.
A true 3D Church end-to-end browser gate remains necessary after the Church
is incorporated into the hosted application.

The test does not alter the source texts, the approved gallery art, the
church geometry, the original reader state machine or the release pipeline.
