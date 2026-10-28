# Morning/Evening Prayer — English Compline witness and Short/Complete release audit (B02)

**28 October 2026 · Ad Orientem existing PRAY reader; additive source integration only**

## 1. Resolving the last `In manus tuas` language hold

The Baltimore Catholic manual supplies the complete *ordinary* English short responsory of Compline:

- **Identity:** *Into Thy hands, O Lord, I commend my spirit*; `R.` and `V.` preserved; repeated opening/final response, `Thou hast redeemed us, O Lord, God of truth`, and complete short doxology.
- **Historical source:** *A Manual of Prayers for the Use of the Catholic Laity*, published by order of the Third Plenary Council of Baltimore, **1889** edition, *Evening Prayers — The Office of Compline — Short Responsory*, printed p. 73. Historical English witness on [Wikisource](https://en.wikisource.org/wiki/A_Manual_of_Prayers_for_the_Use_of_the_Catholic_Laity/Evening_Prayers); historic scanned page is also indexed in [Wikimedia's book PDF](https://upload.wikimedia.org/wikipedia/commons/6/6f/A_Manual_of_prayers_-_for_the_use_of_the_Catholic_laity_-_prepared_and_published_by_order_of_the_Third_Plenary_Council_of_Baltimore_%28IA_manualofprayersf00wood%29.pdf).
- **Record:** `baltimore-1889-evening-in-manus`, source-language EN, Evening-only, additional (not a St Pius X printed step), source type `sourceWebChecked`. Never claim this wording is a direct English translation from the ICRSP France website.
- **Compline separation:** The short responsory is an independently selected passage. The preceding lesson and following `Custodi nos` verse, `Nunc dimittis`, all psalms and the rest of Compline are **not** claimed as part of this option. Full Office belongs to separate ICKSP/ICRSP draft PR #1800.
- **Liturgical exception:** the printed six-line form is the ordinary text. It is **not** a universal Passiontide or Eastertide form. The displayed context explicitly discloses the differences.
- **Prior data:** Latin and French `In manus tuas` source records, Latin `Salva nos` and `Visita`, English/French `Visita`, English `Salva nos`, historical night protection and intercessions are all unchanged; no duplicate English `In manus tuas` existed before this batch.

**Result:** source-bound optional corpus **44→45**, EN Evening gains one choice; **no change** to 1905/1913 St Pius X canonical core counts, wording, timestamps, preferences schema, or historical source links. The three liturgical-language options for the short responsory are independent *witnesses*, not a synthetic trilingual edition.

## 2. Short / Standard / Complete — what can responsibly be released?

| Mode or source | Present evidence | Release verdict |
| --- | --- | --- |
| St Pius X 1913 (present default) | Primary sequence has **11 Morning** and **10 Evening core cards**; its optional 1913 supplements remain separate | **Live**, continue as the labelled edition sequence |
| St Pius X 1905 (alternative edition) | Primary sequence has **10 Morning** and **8 Evening** cards | **Live**, intact historical edition, not marketed as “Short 1913” |
| Expanded personal routine | User chooses existing 45 original-language optional texts and optional supplements; exact printed St Pius X core retained | **Live**, separate customizable composition, not a complete historical book transcription |
| “Short St Pius X” | There is **no separate printed short sequence witness** in current source master; dropping some of 1913's prayers would create an Ad Orientem-curated set | **Hold** as a named historical form. A later **Personal Brief** option is possible only with the complete-prayer selection and explicit nonhistorical labelling approved |
| “Complete St Pius X” | Current live default already contains all non-supplement 1913 printed cards; selected 1913 De profundis/Jésus–Joseph–Marie follow as optional | **No replacement required** and do not force optional supplements into the core |
| Older canonical legacy 11 Morning / 13 Evening | App-authored architecture, independently audited in B16, **not** an original St Pius X catechism sequence | **Do not revive** by card count or relabel as “Complete” |
| Alternate independent historical manuals/profiles | Exact per-edition full-sequence collation, translation permissions, and per-profile editorial approvals not complete | **Hold:** the `APPROVED_DAILY_FORMULATION_MANIFEST_V1` and `DAILY_APPROVED_SEQUENCE_RELEASE_V1` remain disabled, unchanged |

### A sound eventual Personal Brief contract

The user has already approved the principle **“Short = fewer complete prayers”**, not a truncated text. The implementation needs a separately authorized **named set of IDs by Morning/Evening**, using the current 1905/1913 source masters *without modifying their edition order or originals*. It must (1) identify itself explicitly as “Personal Brief — selection from St Pius X”, (2) preserve whole prayer bodies, including the 1913 combined *Morning Adoration, Thanksgiving and Offering*, (3) retain distinct guided examination vs. printed prayer, (4) allow the original full sequence to be restored in one action, (5) preserve manual card-based sky progression and source provenance, (6) include independent EN/FR/LA and narrow-phone acceptance, and (7) never silently convert 1905 into a 1913 short variant. **No exact omissions selected in this research batch**, therefore no visible Brief toggle or default change is authorized here.

### Gates remaining

- Only a source-backed *independent* historical profile may enter the protected manifest after its printed original, full text, source edition, translation-rights and editorial approval are all checked.
- The separate ICKSP/ICRSP Prayer/Office integration PR #1800 remains the owner of the complete Compline reader. No overlapping route or module is created.
- No paid services, additional hosting, image or archive obligations, or background actions.
- Regressions: `tests/daily-personal-rule.mjs`, `tests/pray-traditional-dual-axis-phone.mjs`, required main CI, and existing Prayer routing/parity gates.

**Progress:** The last English ordinary Compline-responsory source hold is resolved. Historical Short and standalone alternative Complete **profiles are not released**, by design; research/editorial selection, not code, is the remaining blocking decision.
