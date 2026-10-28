# ICKSP / ICRSP prayer coverage — implementation B02
**28 October 2026 · PR #1800 branch, not merged or deployed**

## Editorial authority
The user accepts all works selected by the Institute as relevant to Ad Orientem. No per-item editorial rejection/approval step remains. Reuse identical existing prayers; distinguish variant historical formulas; maintain 1962 liturgical Office roles.

## Work implemented in the application branch
- **August Queen of Heaven / Auguste Reine des cieux**: source-backed bilingual prayer in `src/pray/icksp-marian-protection.v1.js`.
- English: Don Caspar Gilli, *The Month of Mary*, London, 1890, Project Gutenberg eBook 48887, appendix “Miraculous Prayer”.
- French: Father Louis-Édouard Cestac's historical text via the Servantes de Marie congregation.
- Institute source link retained. The French and 1890 English forms differ in minor ordering; their provenance is distinct. No unsupported Latin or Italian added; historical indulgences are NOT described as current.
- Reader route `pray.marian_protection`, implemented in `src/pray/traditional-pray-runtime.js` using the existing sourced-prayer card and language conventions.
- Visible navigation in `src/pray/presentation-runtime.js` under Pray → Devotions & Novenas.
- Dedicated `tests/icksp-marian-protection.mjs`, integrated into `npm run test:pray-traditional`, plus preservation of the original 23-entry navigation parity baseline and the newly visible optional route.

## French ICRSP Divine Office source expansion
- New register: `data/pray/icrsp-divine-office-index.b02.json`.
- **98 index entries** in the *Office divin* subsection: 12 references to existing B01 items and **86 additional** records.
- Of the additional records, **65 are psalm entries** to be resolved through existing Bible/Office psalm assets rather than copied as new prayers, and 21 are Office, hymn, canticle, poetry or collection items.
- All source selections accepted. Direct article URLs remain to be verified for new index-only entries. The French site's Temporal, Sanctoral, Mass Propers, documents, and other sections are not claimed to be exhausted by this Office subsection.

## Release checks and present limits
- Source-index acceptance: 25/25 B01 and 98/98 Office entries. These are overlapping inventories, not 123 distinct new prayers.
- Independent historical text witness found and wired: 1 complete bilingual prayer reader.
- Draft full-text integrations: 1; new production integrations: 0.
- Static source and route assertions passed in the editing session. **The full Node + Playwright regression suite has not yet been executed**; browser acceptance and deployment remain unverified.
- Remaining Institute prayers/novena variants require independent historical original and EN/FR/LA witness checks before importing full bodies. A modern Institute page is not proof of modern translation reuse rights.
- The St Pius X Morning/Evening core remains untouched. No expenses or owner-permission requests.

## Next implementation order
1. Verify and add the remaining prayers for priests and Infant Jesus forms from original historical witnesses; keep the second ICKSP priest prayer's corrupted line out of the reader.
2. Add the Institute's St Thérèse perpetual novena as a distinct option alongside the existing Twenty-Four Glory Bes novena, using original historical bodies where available.
3. Collate ICRSP seasonal hymns and complete Office structures into existing experiences, with Latin/English/French edition provenance and 1962 calendar conditions.
4. Run Node, Playwright, language parity, mobile, regression and release tests before merging and deploying.

**Do not claim production completion from this draft.**
