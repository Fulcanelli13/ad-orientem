# Customs registry: P0/P1 canonical status and priority source audit

**Audit date:** 2026-10-23. **Scope:** metadata/publication parity and the twelve unique sources cited by eleven P0/P1 guidance records. This is **not** a full 108-source HTTP audit, a comprehensive historical validation, a licence review, or a final user-acceptance review.

## Governance and ownership

- `main` canonical registry: **38** records = **35 PUBLISHED** plus **3 CONTEXT_ONLY**, **97** attestations and **108** source-registry entries.
- P0/P1 guidance: 6 + 5 existing published IDs. Files were imported from draft research, leaving `publication: DRAFT_ONLY` and `review_status: STAGED_IN_DRAFT_BRANCH_NOT_MERGED`. Those fields described a past branch status and contradicted `main` canonical identity status. The updated values identify supporting published-ID copy, **not** new publication approval or a claim that all local histories are settled.
- Three context-only identities retain historical/regional scope: `DEV-007` regional pardons, `BELL-004` glas/death bell, `FOOD-001` pain bénit.
- Research master: 56 identities = canonical 38, provisional P2 four, unpublished source-bounded fourteen. **No new publications**. Weiser 568 observations are research locators, not newly approved customs.
- The existing Calendar remains the sole date resolver. Calendar suggestions may expand into contextual articles. No new Calendar architecture, liturgical rank, local procession, priestly blessing, automatic parish availability or Mass overlay is authorized by this audit.

## Priority source identity / access cross-check

This was a **web retrieval and page-title/content matching pass on 2026-10-23**, not an uptime monitor; status can change later. “Directly retrieved” means page content was available to the research client. “Restricted” means automated retrieval was blocked; do not label as a broken link without browser verification.

| Source ID | Custom owner | Access | Identity and claim scope |
| --- | --- | --- | --- |
| USCCB-ADVENT-WREATH-HOME | ADVT-001 | DIRECTLY_RETRIEVED | USCCB Advent wreath blessing; confirms Catholic household devotional practice; contemporary text **not** 1962 rite evidence |
| CATHCULTURE-ADVENT-MANGER-STRAW-2014 | ADVT-002 | DIRECTLY_RETRIEVED | 2014 Catholic Culture first-person account of manger straw practice; **does not settle historical French origin** |
| USCCB-POSADAS-DEC16 | ADVT-003 | RESTRICTED_403_SEARCH_INDEX_CONFIRMED | USCCB December 16 Las Posadas page identified in search results; full page not opened directly; tradition geographically scoped |
| SJV-VERMONT-OPLATKI | XMAS-001 | DIRECTLY_RETRIEVED | Vermont Catholic parish page on Polish opłatek; local witness not universal obligation |
| CHICAGO-CATHOLIC-HOLY-THURSDAY-2026 | HTHU-001 | DIRECTLY_RETRIEVED | Chicago Catholic 18 March 2026 article on seven-church visits; **contemporary account**, not complete 1962 rubrical authority |
| NEWLAND-ROGATION-FAMILY-1956 | ROGA-001 | DIRECTLY_RETRIEVED | Catholic Culture archival household Rogation procession guidance; distinguish optional family walk from a formal ecclesiastical procession |
| STERN-KINDERMISSIONSWERK-2026 | EPIP-001 | DIRECTLY_RETRIEVED | German Catholic charity's Sternsinger campaign page; local scheduled visits not inferred |
| ECF-GALETTE-EPIPHANIE | EPIP-002 | DIRECTLY_RETRIEVED | French bishops' Epiphany household traditions; **not** proof of ancient Roman origin for galette |
| UNESCO-CORPUS-FLOWER-CARPETS | CORP-001 | RESTRICTED_BOT_CHALLENGE_OFFICIAL_DECISION_CONFIRMED | Main UNESCO element page blocked automated retrieval; official 2021 decision 16.COM 8.b.33 confirms **Polish** Corpus Christi flower-carpet custom; not universal |
| VATICAN-DPP-CORPUS-FLOWERS-162 | CORP-001 | DIRECTLY_RETRIEVED | Vatican Directory on Popular Piety §162 confirms eucharistic processions; does **not independently attest Polish flower carpets** |
| MUNICH-FREISING-EMMAUSGANG | EAST-001 | DIRECTLY_RETRIEVED | Archdiocese of Munich and Freising description of Easter Monday Emmausgang in southern German/Austrian practice |
| CATHCULTURE-MARY-GARDEN | MARI-002 | DIRECTLY_RETRIEVED | Catholic Culture lay-family garden devotion; historical plant-lore and origins remain unverified |

**Count:** 10 directly retrievable; 2 automated-access restrictions with independently found official/search-index confirmation; **0 content-identity mismatches in this twelve-source pass**. These outcomes do **not** establish full original historical claims or copyright status. Source URL strings in the registry were not replaced: a temporary 403 or bot challenge does not justify changing a valid canonical link.

The five source registry records without web URLs are books/internal research descriptors, not broken HTTPS links. None was cited by the P0/P1 guidance chain reviewed here. The other 91 HTTPS-source records remain outside this audit.

## Regression checks and acceptance gate

- Updated tests assert supporting publication metadata and each canonical P0/P1 owner remains `PUBLISHED`, retaining geographic attestation IDs, source-reference parity, EN/FR copy, non-map policies and 1962 date separation.
- Targeted GitHub Action runs P0, P1, Calendar customs context and Living Library unit/integration contracts for relevant PR changes.
- **Pending:** full 103-link live-content audit; full original-source editorial and French-copy review; local/region/law checks; final Playwright EN/FR mobile acceptance; 0 approved customs images have complete identity, reuse rights, asset and crop sign-off.

**Release position:** structural reconciliation complete for this batch; no final full customs certification or art release approval is implied.
