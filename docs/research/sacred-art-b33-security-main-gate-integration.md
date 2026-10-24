# B33 Sacred Art — security and integration gate

Date: 24 October 2026. Research-only, zero-euro evidence. No new editorial or image publication approvals.

## Research preservation position

B29–B33 acquired 61 unique source image files: 13 historical selected originals plus 48 alternative research photos. New image bytes total 361,357,435. Two additional files were already present in B27, under separate catalogue identifiers, and account for 5,884,993 already-archived bytes. Thus 63 of 64 P0 artworks have some research image bytes. Only 13 have the historically selected bytes. The remaining exact-object photo is Prado P001314 Saint Augustine.

The exact sources and no-approval status are recorded in data/research/sacred-art-b33-p0-64-complete-research-coverage.json and data/research/sacred-art-b33-nine-exception-reconciliation.json.

## Why the production gate is red

Required-main-gate workflow run 40074523617 failed in tests/production-tree-hygiene.mjs, complaining that ao-art-159-review-gallery.yml regained contents: write. That existing historic workflow has both contents: write permission and git push.

The production-tree-hygiene test permits repository-writing workflows only on narrow Directory research branches plus separately guarded branch hygiene. New research archival workflows also write GitHub draft Releases and push compact audit files. Fixing only the 159-gallery workflow cannot make the whole stacked research branch meet this security contract.

The failure is real. Do not weaken the test or bypass it merely to land an asset-recovery branch.

## Safe integration pathway

1. Keep rescue and all stacked research PRs draft and unmerged while the required gate is red. Preserve unpublished releases and branch refs.
2. Create a separate integration branch off current main containing only stable-ID evidence tables, pure research verification scripts and read-only validation workflows. No source images, no workflow-triggered git push, no contents: write permission.
3. Keep download/archive writers isolated in a dedicated research branch or explicitly approved zero-fee archival repository, separate from production workflow security constraints. Do not place a token in Git. Persist release ID, source URI, SHA-256 and retention evidence in read-only audit tables.
4. Exact original-image SHA verification and remotely checked unpublished archival persistence remain mandatory prior to a technical acquisition-success claim. Expiring Actions artifacts alone are not a durable original-image archive.
5. Run the unchanged production-tree-hygiene test and full required regression suite on any main integration PR. Obtain source/rights review before approving a source image for app use.
6. Never automatically merge B27 Rubens Saint Matthias and Coello Saint Dominic duplicate-artwork IDs. Preserve original frozen editorial approvals. Maintain a further independent copy of the originals on already available storage wherever feasible; GitHub draft Releases have no permanent archival SLA.

## Research documents

- data/research/sacred-art-b33-seven-case-exact-source-and-two-alias-evidence.json
- data/research/sacred-art-b33-nine-exception-reconciliation.json
- data/research/sacred-art-b33-p0-64-complete-research-coverage.json
- data/research/sacred-art-b33-six-source-decisions.csv
- data/research/sacred-art-b33-six-source-summary.json

No photographs were placed in the application by this research wave.
