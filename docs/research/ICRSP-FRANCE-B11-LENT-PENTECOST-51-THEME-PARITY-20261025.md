# ICRSP France — B11 content-source review / 51 Lent and post-Pentecost articles

**25 October 2026**. [Issue #1665](https://github.com/Fulcanelli13/ad-orientem/issues/1665) / [draft PR #1666](https://github.com/Fulcanelli13/ad-orientem/pull/1666).

## Source review now at 51 of 51, not full critical collation

B10 previously recorded 11 source webpages with specific text-grounded subjects out of a 51-article Lent/post-Pentecost batch. B11 **directly opened and reviewed at least one meaningful commentary text section from each of the remaining 40 source articles**. That completes a conservative first-pass thematic screen of all **51/51 articles**, across **227 source-page commentary panel occurrences**. The 40 newly reviewed pages represent 179 panel occurrences, and 11 earlier pages account for 48.

**The 227 individual author/editorial panels have NOT all been read or collated line by line.** Each article has at least one real source-grounded historical/theological subject; that is not equal to complete source mining or approval of source text. This distinction is explicitly encoded on every record.

- `data/source-text/icrsp-france-b11-40-content-evidence-topics.v1.json`: 40 newly examined source articles, each with stable ICRSP URL, existing Ad Orientem Scripture sourcePath, a concrete content subject, visible website author/work label where inspected, and a historic/rights/edition warning.
- `data/source-text/icrsp-france-b11-51-crossdomain-content-handoff.v1.json`: complete 51-article themes integrated with 11 previously inspected pages, repeated-source-body group references, current app-owner checks, and 10 scoped priority queues.

All content topics are paraphrased research notes; no complete modern French commentary, historic poem or purported original-author quote is copied into the repository.

## High-value examples with their actual source identities

1. **Lent Ember Wednesday**, `a0173_ancien`: the site discusses Moses and Elijah's forty-day fasts, the Ember fast and station at Santa Maria Maggiore. Guéranger and Schuster also give explanations of historical ordinations. The original historical rites are not assumed obligatory in 1962.
2. **Friday Lent II**, `a0186_ancien`: the station at San Vitale accompanies Parsch's juxtaposition of Joseph cast into the pit, the wicked tenants and the Passion. This is a possible Scripture-parallels experience, not a literal identity of biblical events. Older sweeping anti-Jewish rhetoric in the same work requires explicit editorial review/exclusion.
3. **Thursday Lent IV**, `a0205_ancien`: Schuster places the raising of a child by Elisha alongside Christ raising the son of the widow of Nain; source path and exact verses must be maintained without flattening two readings.
4. **Wednesday Lent III**, `a0193_ancien`: first ancient scrutiny of catechumens in a historical Roman setting; the Gospel's teaching on commandments is combined with the meaning of true charity in Parsch's source commentary. Do not turn this into reader posture or ceremony instructions.
5. **Saturday Lent III**, `a0198_ancien`: Schuster recounts an ancient second scrutiny alongside the Roman station at Santa Susanna and the Susanna story (Daniel 13). He explicitly distinguishes historical *Ordines* readings from the later Missal.
6. **Lent Ember Friday**, `a0176_ancien`: the Twelve Apostles station, Bethesda paralytic and penitence/baptism imagery; the conjecture about a former local pool named Bethesda must remain a conjecture.
7. **Sixth Sunday after Pentecost**, `a0231_ancien`: Guéranger attributes an interpretation of the seven baskets and spiritual beatitude to Ambrose, whose exact original work and location have *not* been checked.
8. **Twentieth Sunday after Pentecost**, `a0486_ancien`: Schuster associates the eucharistic motif with Melchizedek, manna and Elijah's bread. Some Melchizedek references already appear in existing ordinary Formation sources, so **do not duplicate a generic Eucharistic explanation**.
9. **Twenty-first Sunday after Pentecost**, `a0487_ancien`: an Esther/Mordecai source and spiritual armour in Ephesians 6; Vulgate Greek-addition order needs explicit canonical Bible/source-witness gating.
10. **Twenty-third Sunday after Pentecost**, `a0245_ancien`: Jeremiah's exile-and-return hope as the temporal year approaches Advent. The adjacent Last Sunday `a0246_ancien` remains source-verified by existing `Tempora/Pent24-0`, but the 1962 Calendar and Proper resolver remain authoritative.

## Conservative current-app textual parity check

For eight actual current owner files (Calendar customs, Calendar intelligence, Mass Explorer runtime, current Mass Formation, bilingual prayer explanations and Mass-moment/Scripture contexts) an exact accent-folded keyword check found **no exact phrases** like `aperitione aurium`, `san lorenzo in lucina`, `san vitale`, `Naaman`, `dominica vacat` or `santa pudenziana`.

Conversely, `melchisedech` already appears in some existing Formation/prayer/Scripture files, meaning a generic study of Melchizedek/Eucharist could be redundant.

**This is not semantic or exhaustive application coverage verification**: content could use different wording or be owned by other modules, especially Saints, Sacred Places, Scripture compendium, Calendar day-specific witnesses, and domain-specific guides. Therefore **zero real missing app features or content gaps are certified**.

## Concrete source-body duplicates and safety holds

The existing 189-article Temporal text-fingerprint audit has **one duplicate group intersecting the 51 selected articles**, `ICRSP-TEMP-HASH-G27`, attached to panel 1 of Fourth and Fifth Sunday after Pentecost (`a0222_nouveau` and `a0223_nouveau`). This does not mean their actual Mass Propers or all commentary are identical; do not analyze the one repeated panel twice if later collecting authentic textual witness.

The B11 source review also detected older collective-responsibility and anti-Jewish polemic within some nineteenth-century commentary, especially the Ninth Sunday after Pentecost (`a0243_ancien`) and certain Lent/Passion articles. A separate **`ANTI_JEWISH_POLEMIC_EDITORIAL_HOLD`** cluster explicitly prevents automatic use of this material as factual, universal, or authorless app narration. Scholarly documentation of a historical author is distinct from repeating their polemic in devotional teaching.

Historical Greek/Mozarabic poetry, obsolete vigils/old Prefaces, ordination customs and stational practices stay separate from the **1962** reader's Mass rubrics. Original author printed editions, translation reproduction rights and precise origin remain unverified.

## Prioritized next release-safe content work

The integrated handoff records **10 domain-owner clusters**. Recommended sequence, using existing owners rather than any new module:

- **P0 conflict controls:** last Sunday/resumed Sunday source-ownership and 1962 proper selection; historical anti-Jewish polemic exclusion; historic foreign rite and protected-poetry hold. No reader edits.
- **P1 original-source collation:** ancient Lenten catechumenate and Ember practice; Roman stational churches and church location histories; Scripture parallels, especially Elisha/Nain and Naaman/Baptism; patristic citations from Ambrose and Leo.
- **P2 selective interpretative additions:** selected chant/reading relationships and genuinely day-specific Mass themes that are not already expressed by the existing 84 bilingual Ordinary explanations and eight Formation stages.
- **P3 general moral/virtue material:** discard unless it provides a precise, missing and independently sourceable interpretive insight.

Every future promoted sentence requires **exact work, original edition, page/locus, precise scope, agreement with existing content owners and either rights clearance or safe link-only presentation**. This pass made **no app content changes**.

## Acceptance, regression tests and evidence storage

`tests/test_icrsp_b11_51_content_owner_handoff.py` independently checks 51 identities, 11+40 partition, 227 panel total, no inferred rights or missing features, the duplicate source-body group, the editorial hold, and the distinction between a search in eight files and genuine corpus-wide parity. The read-only workflow `.github/workflows/icrsp-gap-integrity.yml` now runs B11 alongside earlier source-path/Calendar/Mass Explorer integrity checks.

The GitHub research branch retains the URL/provenance metadata and reviewed topic summaries. The full 783-page commentary panel metadata in the previous Actions artifact is **time-limited**; longer-term preservation under a free permanent archival plan remains necessary. All work remains in a **draft PR**, with no production app source changes.
