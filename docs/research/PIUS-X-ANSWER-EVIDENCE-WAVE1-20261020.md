# St Pius X — first answer-level review wave: 13 focused families, 100-family source screen

**20 October 2026 · Research-only, no character publication.**

## Outputs added to PR #1458

1. `data/learn/research/pius-x-mass-eucharist-penance-26turn-evidence-20261020.v1.json` — **13 source-inspected draft families and 26 turns**, preserving the original bilingual answers while mapping them to exact 1905 numbered Italian Catechism questions. Contextual magisterial document units are identified for eight source-passage owners, with preliminary old Denzinger citations preserved from the shared Magisterium research PR #1452. **Zero** independent original-print, theology, rights, bilingual or historical voice certifications.
2. `data/learn/research/pius-x-sacraments-100family-200turn-source-screen-20261020.v1.json` — **100 families / 200 turns** from B09–B10, corresponding to **100 distinct numbered 1905 Q567–666 source anchors**. All 200 draft turns declare at least one question support ID; those IDs are copied, checked for shape and made independently addressable. This is **not** a claim that 200 turns have undergone original-text claim-by-claim semantic verification.
3. Contract tests `tests/pius-x-26turn-source-evidence.mjs` and `tests/pius-x-sacraments-100family-source-screen.mjs` compare provenance, questions, original draft answers, review statuses and overlap accounting against the intact source files. Both are added to the existing SPX research CI workflow.

## Original witness and doctrine context

- Digitally inspected Italian original: [1905 Catechismo maggiore, Sacraments Q596–614 and Q651–664, Penance Q688](https://www.museosanpiox.it/documenti-scritti-da-pio-x/il-catechismo-maggiore-di-san-pio-x/parte-quarta-dei-sacramenti/).
- Digitally inspected Italian original: [1905 Catechismo maggiore, Church Q197–203](https://www.museosanpiox.it/documenti-scritti-da-pio-x/il-catechismo-maggiore-di-san-pio-x/parte-prima-il-credo-o-simbolo-apostolico/).
- Original council document leads: Trent [Session XIII](https://en.wikisource.org/wiki/Canons_and_Decrees_of_the_Council_of_Trent/Session_XIII/Sacrament_of_the_Eucharist), [Session XIV](https://en.wikisource.org/wiki/Canons_and_Decrees_of_the_Council_of_Trent/Session_XIV/Sacraments_of_Penance_and_Extreme_Unction), [Session XXII](https://en.wikisource.org/wiki/Canons_and_Decrees_of_the_Council_of_Trent/Session_XXII/Sacrifice_of_the_Mass), and Vatican I [Pastor aeternus chapter IV](https://www.vatican.va/archive/hist_councils/i-vatican-council/documents/vat-i_const_18700718_pastor-aeternus_la.html).
- The **1905 Catechism was prescribed under Pius X**, but must not be mislabelled a personal utterance written by him. These digitized witnesses are not yet checked against the original printed 1905 edition. 1911 Bannwart old-Dz numbers in Magisterium PR #1452 remain named-OCR-based references, not print-page or modern DS/DH certification.

## Notable source-to-answer issues found

- **SPX-1905-S-607 / transubstantiation:** the draft answer includes substance/species and remaining appearances. Q607 only names transubstantiation; the full meaning requires **Q596, Q609–610**, plus Trent XIII canon II. Follow-up answers Q608.
- **SPX-1905-E-651 / historical sacrifice definition:** the draft's general phrase about a sacrificial change or destruction needs tight comparison with original Q652 and review for conceptual nuance.
- **SPX-1905-E-654/655/656/657:** avoid presenting the Mass as a second death or sacrifice independent of Calvary; preserve the same victim/different manner of offering in Trent XXII chapter II, and Q657's distinction between sacramental signification and the whole Christ present by concomitance.
- **SPX-055 / papal infallibility:** original Q197 and Q199 plus *Pastor aeternus* chapter IV support the narrowly defined ex cathedra scope. The illustrative exclusion of scientific or historical remarks is an editorial inference requiring ordinary theological approval.
- **SPX-1905-P-688 / absolution:** original Q688 is supported directly; Trent XIV canon IX addresses the judicial character of sacramental absolution, rather than a mere declaration.
- **SPX-1905-E-663 / Mass honouring saints:** Q662–664 and Trent XXII chapter III distinguish offering sacrifice to God from commemorating or honouring saints.

## Practical routing and repetition issue

The 100-family source screen detects **99 within-cohort follow-up-to-other-family opening-source reuse edges**. This is an artifact of the practice of taking the adjacent next printed Catechism question as a dialogue follow-up; it does not establish 99 semantically duplicate answers. If naively stitched together, this can produce near-verbatim repeated questions and many unnatural two-turn continuations.

**Consolidation rule:** Treat 1905 Q numbers as evidence anchors, **not** canonical conversation IDs. Preserve every source QID and multilingual draft; choose a small number of distinctive top-level visitor intentions in a separate reviewed semantic routing map. Related numbered questions are reachable as follow-ups and drill-downs, rather than all being independent entry points. Do not merge without human review of question meaning and continuity.

Source-cohort distribution:
- Confirmation: 29 source questions.
- Eucharistic presence: 21.
- Eucharist institution/effects/Communion: 29.
- Historical Communion precept: 5 (dated discipline must remain explicit).
- Mass sacrifice: 14.
- Attending Mass: 2.

The Chanoine is always an optional visitor-approved switch, preserving context. **Seven** of the 13 focused families have a possible Mass-sacrifice or Eucharistic-change answer-owner association in the existing source-extractive Canon pilot, but the general router topics are still held research navigation, not approved character answers. No unavailable Chanoine reply is advertised as already verified.

## Sequence of next editorial work

1. Resolve the 99 next-question reuse edges by proposing canonical conversation topics with explicit subquestions, starting with sacrificial theology Q651–664 and sacramental Eucharistic presence Q596–619. Do not destroy existing draft ID/source references.
2. Inspect the remaining B09–B10 source-question *answers* against each turn, not just the declared Q-number alignment. The 13-family/26-turn sample demonstrates the required review granularity.
3. Expand Denzinger original-document-unit candidates through the Magisterium owner; confirm page-image and edition-specific numbers rather than copying old Dz OCR values as final citations.
4. Verify proposed Canon source-owned answers topic-by-topic and attach exact return tokens to actual native route owner.
5. Human EN/FR translation, historical voice, doctrinal precision and image/rights approval; publish none of these research drafts before all applicable gates pass.

**No public runtime, source-owner Catechism answers, visual-novel sprites, Mass reader cards or production branches were changed.**
