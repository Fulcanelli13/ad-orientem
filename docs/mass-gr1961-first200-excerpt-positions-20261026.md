# Graduale 1961: first-200 excerpt-position follow-up (26 Oct 2026)

Source: pinned first-200 screen in draft PR #1749. This is **not** a second source-acquisition pipeline and does **not** certify the selected 1962 Proper.

Out of 61 textual occurrences, 37 excerpts begin with the record's incipit, 14 begin with a printed `V.` marker followed by the incipit, and 10 include the incipit only *inside* a longer excerpt. Of 46 distinct source-screen candidates, 43 have some excerpt-initial evidence; three have only embedded occurrences: **GREGOBASE-63 (Cor meum)**, **GREGOBASE-124 (Vultum tuum)**, **GREGOBASE-134 (Salvum me fac)**. **GREGOBASE-13 (Omnis terra)** has mixed positions across different source paths. These are **review flags, not rejections**.

The original 46 candidates/154 limited-sample nonhits, full 1,195-score staging, and release counters remain unchanged. Initial position, including after `V.`, is not proof of an independent musical chant; the clipped excerpt might belong to a verse, another section, or a different alternate Proper. The existing three-language pre-Gospel segment verifier remains mandatory for the 19 pre-Gospel candidates.

To reproduce: `node tools/mass/triage-gr1961-first200-excerpt-positions.mjs --verify` and `node tests/gr1961-first200-excerpt-positions.mjs`. No reader or calendar imports. Next: resolve each candidate's actual selected 1962 Proper and named chant parts, then inspect the printed 1961 facsimile; independently screen records 201–400 using the *existing* archival corpus and methodology. All gates remain unapproved.
