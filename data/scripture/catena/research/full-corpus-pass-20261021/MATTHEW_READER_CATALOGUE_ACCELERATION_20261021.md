# Matthew — reader-first retrieval catalogue and whole-book review priority
**21 October 2026 | Research only, not publication-ready**

The 4,825 Matthew source excerpts were already mechanically indexed. We therefore stop treating another 300-item lexical screen as useful progress. The new deterministic data combines **192 distinct existing AI-context-reviewed passages**, preserving **211 individual AI assessments** (including the 19 overlaps between batch-two review passes), into source-linked reader-question metadata. It also produces **31 overlapping comparison leads** and ranks **4,633 still-needing-contextual-review source pointers** across the whole book.

| Coverage | Count |
| --- | ---: |
| Matthew Catena excerpts in existing index | 4,825 |
| Individually source-screened in earlier three batches | 900 |
| AI-context-reviewed distinct excerpts | 192 |
| Already screened without contextual review | 708 |
| Only indexed without contextual review | 3,925 |
| Potential reader comparison leads (overlapping) | 31 |
| Independently human-approved for publication | 0 |

A source-pointer and inherited Father label are kept for each record. Reader questions are editorial navigation prompts, not quotations by Fathers. No patristic answer is created, translated or paraphrased. Existing original Catena text remains untouched. The reader can compare Cyprian and Augustine on daily bread or Origen and Hilary on the Cross **as different voices**, not a synthesized consensus. The unresolved four AI assessment discrepancies and confirmed Lanfranc/Pseudo-Dionysius and Origen/Pseudo-Dionysius ownership splits are flagged.

The full-book queue prioritizes contextual review via transparent structural metadata (interrogatives, quotation/objection, pseudo-attributions, dependence, fragment length); its score is a *heuristic*, not proof of a speaker, answer, theology or historical authenticity. The **3,925 indexed-only** excerpts have **not** been given new semantic review. Nothing is published to Messenger or wired to a production interface in this commit.

Run `node scripts/scripture-catena-reader-routing.mjs` and `node tests/scripture-catena-reader-routing.mjs` to reproduce and verify catalogue, comparisons and complete queue. Before publication, human editorial scrutiny, primary-work attribution when necessary, context/voice, translation and rights checks remain mandatory.
