# Ad Orientem Prayer artwork — 267-slot bulk gallery/asset crosswalk (3 November 2026)

**Scope: read-only audit. This is neither artwork selection nor image publication.**

The corrected 267-slot editorial master was merged in PR #2311. Only the separate production released-module-paintings register authorises an image to render. The previous summary reported 18 image-backed positions; the actual resolver currently reports **16** as of the commit audited here.

## Sources and deliverables

- Master: data/prayer/artwork-editorial-20261101/curatorial-master-267-20261101.v1.json (unchanged).
- Production renderer: src/pray/art-slot-map.v1.js and src/pray/editorial-artwork-assignments.v1.js (unchanged).
- Existing gallery research: data/artwork/research-semantic-candidates-989.v1.json; 989 work-group candidates, no release certification.
- Source archive in research PR #2267: data/research/module-hero-20-exact-source-archive-20261102.v1.json; 22 approved module paintings, 20 original photographs staged, two missing. Remains research-only on its branch.
- New machine-readable 267-row audit: data/prayer/artwork-editorial-20261101/gallery-archive-crosswalk-267-20261103.v1.json. Includes all slot decisions, source identity state, current runtime publication state, gallery and archive candidates, and a reusable-work prioritisation queue.
- Validation: tests/prayer-gallery-267-crosswalk-audit.mjs.
- Full-source pass: scripts/art/prayer-3205-source-link-audit.mjs reads the repository-local 3,205-source-record file and operational 989 register in GitHub Actions (both too large for this connector's file reader). It checks exact URL-string presence only; it does NOT certify object, photo, rights or approval.
- Read-only CI: .github/workflows/prayer-267-gallery-crosswalk.yml. Downloads no images, writes no source files, cannot publish and uses no paid APIs.

## Actual resolver baseline

| State | Positions |
| --- | ---: |
| Published exact photograph | 16 |
| Approved exact photograph pending | 173 |
| Source identity unverified | 31 |
| Provisional / not published | 22 |
| Editorial hold | 14 |
| Scope hold | 1 |
| Protected existing cover | 5 |
| Inherited door pool, no fixed painting | 5 |
| **Total** | **267** |

The historical 244/267 approved-or-inherited figure is **editorial coverage**, not release coverage.

## Gallery/source matching

- 206 slots have matching normalized artist/title entries in the research 989 register: 152 with one group and 54 with multiple groups. These amount to 99 distinct matched gallery work-group IDs. Lexical matching is not confirmation of a physical artwork or a releasable photo.
- 32 positions link by **exact source-page URL** to the 20-original archival ledger. Another 16 have only a normalized artist/title match and must be treated as unconfirmed.
- 31 not-yet-released slots refer to an archive record that says the original photo exists. This count includes identity holds and candidate works that may have photograph-specific defects; it is not a publishable set.
- The 173 approved-but-photo-pending slots collapse to **81 distinct work/source keys**. Only nine of those keys have existing archived originals recorded. Releases should therefore be batched by actual painting and reused at their approved slots, not pursued as 173 independent acquisitions.

## Next release sequence

1. **Respect existing PR #2302.** Sacred Heart, Immaculate Heart and Christ the King already have a dedicated release PR. Do not duplicate its originals. Its specific scope, rights and mobile acceptance still govern.
2. **Prioritise already-approved, multiply reused paintings.** Sodoma's Crucifixion (9 pending positions), Rubens's Saint Teresa of Avila Interceding for Souls in Purgatory (6), and the other multi-slot pending works are high-leverage acquisition targets. They still need the exact photograph, rights and quality evidence. In particular, never replace the Rubens at De profundis or Eternal Rest with an unrelated Giordano.
3. **Review existing archived originals in one batch**, not one-by-one painting approvals. Known caveats remain: Restout Pentecost glare, Gérôme gallery installation, St Michael fidelity, Perpetual Help reproduction, and other source restrictions. A valid historical hash is not a publication permit.
4. **Keep all editorial exclusions enforceable.** Rosary, Seven Sorrows, St Thérèse, Confession and the fifth protected cover; 14 editorial holds, one scope hold and 22 provisional positions are not opened by title matches.
5. **Use the 3,205-source CI artifact to close catalogue evidence gaps**, then deduplicate work identities and verify photographic rights, exact file bytes, visual condition, 320/390 EN/FR display, and approved scene placement before any publication. Retain any legitimate holds as explicit blockers rather than replacing the painting or silently reassigning the slot.

Definition of done for the broader programme: all 267 positions accounted for; each eligible fixed work released with the correct cleared photograph or explicitly held with a reason; inherited pools and protected covers unchanged; nine doors, covers and stage transitions visually accepted. This PR completes only the first bulk crosswalk and full-catalogue scan tooling.
