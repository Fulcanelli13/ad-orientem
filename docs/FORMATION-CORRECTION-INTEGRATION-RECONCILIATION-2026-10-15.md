# Ad Orientem Formation — correction integration reconciliation

**15 October 2026 · Existing draft PR #1198 · No merge or live release**

## Result

The 291-question initial source audit was already concluded. Instead of blindly reapplying its accumulated overlays, the **30 canonical correction owners and 59 proposed English/French section changes** were compared with the latest contents of this branch. The canonical research drafts already contain the substantive corrections for 27 Church Crisis/Apologetics owners (55 overlay sections), sometimes incorporated within an existing four-role paragraph rather than as a new fifth section. Three Sexual Ethics owners correspond to four changes in app source/debates:

- CSE031: the original marriage-consent clarification is already part of the debate's bilingual *response*.
- CSE045: the headship/mutual-submission controversy is now expressed through an attributed Craig Keener objection and original *Casti connubii* and *Mulieris dignitatem* texts; this is an **editorial improvement**, not verbatim insertion of the old comparison.
- CSE068: the 1975 CDF sterilisation response already appears in the current question's cited reference registry; duplicating the long proposed source-locator explanation is unnecessary.

APOL-002, APOL-001 and CR-DOC-09 already have their new corrected content within the research branch. APOL-007's Josephus excerpt and APOL-009's Ehrman discussion already appear alongside prior valid material. APOL-058's papal anti-enslavement historical quotation is placed in the *critical response*, deliberately **preserving** the Indigenous survivors and Truth and Reconciliation Commission's own voice in the *documented position*. Do not overwrite that first-person opposition.

For CR-GOV-02 and CR-GOV-03, the CARA statistics had each been duplicated verbatim in the answer and documented-position role. This step **removed the duplicate from documented position**, leaving the contextualised statistics, English/French text and citations in the answer. This is a real committed source-file edit, not just an audit record.

## Integrity checks

- Eight canonical research batches contain **141 unique existing Apologetics and Church Crisis dossiers** with four roles each.
- **No unresolved section source IDs** within their local source registries, as checked in the branch.
- **No verbatim duplicate long English paragraphs** across the roles of the same dossier after the CARA cleanup.
- Canonical scope remains **60 Apologetics + 81 Church Crisis + 150 Sexual Ethics = 291 owners**; Catechism's separate questions are out of scope.
- The main branch still has the **old, evolution-focused APOL-002**, whereas this branch has the correct *Dei Filius/Fides et ratio* faith-and-reason dossier. The branch is ahead of live publication, not proof that the live app displays the changes.

[Per-owner reconciliation register](../data/learn/formation-overlay-integration-reconciliation-20261015.v1.json).

## What must not be done

Do not paste all overlays again: that would recreate repeated sections and undo substantive opponent attribution. Do not delete APOL-002's original Humani generis/evolution material; it remains suitable as a linked case study rather than the owner answer. Do not convert source-count tallies into evidence that every translated paragraph has final theological certification. No complete-book sourcing requirement is imposed where original bounded citations already support the specific claim.

## Publication and signoff boundary

**Branch content incorporation is not live release.** The research JSON batches still explicitly mark `publication_allowed: false`, and individual section editorial-context and French approvals remain pending. Release therefore requires a focused final review of affected EN/FR sections, their link targets, their opponent attributions, and the application's actual consumption/build path. Then the correct approved fields can be applied to the live Formation presentation and regression-tested without merging research draft flags or duplicate editorial ledgers wholesale.

Keep PR #1198 as a **draft** until that release path is verified. No production deployment or merge is claimed by this reconciliation.
