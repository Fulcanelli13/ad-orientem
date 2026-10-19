# Ad Orientem — Magisterium Ultra Master: P0–P1 registry

**19 October 2026 · Research-only; publication not authorised**

## Governing decision

**One canonical doctrine subject; multiple source-owned contributions.** The Magisterium library is an archival/reference layer shared with St Pius X, Monsieur le Chanoine, the Sacristan, Catechism, Apologetics, Church Crisis and Mass Explorer. It does **not** become a fourth avatar or a rival answer corpus.

The primary identifier is the **original issued document** (issuer, date, actual text and local passage). Denzinger numbers are scholarly concordance references **to particular passages**, never a substitute document identity, a blanket authority level or proof that an entire historical text remains applicable.

Existing **content ownership rules remain unchanged**: positive doctrine stays with the Catechism; objections with Apologetics; controversies with Church Crisis; Roman Mass mechanics with the Mass owner. Magisterium links into these records but does not overwrite any.

## Deliverables — first actual batch

| Dataset | Recovered/created | Status |
|---|---:|---|
| `data/learn/magisterium-ultra-master-documents.v1.json` | 83 document candidates: 68 issued through 1962, 15 later documents | **Index only** |
| Existing formation research reconciled | 27 documents already mentioned in existing source packs (31 source-ledger links) | References/URLs remain unapproved source leads |
| Document-level web locations located | 7: 2 original Latin Vatican pages, 1 Vatican translation, 4 Council of Trent records accessible through a later public English transcription | Textual, authority and licensing review still pending |
| `data/learn/magisterium-ultra-master-doctrines.v1.json` | 51 doctrine subject headings; 101 document relationships | Relationships proposed; not yet passage-to-claim certified |
| Existing app owner links | 53 Apologetics, 10 Church Crisis links, plus selected Pius X Catechism questions | No duplicate answers |
| `data/learn/magisterium-source-passages-pilot.v1.json` | 8 passage locators in the first six high-priority doctrine families | **No passage content copied** |
| Denzinger crosswalk | 6 **candidate** passage concordances (modern and, when found, older reference) | None yet approved as edition-certified |

A corpus-reference link **does not** mean every claim in the topic is historically or doctrinally approved. This research pass deliberately shows source gaps instead of inventing them away.

## Our first six applications

1. **Real Presence and transubstantiation** — Trent, Session XIII: decree and canons. Relevant to Pius X, the Canon and the Elevation/Consecration moments in Mass Explorer.
2. **Sacrifice of the Mass** — Trent, Session XXII, chapters I–II and later canons: reference for the Canon and Mass Explorer; do not confuse Trent's council teaching with an invented first-person statement by the Canon.
3. **Penance and absolution** — Trent, Session XIV; links to the Catechism and sacramental formation.
4. **Papal infallibility** — Vatican I, `Pastor aeternus`, chapter IV; source-linked to Pius X's catechetical discussion and the Canon's apologetics on authority.
5. **Immaculate Conception** — Pius IX, `Ineffabilis Deus`, definition; distinct from historical commentary on devotion.
6. **Scripture and apostolic Tradition** — Trent, Session IV; keep related topics of inspiration, biblical canon and Tradition distinct.

## Schema principles

- **Document registry** — unique ID, exact issuer (Council, Pope or Congregation), year, form, historical layer, topic families, verified source pointers, outstanding provenance, edition-specific crosswalk placeholders, whether source text was actually acquired, reproduction rights, authority review and publication status.
- **Doctrine registry** — unique doctrine subject, source-document candidates, links to current research-owner IDs, and an explicit status for each unverified document-to-topic relationship.
- **Passage registry** — unique excerpt locator (chapter, canon, definition, section), link to its original document and topics, source language, *candidate* Denzinger numbers and exact edition evidence, copyright/licence review and theological certification.
- **Character bridge (later)** — character answer segments must reference their character's own verified primary corpus **and may attach authoritative Church declarations**. Denzinger quotations must be recognised as editorial compilations, not claimed to be words personally written by Heinrich Denzinger or by a character.
- **Historical and modern law distinction** — a 1905 decree on daily Communion or a 1953 Eucharistic fast is recorded under its original issuer and year; nothing displays as today's binding law without a separate current-law evaluation.
- **Authority** — no numerical “magisterial rank” from document type. A document often contains different kinds of assertions. Record the actual passage's issuer, intended addressees, act and teaching scope; human review follows later.

## Why editions need care

*Denzinger, Enchiridion symbolorum* exists across multiple printings and editorial regimes. Printed old `Dz`, Denzinger–Schönmetzer and Denzinger–Hünermann conventions cannot be mechanically equated.

This batch therefore assigns **no final document-wide Denzinger number**. The pilot contains six **candidate passage-level** references requiring edition inspection: Trent's Scripture and Tradition decree (1501), transubstantiation (1642), canon on Real Presence (1651), Mass sacrifice (1743), Vatican I's infallibility definition (3074), and the Immaculate Conception definition (2803). All are expressly **provisional**; one-to-one equivalence across older numbering is not assumed. Exact passage provenance matters more than a large list of purported Denzinger numbers.

## Source and reproduction policy

Prioritise Vatican `vatican.va` original Latin where available, other historical Latin critical editions with citation and rights review, and carefully attributed public translations. An Internet translation's existence does not mean it is permitted to embed full text in a commercial app. In particular, **do not reproduce a contemporary edited Denzinger translation, arrangement or notes without rights clearance**. Do not use LLM paraphrases as original text.

Original historical documents, critical scholarly compilations, translations and secondary explanations are separate source types; only the original magisterial act sets its own authority. Catalogues are navigation aids.

## Next high-volume research batches (without one-by-one review)

1. **Coverage expansion:** fill source language, original document URL and period-correct bibliographic locators for the other 76 documents; add missing councils and papal acts by era. Record source-locator proof per document.
2. **Passage extraction:** systematically work through the six pilot areas before extending to Christology, grace, seven sacraments, Church, moral theology, social doctrine and last things. Each excerpt should be compact but context-preserving, including surrounding qualifications and canons.
3. **Crosswalk reconciliation:** verify **each** old/modern Denzinger number at the passage level against the named edition; record genuine absent entries.
4. **Overlap mapping:** connect approved passages to the existing Catechism, APOL-001…060, Church Crisis, Mass Explorer and character-specific sermons. Do not let an APOL research-dossier title certify a Canon quotation.
5. **Publication gate:** review original-language accuracy, translation/reproduction rights, doctrinal scope and character-source authenticity before any visitor-facing “Read the Church's definition” action.

**Not authorised now:** a fourth Denzinger avatar; autogenerated character answers; blank Denzinger numbers filled from a guess; religious-controversy conclusions; publication of uncured translations; a new independent doctrinal answer owner.

## Batch B2 — passage locator expansion (19 October 2026)

After source-page review, the pilot expands from **8 to 26 separately identified passage locations**, adding **18** locators without importing a single passage as visitor-facing text. Research witnesses now include the Latin Trent Session IV and XIII transcriptions, the Vatican Latin *Pastor aeternus*, the Vatican Italian *Ineffabilis Deus*, its Latin defining formula independently visible in a historical Latin footnote, and historical English translations of Trent XIV and XXII. *Ineffabilis Deus* still needs a full original-Latin critical witness. Trent XIV and XXII also require checked Latin witnesses at the relevant chapters/canons. Each witness explicitly distinguishes official Vatican, historical transcription, and online editorial reference index.

**14 modern-number candidate anchors, zero edition-certified concordances.** When a source labels a pair as “DH / DS” or “number / Dz”, those are recorded only as the source's displayed online index and a research lead, not as proof of exact Denzinger–Schönmetzer or Denzinger–Hünermann edition page/entry identity. For instance, Trent XIII chapter IV maps online to 1642 / 877 and canon II separately to 1652 / 884; a chapter and canon are not interchangeable. Source: https://rkdocumenten.nl/toondocument/679-sessio-xiii-decretum-de-ss-eucharistia-lat/.

The new records deliberately separate 1546 Trent's two Session IV decrees; Eucharistic chapters from their canons; Penance's sacramental form, contrition and priestly absolution; *Pastor aeternus* chapter III on primacy from chapter IV on infallibility; and background discussion in *Ineffabilis Deus* from its definition. For Mass Explorer, Trent XXII chapters IV–V offer **doctrinal context**, never a replacement for 1962 rubrics or a licence to interpolate character dialogue.

**Outstanding gates:** Latin witnesses for Trent XIV and XXII; bibliographic edition checks for all 14 candidate numbers; independent translation rights; passage-level doctrinal/authority review; source-owned character bridge validation. Publication remains disallowed.
