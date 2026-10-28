# ICKSP Prayer Programme — Release Readiness & Remaining Gates

**As of 28 October 2026.** The current public Ad Orientem production deployment `dpl_931gXBqsrqVNqqtvuK12Yih8Pns5` is **READY** at SHA `c0bc59dedb1bafbeae03e90ea5d0fc19a6e57cb5` (includes merged Batch 5 #1836, whose 12 workflows completed: 11 success, one visual-capture skipped, no failed check). [Production](https://ad-orientem.vercel.app).

**Review:** 25/25 audited. **Implementation:** Batches 2–5 (20 module identities) have merged public Batch-specific changes, though some are source-linked rather than self-contained historical texts. **Private Batch 1:** 5 module-level original correction scopes still depend on open `folio-core` #59; parallel Morning/Evening public fixes are not equivalent to clearance of this private PR. **Historical certification:** Incomplete for the source holds below. **Deployed:** verified READY public production for B02–B05 merge ancestry, not an assertion that every feature has been manually field-tested in every language/ceremony.

## Shipped public release anchors

| Scope | Public PRs | Status |
|---|---|---|
| Batch 2 | [#1813](https://github.com/Fulcanelli13/ad-orientem/pull/1813) | Merged, READY production ancestor |
| Batch 3 | [#1827](https://github.com/Fulcanelli13/ad-orientem/pull/1827) | Merged, READY production ancestor; public 1962 Litany source hold |
| Batch 4 | [#1829](https://github.com/Fulcanelli13/ad-orientem/pull/1829), [#1830](https://github.com/Fulcanelli13/ad-orientem/pull/1830), [#1831](https://github.com/Fulcanelli13/ad-orientem/pull/1831) | Merged, READY production ancestor; historical French Seven Words holds |
| Batch 5 | [#1836](https://github.com/Fulcanelli13/ad-orientem/pull/1836) | Merged at c0bc59d, 11 CI successes/1 skipped, production READY |
| Batch 1 original private | [folio-core #59](https://github.com/Fulcanelli13/folio-core/pull/59) | OPEN, not certified, not merged; related public daily fixes do not settle it |

## Source gates still open

1. Exact 1962 public Litany of Saints text/ritual recension and attested LA/EN/FR, separate from historic private litanies and special use variants.
2. French Seven Words historical 1854 printed-page collation; English Baltimore 1889 print critical verification continues even though its historical transcription is stored offline.
3. St Joseph 1909 French/English historical printed diction; historical *sequence* and distinct 2021 additions are already restored as separate choices.
4. Exact 1962 Rituale Romanum `Proficiscere` and separately attested post-1922 French/English editions; the 1937 Latin text, 1922 insertion and editorial EN/FR alignment are released with accurate labels.
5. 8 new Office hymn Latin recension/Office placement and French witness page-image checks where held; modern downloadable music scores are external only and may not be redistributed without appropriate rights.
6. Open private canonical Batch 1 PR #59 acceptance and reconciliation; retained ICKSP #1800 other priest/Marian prayer selections. No duplicate identity promotions.

## Next release gates

Use the exact per-module source records and original 25-card identity list rather than recreating another Calendar. Record each source's edition, original language, status, permission where needed, physical or OCR witness and relevant liturgical scope. Run Node, real mobile/browser, EN/FR, offline readiness and source-integrity tests for each future change. Verify GitHub merged SHA and exact Vercel READY deployment before changing a source hold to released. Preserve €0 hosting and free-storage constraints.

Other surfaces requiring their own audit: Prayer Library, exceptional rites, Calendar's contextual entries, entire Divine Office, and private `folio-core` owner workflow.
