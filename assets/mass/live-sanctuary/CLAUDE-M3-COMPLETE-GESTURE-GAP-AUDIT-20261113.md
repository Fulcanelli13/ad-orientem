# Ad Orientem — CLAUDE ORIGINAL M3: COMPLETE GESTURE AND CEREMONIAL GAP REGISTER

**Research snapshot:** 13 November 2026. **Scope:** original owner-supplied 65-scene M3 donor at `assets/mass/live-sanctuary/index.html`, compared against existing canonical Ad Orientem 1962 source registries on draft PR #2882 branch `feature/live-sanctuary-visual-source-bridge`. This is an **implementation inventory for Claude**, not a claim that every row is wholly absent from the reader or that every research row is authorized for runtime.

**Authoritative donor:** https://github.com/Fulcanelli13/ad-orientem/blob/feature/live-sanctuary-visual-source-bridge/assets/mass/live-sanctuary/index.html  
**Reader source and registers:** `data/mass/gesture-matrix.v1.json`, `data/mass/ritus-1962-verified-ceremonial-batch01.v1.json`, `data/mass/ritus-1962-solemn-ministers-batch02.v1.json`, `src/mass/reader-sedilia-reverence.js`.  
**1960 rubrics §518–524:** https://ordo.fsspx.org/en/missal/rubricae/missalis  
**PR:** https://github.com/Fulcanelli13/ad-orientem/pull/2882 — remains **draft**; never merge/deploy merely because a geometry test passes.

## How to read this register

- **MISSING:** no independent physical action in donor M3; an icon or written rubric is **not** a movement.
- **PARTIAL:** a general static pose or simplified cinematic exists, but its component motions, count, role, prop ownership, or timing are not faithfully differentiated.
- **WRONG/CONDITIONAL:** the ordinary donor action needs correction/omission for Solemn, Requiem, Low, Sung, or feast-specific rubrics.
- **SOURCE HOLD:** the canonical registry identifies a probable action but has `runtimeCertified=false` or no observed physical event clock. Do not auto-play it on text scroll or arbitrary elapsed seconds.
- `sourceCueId` identifies *liturgical text/context*, not an automatically observed physical movement. **The Schola clock and the priest's recitation must stay independent.**
- The former synthetic white-leg graft and photo storyboards were explicitly rejected. The revised renderer in `experiments/sedilia-m3-seated-v1.html` is only an unapproved working copy.

## What the donor ALREADY does (do not falsely count these as absent)

The original M3 implements six generic scene-driven sequences: `turnSeq` (priest turns/stations), `aspergesSeq` (illustrative aisle walk), `incenseSeq` (C05/C24 smoke and travel), `elevSeq` (C36/C38 genuflect/elevate + bells), `missalSeq` (non-Solemn server transfer), and `communionSeq` (rail approach). It also moves actor billboards between static stations, has generic `stand / sit / kneel / bow / dbow / genu / orans / read / host / bless` poses, generic bell props, candles, glow and illustrated sacred vessels.

**The fundamental deficiency:** virtually all smaller gestures are bound to **card-wide static poses**, not separate source or observable events. The donor `D.cards[].gestures` strings mostly concern the **faithful** and are display cues, **not proof** that priest or faithful limbs animate.

## Implementation priorities and mandatory visual corrections

1. **P0 anatomical basis:** full-body seated priest/deacon/subdeacon, natural Roman chasuble/dalmatic/tunicle and alb folds, actual lap, knees, shins and shoes; three distinct seats, no detached trousers/feet; side/back/front M3 views. Original donor HTML byte-identical until approved. Rejected patches MUST NOT return.
2. **P0 sedilia arrival/exit:** walking up, turning, receiving/placing biretta, sitting naturally, rising, cap removal/replacement, handing to correct minister when prescribed; M3 `sit` flag is not sufficient.
3. **P0 reverences:** discrete head inclination, slight/profound body bow, genuflection and kneeling, not one generic torso movement; and separate right hand/biretta and left hand.
4. **P0 altar hands:** real joined/orans hands; thumb–forefinger joined following Consecration until ablutions; hands flat on altar, kissing, touching/holding paten, chalice, Host and missal.
5. **P0 precise object props:** one missal, Gospel book, Epistolarium, chalice, paten, pall, purificator, corporal, burse, cruets, aspergillum, thurible and incense boat have correct actor and physical hand/contact.
6. **P0 both Consecrations:** full pre-words bow, recitation, genuflect–elevate–lower–genuflect sequence, separately for Host and Chalice, source-controlled server bells/thurifer/subdeacon.
7. **P0 sacred ministers:** distinct deacon vs subdeacon actions and opposite-side stations; correct Ordinary vs Requiem C11–C14 and C24; no generic thurifer run after Requiem Offertory.
8. **P0 condition model:** Low vs simple Sung vs incense Sung vs Solemn, plus Requiem, optional second Confiteor, proper-dependent `Et incarnatus` kneeling, applicable ferial posture, tabernacle and local customs.
9. **P1 actual gesture timing:** observation/source event actor+begin/end, micro-order, and cancel/reset/replay. Do **not** infer a minister's physical timing solely from reader scrolling or from Schola sung-word elapsed time.
10. **P1 faithful animations:** kneel/stand/sit transitions, triple small Gospel crosses, breast striking, kneeling for Canon/Communion, Last Gospel genuflection, blessings; respect custom vs obligation.
11. **P1 acoustics and rite effects:** bells have correct actor/form/count source; smoke only when priest/minister truly incenses; candle lighting/extinguishing has source conditions. Do not couple chant playback to physical action.
12. **P1 visual checks:** source scene C08/C09/C12/C17/C18/C19 and C11–C14, C24, C36/C38, C45, C52–C59, C63–C65 in phone and desktop; require actual screenshot/GIF human acceptance, not green DOM assertions.

## A. Complete existing **83 priest gesture records** — source-cue worklist

| Registry ID | Cue | Action in canonical reader | Trigger / words | Original M3 status |
| --- | --- | --- | --- | --- |
| GM.P.C0001.01 | AO.SM.C0001 | SIGN_OF_CROSS — SIGNS HIMSELF | In nómine Patris | Missing: individual 3D action and certified timing |
| GM.P.C0010.01 | AO.SM.C0010 | HEAD_OR_BODY_BOW — BOWS HEAD | Gloria Patri | Partial: generic bow pose; phrase-specific action missing |
| GM.P.C0016.01 | AO.SM.C0016 | PROFOUND_BOW — BOWS PROFOUNDLY | Confiteor | Partial: generic bow pose; phrase-specific action missing |
| GM.P.C0017.01 | AO.SM.C0017 | BREAST_STRIKE — STRIKES BREAST ×3 | mea culpa ×3 | Missing: independent counted hand-to-breast strikes |
| GM.P.C0026.01 | AO.SM.C0026 | SIGN_OF_CROSS — SIGNS HIMSELF | Indulgéntiam | Missing: individual 3D action and certified timing |
| GM.P.C0038.01 | AO.SM.C0038 | BODY_BOW — BOWS OVER THE ALTAR | Orámus te | Partial: generic bow pose; phrase-specific action missing |
| GM.P.C0039.01 | AO.SM.C0039 | ALTAR_KISS — KISSES THE ALTAR | quorum relíquiæ hic sunt | Missing: individual 3D action and certified timing |
| GM.P.C0058.01 | AO.SM.C0058 | HEAD_OR_BODY_BOW — BOWS HEAD | Gratias agimus tibi | Partial: generic bow pose; phrase-specific action missing |
| GM.P.C0061.01 | AO.SM.C0061 | HEAD_OR_BODY_BOW — BOWS HEAD | Iesu Christe | Partial: generic bow pose; phrase-specific action missing |
| GM.P.C0064.01 | AO.SM.C0064 | HEAD_OR_BODY_BOW — BOWS HEAD | suscipe deprecationem nostram | Partial: generic bow pose; phrase-specific action missing |
| GM.P.C0067.01 | AO.SM.C0067 | HEAD_OR_BODY_BOW — BOWS HEAD | Iesu Christe | Partial: generic bow pose; phrase-specific action missing |
| GM.P.C0068.01 | AO.SM.C0068 | SIGN_OF_CROSS — SIGNS HIMSELF | Cum Sancto Spiritu | Missing: individual 3D action and certified timing |
| GM.P.C0072.01 | AO.SM.C0072 | HEAD_OR_BODY_BOW — BOWS HEAD | Oremus | Partial: generic bow pose; phrase-specific action missing |
| GM.P.C0079.01 | AO.SM.C0079 | PROFOUND_BOW — PROFOUND BOW | Munda cor meum | Partial: generic bow pose; phrase-specific action missing |
| GM.P.C0084.01 | AO.SM.C0084 | GOSPEL_BOOK_AND_BODY_CROSSES — SIGNS GOSPEL BOOK · FOREHEAD · LIPS · BREAST | Sequéntia sancti Evangélii | Missing: articulated forehead/lips/breast crosses |
| GM.P.C0090.01 | AO.SM.C0090 | HEAD_BOW — BOWS HEAD | in unum Deum | Partial: generic bow pose; phrase-specific action missing |
| GM.P.C0093.01 | AO.SM.C0093 | HEAD_OR_BODY_BOW — BOWS HEAD | Iesum Christum | Partial: generic bow pose; phrase-specific action missing |
| GM.P.C0096.01 | AO.SM.C0096 | GENUFLECT — GENUFLECTS | Et incarnátus est ... et homo factus est | Partial: generic pose; no distinct canonical cue event |
| GM.P.C0101.01 | AO.SM.C0101 | HEAD_OR_BODY_BOW — BOWS HEAD | simul adoratur | Partial: generic bow pose; phrase-specific action missing |
| GM.P.C0104.01 | AO.SM.C0104 | SIGN_OF_CROSS — SIGNS HIMSELF | Et vitam venturi saeculi | Missing: individual 3D action and certified timing |
| GM.P.C0111.01 | AO.SM.C0111 | CROSS_WITH_PATEN — CROSSES WITH PATEN | — | Missing: individual 3D action and certified timing |
| GM.P.C0115.01 | AO.SM.C0115 | CROSS_WITH_CHALICE — CROSSES WITH CHALICE | — | Missing: individual 3D action and certified timing |
| GM.P.C0116.01 | AO.SM.C0116 | BODY_BOW — BOWS SLIGHTLY | In spíritu humilitátis | Partial: generic bow pose; phrase-specific action missing |
| GM.P.C0117.01 | AO.SM.C0117 | RAISE_EYES_AND_HANDS — RAISES EYES AND HANDS | — | Missing: individual 3D action and certified timing |
| GM.P.C0117.02 | AO.SM.C0117 | JOIN_HANDS — JOINS HANDS | — | Missing: individual 3D action and certified timing |
| GM.P.C0119.01 | AO.SM.C0119 | BLESS_OFFERINGS — BLESSES OFFERINGS | et benedic | Missing: individual 3D action and certified timing |
| GM.P.C0126.01 | AO.SM.C0126 | HEAD_OR_BODY_BOW — BOWS HEAD | Gloria Patri | Partial: generic bow pose; phrase-specific action missing |
| GM.P.C0128.01 | AO.SM.C0128 | BODY_BOW — BOWS SLIGHTLY | Súscipe, sancta Trínitas | Partial: generic bow pose; phrase-specific action missing |
| GM.P.C0129.01 | AO.SM.C0129 | ALTAR_KISS — KISSES THE ALTAR | before Oráte, fratres | Missing: individual 3D action and certified timing |
| GM.P.C0141.01 | AO.SM.C0141 | HEAD_BOW — BOWS HEAD | Grátias agámus Dómino | Partial: generic bow pose; phrase-specific action missing |
| GM.P.C0145.01 | AO.SM.C0145 | BODY_BOW — BOWS FOR SANCTUS | Sanctus, Sanctus, Sanctus | Partial: generic bow pose; phrase-specific action missing |
| GM.P.C0148.01 | AO.SM.C0148 | SIGN_OF_CROSS — SIGNS HIMSELF | Benedíctus qui venit | Missing: individual 3D action and certified timing |
| GM.P.C0150.01 | AO.SM.C0150 | PROFOUND_BOW — BOWS PROFOUNDLY | Te igitur | Partial: generic bow pose; phrase-specific action missing |
| GM.P.C0151.01 | AO.SM.C0151 | ALTAR_KISS — KISSES THE ALTAR | uti accepta habeas et benedícas | Missing: individual 3D action and certified timing |
| GM.P.C0152.01 | AO.SM.C0152 | THREE_CROSSES — MAKES THREE CROSSES OVER HOST AND CHALICE | hæc dona · hæc múnera · hæc sancta sacrifícia | Missing: individual 3D action and certified timing |
| GM.P.C0155.01 | AO.SM.C0155 | MEMENTO_HANDS — RAISES AND JOINS HANDS · BOWS HEAD | silent commemoration of the living | Missing: individual 3D action and certified timing |
| GM.P.C0158.01 | AO.SM.C0158 | HEAD_OR_BODY_BOW — BOWS HEAD | Iesu Christi | Partial: generic bow pose; phrase-specific action missing |
| GM.P.C0161.01 | AO.SM.C0161 | HANDS_OVER_OBLATIONS — HANDS OVER OBLATIONS | — | Missing: individual 3D action and certified timing |
| GM.P.C0164.01 | AO.SM.C0164 | THREE_CROSSES — MAKES THREE CROSSES OVER HOST AND CHALICE | benedíctam · adscríptam · ratam | Missing: individual 3D action and certified timing |
| GM.P.C0165.01 | AO.SM.C0165 | CROSS_OVER_HOST — MAKES CROSS OVER HOST | Corpus | Missing: individual 3D action and certified timing |
| GM.P.C0166.01 | AO.SM.C0166 | CROSS_OVER_CHALICE — MAKES CROSS OVER CHALICE | Sanguis | Missing: individual 3D action and certified timing |
| GM.P.C0167.01 | AO.SM.C0167 | HEAD_OR_BODY_BOW — BOWS HEAD | Iesu Christi | Partial: generic bow pose; phrase-specific action missing |
| GM.P.C0169.01 | AO.SM.C0169 | RAISE_EYES — RAISES EYES | elevatis oculis | Missing: individual 3D action and certified timing |
| GM.P.C0170.01 | AO.SM.C0170 | HEAD_OR_BODY_BOW — BOWS HEAD | tibi gratias agens | Partial: generic bow pose; phrase-specific action missing |
| GM.P.C0171.01 | AO.SM.C0171 | CROSS_OVER_HOST — MAKES CROSS OVER HOST | benedíxit | Missing: individual 3D action and certified timing |
| GM.P.C0174.01 | AO.SM.C0174 | GENUFLECT — GENUFLECTS | — | Partial: generic pose; no distinct canonical cue event |
| GM.P.C0174.02 | AO.SM.C0174 | ELEVATE_HOST — ELEVATES HOST | — | Partial: donor elevation choreography, incomplete internal steps |
| GM.P.C0174.03 | AO.SM.C0174 | GENUFLECT — GENUFLECTS | — | Partial: generic pose; no distinct canonical cue event |
| GM.P.C0176.01 | AO.SM.C0176 | HEAD_OR_BODY_BOW — BOWS HEAD | tibi gratias agens | Partial: generic bow pose; phrase-specific action missing |
| GM.P.C0177.01 | AO.SM.C0177 | CROSS_OVER_CHALICE — MAKES CROSS OVER CHALICE | benedíxit | Missing: individual 3D action and certified timing |
| GM.P.C0181.01 | AO.SM.C0181 | GENUFLECT — GENUFLECTS | — | Partial: generic pose; no distinct canonical cue event |
| GM.P.C0181.02 | AO.SM.C0181 | ELEVATE_CHALICE — ELEVATES CHALICE | — | Partial: donor elevation choreography, incomplete internal steps |
| GM.P.C0181.03 | AO.SM.C0181 | GENUFLECT — GENUFLECTS | — | Partial: generic pose; no distinct canonical cue event |
| GM.P.C0184.01 | AO.SM.C0184 | THREE_CROSSES — MAKES THREE CROSSES OVER HOST AND CHALICE | hóstiam puram · hóstiam sanctam · hóstiam immaculátam | Missing: individual 3D action and certified timing |
| GM.P.C0185.01 | AO.SM.C0185 | CROSS_HOST_AND_CHALICE — CROSSES HOST THEN CHALICE | Panem sanctum ... et Calicem | Missing: individual 3D action and certified timing |
| GM.P.C0187.01 | AO.SM.C0187 | PROFOUND_BOW — BOWS PROFOUNDLY | Súpplices te rogámus | Partial: generic bow pose; phrase-specific action missing |
| GM.P.C0188.01 | AO.SM.C0188 | ALTAR_KISS — KISSES THE ALTAR | ex hac altáris participatióne | Missing: individual 3D action and certified timing |
| GM.P.C0189.01 | AO.SM.C0189 | CROSS_HOST_AND_CHALICE — CROSSES HOST THEN CHALICE | Corpus · Sanguinem | Missing: individual 3D action and certified timing |
| GM.P.C0190.01 | AO.SM.C0190 | SIGN_OF_CROSS — SIGNS HIMSELF | omni benedictióne coelésti | Missing: individual 3D action and certified timing |
| GM.P.C0193.01 | AO.SM.C0193 | MEMENTO_HANDS — RAISES AND JOINS HANDS · EYES ON THE SACRAMENT | silent commemoration of the dead | Missing: individual 3D action and certified timing |
| GM.P.C0196.01 | AO.SM.C0196 | BREAST_STRIKE — STRIKES BREAST ONCE | Nobis quoque peccatóribus | Missing: independent counted hand-to-breast strikes |
| GM.P.C0200.01 | AO.SM.C0200 | THREE_CROSSES — THREE CROSSES | sanctificas · vivificas · benedicis | Missing: individual 3D action and certified timing |
| GM.P.C0202.01 | AO.SM.C0202 | THREE_CROSSES_WITH_HOST — THREE CROSSES WITH HOST OVER CHALICE | Per ipsum · et cum ipso · et in ipso | Missing: individual 3D action and certified timing |
| GM.P.C0203.01 | AO.SM.C0203 | TWO_CROSSES_WITH_HOST — TWO CROSSES WITH HOST | Deo Patri omnipotenti · in unitate Spiritus Sancti | Missing: individual 3D action and certified timing |
| GM.P.C0204.01 | AO.SM.C0204 | MINOR_ELEVATION — ELEVATES HOST AND CHALICE SLIGHTLY | omnis honor, et glória | Static/partial: held-object pose needs verified motion |
| GM.P.C0208.01 | AO.SM.C0208 | HEAD_OR_BODY_BOW — BOWS HEAD | Oremus | Partial: generic bow pose; phrase-specific action missing |
| GM.P.C0213.01 | AO.SM.C0213 | SIGN_WITH_PATEN — SIGNS HIMSELF WITH PATEN | da propítius pacem | Missing: individual 3D action and certified timing |
| GM.P.C0219.01 | AO.SM.C0219 | THREE_CROSSES_WITH_PARTICLE — THREE CROSSES WITH PARTICLE | Pax Domini sit semper vobiscum | Missing: individual 3D action and certified timing |
| GM.P.C0222.01 | AO.SM.C0222 | BREAST_STRIKE — STRIKES BREAST ONCE | Agnus Dei · miserére nobis | Missing: independent counted hand-to-breast strikes |
| GM.P.C0223.01 | AO.SM.C0223 | BREAST_STRIKE — STRIKES BREAST ONCE | Agnus Dei · miserére nobis | Missing: independent counted hand-to-breast strikes |
| GM.P.C0224.01 | AO.SM.C0224 | BREAST_STRIKE — STRIKES BREAST ONCE | Agnus Dei · dona nobis pacem | Missing: independent counted hand-to-breast strikes |
| GM.P.C0229.01 | AO.SM.C0229 | BREAST_STRIKE — STRIKES BREAST ONCE | Dómine, non sum dignus · 1 | Missing: independent counted hand-to-breast strikes |
| GM.P.C0230.01 | AO.SM.C0230 | BREAST_STRIKE — STRIKES BREAST ONCE | Dómine, non sum dignus · 2 | Missing: independent counted hand-to-breast strikes |
| GM.P.C0231.01 | AO.SM.C0231 | BREAST_STRIKE — STRIKES BREAST ONCE | Dómine, non sum dignus · 3 | Missing: independent counted hand-to-breast strikes |
| GM.P.C0232.01 | AO.SM.C0232 | SIGN_WITH_HOST — SIGNS WITH HOST | Corpus Domini nostri Iesu Christi | Missing: individual 3D action and certified timing |
| GM.P.C0234.01 | AO.SM.C0234 | SIGN_WITH_CHALICE — SIGNS WITH CHALICE | Sanguis Domini nostri Iesu Christi | Missing: individual 3D action and certified timing |
| GM.P.C0262.01 | AO.SM.C0262 | ALTAR_KISS — KISSES ALTAR | — | Missing: individual 3D action and certified timing |
| GM.P.C0263.01 | AO.SM.C0263 | RAISE_EYES_AND_HANDS — RAISES EYES AND HANDS | — | Missing: individual 3D action and certified timing |
| GM.P.C0263.02 | AO.SM.C0263 | JOIN_HANDS — JOINS HANDS | — | Missing: individual 3D action and certified timing |
| GM.P.C0263.03 | AO.SM.C0263 | HEAD_OR_BODY_BOW — BOWS HEAD TO CROSS | — | Partial: generic bow pose; phrase-specific action missing |
| GM.P.C0265.01 | AO.SM.C0265 | BLESSING_CROSS — MAKES ONE SIGN OF THE CROSS OVER THE PEOPLE | Pater, et Fílius, et Spíritus Sanctus | Missing: individual 3D action and certified timing |
| GM.P.C0269.01 | AO.SM.C0269 | GOSPEL_BOOK_AND_BODY_CROSSES — SIGNS GOSPEL BOOK · FOREHEAD · LIPS · BREAST | Initium sancti Evangélii | Missing: articulated forehead/lips/breast crosses |
| GM.P.C0273.01 | AO.SM.C0273 | GENUFLECT — GENUFLECTS TOWARD THE GOSPEL | Et Verbum caro factum est | Partial: generic pose; no distinct canonical cue event |

**Source-count note:** The 83 rows above are the current priest gesture matrix, including repeated counted actions at one source cue (e.g. the two genuflections of each Elevation). They are **not** 83 wholly missing visually unique figures; many exist as an undifferentiated pose.

## B. Complete **46 verified ceremonial research events** (cross-check, not additive count)

| Event | Cue | Actor | Action | Evidence / implementation |
| --- | --- | --- | --- | --- |
| B01-001 | AO.SM.C0001 | PRIEST | SIGN_SELF_AT_OPENING | DEFAULT · research/physical event review |
| B01-002 | AO.SM.C0010 | PRIEST | BOW_HEAD_AT_GLORIA_PATRI_OF_JUDICA_PSALM | JUDICA_ME_PSALM_PRESENT · research/physical event review |
| B01-003 | AO.SM.C0056 | PRIEST | BOW_HEAD_ADORAMUS_TE | GLORIA_APPOINTED · research/physical event review |
| B01-004 | AO.SM.C0058 | PRIEST | BOW_HEAD_GRATIAS_AGIMUS_TIBI | GLORIA_APPOINTED · research/physical event review |
| B01-005 | AO.SM.C0061 | PRIEST | BOW_HEAD_JESU_CHRISTE | GLORIA_APPOINTED · research/physical event review |
| B01-006 | AO.SM.C0064 | PRIEST | BOW_HEAD_SUSCIPE_DEPRECATIONEM | GLORIA_APPOINTED · research/physical event review |
| B01-007 | AO.SM.C0067 | PRIEST | BOW_HEAD_JESU_CHRISTE_SECOND_OCCURRENCE | GLORIA_APPOINTED · research/physical event review |
| B01-008 | AO.SM.C0068 | PRIEST | SIGN_SELF_AT_CUM_SANCTO_SPIRITU | GLORIA_APPOINTED · research/physical event review |
| B01-009 | AO.SM.C0084 | PRIEST | TRIPLE_SMALL_CROSSES_GOSPEL | NOT_REQUIEM_OMISSION_OF_PREPARATORY_PRAYERS_ONLY · research/physical event review |
| B01-010 | AO.SM.C0093 | PRIEST | BOW_HEAD_JESUM_CHRISTUM_CREDO | CREDO_APPOINTED · research/physical event review |
| B01-011 | AO.SM.C0096 | PRIEST | GENUFLECT_ET_INCARNATUS_THROUGH_ET_HOMO_FACTUS | CREDO_APPOINTED · research/physical event review |
| B01-012 | AO.SM.C0101 | PRIEST | BOW_HEAD_SIMUL_ADORATUR | CREDO_APPOINTED · research/physical event review |
| B01-013 | AO.SM.C0104 | PRIEST | SIGN_SELF_ET_VITAM_VENTURI | CREDO_APPOINTED · research/physical event review |
| B01-014 | AO.SM.C0112 | PRIEST | BLESS_WATER_AT_CHALICE_PREPARATION | NOT_REQUIEM · research/physical event review |
| B01-015 | AO.SM.C0112 | PRIEST | DO_NOT_BLESS_WATER_REQUIEM | REQUIEM · research/physical event review |
| B01-016 | AO.SM.C0114 | PRIEST | OFFER_CHALICE_IN_BOTH_HANDS | DEFAULT · research/physical event review |
| B01-017 | AO.SM.C0152 | PRIEST | THREE_CROSSES_OVER_OBLATIONS_HAEC_DONA | DEFAULT · research/physical event review |
| B01-018 | AO.SM.C0161 | PRIEST | HANDS_SPREAD_OVER_OBLATION_HANC_IGITUR | DEFAULT · research/physical event review |
| B01-019 | AO.SM.C0164 | PRIEST | THREE_CROSSES_BENEDICTAM_ADSCRIPTAM_RATAM | DEFAULT · research/physical event review |
| B01-020 | AO.SM.C0173 | PRIEST | CONSECRATION_HOST_QUIETLY_BOWED_ELBOWS_ON_ALTAR | DEFAULT · research/physical event review |
| B01-021 | AO.SM.C0174 | PRIEST | GENUFLECT_AFTER_HOST_CONSECRATION | DEFAULT · research/physical event review |
| B01-022 | AO.SM.C0174 | PRIEST | ELEVATE_HOST_FOR_ADORATION | DEFAULT · research/physical event review |
| B01-023 | AO.SM.C0174 | PRIEST | REPLACE_HOST_ON_CORPORAL | DEFAULT · research/physical event review |
| B01-024 | AO.SM.C0174 | PRIEST | GENUFLECT_AGAIN_AFTER_HOST_ELEVATION | DEFAULT · research/physical event review |
| B01-025 | AO.SM.C0174 | SERVER | RING_AT_HOST_ELEVATION | SERVER_PRESENT · research/physical event review |
| B01-026 | AO.SM.C0181 | PRIEST | GENUFLECT_AFTER_CHALICE_CONSECRATION | DEFAULT · research/physical event review |
| B01-027 | AO.SM.C0181 | PRIEST | ELEVATE_CHALICE_FOR_ADORATION | DEFAULT · research/physical event review |
| B01-028 | AO.SM.C0181 | PRIEST | REPLACE_CHALICE_ON_CORPORAL | DEFAULT · research/physical event review |
| B01-029 | AO.SM.C0181 | PRIEST | GENUFLECT_AGAIN_AFTER_CHALICE_ELEVATION | DEFAULT · research/physical event review |
| B01-030 | AO.SM.C0181 | SERVER | RING_AT_CHALICE_ELEVATION | SERVER_PRESENT · research/physical event review |
| B01-031 | AO.SM.C0196 | PRIEST | STRIKE_BREAST_NOBIS_QUOQUE_AND_SPEAK_SLIGHTLY_LOUDER | DEFAULT · research/physical event review |
| B01-032 | AO.SM.C0200 | PRIEST | THREE_CROSSES_SANCTIFICAS_VIVIFICAS_BENEDICIS | DEFAULT · research/physical event review |
| B01-033 | AO.SM.C0202 | PRIEST | CROSS_WITH_HOST_OVER_CHALICE_AT_PER_IPSUM | DEFAULT · research/physical event review |
| B01-034 | AO.SM.C0222 | PRIEST | STRIKE_BREAST_FIRST_AGNUS_MISERERE | NOT_REQUIEM · research/physical event review |
| B01-035 | AO.SM.C0222 | PRIEST | DO_NOT_STRIKE_BREAST_REQUIEM_AGNUS | REQUIEM · research/physical event review |
| B01-036 | AO.SM.C0242 | PRIEST | SHOW_HOST_AND_SAY_ECCE_AGNUS_DEI | FAITHFUL_COMMUNICANTS_PRESENT · research/physical event review |
| B01-037 | AO.SM.C0243 | PRIEST | DOMINE_NON_SUM_DIGNUS_FAITHFUL_FIRST | FAITHFUL_COMMUNICANTS_PRESENT · research/physical event review |
| B01-038 | AO.SM.C0259 | PRIEST | SING_DISMISSAL_IN_MISSA_CANTATA | DISMISSAL_ITE · research/physical event review |
| B01-039 | AO.SM.C0259 | DEACON | SING_DISMISSAL_IN_SOLEMN | DISMISSAL_ITE · research/physical event review |
| B01-040 | AO.SM.C0273 | PRIEST | GENUFLECT_ET_VERBUM_CARO_FACTUM_EST | LAST_GOSPEL_APPOINTED · research/physical event review |
| B01-041 | AO.SM.C0075 | SUBDEACON | SING_EPISTLE_SOLEMN | NOT_REQUIEM_SPECIAL_GESTURE_EXCEPTIONS · research/physical event review |
| B01-042 | AO.SM.C0084 | DEACON | SING_GOSPEL_SOLEMN | NOT_REQUIEM_CEREMONIAL_VARIANTS · research/physical event review |
| B01-043 | AO.SM.C0041 | PRIEST | INCENSE_CROSS_ALTAR_AT_ENTRANCE_SOLEMN | NOT_REQUIEM · research/physical event review |
| B01-044 | AO.SM.C0041 | PRIEST | SUPPRESS_FIRST_INCENSATION_REQUIEM | REQUIEM · research/physical event review |
| B01-045 | AO.SM.C0223 | PRIEST | STRIKE_BREAST_SECOND_AGNUS_MISERERE | NOT_REQUIEM · research/physical event review |
| B01-046 | AO.SM.C0224 | PRIEST | STRIKE_BREAST_THIRD_AGNUS_DONA_NOBIS_PACEM | NOT_REQUIEM · research/physical event review |

**Cross-check note:** Several B01 actions overlap the 83 priest gestures. Additional source details include the **Adoramus te** bow, the Host-Consecration elbows-on-altar bow, servers' bells, priest recitation delivery and the Solemn Epistle/Gospel minister distinction. Do not double animate one act because it appears in two registers.

## C. Complete **68 Solemn-minister ceremonial research records** — actor-specific correction list

| Record | Cue | Actual actor | Specific movement/object | Condition / acceptance |
| --- | --- | --- | --- | --- |
| MR62.SOL.B02.001 | AO.SM.C0075 | SUBDEACON | TAKE_EPISTOLARIUM_TO_EPISTLE_SIDE | ALL · not source-event-clock certified |
| MR62.SOL.B02.002 | AO.SM.C0076 | SUBDEACON | GENUFLECT_AFTER_EPISTLE | ALL · not source-event-clock certified |
| MR62.SOL.B02.003 | AO.SM.C0076 | SUBDEACON | KISS_CELEBRANT_HAND_AND_RECEIVE_BLESSING | NOT_REQUIEM · not source-event-clock certified |
| MR62.SOL.B02.004 | AO.SM.C0081 | SUBDEACON | CARRY_MISSAL_TO_GOSPEL_SIDE | ALL · not source-event-clock certified |
| MR62.SOL.B02.005 | AO.SM.C0079 | DEACON | KNEEL_AND_RECITE_MUNDA_COR_MEUM | ALL · not source-event-clock certified |
| MR62.SOL.B02.006 | AO.SM.C0080 | DEACON | REQUEST_AND_RECEIVE_CELEBRANT_BLESSING | NOT_REQUIEM · not source-event-clock certified |
| MR62.SOL.B02.007 | AO.SM.C0084 | DEACON | PROCESS_GOSPEL_WITH_THURIFER_AND_CANDLES | NOT_REQUIEM · not source-event-clock certified |
| MR62.SOL.B02.008 | AO.SM.C0084 | SUBDEACON | HOLD_GOSPEL_BOOK_BETWEEN_ACOLYTES | NOT_REQUIEM · not source-event-clock certified |
| MR62.SOL.B02.009 | AO.SM.C0084 | DEACON | SIGN_GOSPEL_BOOK_FOREHEAD_LIPS_BREAST | ALL · not source-event-clock certified |
| MR62.SOL.B02.010 | AO.SM.C0085 | DEACON | INCENSE_GOSPEL_BOOK_THREE_TIMES | NOT_REQUIEM · not source-event-clock certified |
| MR62.SOL.B02.011 | AO.SM.C0088 | SUBDEACON | TAKE_GOSPEL_BOOK_TO_CELEBRANT | NOT_REQUIEM · not source-event-clock certified |
| MR62.SOL.B02.012 | AO.SM.C0088 | DEACON | INCENSE_CELEBRANT_AFTER_GOSPEL | NOT_REQUIEM · not source-event-clock certified |
| MR62.SOL.B02.013 | AO.SM.C0096 | DEACON | CARRY_BURSE_AND_UNFOLD_CORPORAL | CREDO_APPOINTED · not source-event-clock certified |
| MR62.SOL.B02.014 | AO.SM.C0110 | SUBDEACON | BRING_VEILED_CHALICE_FROM_CREDENCE | ALL · not source-event-clock certified |
| MR62.SOL.B02.015 | AO.SM.C0110 | DEACON | UNVEIL_CHALICE_AND_GIVE_HOST_PATEN | ALL · not source-event-clock certified |
| MR62.SOL.B02.016 | AO.SM.C0112 | SUBDEACON | WIPE_CHALICE_WITH_PURIFICATOR | ALL · not source-event-clock certified |
| MR62.SOL.B02.017 | AO.SM.C0112 | DEACON | POUR_WINE_INTO_CHALICE | ALL · not source-event-clock certified |
| MR62.SOL.B02.018 | AO.SM.C0112 | SUBDEACON | SHOW_WATER_CRUET_SAY_BENEDICITE | NOT_REQUIEM · not source-event-clock certified |
| MR62.SOL.B02.019 | AO.SM.C0112 | PRIEST | BLESS_WATER_BEFORE_MIXING | NOT_REQUIEM · not source-event-clock certified |
| MR62.SOL.B02.020 | AO.SM.C0112 | PRIEST | DO_NOT_BLESS_WATER_REQUIEM | REQUIEM · not source-event-clock certified |
| MR62.SOL.B02.021 | AO.SM.C0114 | DEACON | SUPPORT_CHALICE_OR_CELEBRANT_ARM | ALL · not source-event-clock certified |
| MR62.SOL.B02.022 | AO.SM.C0115 | DEACON | COVER_CHALICE_WITH_PALL | ALL · not source-event-clock certified |
| MR62.SOL.B02.023 | AO.SM.C0115 | SUBDEACON | COVER_PATEN_WITH_HUMERAL_VEIL | NOT_REQUIEM · not source-event-clock certified |
| MR62.SOL.B02.024 | AO.SM.C0115 | SUBDEACON | HOLD_PATEN_BEHIND_CELEBRANT_UNTIL_PATERNOSTER | NOT_REQUIEM · not source-event-clock certified |
| MR62.SOL.B02.025 | AO.SM.C0115 | SUBDEACON | DO_NOT_HOLD_PATEN_REQUIEM | REQUIEM · not source-event-clock certified |
| MR62.SOL.B02.026 | AO.SM.C0120 | DEACON | PRESENT_INCENSE_BOAT_AT_VENI_SANCTIFICATOR | ALL · not source-event-clock certified |
| MR62.SOL.B02.027 | AO.SM.C0122 | DEACON | STEADY_CHALICE_FOOT_DURING_INCENSATION | ALL · not source-event-clock certified |
| MR62.SOL.B02.028 | AO.SM.C0122 | PRIEST | INCENSE_GIFTS_CROSSWISE_AND_AROUND | ALL · not source-event-clock certified |
| MR62.SOL.B02.029 | AO.SM.C0124 | DEACON | MOVE_CHALICE_ASIDE_WHILE_INCENSING_CRUCIFIX | ALL · not source-event-clock certified |
| MR62.SOL.B02.030 | AO.SM.C0124 | DEACON | INCENSE_CELEBRANT_AND_CHOIR_AND_SUBDEACON | NOT_REQUIEM · not source-event-clock certified |
| MR62.SOL.B02.031 | AO.SM.C0124 | DEACON | INCENSE_CELEBRANT_ONLY_REQUIEM | REQUIEM · not source-event-clock certified |
| MR62.SOL.B02.032 | AO.SM.C0124 | THURIFER | INCENSE_DEACON_ACOLYTES_AND_FAITHFUL | NOT_REQUIEM · not source-event-clock certified |
| MR62.SOL.B02.033 | AO.SM.C0124 | THURIFER | NO_INCENSE_CHOIR_PEOPLE_REQUIEM | REQUIEM · not source-event-clock certified |
| MR62.SOL.B02.034 | AO.SM.C0125 | ACOLYTES | PRESENT_LAVABO_WATER_DISH_TOWEL | ALL · not source-event-clock certified |
| MR62.SOL.B02.035 | AO.SM.C0145 | DEACON | ASCEND_AT_SANCTUS_WITH_CELEBRANT | ALL · not source-event-clock certified |
| MR62.SOL.B02.036 | AO.SM.C0145 | SUBDEACON | STAND_BEHIND_CELEBRANT_DURING_CANON | ALL · not source-event-clock certified |
| MR62.SOL.B02.037 | AO.SM.C0150 | DEACON | ASSIST_CELEBRANT_LEFT_SIDE_CANON | NO_OTHER_ASSISTANT_PRIEST · not source-event-clock certified |
| MR62.SOL.B02.038 | AO.SM.C0150 | DEACON | STAND_RIGHT_BEHIND_IF_ASSISTANT_PRIEST | ASSISTANT_PRIEST_PRESENT · not source-event-clock certified |
| MR62.SOL.B02.039 | AO.SM.C0144 | ACOLYTES | LIGHT_AT_LEAST_TWO_TORCHES_AT_END_PREFACE | ALL · not source-event-clock certified |
| MR62.SOL.B02.040 | AO.SM.C0181 | ACOLYTES | EXTINGUISH_TORCHES_AFTER_CHALICE_ELEVATION | NOT_FAST_DAY_AND_NOT_REQUIEM_AND_NO_COMMUNICANTS · not source-event-clock certified |
| MR62.SOL.B02.041 | AO.SM.C0246 | ACOLYTES | KEEP_TORCHES_TO_COMMUNION_WHEN_REQUIRED | FAST_DAY_OR_REQUIEM_OR_FAITHFUL_COMMUNION · not source-event-clock certified |
| MR62.SOL.B02.042 | AO.SM.C0163 | DEACON | KNEEL_RIGHT_AT_QUAM_OBLATIONEM | ALL · not source-event-clock certified |
| MR62.SOL.B02.043 | AO.SM.C0174 | DEACON | LIFT_CHASUBLE_FOR_HOST_ELEVATION | ALL · not source-event-clock certified |
| MR62.SOL.B02.044 | AO.SM.C0181 | DEACON | UNCOVER_AND_RECOVER_CHALICE_AT_ELEVATION | ALL · not source-event-clock certified |
| MR62.SOL.B02.045 | AO.SM.C0174 | THURIFER | INCENSE_ELEVATED_HOST_THREE_SWINGS | NOT_REQUIEM · not source-event-clock certified |
| MR62.SOL.B02.046 | AO.SM.C0181 | THURIFER | INCENSE_ELEVATED_CHALICE_THREE_SWINGS | NOT_REQUIEM · not source-event-clock certified |
| MR62.SOL.B02.047 | AO.SM.C0174 | SUBDEACON | INCENSE_ELEVATED_HOST_REQUIEM | REQUIEM · not source-event-clock certified |
| MR62.SOL.B02.048 | AO.SM.C0181 | SUBDEACON | INCENSE_ELEVATED_CHALICE_REQUIEM | REQUIEM · not source-event-clock certified |
| MR62.SOL.B02.049 | AO.SM.C0209 | DEACON | MOVE_RIGHT_AT_ET_DIMITTE_NOBIS | ALL · not source-event-clock certified |
| MR62.SOL.B02.050 | AO.SM.C0209 | SUBDEACON | BRING_PATEN_AT_END_PATERNOSTER | NOT_REQUIEM · not source-event-clock certified |
| MR62.SOL.B02.051 | AO.SM.C0210 | DEACON | WIPE_AND_GIVE_PATEN_TO_CELEBRANT | NOT_REQUIEM · not source-event-clock certified |
| MR62.SOL.B02.052 | AO.SM.C0219 | SUBDEACON | MOVE_TO_LEFT_AT_PAX_DOMINI | ALL · not source-event-clock certified |
| MR62.SOL.B02.053 | AO.SM.C0222 | SUBDEACON | RECITE_AGNUS_DEI_WITH_CELEBRANT | ALL · not source-event-clock certified |
| MR62.SOL.B02.054 | AO.SM.C0225 | DEACON | RECEIVE_PAX_FROM_CELEBRANT | NOT_REQUIEM · not source-event-clock certified |
| MR62.SOL.B02.055 | AO.SM.C0225 | DEACON | GIVE_PAX_TO_SUBDEACON | NOT_REQUIEM · not source-event-clock certified |
| MR62.SOL.B02.056 | AO.SM.C0225 | SUBDEACON | CARRY_PAX_TO_CHOIR | NOT_REQUIEM · not source-event-clock certified |
| MR62.SOL.B02.057 | rite branch | DEACON | NO_PAX_IN_REQUIEM | REQUIEM · not source-event-clock certified |
| MR62.SOL.B02.058 | AO.SM.C0234 | SUBDEACON | HELP_WITH_CHALICE_ABLUTIONS | ALL · not source-event-clock certified |
| MR62.SOL.B02.059 | AO.SM.C0251 | DEACON | CARRY_MISSAL_BACK_TO_EPISTLE_SIDE | ALL · not source-event-clock certified |
| MR62.SOL.B02.060 | AO.SM.C0251 | SUBDEACON | CLEAN_COVER_CHALICE_AND_FOLD_CORPORAL | ALL · not source-event-clock certified |
| MR62.SOL.B02.061 | AO.SM.C0259 | DEACON | SING_ITE_MISSA_EST_SOLEMN | ITE_MISSA_EST · not source-event-clock certified |
| MR62.SOL.B02.062 | rite branch | DEACON | SING_HUMILIATE_CAPITA_VESTRA_DEO | ORATIO_SUPER_POPULUM · not source-event-clock certified |
| MR62.SOL.B02.063 | rite branch | PRIEST | NO_BLESSING_REQUIEM | REQUIEM · not source-event-clock certified |
| MR62.SOL.B02.064 | AO.SM.C0084 | DEACON | GOSPEL_WITHOUT_INCENSE_OR_CANDLES_REQUIEM | REQUIEM · not source-event-clock certified |
| MR62.SOL.B02.065 | AO.SM.C0084 | ACOLYTES | TWO_ACOLYTES_HOLD_GOSPEL_BOOK_WITHOUT_LIGHTS_REQUIEM | REQUIEM · not source-event-clock certified |
| MR62.SOL.B02.066 | AO.SM.C0088 | DEACON | NO_GOSPEL_BOOK_KISS_OR_CELEBRANT_INCENSE_REQUIEM | REQUIEM · not source-event-clock certified |
| MR62.SOL.B02.067 | AO.SM.C0076 | SUBDEACON | NO_POST_EPISTLE_BLESSING_REQUIEM | REQUIEM · not source-event-clock certified |
| MR62.SOL.B02.068 | AO.SM.C0112 | SUBDEACON | POUR_WATER_INTO_CHALICE | ALL · not source-event-clock certified |

**Research note:** this 68-record minister ledger is NOT automatically certified for runtime or complete choreography. The donor's static C14 Gospel book is initially on the wrong minister, C13 Missal transfer is a generic server movement, and the incensation/elevation/Communion scenes must distinguish role, object and conditional omission. Draft adapter fixes exist for selected *static states* only; do not count those as correctly animated sequences.

## D. Complete existing **59 faithful gesture records** — must not be conflated with priest animation

| Registry ID | Cue | Faithful gesture/action | Words / condition | Original M3 implementation |
| --- | --- | --- | --- | --- |
| GM.F.C0001.01 | AO.SM.C0001 | SIGN_OF_CROSS — Sign of the Cross | In nómine Patris | Gesture/icon cue only; no matching individual limb action |
| GM.F.C0014.01 | AO.SM.C0014 | SIGN_OF_CROSS — Sign of the Cross | Adiutórium nostrum ✠ | Gesture/icon cue only; no matching individual limb action |
| GM.F.C0021.01 | AO.SM.C0021 | PROFOUND_BOW — Profound bow / remain kneeling according profile | During Confiteor | Gesture/icon cue only; no matching individual limb action |
| GM.F.C0022.01 | AO.SM.C0022 | BREAST_STRIKE — Strike breast ×3 | mea culpa ×3 | Gesture/icon cue only; no matching individual limb action |
| GM.F.C0023.01 | AO.SM.C0023 | HEAD_OR_BODY_BOW — Remain bowed / return after conclusion | After mea culpa | Gesture/icon cue only; no matching individual limb action |
| GM.F.C0026.01 | AO.SM.C0026 | SIGN_OF_CROSS — Sign of the Cross | Indulgéntiam ✠ | Gesture/icon cue only; no matching individual limb action |
| GM.F.C0055.01 | AO.SM.C0055 | HEAD_OR_BODY_BOW — Bow head | Adorámus te | Gesture/icon cue only; no matching individual limb action |
| GM.F.C0056.01 | AO.SM.C0056 | HEAD_OR_BODY_BOW — Customary bow may follow local practice; do not hard-code as universal. | Adorámus te | Gesture/icon cue only; no matching individual limb action |
| GM.F.C0057.01 | AO.SM.C0057 | HEAD_OR_BODY_BOW — Bow head | Adorámus te | Gesture/icon cue only; no matching individual limb action |
| GM.F.C0058.01 | AO.SM.C0058 | HEAD_OR_BODY_BOW — Bow head | Grátias ágimus tibi | Gesture/icon cue only; no matching individual limb action |
| GM.F.C0059.01 | AO.SM.C0059 | HEAD_OR_BODY_BOW — Bow head | Grátias ágimus tibi | Gesture/icon cue only; no matching individual limb action |
| GM.F.C0060.01 | AO.SM.C0060 | HEAD_OR_BODY_BOW — Bow head | Iesu Christe | Gesture/icon cue only; no matching individual limb action |
| GM.F.C0061.01 | AO.SM.C0061 | HEAD_OR_BODY_BOW — Bow head | Iesu Christe | Gesture/icon cue only; no matching individual limb action |
| GM.F.C0062.01 | AO.SM.C0062 | HEAD_OR_BODY_BOW — Bow head | Iesu Christe | Gesture/icon cue only; no matching individual limb action |
| GM.F.C0063.01 | AO.SM.C0063 | HEAD_OR_BODY_BOW — Bow head | súscipe deprecatiónem nostram | Gesture/icon cue only; no matching individual limb action |
| GM.F.C0064.01 | AO.SM.C0064 | HEAD_OR_BODY_BOW — Bow head | súscipe deprecatiónem nostram | Gesture/icon cue only; no matching individual limb action |
| GM.F.C0066.01 | AO.SM.C0066 | HEAD_OR_BODY_BOW — Bow head | Iesu Christe | Gesture/icon cue only; no matching individual limb action |
| GM.F.C0067.01 | AO.SM.C0067 | HEAD_OR_BODY_BOW — Bow head | Iesu Christe | Gesture/icon cue only; no matching individual limb action |
| GM.F.C0068.01 | AO.SM.C0068 | SIGN_OF_CROSS — Sign of the Cross | Cum Sancto Spíritu ✠ | Gesture/icon cue only; no matching individual limb action |
| GM.F.C0069.01 | AO.SM.C0069 | SIGN_OF_CROSS — Sign of the Cross | Cum Sancto Spíritu ✠ | Gesture/icon cue only; no matching individual limb action |
| GM.F.C0084.01 | AO.SM.C0084 | GOSPEL_SMALL_CROSSES — Forehead · lips · breast small crosses | At Gospel announcement | Gesture/icon cue only; no matching individual limb action |
| GM.F.C0089.01 | AO.SM.C0089 | HEAD_OR_BODY_BOW — Bow head | Credo in unum Deum | Gesture/icon cue only; no matching individual limb action |
| GM.F.C0090.01 | AO.SM.C0090 | HEAD_OR_BODY_BOW — Bow head | Credo in unum Deum | Gesture/icon cue only; no matching individual limb action |
| GM.F.C0092.01 | AO.SM.C0092 | HEAD_OR_BODY_BOW — Bow head | Iesum Christum / Holy Name | Gesture/icon cue only; no matching individual limb action |
| GM.F.C0093.01 | AO.SM.C0093 | HEAD_OR_BODY_BOW — Bow head | Iesum Christum / Holy Name | Gesture/icon cue only; no matching individual limb action |
| GM.F.C0094.01 | AO.SM.C0094 | HEAD_OR_BODY_BOW — Bow head | Iesum Christum / Holy Name | Gesture/icon cue only; no matching individual limb action |
| GM.F.C0096.01 | AO.SM.C0096 | GENUFLECT — Kneeling/genuflection here depends on sung/local calendar rule; Christmas and... | Et incarnatus est ... et homo factus est | Generic posture only; specific boundary missing |
| GM.F.C0097.01 | AO.SM.C0097 | RISE — Rise / resume prior posture | after et homo factus est | Generic posture only; specific boundary missing |
| GM.F.C0100.01 | AO.SM.C0100 | HEAD_OR_BODY_BOW — Bow head | simul adorátur | Gesture/icon cue only; no matching individual limb action |
| GM.F.C0101.01 | AO.SM.C0101 | HEAD_OR_BODY_BOW — Bow head | simul adorátur | Gesture/icon cue only; no matching individual limb action |
| GM.F.C0102.01 | AO.SM.C0102 | HEAD_OR_BODY_BOW — Bow head | simul adorátur | Gesture/icon cue only; no matching individual limb action |
| GM.F.C0104.01 | AO.SM.C0104 | SIGN_OF_CROSS — Sign of the Cross | Et vitam ✠ ventúri sæculi | Gesture/icon cue only; no matching individual limb action |
| GM.F.C0105.01 | AO.SM.C0105 | SIGN_OF_CROSS — Sign of the Cross | Et vitam ✠ ventúri sæculi | Gesture/icon cue only; no matching individual limb action |
| GM.F.C0141.01 | AO.SM.C0141 | HEAD_OR_BODY_BOW — Bow head | Grátias agámus Dómino Deo nostro | Gesture/icon cue only; no matching individual limb action |
| GM.F.C0142.01 | AO.SM.C0142 | HEAD_OR_BODY_BOW — Bow head | Grátias agámus Dómino Deo nostro | Gesture/icon cue only; no matching individual limb action |
| GM.F.C0145.01 | AO.SM.C0145 | HEAD_OR_BODY_BOW — Bow head | Sanctus, Sanctus, Sanctus | Gesture/icon cue only; no matching individual limb action |
| GM.F.C0148.01 | AO.SM.C0148 | SIGN_OF_CROSS — Sign of the Cross | Benedíctus qui venit | Gesture/icon cue only; no matching individual limb action |
| GM.F.C0173.01 | AO.SM.C0173 | HEAD_OR_BODY_BOW — Remain kneeling; bow reverently, then look up at the Sacred Host | The Host is actually elevated — At the actual elevation [Do not add an invent... | Gesture/icon cue only; no matching individual limb action |
| GM.F.C0174.01 | AO.SM.C0174 | HEAD_OR_BODY_BOW — Remain kneeling; bow reverently, then look up at the Sacred Host | The Host is actually elevated — At the actual elevation [Do not add an invent... | Gesture/icon cue only; no matching individual limb action |
| GM.F.C0179.01 | AO.SM.C0179 | HEAD_OR_BODY_BOW — Remain kneeling; bow reverently, then look up at the Chalice | The Chalice is actually elevated — At the actual elevation [Do not add an inv... | Gesture/icon cue only; no matching individual limb action |
| GM.F.C0196.01 | AO.SM.C0196 | BREAST_STRIKE — Strike breast | Nobis quoque peccatóribus — At / as these words begin | Gesture/icon cue only; no matching individual limb action |
| GM.F.C0197.01 | AO.SM.C0197 | BREAST_STRIKE — Strike breast | Nobis quoque peccatóribus — At / as these words begin | Gesture/icon cue only; no matching individual limb action |
| GM.F.C0198.01 | AO.SM.C0198 | BREAST_STRIKE — Strike breast | Nobis quoque peccatóribus — At / as these words begin | Gesture/icon cue only; no matching individual limb action |
| GM.F.C0222.01 | AO.SM.C0222 | BREAST_STRIKE — Strike breast once | Agnus Dei at each invocation | Gesture/icon cue only; no matching individual limb action |
| GM.F.C0223.01 | AO.SM.C0223 | BREAST_STRIKE — Strike breast once | Agnus Dei at each invocation | Gesture/icon cue only; no matching individual limb action |
| GM.F.C0224.01 | AO.SM.C0224 | BREAST_STRIKE — Strike breast once | Agnus Dei at each invocation | Gesture/icon cue only; no matching individual limb action |
| GM.F.C0235.01 | AO.SM.C0235 | HEAD_OR_BODY_BOW — Remain bowed / recollected | During optional second Confiteor | Gesture/icon cue only; no matching individual limb action |
| GM.F.C0236.01 | AO.SM.C0236 | BREAST_STRIKE — Strike breast ×3 | mea culpa ×3 | Gesture/icon cue only; no matching individual limb action |
| GM.F.C0237.01 | AO.SM.C0237 | HEAD_OR_BODY_BOW — Remain bowed / recollected | Conclusion of optional Confiteor | Gesture/icon cue only; no matching individual limb action |
| GM.F.C0240.01 | AO.SM.C0240 | SIGN_OF_CROSS — Sign of the Cross | Indulgéntiam ✠ | Gesture/icon cue only; no matching individual limb action |
| GM.F.C0242.01 | AO.SM.C0242 | REVERENT_ATTENTION — Reverent attention to the Host | Ecce Agnus Dei | Gesture/icon cue only; no matching individual limb action |
| GM.F.C0243.01 | AO.SM.C0243 | BREAST_STRIKE — Strike breast once | Domine non sum dignus — invocation 1 | Gesture/icon cue only; no matching individual limb action |
| GM.F.C0244.01 | AO.SM.C0244 | BREAST_STRIKE — Strike breast once | Domine non sum dignus — invocation 2 | Gesture/icon cue only; no matching individual limb action |
| GM.F.C0245.01 | AO.SM.C0245 | BREAST_STRIKE — Strike breast once | Domine non sum dignus — invocation 3 | Gesture/icon cue only; no matching individual limb action |
| GM.F.C0246.01 | AO.SM.C0246 | HEAD_OR_BODY_BOW — Bow the head | Iesu — At the Holy Name [Only when the Name is in public/audible text; do not scan silent private prayers.] | Gesture/icon cue only; no matching individual limb action |
| GM.F.C0265.01 | AO.SM.C0265 | SIGN_OF_CROSS — Sign of the Cross | Pater, et Filius, ✠ et Spiritus Sanctus | Gesture/icon cue only; no matching individual limb action |
| GM.F.C0269.01 | AO.SM.C0269 | GOSPEL_SMALL_CROSSES — Forehead · lips · breast small crosses | Initium ✠ sancti Evangelii | Gesture/icon cue only; no matching individual limb action |
| GM.F.C0273.01 | AO.SM.C0273 | GENUFLECT — Genuflect | ET VERBUM CARO FACTUM EST | Generic posture only; specific boundary missing |
| GM.F.C0274.01 | AO.SM.C0274 | RISE — Rise | Et habitávit in nobis | Generic posture only; specific boundary missing |

**Faithful note:** several source rows repeat the *same* sung phrase or strike over adjacent cues, because they describe posture/visual placement; they are not always distinct physical actions. Do not force one 3D motion for each duplicated text row.

## E. Eight registered **sung sedilia phrase-events** (begin/end pairs)

| ID | Donor scene | Choir words | Necessary physical action |
| --- | --- | --- | --- |
| SED-GLORIA-ADORAMUS | C08 | Adoramus te | Uncover/bow/recover; choir sung words, not priest's earlier private recitation |
| SED-GLORIA-GRATIAS | C08 | Gratias agimus tibi | Separate head bow and biretta on knee, recover |
| SED-GLORIA-IESU-FIRST | C08 | Iesu Christe (first) | Separate head bow and biretta, recover |
| SED-GLORIA-SUSCIPE | C08 | Suscipe deprecationem nostram | Separate head bow and biretta, recover |
| SED-GLORIA-IESU-SECOND | C09 | Iesu Christe (second) | Separate bow; do not reuse first occurrence clock |
| SED-CREDO-IESUM | C17 | Iesum Christum | Separate sung-word reverence |
| SED-CREDO-INCARNATUS | C18 | Et incarnatus est ... et homo factus est | If seated, uncovered profound head bow; Christmas 3 Masses/Annunciation instead kneel; D has distinct corporal duty |
| SED-CREDO-SIMUL | C19 | simul adoratur | Separate bow; recover biretta |

**Important:** eight events represent **16 observed boundaries** (BEGIN/END), not 16 gestures. Christmas/Annunciation exceptional kneeling must be selected by the proper of the Mass, not date alone. Proper names and exact positions remain subject to source audit. See `SEDILIA-REVERENCES-1962.md`.

## F. Supplemental **scene-by-scene animation tasks** (what the source rows mean physically)

| Scene(s) | Actors | Required gestures, movements, props | Source / cue family | Original donor gap |
| --- | --- | --- | --- | --- |
| Before Mass / C01–C04 | Priest, servers | Approach/stop/reverence to altar or exposed Blessed Sacrament according condition; head bow at Gloria Patri; Confiteor profound bow with three separate mea culpa strikes; server reciprocal Confiteor and absolutions; joined hands; climb, kiss altar, opening veil/chalice and book | C0001,C0010,C0016,C0017,C0026,C0038,C0039 | A priest standing at the foot or a server kneeling is not a sequence; exact genuflection depends on tabernacle/context |
| Entrance/Introit C05 | Priest, deacon, thurifer | Receive incense, bless the grains, thurible handover/kiss, bow or genuflect, incense crucifix then altar in ordered swings; return thurible; incensing celebrant | C0041; Ritus IV | Donor C05 generic incenseSeq covers travel/smoke, not all hand and swing micro-actions; Requiem omits this first incensation |
| Kyrie / Gloria C06–C09 | Celebrant, ministers, server | Intone Gloria with posture/hands; sit/rise at sedilia; biretta remove/bow/replace at each sung phrase; priest's own recitation not choir clock | C0056,C0058,C0061,C0064,C0067,C0068 | Donor card-level sedilia and static gestures cannot perform phrase-level cap and head actions |
| Collect C10 | Celebrant, deacon, subdeacon | Turn/face altar correctly, Oremus head bow, hand join/spread, chant collect and conclusion, hand closure, correct multiple collects | C0072 | Existing orans is held static, without actual arm/hand state sequence |
| Epistle C11 | Subdeacon, priest, servers | Collect Epistolarium, carry to Epistle side, sing, return, genuflect, kiss hand and receive blessing except Requiem; correct deacon/subdeacon responses | C0075–0076 | Original generic static/book absence; draft adapter is only static |
| Gradual / Alleluia / Tract C12 | Celebrant and ministers | Approach sedilia, sit and manage biretta, return to altar on appropriate cue; special kneeling/reverences where specified | AO.CARD.006 | No precise seated arrival/departure timing |
| Gospel prep C13 | Priest/deacon/subdeacon | Transfer Missal to Gospel side by correct minister; deacon Munda cor meum kneeling, Gospel-book handling, seek/kiss priest hand and receive blessing when applicable, procession formation | C0079–0082 | Original non-Solemn server walk cannot serve Solemn deacon/subdeacon or clock |
| Gospel C14 | Priest or deacon; subdeacon; acolytes; thurifer; faithful | Four small Gospel crosses for priest/deacon (book, forehead, lips, breast), faithful three; subdeacon holds one Gospel book; incensation of Gospel book; book to celebrant for kiss; incensation of celebrant; reverences and return route | C0084–0088 | Original generic read pose and prop incorrect in Solemn, distinct Requiem omission |
| Credo C16–C19 | All sacred ministers | Celebrant recites his own genuflection; sung occurrence requires choir-owned kneel/profound seated bow according rubrics; individual phrase bows; biretta sequence; D leaves to altar with burse, spreads corporal, returns | C0090–0105 | Original seated still and D static inaccurate at C18; conditional kneeling needed |
| Offertory C20–C23 | Celebrant, deacon, subdeacon, server | Paten/Host cross, Host placement, chalice wipe, wine and water actor-specific pour, blessing water except Requiem, chalice cross and offer, assistant supporting arm/foot, cover pall, paten/humeral veil; In spiritu bow, eyes/hands raised then joined, bless offerings | C0110–0119 | Objects and hands not articulated; wine vs water actor/clock not interchangeable |
| Incensation C24 | Priest, D/S, thurifer, choir | Bless incense and thurible handoff, crosswise/circular incensing of gifts, crucifix/altar swings, lift/move chalice to avoid obstruction, return thurible; incense celebrant/choir/ministers/people in correct order; Requiem ONLY celebrant after altar | C0120–0124 | Donor C24 generic ordinary routine is wrong for Requiem; Low/simple sung omit C24 entirely |
| Lavabo C25 / Orate C26 | Priest, server, acolytes | Walk Epistle side, pour water, wash thumb/index fingertips, receive/dry on manuterge; prescribed Gloria Patri omission; return center, bow, raise eyes, kiss altar, turn to faithful for Orate fratres and turn back | C0125–0129 | Donor has location changes but not hand-to-object/water/towel contact |
| Preface / Sanctus C28–C29 | Celebrant, D/S, acolytes, choir | Gratias agamus head bow; Preface hands joined/spread; Sanctus profound/bow; bell and torch lighting on correct stage; deacon ascend, subdeacon station behind | C0141–0148 | Generic orans and sound effects only |
| Canon C30–C34 | Celebrant, D/S | Te igitur deep bow and altar kiss, 3 crosses; raised/joined hands and head bow at Memento; Iesu name bow; Hanc igitur hand spreading; 3+1+1 crosses of Quam oblationem; D assist and kneel at Quam oblationem | C0150–0166 | M3 read/orans static; no source-specific hands/cross counts |
| Host Consecration C35–C36 | Celebrant, deacon, thurifer/subdeacon, server | Raise eyes, bow head at thanksgiving, cross Host, bend deeply with elbows on altar, consecrate, genuflect, elevate Host, lower/replace, genuflect again; D lifts chasuble; correct incense minister and swings; bells | C0167–0174 | Donor elevSeq only genuflect→elevate, bell/glow; omits full ordered ritual and left-hand object transitions |
| Chalice Consecration C37–C38 | Celebrant, deacon, thurifer/subdeacon, server | Head bow/thanks, cross chalice, deep consecration posture, uncover pall, genuflect, elevate chalice, lower/replace and recover pall, genuflect again; D assists; incense and bells correct | C0176–0181 | Same generic donor shortcut |
| Canon after Consecration C39–C45 | Celebrant, D/S | 3 crosses at Unde et memores, Host and chalice crosses, deep Supplices bow/kiss, sign self, Memento of dead hands, Nobis quoque breast strike, 3 Per quem crosses, 3+2 Per ipsum crosses with Host over chalice, minor elevation and return | C0184–0204 | Donor generic static poses; minor elevation not physically articulated |
| Pater / Fraction / Pax C46–C50 | Celebrant, D/S, servers | Oremus head bow, hands, paten handover, cross self with paten, break Host, retain particle, 3 crosses with particle at Pax Domini, drop particle in chalice, Pax sequence and hand/cheek reverence where appointed, each Agnus breast strike except Requiem | C0208–0224 | No detailed particle/paten/fraction/commingling geometry; donor does not distinguish Requiem Agnus |
| Priest Communion C51–C54 | Celebrant, server, deacon | Separate 3 chest strikes at celebrant's Domine non sum dignus, sign with Host, actual mouth reception, lift chin, consume Host; cross with chalice, consume Blood, fingers staying joined; vessels/ablution handoffs | C0229–0234 | Generic host and chalice props do not animate receipt/consumption |
| Optional Confiteor C55 | Server, faithful, celebrant | Server/speaker bowed, 3 mea culpa strikes, Misereatur and Indulgentiam cross; correct optional visibility and response actor | C0235–0240 | Not in original CPOSE as distinct action; optional under local practice, not universal |
| Communion faithful C56–C57 | Celebrant, deacon, server, communicants | Show Host Ecce Agnus Dei, faithful 3 Domine non sum dignus strikes, priest walks to rail with ciborium, paten served by proper minister, distribute Host individually to tongue of each communicant, bow/proper reception, return | C0242–0246 | Donor pre-scripted route/repetitions exist but not source-owned count, hand-to-mouth or verified departure |
| Ablutions and return C58–C60 | Celebrant, deacon, subdeacon/server | Purification of chalice, pouring wine then wine/water (form), priest fingers wash, consume ablutions, wipe/purify chalice, veil/chalice handoff, fold corporal, move Missal to Epistle side, return to postcommunion orans | C0251 and related | Generic static read pose and non-Solemn missalSeq; no vessels/hand articulation |
| Dismissal / Blessing C61–C63 | Celebrant/deacon, servers, faithful | Turn to people, appropriate dismissal singer (D for Solemn); Placeat tibi profound bow, altar kiss, face people, raise eyes/hands, join hands, bow to cross and sign of blessing; faithful bless selves/kneel; no Requiem blessing | C0259,C0262–0265 | Generic orans/bless torso; solemn role and no-Requiem conditions need source choreography |
| Last Gospel C64–C65 | Celebrant, faithful, servers | Reposition at Gospel corner or as appointed, Gospel book/forehead/lips/breast crosses, read holding book, genuflect at Et Verbum caro factum est and rise, finish/revere Gospel book; faithful three crosses and genuflection | C0269,C0273–0274 | M3 generic read only; no distinct physical text-bound genuflection |
| Asperges / Vidi aquam (pre-Mass) | Celebrant in cope, servers, ministers, faithful | Prepare aspergillum, bless/use water, sprinkle altar then clergy/people, hand/arm swing, nave procession and return, kneel/reverence, faithful bless selves | ASP-R01…R05 | Donor P1 has route; not actual sprinkling hand/swing; adapter has only observed droplet |
| Special rites beyond 65 scenes | Priest, ministers, people | Candlemas candles and procession; Palm blessing/procession; Rogations; Corpus Christi Benediction; Holy Thursday transfer; Good Friday adoration; Tenebrae, Requiem Absolution and other rite-specific gestures | separate special-rite registries | OUT OF SCOPE for claiming 65-card Mass completion: separate rite animation projects |

## Non-negotiable form and rubrical condition matrix

| Condition | What animation must do |
| --- | --- |
| Low | Do not add sedilia choir-phrase bow, a Solemn minister, or incensation; celebrant's private text gestures still apply. |
| Simple Missa Cantata | Choir words are a separate source lane from priest's private recital; server and celebrant roles differ from Solemn; C24 ordinary incensation omitted. |
| Incense Missa Cantata | Distinguish thurifer/server and incensation events without inventing a deacon/subdeacon. |
| Solemn | Deacon, subdeacon, thurifer and acolytes have distinct roles; C11–C14, C18, C24, C35–C38, C47, C56–C59 cannot inherit generic server props. |
| Requiem | Omit first entrance incensation; omit Gospel incense and candles; keep two acolytes supporting ONE Gospel book; do not bless water at chalice preparation; after Offertory incensation only celebrant is incensed; subdeacon is elevation thurifer; omit Agnus breast strikes and Pax; no final blessing. Retain applicable Placeat tibi and Last Gospel. |
| Three Christmas Masses and Annunciation | At *sung* Incarnatus kneel instead of the ordinary seated profound-head bow; priest still genuflects at his own Credo recital. |
| Optional second Confiteor | Animation only when custom/rite selects it; no silent default injection into all 1962 Masses. |
| Ferial, Ember, fast, vigils and Saints' propers | Respect Mass- and day-specific standing, sitting, genuflection and torch behavior; do not derive posture from general calendar labels alone. |
| Tabernacle / exposed Blessed Sacrament | Correct reverence in approach/withdrawal where applicable and with explicit church context. |
| Profound/head bow vs genuflection | Distinct geometry and knee contact. The presence of a gesture icon never certifies that it physically happened. |
| Audible/secret/sung | Visual role follows correct rite; omit synthetic singing mouths or guessed acoustic duration. |
| No source clock | Stage correct static end position and book ownership, mark animation HOLD; never synthesize a movement based only on scroll, card navigation or a Schola progress bar. |

## Claude implementation order

**Pass 1 (blocking):** C08/C09/C12/C17–C19 physically coherent seated actors and biretta, all view directions; C18 deacon burse/corporal separate. **Show real M3 screenshots and video before progressing.**

**Pass 2:** C11–C14 correct actor and book/chalice handoffs, ordinary vs Requiem, source-static vs verified motion. **Show exact cue C0075/C0081/C0084 comparisons.**

**Pass 3:** C21–C25 Offertory, C30–C45 Roman Canon including individually counted crosses, true Host/Chalice Consecrations, elevations and changes to the deacon/subdeacon positions.

**Pass 4:** C46–C59 fraction, paten, Pax, celebrant and faithful Communion, vessels/ablutions and role-specific return routes.

**Pass 5:** C01–C20 smaller signs/bows/recitation/source-role detail and C60–C65 final rites plus exceptions; separately add all faithful gestures and extra-P1 rites.

For every event Claude must specify: `eventId`, `sourceCueId`, `actualSourceOwner`, `form`, `condition`, `actor`, `beforePose`, `afterPose`, `handAndPropContacts`, `transitionSteps`, `observedBegin`, `observedEnd`, `cancelPolicy`, `camera`, `verificationEvidence`, `reviewStatus`. Use `NULL` rather than inventing a clock or actor. Preserve donor source and old approved icons; implement in an isolated experimental working copy until real visual acceptance. GitHub Actions and GitHub Pages only; no Vercel or paid libraries.

## Totals and non-additivity

- **65** canonical original Mass scenes (plus original pre/post scenes).
- **83** currently indexed priest gesture rows (not all missing as general silhouettes).
- **59** faithful gesture rows (several text duplicates of one action).
- **46** verified B01 ceremonial rows that cross-check/extend the priest registry.
- **68** B02 Solemn-minister research rows that need certified actor-specific motion and negative-condition filtering.
- **8** distinct choir-phase seated-reverence events (BEGIN/END boundaries), already partially represented in draft adapter, with full actual character movement not accepted.

These are **264 source/reference rows including overlaps**, not 264 independent missing animations. The master task is to map each *unique physical action* to a source, actor, condition and verified frame sequence.

*Audit data generated directly from repository source files on the draft branch. Neither source-event existence nor a passing test constitutes owner approval of animation or automatically advances research-only records to runtime.*
