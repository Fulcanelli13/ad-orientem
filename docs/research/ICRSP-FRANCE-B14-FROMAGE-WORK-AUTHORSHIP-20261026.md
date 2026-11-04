# ICRSP B14 supplementary correction — Guéranger work label versus Fromage continuation

**26 October 2026** · [Issue #1665](https://github.com/Fulcanelli13/ad-orientem/issues/1665) · [draft PR #1666](https://github.com/Fulcanelli13/ad-orientem/pull/1666)

## Decision

Preserve the already verified **492** ICRSP commentary panels with source-site label `GUERANGER_ANNEE_LITURGIQUE` **exactly as a website WORK LABEL count**. It would be historically misleading to display 492 as individually authenticated passages written by Prosper Guéranger.

### Independent bibliographical support

- **Solesmes Abbey**: [Introduction à l’Année liturgique](https://www.abbayedesolesmes.fr/produit/introduction-a-lannee-liturgique/). It states that Guéranger's writing ends before Trinity Sunday and that Dom Lucien Fromage completed six further volumes on the time after Pentecost.
- **Bibliothèque nationale de France**: [1902–1908 collected edition record](https://catalogue.bnf.fr/ark:/12148/cb318196703), whose title inventory explicitly says `Le Temps après la Pentecôte. Continuation [par dom L. Fromage]`. A companion [BnF edition record](https://catalogue.bnf.fr/ark:/12148/cb32133488h) lists Fromage as an additional author.

This is enough to **flag collected-work versus personal author attribution**, not enough to assert an exact book volume and page for every one of the ICRSP articles. The B10 sample comprises **22** post-Pentecost Sunday source articles (third to twenty-fourth) with the Guéranger work-family label. Each now has a research-only Fromage continuation flag, preserved source URL and current Ad Orientem Proper source-path owner. **Zero** individual day paragraphs have been matched to photographed original printed continuation title pages.

Research source: `data/source-text/icrsp-france-b14-continued-work-authorship-and-original-loci.v1.json`. Permanent top-level caveat: `data/source-text/icrsp-france-commentary-783-verified-summary.v1.json#authorWorkAttributionCorrection`.

Do NOT replace the entire 492-panel website label family with Fromage: the sample contains both pre- and post-Pentecost material, and other period portions must be resolved by the exact volume and chapter witness.

## Original language/source role — Ambrose on Naaman

The already-existing B13 patristic handoff lists **Ambrose, *De mysteriis* III.16–17** as a bibliographical lead for the sacramental interpretation of Naaman, with primary Latin approval outstanding.

A retrievable **Latin transcription in a Migne PL 16 edition** is now located at [Latin Wikisource, *De mysteriis* (ed. Migne)](https://la.wikisource.org/wiki/De_mysteriis_(ed._Migne)); numbered §§16–18 explicitly treat Naaman's immersion in the Jordan, cleansing by grace rather than mere water, and the sacramental catechesis. The source identifies **Migne, 1845; Corpus Corporum-derived transcription; no modern critical apparatus**. This verifies a concrete Latin-language locator and substantive context. It does NOT mean that a photographed 1845 printed folio, modern textual-critical apparatus, downstream publisher permission or original historical Guéranger page was verified.

The separate existing B14 source claim register `data/source-text/icrsp-france-b14-gueranger-aphrahat-source-claims.v1.json` **already owns** the two digitally cross-hosted Lent texts (Naaman and Susanna), as well as Aphrahat loci. They were explicitly removed from this supplementary file rather than being counted as new discoveries.

## Source-and-publication boundary

- ICRSP hosted passages, the Solesmes book description, original Latin testimony and personal author identities each have **different source roles**. None automatically supplies a 1962 Mass/Calendar rubric.
- All original historical text reproductions remain rights-gated; no copied French source prose is committed.
- No public app author labels, saints, saints’ feasts, reader cards, cue icons, Schola sequences, existing Calendar calculations or Scripture-compendium source IDs changed.
- The independent Scripture Correspondences workstream (PR #1553) retains ownership of any direct Ambrose/Naaman typology integration.
- Any later user-facing citation should say *L’Année liturgique* and its specific continuation authorship **only after original volume/title/section verification**, not presume Dom Guéranger is personally speaking.

## Acceptance and next high-volume action

`tests/test_icrsp_b14_fromage_personal_authorship.py` checks unchanged 492 work labels, the exact 22 source URL/path identities in B10, no printed edition certifications, and strict separation of this finding from the already owned parallel B14 digital concordances.

Next systematic review: expand the author/work distinction across the full **492 label occurrences** by season/feast and original work volume, classifying `GUERANGER_PERSONAL_WORK`, `FROMAGE_POST_PENTECOST_CONTINUATION`, `OTHER_CONTINUATION_OR_EDITOR`, `EDITION_SCOPE_UNRESOLVED` only when the underlying source section/printed edition supports it. Do not produce another independent B11/B12/B13 corpus.
