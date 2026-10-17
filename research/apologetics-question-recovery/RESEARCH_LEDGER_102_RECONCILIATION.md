# Source ledger cross-check — no duplicate reimport

Current `data/learn/formation-recoverable-research-ledger-2026-10-08.v1.json` has **102 individually named research records**. The existing 282-item GitHub `questions.json` archive **already contains all 102**, with the same IDs and exact current source question strings.

**Result: 102/102 present and title-exact.** Reimporting the 102 ledger records into the historical-conversation index would manufacture duplicates and conflate later source files with older user/assistant conversations. The 452 historical indexed excerpts remain a separate retrieval class.

This cross-check verifies *current GitHub source agreement only*. It cannot certify whether the 102 questions match the original earlier conversations or the vanished historical A/C lists.
