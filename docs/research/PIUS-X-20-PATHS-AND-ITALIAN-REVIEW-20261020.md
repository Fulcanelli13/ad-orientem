# St Pius X — replace 99 forced adjacent-question continuations with source-preserving dialogue paths

**20 October 2026 · Content research only; no public historical dialogue, audio, app runtime, or canonical source ownership changed.**

## Completed

The 100-family / 200-draft-turn 1905 Sacraments cohort covers consecutive original questions **PX1905-Q567–Q666**. The previous authoring pattern appended the following numbered source question to each opening: **99** source-order reuse edges. The next question was then independently repeated as the following family's opening.

That sequence *keeps the Catechism intelligible as a book*, but it does not yield natural SPX conversation. The new research-only file `data/learn/research/pius-x-100questions-20-conversation-paths-20261020.v1.json` proposes **20 thematic conversation pathways**. It preserves:
- all **100** original source QIDs and the existing **200** EN/FR draft turns;
- all **99** source-order edges as historical relationships (**80** within a proposed pathway, **19** crossing pathway boundaries);
- original draft file paths and 1905 digital-witness source attribution;
- multiple possible entrypoints inside each pathway so a visitor can begin at a specific question rather than being forced to start at the first historical printed item.

Every old `Q(n) → Q(n+1)` follow-up is marked **`notAutomaticDisplay=true`**. A proposed conversation choice is intentional and source-aware, not a predetermined numbered-question train. No original answers are deleted or merged, and **0 distinct-intent classifications have been independently certified**.

## Twenty proposed conversation paths

| Family | Original questions | Main purpose |
|---|---|---|
| Baptism promises | 567–570 | Baptism of desire/blood, duties and renunciation |
| Baptismal sponsors | 571–576 | Patron saints and duties of godparents |
| Confirmation: meaning | 577–579 | Grace and gifts of the Holy Ghost |
| Confirmation: rite | 580–587 | Chrism, minister, traditional rite and symbolic signs |
| Confirmation: preparation | 588–595 | Preparation, nonrepeatability, sponsors |
| Eucharist: Christ present | 596–598 | Presence of Christ, identity and reasons for belief |
| Eucharist: Consecration | 599–608 | Matter, forms, timing and priestly consecration |
| Eucharist: substance/species | 609–611 | What changes and what remains |
| Eucharist: whole Christ | 612–619 | Whole Christ under either species or divided particle |
| Tabernacle and adoration | 620–621 | Reservation, worship and Communion of sick |
| Institution and fruits | 622–627 | Why the Eucharist was instituted, grace and effects |
| Receiving worthily | 628–632 | Dispositions, conscience and Confession |
| Historical Communion fast | 633–635 | Older fasting rules and exemptions |
| Communion reverence | 636–645 | Preparation, thanksgiving, historical manner of receiving |
| Historical Easter precept | 646–648 | Annual Communion and children |
| Frequent Communion | 649–650 | Frequency and its 1905 historical setting |
| Nature of the Mass | 651–654 | Eucharist as sacrifice, meaning of Holy Mass |
| Mass and Calvary | 655–658 | One sacrifice, different mode of offering |
| Ends and fruits of Mass | 659–664 | Four ends, offerer, saints and participation |
| Fruitful hearing of Mass | 665–666 | Modesty and interior participation, with Q667 as external follow-up |

The boundaries are **editorial navigation candidates, not dogmatic divisions**. A visitor interested in the meaning of transubstantiation may enter with Q607; a visitor asking why bread still looks like bread may enter Q609. Both consult the original QIDs but need not be forced through ten unrelated preliminary questions.

## One example: Mass and Calvary (Q655–658)

Suggested dialogue progression rather than four repetitive draft conversations:
1. **Visitor:** “Is the Mass the same sacrifice as Calvary?” → *1905 Catechism* Q655.
2. **Visitor chooses:** “How can the manner of offering differ?” → Q656.
3. **Visitor chooses:** “Why are bread and wine consecrated separately?” → Q657 with the essential doctrine of concomitance preserved.
4. **Visitor chooses:** “Why offer Mass if Calvary was sufficient?” → Q658.

Adjacent “printed next” prompts remain discoverable when relevant, but cease to be repeated opening–follow-up pairs. A contextual Chanoine switch is offered by explicit consent; the existing source-owned `apostolate:AQ04` Mass-sacrifice pilot is the possible answer resource. The APOL-031 shared-router topic is still marked `SOURCE_GAP` in PR #1443, so it must **not** silently grant Chanoine answer availability.

Original magisterium candidates: Council of Trent, Session XXII chapter II (Magisterium `MG-P005`, old Dz 940 as **1911 OCR lead**, not published certified). Do not convert old number 940 to a modern DH reference without an edition-certified concordance.

## Focused digital Italian review: 31 families / 62 turns

A second new research file, `pius-x-31family-62turn-italian-review-20261020.v1.json`, spot-checks 31 high-value, sensitive or potentially misleading numbered questions against the online Italian 1905 question-and-answer text at the [Museo San Pio X, Part IV](https://www.museosanpiox.it/documenti-scritti-da-pio-x/il-catechismo-maggiore-di-san-pio-x/parte-quarta-dei-sacramenti/).

- **62** drafted turns were examined against their linked Italian digital source question-and-answer context; **zero** independent critical-print collation or theology certifications.
- **Five** turn source-locator arrays need supplemental supporting QIDs beyond those declared in the original draft. E.g. Q607 names transubstantiation, but the first draft's references to substance and remaining species also require Q596, Q609–610; Q633 requires Q628 to establish the midnight-fast timing.
- **19** selected families have an explicit historical, doctrinal-scope or individual-conscience review flag.
- The English/French conversation originals remain unchanged, including their bilingual text and existing IDs. The flags instruct later reviewers to clarify or correct, not to claim a completed fix.

### Historical traps to preserve

**Confirmation:** 1905 Q576/Q595's sponsorial spiritual-kinship matrimonial effects, Q583–587's older Confirmation ceremonial particulars and Q589's suggested age of about seven must be presented as historical text, not universal present-day canonical discipline.

**Holy Communion:** Q628 and Q633–635's midnight-fast and exemptions are no longer generally applicable as written. Q642–645 reflects the historical manner of communicating. Q646 refers to annual Communion in one's own parish; Q647–648 concerns First Communion capability, to be read also in light of the later 1910 `Quam singulari` discipline. Q649–650's wording comes from the 1905 text and must be distinguished chronologically from the decree of 20 December 1905 encouraging frequent/daily Communion.

**Personal conscience:** Q630–632 should convey the source's sacramental teaching without pretending that a text-only avatar can judge the moral state or guilt of a particular visitor. The Chanoine can address theological questions, but personal sacramental situations require an actual priest/confessor.

**Mass and real presence:** Preserve Q657's distinction between the sacramental signification effected by separate words of consecration and the concomitant presence of the whole Christ under each species. The Pope's approved Catechism is not a transcript of his spoken first-person words.

### Publication and three-way source contract

Each pathway carries:
- original `PX1905-Q` source IDs and original owner paths;
- bilingual direct-entry question prompts, separate from answer approval;
- Magisterium original-document candidates with edition-qualified **old Dz OCR** numbers where already available (seven relevant pathway groups), **not** invented Denzinger entries to fill the other groups;
- an opt-in Chanoine transfer with original question, language, historical context, source evidence and current conversation preserved, while answer eligibility remains unapproved;
- historic-discipline hold flags and a refusal to publish until source-text, theology, translation, voice and edition/rights checks are satisfied.

There is no source-to-Denzinger citation that can be released merely because a family is assigned to a pathway. Denzinger references must relate to each **claim**, not simply to a general theme.

## Acceptance gate

`node tests/pius-x-20path-consolidation.mjs` checks against the original 100-family source ledger:
- exact one-to-one coverage of all historical QIDs and preservation of draft source ownership;
- 20 proposed paths, 80 same-path + 19 cross-path historical edges, all **nonautomatic**;
- 31 original research-review records and both original bilingual draft turns unchanged;
- explicit refusal to publish, auto-route an uncertified Chanoine answer, or display a provisional old Dz OCR lead as approved.

**No merge to main, no visual-novel revision and no production release.**

## Next batch

The remaining source-meaning verification should prioritize **Q599–608 (Consecration)** and **Q625–645 (Communion effects, dispositions and reverence)**, then extend to Confirmation (Q577–595). At each step retain original Italian text and precise question IDs, correct EN/FR editorial paraphrases without borrowing direct papal voice, and keep all three-way reference statuses independently auditable.
