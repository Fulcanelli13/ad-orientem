# Mass Ultra Master — first Low Mass integration pass (16 October 2026)

**Current state: versioned source index, 35 candidate moment anchors, fail-closed preview resolver, tests. No public Mass Guide mutation.**

## Why the 35 Low Mass Guides must stay separate

The existing `src/mass/reader-guide.js` loader validates **exactly 32** continuity-certified Guide entries (30 Ordinary Sung + pre/post). The recovered `LOW.001–LOW.035` texts are distinct historical Low Mass research with **35 editorial navigation moments**. The actual canonical Low reader has **30 macro sections**, 96 blocks and a priest/server public-or-quiet clock, not the Sung schola track.

We must not append `LOW.*` keys to the 32-entry published Guide registry, relabel them `AO.CARD.*`, create 35 new LIVE cards, or infer the priest's gesture from the presence of Latin text.

## Frozen canonical input

- **Ultra Master**: `Ad_Orientem_Ultra_Master_Mass_Source_of_Truth_RECONCILED_2026-10-16.xlsx`, SHA-256 `8da826ec8306a1fa8925ece4832763becbe08f56efd5f368c87be166a34545f1`, 1,226,751 bytes, 36 worksheets. This is a conversation attachment; **the binary workbook has not been committed to Git**.
- **Original historical donor**: `Ad_Orientem_Full_Order_of_Mass_Master_Registry_2026-10-15.xlsx`, sheet `05 GUIDE · APP COPY`, Excel rows **34–68**.
- **Machine-readable frozen first layer**: `data/learn/research/mass-low-35-guide-legacy-index-20261016.v1.json`: all **35 original IDs, moments, and short Guide copies**, retaining their exact editorial sequence and original workbook rows. No full long Guides are published or copied as authentic author text. SHA-256 of ordered `key<TAB>moment<TAB>short<LF>`: `4fc28fa80b8845ac464e863071434df2ad3912959dc8104f07427278657ae626`.
- The 35 original **long** Guide texts remain in the frozen workbook only. They total roughly 98,000 characters, and several contain templated or awkward language. They have **no editorial publication approval**.

## First 35-to-current-low-corpus reconciliation

The research index records **33 candidate source cue anchors** (the exact IDs exist in `data/presentation/reader-text-low.v1.json`) and **two stages without a fixed normative prayer cue**:

1. `LOW.001`, entrance/arrival: a pre-Mass observational state.
2. `LOW.028`, bell/warning for faithful Communion: local/conditional observation, not a universal 1962 text slot.

Candidate anchors for clearly defined stages include Kyrie `AO.SM.C0044`, Gloria `AO.SM.C0053`, Collect `AO.SM.C0070`, Gospel `AO.SM.C0082`, Credo `AO.SM.C0089`, Offertory `AO.SM.C0106`, Preface `AO.SM.C0137`, Sanctus `AO.SM.C0145`, Te igitur `AO.SM.C0150`, Host `AO.SM.C0173`, Chalice `AO.SM.C0179`, Nobis quoque `AO.SM.C0196`, Ecce Agnus Dei `AO.SM.C0242`, Postcommunion `AO.SM.C0251`, blessing `AO.SM.C0263` and Last Gospel `AO.SM.C0267`. These are research **anchors**, not exact certified handoff/gesture timing.

Special conditions are tracked for omission of Psalm 42, Gloria, Credo, optional faithful Communion and optional second Confiteor, Requiem blessing/dismissal differences, and conditional Last Gospel.

## Source/runtime seam

`src/mass/reader-low-guide.js` validates this separate 35-entry research index and offers `lowGuideResearchCandidate(index,{massForm,guideId,allowResearchPreview})`. The function returns **null unless both**:

- `massForm === "LOW_1962"` and
- `allowResearchPreview === true`.

Even then it returns only the historic short text, original ID and research status. **No long Guide, rubrical event, position, user posture, source-certified Guide state, production approval, or imaginary schola clock** is returned. This is a safe source-facing implementation seam, not yet a deployed public Guide feature.

## Gates for actual production binding

1. Complete **35-stage-to-actual-reader-state** matching. `LOW.001` and `LOW.028` must stay observational; otherwise verify 33 candidates against the actual active cue and card.
2. Correct obvious editorial/prose defects in the historic long texts **by source comparison**, not silently generating AI mystical commentary.
3. Obtain editorial acceptance of short/long versions and confirm normative rubrical scope; preserve the 32 ordinary Guide texts untouched.
4. Add a Low-only selection branch to the native reader's `guideForCurrent()`, with regression tests covering all 35 stages, specific Low/Sung/Requiem/Communion conditions and mobile rendering.
5. Verify release on the **canonical** `https://fulcanelli13.github.io/ad-orientem/`, not a research or 2.0 substitute.

## Regression

`tests/mass-low-35-guide-research.mjs` checks exact 35 IDs; old short-text source digest; rows 34–68; 33 real Low corpus cue anchors plus two cue-less stages; mandatory conditional-form gates; rejected wrong forms and nonpreview use; no replacement of current 32 continuity-certified Guides.

**Ownership:** Mass reader team owns form/cue/Guide integration; source editorial team owns the historical workbook and approval. This PR is a source handoff only, not a command to merge the unpublished text.
