# Calendar Customs — historical-parent-context release contract (22 bilingual details)

Status: **main-based PR #2007 release candidate; not yet merged**. Source research: PR #1723, `customs-22-existing-owner-bilingual-variants-20261029.v1.json`, Git blob `ad865b14afa579dbf2c6f80eaabccc73e5e44da9`. Historical folios rechecked in `docs/CUSTOMS_22_VARIANTS_WEISER_ORIGINAL_FOLIO_RECHECK_20261029.md` on the research branch.

## Exact scope

The Calendar publishes **35 existing canonical Customs articles**. This change adds **22 source-attributed historical paragraphs within 12 of those already published parent articles**, not 22 new Customs. It does **not** promote any unpublished canonical identity from the separate 18-item queue, create any additional date event, change 1962 calendar rank, merge an independent practice into its parent, or assert current local observance. The historical notes appear **only after opening their parent article**, not as separate cards, current-day recommendations, liturgical rites, parish schedules, or user-location matches.

The source research field `publication_authorized=false` is deliberately unchanged. This release scope is **historical commentary inside a published parent**, not approval to release the research item as a separate canonical custom or as a present-day practical instruction. That distinction must remain visible to editors and readers.

### Presented fields

- Bilingual historical title and description (`history_en`, `history_fr`).
- Bilingual historical geographic attribution, explicitly historical and source-bounded.
- Bilingual specific caution, including non-universality and (where needed) priestly-blessing, safety and indulgence limitations.
- Francis X. Weiser, *Handbook of Christian Feasts and Customs* (1958), linked PDF, exact **printed page** and stable source IDs retained in the code.

**Never render** research `practice_or_context_*` fields in the public historical-context slot: several are editorial directions, not prose suitable for users. Historical-only display does not infer an actual procession, blessing, household action, patron's feast date, pilgrimage service, or indulgence.

## Safeguards and release steps

1. `CUSTOMS_HISTORICAL_PARENT_CONTEXT_RELEASE` is the explicit, reversible code-level activation switch; it is enabled **on PR #2007 only** until this PR is merged. The `?customsHistorical=off` diagnostic URL switch hides the new text for visual regression comparisons; it is not a permission/approval bypass.
2. The read model rejects duplicate variant IDs, missing EN/FR context or caution, non-HTTPS sources, missing printed pages, any research identity publication approval, any grant ID and any date-owner override.
3. CI checks 22 unique bilingual annotations / 12 existing owners / 35 canonical articles, no extra date recommendations, no current local practice or indulgence claims and no public editorial instructions.
4. Real-browser phone tests at 320/390px use the app's Settings language choice for EN/FR, compare release/default and explicit QA-off baseline, verify original pages and lack of horizontal overflow. Screen captures are CI artifacts, not human visual signoff.
5. Keep PR #2007 unmerged if CI fails, the source snapshot drifts, an unexpected release identity appears, or editorial review finds an inaccurate historical claim. Independent editorial approval of NEW Customs remains outside this PR.

## Rollback

Set `CUSTOMS_HISTORICAL_PARENT_CONTEXT_RELEASE` to `false`, or revert only the scoped Calendar integration PR, to suppress the historical details without changing the underlying 35 published Customs or the 1962 Calendar. No user profile data or local events need migration.

## Out of scope

Publication of the 18 research Customs, PRs #1642/#1736/#1759, and independently attested indulgence grants with their legal conditions. These remain separately release-gated.
