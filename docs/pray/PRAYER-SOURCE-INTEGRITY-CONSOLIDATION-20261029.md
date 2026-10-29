# Prayer source-integrity consolidation — 29 October 2026

**Scope:** existing Prayer owners only. This is a source-and-edition gate, not a new Prayer reader, a text release, a promise of 1962 certification, or a re-opening of the 54/54 mobile-entry audit in PR #1955.

## Reconciled populations

| Ledger | Population | Actual source state | Interpretation |
| --- | ---: | --- | --- |
| `data/pray/prayer-source-certification-inventory.v3.json` | 48 canonical prayers | 18 of the *combined* 64 prayer+novena source anchors reviewed, zero complete original-edition certificates | A `VERIFIED_PRIMARY` source-quality claim is **not** full text/translation certification |
| Same inventory | 16 main novena programmes | All 16 original print editions still pending | Novena programme IDs are not independent prayer-body counts |
| `data/pray/novena-source-review.v3.json` | 72 distinct digital English day-body anchor reviews | 0 full digital line-by-line certificates; 0 full original print certificates | An anchor review must not silently promote nine days to edition-verbatim |
| `data/pray/prayer-corpus-current-release-overlay-b31.v1.json` | 97 historical acquisition rows | 61 addressed or routed, 13 source/variant holds, 19 deferred, 4 excluded | These acquisition records overlap with published Prayer and other owners; do not sum as distinct published prayers |
| `src/pray/internal-route-owner.js` | 27 internal direct-entry IDs + delegated Rosary = 28 | Route checks completed in PR #1955 | Navigation counts are neither unique prayers nor text certifications |

The source inventory currently reports **18 partial anchor reviews, 46 not reviewed, 0 fully certified** across its 64 canonical prayer/novena records. Nine canonical source claims remain `LEGACY_RECORD_NOT_RECLASSIFIED`; two lack a source URL **in this inventory** (`mass_confiteor` and `adoration_lord_i_am_not_worthy`). An alternate reference elsewhere in the codebase does not automatically certify the original inventory claim.

## High-priority editorial queue

### 1. Public 1962 Litany of the Saints — one bounded edition collation

**Existing owners:** `src/pray/litany-1962-use-policy.js` and `src/pray/litany-source.js`. Do **not** replace the private Litany reader, the Easter Vigil shortened form, or Forty Hours. The public Greater Litanies currently remain source-link-only until the complete Latin witness, approved-language text, associated prayers, and ceremonial boundaries are checked together.

The ICRSP [Greater Litanies source](https://icrspfrance.fr/textes-liturgiques.php?article=a0087_nouveau) prints a Latin/French procession text and also reproduces historical commentary. Its old commentary describing doubled invocations must not override **Rubricae generales (1960), n. 82**, which expressly directs that the Litany's petitions **are not doubled** in the Greater Litanies. Cross-check [1960 rubrics 80–90](https://isidore.co/divinum/www/horas/Help/Rubrics/General%20Rubrics.html). Keep rite, psalms, suffrages, and collects in their correct source order. The older 1883 English and 1862 French private editions are distinct transcriptions and are not 1962 substitutes.

**Promotion gate:** identify an exact dated Latin liturgical edition and page/folio; compare each invocation/response, psalm, collect, posture cue and specific use; distinguish any licensed French translation from a historical, editorial or source-linked rendering; only then consider local public reader publication. No importing a modern copyright-protected translation without permission or an appropriate licence.

### 2. Edition-specific sources within the 48 prayers

- Review **12 already identified material language/edition discrepancies** (traditional French vs 2005 Compendium, doxology variants, prayer-book composites). The source drawer already discloses these; verify the exact French, English and Latin witnesses rather than normalizing them into fictional identical editions.
- Identify primary printed witnesses for the two inventory entries lacking a source URL. Do not fabricate a link or blindly inherit a parallel Mass owner.
- Verify the traditional `litany_loreto_1962` from a period-specific witness, independent of the Vatican's current Loreto text. Its existing `prayer-edition-witnesses.v1.js` already provides an older comparison reference and explicitly withholds a full 1962-print certificate. Preserve the 2020 additions only under `litany_loreto_current`, never the 1962-era edition.
- Review item-level language forms in source order, including punctuation, appended versicles, sequence/composite boundaries, and omitted passages.

### 3. All 16 novenas together, not 16 micro-batches

Reuse the existing digital day-body anchors and original printed-page queue. Collate 16 sources, 72 unique English day bodies, recurring/shared prayers and the French editorial translations in bulk. Track named work, edition, page, individual day or common response, and revision/facsimile. `holy_ghost` and `christmas` legitimately share the [Callan Wikisource page](https://en.wikisource.org/wiki/Blessed_be_God_(Callan)/Novena_For_Christmas): the document also contains a separately headed **Novena for Pentecost**. Distinguish *section* in the record rather than treating shared URLs as an error.

### 4. Indulgences are a parallel, source-governed layer

Do not turn old prayer-book indulgence notices into claims of **present-day grants**. For each devotion with a claimed indulgence, retain separately: exact quoted historical source, granting authority, date, historic conditions; then independently identify current concession, edition/year, partial or plenary nature, prescribed work, eligibility and conditions, and applicability to the actual text/act. Use **UNKNOWN / HISTORICAL_ONLY / CURRENT_VERIFIED** rather than inferring validity from age or an unsourced devotional page. Refer to the authoritative [Enchiridion Indulgentiarum](https://www.vatican.va/roman_curia/tribunals/apost_penit/documents/rc_trib_appen_doc_20020826_enchiridion-indulgentiarum_lt.html) for current-concession verification. Do not import grants into this PR.

## Release discipline

- Gate now added: `tests/pray-source-integrity-crosslane-gate.mjs`, invoked under existing `test:pray-owner`. It reconciles the 48+16 source inventory against live owners, checks 97-row acquisition overlap without inventing a unique prayer total, and preserves the 1962 Litany's blocked-public status.
- A future move to full certification must have an identified original print edition, facsimile, page range and documented comparison. Update source policy, inventory and this gate together after actual source verification.
- **No prayer text, language, indulgence, runtime reader, icon, UX, release status or imported source corpus changes in this PR.** Existing UI test and Litany fail-closed behaviour remain the release authority.
- Free-only workflow: existing GitHub repo, source links and CI. No paid APIs, subscriptions or photography requirements.

**Next editorial release:** one high-volume source collation with a clear exception ledger. Promote only verified records; leave the rest marked pending rather than inferring universal completion.
