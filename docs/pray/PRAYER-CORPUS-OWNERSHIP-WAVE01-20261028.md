# Ad Orientem · Unified Prayer Corpus · Wave 01 ownership baseline

28 October 2026 · source: **public canonical GitHub main after Batch 1 reconciliation** · Stage: **ownership inventory, not external source-completeness certification**.

## Audited internal baseline

| Ledger group | Records | What the number means |
|---|---:|---|
| Canonical Prayer Library core | **48** | Stable prayer IDs from `src/pray/canonical-data.js`, not the entirety of the application's prayer material |
| Canonical Novena programmes | **16** | Each programme can contain nine distinct days or one repeated text |
| Additional ICKSP Novena forms | **3** | Two repeated-nine forms and one separate **Tuesday perpetual** Institute source link, not nine fabricated daily texts |
| Hymn identities / recensions | **11** | Three original LA/EN/FR hymns and eight additional ICRSP Office recensions; score PDFs are not hymn identities |
| Other locally owned texts, historical witnesses and external-only references | **16** | Separate litany/communion/reparatory/prayer variant records and one source-only Marian reference; some overlap in work identity is deliberate until deduplication |
| **Total ownership ledger records** | **94** | **NOT 94 unique prayers:** this mixes genres, alternate editions, programme records and hyperlinks |

The 48 canonical prayers have **48 English**, **47 French**, and **47 Latin** populated text fields. **46/48** have an explicit provenance/source URL in the canonical record or its Oct 9 source review; the two known direct URL gaps in that historic audit are `mass_confiteor` and `adoration_lord_i_am_not_worthy`. Its existing source-grade labels were **33 primary**, **6 secondary** and **9 unclassified**. These are inherited claims, not independent line-by-line edition certifications.

Source certification inventory v3 reports **zero fully certified print-edition prayers** in its Oct 9 48-prayer review. That **does not mean** later independent hymn witness page-image inspections never took place. Across the new 94-record multi-lane ledger, print certification remains **unassessed**, pending owner-specific provenance review.

## Identity and deduplication rules

Keep `work_identity`, `edition/recension`, `language_witness`, `full_text vs fragment`, `novena programme`, `chant setting` and `module destination` as **separate dimensions**. Reuse the existing canonical prayer ID; admit a variant only with independent evidence. Where a source prayer has a later recension or requires editorial translation, identify it rather than replacing the published witness.

For example, the official 2005 French Compendium Act of Hope remains source-locked with *« Dans cette foi »*. The full alternative traditional French prayer uses *« Dans cette Espérance »* and is a separate provenance record. The canonical shortened Grace, short Baltimore Catechism form and complete 1888 Baltimore Manual thanksgiving remain distinct. The `Iesu dulcissime` Act of Reparation and the Holy Face Golden Arrow are different prayers; St Joseph litanies of 1909 and 2021 are distinct recensions; the Tuesday perpetual Institute Thérèse prayer is not a nine-day daily programme.

## Explicitly outside this first 94-record census

A site-wide collection from Sensus Fidelium has **not** been performed. Neither has a full item-by-item inventory of the historic *Raccolta*, the full ICKSP/ICRSP source catalogues, or all hours/seasons/proper/Common texts of the 1962 Divine Office. The presence of Tenebrae material and eight Office hymns **does not count as completion of the Divine Office**. A Prayer hub audit of 25 modules is likewise not a complete prayer-bank count.

## Research and release strategy

1. **Bulk source discovery:** process 300–500 external source leads per wave by domain, with URL, work title, source pagination/edition, language, genre, original text vs modern translation and reuse-rights indicators. Mark inaccessible or unverified pages as leads, not admitted records.
2. **Deduplication screening:** match those leads to stable IDs in this 94-record ownership baseline. Normalize titles and incipits for candidate matching, but never collapse same-title distinct texts, pre/post-2021 invocations, different languages or original print variants.
3. **Verification:** review 100–200 source records per full evidence batch when feasible. Validate source text actually appears on that page, print witness where required, rights, calendar/rubrical use, and exact LA/EN/FR per edition. Maintain a small exception queue for ambiguous identity.
4. **Release:** promote only evidence-backed prayers into the canonical corpus; show a one-tap variant in existing devotional modules where relevant, link from the existing Calendar context, preserve Divine Office as its own structured project. Run source, mobile, offline, textual and ceremonial gates before production promotion.

This **ownership baseline is research-only**. It imports **no unlicensed score, speculative translation, prayer content or new Calendar**. The authoritative machine-readable foundation is `data/pray/prayer-corpus-ownership-foundation.v1.json`.
