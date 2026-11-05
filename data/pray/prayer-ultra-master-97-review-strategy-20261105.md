# Prayer Ultra Master — 97-record ownership reconciliation

**Audited:** 5 November 2026 against `main` commit `62ff95f48bf91cb246649de977ad9f2e37c90528` · **Scope:** research-only, non-publication.

## Bottom line

The **97 acquisition candidates** are individually reconciled to the original master, B22 release crosswalk and **29 October B31 disposition**. This establishes identity and current repository owner evidence; it does **not** establish 97 unique or fully transcribed prayers. The 48 canonical prayer texts, 16 original Novenas, 39 nine-door shelf routes, source recensions, and overlapping research units are different inventories.

| Historical B31 disposition | Records | Interpretation |
| --- | ---: | --- |
| Live, source-scoped | 5 | Released item within a bounded source scope; not universal edition certification |
| Released after B22 | 5 | Five separately released programmes; original book-facsimile work still has limits |
| Existing owner, not exactly certified | 25 | Owner reference exists; exact historical wording and reader choice not demonstrated |
| Intent covered, not text imported | 21 | Functional theme covered; do not count candidate's exact text as published |
| Routed to another module | 5 | Do not duplicate Office/Mass/other canonical content |
| Source or recension hold | 13 | Not safe to publish until the specific issue is resolved |
| Editorially deferred | 19 | Preserve research; do not import by default |
| Excluded | 4 | Remain excluded from Prayer publication |
| **Total** | **97** | **Not** a count of unique prayers |

## Repository evidence checked on 5 November

The B31 overlay gives **ten explicit repository file paths**, **36 narrative-only owner descriptions**, and **51 records without an explicit owner reference**. All ten exact paths were present at the audited commit. One of those ten, **AO-AQ-047**, is a *held research structure*, not a published prayer. File existence is not an exact historical-text, rights, translated-witness, user-interface or release certificate.

The source ledgers are aligned by **all 97 original IDs, titles, decisions and priorities**. No source text, translation, source URL, historical decision, reviewer approval, artwork or published route was rewritten in this audit.

## Source and edition work since B31

- The 3 November source-scope triage has checked **30/30** previously unreviewed canonical prayer witnesses for source scope; this is **not** completed original EN/FR/LA line-by-line collation.
- The separate original-print programme has checked the printed proper-prayer word sequences for **72 Novena day bodies**. Its own record awards **zero** complete first-edition or whole-programme certificates. Those 72 day-body checks are not 72 additional unique Prayer works and do not change the 97-row classification automatically.
- Source statements for this audit are preserved in `data/pray/prayer-ultra-master-97-source-owner-reconciliation-20261105.v1.json` and tested against source ledgers and the actual repository files by `tests/pray-ultra-master-97-owner-reconciliation-20261105.mjs`.

## Immediate source-hold queue

### P0 — resolve before any admission (2)

- **AO-AQ-047 · P0: Short Chaplet of Precious Blood (§40)** — HOLD_VARIANT_CONFLICT. 1857 Raccolta §40 short Precious Blood is NOT published. A distinct 33-Pater full Precious Blood form from §35/1910 §138 is published in src/pray/precious-blood-chaplet.v1.js (PR #1873). §40 transcription conflicts between claimed 33 and enumerated 35 Paters; do not equate the two forms.
- **AO-AQ-078 · P0: Prayer before Meditation, Study or Spiritual Reading** — HOLD_SOURCE_OR_RIGHTS. Longer Lasance preparatory prayer remains source-held for printed-page collation. Released Aquinas Concede mihi covers the before-reading function, but this exact text is not live.

### P1 — next evidential review (4)

- **AO-AQ-002 · P1: Sacred Heart of Jesus, Eternal High Priest** — HOLD_SOURCE_OR_RIGHTS. ICKSP published wording has suspected textual corruption; cannot use without independent attestation.
- **AO-AQ-007 · P1: Consecration to the Immaculate Conception (Institute)** — HOLD_SOURCE_OR_RIGHTS. Institute consecration is a distinct act requiring edition, context and permissions review before any optional use.
- **AO-AQ-012 · P1: August Queen of Heaven** — HOLD_SOURCE_OR_RIGHTS. Registered August Queen witness is source-only; actual reader choice and original wording not verified.
- **AO-AQ-063 · P1: Holy Face Act of Consecration / Reparation** — HOLD_SOURCE_OR_RIGHTS. Holy Face consecration/reparation has separate sources and author claims; only consider as contextual option after owning the novena.

### P2/P3 — keep held (7)

- **AO-AQ-005 · P2: Our Lady of the Priesthood (Fr Thévenin)** — HOLD_SOURCE_OR_RIGHTS. Modern French author/translation copyright unresolved; no copying.
- **AO-AQ-006 · P2: Benedict XVI Prayer for Sanctification of Priests** — HOLD_SOURCE_OR_RIGHTS. Modern Benedict XVI work, rights and negligible new purpose.
- **AO-AQ-017 · P2: Infant Jesus of Prague Novena (first recension)** — HOLD_SOURCE_OR_RIGHTS. First Infant Jesus novena recension is not established against existing programme and original edition.
- **AO-AQ-018 · P3: Infant Jesus of Prague Novena (second recension)** — HOLD_SOURCE_OR_RIGHTS. Second Infant Jesus novena may be a parallel recension; source compare before any admission.
- **AO-AQ-022 · P3: Benedict XVI prayer to Infant Jesus (2009)** — HOLD_SOURCE_OR_RIGHTS. Contemporary papal Infant Jesus prayer has modern rights and little incremental need.
- **AO-AQ-024 · P2: Prayer of trusting abandonment** — HOLD_SOURCE_OR_RIGHTS. Prayer of abandonment is not admitted without complete text and defensible attribution.
- **AO-AQ-057 · P2: Heroic Act of Charity for Souls in Purgatory (§140)** — HOLD_SOURCE_OR_RIGHTS. Heroic Act has historically specific theological/indulgence framing; voluntary informed act only after doctrinal and edition review.


## Working sequence

1. **Close the two P0 holds by original witness and recension, not by substituting a similar devotional work.** AO-AQ-047 requires a defensible resolution of the 1857 Raccolta §40 short Precious Blood chaplet's claimed 33 versus enumerated 35 Paters. The separate full Precious Blood form already published does not resolve §40. AO-AQ-078 requires the exact Lasance printed prayer pages and edition comparison; the released Aquinas `Concede mihi` is not that longer Lasance text.
2. **Reconcile 25 existing-owner claims against exact canonical code owners and reader presentation.** For each candidate, record the source ID, revision/edition, the owning screen, and independently justified text/translation scope. Avoid counting a hymn, litany witness, Novena programme and reader pathway as different prayers when they are the same underlying work.
3. **Triages of 21 intent-only and five other-module records must preserve ownership.** Mark which are genuinely absent texts versus useful alternative formulations, which belong to Office or Mass, and which need no separate Prayer entry. Never invent translation or make source-only references public.
4. **Leave 19 deferrals and four exclusions unchanged unless there is an explicit editorial decision to reopen a work.** Historical indulgence grants and modern rights issues remain clearly distinguished from public, current permissions.
5. **Only after evidence passes** should new reader/Corpus PRs be considered. Preserve the nine-door UX, Rosary bead corpus, Confession, ICKSP Benediction, 32 Holy Cards and GitHub Actions → GitHub Pages release-only policy.

## Explicit boundaries

This audit is **not** original-print certification, a completed source text import, permission clearance, a new prayer gallery or a claim that all 97 units are publicly visible. No new user approvals are inferred. The historical B31 statuses remain labelled with their actual **29 October** date and can be superseded only by a separate, evidence-supported subsequent release update.

## Subsequent P0 source resolution (5 November 2026, after the frozen 97-row snapshot)

The separate `data/pray/prayer-p0-source-witness-decisions-20261105.v1.json` records a bounded **English-only** image comparison for **AO-AQ-078**, against Lasance's scanned *My Prayer-Book* (Benziger, 1908), printed p.225 / Wikisource DJVU page 240. The staged English wording agrees with the printed page after ornamental initial, spacing and line-break normalization. It is admitted **only** in the existing Scripture reader's optional before-reading choices, alongside the independently sourced Aquinas EN/Latin forms; French and Latin translations of the longer Lasance text are **not** admitted. Repository merge and GitHub Pages publication are separate release gates.

**AO-AQ-047 remains on hold.** The later short-Raccolta transcript invokes 33 Our Fathers but enumerates five across all seven mysteries (35). Original 1857 scan pages 103–104 were identified but **not visually inspected** during this decision. The published full Precious Blood form is a distinct recension and must not be used to claim that the short form is certified. The historical 29 October B31 status counts and the 97-row identity audit remain frozen as historical evidence; use this dated addendum for subsequent English source disposition rather than retroactively rewriting them.
