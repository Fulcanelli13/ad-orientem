# CPDV author-master full-canon audit — 9 October 2026

**Primary witness**: https://sacredbible.org/catholic/index.htm — Ronald L. Conte Jr.'s original CPDV maintained book pages, which the author identifies as his master text.
**Secondary, NOT authoritative**: Scrollmapper CPDV source from pinned commit `e1b254cef86d0e65b1a5d1a94b8b112d0f296a2c`.

## Actual automated collation
- Primary-author pages retrieved: **73/73**, with exact downloaded HTML SHA-256 retained per book.
- Candidate verses with nonempty text compared: **35,812**.
- Lexical mismatches after excluding the author's chapter headers and website footers: **413**.
- Verses present in the author page but not in the candidate: **82**.
- Nonblank candidate coordinates not identified in the author pages: **67**.
- **No claim of 413 proven translation errors:** these results include verse redistribution, liturgical pause markers and editor corrections.
- Every author's book page is now also exported as an **independent, source-checksummed research-only per-book text file** from GitHub Actions. These are not production/approved Scripture packs.

### Source of outstanding differences
| Book group | Lexical mismatches | Source alignment |
|---|---:|---|
| Esther | **208** | Major chapter/verse sequence incompatibility (67 candidate-only references; 66 master-only references); never auto-align |
| Psalms | **178** | Most reflect the older dataset's extra word "Pause" (Selah) and other editorial differences; 5 master-only references |
| Song of Songs | **20** | Different verse divisions and speech assignments; 11 master-only references; never auto-align |
| Revelation | **2** | Wording differs at 21:8 and 22:15, including moral descriptors; high-priority doctrinal editorial inspection |
| Philippians | 1 | **3:1**: older dataset says "it is not necessary"; current publisher text says **"it is necessary"** |
| 2 Maccabees | 1 | **7:34**: publisher corrected obsolete "do be not be extolled" to "do not be extolled" |
| Acts | 1 | **20:7**: assess edited punctuation/text against source |
| Galatians | 1 | **3:16**: spelling of "descendants"; confirm latest author correction |
| Lamentations | 1 | **1:8**: obsolete transcription suffix in "sinz" |
| Other canonical books | **0 lexical differences** under the automated normalization in this snapshot | This is *not* theological certification |

### Mandatory release gates
1. **Use the original author's latest pages as CPDV textual source**, not the stale third-party data. Check page SHA-256 and changes on each reproducible build.
2. **Preserve full Catholic additions** and 73-book order.
3. **Block cross-version verse-level links in Esther and Song of Songs** until a passage-wise crosswalk is constructed. Psalms require edition-specific numbering and notation handling.
4. Triage Revelation 21:8 / 22:15 before doctrinal clearance because the master's moral wording materially differs from the older transcription.
5. Reconcile the 82/67 reference discrepancies: never discard, silently pad, or invent biblical text.
6. The existing 34-passage *first-pass* doctrinal observations (8 high / 13 medium / 13 low) remain noncertified. No automated comparison constitutes an imprimatur, ecclesiastical approval or per-verse semantic certification.
7. Import production text only after mastering the edition-specific canonical verse identities, normalization and documentation; keep app startup lightweight via per-book lazy loads.

**Status**: Source acquisition complete; large-scale lexical comparison complete; source edition reconciliation underway; in-app biblical text **not** enabled. The editor-selected CPDV option remains available as an external resource in the app.
