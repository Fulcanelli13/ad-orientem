# Living Catena — extended original-work context and six cross-pericope collisions

**23 October 2026 · source-faithful research · no human-review or publication stage**

## Completed

`scripts/scripture-catena-chrysostom-extended-context.mjs` now reconstructs **homily-bounded, continuous original 1888 English print OCR windows for all 24 existing Chrysostom–Catena focus comparisons**. A typical context extends up to 55 OCR lines before and 110 after the pinned question, without crossing the original 90-homily segmentation. The complete byte-preserved text and SHA-256 are stored with source volume digest, printed homily ID, exact line range, original source question, prior Catena pointers and their unchanged source words.

The CI source regression confirms:
- **24/24** historic contexts extended, covering the previous **16 likely same-argument research hypotheses, six shared-wording hypotheses and two ambiguous arguments**.
- **3,930 total OCR line occurrences** across the 24 partially overlapping context windows. This figure **is not 3,930 unique lines or independently reviewed patristic sentences**.
- **Six** cases given scene-level Scripture research locators; their **18 separate Catena source pointers** each receive an individual contextual-relation hypothesis, instead of declaring a whole homily either identical or different.
- Source words are copied unchanged from the already verified volume OCR SHA-256 `4be619e9e01c9c6d5538fff17ac951e18775186814aa255a5540e2955c0ca6f2`; the associated fragment and every Catena source excerpt are independently checked.
- **Zero** complete homily answer boundaries authenticated; **zero** independently accepted equivalent or new patristic answers; **zero** Messenger changes, human reviews or publication approvals.

The longer windows deliberately preserve uncertain printed page headings, potential footnote markers, biblical quotations, changed speaker and following arguments. A window with more text is not proof that one complete argument is captured: we have not reconstructed source pagination, critical Greek, or all of the original paragraph boundaries.

## The six misleading lexical source overlaps — precise per-pointer distinctions

| Historical source setting | Canonical Catena comparison | First-pass relationship (not authenticated equivalence) |
| --- | --- | --- |
| Chrysostom Homily XIV, **Matthew 4:23–25**, discussing earlier healings and the later demand for faith | Matthew **9:27–31** (Jerome and Chrysostom pointers) | The source quotes a later healing's question while making a different, chronological point |
| Homily XXI, **Matthew 6:25–34**, anxiety about sustenance | Matthew **10:19** | Similar *take no thought* expression in the different instruction about missionary testimony |
| Same Homily XXI | Matthew **6:31** | Same section of the Sermon and immediate topic; **not simply a misleading match** |
| Same Homily XXI | Matthew **6:11** | Related subject within the Sermon but a different pericope and author's explanation |
| Homily XXX, **Matthew 12:1–8**, Sabbath controversy | Matthew **12:1** (two inherited author labels) | Same narrative context. May involve the same homily argument; equivalence still unverified |
| Same Homily XXX | Matthew **26:6–13** | The identical *mercy and not sacrifice* quotation appears in a different, anointing context |
| Same Homily XXX | Matthew **9:9–13** | Earlier occurrence of the same saying, in the tax collector scene |
| Homily XXXVII, **Matthew 11:7–9**, Christ's questions about John the Baptist | Matthew **11:7** (Chrysostom and Jerome) | The **same quoted Gospel pericope**; the short literal match alone does not establish duplication of surrounding exposition |
| Homily LXXX, **Matthew 26:6–13**, anointing | Matthew **26:6** | Same narrative context; **not automatically a misleading match** |
| Same Homily LXXX | Matthew **12:1** or **9:9** | The same biblical maxim used in different narratives |
| Homily XLVII, **Matthew 13:36–53**, disciples understanding parables | Matthew **13:51** (Gloss) | Same original Gospel passage, but a **different inherited author label** |
| Same Homily XLVII | Matthew **9:27** (Chrysostom) | A short *Yea, Lord* response repeated by **different people in another Gospel episode** |

The actual machine register contains **18 records**, because some rows above group multiple exact source-pointer instances from the same canonical pericope. Every per-pointer record retains the exact original Catena text and SHA-256. These contextual labels are research reconstructions from historical source wording, not independently certified biblical verse-to-homily concordances.

### One prior simplification corrected

The six original comparisons were initially grouped as *shared scriptural language, context differs*. That does **not** mean **every** lexical pairing within those six is a false match. In the Sabbath/anointing cases, the same original homily also matches a Catena excerpt covering **its own actual narrative setting**. The new per-pointer registry preserves these potential genuine matches rather than discarding them with the misleading ones.

## Next technical source phase

1. Establish paragraph and printed-footnote boundaries inside the 24 longer source windows, especially the 16 probable original-argument overlaps and the two previously cropped cases.
2. Preserve Gospel quotation subspans as quotations **within** a source-owned homily context, never as newly invented Father dialogue.
3. Expand the same source-contiguous context contract to the rest of the **180 sampled homily question contexts**, then the **1,938 unverified structural question/prose candidates**, keeping uncertain source ownership flagged.
4. Only after original-work ownership, text extent and actual semantic overlap are resolved should any additional user-facing Messenger source route be considered.

Reproduce after the existing source acquisition, source-unit and focused-parallel steps:

```sh
node scripts/scripture-catena-chrysostom-extended-context.mjs
node tests/scripture-catena-chrysostom-extended-context.mjs
```

Output: `dist/schaff-chrysostom-extended/expanded-historical-source-contexts.v1.json`, with companion summary. The source audit stores the results in the research artifact, not in the production app. Nothing is released or merged.
