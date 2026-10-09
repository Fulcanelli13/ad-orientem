# Ad Orientem Scripture — public-domain-only policy (9 October 2026)

## Decisions
- English traditional: Douay–Rheims (Challoner), preferably a verified 1899 witness.
- English **selected alternative** (9 Oct 2026, pending textual and theological verification): Catholic Public Domain Version (Ronald L. Conte Jr., 2009), Vulgate-derived, full 73-book Catholic canon. Author expressly dedicates his translation to the public domain. His own notes caution that literal wording can be awkward; the product owner approves its selection as an alternative to D–R, **not** its textual accuracy, theological safety, or release of full text. No ecclesiastical approval has been established.
- French: Crampon revised 1923; use original printed source or public-domain transcription.
- Latin: Clementine Vulgate (historical editions).
- Remove paid-permission Bibles (NCB, Knox, RSV, etc.) from selectable app choices and stop licence procurement work. Do not present an unapproved personal translation as official Catholic Scripture.

## Canon and source gates
All 73 books and Catholic additions are required. Map each edition's *actual* Psalms / Esther / Daniel versification before allowing language switching to claim the same exact passage. Do not infer equivalents or invent missing text. The 12 DRC and 124 Crampon source blank slots require printed-edition reconciliation; blanks at the end of a shared grid may be padding rather than absent biblical verses.

Public domain removes the publisher-licensing dependency, **not** data-quality, versification, text provenance or ecclesiastical editorial review. Catalogue options may link externally while their canonical offline packs are incomplete; no misleading in-app Scripture text substitutions.

## Source of truth
- Douay 1899 verified public-domain edition: https://ebible.org/details.php?id=engDRA
- CPDV author statement: https://ronconte.com/catholic-bible/
- CPDV original master files: https://sacredbible.org/catholic/index.htm
- CPDV author explains readability limitations: https://ronconte.com/catholic-bible/
- Crampon revised 1923 source: https://fr.wikisource.org/wiki/Bible_Crampon_1923
- Pinned open machine sources used for candidate import: scrollmapper/bible_databases commit e1b254cef86d0e65b1a5d1a94b8b112d0f296a2c

## Delivery definition
1. Completed: Acquire the three English/French candidate corpora (D–R, CPDV, Crampon) and verify hashes and canonical identities.
2. Compare candidate text against original edition, in particular CPDV against author's SacredBible.org master, and flag missing/unusual verse numbering.
3. Compile 73 per-book packs and a manifest for *each* certified edition. Use the existing offline source-integrity and SHA-256 checks, and avoid loading the entire Bible on app startup.
4. Offer traditional ↔ contemporary English at the same confirmed passage, with persistent preferences and without routing to paid copyrighted editions.
5. Run phone/desktop text, bookmark, search, offline and Rosary/Formation regression checks. No changing authentic Mass text.
