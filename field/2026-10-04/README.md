# Ad Orientem — 4 October 2026 Field Pilot

This directory is the isolated field build for the 4 October 2026 pilot. It is intentionally separate from the repository root so the native Mass reader can be exercised without changing the global production default.

## Start here

Open `pilot.html`.

The launcher sets the R17 reader feature gate to `PREVIEW` and opens this field build with `?aoR17Reader=r17`.

For the 4 October Holy Rosary field session, the browser bridge also forces the certified LIVE presentation path rather than falling back to the obsolete Simple reader.

## Before Mass sequence

The field shell exposes the intended sequence for 4 October:

1. Adoration
2. Benediction
3. Holy Rosary Mass

The launcher uses the existing Ad Orientem modules first and retains legacy module fallbacks where required.

## Certified field scope

The field release contract covers:

- Low Mass
- Missa Cantata — simple ceremonial
- Missa Cantata — incense
- Solemn Mass
- calendar or votive Proper
- MISSAL / SIMPLE / source-first LIVE reader architecture
- resolved Proper required before Mass entry
- Asperges when explicitly selected
- real Chromium phone/touch acceptance

The full-year convergence branch now contains substantially more certified special-structure work, but this dated field bundle deliberately remains a narrow frozen pilot.

## Rollback

The repository-wide production default remains `LEGACY`.

To force the legacy reader in this field build, remove the `aoR17Reader=r17` query parameter and clear the `ao-r17-reader-ui` local-storage key.

The R17 browser bridge also retains the legacy renderer as rollback/state donor; the native preview is mounted over it only when the field gate allows it.

## What to report

For a useful pilot report, record:

- form: Low / Missa Cantata / Solemn;
- reader mode: MISSAL / SIMPLE / LIVE;
- selected celebration / Proper;
- phone model and browser;
- the exact card or prayer where a problem occurred;
- whether the defect is text, translation, scrolling/focus, posture/gesture, priest state, Schola, bell/cinematic, or navigation;
- console error text if one appears.

Do not report the historical 48-card count itself as a defect. The current release architecture uses the certified source-first LIVE structure and retains the historical 48-card model only as compatibility evidence.
