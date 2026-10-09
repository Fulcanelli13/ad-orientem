# Shared Scripture reader — implementation contract (9 October 2026)

## Editorial choice
- English: Douay–Rheims (Challoner) default; Knox optional **only after digital redistribution permission**.
- French: Crampon 1923 text **only**; exact source and legal status require review.
- Latin: Clementine Vulgate as a reference, not as a change to the Mass reader.
- No RSV–CE or Protestant-derived editions in this catalogue. A translation's history is not itself a doctrinal judgment.
- Complete Catholic canon (73 books). Do not assume modern and Vulgate Psalm numbering agree.

## Product ownership
One dedicated Scripture reader should eventually serve continuous Bible reading, devotional citations (Rosary, Stations, novenas), Formation/Apologetics, and cross-references into the 1962 Missal. Scripture reader preferences **must not** rewrite the Missal's source text, rubrics or R17 display behaviour.

## Data model and integrity
- Persist book/chapter/verse identifiers independently of translation and display language.
- Canonical book IDs must be reconciled with a 73-book whitelist before accepting imported content.
- Maintain explicit versification alias maps, particularly for Psalms, and handle additions to Esther/Daniel. Do not infer verse mappings.
- Each displayed verse must record edition, exact publication/revision, source locator, provenance, licence/permission, review status and textual checksum.
- Do not ship excerpts from a catalogue edition until its digital rights and exact text source are cleared. Sales of printed copies do not convey app redistribution permission.
- Distinguish inspired biblical text from supplied editorial summaries, liturgical paraphrases and commentary.
- Scripture links must point to a stable passage ID; user translation preference controls rendering only.
- Translation switch should preserve passage selection, book/chapter/verse and reading position.
- Treat Bible text as immutable source data; never manufacture verse text as fallback.

## First acceptance gate: Rosary
The existing 200 scriptural quotations must undergo **individual** reference verification: accuracy, textual context, relevance to mystery, translation fidelity, no duplicated or fabricated verse, a traceable source, and human editorial review. Incorrect quotations are blocked rather than replaced automatically. This audit is separate from Bible licence clearance.

## Delivery sequence
1. Catalogue and gate (this foundation).
2. Rights and edition provenance inventory; Catholic 73-book + numbering crosswalk.
3. Passage resolver / verified text imports / language preference persisted.
4. Shared reading screen with Read / Compare / Study views, responsive navigation, accessibility, search and bookmarks.
5. Integrate Rosary and other devotions via passage IDs, then Formation; link Missal references read-only.
6. Full integration, mobile and offline tests and editorial sign-off.

Current status: foundation metadata only. No Bible texts, navigation surfaces, Rosary content changes or app integration are represented as complete.
