# Edition- and witness-bound source packs — integration gate

Scope: canonical `src/reference/passage-packs.js` only; evidence from PR #1229; source register #342.

The existing chunk/reader owner gains an **optional qualified path**, called with `compileSourcePassagePacks(document,{sourceWork,passageLocators,cryptoProvider})`. Legacy project-authored demos using no `sourceWork` retain byte-for-byte output. Neither external web scraping nor app module integration is added.

For the qualified path, the source work ID, exact edition ID, exact witness ID and language must match the source paragraph document. Rights must contain an explicit reproduction review ID. Non-demo material further needs a release declaration `publicationApproval: "APPROVED_FOR_READING"`; restricted excerpts must match the exact approved anchor/text whitelist. `PROJECT_AUTHORED_DEMO` is confined to `demoOnly:true` and marked `NOT_FOR_PUBLICATION`. This is a code contract for editor-supplied evidence, **not automatic legal or theological approval**.

Each new section chunk carries an `editionIdentity` and per-paragraph `sourceMeta`. Its SHA-256 hash and byte length are published in the lightweight manifest. Passage metadata include edition-qualified citation ID, original anchor, explicit locator, optional exact source-page reference or printed-scan page span, and an independent text digest. On opening, the reader compares its chunk identity, citation, metadata and content digest against the manifest, *after* authenticating chunk bytes. Tampering with a citation, witness, link or approved text cannot be silently accepted under the trusted manifest.

`searchMetadata()` searches section names, passage IDs, locators and citations **without fetching passage bodies**. Full-text search remains the explicit existing `search()` operation. The existing 13-work registry, traditional Scripture, Catena, Formation and Mass owners are unchanged.

**Hard limitations:** Manifest authenticity is not independently signed. The caller must obtain its manifest from a trusted distribution. This is not an automatic warrant to import #1229's Fortescue preliminary passages, OCR, modern translations or whole books. Site-specific editions and rights still need editorial acceptance, and no new public reading route is enabled. The remaining #1229 research may include original-scan collation, provenance verification, dedicated extraction adapters and scale testing; preserve its PR and contents.
