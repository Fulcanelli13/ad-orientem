# Morning/Evening Prayer — verified bedtime selection batch (28 October 2026)

## Boundaries and overlap

Only the existing personal **Evening Prayer** opt-in prayer bank is touched. No change to the historical St Pius X printed order or its source forms: 1913 Evening core = 10 cards, 1905 Evening core = 8. The already accepted 25-item ICKSP/ICRSP research work and **complete Office of Compline** development remain in separate draft PR #1800. This batch **does not duplicate or publish that Office**. No prayers, artworks or source files are removed.

## Witness-to-identity comparison

| Identity | Existing optional source-language coverage | Gap resolved here | Citation / identity decision |
| --- | --- | --- | --- |
| Visita quæsumus (Compline collect) | English, Moran 1883; French, Catechism of Trent appendix 1905 | Latin complete Roman Compline collect, optional | Public-domain Corneille, *Vêpres des dimanches et complies*, ed. Marty-Laveaux: https://fr.wikisource.org/wiki/%C5%92uvres_de_P._Corneille_%28Marty-Laveaux%29/Tome_9/V%C3%AApres_des_dimanches_et_complies. Related concept, not a duplicate text/language. |
| Salva nos (Compline antiphon at Nunc dimittis) | English, Moran 1883 | Latin complete antiphon, optional | ICRSP France *Office des Complies*: https://icrspfrance.fr/textes-liturgiques.php?article=a0141_ancien. In Office it is attached to Nunc dimittis; in the personal rule it remains **clearly labelled a separately selected antiphon**, not Compline. |
| In manus tuas (Compline short responsory) | No source-bank record | Latin complete ordinary form and French ordinary form, independently keyed to their source language | ICRSP France *Office des Complies*: https://icrspfrance.fr/textes-liturgiques.php?article=a0141_ancien. Ordinary responsory contains the repeated response, Redemisti **nos**, Gloria Patri, final response. It has distinct Passiontide and Eastertide versions. |
| Evening intercessions for living/departed | Moran 1883 for departed, French 1905 appendix for living/departed; optional De profundis 1913 | None | Already present, not duplicated. |
| St Pius X evening protection | Printed 1913 and 1905 orders | None | No Compline texts are misrepresented as compulsory printed St Pius X stages. |

## Release decisions

- Four additional selections: 3 Latin and 1 French. Source-led total rises **40 → 44**. They are separate from the **1913/1905 supplements** and unavailable in English until a verified historically suitable English formulation is separately incorporated; no automatic machine translation.
- New Latin choices fill the previously empty Latin manual-addition pool. The normal reader's English and French translations of the *St Pius X core* remain unaffected.
- Source type is `sourceWebChecked`, **not** `sourceImageChecked`: original primary source webpage was inspected. All original manual records preserve their original image-checked status.
- The full responsory is the **ordinary** form, not a universal 1962 text for all seasons. On each selected text, a contextual note discloses seasonal differences. Appending a user-selected Office excerpt does not imply the user performed Compline.
- The *Visita* Latin spelling and accents follow normalized traditional orthography; source is the original public-domain Roman collect. No permission, payment, new hosting or storage.
- Individual variants remain separate: selecting an optional source never deletes, changes, silently replaces or splits an edition-original Pius X prayer.

## Test and release gates

`tests/daily-personal-rule.mjs`: unique identity, language holds, source-checked records, exact St Pius X baseline lengths, optional select/deselect, full-text context.
`tests/pray-traditional-dual-axis-phone.mjs`: Latin Evening three options, one appended responsory and reversibility, manual horizon total, saved settings.
Run full main CI and mobile acceptance before merge.

## Explicitly outstanding

- Attested historical English *In manus tuas* responsory: do not invent a modern translation or borrow an unverified contemporary edition.
- Liturgical calendar-aware seasonal responsory variants, if ever made live, belong to the **full Compline Office** pipeline rather than an ad-hoc personalization patch.
- Complete systematic ICKSP/ICRSP text identity comparison, remaining non-bedtime devotions, and licensed artwork audit belong to the standing ICKSP or Sacred Art pipelines, not this overlapping mini-batch.
- The future Short/Complete rule selector stays source-gated; this batch does not bypass the manifest.
