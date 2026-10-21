# Living Catena — Scripture-first research retrieval
**Research prototype, not a public app release.**

This experimental adapter sits beside, not on top of, the existing Messenger PR #1533. It searches the **192 existing AI-context-reviewed Matthew candidates** and the **31 provenance-preserving comparison leads** using editorial reader-question wording and optional Matthew verse reference. Every selected source pointer resolves through the **existing integrity-checked canonical Catena chapter-pack loader**, with original author label, exact quotation, citation and external source link.

The interface is limited to research preview. **All 192 candidates remain unapproved**. Search matching a modern reader question is a navigation aid, not proof that a Father historically asked or fully answered it. Unrelated queries abstain, and no Father persona response is generated. The two known mixed-author records are rendered in exact non-overlapping source-owned spans (Lanfranc/Pseudo-Dionysius; Origen/Pseudo-Dionysius), with the original text unchanged.

The automated editorial shortlist is strictly **unreviewed**, excludes pseudo-attributions, known author splits, reviewer disagreements, context-incomplete/multiple-argument classifications, and offers a checklist for future source examination and independent human sign-off. It is NOT editorial approval.

Run `node tests/scripture-catena-research-retrieval.mjs` to check Scripture citation lookup, conceptual navigation, misleading query abstention, provenance and mixed-owner source integrity. No app UI or production Messenger selection has been modified. Later reconcile this with the already-running Messenger #1533 after a separate release review; do not copy all source texts or replace the Messenger's four-Gospel lexical index.
