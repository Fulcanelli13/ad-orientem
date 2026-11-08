# Advent I First Vespers — focused private reader extraction

**Engineering handoff from oversized draft PR #1950.** This PR is based on `main` and intentionally excludes the large annual source inventory, historical 168-entry raw-capture ledger, printed-witness micro-audits, recurring source collectors, and the separate eight-date Compline reader in draft PR #2045. Neither PR should force merging the 109-file historical research branch.

## Delivered

The verified **Saturday evening 28 November 2026** First Vespers of **Advent Sunday 29 November** is a complete, bounded source-first *research preview*: pinned Divinum Officium revision `126a07f91ede04664108abb6fb20ace3f4de14b9`, exactly **22 distinct original source files** in an in-memory session, **38 ordered source events**, **87 text-preserving verse/stanza focus steps**, Latin/English and Latin/French bilingual reading plus Latin only, dedicated mobile Prev/Next and progress bar. A source or translation inconsistency withholds the whole preview.

The dependency closure is extracted with the original validated source ownership and fail-closed metadata checks; it does not fabricate calendar appointments, rewrite translations, bulk-download an annual Office, publish a public Prayer route, or use paid services. This First Vespers proof is **independent of PR #2045**; when both are merged, a later integration PR can provide a unified date/Hour picker and Prayer UX. The private HTML is accessible only as a test/research asset, not included in `AO_MODULES`, public Prayer cards or navigation.

## Liturgical and editorial limitations

The *research sequence* for the universal 1960 calendar is verified against pinned source snippets but is **not a certified complete printed 1961 Breviary**. The primary 1961 Gallican printed Proper/Psalter collation remains incomplete. The English Advent collect and French `Qui vivis` ending require qualified review; approved translation reuse rights and local-calendar exceptions remain unresolved. The Compline reader is a separate feature branch. Every publication gate remains **false**; **zero Office Hours publicly available**.

The unit suite preserves correct Ordinaries and feast/commemoration conditions, the concluding `Domine exaudi` alternative printed in the 1961 Mame Ordinary, original 5 Saturday psalm portions, 38 original cards and 87 focused steps. Separate real Chromium checks at 320px/390px mobile and 1440px desktop verify source caching, both bilingual controls, sequential navigation, screen overflow, unsupported date/Hour hold and failure of a French collect.

## Merge strategy

1. Review and integrate this focused reader and the separately extracted Compline core (#2045) as distinct, dependency-closed changes.
2. Do not merge the entire old research PR #1950; leave evidence and unfinished Office research preserved there.
3. Following integration, add one coherent **private** date/Hour picker. No public Prayer route or Office publication until exact local ordo, text fidelity and rights are approved.
