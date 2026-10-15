# Biblical Atlas — curated, period-sensitive historical-name annotations
**15 October 2026 · editorial proposal, not a production map change**

## Decisions reached
Existing owner `src/find/bible-atlas.js:ATLAS_SETTLEMENT_LABELS` supplies **22** familiar English/French settlement/city names. The first-stage historical source work has already been merged through [#1239](https://github.com/Fulcanelli13/ad-orientem/pull/1239), [#1240](https://github.com/Fulcanelli13/ad-orientem/pull/1240) and [#1241](https://github.com/Fulcanelli13/ad-orientem/pull/1241). **Do not build another gazetteer or duplicate source objects.** Those files remain authoritative for Pleiades place identity, 128 original name records, original OpenBible pin provenance, and seven exact-site exceptions.

This branch records one new, narrower *editorial decision* per already-displayed alias, in `data/explore/biblical-atlas-contextual-name-proposals.research.v1.json`:
- **11** historically useful, bilingual short annotations (on named status/name changes or meaningful language forms), separately verified against published source URLs and their original Pleiades name URIs;
- **11** *deliberately suppressed* aliases, where an almost identical ancient spelling or an unqualified earlier name would add interface clutter or imply a false chronological change;
- **0** published names, pin shifts, route changes, Scripture narratives, and changes to the 151 event order.

**Display proposal:** familiar EN/FR city name remains the only permanent map-label text. If the context was editorially approved in future, the event's *existing detail sheet* could offer a compact one-line `Historical name / Nom ancien` disclosure with short linked explanation and one or two source links. **Not** a 22-name ticker, map overprint, filter, timeline date or redundant new reader. Pleiades name range `after/before` never sets a year for a Biblical event; the narrative eras are ordinal chapter groupings, not archaeological date bins. Transliteration and French wording require review. No signoff is inferred from the research test.

## Eleven useful context notes
| Atlas key | Historic form | Narrative scope and actual reason for note | Historic evidence |
|---|---|---|---|
| `jerusalem` | Aelia Capitolina | **Later name, invalid for Passion-era map**: Hadrian's Roman refoundation dates to about AD 130, not Christ's ministry | [Oxford Biblical Studies](https://academic.oup.com/reference/62341/reference-article-abstract/554104460?login=false) |
| `samaria` | Sebaste | **Later name, invalid for Omri's kingdom**: Herod renamed the older city; city name and region are separate geographical concepts | [Josephus, Antiquities 15](https://www.attalus.org/old/aj_15b.html); [Greek inscriptions chronology study](https://helios.eie.gr/helios/bitstream/10442/7398/2/A01.017.0.pdf) |
| `caesarea-maritima` | Stratonos Pyrgos | Herod transformed Strato's Tower into the port Caesarea encountered in Acts; `Maritima` stays as a familiar geographical disambiguator | [Josephus, Antiquities 15](https://www.attalus.org/old/aj_15b.html); [Cambridge Herodian archaeology](https://www.cambridge.org/core/services/aop-cambridge-core/content/view/604AAEDE98D9000F03DB78614AFA82EB/9781139013833c7_p170-191_CBO.pdf) |
| `joppa` | Ioppe | Recorded Greek form in the broad period of Acts; **language form, not a formal city-renaming event** | [Pleiades Joppa](https://pleiades.stoa.org/places/687931) |
| `nineveh` | Ninuwā | Earlier Mesopotamian name tradition, relevant for a Nineveh setting; not an independent historical dating of Jonah | [ORACC Ninua](https://oracc2.museum.upenn.edu/epsd2/cbd/sux/o0047097.html); [Pleiades](https://pleiades.stoa.org/places/874621) |
| `babylon` | Bābili | Ancient Babylonian language name with cuneiform lexicographic comparison; not a precise date for the exilic episode | [ORACC Bābili](https://oracc.museum.upenn.edu/geonames/cbd/qpn/x000000440.html) |
| `antioch-syria` | Theoupolis | Name adopted **only in AD 528** after earthquake, centuries later than the Acts account | [Ancient Literacy in Asia Minor](https://insaph.kcl.ac.uk/ala2004/narrative/sec-VI.html); [French academic study](https://www.persee.fr/doc/anata_1018-1946_2013_num_21_1_1344) |
| `tarsus` | Antiochia ad Cydnum | Hellenistic-era alternate name; the Acts-era city of St Paul should remain **Tarsus** | [Livius Tarsus](https://www.livius.org/articles/place/tarsus/); [Tabula Peutingeriana research](https://www1.ku.de/ggf/ag/tabula_peutingeriana/trefferanzeige_en.php?id=1441) |
| `philippi` | Krenides | Earlier name changed to Philippi by Philip II in 356 BC; Acts relates to the later Roman colony | [Princeton Encyclopedia of Classical Sites](https://www.perseus.tufts.edu/hopper/text?doc=Perseus%3Atext%3A1999.04.0006%3Aentry%3Dphilippi) |
| `corinth` | Colonia Laus Iulia Corinthus | Greek city's destruction in 146 BC and Roman colony refounding in 44 BC distinguishes Paul's urban setting | [Perseus archaeological site](https://www.perseus.tufts.edu/hopper/artifact?name=Corinth&object=Site); [Cambridge study](https://www.cambridge.org/core/books/abs/destruction-of-cities-in-the-ancient-greek-world/from-the-destruction-of-corinth-to-colonia-laus-iulia-corinthiensis/B98CF9F29432FC7C3650835BD56B9CBA) |
| `troas` | Antigoneia | Hellenistic city renamed Alexandria Troas; the city of Acts was **already** Troas | [Oxford Classical Dictionary](https://academic.oup.com/edited-volume/61673/chapter-abstract/548074847); [Livius](https://www.livius.org/articles/place/alexandria-in-troas/) |

## Eleven deliberate non-annotations
`hebron`, `jericho`, `nazareth`, `capernaum`, `damascus`, `athens`, `ephesus`, `rome`, `lystra`, `thessalonica`, `miletus`.

These are not archaeological rejections. They indicate **no additional historical-name text currently justified in the compact Atlas**. The full Pleiades name variants and URL provenance remain searchable via the underlying source crosswalk and external links; they are simply not promoted into an event-sheet UI. In particular `Athenae` and `Roma` are unhelpful transliteration repeats, and their Pleiades representative points remain rough; `Kefar Nahum` and `Kapharnaoum` reflect coexisting language forms rather than a proven temporal renaming. Existing event-sheet traditional/uncertain-location qualifications remain intact.

## Publication acceptance
1. Current runtime aliases, 151 canonical event IDs and precise canonical source-pins must remain unchanged. No historical form replaces an existing primary label.
2. **No annotation shown solely because a Pleiades date range overlaps the 11 narrative eras.** E.g. the Pleiades Aelia Capitolina name row reports a broad period, but independent Roman chronology vetoes its use as a Gospel-era name.
3. Do not infer the exact date of Tobit, Jonah, Exodus, patriarchal accounts or the specific place of a Gospel miracle from the name's attestation period.
4. The historical-name note belongs in an expandable contextual disclosure (if approved), not on every map symbol; no new HTML prose reader, route, or source duplications.
5. Precise French and technical transliterations and any future user-interface addition require their own review of wording and physical mobile ergonomics; this branch provides **research editorial proposals only**.
6. Atlas chronology, alternative cinema review, physical topography, Android touch, Scripture genealogy/theatre, Saints and Sacred Art remain with their existing owners.

**Status: 22 decisions proposed; 11 optional bilingual notes/11 deliberately suppressed. Editorial HOLD on every row. No runtime import.**
