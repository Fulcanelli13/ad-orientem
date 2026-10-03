
(()=>{
'use strict';const AO=window.AO=window.AO||{};
const records=Object.freeze([
{id:'ABS-010',phase:'ABSOLUTION',trigger_type:'RITE_STATE',trigger_key:'ABSOLUTION_START',actor_scope:'ALL_FAITHFUL',posture_state:'LOCAL_OR_INHERIT',action_state:'MOVE_OR_REMAIN_AS_DIRECTED_NEAR_CATAFALQUE',object_state:null,branch_condition:null},
{id:'ABS-020',phase:'ABSOLUTION',trigger_type:'BRANCH_STATE',trigger_key:'BODY_PRESENT_NON_INTRES',actor_scope:'ALL_FAITHFUL',posture_state:'LOCAL_OR_INHERIT',action_state:'RESPOND_AMEN_TO_NON_INTRES',object_state:null,branch_condition:'BODY_PRESENT'},
{id:'ABS-030',phase:'ABSOLUTION',trigger_type:'RITE_STATE',trigger_key:'LIBERA_ME',actor_scope:'ALL_FAITHFUL',posture_state:'LOCAL_OR_INHERIT',action_state:'PRAY_LIBERA_ME',object_state:null,branch_condition:null},
{id:'ABS-040',phase:'ABSOLUTION',trigger_type:'RITE_STATE',trigger_key:'KYRIE_PATER_VERSICLES',actor_scope:'ALL_FAITHFUL',posture_state:'LOCAL_OR_INHERIT',action_state:'MAKE_APPOINTED_RESPONSES',object_state:null,branch_condition:null},
{id:'ABS-050',phase:'FUNERAL_DEPARTURE',trigger_type:'FOLLOWING_ACTION',trigger_key:'IN_PARADISUM_IF_BURIAL_FOLLOWS',actor_scope:'FAITHFUL_PARTICIPATING',posture_state:'PROCESSIONAL',action_state:'JOIN_FUNERAL_PROCESSION_WITH_IN_PARADISUM',object_state:null,branch_condition:'BODY_PRESENT_AND_BURIAL_PROCESSION'}]);
const norm=v=>String(v||'').trim().toUpperCase().replace(/[\s-]+/g,'_');
function active(ctx={}){return !!ctx.requiem&&['ABSOLUTION','REQUIEM_ABSOLUTION','ABSOLUTION_SUPER_TUMULUM'].includes(norm(ctx.followingAction))}
function project(ctx={}){if(!active(ctx))return [];return records.filter(e=>e.id!=='ABS-020'||ctx.bodyPresent===true).filter(e=>e.id!=='ABS-050'||(ctx.bodyPresent===true&&ctx.burialProcession===true&&ctx.personal?.participatingProcession===true))}
AO.RequiemAbsolutionR07=Object.freeze({version:'R07',records,active,project});
})();
(()=>{
'use strict';const AO=window.AO=window.AO||{};
const graph=Object.freeze([
{id:'NUP.001',sequence:1,phase:'RITUALE_BEFORE_MASS',moment:'Marriage rite begins',instruction:'The marriage rite is distinct from the Mass. Follow the priest’s questions and the couple’s consent.'},
{id:'NUP.002',sequence:2,phase:'RITUALE_BEFORE_MASS',moment:'Consent — bridegroom',instruction:'Listen to the question and the bridegroom’s consent. No congregational response is prescribed.'},
{id:'NUP.003',sequence:3,phase:'RITUALE_BEFORE_MASS',moment:'Consent — bride',instruction:'Listen to the question and the bride’s consent. No congregational response is prescribed.'},
{id:'NUP.004',sequence:4,phase:'RITUALE_BEFORE_MASS',moment:'Joining of hands / declaration',instruction:'Remain attentive while the spouses join hands and the priest completes the marriage formula.'},
{id:'NUP.005',sequence:5,phase:'RITUALE_BEFORE_MASS',moment:'Sprinkling of spouses',instruction:'The sprinkling is directed to the spouses, not a congregational Asperges.'},
{id:'NUP.006',sequence:6,phase:'RITUALE_BEFORE_MASS',moment:'Blessing and giving of ring',instruction:'Follow the ring blessing and giving; explicit approved local ritual may supplement the Roman framework.'},
{id:'NUP.007',sequence:7,phase:'MASS',moment:'Mass begins',instruction:'Hand off to the selected canonical Mass form.'},
{id:'NUP.008',sequence:8,phase:'MASS_INSERT',moment:'After Pater noster, before Libera nos',instruction:'Spouses kneel before the altar; celebrant goes or turns to the Epistle side.'},
{id:'NUP.009',sequence:9,phase:'MASS_INSERT',moment:'First nuptial prayer',section:'Benedictio Nuptialis 1'},
{id:'NUP.010',sequence:10,phase:'MASS_INSERT',moment:'Second nuptial prayer',section:'Benedictio Nuptialis 2'},
{id:'NUP.011',sequence:11,phase:'MASS',moment:'Mass resumes',instruction:'Return to Libera nos and the ordinary Communion rite.'},
{id:'NUP.012',sequence:12,phase:'MASS_INSERT',moment:'Final nuptial blessing',section:'Benedictio Finalis'},
{id:'NUP.013',sequence:13,phase:'MASS_INSERT',moment:'Admonition and sprinkling',instruction:'Priest addresses and sprinkles the spouses; do not project a congregational Asperges gesture.'},
{id:'NUP.014',sequence:14,phase:'MASS',moment:'Ordinary ending resumes',instruction:'Return to Placeat, ordinary final blessing and Last Gospel unless another rubric omits them.'},
{id:'NUP.015',sequence:15,phase:'CALENDAR_RULE',moment:'Nuptial eligibility',instruction:'Do not show the Nuptial-Mass sequence until eligibility is explicitly resolved.'},
{id:'NUP.016',sequence:16,phase:'LOCAL_CUSTOM',moment:'Local / provincial marriage customs',instruction:'Apply only an explicitly configured legitimate local ritual; never infer one from geography.'}]);
function section(proper,id){const x=(proper?.specialSections||[]).find(s=>s.id===id);return x?.text||null}
AO.NuptialR08=Object.freeze({version:'R08',graph,section});
})();
/* ========================================================================
   AD ORIENTEM — R10 SPECIAL PRE-MASS / SPECIAL-DAY OVERLAYS
   Recovery authority: v43.73 / v43.74 special-days closure
   Graph counts: ASP 6 · PALM 12 · ASH 8 · CND 11
   Governing rule: calendar identity may suggest a rite; only an explicitly
   selected / actually occurring rite activates its runtime graph.
======================================================================== */
(() => {
  'use strict';

  const AO = globalThis.AO = globalThis.AO || {};

  const RECORDS = Object.freeze({
  "PALM-BLS-010": {
    "id": "PALM-BLS-010",
    "phase": "BLESSING",
    "trigger_type": "RITE_STATE",
    "trigger_key": "PALM_RITE_START",
    "actor_scope": "FAITHFUL",
    "posture_state": "STAND",
    "action_state": "Attend blessing and make responses",
    "object_state": null,
    "personal_state": null,
    "branch_condition": null,
    "evidence_status": "PRIMARY_RITE",
    "source_locator": "Missale Romanum 1962 — Dominica II Passionis seu in Palmis",
    "projection": {
      "simple": "SHOW",
      "follow": "SHOW",
      "live": "SHOW"
    },
    "notes": "Pre-Mass rite; red vestments. No ordinary MC event is consumed."
  },
  "PALM-BLS-020": {
    "id": "PALM-BLS-020",
    "phase": "BLESSING",
    "trigger_type": "RITE_STATE",
    "trigger_key": "AFTER_BLESSING_PRAYER",
    "actor_scope": "FAITHFUL",
    "posture_state": "STAND",
    "action_state": "Observe; no lay imitation of celebrant's ritual gestures",
    "object_state": null,
    "personal_state": null,
    "branch_condition": null,
    "evidence_status": "PRIMARY_RITE",
    "source_locator": "1962 Palm Sunday restored rite",
    "projection": {
      "simple": "SHOW",
      "follow": "SHOW",
      "live": "SHOW"
    },
    "notes": "Do not generate a generic holy-water Sign-of-Cross cue here."
  },
  "PALM-DST-010": {
    "id": "PALM-DST-010",
    "phase": "DISTRIBUTION",
    "trigger_type": "PERSONAL_STATE",
    "trigger_key": "RECIPIENT_CALLED",
    "actor_scope": "PALM_RECIPIENT",
    "posture_state": "STAND / WALK",
    "action_state": "Approach altar rail",
    "object_state": null,
    "personal_state": null,
    "branch_condition": null,
    "evidence_status": "HIGH_SECONDARY_ACTOR_STATE",
    "source_locator": "1962 Ordo — Palm Sunday ceremonial distribution",
    "projection": {
      "simple": "SHOW",
      "follow": "SHOW",
      "live": "SHOW"
    },
    "notes": "Personal recipient state."
  },
  "PALM-DST-020": {
    "id": "PALM-DST-020",
    "phase": "DISTRIBUTION",
    "trigger_type": "PERSONAL_STATE",
    "trigger_key": "RECEIVE_PALM",
    "actor_scope": "PALM_RECIPIENT",
    "posture_state": "KNEEL",
    "action_state": "Receive palm; ceremonial kisses only where the local/clerical form actually applies",
    "object_state": null,
    "personal_state": null,
    "branch_condition": null,
    "evidence_status": "CLOSED_HIGH_SECONDARY",
    "source_locator": "1962 Ordo — Palm Sunday distribution",
    "projection": {
      "simple": "SHOW",
      "follow": "SHOW",
      "live": "SHOW"
    },
    "notes": "Freeze kneeling reception; do not universalize hand-kissing where not applicable."
  },
  "PALM-DST-030": {
    "id": "PALM-DST-030",
    "phase": "DISTRIBUTION",
    "trigger_type": "EVENT_STATE",
    "trigger_key": "PALM_RECEIVED",
    "actor_scope": "PALM_RECIPIENT",
    "posture_state": "STAND / WALK",
    "action_state": "Return to place holding palm",
    "object_state": null,
    "personal_state": null,
    "branch_condition": null,
    "evidence_status": "DERIVED_ACTOR_STATE",
    "source_locator": "Recipient state transition",
    "projection": {
      "simple": "SHOW",
      "follow": "SHOW",
      "live": "SHOW"
    },
    "notes": "No global posture change."
  },
  "PALM-GSP-010": {
    "id": "PALM-GSP-010",
    "phase": "GOSPEL",
    "trigger_type": "TEXT_RUBRIC",
    "trigger_key": "TEXT:SEQUENTIA_SANCTI_EVANGELII",
    "actor_scope": "FAITHFUL",
    "posture_state": "STAND",
    "action_state": "Make three small Gospel crosses",
    "object_state": null,
    "personal_state": null,
    "branch_condition": null,
    "evidence_status": "FROZEN_GUIDANCE_REUSE",
    "source_locator": "Ordinary Gospel participation evidence + Palm proper",
    "projection": {
      "simple": "SHOW",
      "follow": "SHOW",
      "live": "SHOW"
    },
    "notes": "Reuse semantic Gospel-cross cue; not a new special gesture."
  },
  "PALM-GSP-020": {
    "id": "PALM-GSP-020",
    "phase": "GOSPEL",
    "trigger_type": "EVENT_STATE",
    "trigger_key": "PALM_GOSPEL_BODY",
    "actor_scope": "FAITHFUL",
    "posture_state": "STAND",
    "action_state": "Listen",
    "object_state": null,
    "personal_state": null,
    "branch_condition": null,
    "evidence_status": "PRIMARY_RITE",
    "source_locator": "Matthew 21:1–9 in 1962 Palm rite",
    "projection": {
      "simple": "SHOW",
      "follow": "SHOW",
      "live": "SHOW"
    },
    "notes": "Pre-procession Gospel."
  },
  "PALM-PRC-010": {
    "id": "PALM-PRC-010",
    "phase": "PROCESSION",
    "trigger_type": "TEXT_RUBRIC",
    "trigger_key": "TEXT:PROCEDAMUS_IN_PACE",
    "actor_scope": "FAITHFUL_PARTICIPATING",
    "posture_state": "PROCESSIONAL",
    "action_state": "Walk in procession carrying palm if participating",
    "object_state": null,
    "personal_state": null,
    "branch_condition": null,
    "evidence_status": "PRIMARY_RITE",
    "source_locator": "1962 Palm Sunday restored rite",
    "projection": {
      "simple": "SHOW",
      "follow": "SHOW",
      "live": "SHOW"
    },
    "notes": "Actor resolver: those not processing remain local/inherit."
  },
  "PALM-PRC-020": {
    "id": "PALM-PRC-020",
    "phase": "PROCESSION",
    "trigger_type": "RITE_STATE",
    "trigger_key": "PALM_PROCESSION_ACTIVE",
    "actor_scope": "FAITHFUL_PARTICIPATING",
    "posture_state": "PROCESSIONAL",
    "action_state": "Carry palm; join chant according to role",
    "object_state": null,
    "personal_state": null,
    "branch_condition": null,
    "evidence_status": "PRIMARY_RITE",
    "source_locator": "Gloria laus and appointed antiphons",
    "projection": {
      "simple": "SHOW",
      "follow": "SHOW",
      "live": "SHOW"
    },
    "notes": "No invented bow/genuflection cue."
  },
  "PALM-RET-010": {
    "id": "PALM-RET-010",
    "phase": "RETURN",
    "trigger_type": "RITE_STATE",
    "trigger_key": "INGREDIENTE_DOMINO / PROCESSION_RETURN",
    "actor_scope": "FAITHFUL_PARTICIPATING",
    "posture_state": "PROCESSIONAL / STAND",
    "action_state": "Follow procession to conclusion",
    "object_state": null,
    "personal_state": null,
    "branch_condition": null,
    "evidence_status": "PRIMARY_RITE",
    "source_locator": "1962 Palm Sunday restored rite",
    "projection": {
      "simple": "SHOW",
      "follow": "SHOW",
      "live": "SHOW"
    },
    "notes": "Transition into Mass."
  },
  "PALM-MASS-010": {
    "id": "PALM-MASS-010",
    "phase": "MASS_BRIDGE",
    "trigger_type": "MC_BOUNDARY",
    "trigger_key": "PALM_RITE_COMPLETE && MASS_FOLLOWS_IMMEDIATELY",
    "actor_scope": "ALL",
    "posture_state": "ORDINARY_PROFILE",
    "action_state": "Set mass.opening_mode=FOOT_CLUSTER_OMITTED; enter ordinary Mass at Introit",
    "object_state": null,
    "personal_state": null,
    "branch_condition": null,
    "evidence_status": "CONTROLLING_PRIMARY",
    "source_locator": "RG60 §424",
    "projection": {
      "simple": "SHOW",
      "follow": "SHOW",
      "live": "SHOW"
    },
    "notes": "Whole foot-of-altar cluster omitted only because the Palm rite immediately preceded Mass."
  },
  "PALM-MASS-020": {
    "id": "PALM-MASS-020",
    "phase": "MASS_BRIDGE",
    "trigger_type": "MC_BOUNDARY",
    "trigger_key": "MASS_END_RESOLVER",
    "actor_scope": "ALL",
    "posture_state": "ORDINARY_PROFILE",
    "action_state": "Last Gospel omitted in branch with palm procession",
    "object_state": null,
    "personal_state": null,
    "branch_condition": null,
    "evidence_status": "CONTROLLING_PRIMARY",
    "source_locator": "RG60 §510",
    "projection": {
      "simple": "SHOW",
      "follow": "SHOW",
      "live": "SHOW"
    },
    "notes": "If no palm rite preceded Mass, use the separate PROPER_PALM Last Gospel branch instead."
  },
  "ASH-BLS-010": {
    "id": "ASH-BLS-010",
    "phase": "BLESSING",
    "trigger_type": "RITE_STATE",
    "trigger_key": "ASH_RITE_START",
    "actor_scope": "FAITHFUL",
    "posture_state": "STAND",
    "action_state": "Attend antiphon and opening",
    "object_state": null,
    "personal_state": null,
    "branch_condition": null,
    "evidence_status": "PRIMARY_RITE",
    "source_locator": "Missale Romanum 1962 — Feria IV Cinerum",
    "projection": {
      "simple": "SHOW",
      "follow": "SHOW",
      "live": "SHOW"
    },
    "notes": "Pre-Mass rite."
  },
  "ASH-BLS-020": {
    "id": "ASH-BLS-020",
    "phase": "BLESSING",
    "trigger_type": "EVENT_STATE",
    "trigger_key": "ASH_FOUR_ORATIONS",
    "actor_scope": "FAITHFUL",
    "posture_state": "STAND",
    "action_state": "Stand and respond where applicable",
    "object_state": null,
    "personal_state": null,
    "branch_condition": null,
    "evidence_status": "PRIMARY_RITE",
    "source_locator": "1962 Ash Wednesday rite",
    "projection": {
      "simple": "SHOW",
      "follow": "SHOW",
      "live": "SHOW"
    },
    "notes": "Keep four orations as distinct text segments even if UI groups them."
  },
  "ASH-BLS-030": {
    "id": "ASH-BLS-030",
    "phase": "BLESSING",
    "trigger_type": "EVENT_STATE",
    "trigger_key": "ASHES_SPRINKLED_INCIENSED",
    "actor_scope": "FAITHFUL",
    "posture_state": "STAND",
    "action_state": "Observe; no faithful gesture inferred",
    "object_state": null,
    "personal_state": null,
    "branch_condition": null,
    "evidence_status": "PRIMARY_RITE",
    "source_locator": "1962 Ash Wednesday rite",
    "projection": {
      "simple": "SHOW",
      "follow": "SHOW",
      "live": "SHOW"
    },
    "notes": "Asperges me here is ritual action over ashes, not an Asperges branch for the congregation."
  },
  "ASH-DST-010": {
    "id": "ASH-DST-010",
    "phase": "DISTRIBUTION",
    "trigger_type": "PERSONAL_STATE",
    "trigger_key": "RECIPIENT_CALLED",
    "actor_scope": "ASH_RECIPIENT",
    "posture_state": "STAND / WALK",
    "action_state": "Approach altar rail",
    "object_state": null,
    "personal_state": null,
    "branch_condition": null,
    "evidence_status": "HIGH_SECONDARY_ACTOR_STATE",
    "source_locator": "1962 Ordo — Ash Wednesday",
    "projection": {
      "simple": "SHOW",
      "follow": "SHOW",
      "live": "SHOW"
    },
    "notes": "Personal recipient state."
  },
  "ASH-DST-020": {
    "id": "ASH-DST-020",
    "phase": "DISTRIBUTION",
    "trigger_type": "PERSONAL_STATE",
    "trigger_key": "RECEIVE_ASHES",
    "actor_scope": "ASH_RECIPIENT",
    "posture_state": "KNEEL",
    "action_state": "Kneel to receive ashes",
    "object_state": null,
    "personal_state": null,
    "branch_condition": null,
    "evidence_status": "CLOSED_HIGH_SECONDARY",
    "source_locator": "1962 Ordo — distribution of ashes",
    "projection": {
      "simple": "SHOW",
      "follow": "SHOW",
      "live": "SHOW"
    },
    "notes": "Anchor on reception state, not merely on Memento homo text."
  },
  "ASH-DST-030": {
    "id": "ASH-DST-030",
    "phase": "DISTRIBUTION",
    "trigger_type": "EVENT_STATE",
    "trigger_key": "ASHES_RECEIVED",
    "actor_scope": "ASH_RECIPIENT",
    "posture_state": "STAND / WALK",
    "action_state": "Rise and return",
    "object_state": null,
    "personal_state": null,
    "branch_condition": null,
    "evidence_status": "DERIVED_ACTOR_STATE",
    "source_locator": "Recipient state transition",
    "projection": {
      "simple": "SHOW",
      "follow": "SHOW",
      "live": "SHOW"
    },
    "notes": "No global posture change."
  },
  "ASH-END-010": {
    "id": "ASH-END-010",
    "phase": "CONCLUSION",
    "trigger_type": "TEXT_RUBRIC",
    "trigger_key": "TEXT:CONCEDE_NOBIS_DOMINE",
    "actor_scope": "FAITHFUL",
    "posture_state": "STAND",
    "action_state": "Stand and respond",
    "object_state": null,
    "personal_state": null,
    "branch_condition": null,
    "evidence_status": "PRIMARY_RITE",
    "source_locator": "1962 Ash Wednesday rite",
    "projection": {
      "simple": "SHOW",
      "follow": "SHOW",
      "live": "SHOW"
    },
    "notes": "Concluding pre-Mass prayer."
  },
  "ASH-MASS-010": {
    "id": "ASH-MASS-010",
    "phase": "MASS_BRIDGE",
    "trigger_type": "MC_BOUNDARY",
    "trigger_key": "ASH_RITE_COMPLETE && MASS_FOLLOWS_IMMEDIATELY",
    "actor_scope": "ALL",
    "posture_state": "ORDINARY_PROFILE",
    "action_state": "Set mass.opening_mode=FOOT_CLUSTER_OMITTED; enter at Introit",
    "object_state": null,
    "personal_state": null,
    "branch_condition": null,
    "evidence_status": "CONTROLLING_PRIMARY",
    "source_locator": "RG60 §424",
    "projection": {
      "simple": "SHOW",
      "follow": "SHOW",
      "live": "SHOW"
    },
    "notes": "If user attends Mass without preceding ash rite, ordinary opening remains FULL unless another rule applies."
  },
  "CND-BLS-010": {
    "id": "CND-BLS-010",
    "phase": "BLESSING",
    "trigger_type": "RITE_STATE",
    "trigger_key": "CANDLEMAS_RITE_START",
    "actor_scope": "FAITHFUL",
    "posture_state": "STAND",
    "action_state": "Attend blessing",
    "object_state": null,
    "personal_state": null,
    "branch_condition": null,
    "evidence_status": "PRIMARY_RITE",
    "source_locator": "Missale Romanum 1962 — Purificatio B.M.V.",
    "projection": {
      "simple": "SHOW",
      "follow": "SHOW",
      "live": "SHOW"
    },
    "notes": "Five blessing orations; French corpus remains a translation-source gap."
  },
  "CND-BLS-020": {
    "id": "CND-BLS-020",
    "phase": "BLESSING",
    "trigger_type": "EVENT_STATE",
    "trigger_key": "CANDLEMAS_FIVE_ORATIONS",
    "actor_scope": "FAITHFUL",
    "posture_state": "STAND",
    "action_state": "Stand and respond where applicable",
    "object_state": null,
    "personal_state": null,
    "branch_condition": null,
    "evidence_status": "PRIMARY_RITE",
    "source_locator": "1962 Candlemas rite",
    "projection": {
      "simple": "SHOW",
      "follow": "SHOW",
      "live": "SHOW"
    },
    "notes": "Latin/English structure can freeze independently of French translation completion."
  },
  "CND-DST-010": {
    "id": "CND-DST-010",
    "phase": "DISTRIBUTION",
    "trigger_type": "PERSONAL_STATE",
    "trigger_key": "RECIPIENT_CALLED",
    "actor_scope": "CANDLE_RECIPIENT",
    "posture_state": "STAND / WALK",
    "action_state": "Approach altar rail",
    "object_state": null,
    "personal_state": null,
    "branch_condition": null,
    "evidence_status": "HIGH_SECONDARY_ACTOR_STATE",
    "source_locator": "1962 Ordo — Candlemas",
    "projection": {
      "simple": "SHOW",
      "follow": "SHOW",
      "live": "SHOW"
    },
    "notes": "Personal recipient state."
  },
  "CND-DST-020": {
    "id": "CND-DST-020",
    "phase": "DISTRIBUTION",
    "trigger_type": "PERSONAL_STATE",
    "trigger_key": "RECEIVE_CANDLE",
    "actor_scope": "CANDLE_RECIPIENT",
    "posture_state": "KNEEL",
    "action_state": "Kneel to receive candle",
    "object_state": "BLESSED_CANDLE_RECEIVED",
    "personal_state": null,
    "branch_condition": null,
    "evidence_status": "CLOSED_HIGH_SECONDARY",
    "source_locator": "1962 Ordo — Candlemas distribution",
    "projection": {
      "simple": "SHOW",
      "follow": "SHOW",
      "live": "SHOW"
    },
    "notes": "Reception cue is separate from candle-light state."
  },
  "CND-DST-030": {
    "id": "CND-DST-030",
    "phase": "DISTRIBUTION",
    "trigger_type": "EVENT_STATE",
    "trigger_key": "CANDLE_RECEIVED",
    "actor_scope": "CANDLE_RECIPIENT",
    "posture_state": "STAND / WALK",
    "action_state": "Rise and return holding candle",
    "object_state": null,
    "personal_state": null,
    "branch_condition": null,
    "evidence_status": "DERIVED_ACTOR_STATE",
    "source_locator": "Recipient state transition",
    "projection": {
      "simple": "SHOW",
      "follow": "SHOW",
      "live": "SHOW"
    },
    "notes": "No global posture change."
  },
  "CND-PRC-010": {
    "id": "CND-PRC-010",
    "phase": "PROCESSION",
    "trigger_type": "TEXT_RUBRIC",
    "trigger_key": "TEXT:PROCEDAMUS_IN_PACE",
    "actor_scope": "FAITHFUL_WITH_CANDLE_PARTICIPATING",
    "posture_state": "PROCESSIONAL",
    "action_state": "Carry blessed candle lighted",
    "object_state": "CANDLE_LIT",
    "personal_state": null,
    "branch_condition": null,
    "evidence_status": "CLOSED_HIGH_SECONDARY",
    "source_locator": "1962 Ordo — Candle-use notes",
    "projection": {
      "simple": "SHOW",
      "follow": "SHOW",
      "live": "SHOW"
    },
    "notes": "Prop state: CANDLE_LIGHTED=true."
  },
  "CND-PRC-020": {
    "id": "CND-PRC-020",
    "phase": "PROCESSION",
    "trigger_type": "RITE_STATE",
    "trigger_key": "CANDLEMAS_PROCESSION_ACTIVE",
    "actor_scope": "FAITHFUL_WITH_CANDLE_PARTICIPATING",
    "posture_state": "PROCESSIONAL",
    "action_state": "Continue carrying lighted candle",
    "object_state": "CANDLE_LIT",
    "personal_state": null,
    "branch_condition": null,
    "evidence_status": "PRIMARY_RITE + HIGH_SECONDARY_PROP_STATE",
    "source_locator": "1962 Candlemas procession",
    "projection": {
      "simple": "SHOW",
      "follow": "SHOW",
      "live": "SHOW"
    },
    "notes": "No extra body gesture."
  },
  "CND-MASS-010": {
    "id": "CND-MASS-010",
    "phase": "MASS_BRIDGE",
    "trigger_type": "MC_BOUNDARY",
    "trigger_key": "CANDLE_RITE_COMPLETE && MASS_FOLLOWS_IMMEDIATELY",
    "actor_scope": "ALL",
    "posture_state": "ORDINARY_PROFILE",
    "action_state": "Set mass.opening_mode=FOOT_CLUSTER_OMITTED; enter at Introit",
    "object_state": null,
    "personal_state": null,
    "branch_condition": null,
    "evidence_status": "CONTROLLING_PRIMARY",
    "source_locator": "RG60 §424",
    "projection": {
      "simple": "SHOW",
      "follow": "SHOW",
      "live": "SHOW"
    },
    "notes": "Mass-only on 2 February does not trigger this omission."
  },
  "CND-MASS-020": {
    "id": "CND-MASS-020",
    "phase": "MASS_PROP_OVERLAY",
    "trigger_type": "MC_BOUNDARY",
    "trigger_key": "MC_GOSPEL_START && has_blessed_candle",
    "actor_scope": "FAITHFUL_WITH_BLESSED_CANDLE",
    "posture_state": "STAND",
    "action_state": "CANDLE_LIGHTED=true",
    "object_state": "CANDLE_LIT",
    "personal_state": null,
    "branch_condition": null,
    "evidence_status": "CLOSED_HIGH_SECONDARY",
    "source_locator": "1962 Ordo — Candle-use notes",
    "projection": {
      "simple": "SHOW",
      "follow": "SHOW",
      "live": "SHOW"
    },
    "notes": "Prop state only; posture remains ordinary Gospel posture."
  },
  "CND-MASS-030": {
    "id": "CND-MASS-030",
    "phase": "MASS_PROP_OVERLAY",
    "trigger_type": "MC_BOUNDARY",
    "trigger_key": "MC_SANCTUS_START && has_blessed_candle",
    "actor_scope": "FAITHFUL_WITH_BLESSED_CANDLE",
    "posture_state": "INHERIT_CANON_POSTURE",
    "action_state": "CANDLE_LIGHTED=true",
    "object_state": "CANDLE_LIT",
    "personal_state": null,
    "branch_condition": null,
    "evidence_status": "CLOSED_HIGH_SECONDARY",
    "source_locator": "1962 Ordo — Candle-use notes",
    "projection": {
      "simple": "SHOW",
      "follow": "SHOW",
      "live": "SHOW"
    },
    "notes": "Lighted from Sanctus through the interval ending at Pater."
  },
  "CND-MASS-040": {
    "id": "CND-MASS-040",
    "phase": "MASS_PROP_OVERLAY",
    "trigger_type": "MC_BOUNDARY",
    "trigger_key": "PATER_NOSTER_COMPLETE",
    "actor_scope": "FAITHFUL_WITH_BLESSED_CANDLE",
    "posture_state": "INHERIT",
    "action_state": "CANDLE_LIT_NOT_REQUIRED_AFTER_PATER",
    "object_state": "CANDLE_STATE_UNCONSTRAINED_AFTER_PATER",
    "personal_state": null,
    "branch_condition": null,
    "evidence_status": "CLOSED_HIGH_SECONDARY_OBJECT_STATE",
    "source_locator": "1962 Ordo — Candle-use notes",
    "projection": {
      "simple": "SHOW",
      "follow": "SHOW",
      "live": "SHOW"
    },
    "notes": "Candle remains lit through the Pater. After the Pater the source no longer requires the lit state; do not force a universal extinguishing instant."
  },
  "ASP-010": {
    "id": "ASP-010",
    "phase": "SUNDAY_ASPERGES",
    "trigger_type": "RITE_STATE",
    "trigger_key": "ASPERGES_RITE_START",
    "actor_scope": "ALL_FAITHFUL",
    "posture_state": "STAND",
    "action_state": "ATTEND_SUNDAY_SPRINKLING",
    "object_state": null,
    "personal_state": null,
    "branch_condition": null,
    "evidence_status": "PRIMARY_RITE_PLUS_1962_ERA_FAITHFUL_GUIDANCE",
    "source_locator": "MR62 Appendix II; O’Connell 1964 p.600",
    "projection": {
      "simple": "SHOW",
      "follow": "SHOW",
      "live": "SHOW"
    },
    "notes": "The celebrant/ministers kneel at the altar during their own preparation; do not propagate that minister posture to the faithful."
  },
  "ASP-020": {
    "id": "ASP-020",
    "phase": "SUNDAY_ASPERGES",
    "trigger_type": "ACTOR_STATE",
    "trigger_key": "CELEBRANT_KNEELS_AT_ALTAR",
    "actor_scope": "CELEBRANT_MINISTERS",
    "posture_state": "KNEEL",
    "action_state": "PREPARE_ASPERSORIUM",
    "object_state": null,
    "personal_state": null,
    "branch_condition": null,
    "evidence_status": "MR62_EXPLICIT",
    "source_locator": "MR62 Appendix II",
    "projection": {
      "simple": "SHOW",
      "follow": "SHOW",
      "live": "SHOW"
    },
    "notes": "Actor-scoped minister choreography only."
  },
  "ASP-030": {
    "id": "ASP-030",
    "phase": "SUNDAY_ASPERGES",
    "trigger_type": "RITE_STATE",
    "trigger_key": "ASPERGES_ME_OR_VIDI_AQUAM_BEGINS",
    "actor_scope": "ALL_FAITHFUL",
    "posture_state": "STAND",
    "action_state": "JOIN_CHANT_WHERE_SUNG",
    "object_state": null,
    "personal_state": null,
    "branch_condition": null,
    "evidence_status": "MR62_EXPLICIT",
    "source_locator": "MR62 Appendix II",
    "projection": {
      "simple": "SHOW",
      "follow": "SHOW",
      "live": "SHOW"
    },
    "notes": "Vidi aquam replaces Asperges me in Paschaltide; Palm/Passion Sunday Gloria Patri omission is formula logic, not a posture trigger."
  },
  "ASP-040": {
    "id": "ASP-040",
    "phase": "SUNDAY_ASPERGES",
    "trigger_type": "PERSONAL_STATE",
    "trigger_key": "ACTUALLY_SPRINKLED",
    "actor_scope": "FAITHFUL_RECIPIENT",
    "posture_state": "STAND",
    "action_state": "MAKE_FULL_SIGN_OF_CROSS",
    "object_state": null,
    "personal_state": null,
    "branch_condition": null,
    "evidence_status": "1962_ERA_FAITHFUL_GUIDANCE",
    "source_locator": "O’Connell 1964 p.600",
    "projection": {
      "simple": "SHOW",
      "follow": "SHOW",
      "live": "SHOW"
    },
    "notes": "Personal event trigger: never attach the sign of the cross to a chant word."
  },
  "ASP-050": {
    "id": "ASP-050",
    "phase": "SUNDAY_ASPERGES",
    "trigger_type": "RITE_STATE",
    "trigger_key": "CELEBRANT_RETURNS_FOR_VERSICLES",
    "actor_scope": "ALL_FAITHFUL",
    "posture_state": "STAND",
    "action_state": "MAKE_RESPONSES",
    "object_state": null,
    "personal_state": null,
    "branch_condition": null,
    "evidence_status": "MR62_EXPLICIT",
    "source_locator": "MR62 Appendix II",
    "projection": {
      "simple": "SHOW",
      "follow": "SHOW",
      "live": "SHOW"
    },
    "notes": "Ostende nobis / Domine exaudi / Dominus vobiscum / Exaudi nos."
  },
  "ASP-060": {
    "id": "ASP-060",
    "phase": "SUNDAY_ASPERGES",
    "trigger_type": "RITE_STATE",
    "trigger_key": "CONCLUDING_AMEN_COMPLETE",
    "actor_scope": "ALL",
    "posture_state": "INHERIT",
    "action_state": "HANDOFF_TO_ORDINARY_MASS",
    "object_state": null,
    "personal_state": null,
    "branch_condition": null,
    "evidence_status": "STRUCTURAL_CONTRACT",
    "source_locator": "MR62 Appendix II → Mass",
    "projection": {
      "simple": "SHOW",
      "follow": "SHOW",
      "live": "SHOW"
    },
    "notes": "Asperges precedes Mass and does not itself suppress the Prayers at the Foot."
  }
});

  const IDS = Object.freeze({
    ASP: Object.freeze(Object.keys(RECORDS).filter(id => id.startsWith('ASP-'))),
    PALM: Object.freeze(Object.keys(RECORDS).filter(id => id.startsWith('PALM-'))),
    ASH: Object.freeze(Object.keys(RECORDS).filter(id => id.startsWith('ASH-'))),
    CND: Object.freeze(Object.keys(RECORDS).filter(id => id.startsWith('CND-')))
  });

  const RITE_ALIASES = Object.freeze({
    ASPERGES: 'ASPERGES',
    ASPERGES_ME: 'ASPERGES',
    VIDI_AQUAM: 'ASPERGES',
    PALM: 'PALM',
    PALM_SUNDAY: 'PALM',
    ASH: 'ASH',
    ASH_WEDNESDAY: 'ASH',
    CANDLEMAS: 'CND',
    PURIFICATION: 'CND',
    CND: 'CND'
  });

  const norm = value =>
    String(value ?? '')
      .trim()
      .toUpperCase()
      .replace(/[\s-]+/g, '_');

  function explicitRite(ctx = {}) {
    const raw =
      ctx.actualPreMassRite ??
      ctx.preMassRite ??
      ctx.session?.preMassRite ??
      ctx.active?.resolvedMass?.preMassRite ??
      ctx.settings?.preMassRite ??
      ctx.state?.settings?.preMassRite ??
      null;

    const key = norm(raw?.type ?? raw?.id ?? raw);
    return RITE_ALIASES[key] || null;
  }

  function riteActuallyOccurred(ctx = {}) {
    return (
      ctx.preMassRiteActuallyOccurred === true ||
      ctx.session?.preMassRiteActuallyOccurred === true ||
      ctx.active?.resolvedMass?.preMassRiteActuallyOccurred === true ||
      ctx.settings?.preMassRiteActuallyOccurred === true ||
      ctx.state?.settings?.preMassRiteActuallyOccurred === true
    );
  }

  function massFollowsImmediately(ctx = {}) {
    const v =
      ctx.massFollowsImmediately ??
      ctx.session?.massFollowsImmediately ??
      ctx.active?.resolvedMass?.massFollowsImmediately ??
      ctx.settings?.massFollowsImmediately ??
      ctx.state?.settings?.massFollowsImmediately;
    return v !== false;
  }

  function personal(ctx = {}) {
    return {
      actuallySprinkled:
        ctx.personal?.actuallySprinkled === true ||
        ctx.actuallySprinkled === true,

      palmRecipient:
        ctx.personal?.palmRecipient === true ||
        ctx.palmRecipient === true,

      ashRecipient:
        ctx.personal?.ashRecipient === true ||
        ctx.ashRecipient === true,

      candleRecipient:
        ctx.personal?.candleRecipient === true ||
        ctx.candleRecipient === true,

      hasBlessedCandle:
        ctx.personal?.hasBlessedCandle === true ||
        ctx.hasBlessedCandle === true,

      participatingProcession:
        ctx.personal?.participatingProcession === true ||
        ctx.participatingProcession === true,

      activeTrigger:
        String(
          ctx.personal?.activeTrigger ??
          ctx.activePersonalTrigger ??
          ''
        ).trim()
    };
  }

  function event(id) {
    return RECORDS[id] || null;
  }

  function graph(kind) {
    const key = norm(kind);
    const canonical =
      key === 'ASPERGES' ? 'ASP' :
      key === 'CANDLEMAS' ? 'CND' :
      key;
    return (IDS[canonical] || []).map(event).filter(Boolean);
  }

  function isFaithfulVisible(e) {
    return !/^CELEBRANT_MINISTERS$/i.test(String(e?.actor_scope || ''));
  }

  function personalScopeAllowed(e, ctx = {}) {
    const p = personal(ctx);
    const scope = String(e?.actor_scope || '');
    const trigger = String(e?.trigger_key || '');

    if (scope === 'FAITHFUL_RECIPIENT')
      return p.actuallySprinkled && trigger === 'ACTUALLY_SPRINKLED';

    if (scope === 'PALM_RECIPIENT')
      return p.palmRecipient &&
        (!p.activeTrigger || p.activeTrigger === trigger);

    if (scope === 'ASH_RECIPIENT')
      return p.ashRecipient &&
        (!p.activeTrigger || p.activeTrigger === trigger);

    if (scope === 'CANDLE_RECIPIENT')
      return p.candleRecipient &&
        (!p.activeTrigger || p.activeTrigger === trigger);

    if (scope === 'FAITHFUL_WITH_CANDLE_PARTICIPATING')
      return p.hasBlessedCandle && p.participatingProcession;

    if (scope === 'FAITHFUL_WITH_BLESSED_CANDLE')
      return p.hasBlessedCandle;

    if (scope === 'FAITHFUL_PARTICIPATING')
      return p.participatingProcession;

    return true;
  }

  function projectRite(ctx = {}, {
    lane = 'faithful'
  } = {}) {
    const rite = explicitRite(ctx);

    /*
      Date/proper identity alone does not activate the graph.
    */
    if (!rite || !riteActuallyOccurred(ctx))
      return [];

    const source = graph(rite);

    return source.filter(e => {
      if (lane === 'faithful' && !isFaithfulVisible(e))
        return false;
      return personalScopeAllowed(e, ctx);
    });
  }

  function aspergesFormula(ctx = {}) {
    const paschaltide =
      ctx.paschaltide === true ||
      ctx.liturgicalSeason === 'PASCHALTIDE' ||
      ctx.state?.resolution?.day?.season === 'PASCHALTIDE';

    const palmOrPassionSunday =
      ctx.palmSunday === true ||
      ctx.passionSunday === true ||
      /PALM|PASSION/.test(norm(
        ctx.dayIdentity ??
        ctx.active?.resolvedMass?.dayIdentity ??
        ''
      ));

    return Object.freeze({
      chant: paschaltide ? 'VIDI_AQUAM' : 'ASPERGES_ME',
      gloriaPatri:
        paschaltide ? true :
        palmOrPassionSunday ? false :
        true,
      postureTrigger: null,
      personalSignOfCrossTrigger: 'ACTUALLY_SPRINKLED'
    });
  }

  function openingPolicy(ctx = {}) {
    const rite = explicitRite(ctx);
    const occurred =
      !!rite &&
      riteActuallyOccurred(ctx) &&
      massFollowsImmediately(ctx);

    if (!occurred) {
      return Object.freeze({
        openingMode: 'FULL',
        entry: 'ORDINARY_OPENING',
        source: 'NO_IMMEDIATE_SPECIAL_RITE'
      });
    }

    if (rite === 'PALM' || rite === 'ASH' || rite === 'CND') {
      return Object.freeze({
        openingMode: 'FOOT_CLUSTER_OMITTED',
        entry: 'INTROIT',
        source:
          rite === 'PALM' ? 'PALM-MASS-010' :
          rite === 'ASH' ? 'ASH-MASS-010' :
          'CND-MASS-010'
      });
    }

    /*
      ASP-060 explicitly hands to ordinary Mass without suppressing
      the Prayers at the Foot.
    */
    if (rite === 'ASPERGES') {
      return Object.freeze({
        openingMode: 'FULL',
        entry: 'ORDINARY_OPENING',
        source: 'ASP-060'
      });
    }

    return Object.freeze({
      openingMode: 'FULL',
      entry: 'ORDINARY_OPENING',
      source: 'INHERIT'
    });
  }

  function palmEndingPolicy(ctx = {}) {
    const palmRite =
      explicitRite(ctx) === 'PALM' &&
      riteActuallyOccurred(ctx);

    const palmProcessionOccurred =
      palmRite &&
      personal(ctx).participatingProcession !== false &&
      (
        ctx.palmProcessionOccurred === true ||
        ctx.session?.palmProcessionOccurred === true ||
        ctx.active?.resolvedMass?.palmProcessionOccurred === true
      );

    if (palmProcessionOccurred) {
      return Object.freeze({
        lastGospel: false,
        authority: 'PALM-MASS-020'
      });
    }

    /*
      A Palm-Sunday Mass without the preceding Palm rite is resolved
      by the separate Proper-Palm ending branch, not by PALM-MASS-020.
    */
    return Object.freeze({
      lastGospel: 'PROPER_PALM_RESOLVER',
      authority: 'NO_PALM_PROCESSION_BRANCH'
    });
  }

  function candleState(boundary, ctx = {}) {
    const p = personal(ctx);
    if (!p.hasBlessedCandle)
      return Object.freeze({ active: false });

    const b = norm(boundary);

    if (b === 'GOSPEL_START') {
      return Object.freeze({
        active: true,
        lit: true,
        eventId: 'CND-MASS-020',
        postureOverride: false
      });
    }

    if (b === 'SANCTUS_START' || b === 'CANON' || b === 'PATER') {
      return Object.freeze({
        active: true,
        lit: true,
        eventId: 'CND-MASS-030',
        postureOverride: false
      });
    }

    if (b === 'PATER_NOSTER_COMPLETE' || b === 'AFTER_PATER') {
      return Object.freeze({
        active: true,
        lit: null,
        constrained: false,
        eventId: 'CND-MASS-040',
        postureOverride: false
      });
    }

    return Object.freeze({
      active: true,
      lit: null,
      constrained: false
    });
  }

  function personalCue(eventId, ctx = {}) {
    const e = event(eventId);
    if (!e || e.trigger_type !== 'PERSONAL_STATE')
      return null;

    if (!personalScopeAllowed(e, ctx))
      return null;

    return Object.freeze({
      eventId: e.id,
      trigger: e.trigger_key,
      posture: e.posture_state,
      action: e.action_state,
      object: e.object_state,
      actorScope: e.actor_scope
    });
  }

  function audit() {
    const all = Object.values(RECORDS);
    const ids = all.map(e => e.id);
    const unique = new Set(ids);

    const checks = {
      asp6: IDS.ASP.length === 6,
      palm12: IDS.PALM.length === 12,
      ash8: IDS.ASH.length === 8,
      cnd11: IDS.CND.length === 11,
      unique37: ids.length === 37 && unique.size === 37,

      aspergesPersonal:
        event('ASP-040')?.trigger_type === 'PERSONAL_STATE' &&
        event('ASP-040')?.trigger_key === 'ACTUALLY_SPRINKLED',

      ministerKneelIsScoped:
        event('ASP-020')?.actor_scope === 'CELEBRANT_MINISTERS' &&
        event('ASP-010')?.posture_state === 'STAND',

      palmReceptionPersonal:
        ['PALM-DST-010','PALM-DST-020','PALM-DST-030']
          .every(id => event(id)?.actor_scope === 'PALM_RECIPIENT'),

      ashReceptionPersonal:
        ['ASH-DST-010','ASH-DST-020','ASH-DST-030']
          .every(id => event(id)?.actor_scope === 'ASH_RECIPIENT'),

      candleReceptionPersonal:
        ['CND-DST-010','CND-DST-020','CND-DST-030']
          .every(id => event(id)?.actor_scope === 'CANDLE_RECIPIENT'),

      ashSprinklingNotAsperges:
        /not an Asperges branch/i.test(event('ASH-BLS-030')?.notes || ''),

      palmNoGenericCross:
        /Do not generate a generic holy-water Sign-of-Cross/i
          .test(event('PALM-BLS-020')?.notes || ''),

      palmImmediateBridge:
        /FOOT_CLUSTER_OMITTED/.test(event('PALM-MASS-010')?.action_state || ''),

      ashImmediateBridge:
        /FOOT_CLUSTER_OMITTED/.test(event('ASH-MASS-010')?.action_state || ''),

      candleImmediateBridge:
        /FOOT_CLUSTER_OMITTED/.test(event('CND-MASS-010')?.action_state || ''),

      aspergesDoesNotSuppressFoot:
        /does not itself suppress the Prayers at the Foot/i
          .test(event('ASP-060')?.notes || ''),

      candleGospel:
        event('CND-MASS-020')?.object_state === 'CANDLE_LIT',

      candleSanctusThroughPater:
        event('CND-MASS-030')?.object_state === 'CANDLE_LIT',

      candleAfterPaterUnconstrained:
        event('CND-MASS-040')?.object_state ===
          'CANDLE_STATE_UNCONSTRAINED_AFTER_PATER'
    };

    return Object.freeze({
      version: 'R10',
      counts: {
        ASP: IDS.ASP.length,
        PALM: IDS.PALM.length,
        ASH: IDS.ASH.length,
        CND: IDS.CND.length,
        total: ids.length
      },
      checks,
      pass: Object.values(checks).every(Boolean)
    });
  }

  AO.SpecialPreMassR10 = Object.freeze({
    version: 'R10',
    authority: 'v43.73/v43.74_SPECIAL_DAYS_CLOSURE',
    records: RECORDS,
    ids: IDS,
    event,
    graph,
    explicitRite,
    riteActuallyOccurred,
    projectRite,
    personalCue,
    aspergesFormula,
    openingPolicy,
    palmEndingPolicy,
    candleState,
    audit
  });
})();

/* ========================================================================
   AD ORIENTEM — R11 TRIDUUM BOUNDARY PATCH
   Sources:
   - Special Days Runtime v1.1 (GF 56, EV 38, EV Mass overlay, Mandatum)
   - v43.74 event registry (Holy Thursday post-Mass HT 6)

   Architectural contracts:
   1. Holy Thursday remains a Mass profile plus explicit optional inserts /
      following actions. Date alone does not assert Mandatum, reposition,
      joining procession, or stripping.
   2. Good Friday is a DISTINCT RITE. It MUST NOT be passed through the
      ordinary Mass engine, Mass bells, Ordinary response assembler, or
      MC-form profile resolver.
   3. Easter Vigil is a COMPOSITE DISTINCT RITE. Its pre-Mass graph is EV-*;
      only EV-MASS-700 may hand into MC, at MC-0012 (Kyrie), under the
      dedicated Easter Vigil Mass overlay.
======================================================================== */
(() => {
  'use strict';

  const AO = globalThis.AO = globalThis.AO || {};

  const SOURCE = Object.freeze({
  "HT": [
    {
      "id": "HT-TRN-010",
      "phase": "TRANSLATION",
      "trigger_type": "EVENT_STATE",
      "trigger_key": "SSMM_PASSES_PEWS",
      "actor_scope": "FAITHFUL",
      "posture_state": "KNEEL",
      "action_state": "Kneel",
      "object_state": null,
      "personal_state": null,
      "branch_condition": null,
      "evidence_status": "HIGH_SECONDARY_DIRECT_GUIDANCE",
      "source_locator": "O'Connell via ACSS HT pp.7,14",
      "projection": {
        "simple": "SHOW",
        "follow": "SHOW",
        "live": "SHOW"
      },
      "notes": "If joining, stand after It passes."
    },
    {
      "id": "HT-TRN-020",
      "phase": "TRANSLATION",
      "trigger_type": "PERSONAL_STATE",
      "trigger_key": "SSMM_HAS_PASSED && joining",
      "actor_scope": "FAITHFUL_JOINING",
      "posture_state": "STAND / WALK",
      "action_state": "Follow behind",
      "object_state": null,
      "personal_state": null,
      "branch_condition": null,
      "evidence_status": "HIGH_SECONDARY_DIRECT_GUIDANCE",
      "source_locator": "ACSS HT p.14",
      "projection": {
        "simple": "SHOW",
        "follow": "SHOW",
        "live": "SHOW"
      },
      "notes": "No extra altar reverence."
    },
    {
      "id": "HT-TRN-030",
      "phase": "TRANSLATION",
      "trigger_type": "EVENT_STATE",
      "trigger_key": "ARRIVE_ALTAR_OF_REPOSE",
      "actor_scope": "FAITHFUL",
      "posture_state": "KNEEL",
      "action_state": "Kneel in place",
      "object_state": null,
      "personal_state": null,
      "branch_condition": null,
      "evidence_status": "HIGH_SECONDARY_DIRECT_GUIDANCE",
      "source_locator": "ACSS HT pp.7,14",
      "projection": {
        "simple": "SHOW",
        "follow": "SHOW",
        "live": "SHOW"
      },
      "notes": "Adoration state."
    },
    {
      "id": "HT-TRN-040",
      "phase": "TRANSLATION",
      "trigger_type": "RITE_STATE",
      "trigger_key": "SSMM_RESERVED && SILENT_ADORATION_COMPLETE",
      "actor_scope": "FAITHFUL_JOINING",
      "posture_state": "STAND→DOUBLE_KNEE_GENUFLECTION→STAND",
      "action_state": "Stand; double-knee genuflection; return",
      "object_state": null,
      "personal_state": null,
      "branch_condition": null,
      "evidence_status": "HIGH_SECONDARY_DIRECT_GUIDANCE",
      "source_locator": "ACSS HT pp.7,14",
      "projection": {
        "simple": "SHOW",
        "follow": "SHOW",
        "live": "SHOW"
      },
      "notes": "Specific to those who followed."
    },
    {
      "id": "HT-STRIP-010",
      "phase": "STRIPPING_OF_ALTARS",
      "trigger_type": "RITE_STATE",
      "trigger_key": "STRIPPING_OF_ALTARS_BEGINS",
      "actor_scope": "ALL_FAITHFUL",
      "posture_state": "LOCAL_OR_INHERIT",
      "action_state": "OBSERVE_AND_PRAY",
      "object_state": null,
      "personal_state": null,
      "branch_condition": "AFTER_REPOSITION",
      "evidence_status": "PRIMARY_RITE_NO_UNIVERSAL_FAITHFUL_POSTURE",
      "source_locator": "Missale Romanum 1962 — Holy Thursday post-Mass stripping of altars / Psalm 21",
      "projection": {
        "simple": "SHOW",
        "follow": "SHOW",
        "live": "SHOW"
      },
      "notes": "First-class post-Mass state. Do not import older donor KNEEL/STAND as a universal faithful posture."
    },
    {
      "id": "HT-POST-900",
      "phase": "HOLY_THURSDAY_POST_MASS",
      "trigger_type": "RITE_STATE",
      "trigger_key": "STRIPPING_COMPLETE",
      "actor_scope": "ALL",
      "posture_state": "LOCAL_OR_INHERIT",
      "action_state": "EXIT_SPECIAL_GRAPH_TO_LIFECYCLE",
      "object_state": null,
      "personal_state": null,
      "branch_condition": null,
      "evidence_status": "STRUCTURAL_CONTRACT",
      "source_locator": "Holy Thursday post-Mass graph boundary",
      "projection": {
        "simple": "SHOW",
        "follow": "SHOW",
        "live": "SHOW"
      },
      "notes": "Post-Mass rite exits to lifecycle, never back into MC-*."
    }
  ],
  "GF": [
    {
      "id": "GF-OPEN-010",
      "phase": "OPENING",
      "trigger_type": "RITE_STATE",
      "trigger_key": "GOOD_FRIDAY_BEGINS",
      "actor_scope": "ALL_FAITHFUL",
      "posture_state": "STAND",
      "action_state": null,
      "object_state": null,
      "personal_state": null,
      "branch_condition": null,
      "evidence_status": "MANUAL_LOCKED",
      "source_locator": "1962-era Good Friday ceremonial manual",
      "projection": {
        "simple": "SHOW",
        "follow": "SHOW",
        "live": "SHOW"
      },
      "notes": ""
    },
    {
      "id": "GF-OPEN-020",
      "phase": "OPENING",
      "trigger_type": "MINISTER_POSITION",
      "trigger_key": "MINISTERS_AT_ALTAR_PROSTRATE",
      "actor_scope": "ALL_FAITHFUL",
      "posture_state": "KNEEL_PROFOUND_BOW",
      "action_state": null,
      "object_state": null,
      "personal_state": null,
      "branch_condition": null,
      "evidence_status": "MR62_EXPLICIT",
      "source_locator": "MR62 Good Friday opening prostration",
      "projection": {
        "simple": "SHOW",
        "follow": "SHOW",
        "live": "SHOW"
      },
      "notes": ""
    },
    {
      "id": "GF-OPEN-030",
      "phase": "OPENING",
      "trigger_type": "MINISTER_ACTION",
      "trigger_key": "MINISTERS_RISE_FROM_PROSTRATION",
      "actor_scope": "ALL_FAITHFUL",
      "posture_state": "KNEEL_UPRIGHT",
      "action_state": null,
      "object_state": null,
      "personal_state": null,
      "branch_condition": null,
      "evidence_status": "MR62_EXPLICIT",
      "source_locator": "MR62 Good Friday opening prostration",
      "projection": {
        "simple": "SHOW",
        "follow": "SHOW",
        "live": "SHOW"
      },
      "notes": ""
    },
    {
      "id": "GF-OPEN-040",
      "phase": "OPENING",
      "trigger_type": "PRAYER_COMPLETE",
      "trigger_key": "OPENING_COLLECT_COMPLETE",
      "actor_scope": "ALL_FAITHFUL",
      "posture_state": "STAND",
      "action_state": null,
      "object_state": null,
      "personal_state": null,
      "branch_condition": null,
      "evidence_status": "MANUAL_LOCKED",
      "source_locator": "1962-era Good Friday ceremonial manual",
      "projection": {
        "simple": "SHOW",
        "follow": "SHOW",
        "live": "SHOW"
      },
      "notes": ""
    },
    {
      "id": "GF-LESS-110",
      "phase": "LESSONS",
      "trigger_type": "SECTION_START",
      "trigger_key": "FIRST_LESSON",
      "actor_scope": "ALL_FAITHFUL",
      "posture_state": "SIT",
      "action_state": null,
      "object_state": null,
      "personal_state": null,
      "branch_condition": null,
      "evidence_status": "MR62_EXPLICIT",
      "source_locator": "MR62 Good Friday first lesson",
      "projection": {
        "simple": "SHOW",
        "follow": "SHOW",
        "live": "SHOW"
      },
      "notes": ""
    },
    {
      "id": "GF-LESS-120",
      "phase": "LESSONS",
      "trigger_type": "LITURGICAL_FORMULA",
      "trigger_key": "OREMUS_AFTER_FIRST_LESSON",
      "actor_scope": "ALL_FAITHFUL",
      "posture_state": "STAND",
      "action_state": null,
      "object_state": null,
      "personal_state": null,
      "branch_condition": null,
      "evidence_status": "MR62_EXPLICIT",
      "source_locator": "MR62 Good Friday lesson/oration rubric",
      "projection": {
        "simple": "SHOW",
        "follow": "SHOW",
        "live": "SHOW"
      },
      "notes": ""
    },
    {
      "id": "GF-LESS-130",
      "phase": "LESSONS",
      "trigger_type": "LITURGICAL_FORMULA",
      "trigger_key": "FLECTAMUS_GENUA_AFTER_FIRST_LESSON",
      "actor_scope": "ALL_FAITHFUL",
      "posture_state": "KNEEL",
      "action_state": "SILENT_PRAYER",
      "object_state": null,
      "personal_state": null,
      "branch_condition": null,
      "evidence_status": "MR62_EXPLICIT",
      "source_locator": "MR62/RG60 Flectamus genua rubric",
      "projection": {
        "simple": "SHOW",
        "follow": "SHOW",
        "live": "SHOW"
      },
      "notes": ""
    },
    {
      "id": "GF-LESS-140",
      "phase": "LESSONS",
      "trigger_type": "LITURGICAL_FORMULA",
      "trigger_key": "LEVATE_AFTER_FIRST_LESSON",
      "actor_scope": "ALL_FAITHFUL",
      "posture_state": "STAND",
      "action_state": null,
      "object_state": null,
      "personal_state": null,
      "branch_condition": null,
      "evidence_status": "MR62_EXPLICIT",
      "source_locator": "MR62/RG60 Levate rubric",
      "projection": {
        "simple": "SHOW",
        "follow": "SHOW",
        "live": "SHOW"
      },
      "notes": ""
    },
    {
      "id": "GF-LESS-210",
      "phase": "LESSONS",
      "trigger_type": "SECTION_START",
      "trigger_key": "SECOND_LESSON",
      "actor_scope": "ALL_FAITHFUL",
      "posture_state": "SIT",
      "action_state": null,
      "object_state": null,
      "personal_state": null,
      "branch_condition": null,
      "evidence_status": "MR62_EXPLICIT",
      "source_locator": "MR62 Good Friday second lesson",
      "projection": {
        "simple": "SHOW",
        "follow": "SHOW",
        "live": "SHOW"
      },
      "notes": ""
    },
    {
      "id": "GF-PASS-310",
      "phase": "PASSION",
      "trigger_type": "SECTION_START",
      "trigger_key": "PASSION_PROCLAMATION",
      "actor_scope": "ALL_FAITHFUL",
      "posture_state": "STAND",
      "action_state": null,
      "object_state": null,
      "personal_state": null,
      "branch_condition": null,
      "evidence_status": "MANUAL_LOCKED",
      "source_locator": "1962-era Good Friday ceremonial manual",
      "projection": {
        "simple": "SHOW",
        "follow": "SHOW",
        "live": "SHOW"
      },
      "notes": ""
    },
    {
      "id": "GF-PASS-320",
      "phase": "PASSION",
      "trigger_type": "TEXT_RUBRIC",
      "trigger_key": "TRADIDIT_SPIRITUM_COMPLETED",
      "actor_scope": "ALL_FAITHFUL",
      "posture_state": "KNEEL",
      "action_state": "PAUSE_BRIEFLY",
      "object_state": null,
      "personal_state": null,
      "branch_condition": null,
      "evidence_status": "MR62_EXPLICIT",
      "source_locator": "MR62 Passion rubric at tradidit spiritum",
      "projection": {
        "simple": "SHOW",
        "follow": "SHOW",
        "live": "SHOW"
      },
      "notes": "Text trigger is legitimate because the rubric itself attaches the kneeling pause to this text."
    },
    {
      "id": "GF-PASS-330",
      "phase": "PASSION",
      "trigger_type": "RITE_STATE",
      "trigger_key": "PASSION_NARRATIVE_RESUMES",
      "actor_scope": "ALL_FAITHFUL",
      "posture_state": "STAND",
      "action_state": null,
      "object_state": null,
      "personal_state": null,
      "branch_condition": null,
      "evidence_status": "DERIVED_STATE_TRANSITION",
      "source_locator": "Derived restoration of pre-pause Passion posture",
      "projection": {
        "simple": "SHOW",
        "follow": "SHOW",
        "live": "SHOW"
      },
      "notes": ""
    },
    {
      "id": "GF-SOP-400",
      "phase": "SOLEMN_PRAYERS",
      "trigger_type": "SECTION_TRANSITION",
      "trigger_key": "PASSION_CONCLUDED_PRAYERS_PREPARE",
      "actor_scope": "ALL_FAITHFUL",
      "posture_state": "SIT",
      "action_state": null,
      "object_state": null,
      "personal_state": null,
      "branch_condition": null,
      "evidence_status": "MANUAL_LOCKED",
      "source_locator": "1962-era Good Friday ceremonial manual",
      "projection": {
        "simple": "SHOW",
        "follow": "SHOW",
        "live": "SHOW"
      },
      "notes": ""
    },
    {
      "id": "GF-SOP-410",
      "phase": "SOLEMN_PRAYERS",
      "trigger_type": "SECTION_START",
      "trigger_key": "SOLEMN_PRAYERS_BEGIN",
      "actor_scope": "ALL_FAITHFUL",
      "posture_state": "STAND",
      "action_state": null,
      "object_state": null,
      "personal_state": null,
      "branch_condition": null,
      "evidence_status": "MANUAL_LOCKED",
      "source_locator": "1962-era Good Friday ceremonial manual",
      "projection": {
        "simple": "SHOW",
        "follow": "SHOW",
        "live": "SHOW"
      },
      "notes": ""
    },
    {
      "id": "GF-SOP-01-K",
      "phase": "SOLEMN_PRAYERS",
      "trigger_type": "LITURGICAL_FORMULA",
      "trigger_key": "HOLY_CHURCH:FLECTAMUS_GENUA",
      "actor_scope": "ALL_FAITHFUL",
      "posture_state": "KNEEL",
      "action_state": "SILENT_PRAYER",
      "object_state": null,
      "personal_state": null,
      "branch_condition": null,
      "evidence_status": "MR62_EXPLICIT",
      "source_locator": "MR62 Good Friday Solemn Prayers",
      "projection": {
        "simple": "GROUP:SOLEMN_PRAYERS",
        "follow": "SHOW",
        "live": "SHOW"
      },
      "notes": ""
    },
    {
      "id": "GF-SOP-01-R",
      "phase": "SOLEMN_PRAYERS",
      "trigger_type": "LITURGICAL_FORMULA",
      "trigger_key": "HOLY_CHURCH:LEVATE",
      "actor_scope": "ALL_FAITHFUL",
      "posture_state": "STAND",
      "action_state": null,
      "object_state": null,
      "personal_state": null,
      "branch_condition": null,
      "evidence_status": "MR62_EXPLICIT",
      "source_locator": "MR62 Good Friday Solemn Prayers",
      "projection": {
        "simple": "GROUP:SOLEMN_PRAYERS",
        "follow": "SHOW",
        "live": "SHOW"
      },
      "notes": ""
    },
    {
      "id": "GF-SOP-02-K",
      "phase": "SOLEMN_PRAYERS",
      "trigger_type": "LITURGICAL_FORMULA",
      "trigger_key": "SUPREME_PONTIFF:FLECTAMUS_GENUA",
      "actor_scope": "ALL_FAITHFUL",
      "posture_state": "KNEEL",
      "action_state": "SILENT_PRAYER",
      "object_state": null,
      "personal_state": null,
      "branch_condition": null,
      "evidence_status": "MR62_EXPLICIT",
      "source_locator": "MR62 Good Friday Solemn Prayers",
      "projection": {
        "simple": "GROUP:SOLEMN_PRAYERS",
        "follow": "SHOW",
        "live": "SHOW"
      },
      "notes": ""
    },
    {
      "id": "GF-SOP-02-R",
      "phase": "SOLEMN_PRAYERS",
      "trigger_type": "LITURGICAL_FORMULA",
      "trigger_key": "SUPREME_PONTIFF:LEVATE",
      "actor_scope": "ALL_FAITHFUL",
      "posture_state": "STAND",
      "action_state": null,
      "object_state": null,
      "personal_state": null,
      "branch_condition": null,
      "evidence_status": "MR62_EXPLICIT",
      "source_locator": "MR62 Good Friday Solemn Prayers",
      "projection": {
        "simple": "GROUP:SOLEMN_PRAYERS",
        "follow": "SHOW",
        "live": "SHOW"
      },
      "notes": ""
    },
    {
      "id": "GF-SOP-03-K",
      "phase": "SOLEMN_PRAYERS",
      "trigger_type": "LITURGICAL_FORMULA",
      "trigger_key": "ALL_ORDERS_AND_DEGREES:FLECTAMUS_GENUA",
      "actor_scope": "ALL_FAITHFUL",
      "posture_state": "KNEEL",
      "action_state": "SILENT_PRAYER",
      "object_state": null,
      "personal_state": null,
      "branch_condition": null,
      "evidence_status": "MR62_EXPLICIT",
      "source_locator": "MR62 Good Friday Solemn Prayers",
      "projection": {
        "simple": "GROUP:SOLEMN_PRAYERS",
        "follow": "SHOW",
        "live": "SHOW"
      },
      "notes": ""
    },
    {
      "id": "GF-SOP-03-R",
      "phase": "SOLEMN_PRAYERS",
      "trigger_type": "LITURGICAL_FORMULA",
      "trigger_key": "ALL_ORDERS_AND_DEGREES:LEVATE",
      "actor_scope": "ALL_FAITHFUL",
      "posture_state": "STAND",
      "action_state": null,
      "object_state": null,
      "personal_state": null,
      "branch_condition": null,
      "evidence_status": "MR62_EXPLICIT",
      "source_locator": "MR62 Good Friday Solemn Prayers",
      "projection": {
        "simple": "GROUP:SOLEMN_PRAYERS",
        "follow": "SHOW",
        "live": "SHOW"
      },
      "notes": ""
    },
    {
      "id": "GF-SOP-04-K",
      "phase": "SOLEMN_PRAYERS",
      "trigger_type": "LITURGICAL_FORMULA",
      "trigger_key": "PUBLIC_OFFICIALS:FLECTAMUS_GENUA",
      "actor_scope": "ALL_FAITHFUL",
      "posture_state": "KNEEL",
      "action_state": "SILENT_PRAYER",
      "object_state": null,
      "personal_state": null,
      "branch_condition": null,
      "evidence_status": "MR62_EXPLICIT",
      "source_locator": "MR62 Good Friday Solemn Prayers",
      "projection": {
        "simple": "GROUP:SOLEMN_PRAYERS",
        "follow": "SHOW",
        "live": "SHOW"
      },
      "notes": ""
    },
    {
      "id": "GF-SOP-04-R",
      "phase": "SOLEMN_PRAYERS",
      "trigger_type": "LITURGICAL_FORMULA",
      "trigger_key": "PUBLIC_OFFICIALS:LEVATE",
      "actor_scope": "ALL_FAITHFUL",
      "posture_state": "STAND",
      "action_state": null,
      "object_state": null,
      "personal_state": null,
      "branch_condition": null,
      "evidence_status": "MR62_EXPLICIT",
      "source_locator": "MR62 Good Friday Solemn Prayers",
      "projection": {
        "simple": "GROUP:SOLEMN_PRAYERS",
        "follow": "SHOW",
        "live": "SHOW"
      },
      "notes": ""
    },
    {
      "id": "GF-SOP-05-K",
      "phase": "SOLEMN_PRAYERS",
      "trigger_type": "LITURGICAL_FORMULA",
      "trigger_key": "CATECHUMENS:FLECTAMUS_GENUA",
      "actor_scope": "ALL_FAITHFUL",
      "posture_state": "KNEEL",
      "action_state": "SILENT_PRAYER",
      "object_state": null,
      "personal_state": null,
      "branch_condition": null,
      "evidence_status": "MR62_EXPLICIT",
      "source_locator": "MR62 Good Friday Solemn Prayers",
      "projection": {
        "simple": "GROUP:SOLEMN_PRAYERS",
        "follow": "SHOW",
        "live": "SHOW"
      },
      "notes": ""
    },
    {
      "id": "GF-SOP-05-R",
      "phase": "SOLEMN_PRAYERS",
      "trigger_type": "LITURGICAL_FORMULA",
      "trigger_key": "CATECHUMENS:LEVATE",
      "actor_scope": "ALL_FAITHFUL",
      "posture_state": "STAND",
      "action_state": null,
      "object_state": null,
      "personal_state": null,
      "branch_condition": null,
      "evidence_status": "MR62_EXPLICIT",
      "source_locator": "MR62 Good Friday Solemn Prayers",
      "projection": {
        "simple": "GROUP:SOLEMN_PRAYERS",
        "follow": "SHOW",
        "live": "SHOW"
      },
      "notes": ""
    },
    {
      "id": "GF-SOP-06-K",
      "phase": "SOLEMN_PRAYERS",
      "trigger_type": "LITURGICAL_FORMULA",
      "trigger_key": "NEEDS_OF_FAITHFUL:FLECTAMUS_GENUA",
      "actor_scope": "ALL_FAITHFUL",
      "posture_state": "KNEEL",
      "action_state": "SILENT_PRAYER",
      "object_state": null,
      "personal_state": null,
      "branch_condition": null,
      "evidence_status": "MR62_EXPLICIT",
      "source_locator": "MR62 Good Friday Solemn Prayers",
      "projection": {
        "simple": "GROUP:SOLEMN_PRAYERS",
        "follow": "SHOW",
        "live": "SHOW"
      },
      "notes": ""
    },
    {
      "id": "GF-SOP-06-R",
      "phase": "SOLEMN_PRAYERS",
      "trigger_type": "LITURGICAL_FORMULA",
      "trigger_key": "NEEDS_OF_FAITHFUL:LEVATE",
      "actor_scope": "ALL_FAITHFUL",
      "posture_state": "STAND",
      "action_state": null,
      "object_state": null,
      "personal_state": null,
      "branch_condition": null,
      "evidence_status": "MR62_EXPLICIT",
      "source_locator": "MR62 Good Friday Solemn Prayers",
      "projection": {
        "simple": "GROUP:SOLEMN_PRAYERS",
        "follow": "SHOW",
        "live": "SHOW"
      },
      "notes": ""
    },
    {
      "id": "GF-SOP-07-K",
      "phase": "SOLEMN_PRAYERS",
      "trigger_type": "LITURGICAL_FORMULA",
      "trigger_key": "HERETICS_AND_SCHISMATICS:FLECTAMUS_GENUA",
      "actor_scope": "ALL_FAITHFUL",
      "posture_state": "KNEEL",
      "action_state": "SILENT_PRAYER",
      "object_state": null,
      "personal_state": null,
      "branch_condition": null,
      "evidence_status": "MR62_EXPLICIT",
      "source_locator": "MR62 Good Friday Solemn Prayers",
      "projection": {
        "simple": "GROUP:SOLEMN_PRAYERS",
        "follow": "SHOW",
        "live": "SHOW"
      },
      "notes": ""
    },
    {
      "id": "GF-SOP-07-R",
      "phase": "SOLEMN_PRAYERS",
      "trigger_type": "LITURGICAL_FORMULA",
      "trigger_key": "HERETICS_AND_SCHISMATICS:LEVATE",
      "actor_scope": "ALL_FAITHFUL",
      "posture_state": "STAND",
      "action_state": null,
      "object_state": null,
      "personal_state": null,
      "branch_condition": null,
      "evidence_status": "MR62_EXPLICIT",
      "source_locator": "MR62 Good Friday Solemn Prayers",
      "projection": {
        "simple": "GROUP:SOLEMN_PRAYERS",
        "follow": "SHOW",
        "live": "SHOW"
      },
      "notes": ""
    },
    {
      "id": "GF-SOP-08-K",
      "phase": "SOLEMN_PRAYERS",
      "trigger_type": "LITURGICAL_FORMULA",
      "trigger_key": "CONVERSION_OF_JEWS:FLECTAMUS_GENUA",
      "actor_scope": "ALL_FAITHFUL",
      "posture_state": "KNEEL",
      "action_state": "SILENT_PRAYER",
      "object_state": null,
      "personal_state": null,
      "branch_condition": null,
      "evidence_status": "MR62_EXPLICIT",
      "source_locator": "MR62 Good Friday Solemn Prayers",
      "projection": {
        "simple": "GROUP:SOLEMN_PRAYERS",
        "follow": "SHOW",
        "live": "SHOW"
      },
      "notes": ""
    },
    {
      "id": "GF-SOP-08-R",
      "phase": "SOLEMN_PRAYERS",
      "trigger_type": "LITURGICAL_FORMULA",
      "trigger_key": "CONVERSION_OF_JEWS:LEVATE",
      "actor_scope": "ALL_FAITHFUL",
      "posture_state": "STAND",
      "action_state": null,
      "object_state": null,
      "personal_state": null,
      "branch_condition": null,
      "evidence_status": "MR62_EXPLICIT",
      "source_locator": "MR62 Good Friday Solemn Prayers",
      "projection": {
        "simple": "GROUP:SOLEMN_PRAYERS",
        "follow": "SHOW",
        "live": "SHOW"
      },
      "notes": ""
    },
    {
      "id": "GF-SOP-09-K",
      "phase": "SOLEMN_PRAYERS",
      "trigger_type": "LITURGICAL_FORMULA",
      "trigger_key": "CONVERSION_OF_PAGANS:FLECTAMUS_GENUA",
      "actor_scope": "ALL_FAITHFUL",
      "posture_state": "KNEEL",
      "action_state": "SILENT_PRAYER",
      "object_state": null,
      "personal_state": null,
      "branch_condition": null,
      "evidence_status": "MR62_EXPLICIT",
      "source_locator": "MR62 Good Friday Solemn Prayers",
      "projection": {
        "simple": "GROUP:SOLEMN_PRAYERS",
        "follow": "SHOW",
        "live": "SHOW"
      },
      "notes": ""
    },
    {
      "id": "GF-SOP-09-R",
      "phase": "SOLEMN_PRAYERS",
      "trigger_type": "LITURGICAL_FORMULA",
      "trigger_key": "CONVERSION_OF_PAGANS:LEVATE",
      "actor_scope": "ALL_FAITHFUL",
      "posture_state": "STAND",
      "action_state": null,
      "object_state": null,
      "personal_state": null,
      "branch_condition": null,
      "evidence_status": "MR62_EXPLICIT",
      "source_locator": "MR62 Good Friday Solemn Prayers",
      "projection": {
        "simple": "GROUP:SOLEMN_PRAYERS",
        "follow": "SHOW",
        "live": "SHOW"
      },
      "notes": ""
    },
    {
      "id": "GF-XPREP-500",
      "phase": "CROSS",
      "trigger_type": "SECTION_TRANSITION",
      "trigger_key": "SOLEMN_PRAYERS_COMPLETE_CROSS_PREP",
      "actor_scope": "ALL_FAITHFUL",
      "posture_state": "SIT",
      "action_state": null,
      "object_state": null,
      "personal_state": null,
      "branch_condition": null,
      "evidence_status": "MANUAL_LOCKED",
      "source_locator": "1962-era Good Friday ceremonial manual",
      "projection": {
        "simple": "SHOW",
        "follow": "SHOW",
        "live": "SHOW"
      },
      "notes": ""
    },
    {
      "id": "GF-X-510",
      "phase": "CROSS",
      "trigger_type": "OBJECT_MOVEMENT",
      "trigger_key": "CROSS_ENTERS_OR_UNVEILING_BEGINS",
      "actor_scope": "ALL_FAITHFUL",
      "posture_state": "STAND",
      "action_state": null,
      "object_state": null,
      "personal_state": null,
      "branch_condition": null,
      "evidence_status": "MR62_EXPLICIT",
      "source_locator": "MR62 Good Friday Cross unveiling",
      "projection": {
        "simple": "SHOW",
        "follow": "SHOW",
        "live": "SHOW"
      },
      "notes": ""
    },
    {
      "id": "GF-X-521",
      "phase": "CROSS",
      "trigger_type": "LITURGICAL_FORMULA",
      "trigger_key": "VENITE_ADOREMUS_1_COMPLETED",
      "actor_scope": "ALL_FAITHFUL",
      "posture_state": "KNEEL",
      "action_state": "BRIEF_SILENT_ADORATION",
      "object_state": null,
      "personal_state": null,
      "branch_condition": null,
      "evidence_status": "MR62_EXPLICIT",
      "source_locator": "MR62 Good Friday Cross unveiling",
      "projection": {
        "simple": "GROUP:UNVEILING",
        "follow": "SHOW",
        "live": "SHOW"
      },
      "notes": ""
    },
    {
      "id": "GF-X-531",
      "phase": "CROSS",
      "trigger_type": "RITE_STATE",
      "trigger_key": "UNVEILING_ADORATION_1_COMPLETE",
      "actor_scope": "ALL_FAITHFUL",
      "posture_state": "STAND",
      "action_state": null,
      "object_state": null,
      "personal_state": null,
      "branch_condition": null,
      "evidence_status": "CEREMONIAL_STATE",
      "source_locator": "1962 Good Friday ceremonial implementation",
      "projection": {
        "simple": "GROUP:UNVEILING",
        "follow": "SHOW",
        "live": "SHOW"
      },
      "notes": ""
    },
    {
      "id": "GF-X-522",
      "phase": "CROSS",
      "trigger_type": "LITURGICAL_FORMULA",
      "trigger_key": "VENITE_ADOREMUS_2_COMPLETED",
      "actor_scope": "ALL_FAITHFUL",
      "posture_state": "KNEEL",
      "action_state": "BRIEF_SILENT_ADORATION",
      "object_state": null,
      "personal_state": null,
      "branch_condition": null,
      "evidence_status": "MR62_EXPLICIT",
      "source_locator": "MR62 Good Friday Cross unveiling",
      "projection": {
        "simple": "GROUP:UNVEILING",
        "follow": "SHOW",
        "live": "SHOW"
      },
      "notes": ""
    },
    {
      "id": "GF-X-532",
      "phase": "CROSS",
      "trigger_type": "RITE_STATE",
      "trigger_key": "UNVEILING_ADORATION_2_COMPLETE",
      "actor_scope": "ALL_FAITHFUL",
      "posture_state": "STAND",
      "action_state": null,
      "object_state": null,
      "personal_state": null,
      "branch_condition": null,
      "evidence_status": "CEREMONIAL_STATE",
      "source_locator": "1962 Good Friday ceremonial implementation",
      "projection": {
        "simple": "GROUP:UNVEILING",
        "follow": "SHOW",
        "live": "SHOW"
      },
      "notes": ""
    },
    {
      "id": "GF-X-523",
      "phase": "CROSS",
      "trigger_type": "LITURGICAL_FORMULA",
      "trigger_key": "VENITE_ADOREMUS_3_COMPLETED",
      "actor_scope": "ALL_FAITHFUL",
      "posture_state": "KNEEL",
      "action_state": "BRIEF_SILENT_ADORATION",
      "object_state": null,
      "personal_state": null,
      "branch_condition": null,
      "evidence_status": "MR62_EXPLICIT",
      "source_locator": "MR62 Good Friday Cross unveiling",
      "projection": {
        "simple": "GROUP:UNVEILING",
        "follow": "SHOW",
        "live": "SHOW"
      },
      "notes": ""
    },
    {
      "id": "GF-X-533",
      "phase": "CROSS",
      "trigger_type": "RITE_STATE",
      "trigger_key": "UNVEILING_ADORATION_3_COMPLETE",
      "actor_scope": "ALL_FAITHFUL",
      "posture_state": "STAND",
      "action_state": null,
      "object_state": null,
      "personal_state": null,
      "branch_condition": null,
      "evidence_status": "CEREMONIAL_STATE",
      "source_locator": "1962 Good Friday ceremonial implementation",
      "projection": {
        "simple": "GROUP:UNVEILING",
        "follow": "SHOW",
        "live": "SHOW"
      },
      "notes": ""
    },
    {
      "id": "GF-VEN-600",
      "phase": "CROSS_VENERATION",
      "trigger_type": "PERSONAL_STATE",
      "trigger_key": "WAITING_FOR_PERSONAL_TURN",
      "actor_scope": "ORDINARY_FAITHFUL",
      "posture_state": "SIT",
      "action_state": null,
      "object_state": null,
      "personal_state": "WAITING",
      "branch_condition": null,
      "evidence_status": "MR62_EXPLICIT",
      "source_locator": "MR62 Good Friday Cross veneration",
      "projection": {
        "simple": "SHOW",
        "follow": "SHOW",
        "live": "SHOW"
      },
      "notes": "Improperia soundtrack position is not a trigger."
    },
    {
      "id": "GF-VEN-610",
      "phase": "CROSS_VENERATION",
      "trigger_type": "PERSONAL_STATE",
      "trigger_key": "PERSONAL_TURN_BEGINS",
      "actor_scope": "ORDINARY_FAITHFUL",
      "posture_state": null,
      "action_state": "APPROACH_CROSS",
      "object_state": null,
      "personal_state": "APPROACHING",
      "branch_condition": null,
      "evidence_status": "MANUAL_LOCKED",
      "source_locator": "1962 ceremonial guides; faithful veneration",
      "projection": {
        "simple": "SHOW",
        "follow": "SHOW",
        "live": "SHOW"
      },
      "notes": ""
    },
    {
      "id": "GF-VEN-620",
      "phase": "CROSS_VENERATION",
      "trigger_type": "PERSONAL_POSITION",
      "trigger_key": "AT_CROSS_IMMEDIATELY_BEFORE_VENERATION",
      "actor_scope": "ORDINARY_FAITHFUL",
      "posture_state": null,
      "action_state": "ONE_SIMPLE_GENUFLECTION",
      "object_state": null,
      "personal_state": "GENUFLECTING",
      "branch_condition": null,
      "evidence_status": "MANUAL_LOCKED",
      "source_locator": "Fortescue pp. 294/299; O’Connell p. 46",
      "projection": {
        "simple": "SHOW",
        "follow": "SHOW",
        "live": "SHOW"
      },
      "notes": "Never inherit the ministers’ three-genuflection approach."
    },
    {
      "id": "GF-VEN-630",
      "phase": "CROSS_VENERATION",
      "trigger_type": "PERSONAL_STATE",
      "trigger_key": "GENUFLECTION_COMPLETE",
      "actor_scope": "ORDINARY_FAITHFUL",
      "posture_state": null,
      "action_state": "KISS_OR_VENERATE_CROSS",
      "object_state": null,
      "personal_state": "VENERATING",
      "branch_condition": null,
      "evidence_status": "MR62_AND_MANUAL",
      "source_locator": "MR62 + 1962 ceremonial manuals",
      "projection": {
        "simple": "SHOW",
        "follow": "SHOW",
        "live": "SHOW"
      },
      "notes": ""
    },
    {
      "id": "GF-VEN-640",
      "phase": "CROSS_VENERATION",
      "trigger_type": "PERSONAL_STATE",
      "trigger_key": "PERSONAL_VENERATION_COMPLETE",
      "actor_scope": "ORDINARY_FAITHFUL",
      "posture_state": "SIT",
      "action_state": "RETURN_TO_PLACE",
      "object_state": null,
      "personal_state": "COMPLETE",
      "branch_condition": null,
      "evidence_status": "MANUAL_LOCKED",
      "source_locator": "1962 ceremonial guides",
      "projection": {
        "simple": "SHOW",
        "follow": "SHOW",
        "live": "SHOW"
      },
      "notes": ""
    },
    {
      "id": "GF-VEN-650",
      "phase": "CROSS_VENERATION",
      "trigger_type": "BRANCH",
      "trigger_key": "CORPORATE_SILENT_VENERATION_SELECTED",
      "actor_scope": "ALL_FAITHFUL",
      "posture_state": null,
      "action_state": "SILENT_ADORATION_FROM_PLACE",
      "object_state": null,
      "personal_state": null,
      "branch_condition": "CROSS_VENERATION_MODE=CORPORATE_SILENT",
      "evidence_status": "MR62_BRANCH",
      "source_locator": "MR62 Good Friday large-crowd veneration branch",
      "projection": {
        "simple": "SHOW",
        "follow": "SHOW",
        "live": "SHOW"
      },
      "notes": "Does not inherit personal one-genuflection sequence."
    },
    {
      "id": "GF-X-700",
      "phase": "CROSS",
      "trigger_type": "OBJECT_MOVEMENT",
      "trigger_key": "CROSS_REPLACED_ON_ALTAR",
      "actor_scope": "ALL_FAITHFUL",
      "posture_state": "STAND",
      "action_state": null,
      "object_state": null,
      "personal_state": null,
      "branch_condition": null,
      "evidence_status": "MANUAL_LOCKED",
      "source_locator": "Restored Holy Week ceremonial witness",
      "projection": {
        "simple": "SHOW",
        "follow": "SHOW",
        "live": "SHOW"
      },
      "notes": ""
    },
    {
      "id": "GF-COM-800",
      "phase": "PRESANCTIFIED_COMMUNION",
      "trigger_type": "SECTION_TRANSITION",
      "trigger_key": "COMMUNION_PREPARATION_BEGINS",
      "actor_scope": "ALL_FAITHFUL",
      "posture_state": "SIT",
      "action_state": null,
      "object_state": null,
      "personal_state": null,
      "branch_condition": null,
      "evidence_status": "MANUAL_LOCKED",
      "source_locator": "1962-era Good Friday ceremonial manual",
      "projection": {
        "simple": "SHOW",
        "follow": "SHOW",
        "live": "SHOW"
      },
      "notes": ""
    },
    {
      "id": "GF-COM-810",
      "phase": "PRESANCTIFIED_COMMUNION",
      "trigger_type": "SACRAMENTAL_STATE",
      "trigger_key": "BLESSED_SACRAMENT_RETURNING_TO_HIGH_ALTAR",
      "actor_scope": "ALL_FAITHFUL",
      "posture_state": "KNEEL",
      "action_state": null,
      "object_state": "BLESSED_SACRAMENT_RETURNING",
      "personal_state": null,
      "branch_condition": null,
      "evidence_status": "MR62_EXPLICIT",
      "source_locator": "MR62 Good Friday return of Blessed Sacrament",
      "projection": {
        "simple": "SHOW",
        "follow": "SHOW",
        "live": "SHOW"
      },
      "notes": "Never bind to an accompanying antiphon."
    },
    {
      "id": "GF-COM-820",
      "phase": "PRESANCTIFIED_COMMUNION",
      "trigger_type": "SACRAMENTAL_STATE",
      "trigger_key": "BLESSED_SACRAMENT_AT_ALTAR_PATER_PREP",
      "actor_scope": "ALL_FAITHFUL",
      "posture_state": "STAND",
      "action_state": null,
      "object_state": "BLESSED_SACRAMENT_AT_ALTAR",
      "personal_state": null,
      "branch_condition": null,
      "evidence_status": "MANUAL_LOCKED",
      "source_locator": "1962-era ceremonial witness",
      "projection": {
        "simple": "SHOW",
        "follow": "SHOW",
        "live": "SHOW"
      },
      "notes": ""
    },
    {
      "id": "GF-COM-830",
      "phase": "PRESANCTIFIED_COMMUNION",
      "trigger_type": "LITURGICAL_FORMULA",
      "trigger_key": "PRAECEPTIS_PATER_NOSTER",
      "actor_scope": "ALL_FAITHFUL",
      "posture_state": "STAND",
      "action_state": "RECITE_PATER",
      "object_state": null,
      "personal_state": null,
      "branch_condition": null,
      "evidence_status": "LOCKED_1962",
      "source_locator": "Restored Holy Week liturgical book + 1962-era ceremonial witness",
      "projection": {
        "simple": "SHOW",
        "follow": "SHOW",
        "live": "SHOW"
      },
      "notes": ""
    },
    {
      "id": "GF-COM-840",
      "phase": "PRESANCTIFIED_COMMUNION",
      "trigger_type": "RITE_STATE",
      "trigger_key": "IMMEDIATE_COMMUNION_PREPARATION",
      "actor_scope": "ALL_FAITHFUL",
      "posture_state": "KNEEL",
      "action_state": null,
      "object_state": null,
      "personal_state": null,
      "branch_condition": null,
      "evidence_status": "MANUAL_LOCKED",
      "source_locator": "1962-era ceremonial witness",
      "projection": {
        "simple": "SHOW",
        "follow": "SHOW",
        "live": "SHOW"
      },
      "notes": ""
    },
    {
      "id": "GF-COM-850",
      "phase": "PRESANCTIFIED_COMMUNION",
      "trigger_type": "PERSONAL_STATE",
      "trigger_key": "PERSONAL_COMMUNION",
      "actor_scope": "COMMUNICANT",
      "posture_state": "KNEEL",
      "action_state": "RECEIVE_COMMUNION",
      "object_state": null,
      "personal_state": "RECEIVING_COMMUNION",
      "branch_condition": null,
      "evidence_status": "MANUAL_LOCKED",
      "source_locator": "1962-era Communion discipline",
      "projection": {
        "simple": "SHOW",
        "follow": "SHOW",
        "live": "SHOW"
      },
      "notes": ""
    },
    {
      "id": "GF-COM-860",
      "phase": "PRESANCTIFIED_COMMUNION",
      "trigger_type": "SACRAMENTAL_STATE",
      "trigger_key": "COMMUNION_AND_RESERVATION_COMPLETE",
      "actor_scope": "ALL_FAITHFUL",
      "posture_state": "STAND",
      "action_state": null,
      "object_state": null,
      "personal_state": null,
      "branch_condition": null,
      "evidence_status": "MANUAL_LOCKED",
      "source_locator": "1962-era ceremonial witness",
      "projection": {
        "simple": "SHOW",
        "follow": "SHOW",
        "live": "SHOW"
      },
      "notes": ""
    },
    {
      "id": "GF-END-900",
      "phase": "CONCLUSION",
      "trigger_type": "SECTION_START",
      "trigger_key": "THREE_CONCLUDING_PRAYERS",
      "actor_scope": "ALL_FAITHFUL",
      "posture_state": "STAND",
      "action_state": "RESPOND_AMEN",
      "object_state": null,
      "personal_state": null,
      "branch_condition": null,
      "evidence_status": "MR62_EXPLICIT",
      "source_locator": "MR62 Good Friday concluding prayers",
      "projection": {
        "simple": "SHOW",
        "follow": "SHOW",
        "live": "SHOW"
      },
      "notes": ""
    },
    {
      "id": "GF-END-910",
      "phase": "CONCLUSION",
      "trigger_type": "RITE_STATE",
      "trigger_key": "MINISTERS_DEPART",
      "actor_scope": "ALL_FAITHFUL",
      "posture_state": "STAND",
      "action_state": null,
      "object_state": null,
      "personal_state": null,
      "branch_condition": null,
      "evidence_status": "STATE_CONTINUATION",
      "source_locator": "State continuation from concluding prayers",
      "projection": {
        "simple": "SHOW",
        "follow": "SHOW",
        "live": "SHOW"
      },
      "notes": ""
    }
  ],
  "EV": [
    {
      "id": "EV-FIRE-010",
      "phase": "NEW_FIRE",
      "trigger_type": "RITE_STATE",
      "trigger_key": "NEW_FIRE_CEREMONY_ACTIVE",
      "actor_scope": "ALL_FAITHFUL",
      "posture_state": "STAND",
      "action_state": null,
      "object_state": null,
      "personal_state": null,
      "branch_condition": null,
      "evidence_status": "MANUAL_LOCKED",
      "source_locator": "McManus 1956 / restored Holy Week ceremonial guidance",
      "projection": {
        "simple": "SHOW",
        "follow": "SHOW",
        "live": "SHOW"
      },
      "notes": ""
    },
    {
      "id": "EV-FIRE-020",
      "phase": "PASCHAL_CANDLE_PREP",
      "trigger_type": "RITE_STATE",
      "trigger_key": "PASCHAL_CANDLE_PREPARATION",
      "actor_scope": "ALL_FAITHFUL",
      "posture_state": "STAND",
      "action_state": "OBSERVE_NO_LAY_IMITATION",
      "object_state": "PASCHAL_CANDLE_PREPARED",
      "personal_state": null,
      "branch_condition": null,
      "evidence_status": "MR62_EXPLICIT_ACTOR_SCOPED",
      "source_locator": "MR62 Holy Saturday Paschal candle preparation",
      "projection": {
        "simple": "SHOW",
        "follow": "SHOW",
        "live": "SHOW"
      },
      "notes": ""
    },
    {
      "id": "EV-PROC-100",
      "phase": "PROCESSION",
      "trigger_type": "PROCESSION_STATE",
      "trigger_key": "PASCHAL_PROCESSION_BEGINS",
      "actor_scope": "ALL_FAITHFUL",
      "posture_state": null,
      "action_state": "FOLLOW_PROCESSION_WHERE_APPLICABLE",
      "object_state": "FAITHFUL_CANDLE_UNLIT",
      "personal_state": null,
      "branch_condition": null,
      "evidence_status": "MANUAL_LOCKED",
      "source_locator": "1962 Easter Vigil ceremonial guidance",
      "projection": {
        "simple": "SHOW",
        "follow": "SHOW",
        "live": "SHOW"
      },
      "notes": ""
    },
    {
      "id": "EV-LUM-110",
      "phase": "PROCESSION",
      "trigger_type": "LITURGICAL_FORMULA",
      "trigger_key": "LUMEN_CHRISTI_1_COMPLETED",
      "actor_scope": "ALL_FAITHFUL",
      "posture_state": null,
      "action_state": "GENUFLECT_TOWARD_PASCHAL_CANDLE_AND_RESPOND_DEO_GRATIAS",
      "object_state": "FAITHFUL_CANDLE_UNLIT",
      "personal_state": null,
      "branch_condition": null,
      "evidence_status": "MR62_EXPLICIT",
      "source_locator": "MR62 Holy Saturday Lumen Christi I",
      "projection": {
        "simple": "SHOW",
        "follow": "SHOW",
        "live": "SHOW"
      },
      "notes": ""
    },
    {
      "id": "EV-LUM-120",
      "phase": "PROCESSION",
      "trigger_type": "LITURGICAL_FORMULA",
      "trigger_key": "LUMEN_CHRISTI_2_COMPLETED",
      "actor_scope": "ALL_FAITHFUL",
      "posture_state": null,
      "action_state": "GENUFLECT_TOWARD_PASCHAL_CANDLE_AND_RESPOND_DEO_GRATIAS",
      "object_state": "CLERGY_CANDLES_LIT__FAITHFUL_CANDLE_UNLIT",
      "personal_state": null,
      "branch_condition": null,
      "evidence_status": "MR62_EXPLICIT",
      "source_locator": "MR62 Holy Saturday Lumen Christi II",
      "projection": {
        "simple": "SHOW",
        "follow": "SHOW",
        "live": "SHOW"
      },
      "notes": ""
    },
    {
      "id": "EV-LUM-130",
      "phase": "PROCESSION",
      "trigger_type": "LITURGICAL_FORMULA",
      "trigger_key": "LUMEN_CHRISTI_3_COMPLETED",
      "actor_scope": "ALL_FAITHFUL",
      "posture_state": null,
      "action_state": "GENUFLECT_TOWARD_PASCHAL_CANDLE_AND_RESPOND_DEO_GRATIAS",
      "object_state": "FAITHFUL_CANDLES_LIT__CHURCH_LIGHTS_ON",
      "personal_state": null,
      "branch_condition": null,
      "evidence_status": "MR62_EXPLICIT",
      "source_locator": "MR62 Holy Saturday Lumen Christi III",
      "projection": {
        "simple": "SHOW",
        "follow": "SHOW",
        "live": "SHOW"
      },
      "notes": ""
    },
    {
      "id": "EV-EXS-200",
      "phase": "EXSULTET",
      "trigger_type": "SECTION_START",
      "trigger_key": "PRAECONIUM_PASCHALE_BEGINS",
      "actor_scope": "ALL_FAITHFUL",
      "posture_state": "STAND",
      "action_state": null,
      "object_state": "LIT_RECOMMENDED_BY_RUBRIC",
      "personal_state": null,
      "branch_condition": null,
      "evidence_status": "MR62_EXPLICIT_CONVENIT",
      "source_locator": "MR62 Holy Saturday Exsultet rubric",
      "projection": {
        "simple": "SHOW",
        "follow": "SHOW",
        "live": "SHOW"
      },
      "notes": "convenit = recommended/fitting, not a universal mandatory state."
    },
    {
      "id": "EV-EXS-210",
      "phase": "EXSULTET",
      "trigger_type": "SECTION_END",
      "trigger_key": "PRAECONIUM_PASCHALE_ENDS",
      "actor_scope": "ALL_FAITHFUL",
      "posture_state": null,
      "action_state": null,
      "object_state": "CANDLE_STATE_UNCONSTRAINED_NOT_PRESCRIBED",
      "personal_state": null,
      "branch_condition": null,
      "evidence_status": "SOURCE_SILENT",
      "source_locator": "MR62 does not prescribe a universal extinguishing instant",
      "projection": {
        "simple": "SHOW",
        "follow": "SHOW",
        "live": "SHOW"
      },
      "notes": ""
    },
    {
      "id": "EV-LESS-01-READ",
      "phase": "PROPHECIES",
      "trigger_type": "SECTION_START",
      "trigger_key": "GENESIS_LESSON_BEGINS",
      "actor_scope": "ALL_FAITHFUL",
      "posture_state": "SIT",
      "action_state": null,
      "object_state": null,
      "personal_state": null,
      "branch_condition": null,
      "evidence_status": "MANUAL_LOCKED",
      "source_locator": "1962 Easter Vigil ceremonial guidance",
      "projection": {
        "simple": "GROUP:PROPHECIES",
        "follow": "SHOW",
        "live": "SHOW"
      },
      "notes": ""
    },
    {
      "id": "EV-LESS-01-OREM",
      "phase": "PROPHECIES",
      "trigger_type": "LITURGICAL_FORMULA",
      "trigger_key": "GENESIS:OREMUS",
      "actor_scope": "ALL_FAITHFUL",
      "posture_state": "STAND",
      "action_state": null,
      "object_state": null,
      "personal_state": null,
      "branch_condition": null,
      "evidence_status": "MR62_EXPLICIT",
      "source_locator": "MR62 Holy Saturday prophecy oration",
      "projection": {
        "simple": "GROUP:PROPHECIES",
        "follow": "SHOW",
        "live": "SHOW"
      },
      "notes": ""
    },
    {
      "id": "EV-LESS-01-KNEEL",
      "phase": "PROPHECIES",
      "trigger_type": "LITURGICAL_FORMULA",
      "trigger_key": "GENESIS:FLECTAMUS_GENUA",
      "actor_scope": "ALL_FAITHFUL",
      "posture_state": "KNEEL",
      "action_state": "SILENT_PRAYER",
      "object_state": null,
      "personal_state": null,
      "branch_condition": null,
      "evidence_status": "MR62_EXPLICIT",
      "source_locator": "MR62/RG60 Flectamus genua rubric",
      "projection": {
        "simple": "GROUP:PROPHECIES",
        "follow": "SHOW",
        "live": "SHOW"
      },
      "notes": ""
    },
    {
      "id": "EV-LESS-01-RISE",
      "phase": "PROPHECIES",
      "trigger_type": "LITURGICAL_FORMULA",
      "trigger_key": "GENESIS:LEVATE",
      "actor_scope": "ALL_FAITHFUL",
      "posture_state": "STAND",
      "action_state": null,
      "object_state": null,
      "personal_state": null,
      "branch_condition": null,
      "evidence_status": "MR62_EXPLICIT",
      "source_locator": "MR62/RG60 Levate rubric",
      "projection": {
        "simple": "GROUP:PROPHECIES",
        "follow": "SHOW",
        "live": "SHOW"
      },
      "notes": ""
    },
    {
      "id": "EV-LESS-02-READ",
      "phase": "PROPHECIES",
      "trigger_type": "SECTION_START",
      "trigger_key": "EXODUS_LESSON_BEGINS",
      "actor_scope": "ALL_FAITHFUL",
      "posture_state": "SIT",
      "action_state": null,
      "object_state": null,
      "personal_state": null,
      "branch_condition": null,
      "evidence_status": "MANUAL_LOCKED",
      "source_locator": "1962 Easter Vigil ceremonial guidance",
      "projection": {
        "simple": "GROUP:PROPHECIES",
        "follow": "SHOW",
        "live": "SHOW"
      },
      "notes": ""
    },
    {
      "id": "EV-LESS-02-OREM",
      "phase": "PROPHECIES",
      "trigger_type": "LITURGICAL_FORMULA",
      "trigger_key": "EXODUS:OREMUS",
      "actor_scope": "ALL_FAITHFUL",
      "posture_state": "STAND",
      "action_state": null,
      "object_state": null,
      "personal_state": null,
      "branch_condition": null,
      "evidence_status": "MR62_EXPLICIT",
      "source_locator": "MR62 Holy Saturday prophecy oration",
      "projection": {
        "simple": "GROUP:PROPHECIES",
        "follow": "SHOW",
        "live": "SHOW"
      },
      "notes": ""
    },
    {
      "id": "EV-LESS-02-KNEEL",
      "phase": "PROPHECIES",
      "trigger_type": "LITURGICAL_FORMULA",
      "trigger_key": "EXODUS:FLECTAMUS_GENUA",
      "actor_scope": "ALL_FAITHFUL",
      "posture_state": "KNEEL",
      "action_state": "SILENT_PRAYER",
      "object_state": null,
      "personal_state": null,
      "branch_condition": null,
      "evidence_status": "MR62_EXPLICIT",
      "source_locator": "MR62/RG60 Flectamus genua rubric",
      "projection": {
        "simple": "GROUP:PROPHECIES",
        "follow": "SHOW",
        "live": "SHOW"
      },
      "notes": ""
    },
    {
      "id": "EV-LESS-02-RISE",
      "phase": "PROPHECIES",
      "trigger_type": "LITURGICAL_FORMULA",
      "trigger_key": "EXODUS:LEVATE",
      "actor_scope": "ALL_FAITHFUL",
      "posture_state": "STAND",
      "action_state": null,
      "object_state": null,
      "personal_state": null,
      "branch_condition": null,
      "evidence_status": "MR62_EXPLICIT",
      "source_locator": "MR62/RG60 Levate rubric",
      "projection": {
        "simple": "GROUP:PROPHECIES",
        "follow": "SHOW",
        "live": "SHOW"
      },
      "notes": ""
    },
    {
      "id": "EV-LESS-03-READ",
      "phase": "PROPHECIES",
      "trigger_type": "SECTION_START",
      "trigger_key": "ISAIAH_LESSON_BEGINS",
      "actor_scope": "ALL_FAITHFUL",
      "posture_state": "SIT",
      "action_state": null,
      "object_state": null,
      "personal_state": null,
      "branch_condition": null,
      "evidence_status": "MANUAL_LOCKED",
      "source_locator": "1962 Easter Vigil ceremonial guidance",
      "projection": {
        "simple": "GROUP:PROPHECIES",
        "follow": "SHOW",
        "live": "SHOW"
      },
      "notes": ""
    },
    {
      "id": "EV-LESS-03-OREM",
      "phase": "PROPHECIES",
      "trigger_type": "LITURGICAL_FORMULA",
      "trigger_key": "ISAIAH:OREMUS",
      "actor_scope": "ALL_FAITHFUL",
      "posture_state": "STAND",
      "action_state": null,
      "object_state": null,
      "personal_state": null,
      "branch_condition": null,
      "evidence_status": "MR62_EXPLICIT",
      "source_locator": "MR62 Holy Saturday prophecy oration",
      "projection": {
        "simple": "GROUP:PROPHECIES",
        "follow": "SHOW",
        "live": "SHOW"
      },
      "notes": ""
    },
    {
      "id": "EV-LESS-03-KNEEL",
      "phase": "PROPHECIES",
      "trigger_type": "LITURGICAL_FORMULA",
      "trigger_key": "ISAIAH:FLECTAMUS_GENUA",
      "actor_scope": "ALL_FAITHFUL",
      "posture_state": "KNEEL",
      "action_state": "SILENT_PRAYER",
      "object_state": null,
      "personal_state": null,
      "branch_condition": null,
      "evidence_status": "MR62_EXPLICIT",
      "source_locator": "MR62/RG60 Flectamus genua rubric",
      "projection": {
        "simple": "GROUP:PROPHECIES",
        "follow": "SHOW",
        "live": "SHOW"
      },
      "notes": ""
    },
    {
      "id": "EV-LESS-03-RISE",
      "phase": "PROPHECIES",
      "trigger_type": "LITURGICAL_FORMULA",
      "trigger_key": "ISAIAH:LEVATE",
      "actor_scope": "ALL_FAITHFUL",
      "posture_state": "STAND",
      "action_state": null,
      "object_state": null,
      "personal_state": null,
      "branch_condition": null,
      "evidence_status": "MR62_EXPLICIT",
      "source_locator": "MR62/RG60 Levate rubric",
      "projection": {
        "simple": "GROUP:PROPHECIES",
        "follow": "SHOW",
        "live": "SHOW"
      },
      "notes": ""
    },
    {
      "id": "EV-LESS-04-READ",
      "phase": "PROPHECIES",
      "trigger_type": "SECTION_START",
      "trigger_key": "DEUTERONOMY_LESSON_BEGINS",
      "actor_scope": "ALL_FAITHFUL",
      "posture_state": "SIT",
      "action_state": null,
      "object_state": null,
      "personal_state": null,
      "branch_condition": null,
      "evidence_status": "MANUAL_LOCKED",
      "source_locator": "1962 Easter Vigil ceremonial guidance",
      "projection": {
        "simple": "GROUP:PROPHECIES",
        "follow": "SHOW",
        "live": "SHOW"
      },
      "notes": ""
    },
    {
      "id": "EV-LESS-04-OREM",
      "phase": "PROPHECIES",
      "trigger_type": "LITURGICAL_FORMULA",
      "trigger_key": "DEUTERONOMY:OREMUS",
      "actor_scope": "ALL_FAITHFUL",
      "posture_state": "STAND",
      "action_state": null,
      "object_state": null,
      "personal_state": null,
      "branch_condition": null,
      "evidence_status": "MR62_EXPLICIT",
      "source_locator": "MR62 Holy Saturday prophecy oration",
      "projection": {
        "simple": "GROUP:PROPHECIES",
        "follow": "SHOW",
        "live": "SHOW"
      },
      "notes": ""
    },
    {
      "id": "EV-LESS-04-KNEEL",
      "phase": "PROPHECIES",
      "trigger_type": "LITURGICAL_FORMULA",
      "trigger_key": "DEUTERONOMY:FLECTAMUS_GENUA",
      "actor_scope": "ALL_FAITHFUL",
      "posture_state": "KNEEL",
      "action_state": "SILENT_PRAYER",
      "object_state": null,
      "personal_state": null,
      "branch_condition": null,
      "evidence_status": "MR62_EXPLICIT",
      "source_locator": "MR62/RG60 Flectamus genua rubric",
      "projection": {
        "simple": "GROUP:PROPHECIES",
        "follow": "SHOW",
        "live": "SHOW"
      },
      "notes": ""
    },
    {
      "id": "EV-LESS-04-RISE",
      "phase": "PROPHECIES",
      "trigger_type": "LITURGICAL_FORMULA",
      "trigger_key": "DEUTERONOMY:LEVATE",
      "actor_scope": "ALL_FAITHFUL",
      "posture_state": "STAND",
      "action_state": null,
      "object_state": null,
      "personal_state": null,
      "branch_condition": null,
      "evidence_status": "MR62_EXPLICIT",
      "source_locator": "MR62/RG60 Levate rubric",
      "projection": {
        "simple": "GROUP:PROPHECIES",
        "follow": "SHOW",
        "live": "SHOW"
      },
      "notes": ""
    },
    {
      "id": "EV-LIT1-400",
      "phase": "BAPTISMAL_BRIDGE",
      "trigger_type": "SECTION_START",
      "trigger_key": "LITANY_PART_I_BEGINS",
      "actor_scope": "ALL_FAITHFUL",
      "posture_state": "KNEEL",
      "action_state": "RESPOND_LITANY",
      "object_state": null,
      "personal_state": null,
      "branch_condition": null,
      "evidence_status": "MR62_EXPLICIT",
      "source_locator": "MR62 Holy Saturday Litany I",
      "projection": {
        "simple": "SHOW",
        "follow": "SHOW",
        "live": "SHOW"
      },
      "notes": ""
    },
    {
      "id": "EV-FONT-410",
      "phase": "BAPTISMAL_BRIDGE",
      "trigger_type": "BRANCH",
      "trigger_key": "NO_BAPTISMAL_FONT_BRANCH",
      "actor_scope": "ALL_FAITHFUL",
      "posture_state": "KNEEL",
      "action_state": null,
      "object_state": null,
      "personal_state": null,
      "branch_condition": "FONT_MODE=NONE",
      "evidence_status": "MR62_BRANCH",
      "source_locator": "MR62 Holy Saturday no-font branch",
      "projection": {
        "simple": "SHOW",
        "follow": "SHOW",
        "live": "SHOW"
      },
      "notes": "Proceed toward renewal without inventing an unsupported posture change."
    },
    {
      "id": "EV-FONT-420",
      "phase": "BAPTISMAL_BRIDGE",
      "trigger_type": "SECTION_START",
      "trigger_key": "WATER_BLESSING_IN_CHURCH",
      "actor_scope": "ALL_FAITHFUL",
      "posture_state": "STAND",
      "action_state": null,
      "object_state": null,
      "personal_state": null,
      "branch_condition": "FONT_MODE=IN_CHURCH",
      "evidence_status": "MANUAL_LOCKED",
      "source_locator": "1962 Easter Vigil ceremonial guidance",
      "projection": {
        "simple": "SHOW",
        "follow": "SHOW",
        "live": "SHOW"
      },
      "notes": ""
    },
    {
      "id": "EV-BAPT-430",
      "phase": "BAPTISMAL_BRIDGE",
      "trigger_type": "OPTIONAL_SECTION",
      "trigger_key": "BAPTISMS_IF_ANY",
      "actor_scope": "ALL_FAITHFUL",
      "posture_state": "STAND",
      "action_state": null,
      "object_state": null,
      "personal_state": null,
      "branch_condition": "BAPTISM_PRESENT=true",
      "evidence_status": "MANUAL_LOCKED",
      "source_locator": "1962 Easter Vigil ceremonial guidance",
      "projection": {
        "simple": "SHOW",
        "follow": "SHOW",
        "live": "SHOW"
      },
      "notes": ""
    },
    {
      "id": "EV-FONT-440",
      "phase": "BAPTISMAL_BRIDGE",
      "trigger_type": "BRANCH",
      "trigger_key": "MINISTERS_GO_TO_SEPARATE_BAPTISTERY",
      "actor_scope": "ALL_FAITHFUL_REMAINING_IN_CHURCH",
      "posture_state": "KNEEL",
      "action_state": "CONTINUE_LITANY",
      "object_state": null,
      "personal_state": null,
      "branch_condition": "FONT_MODE=SEPARATE_BAPTISTERY",
      "evidence_status": "MR62_EXPLICIT_STATE_CONTINUATION",
      "source_locator": "MR62 Holy Saturday separate-baptistery branch",
      "projection": {
        "simple": "SHOW",
        "follow": "SHOW",
        "live": "SHOW"
      },
      "notes": ""
    },
    {
      "id": "EV-FONT-450",
      "phase": "BAPTISMAL_BRIDGE",
      "trigger_type": "PROCESSION_STATE",
      "trigger_key": "MINISTERS_RETURN_FROM_FONT",
      "actor_scope": "ALL_FAITHFUL",
      "posture_state": "STAND",
      "action_state": null,
      "object_state": null,
      "personal_state": null,
      "branch_condition": "FONT_MODE!=NONE",
      "evidence_status": "MANUAL_LOCKED",
      "source_locator": "1962 Easter Vigil ceremonial guidance",
      "projection": {
        "simple": "SHOW",
        "follow": "SHOW",
        "live": "SHOW"
      },
      "notes": ""
    },
    {
      "id": "EV-REN-490",
      "phase": "BAPTISMAL_RENEWAL",
      "trigger_type": "PREPARATION",
      "trigger_key": "RENEWAL_PREPARATION",
      "actor_scope": "ALL_FAITHFUL",
      "posture_state": "SIT",
      "action_state": "RELIGHT_CANDLE_IF_NOT_ALREADY_LIT",
      "object_state": "CANDLE_RELIGHT_AVAILABLE",
      "personal_state": null,
      "branch_condition": null,
      "evidence_status": "MANUAL_LOCKED",
      "source_locator": "McManus 1956 / restored Holy Week ceremonial guidance",
      "projection": {
        "simple": "SHOW",
        "follow": "SHOW",
        "live": "SHOW"
      },
      "notes": ""
    },
    {
      "id": "EV-REN-500",
      "phase": "BAPTISMAL_RENEWAL",
      "trigger_type": "SECTION_START",
      "trigger_key": "RENOVATIO_PROMISSIONUM_BAPTISMALIUM",
      "actor_scope": "ALL_FAITHFUL",
      "posture_state": "STAND",
      "action_state": null,
      "object_state": "LIT_RECOMMENDED_BY_RUBRIC",
      "personal_state": null,
      "branch_condition": null,
      "evidence_status": "MR62_EXPLICIT_CONVENIT",
      "source_locator": "MR62 Holy Saturday baptismal promises",
      "projection": {
        "simple": "SHOW",
        "follow": "SHOW",
        "live": "SHOW"
      },
      "notes": "Lighted candle is fitting/recommended by rubric, not encoded as universal obligation."
    },
    {
      "id": "EV-REN-510",
      "phase": "BAPTISMAL_RENEWAL",
      "trigger_type": "DIALOGUE",
      "trigger_key": "RENUNCIATIONS",
      "actor_scope": "ALL_FAITHFUL",
      "posture_state": "STAND",
      "action_state": "RESPOND_ABRENUNTIAMUS",
      "object_state": "LIT_RECOMMENDED_BY_RUBRIC",
      "personal_state": null,
      "branch_condition": null,
      "evidence_status": "MR62_EXPLICIT",
      "source_locator": "MR62 Holy Saturday baptismal promises",
      "projection": {
        "simple": "SHOW",
        "follow": "SHOW",
        "live": "SHOW"
      },
      "notes": ""
    },
    {
      "id": "EV-REN-520",
      "phase": "BAPTISMAL_RENEWAL",
      "trigger_type": "DIALOGUE",
      "trigger_key": "PROFESSIONS_OF_FAITH",
      "actor_scope": "ALL_FAITHFUL",
      "posture_state": "STAND",
      "action_state": "RESPOND_CREDIMUS",
      "object_state": "LIT_RECOMMENDED_BY_RUBRIC",
      "personal_state": null,
      "branch_condition": null,
      "evidence_status": "MR62_EXPLICIT",
      "source_locator": "MR62 Holy Saturday baptismal promises",
      "projection": {
        "simple": "SHOW",
        "follow": "SHOW",
        "live": "SHOW"
      },
      "notes": ""
    },
    {
      "id": "EV-REN-530",
      "phase": "BAPTISMAL_RENEWAL",
      "trigger_type": "LITURGICAL_FORMULA",
      "trigger_key": "COMMUNAL_PATER_NOSTER",
      "actor_scope": "ALL_FAITHFUL",
      "posture_state": "STAND",
      "action_state": "RECITE_PATER",
      "object_state": "LIT_RECOMMENDED_BY_RUBRIC",
      "personal_state": null,
      "branch_condition": null,
      "evidence_status": "MR62_EXPLICIT",
      "source_locator": "MR62 Holy Saturday baptismal promises",
      "projection": {
        "simple": "SHOW",
        "follow": "SHOW",
        "live": "SHOW"
      },
      "notes": ""
    },
    {
      "id": "EV-REN-540",
      "phase": "BAPTISMAL_RENEWAL",
      "trigger_type": "RITE_STATE",
      "trigger_key": "ASPERSION_AFTER_RENEWAL",
      "actor_scope": "ALL_FAITHFUL",
      "posture_state": "STAND",
      "action_state": "RECEIVE_ASPERSION",
      "object_state": null,
      "personal_state": null,
      "branch_condition": null,
      "evidence_status": "STATE_CONTINUATION",
      "source_locator": "MR62 Holy Saturday aspersion after renewal",
      "projection": {
        "simple": "SHOW",
        "follow": "SHOW",
        "live": "SHOW"
      },
      "notes": ""
    },
    {
      "id": "EV-LIT2-600",
      "phase": "BAPTISMAL_BRIDGE",
      "trigger_type": "SECTION_START",
      "trigger_key": "LITANY_PART_II_BEGINS",
      "actor_scope": "ALL_FAITHFUL",
      "posture_state": "KNEEL",
      "action_state": "RESPOND_LITANY",
      "object_state": null,
      "personal_state": null,
      "branch_condition": null,
      "evidence_status": "MR62_EXPLICIT",
      "source_locator": "MR62 Holy Saturday Litany II",
      "projection": {
        "simple": "SHOW",
        "follow": "SHOW",
        "live": "SHOW"
      },
      "notes": ""
    },
    {
      "id": "EV-MASS-700",
      "phase": "MASS_HANDOFF",
      "trigger_type": "GRAPH_HANDOFF",
      "trigger_key": "LITANY_REACHES_KYRIE_MASS_HANDOFF",
      "actor_scope": "SYSTEM",
      "posture_state": null,
      "action_state": "HANDOFF_TO_MC",
      "object_state": "MC_ENTRY=MC-0012",
      "personal_state": null,
      "branch_condition": null,
      "evidence_status": "MR62_EXPLICIT",
      "source_locator": "MR62 Holy Saturday special Mass beginning",
      "projection": {
        "simple": "SHOW",
        "follow": "SHOW",
        "live": "SHOW"
      },
      "notes": ""
    }
  ],
  "EASTER_VIGIL_MASS_OVERLAY": {
    "id": "EV-MASS-OVERLAY-1962",
    "entry_mc": "MC-0012",
    "inherit_historical_exclusions": true,
    "suppress_mc": [
      "MC-0001",
      "MC-0002",
      "MC-0003",
      "MC-0004",
      "MC-0005",
      "MC-0006",
      "MC-0007",
      "MC-0008",
      "MC-0009",
      "MC-0010",
      "MC-0011",
      "MC-0016",
      "MC-0018",
      "MC-0023",
      "MC-0024",
      "MC-0025",
      "MC-0026",
      "MC-0064",
      "MC-0065",
      "MC-0066",
      "MC-0077",
      "MC-0082"
    ],
    "modify_mc": {
      "MC-0013": {
        "insert_signal": "CHURCH_BELLS_AT_GLORIA",
        "source": "MR62 Holy Saturday Gloria rubric"
      },
      "MC-0017": {
        "mode": "EV_TRIPLE_ALLELUIA_PLUS_TRACT",
        "response": "ALLELUIA_REPEATED_BY_ALL_X3",
        "proper_payload": [
          "Alleluia Confitemini Domino",
          "Tract Laudate Dominum"
        ],
        "source": "MR62 Holy Saturday; chant concordance"
      },
      "MC-0079": {
        "formula": "ITE_MISSA_EST_ALLELUIA_ALLELUIA",
        "response": "DEO_GRATIAS_ALLELUIA_ALLELUIA",
        "source": "MR62 Holy Saturday dismissal"
      }
    },
    "insertions": [
      {
        "id": "EV-MASS-LAUDS-010",
        "after_mc": "MC-0076",
        "before_mc": "MC-0078",
        "action": "LAUDS_PSALM_150",
        "posture": "SIT",
        "evidence": "MANUAL_LOCKED"
      },
      {
        "id": "EV-MASS-LAUDS-020",
        "after": "EV-MASS-LAUDS-010",
        "before_mc": "MC-0078",
        "action": "BENEDICTUS_WITH_ANTIPHON",
        "posture": "STAND",
        "evidence": "MANUAL_LOCKED"
      }
    ],
    "retain_mc": [
      "MC-0012",
      "MC-0013",
      "MC-0014",
      "MC-0015",
      "MC-0017",
      "MC-0019",
      "MC-0021",
      "MC-0022",
      "MC-0027",
      "MC-0062",
      "MC-0075",
      "MC-0076",
      "MC-0078",
      "MC-0079",
      "MC-0080",
      "MC-0081",
      "MC-0083"
    ],
    "notes": [
      "Mass begins with Kyrie after Litany; no ordinary opening cluster or Introit.",
      "No Gradual: special Alleluia/Tract occupies MC-0017.",
      "No Credo, Offertory antiphon, Agnus Dei, Solemn Pax, Communion antiphon, or Last Gospel.",
      "Lauds is inserted after ablutions and before Postcommunion.",
      "Pax Domini remains; Agnus Dei, the prayer Domine Iesu Christe qui dixisti, the Solemn Pax, Communion antiphon, and Last Gospel are omitted."
    ]
  },
  "HOLY_THURSDAY_MANDATUM": {
    "id": "SP-HT-MANDATUM-1962",
    "enabled_if": "HOLY_THURSDAY && MANDATUM_PASTORALLY_USED",
    "insert_after": "SERMON_COMPLETE_AFTER_MC-0021",
    "return_target": "MC-0026",
    "events": [
      {
        "id": "SP-HT-MAND-010",
        "phase": "MANDATUM",
        "trigger_type": "SECTION_START",
        "trigger_key": "MANDATUM_BEGINS",
        "actor_scope": "CONGREGATION",
        "posture_state": "SIT",
        "action_state": null,
        "object_state": null,
        "personal_state": null,
        "branch_condition": null,
        "evidence_status": "MANUAL_LOCKED",
        "source_locator": "1962 Holy Thursday ceremonial guidance",
        "projection": {
          "simple": "SHOW",
          "follow": "SHOW",
          "live": "SHOW"
        },
        "notes": ""
      },
      {
        "id": "SP-HT-MAND-020",
        "phase": "MANDATUM",
        "trigger_type": "PERSONAL_STATE",
        "trigger_key": "CELEBRANT_APPROACHES_SELECTED_PARTICIPANT",
        "actor_scope": "MANDATUM_PARTICIPANT",
        "posture_state": "SIT",
        "action_state": "REMOVE_RIGHT_SHOE_AND_SOCK",
        "object_state": null,
        "personal_state": "READY_FOR_WASHING",
        "branch_condition": null,
        "evidence_status": "MANUAL_LOCKED",
        "source_locator": "MR62 + McManus participant choreography",
        "projection": {
          "simple": "SHOW",
          "follow": "SHOW",
          "live": "SHOW"
        },
        "notes": ""
      },
      {
        "id": "SP-HT-MAND-030",
        "phase": "MANDATUM",
        "trigger_type": "PERSONAL_STATE",
        "trigger_key": "RIGHT_FOOT_WASHING",
        "actor_scope": "MANDATUM_PARTICIPANT",
        "posture_state": "SIT",
        "action_state": "RIGHT_FOOT_WASHED_AND_DRIED",
        "object_state": null,
        "personal_state": "FOOT_WASHED",
        "branch_condition": null,
        "evidence_status": "MR62_EXPLICIT_ACTOR_SCOPED",
        "source_locator": "MR62 Holy Thursday Mandatum",
        "projection": {
          "simple": "SHOW",
          "follow": "SHOW",
          "live": "SHOW"
        },
        "notes": ""
      },
      {
        "id": "SP-HT-MAND-040",
        "phase": "MANDATUM",
        "trigger_type": "PERSONAL_STATE",
        "trigger_key": "WASHING_COMPLETE",
        "actor_scope": "MANDATUM_PARTICIPANT",
        "posture_state": "SIT",
        "action_state": "REPLACE_SOCK_AND_SHOE",
        "object_state": null,
        "personal_state": "COMPLETE",
        "branch_condition": null,
        "evidence_status": "MANUAL_LOCKED",
        "source_locator": "McManus participant choreography",
        "projection": {
          "simple": "SHOW",
          "follow": "SHOW",
          "live": "SHOW"
        },
        "notes": ""
      },
      {
        "id": "SP-HT-MAND-050",
        "phase": "MANDATUM",
        "trigger_type": "SECTION_TRANSITION",
        "trigger_key": "CONCLUDING_VERSICLES_AND_PRAYER",
        "actor_scope": "CONGREGATION",
        "posture_state": "STAND",
        "action_state": null,
        "object_state": null,
        "personal_state": null,
        "branch_condition": null,
        "evidence_status": "MANUAL_LOCKED",
        "source_locator": "1962 Holy Thursday ceremonial guidance",
        "projection": {
          "simple": "SHOW",
          "follow": "SHOW",
          "live": "SHOW"
        },
        "notes": ""
      },
      {
        "id": "SP-HT-MAND-060",
        "phase": "MANDATUM",
        "trigger_type": "GRAPH_HANDOFF",
        "trigger_key": "MANDATUM_COMPLETE",
        "actor_scope": "SYSTEM",
        "posture_state": null,
        "action_state": "RETURN_TO_MC",
        "object_state": "MC_ENTRY=MC-0026",
        "personal_state": null,
        "branch_condition": null,
        "evidence_status": "STRUCTURAL_LOCK",
        "source_locator": "MR62 placement after sermon; Mass resumes",
        "projection": {
          "simple": "SHOW",
          "follow": "SHOW",
          "live": "SHOW"
        },
        "notes": ""
      }
    ]
  }
});

  const HT = Object.freeze(SOURCE.HT);
  const GF = Object.freeze(SOURCE.GF);
  const EV = Object.freeze(SOURCE.EV);
  const EV_MASS = Object.freeze(SOURCE.EASTER_VIGIL_MASS_OVERLAY);
  const MANDATUM = Object.freeze(SOURCE.HOLY_THURSDAY_MANDATUM);

  const norm = value =>
    String(value ?? '')
      .trim()
      .toUpperCase()
      .replace(/[\s-]+/g, '_');

  function followingAction(ctx = {}) {
    const raw =
      ctx.followingAction ??
      ctx.session?.followingAction ??
      ctx.active?.resolvedMass?.followingAction ??
      ctx.settings?.followingAction ??
      ctx.state?.settings?.followingAction ??
      null;
    return norm(raw?.type ?? raw?.id ?? raw);
  }

  function explicitRite(ctx = {}) {
    return norm(
      ctx.rite ??
      ctx.actualRite ??
      ctx.session?.rite ??
      ctx.active?.resolvedMass?.rite ??
      ctx.active?.resolvedMass?.exceptionalProfile ??
      ctx.profile ??
      ''
    );
  }

  function flag(ctx, name) {
    return (
      ctx?.[name] === true ||
      ctx?.session?.[name] === true ||
      ctx?.active?.resolvedMass?.[name] === true ||
      ctx?.settings?.[name] === true ||
      ctx?.state?.settings?.[name] === true
    );
  }

  function personal(ctx = {}) {
    return {
      joinsHolyThursdayProcession:
        ctx.personal?.joinsHolyThursdayProcession === true ||
        ctx.joinsHolyThursdayProcession === true,

      mandatumParticipant:
        ctx.personal?.mandatumParticipant === true ||
        ctx.mandatumParticipant === true,

      receivesGoodFridayCommunion:
        ctx.personal?.receivesGoodFridayCommunion === true ||
        ctx.receivesGoodFridayCommunion === true,

      participatesPersonalVeneration:
        ctx.personal?.participatesPersonalVeneration !== false,

      goodFridayVenerationMode:
        norm(
          ctx.personal?.goodFridayVenerationMode ??
          ctx.goodFridayVenerationMode ??
          'PERSONAL'
        ),

      activeTrigger:
        String(
          ctx.personal?.activeTrigger ??
          ctx.activePersonalTrigger ??
          ''
        ).trim()
    };
  }

  function isHolyThursday(ctx = {}) {
    const r = explicitRite(ctx);
    return [
      'HOLY_THURSDAY',
      'MAUNDY_THURSDAY',
      'HOLY_THURSDAY_1962',
      'IN_CENA_DOMINI'
    ].includes(r);
  }

  function isGoodFriday(ctx = {}) {
    const r = explicitRite(ctx);
    return [
      'GOOD_FRIDAY',
      'GOOD_FRIDAY_1962',
      'IN_PASSIONE_ET_MORTE_DOMINI'
    ].includes(r);
  }

  function isEasterVigil(ctx = {}) {
    const r = explicitRite(ctx);
    return [
      'EASTER_VIGIL',
      'EASTER_VIGIL_1962',
      'HOLY_SATURDAY',
      'VIGILIA_PASCHALIS'
    ].includes(r);
  }

  /* ---------------------- HOLY THURSDAY ---------------------- */

  function mandatumSelected(ctx = {}) {
    return (
      isHolyThursday(ctx) &&
      (
        flag(ctx, 'mandatumPastorallyUsed') ||
        followingAction(ctx) === 'MANDATUM'
      )
    );
  }

  function projectMandatum(ctx = {}) {
    if (!mandatumSelected(ctx)) return [];

    const p = personal(ctx);

    return MANDATUM.events.filter(e => {
      if (e.actor_scope !== 'MANDATUM_PARTICIPANT')
        return true;

      if (!p.mandatumParticipant)
        return false;

      return (
        !p.activeTrigger ||
        p.activeTrigger === e.trigger_key
      );
    });
  }

  function holyThursdayPostMassSelected(ctx = {}) {
    if (!isHolyThursday(ctx)) return false;

    return (
      flag(ctx, 'repositionActuallyOccurs') ||
      followingAction(ctx) === 'HOLY_THURSDAY_REPOSITION' ||
      followingAction(ctx) === 'REPOSITION'
    );
  }

  function projectHolyThursdayPostMass(ctx = {}) {
    if (!holyThursdayPostMassSelected(ctx))
      return [];

    const p = personal(ctx);

    return HT.filter(e => {
      if (e.actor_scope !== 'FAITHFUL_JOINING')
        return true;
      return p.joinsHolyThursdayProcession;
    });
  }

  function holyThursdayMassContract(ctx = {}) {
    if (!isHolyThursday(ctx))
      return null;

    return Object.freeze({
      form: 'MASS_WITH_TRIDUUM_VARIANCES',

      /*
        Passiontide opening:
        Judica omitted, not the entire foot-prayer cluster.
      */
      opening: {
        suppressJudica: true,
        suppressWholeFootCluster: false
      },

      gloria: {
        present: true,
        bellsAndOrgan: 'ACTIVE_DURING_GLORIA',
        afterGloria:
          'BELLS_AND_ORGAN_SILENT_UNTIL_EASTER_VIGIL_GLORIA'
      },

      credo: false,

      communion: {
        paxGiven: false,
        peacePrayer: false,
        agnusThirdInvocation: 'MISERERE_NOBIS'
      },

      ending: {
        dismissal: 'BENEDICAMUS_DOMINO',
        finalBlessing: false,
        lastGospel: false
      },

      mandatum: {
        selected: mandatumSelected(ctx),
        insertAfter: 'SERMON_COMPLETE_AFTER_MC-0021',
        returnTarget: 'MC-0026'
      },

      postMass: {
        repositionSelected:
          holyThursdayPostMassSelected(ctx),
        strippingAfterReposition: true
      }
    });
  }

  /* ------------------------- GOOD FRIDAY ------------------------- */

  function goodFridayBranchAllowed(e, ctx = {}) {
    const p = personal(ctx);

    if (e.id === 'GF-VEN-650') {
      return p.goodFridayVenerationMode === 'CORPORATE_SILENT';
    }

    if (/^GF-VEN-6(?:00|10|20|30|40)$/.test(e.id)) {
      return (
        p.goodFridayVenerationMode !== 'CORPORATE_SILENT' &&
        p.participatesPersonalVeneration
      );
    }

    if (e.id === 'GF-COM-850') {
      return p.receivesGoodFridayCommunion;
    }

    return true;
  }

  function projectGoodFriday(ctx = {}, {
    lane = 'faithful'
  } = {}) {
    if (!isGoodFriday(ctx))
      return [];

    return GF.filter(e => {
      if (lane === 'faithful' && e.actor_scope === 'SYSTEM')
        return false;
      return goodFridayBranchAllowed(e, ctx);
    });
  }

  function goodFridayRuntimeContract(ctx = {}) {
    if (!isGoodFriday(ctx))
      return null;

    return Object.freeze({
      topology: 'DISTINCT_RITE',
      graph: 'GF',
      eventCount: GF.length,

      /*
        Hard isolation: Good Friday is not a Mass and must never
        inherit Mass-engine defaults.
      */
      useMassEngine: false,
      useMCGraph: false,
      useMassFormProfile: false,
      useOrdinaryBellGrammar: false,
      useOrdinaryScholaClock: false,
      useOrdinaryMassEnding: false,

      personalVeneration:
        personal(ctx).goodFridayVenerationMode,

      personalCommunion:
        personal(ctx).receivesGoodFridayCommunion,

      ending: 'GF-END-910'
    });
  }

  /* ----------------------- EASTER VIGIL ----------------------- */

  function projectEasterVigilPreMass(ctx = {}) {
    if (!isEasterVigil(ctx))
      return [];
    return EV;
  }

  function easterVigilMassOverlay(ctx = {}) {
    if (!isEasterVigil(ctx))
      return null;

    return Object.freeze({
      ...EV_MASS,

      /*
        Runtime sound-state reset:
        Holy Thursday silence ends only when the Gloria signal
        actually fires in the Vigil Mass.
      */
      soundState: {
        beforeGloria: 'BELLS_AND_ORGAN_SILENT',
        trigger: 'MC-0013_GLORIA',
        signal: 'CHURCH_BELLS_AT_GLORIA',
        afterTrigger: 'BELLS_AND_ORGAN_RELEASED_FROM_TRIDUUM_SILENCE'
      }
    });
  }

  function applyEasterVigilMass(mcEvents = [], ctx = {}) {
    if (!isEasterVigil(ctx))
      return mcEvents;

    const suppress =
      new Set(EV_MASS.suppress_mc);

    let out =
      (mcEvents || [])
        .filter(e => !suppress.has(e.id))
        .map(e => {
          const mod =
            EV_MASS.modify_mc?.[e.id];
          return mod
            ? { ...e, easterVigil: { ...mod } }
            : e;
        });

    /*
      Fail closed unless MC-0012 is present.
      The Vigil is not allowed to fabricate an ordinary Mass start.
    */
    const kyrie =
      out.findIndex(e => e.id === EV_MASS.entry_mc);

    if (kyrie < 0) {
      return [{
        id: 'EV-MASS-BLOCKED',
        runtimeOnly: true,
        status: 'BLOCKED',
        reason: 'MC_0012_KYRIE_ENTRY_MISSING'
      }];
    }

    out = out.slice(kyrie);

    for (const ins of EV_MASS.insertions || []) {
      if (ins.after_mc) {
        const i = out.findIndex(e => e.id === ins.after_mc);
        if (i >= 0) {
          out.splice(i + 1, 0, {
            ...ins,
            runtimeOnly: true,
            exceptionalProfile: 'EASTER_VIGIL_1962'
          });
        }
      } else if (ins.after) {
        const i = out.findIndex(e => e.id === ins.after);
        if (i >= 0) {
          out.splice(i + 1, 0, {
            ...ins,
            runtimeOnly: true,
            exceptionalProfile: 'EASTER_VIGIL_1962'
          });
        }
      }
    }

    return out;
  }

  function easterVigilRuntimeContract(ctx = {}) {
    if (!isEasterVigil(ctx))
      return null;

    return Object.freeze({
      topology: 'COMPOSITE_DISTINCT_RITE',
      preMassGraph: 'EV',
      preMassEventCount: EV.length,

      handoff: {
        eventId: 'EV-MASS-700',
        target: 'MC-0012',
        meaning:
          'Litany II hands directly to Kyrie; no ordinary pre-Mass or Introit path.'
      },

      massOverlay: easterVigilMassOverlay(ctx),

      ordinaryEntryForbidden: true,
      ordinaryAspergesForbidden: true,
      ordinaryFootPrayersForbidden: true,
      ordinaryIntroitForbidden: true
    });
  }

  /* ---------------------- MASTER RESOLVER ---------------------- */

  function resolve(ctx = {}) {
    if (isGoodFriday(ctx)) {
      return Object.freeze({
        kind: 'GOOD_FRIDAY',
        graph: projectGoodFriday(ctx),
        contract: goodFridayRuntimeContract(ctx)
      });
    }

    if (isEasterVigil(ctx)) {
      return Object.freeze({
        kind: 'EASTER_VIGIL',
        graph: projectEasterVigilPreMass(ctx),
        contract: easterVigilRuntimeContract(ctx)
      });
    }

    if (isHolyThursday(ctx)) {
      return Object.freeze({
        kind: 'HOLY_THURSDAY',
        massContract:
          holyThursdayMassContract(ctx),
        mandatum:
          projectMandatum(ctx),
        postMass:
          projectHolyThursdayPostMass(ctx)
      });
    }

    return null;
  }

  function audit() {
    const gfIds = GF.map(e => e.id);
    const evIds = EV.map(e => e.id);
    const htIds = HT.map(e => e.id);
    const mandIds = MANDATUM.events.map(e => e.id);

    const checks = {
      ht6:
        HT.length === 6 &&
        new Set(htIds).size === 6,

      gf56:
        GF.length === 56 &&
        new Set(gfIds).size === 56,

      ev38:
        EV.length === 38 &&
        new Set(evIds).size === 38,

      mandatum6:
        MANDATUM.events.length === 6 &&
        new Set(mandIds).size === 6,

      mandatumBoundary:
        MANDATUM.insert_after ===
          'SERMON_COMPLETE_AFTER_MC-0021' &&
        MANDATUM.return_target === 'MC-0026',

      gfPersonalVeneration:
        ['GF-VEN-600','GF-VEN-610','GF-VEN-620',
         'GF-VEN-630','GF-VEN-640']
          .every(id =>
            GF.find(e => e.id === id)
              ?.trigger_type === 'PERSONAL_STATE' ||
            GF.find(e => e.id === id)
              ?.trigger_type === 'PERSONAL_POSITION'
          ),

      gfPersonalCommunion:
        GF.find(e => e.id === 'GF-COM-850')
          ?.actor_scope === 'COMMUNICANT',

      evHandoff:
        EV.find(e => e.id === 'EV-MASS-700')
          ?.object_state === 'MC_ENTRY=MC-0012',

      evEntryKyrie:
        EV_MASS.entry_mc === 'MC-0012',

      evPeacePrayerSuppressed:
        EV_MASS.suppress_mc.includes('MC-0065') &&
        !EV_MASS.retain_mc.includes('MC-0065'),

      evAgnusSuppressed:
        EV_MASS.suppress_mc.includes('MC-0064'),

      evSolemnPaxSuppressed:
        EV_MASS.suppress_mc.includes('MC-0066'),

      evCommunionAntiphonSuppressed:
        EV_MASS.suppress_mc.includes('MC-0077'),

      evLastGospelSuppressed:
        EV_MASS.suppress_mc.includes('MC-0082'),

      evGloriaBellSignal:
        EV_MASS.modify_mc?.['MC-0013']
          ?.insert_signal ===
          'CHURCH_BELLS_AT_GLORIA',

      evLaudsInserted:
        (EV_MASS.insertions || [])
          .some(x =>
            x.id === 'EV-MASS-LAUDS-010' &&
            x.after_mc === 'MC-0076'
          ) &&
        (EV_MASS.insertions || [])
          .some(x =>
            x.id === 'EV-MASS-LAUDS-020'
          ),

      holyThursdayPostMassEndsLifecycle:
        HT.find(e => e.id === 'HT-POST-900')
          ?.action_state ===
          'EXIT_SPECIAL_GRAPH_TO_LIFECYCLE'
    };

    return Object.freeze({
      version: 'R11',
      counts: {
        HT: HT.length,
        MANDATUM: MANDATUM.events.length,
        GF: GF.length,
        EV: EV.length
      },
      checks,
      pass:
        Object.values(checks).every(Boolean)
    });
  }

  AO.TriduumR11 = Object.freeze({
    version: 'R11',
    authority:
      'SPECIAL_DAYS_RUNTIME_1.1 + v43.74_HT_RECOVERY',

    source: SOURCE,

    isHolyThursday,
    isGoodFriday,
    isEasterVigil,

    holyThursdayMassContract,
    mandatumSelected,
    projectMandatum,
    holyThursdayPostMassSelected,
    projectHolyThursdayPostMass,

    projectGoodFriday,
    goodFridayRuntimeContract,

    projectEasterVigilPreMass,
    easterVigilMassOverlay,
    applyEasterVigilMass,
    easterVigilRuntimeContract,

    resolve,
    audit
  });
})();

/* ========================================================================
   AD ORIENTEM — R12 PROCESSION LAYER
   Recovery authority: v43.73 / v43.74 Special Days closure

   Exact recovered graphs:
   - Corpus Christi following action: 8 CORPUS-* records
   - Generic following procession:    7 PROC-* records
   - Rogations / Greater-Minor Litanies: 6 ROG-* records

   HARD RULE:
   Calendar date / feast identity may make a procession available.
   It NEVER proves that the procession is actually occurring.
======================================================================== */
(() => {
  'use strict';

  const AO = globalThis.AO = globalThis.AO || {};
  const SOURCE = Object.freeze({
  "CORPUS": [
    {
      "id": "CORPUS-END-010",
      "phase": "MASS_CONCLUSION",
      "trigger_type": "RITE_STATE",
      "trigger_key": "CORPUS_PROCESSION_FOLLOWS_IMMEDIATELY",
      "actor_scope": "ALL",
      "posture_state": "INHERIT",
      "action_state": "DECLARE_FOLLOWING_EUCHARISTIC_PROCESSION",
      "object_state": null,
      "personal_state": null,
      "branch_condition": null,
      "evidence_status": "PRIMARY_ENDING_RULE",
      "source_locator": "RG60 §§507a, 508, 510a; Fortescue/O’Connell summarized by Romanitas Press",
      "projection": {
        "simple": "SHOW",
        "follow": "SHOW",
        "live": "SHOW"
      },
      "notes": "Optional/local rite: date alone is insufficient."
    },
    {
      "id": "CORPUS-END-020",
      "phase": "MASS_CONCLUSION",
      "trigger_type": "MC_VARIANCE",
      "trigger_key": "MC-0079_DISMISSAL",
      "actor_scope": "ALL",
      "posture_state": "INHERIT",
      "action_state": "BENEDICAMUS_DOMINO_REPLACES_ITE",
      "object_state": null,
      "personal_state": null,
      "branch_condition": null,
      "evidence_status": "PRIMARY_ENDING_RULE",
      "source_locator": "RG60 §507a",
      "projection": {
        "simple": "SHOW",
        "follow": "SHOW",
        "live": "SHOW"
      },
      "notes": ""
    },
    {
      "id": "CORPUS-END-030",
      "phase": "MASS_CONCLUSION",
      "trigger_type": "MC_VARIANCE",
      "trigger_key": "MC-0081_AND_MC-0082",
      "actor_scope": "ALL",
      "posture_state": "INHERIT",
      "action_state": "SUPPRESS_FINAL_BLESSING_AND_LAST_GOSPEL",
      "object_state": null,
      "personal_state": null,
      "branch_condition": null,
      "evidence_status": "PRIMARY_ENDING_RULE",
      "source_locator": "RG60 §§508, 510a",
      "projection": {
        "simple": "SHOW",
        "follow": "SHOW",
        "live": "SHOW"
      },
      "notes": ""
    },
    {
      "id": "CORPUS-EXP-010",
      "phase": "EUCHARISTIC_PROCESSION",
      "trigger_type": "SACRAMENTAL_STATE",
      "trigger_key": "MONSTRANCE_PLACED_IN_CELEBRANT_HANDS",
      "actor_scope": "ALL_FAITHFUL",
      "posture_state": "LOCAL_OR_INHERIT",
      "action_state": "BEGIN_PANGE_LINGUA_OMITTING_LAST_TWO_VERSES",
      "object_state": "BLESSED_SACRAMENT_IN_PROCESSION",
      "personal_state": null,
      "branch_condition": null,
      "evidence_status": "RITUALE_DERIVED_CEREMONIAL",
      "source_locator": "Rituale Romanum Corpus Christi procession; Terry p.135",
      "projection": {
        "simple": "SHOW",
        "follow": "SHOW",
        "live": "SHOW"
      },
      "notes": ""
    },
    {
      "id": "CORPUS-PRC-010",
      "phase": "EUCHARISTIC_PROCESSION",
      "trigger_type": "SACRAMENTAL_STATE",
      "trigger_key": "PROCESSION_ACTIVE",
      "actor_scope": "FAITHFUL_PARTICIPATING",
      "posture_state": "PROCESSIONAL",
      "action_state": "FOLLOW_PROCESSION_JOIN_EUCHARISTIC_HYMNS",
      "object_state": "BLESSED_SACRAMENT_IN_PROCESSION",
      "personal_state": null,
      "branch_condition": null,
      "evidence_status": "RITUALE_DERIVED_CEREMONIAL",
      "source_locator": "Rituale Romanum Corpus Christi procession; Terry p.135",
      "projection": {
        "simple": "SHOW",
        "follow": "SHOW",
        "live": "SHOW"
      },
      "notes": "Other approved Eucharistic hymns may fill a longer procession."
    },
    {
      "id": "CORPUS-RET-010",
      "phase": "BENEDICTION",
      "trigger_type": "SACRAMENTAL_STATE",
      "trigger_key": "BLESSED_SACRAMENT_REPLACED_ON_ALTAR",
      "actor_scope": "ALL_FAITHFUL",
      "posture_state": "LOCAL_REVERENT",
      "action_state": "BEGIN_TANTUM_ERGO",
      "object_state": "BLESSED_SACRAMENT_EXPOSED_AT_ALTAR",
      "personal_state": null,
      "branch_condition": null,
      "evidence_status": "RITUALE_DERIVED_CEREMONIAL",
      "source_locator": "Rituale Romanum Corpus Christi procession; Terry pp.135–136",
      "projection": {
        "simple": "SHOW",
        "follow": "SHOW",
        "live": "SHOW"
      },
      "notes": ""
    },
    {
      "id": "CORPUS-BEN-010",
      "phase": "BENEDICTION",
      "trigger_type": "RITE_STATE",
      "trigger_key": "TANTUM_ERGO_COMPLETE",
      "actor_scope": "ALL_FAITHFUL",
      "posture_state": "LOCAL_REVERENT",
      "action_state": "RESPOND_PANEM_DE_CAELO_AND_PRAYER",
      "object_state": null,
      "personal_state": null,
      "branch_condition": null,
      "evidence_status": "RITUALE_DERIVED_CEREMONIAL",
      "source_locator": "Rituale Romanum / Terry p.136",
      "projection": {
        "simple": "SHOW",
        "follow": "SHOW",
        "live": "SHOW"
      },
      "notes": ""
    },
    {
      "id": "CORPUS-BEN-020",
      "phase": "BENEDICTION",
      "trigger_type": "RITE_STATE",
      "trigger_key": "BENEDICTION_COMPLETE",
      "actor_scope": "ALL",
      "posture_state": "LOCAL_OR_INHERIT",
      "action_state": "EXIT_SPECIAL_GRAPH_TO_LIFECYCLE",
      "object_state": null,
      "personal_state": null,
      "branch_condition": null,
      "evidence_status": "STRUCTURAL_CONTRACT",
      "source_locator": "Corpus Christi procession / Benediction boundary",
      "projection": {
        "simple": "SHOW",
        "follow": "SHOW",
        "live": "SHOW"
      },
      "notes": ""
    }
  ],
  "PROC": [
    {
      "id": "PROC-000-010",
      "phase": "MASS_CONCLUSION",
      "trigger_type": "RITE_STATE",
      "trigger_key": "following_action.type=PROCESSION",
      "actor_scope": "ALL",
      "posture_state": "ORDINARY_PROFILE",
      "action_state": "Resolve Mass ending before procession starts",
      "object_state": null,
      "personal_state": null,
      "branch_condition": null,
      "evidence_status": "CONTROLLING_PRIMARY_STRUCTURE",
      "source_locator": "RG60 §§507–510",
      "projection": {
        "simple": "SHOW",
        "follow": "SHOW",
        "live": "SHOW"
      },
      "notes": "Following action is an independent axis, not a prose note."
    },
    {
      "id": "PROC-000-020",
      "phase": "MASS_CONCLUSION",
      "trigger_type": "RITE_STATE",
      "trigger_key": "PROCESSION_FOLLOWS_IMMEDIATELY",
      "actor_scope": "ALL",
      "posture_state": "ORDINARY_PROFILE",
      "action_state": "Use Benedicamus branch where the controlling rite requires it",
      "object_state": null,
      "personal_state": null,
      "branch_condition": null,
      "evidence_status": "PRIMARY_RULE_RESOLVER",
      "source_locator": "RG60 §§507–510",
      "projection": {
        "simple": "SHOW",
        "follow": "SHOW",
        "live": "SHOW"
      },
      "notes": "Exact feast/form condition remains profile-resolved."
    },
    {
      "id": "PROC-000-030",
      "phase": "MASS_CONCLUSION",
      "trigger_type": "RITE_STATE",
      "trigger_key": "PROCESSION_FOLLOWS_IMMEDIATELY",
      "actor_scope": "ALL",
      "posture_state": "ORDINARY_PROFILE",
      "action_state": "Suppress final blessing where prescribed by ending resolver",
      "object_state": null,
      "personal_state": null,
      "branch_condition": null,
      "evidence_status": "PRIMARY_RULE_RESOLVER",
      "source_locator": "RG60 §§507–510",
      "projection": {
        "simple": "SHOW",
        "follow": "SHOW",
        "live": "SHOW"
      },
      "notes": "Do not hard-code from procession presence alone unless profile says so."
    },
    {
      "id": "PROC-000-040",
      "phase": "MASS_CONCLUSION",
      "trigger_type": "RITE_STATE",
      "trigger_key": "PROCESSION_FOLLOWS_IMMEDIATELY",
      "actor_scope": "ALL",
      "posture_state": "ORDINARY_PROFILE",
      "action_state": "Resolve Last Gospel independently under §510",
      "object_state": null,
      "personal_state": null,
      "branch_condition": null,
      "evidence_status": "PRIMARY_RULE_RESOLVER",
      "source_locator": "RG60 §510",
      "projection": {
        "simple": "SHOW",
        "follow": "SHOW",
        "live": "SHOW"
      },
      "notes": "Some following actions suppress it; not every procession is identical."
    },
    {
      "id": "PROC-100-010",
      "phase": "PROCESSION",
      "trigger_type": "MC_BOUNDARY",
      "trigger_key": "MASS_END_COMPLETE && PROCESSION_START",
      "actor_scope": "FAITHFUL_PARTICIPATING",
      "posture_state": "PROCESSIONAL",
      "action_state": "Enter following-action graph",
      "object_state": null,
      "personal_state": null,
      "branch_condition": null,
      "evidence_status": "STRUCTURAL_CONTRACT",
      "source_locator": "Generic following-action processional contract",
      "projection": {
        "simple": "SHOW",
        "follow": "SHOW",
        "live": "SHOW"
      },
      "notes": "No feast-specific text or posture is invented here."
    },
    {
      "id": "PROC-100-020",
      "phase": "PROCESSION",
      "trigger_type": "RITE_STATE",
      "trigger_key": "PROCESSION_ACTIVE",
      "actor_scope": "FAITHFUL_PARTICIPATING",
      "posture_state": "PROCESSIONAL / LOCAL",
      "action_state": "Follow procession and profile-specific responses",
      "object_state": null,
      "personal_state": null,
      "branch_condition": null,
      "evidence_status": "PROFILE_RESOLVED",
      "source_locator": "Feast/procession proper required",
      "projection": {
        "simple": "SHOW",
        "follow": "SHOW",
        "live": "SHOW"
      },
      "notes": "Corpus Christi proper remains a dedicated profile/source task."
    },
    {
      "id": "PROC-100-030",
      "phase": "PROCESSION",
      "trigger_type": "RITE_STATE",
      "trigger_key": "PROCESSION_COMPLETE",
      "actor_scope": "ALL",
      "posture_state": "LOCAL",
      "action_state": "Exit following-action graph",
      "object_state": null,
      "personal_state": null,
      "branch_condition": null,
      "evidence_status": "STRUCTURAL_CONTRACT",
      "source_locator": "Generic following-action processional contract",
      "projection": {
        "simple": "SHOW",
        "follow": "SHOW",
        "live": "SHOW"
      },
      "notes": "Return to lifecycle, not ordinary MC."
    }
  ],
  "ROG": [
    {
      "id": "ROG-LIT-010",
      "phase": "LITANY",
      "trigger_type": "RITE_STATE",
      "trigger_key": "ROGATION_RITE_START",
      "actor_scope": "FAITHFUL",
      "posture_state": "LOCAL / PROCESSIONAL",
      "action_state": "Join Litany responses",
      "object_state": null,
      "personal_state": null,
      "branch_condition": null,
      "evidence_status": "PRIMARY_RITE",
      "source_locator": "Missale Romanum 1962 — Litaniae maiores/minores",
      "projection": {
        "simple": "SHOW",
        "follow": "SHOW",
        "live": "SHOW"
      },
      "notes": "Separate pre-Mass rite."
    },
    {
      "id": "ROG-LIT-020",
      "phase": "LITANY",
      "trigger_type": "RITE_STATE",
      "trigger_key": "LITANY_ACTIVE",
      "actor_scope": "FAITHFUL",
      "posture_state": "LOCAL / PROCESSIONAL",
      "action_state": "Continue responses",
      "object_state": null,
      "personal_state": null,
      "branch_condition": null,
      "evidence_status": "PRIMARY_RITE",
      "source_locator": "1962 Rogation rite",
      "projection": {
        "simple": "SHOW",
        "follow": "SHOW",
        "live": "SHOW"
      },
      "notes": "No universal kneel/stand command frozen where local processional arrangement governs."
    },
    {
      "id": "ROG-PS-010",
      "phase": "SUPPLICATION",
      "trigger_type": "RITE_STATE",
      "trigger_key": "AFTER_LITANY",
      "actor_scope": "FAITHFUL",
      "posture_state": "LOCAL / STAND",
      "action_state": "Join responses according to rite",
      "object_state": null,
      "personal_state": null,
      "branch_condition": null,
      "evidence_status": "PRIMARY_RITE",
      "source_locator": "1962 Rogation rite",
      "projection": {
        "simple": "SHOW",
        "follow": "SHOW",
        "live": "SHOW"
      },
      "notes": "Text resolver must use full controlled corpus, not abridged donor prose."
    },
    {
      "id": "ROG-PRC-010",
      "phase": "PROCESSION",
      "trigger_type": "RITE_STATE",
      "trigger_key": "ROGATION_PROCESSION_ACTIVE",
      "actor_scope": "FAITHFUL_PARTICIPATING",
      "posture_state": "PROCESSIONAL",
      "action_state": "Walk in procession if participating",
      "object_state": null,
      "personal_state": null,
      "branch_condition": null,
      "evidence_status": "PRIMARY_RITE",
      "source_locator": "1962 Rogation rite",
      "projection": {
        "simple": "SHOW",
        "follow": "SHOW",
        "live": "SHOW"
      },
      "notes": "Actor resolver for non-processors."
    },
    {
      "id": "ROG-END-010",
      "phase": "CONCLUSION",
      "trigger_type": "RITE_STATE",
      "trigger_key": "ROGATION_RITE_COMPLETE",
      "actor_scope": "FAITHFUL",
      "posture_state": "STAND / LOCAL",
      "action_state": "Complete appointed prayers",
      "object_state": null,
      "personal_state": null,
      "branch_condition": null,
      "evidence_status": "PRIMARY_RITE",
      "source_locator": "1962 Rogation rite",
      "projection": {
        "simple": "SHOW",
        "follow": "SHOW",
        "live": "SHOW"
      },
      "notes": "Bridge only when Mass follows immediately."
    },
    {
      "id": "ROG-MASS-010",
      "phase": "MASS_BRIDGE",
      "trigger_type": "MC_BOUNDARY",
      "trigger_key": "ROGATION_RITE_COMPLETE && MASS_FOLLOWS_IMMEDIATELY",
      "actor_scope": "ALL",
      "posture_state": "ORDINARY_PROFILE",
      "action_state": "Set mass.opening_mode=FOOT_CLUSTER_OMITTED; enter at Introit",
      "object_state": null,
      "personal_state": null,
      "branch_condition": null,
      "evidence_status": "CONTROLLING_PRIMARY",
      "source_locator": "RG60 §424",
      "projection": {
        "simple": "SHOW",
        "follow": "SHOW",
        "live": "SHOW"
      },
      "notes": "Do not infer this from Rogation date alone."
    }
  ]
});

  const CORPUS = Object.freeze(SOURCE.CORPUS);
  const PROC = Object.freeze(SOURCE.PROC);
  const ROG = Object.freeze(SOURCE.ROG);

  const norm = value =>
    String(value ?? '')
      .trim()
      .toUpperCase()
      .replace(/[\s-]+/g, '_');

  function followingAction(ctx = {}) {
    const raw =
      ctx.followingAction ??
      ctx.session?.followingAction ??
      ctx.active?.resolvedMass?.followingAction ??
      ctx.settings?.followingAction ??
      ctx.state?.settings?.followingAction ??
      null;

    if (!raw) return null;

    if (typeof raw === 'string') {
      return {
        type: norm(raw),
        profile: null
      };
    }

    return {
      type: norm(raw.type ?? raw.id ?? ''),
      profile:
        raw.profile ??
        raw.processionProfile ??
        null
    };
  }

  function participating(ctx = {}) {
    return (
      ctx.personal?.participatingProcession === true ||
      ctx.participatingProcession === true
    );
  }

  function corpusSelected(ctx = {}) {
    const a = followingAction(ctx);

    return !!a && [
      'CORPUS_PROCESSION',
      'CORPUS_CHRISTI_PROCESSION',
      'EUCHARISTIC_PROCESSION'
    ].includes(a.type);
  }

  function genericProcessionSelected(ctx = {}) {
    const a = followingAction(ctx);

    return !!a && [
      'PROCESSION',
      'GENERIC_PROCESSION',
      'FOLLOWING_PROCESSION'
    ].includes(a.type);
  }

  function rogationSelected(ctx = {}) {
    const raw =
      ctx.preMassRite ??
      ctx.actualPreMassRite ??
      ctx.session?.preMassRite ??
      ctx.active?.resolvedMass?.preMassRite ??
      ctx.settings?.preMassRite ??
      ctx.state?.settings?.preMassRite ??
      null;

    const r = norm(raw?.type ?? raw?.id ?? raw);

    return [
      'ROGATION',
      'ROGATIONS',
      'GREATER_LITANIES',
      'MINOR_LITANIES',
      'LITANIAE_MAIORES',
      'LITANIAE_MINORES'
    ].includes(r);
  }

  function rogationActuallyOccurred(ctx = {}) {
    return (
      ctx.preMassRiteActuallyOccurred === true ||
      ctx.rogationRiteActuallyOccurred === true ||
      ctx.session?.preMassRiteActuallyOccurred === true ||
      ctx.active?.resolvedMass?.preMassRiteActuallyOccurred === true ||
      ctx.settings?.preMassRiteActuallyOccurred === true ||
      ctx.state?.settings?.preMassRiteActuallyOccurred === true
    );
  }

  function massFollowsImmediately(ctx = {}) {
    const v =
      ctx.massFollowsImmediately ??
      ctx.session?.massFollowsImmediately ??
      ctx.active?.resolvedMass?.massFollowsImmediately ??
      ctx.settings?.massFollowsImmediately ??
      ctx.state?.settings?.massFollowsImmediately;

    return v !== false;
  }

  /* ------------------ CORPUS CHRISTI ------------------ */

  function corpusMassEnding(ctx = {}) {
    if (!corpusSelected(ctx)) {
      return Object.freeze({
        active: false,
        useOrdinaryEnding: true
      });
    }

    return Object.freeze({
      active: true,
      dismissal: 'BENEDICAMUS_DOMINO',
      finalBlessing: false,
      lastGospel: false,
      authority: [
        'CORPUS-END-010',
        'CORPUS-END-020',
        'CORPUS-END-030'
      ]
    });
  }

  function corpusSacramentalState(ctx = {}) {
    return norm(
      ctx.sacramentalState ??
      ctx.session?.sacramentalState ??
      ctx.active?.sacramentalState ??
      ctx.state?.sacramentalState ??
      ''
    );
  }

  function corpusCurrentCue(ctx = {}) {
    if (!corpusSelected(ctx))
      return null;

    const state = corpusSacramentalState(ctx);

    if (
      state ===
      'MONSTRANCE_PLACED_IN_CELEBRANT_HANDS'
    ) {
      return Object.freeze({
        eventId: 'CORPUS-EXP-010',
        chant:
          'PANGE_LINGUA_WITHOUT_LAST_TWO_VERSES',
        fabricatedFromClock: false
      });
    }

    if (
      state ===
      'BLESSED_SACRAMENT_REPLACED_ON_ALTAR'
    ) {
      return Object.freeze({
        eventId: 'CORPUS-RET-010',
        chant: 'TANTUM_ERGO',
        fabricatedFromClock: false
      });
    }

    if (
      state === 'PROCESSION_ACTIVE'
    ) {
      return participating(ctx)
        ? Object.freeze({
            eventId: 'CORPUS-PRC-010',
            action:
              'FOLLOW_PROCESSION_JOIN_EUCHARISTIC_HYMNS'
          })
        : Object.freeze({
            eventId: 'CORPUS-PRC-010',
            action:
              'OBSERVE_PROCESSION_NOT_PERSONALLY_PROCESSIONAL'
          });
    }

    if (
      state === 'TANTUM_ERGO_COMPLETE'
    ) {
      return Object.freeze({
        eventId: 'CORPUS-BEN-010',
        action:
          'RESPOND_PANEM_DE_CAELO_AND_PRAYER'
      });
    }

    if (
      state === 'BENEDICTION_COMPLETE'
    ) {
      return Object.freeze({
        eventId: 'CORPUS-BEN-020',
        action:
          'EXIT_SPECIAL_GRAPH_TO_LIFECYCLE'
      });
    }

    return null;
  }

  function projectCorpus(ctx = {}) {
    if (!corpusSelected(ctx))
      return [];

    return CORPUS.filter(e => {
      if (
        e.actor_scope ===
        'FAITHFUL_PARTICIPATING'
      ) {
        return participating(ctx);
      }

      return true;
    });
  }

  /* ------------------ GENERIC PROCESSION ------------------ */

  function processionProfile(ctx = {}) {
    const a = followingAction(ctx);
    return a?.profile ?? null;
  }

  function resolveGenericEnding(ctx = {}) {
    if (!genericProcessionSelected(ctx)) {
      return Object.freeze({
        active: false,
        useOrdinaryEnding: true
      });
    }

    const p = processionProfile(ctx);

    /*
      Generic procession presence does not itself determine
      dismissal / blessing / Last Gospel.
    */
    if (!p) {
      return Object.freeze({
        active: true,
        resolved: false,
        reason:
          'PROCESSION_PROFILE_REQUIRED',
        dismissal: null,
        finalBlessing: null,
        lastGospel: null
      });
    }

    const validBoolOrNull =
      v =>
        v === true ||
        v === false ||
        v == null;

    const dismissal =
      p.dismissal ?? null;

    const finalBlessing =
      p.finalBlessing ?? null;

    const lastGospel =
      p.lastGospel ?? null;

    if (
      !dismissal ||
      !validBoolOrNull(finalBlessing) ||
      !validBoolOrNull(lastGospel)
    ) {
      return Object.freeze({
        active: true,
        resolved: false,
        reason:
          'PROCESSION_ENDING_PROFILE_INCOMPLETE',
        dismissal,
        finalBlessing,
        lastGospel
      });
    }

    return Object.freeze({
      active: true,
      resolved: true,
      dismissal,
      finalBlessing,
      lastGospel,
      authority: [
        'PROC-000-010',
        'PROC-000-020',
        'PROC-000-030',
        'PROC-000-040'
      ]
    });
  }

  function projectGenericProcession(ctx = {}) {
    if (!genericProcessionSelected(ctx))
      return [];

    return PROC.filter(e => {
      if (
        e.actor_scope ===
        'FAITHFUL_PARTICIPATING'
      ) {
        return participating(ctx);
      }

      return true;
    });
  }

  /* ------------------ ROGATIONS ------------------ */

  function projectRogation(ctx = {}) {
    if (
      !rogationSelected(ctx) ||
      !rogationActuallyOccurred(ctx)
    ) {
      return [];
    }

    return ROG.filter(e => {
      if (
        e.actor_scope ===
        'FAITHFUL_PARTICIPATING'
      ) {
        return participating(ctx);
      }

      return true;
    });
  }

  function rogationMassBridge(ctx = {}) {
    if (
      !rogationSelected(ctx) ||
      !rogationActuallyOccurred(ctx) ||
      !massFollowsImmediately(ctx)
    ) {
      return Object.freeze({
        active: false,
        openingMode: 'FULL',
        entry: 'ORDINARY_OPENING'
      });
    }

    return Object.freeze({
      active: true,
      openingMode:
        'FOOT_CLUSTER_OMITTED',
      entry: 'INTROIT',
      authority: 'ROG-MASS-010'
    });
  }

  /* ------------------ MASTER RESOLUTION ------------------ */

  function resolve(ctx = {}) {
    if (corpusSelected(ctx)) {
      return Object.freeze({
        kind:
          'CORPUS_CHRISTI_PROCESSION',
        graph:
          projectCorpus(ctx),
        massEnding:
          corpusMassEnding(ctx),
        currentCue:
          corpusCurrentCue(ctx)
      });
    }

    if (genericProcessionSelected(ctx)) {
      return Object.freeze({
        kind:
          'GENERIC_FOLLOWING_PROCESSION',
        graph:
          projectGenericProcession(ctx),
        massEnding:
          resolveGenericEnding(ctx)
      });
    }

    if (
      rogationSelected(ctx) &&
      rogationActuallyOccurred(ctx)
    ) {
      return Object.freeze({
        kind:
          'ROGATION_LITANIES',
        graph:
          projectRogation(ctx),
        massBridge:
          rogationMassBridge(ctx)
      });
    }

    return null;
  }

  function audit() {
    const corpusIds =
      CORPUS.map(e => e.id);
    const procIds =
      PROC.map(e => e.id);
    const rogIds =
      ROG.map(e => e.id);

    const checks = {
      corpus8:
        CORPUS.length === 8 &&
        new Set(corpusIds).size === 8,

      proc7:
        PROC.length === 7 &&
        new Set(procIds).size === 7,

      rog6:
        ROG.length === 6 &&
        new Set(rogIds).size === 6,

      total21:
        new Set([
          ...corpusIds,
          ...procIds,
          ...rogIds
        ]).size === 21,

      corpusDateInsufficient:
        /date alone is insufficient/i.test(
          CORPUS.find(
            e => e.id === 'CORPUS-END-010'
          )?.notes || ''
        ),

      corpusBenedicamus:
        CORPUS.find(
          e => e.id === 'CORPUS-END-020'
        )?.action_state ===
          'BENEDICAMUS_DOMINO_REPLACES_ITE',

      corpusNoBlessingLastGospel:
        CORPUS.find(
          e => e.id === 'CORPUS-END-030'
        )?.action_state ===
          'SUPPRESS_FINAL_BLESSING_AND_LAST_GOSPEL',

      pangeLinguaSacramentalTrigger:
        CORPUS.find(
          e => e.id === 'CORPUS-EXP-010'
        )?.trigger_key ===
          'MONSTRANCE_PLACED_IN_CELEBRANT_HANDS',

      tantumErgoSacramentalTrigger:
        CORPUS.find(
          e => e.id === 'CORPUS-RET-010'
        )?.trigger_key ===
          'BLESSED_SACRAMENT_REPLACED_ON_ALTAR',

      genericEndingIndependent:
        /not every procession is identical/i.test(
          PROC.find(
            e => e.id === 'PROC-000-040'
          )?.notes || ''
        ),

      genericNoInventedText:
        /No feast-specific text or posture is invented/i.test(
          PROC.find(
            e => e.id === 'PROC-100-010'
          )?.notes || ''
        ),

      genericReturnsLifecycle:
        PROC.find(
          e => e.id === 'PROC-100-030'
        )?.action_state ===
          'Exit following-action graph',

      rogationLocalPosture:
        ROG.find(
          e => e.id === 'ROG-LIT-020'
        )?.posture_state ===
          'LOCAL / PROCESSIONAL',

      rogationParticipantScope:
        ROG.find(
          e => e.id === 'ROG-PRC-010'
        )?.actor_scope ===
          'FAITHFUL_PARTICIPATING',

      rogationImmediateMassBridge:
        /FOOT_CLUSTER_OMITTED/.test(
          ROG.find(
            e => e.id === 'ROG-MASS-010'
          )?.action_state || ''
        ),

      rogationDateInsufficient:
        /Do not infer this from Rogation date alone/i.test(
          ROG.find(
            e => e.id === 'ROG-MASS-010'
          )?.notes || ''
        )
    };

    return Object.freeze({
      version: 'R12',
      counts: {
        CORPUS: CORPUS.length,
        PROC: PROC.length,
        ROG: ROG.length,
        total:
          CORPUS.length +
          PROC.length +
          ROG.length
      },
      checks,
      pass:
        Object.values(checks).every(Boolean)
    });
  }

  AO.ProcessionsR12 =
    Object.freeze({
      version: 'R12',
      authority:
        'v43.73/v43.74_SPECIAL_DAYS_CLOSURE',

      source: SOURCE,

      followingAction,
      corpusSelected,
      genericProcessionSelected,
      rogationSelected,
      rogationActuallyOccurred,

      corpusMassEnding,
      corpusSacramentalState,
      corpusCurrentCue,
      projectCorpus,

      processionProfile,
      resolveGenericEnding,
      projectGenericProcession,

      projectRogation,
      rogationMassBridge,

      resolve,
      audit
    });
})();

/* ========================================================================
   AD ORIENTEM — R13 SERVE / PRACTICE PROJECTION

   Product rule:
   This module DOES NOT define ritual ceremony.
   It projects an already-resolved canonical timeline into a role-specific
   rehearsal lane using only explicit actor / response / bell / special-event
   evidence already attached to the runtime steps.

   It must never:
   - create a minister merely because a form is sung;
   - infer an action from spatial proximity;
   - turn priest actions into server actions;
   - duplicate a Schola-owned response onto servers;
   - import deacon/subdeacon/torchbearer topology into Missa Cantata;
   - create a practice-only ritual sequence detached from the canonical one.
======================================================================== */
(() => {
  'use strict';

  const AO = globalThis.AO = globalThis.AO || {};

  const FORM_TOPOLOGY = Object.freeze({
  "LOW": {
    "label": "Low Mass",
    "roles": {
      "SERVER": "PRIMARY",
      "MC": "OPTIONAL_ASSISTING",
      "ACOLYTE": "SERVER_ROLE_OR_LOCAL",
      "SCHOLA": "NOT_LITURGICAL_RUNTIME",
      "THURIFER": "ABSENT",
      "DEACON": "ABSENT",
      "SUBDEACON": "ABSENT",
      "TORCHBEARER": "ABSENT"
    }
  },
  "MC_SIMPLE": {
    "label": "Missa Cantata \u2014 Simple",
    "roles": {
      "SERVER": "PRIMARY_OR_MC",
      "MC": "ASSISTING",
      "ACOLYTE": "OPTIONAL_EXPLICIT_ONLY",
      "SCHOLA": "CORE_PUBLIC_CLOCK",
      "THURIFER": "ABSENT",
      "DEACON": "ABSENT",
      "SUBDEACON": "ABSENT",
      "TORCHBEARER": "NOT_CANONICAL_RUNTIME"
    }
  },
  "MC_INCENSE": {
    "label": "Missa Cantata \u2014 With Incense",
    "roles": {
      "SERVER": "PRIMARY_OR_MC",
      "MC": "ASSISTING",
      "ACOLYTE": "ACTIVE_AS_RESOLVED",
      "SCHOLA": "CORE_PUBLIC_CLOCK",
      "THURIFER": "ACTIVE",
      "DEACON": "ABSENT",
      "SUBDEACON": "ABSENT",
      "TORCHBEARER": "NOT_CANONICAL_RUNTIME"
    }
  },
  "SOLEMN": {
    "label": "Solemn Mass",
    "roles": {
      "SERVER": "SUPPORT_EXPLICIT_ONLY",
      "MC": "CORE_CEREMONIAL_SUPPORT",
      "ACOLYTE": "ACTIVE",
      "SCHOLA": "CORE_PUBLIC_CLOCK",
      "THURIFER": "ACTIVE",
      "DEACON": "CORE",
      "SUBDEACON": "CORE",
      "TORCHBEARER": "ACTIVE_AS_RESOLVED"
    }
  }
});

  const ROLE_ALIASES = Object.freeze({
    SERVER: [
      'SERVER', 'SERVING_MINISTER', 'MINISTER',
      'ALTAR_SERVER', 'SERVERS', 'MINISTERS'
    ],
    MC: [
      'MC', 'MASTER_OF_CEREMONIES',
      'MASTER CEREMONIES', 'CEREMONIARIUS'
    ],
    ACOLYTE: [
      'ACOLYTE', 'ACOLYTES'
    ],
    SCHOLA: [
      'SCHOLA', 'CANTOR', 'CANTORS', 'CHOIR'
    ],
    THURIFER: [
      'THURIFER'
    ],
    DEACON: [
      'DEACON'
    ],
    SUBDEACON: [
      'SUBDEACON'
    ],
    TORCHBEARER: [
      'TORCHBEARER', 'TORCHBEARERS'
    ]
  });

  const FORBIDDEN_STATUS = new Set([
    'ABSENT',
    'NOT_CANONICAL_RUNTIME',
    'NOT_LITURGICAL_RUNTIME'
  ]);

  const norm = value =>
    String(value ?? '')
      .trim()
      .toUpperCase()
      .replace(/[\s-]+/g, '_');

  function normaliseForm(value) {
    const v = norm(value);

    if ([
      'LOW', 'LOW_MASS', 'LOW_MASS_1962'
    ].includes(v))
      return 'LOW';

    if ([
      'MC_SIMPLE',
      'MISSA_CANTATA_SIMPLE',
      'SIMPLE_NO_INCENSE'
    ].includes(v))
      return 'MC_SIMPLE';

    if ([
      'MC_INCENSE',
      'MISSA_CANTATA_INCENSE',
      'MISSA_CANTATA_WITH_INCENSE',
      'SOLEMNIZED_WITH_INCENSE'
    ].includes(v))
      return 'MC_INCENSE';

    if ([
      'SOLEMN',
      'SOLEMN_MASS',
      'SOLEMN_MASS_1962'
    ].includes(v))
      return 'SOLEMN';

    return null;
  }

  function normaliseRole(value) {
    const v = norm(value);

    for (const [canonical, aliases]
      of Object.entries(ROLE_ALIASES)) {
      if (
        canonical === v ||
        aliases.map(norm).includes(v)
      ) return canonical;
    }

    return null;
  }

  function roleStatus(form, role) {
    const f = normaliseForm(form);
    const r = normaliseRole(role);

    if (!f || !r) return null;

    return FORM_TOPOLOGY[f]
      ?.roles?.[r] ?? null;
  }

  function roleAvailable(form, role) {
    const status = roleStatus(form, role);
    return !!status &&
      !FORBIDDEN_STATUS.has(status);
  }

  function actorMatches(value, role) {
    const r = normaliseRole(role);
    if (!r || value == null) return false;

    if (Array.isArray(value))
      return value.some(v =>
        actorMatches(v, r)
      );

    if (typeof value === 'object') {
      return actorMatches(
        value.actor ??
        value.role ??
        value.actorScope ??
        value.actor_scope ??
        value.owner,
        r
      );
    }

    const raw = norm(value);

    if (r === 'SERVER') {
      return [
        'SERVER',
        'SERVERS',
        'SERVING_MINISTER',
        'ALTAR_SERVER',
        'MINISTER_OR_SERVER',
        'SERVER_OR_ASSISTING_MINISTER'
      ].includes(raw);
    }

    return (
      raw === r ||
      (ROLE_ALIASES[r] || [])
        .map(norm)
        .includes(raw)
    );
  }

  function textOf(value) {
    if (value == null) return null;

    if (typeof value === 'string')
      return value.trim() || null;

    if (Array.isArray(value))
      return value
        .map(textOf)
        .filter(Boolean)
        .join('\n') || null;

    if (typeof value === 'object') {
      return (
        textOf(value.en) ||
        textOf(value.lat) ||
        textOf(value.fr) ||
        textOf(value.text) ||
        null
      );
    }

    return String(value);
  }

  function stepIdentity(step, index) {
    return {
      index,
      id:
        step?.id ??
        step?.objectiveMcPrimary ??
        null,

      canonicalEventRefs:
        Array.isArray(
          step?.canonicalEventRefs
        )
          ? [...step.canonicalEventRefs]
          : [],

      sourceMomentRefs:
        Array.isArray(
          step?.sourceMomentRefs
        )
          ? [...step.sourceMomentRefs]
          : [],

      phase:
        step?.phase ?? null,

      section:
        step?.section ?? null,

      title:
        textOf(step?.title) ||
        String(step?.id ?? 'Event')
    };
  }

  function evidenceItem({
    kind,
    role,
    action = null,
    text = null,
    trigger = null,
    posture = null,
    position = null,
    object = null,
    authority = null,
    source = null,
    raw = null
  }) {
    return {
      kind,
      role,
      action,
      text,
      trigger,
      posture,
      position,
      object,
      authority,
      source,
      raw
    };
  }

  function collectDirectActor(step, role) {
    if (!actorMatches(
      step?.actor ??
      step?.ceremonialActor ??
      step?.actorScope ??
      step?.actor_scope,
      role
    )) return [];

    return [evidenceItem({
      kind: 'DIRECT_ACTOR',
      role,
      action:
        textOf(step?.action_state) ||
        textOf(step?.action) ||
        textOf(step?.subtitle) ||
        textOf(step?.title),

      text:
        textOf(step?.text),

      trigger:
        step?.trigger_key ??
        step?.trigger ??
        null,

      posture:
        textOf(step?.posture?.value) ||
        textOf(step?.posture_state),

      position:
        textOf(
          step?.position ??
          step?.ministerPosition
        ),

      object:
        textOf(
          step?.object_state ??
          step?.objectState
        ),

      authority:
        step?.voiceAuthority ??
        step?.specialAuthority ??
        step?.authority ??
        null,

      source:
        step?.source_locator ??
        null,

      raw: step
    })];
  }

  function collectCeremonialCues(
    step,
    role
  ) {
    const cues = [
      ...(Array.isArray(
        step?.ceremonialCues
      ) ? step.ceremonialCues : []),

      ...(Array.isArray(
        step?.ministerCues
      ) ? step.ministerCues : []),

      ...(Array.isArray(
        step?.actorCues
      ) ? step.actorCues : [])
    ];

    return cues
      .filter(c =>
        actorMatches(
          c?.actor ??
          c?.role ??
          c?.actorScope ??
          c?.actor_scope,
          role
        )
      )
      .map(c =>
        evidenceItem({
          kind: 'CEREMONIAL_CUE',
          role,
          action:
            textOf(c?.action) ||
            textOf(c?.action_state) ||
            textOf(c?.text),

          text:
            textOf(c?.text),

          trigger:
            c?.trigger ??
            c?.trigger_key ??
            null,

          posture:
            textOf(
              c?.posture ??
              c?.posture_state
            ),

          position:
            textOf(
              c?.position ??
              c?.ministerPosition
            ),

          object:
            textOf(
              c?.object ??
              c?.object_state
            ),

          authority:
            c?.authority ??
            step?.authority ??
            null,

          source:
            c?.source ??
            c?.source_locator ??
            null,

          raw: c
        })
      );
  }

  function resolvedResponseOwner(
    step
  ) {
    return (
      step?.responseOwnerResolved ??
      step?.response_owner_resolved ??
      step?.responseOwner ??
      step?.response_owner ??
      null
    );
  }

  function scholaOwnsResponse(step) {
    return (
      step?.scholaSingsResponse === true ||
      step?.choirResponseActive === true ||
      step?.responsePerformedBy ===
        'SCHOLA' ||
      step?.responsePerformedBy ===
        'CHOIR'
    );
  }

  function collectResponses(
    step,
    role,
    form
  ) {
    const r = normaliseRole(role);
    const f = normaliseForm(form);
    const out = [];

    const explicit = [
      ...(Array.isArray(
        step?.responseCues
      ) ? step.responseCues : []),

      ...(Array.isArray(
        step?.responses
      ) ? step.responses : [])
    ];

    for (const c of explicit) {
      if (!actorMatches(
        c?.actor ??
        c?.owner ??
        c?.role,
        r
      )) continue;

      out.push(
        evidenceItem({
          kind: 'RESPONSE',
          role: r,
          action: 'MAKE_RESPONSE',
          text:
            textOf(c?.text) ||
            textOf(c?.response),

          trigger:
            c?.trigger ??
            c?.cue ??
            null,

          authority:
            c?.authority ??
            step?.authority ??
            null,

          source:
            c?.source ??
            null,

          raw: c
        })
      );
    }

    if (out.length)
      return out;

    const owner =
      resolvedResponseOwner(step);

    if (!owner)
      return out;

    const ownerNorm =
      norm(owner);

    if (
      r === 'SERVER' &&
      f !== 'LOW' &&
      (
        ownerNorm.includes('CHOIR') ||
        ownerNorm.includes('SCHOLA')
      )
    ) {
      if (!scholaOwnsResponse(step) &&
          norm(
            step?.responsePerformedBy
          ) === 'SERVER') {
        // Explicit runtime resolution wins.
      } else {
        return out;
      }
    }

    const tokens =
      String(owner)
        .split(/[\/|,;+]/)
        .map(norm)
        .filter(Boolean);

    if (
      !tokens.some(t =>
        actorMatches(t, r)
      )
    ) return out;

    out.push(
      evidenceItem({
        kind: 'RESPONSE_OWNER',
        role: r,
        action: 'MAKE_RESPONSE',
        text:
          textOf(
            step?.responseText
          ) ||
          textOf(
            step?.userResponse
          ) ||
          null,

        trigger:
          step?.responseTrigger ??
          null,

        authority:
          step?.responseAuthority ??
          step?.authority ??
          null,

        raw: {
          owner,
          resolved:
            step?.responseOwnerResolved ??
            null
        }
      })
    );

    return out;
  }

  function collectBell(
    step,
    role
  ) {
    if (
      normaliseRole(role) !==
      'SERVER'
    ) return [];

    const bellId =
      step?.bellId ??
      step?.bell_id ??
      null;

    if (!bellId)
      return [];

    const owner =
      step?.owner ??
      step?.bellOwner ??
      step?.bell_owner ??
      null;

    if (!actorMatches(
      owner,
      'SERVER'
    )) return [];

    return [evidenceItem({
      kind: 'BELL',
      role: 'SERVER',
      action: 'RING_BELL',
      trigger:
        step?.trigger ??
        step?.cueId ??
        step?.id ??
        null,

      text:
        String(bellId),

      authority:
        step?.authority ??
        step?.bellAuthority ??
        null,

      raw: {
        bellId,
        owner
      }
    })];
  }

  function collectSpecialTimeline(
    step,
    role
  ) {
    const timeline =
      Array.isArray(
        step?.specialEventTimeline
      )
        ? step.specialEventTimeline
        : [];

    return timeline
      .filter(e =>
        actorMatches(
          e?.actorScope ??
          e?.actor_scope ??
          e?.actor,
          role
        )
      )
      .map(e =>
        evidenceItem({
          kind: 'SPECIAL_EVENT',
          role:
            normaliseRole(role),

          action:
            textOf(
              e?.action ??
              e?.actionState
            ),

          trigger:
            e?.triggerKey ??
            e?.trigger_key ??
            null,

          posture:
            textOf(e?.posture),

          object:
            textOf(e?.object),

          authority:
            e?.evidence ??
            null,

          source:
            e?.source ??
            null,

          raw: e
        })
      );
  }

  function collectEvidence(
    step,
    role,
    form
  ) {
    return [
      ...collectDirectActor(
        step, role
      ),
      ...collectCeremonialCues(
        step, role
      ),
      ...collectResponses(
        step, role, form
      ),
      ...collectBell(
        step, role
      ),
      ...collectSpecialTimeline(
        step, role
      )
    ];
  }

  function dedupeEvidence(items) {
    const seen = new Set();

    return items.filter(item => {
      const key = JSON.stringify([
        item.kind,
        item.action,
        item.text,
        item.trigger,
        item.posture,
        item.position,
        item.object
      ]);

      if (seen.has(key))
        return false;

      seen.add(key);
      return true;
    });
  }

  function practiceCard(
    step,
    index,
    evidence,
    role,
    form
  ) {
    const id =
      stepIdentity(step, index);

    const refs =
      [
        ...id.canonicalEventRefs,
        ...id.sourceMomentRefs
      ];

    return Object.freeze({
      ...id,

      form:
        normaliseForm(form),

      role:
        normaliseRole(role),

      roleStatus:
        roleStatus(form, role),

      evidence:
        dedupeEvidence(evidence),

      authorityRefs:
        [...new Set(
          evidence.flatMap(e =>
            [
              e.authority,
              e.source
            ].filter(Boolean)
          )
        )],

      canonicalRefs:
        [...new Set(refs)],

      invented:
        false
    });
  }

  function contextCard(
    step,
    index,
    role,
    form
  ) {
    const id =
      stepIdentity(step, index);

    return Object.freeze({
      ...id,
      form:
        normaliseForm(form),
      role:
        normaliseRole(role),
      contextOnly: true,
      instruction: null,
      invented: false
    });
  }

  function project(
    sequence,
    {
      form,
      role,
      includeContext = false,
      contextRadius = 1
    } = {}
  ) {
    const f =
      normaliseForm(
        form ??
        sequence?.objectiveForm ??
        sequence?.form ??
        sequence?.profile
      );

    const r =
      normaliseRole(role);

    if (!f) {
      return Object.freeze({
        status: 'BLOCKED',
        reason:
          'UNKNOWN_FORM',
        cards: []
      });
    }

    if (!r) {
      return Object.freeze({
        status: 'BLOCKED',
        reason:
          'UNKNOWN_ROLE',
        cards: []
      });
    }

    if (!roleAvailable(f, r)) {
      return Object.freeze({
        status: 'BLOCKED',
        reason:
          'ROLE_NOT_AVAILABLE_IN_FORM',
        form: f,
        role: r,
        roleStatus:
          roleStatus(f, r),
        cards: []
      });
    }

    const steps =
      Array.isArray(sequence)
        ? sequence
        : Array.isArray(
            sequence?.steps
          )
        ? sequence.steps
        : [];

    const hits = [];

    steps.forEach((step, index) => {
      if (
        step?.historicalOnly === true ||
        step?.objectiveMcStatus ===
          'HISTORICAL_OVERLAY'
      ) return;

      const evidence =
        collectEvidence(
          step,
          r,
          f
        );

      if (!evidence.length)
        return;

      hits.push({
        index,
        card:
          practiceCard(
            step,
            index,
            evidence,
            r,
            f
          )
      });
    });

    if (!includeContext) {
      return Object.freeze({
        status: 'READY',
        form: f,
        role: r,
        roleStatus:
          roleStatus(f, r),

        sourceStepCount:
          steps.length,

        actionCardCount:
          hits.length,

        cards:
          hits.map(x => x.card),

        projectionPolicy:
          'EXPLICIT_EVIDENCE_ONLY'
      });
    }

    const wanted = new Set();

    for (const hit of hits) {
      for (
        let i =
          Math.max(
            0,
            hit.index -
              contextRadius
          );
        i <=
          Math.min(
            steps.length - 1,
            hit.index +
              contextRadius
          );
        i++
      ) wanted.add(i);
    }

    const byIndex =
      new Map(
        hits.map(x => [
          x.index,
          x.card
        ])
      );

    const cards =
      [...wanted]
        .sort((a, b) => a - b)
        .map(index =>
          byIndex.get(index) ||
          contextCard(
            steps[index],
            index,
            r,
            f
          )
        );

    return Object.freeze({
      status: 'READY',
      form: f,
      role: r,
      roleStatus:
        roleStatus(f, r),

      sourceStepCount:
        steps.length,

      actionCardCount:
        hits.length,

      cards,

      projectionPolicy:
        'EXPLICIT_EVIDENCE_WITH_NONINSTRUCTIONAL_CONTEXT'
    });
  }

  function availableRoles(form) {
    const f =
      normaliseForm(form);

    if (!f) return [];

    return Object.entries(
      FORM_TOPOLOGY[f].roles
    )
      .filter(
        ([, status]) =>
          !FORBIDDEN_STATUS.has(
            status
          )
      )
      .map(
        ([role, status]) => ({
          role,
          status
        })
      );
  }

  function audit() {
    const synthetic = {
      steps: [
        {
          id: 'server-bell',
          actor: 'celebrant',
          bellId: 'AO.SM.BELL005',
          owner:
            'MINISTER_OR_SERVER'
        },
        {
          id: 'choir-response',
          responseOwner:
            'server / choir',
          choirResponseActive:
            true,
          responseText:
            'Et cum spiritu tuo.'
        },
        {
          id: 'deacon-gospel',
          actor: 'DEACON',
          action:
            'PROCLAIM_GOSPEL'
        },
        {
          id: 'mc-cue',
          ceremonialCues: [{
            actor:
              'MASTER_OF_CEREMONIES',
            text:
              'Signal movement'
          }]
        },
        {
          id: 'historical',
          actor: 'SERVER',
          historicalOnly: true,
          action:
            'DO_NOT_PROJECT'
        }
      ]
    };

    const lowServer =
      project(
        synthetic,
        {
          form: 'LOW',
          role: 'SERVER'
        }
      );

    const mcServer =
      project(
        synthetic,
        {
          form: 'MC_SIMPLE',
          role: 'SERVER'
        }
      );

    const solemnDeacon =
      project(
        synthetic,
        {
          form: 'SOLEMN',
          role: 'DEACON'
        }
      );

    const mcDeacon =
      project(
        synthetic,
        {
          form: 'MC_INCENSE',
          role: 'DEACON'
        }
      );

    const mcTorch =
      project(
        synthetic,
        {
          form: 'MC_INCENSE',
          role: 'TORCHBEARER'
        }
      );

    const mcThurifer =
      project(
        synthetic,
        {
          form: 'MC_INCENSE',
          role: 'THURIFER'
        }
      );

    const simpleThurifer =
      project(
        synthetic,
        {
          form: 'MC_SIMPLE',
          role: 'THURIFER'
        }
      );

    const solemnMc =
      project(
        synthetic,
        {
          form: 'SOLEMN',
          role: 'MC'
        }
      );

    const checks = {
      lowServerAllowed:
        lowServer.status ===
          'READY',

      lowServerBell:
        lowServer.cards.some(
          c =>
            c.id ===
              'server-bell' &&
            c.evidence.some(
              e =>
                e.kind ===
                  'BELL'
            )
        ),

      sungChoirResponseNotDuplicated:
        !mcServer.cards.some(
          c =>
            c.id ===
              'choir-response'
        ),

      solemnDeaconAllowed:
        solemnDeacon.status ===
          'READY' &&
        solemnDeacon.cards.some(
          c =>
            c.id ===
              'deacon-gospel'
        ),

      mcDeaconBlocked:
        mcDeacon.status ===
          'BLOCKED',

      mcTorchBlocked:
        mcTorch.status ===
          'BLOCKED',

      mcIncenseThuriferAllowed:
        mcThurifer.status ===
          'READY',

      mcSimpleThuriferBlocked:
        simpleThurifer.status ===
          'BLOCKED',

      mcExplicitOnly:
        solemnMc.cards.length === 1 &&
        solemnMc.cards[0].id ===
          'mc-cue',

      historicalSuppressed:
        !lowServer.cards.some(
          c =>
            c.id ===
              'historical'
        )
    };

    return Object.freeze({
      version: 'R13',
      checks,
      pass:
        Object.values(
          checks
        ).every(Boolean)
    });
  }

  AO.PracticeR13 =
    Object.freeze({
      version: 'R13',
      authority:
        'R01-R12_CANONICAL_RESOLVED_TIMELINE_PROJECTION',

      formTopology:
        FORM_TOPOLOGY,

      normaliseForm,
      normaliseRole,
      roleStatus,
      roleAvailable,
      availableRoles,

      collectEvidence,
      project,
      audit
    });
})();

(()=>{
'use strict';
const AO=window.AO=window.AO||{};
const __mods={};
__mods[4]=function(module,exports,require){

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LANGUAGE_DIR = exports.CALENDAR_SOURCE_URLS = exports.MISSAL_REPO_ROOT = exports.DIVINUM_HORAS_BASE = exports.DIVINUM_MISSA_BASE = exports.MISSAL_BASE = exports.SOURCE_REVISIONS = void 0;
exports.SOURCE_REVISIONS = Object.freeze({
    missaleMeum: "f43359b7a79a5a299158651eedf75cdaf0e43c94",
    divinumOfficium: "126a07f91ede04664108abb6fb20ace3f4de14b9",
});
exports.MISSAL_BASE = `https://raw.githubusercontent.com/mmolenda/missalemeum/${exports.SOURCE_REVISIONS.missaleMeum}/backend/resources/divinum-officium-local/web/www/missa`;
exports.DIVINUM_MISSA_BASE = `https://raw.githubusercontent.com/DivinumOfficium/divinum-officium/${exports.SOURCE_REVISIONS.divinumOfficium}/web/www/missa`;
exports.DIVINUM_HORAS_BASE = `https://raw.githubusercontent.com/DivinumOfficium/divinum-officium/${exports.SOURCE_REVISIONS.divinumOfficium}/web/www/horas`;
exports.MISSAL_REPO_ROOT = `https://raw.githubusercontent.com/mmolenda/missalemeum/${exports.SOURCE_REVISIONS.missaleMeum}`;
exports.CALENDAR_SOURCE_URLS = Object.freeze({
    common: `${exports.MISSAL_REPO_ROOT}/backend/api/constants/common.py`,
    blocks: `${exports.MISSAL_REPO_ROOT}/backend/api/constants/la/blocks.py`,
    titles: `${exports.MISSAL_REPO_ROOT}/backend/api/constants/en/translation.py`,
});
exports.LANGUAGE_DIR = Object.freeze({ la: "Latin", en: "English", fr: "Francais" });


};
__mods[8]=function(module,exports,require){

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProperResolver = void 0;
exports.sectionHeading = sectionHeading;
exports.parseSections = parseSections;
exports.mergeMissing = mergeMissing;
exports.parseReference = parseReference;
exports.parseSubstitutions = parseSubstitutions;
exports.applySubstitutions = applySubstitutions;
exports.cleanLines = cleanLines;
exports.textFrom = textFrom;
exports.numbered = numbered;
exports.ruleInfo = ruleInfo;
exports.normalizeProper = normalizeProper;
const source_config_1 = require(4);
const scripture_config_v21_1 = require(11);
const scripture_refs_v21_1 = require(12);
const PER_DOM = {
    la: "Per Dóminum nostrum Iesum Christum, Fílium tuum: Qui tecum vivit et regnat in unitáte Spíritus Sancti, Deus, per ómnia sǽcula sæculórum. Amen.",
    en: "Through our Lord Jesus Christ, Thy Son, Who liveth and reigneth with Thee in the unity of the Holy Ghost, God, world without end. Amen.",
    fr: "Par Notre-Seigneur Jésus-Christ, votre Fils, qui, étant Dieu, vit et règne avec vous dans l’unité du Saint-Esprit, dans tous les siècles des siècles. Ainsi soit-il.",
};
const GLORIA = {
    la: "Glória Patri, et Fílio, et Spirítui Sancto. Sicut erat in princípio, et nunc, et semper, et in sǽcula sæculórum. Amen.",
    en: "Glory be to the Father, and to the Son, and to the Holy Ghost. As it was in the beginning, is now, and ever shall be, world without end. Amen.",
    fr: "Gloire au Père, au Fils et au Saint-Esprit. Comme il était au commencement, maintenant et toujours, et dans les siècles des siècles. Ainsi soit-il.",
};
const PER_EUNDEM = {
    la: "Per eúndem Dóminum nostrum Jesum Christum Fílium tuum, qui tecum vivit et regnat in unitáte Spíritus Sancti, Deus, per ómnia sǽcula sæculórum. Amen.",
    en: "Through the same Jesus Christ, thy Son, Our Lord, Who liveth and reigneth with thee in the unity of the Holy Ghost, God, world without end. Amen.",
    fr: "Par le même Seigneur Jésus-Christ, votre Fils, qui, étant Dieu, vit et règne avec vous, en l’unité du même Saint-Esprit, dans tous les siècles des siècles. Ainsi soit-il.",
};
const QUI_TECUM = {
    la: "Qui tecum vivit et regnat in unitáte Spíritus Sancti Deus per ómnia sǽcula sæculórum. Amen.",
    en: "Who liveth and reigneth with Thee in the unity of the Holy Ghost, God, world without end. Amen.",
    fr: "Qui, étant Dieu, vit et règne avec vous dans l’unité du Saint-Esprit, dans tous les siècles des siècles. Ainsi soit-il.",
};
const QUI_VIVIS = {
    la: "Qui vivis et regnas cum Deo Patre, in unitáte Spíritus Sancti, Deus, per ómnia sǽcula sæculórum. Amen.",
    en: "Who livest and reignest with God the Father, in the unity of the Holy Spirit, God, world without end. Amen.",
    fr: "Vous qui, étant Dieu, vivez et régnez avec Dieu le Père, dans l’unité du Saint-Esprit, dans tous les siècles des siècles. Ainsi soit-il.",
};
const QUI_CUM_EODEM = {
    la: "Qui cum eódem Deo Patre et Spíritu Sancto vivis et regnas Deus, per ómnia sǽcula sæculórum. Amen.",
    en: "Who, with the same God the Father and the Holy Spirit, live and reign, God forever and ever. Amen.",
    fr: "Vous qui, étant Dieu, vivez et régnez avec le même Dieu le Père et l’Esprit-Saint, dans tous les siècles des siècles. Ainsi soit-il.",
};
function sectionHeading(line) {
    const match = String(line).match(/^\[([^\]]+)\]\s*(.*)$/);
    return match ? { name: match[1].trim(), modifier: (match[2] || "").trim() } : null;
}
function canonicalHeading(name, modifier) {
    const mod = String(modifier || "").toLowerCase();
    if (!mod)
        return { key: name, priority: 1, canonical: true };
    if (mod.includes("sed non rubrica 196"))
        return { key: `${name} ${modifier}`, priority: 0, canonical: false };
    if (mod.includes("rubrica 196") || mod.includes("communi summorum pontificum") || mod.includes("ad missam"))
        return { key: name, priority: 2, canonical: true };
    return { key: `${name} ${modifier}`, priority: 0, canonical: false };
}
function parseSections(text) {
    const lines = String(text || "").replace(/\r\n?/g, "\n").split("\n");
    const map = new Map();
    const order = [];
    const priority = new Map();
    let current = "__TOP__";
    let concat = false;
    map.set(current, []);
    order.push(current);
    priority.set(current, 1);
    for (const raw of lines) {
        const line = raw.trim();
        if (line === "!")
            continue;
        const heading = sectionHeading(line);
        if (heading) {
            const canonical = canonicalHeading(heading.name, heading.modifier);
            current = canonical.key;
            concat = false;
            if (!map.has(current)) {
                map.set(current, []);
                order.push(current);
                priority.set(current, canonical.priority);
            }
            else if (canonical.canonical && canonical.priority > (priority.get(current) || 0)) {
                map.set(current, []);
                priority.set(current, canonical.priority);
            }
            continue;
        }
        if (!map.has(current)) {
            map.set(current, []);
            order.push(current);
            priority.set(current, 1);
        }
        const body = map.get(current);
        if (concat && body.length)
            body[body.length - 1] += line.replace(/~$/, " ");
        else
            body.push(line.replace(/~$/, " "));
        concat = line.endsWith("~");
    }
    for (const body of map.values()) {
        while (body.length && !body[body.length - 1])
            body.pop();
        while (body.length && !body[0])
            body.shift();
    }
    return { map, order };
}
function mergeMissing(primary, fallback) {
    const map = new Map();
    const order = [];
    for (const key of fallback.order) {
        map.set(key, [...(fallback.map.get(key) || [])]);
        order.push(key);
    }
    for (const key of primary.order) {
        if (!map.has(key))
            order.push(key);
        const body = primary.map.get(key) || [];
        if (body.length)
            map.set(key, [...body]);
    }
    return { map, order };
}
function parseReference(line, defaultSection) {
    const value = String(line || "");
    if (!value.startsWith("@"))
        return null;
    const match = value.match(/^@([^:]*)(?::([^:]*))?(?::(.*))?$/);
    if (!match)
        return null;
    return { path: match[1] || "", section: match[2] || defaultSection || "", subs: match[3] || "" };
}
function parseSubstitutions(specification) {
    const out = [];
    let index = 0;
    const text = String(specification || "");
    while (index < text.length) {
        while (text.slice(index, index + 2) === ":s")
            index += 1;
        while (text[index] === ":" || /\s/.test(text[index] || ""))
            index += 1;
        if (text.slice(index, index + 2) !== "s/")
            break;
        index += 2;
        const part = () => {
            let value = "", escaped = false;
            for (; index < text.length; index += 1) {
                const char = text[index];
                if (escaped) {
                    value += `\\${char}`;
                    escaped = false;
                    continue;
                }
                if (char === "\\") {
                    escaped = true;
                    continue;
                }
                if (char === "/") {
                    index += 1;
                    break;
                }
                value += char;
            }
            return value;
        };
        out.push({ from: part(), to: part() });
    }
    return out;
}
function applySubstitutions(lines, specification, diagnostic, context = "reference") {
    let out = [...lines];
    for (const substitution of parseSubstitutions(specification)) {
        try {
            const regex = new RegExp(substitution.from, "g");
            out = out.map(line => line.replace(regex, substitution.to));
        }
        catch (error) {
            diagnostic?.warnings.push(`Substitution skipped in ${context}: ${substitution.from} (${error instanceof Error ? error.message : String(error)})`);
        }
    }
    return out;
}
function usableSourceText(text) {
    return text != null && String(text).trim().length > 2;
}
function cloneParsed(parsed) {
    const map = new Map();
    for (const [key, value] of parsed.map)
        map.set(key, [...value]);
    return { map, order: [...parsed.order], source: parsed.source || null, requestedLanguage: parsed.requestedLanguage || null, translationMissing: !!parsed.translationMissing };
}
function structuralTranslationTemplate(parsed) {
    // Preserve only language-neutral structure from the normalized Latin layer.
    // Literal Latin liturgical prose is intentionally excluded. Reference lines are
    // later resolved against the requested vernacular source; Rule metadata is safe.
    const map = new Map(), order = [];
    for (const key of parsed.order || []) {
        const body = parsed.map.get(key) || [];
        const kept = key === 'Rule' ? [...body] : body.filter(line => !!parseReference(line, key));
        if (!kept.length) continue;
        map.set(key, kept); order.push(key);
    }
    return { map, order, source: parsed.source || null, requestedLanguage: null, translationMissing: false };
}
// v20: exact-source English residual recovery corpus. Scripture is public-domain Douay-Rheims/traditional psalter text;
// proper prayers are taken from identified historical/traditional missal witnesses. No Latin prose is translated at runtime.
const VOTIVE_EMBEDDED_V20 = Object.freeze({
    "en": {
        "HolySpirit2": {
            "Secreta": [
                "We beseech thee, O Lord, that this oblation may cleanse away the stains of our heart, that it may be made a worthy habitation of the Holy Ghost.",
                "$Per Dominum"
            ],
            "Postcommunio": [
                "Grant, we beseech Thee, Almighty God, that we may so please Thy Holy Spirit by our earnest entreaties, that we may by His grace both be freed from all temptations and merit to receive the forgiveness of our sins.",
                "$Per Dominum"
            ]
        },
        "Cross": {
            "Oratio": [
                "! Extra tempus paschale",
                "O God, who didst vouchsafe to sanctify the standard of the life-giving cross by the precious blood of thy only-begotten Son; grant, we beseech thee, that those who rejoice in the honour of the same holy cross may also rejoice everywhere in thy protection.",
                "$Per eundem",
                "",
                "! Tempore paschali",
                "O God, who didst will that thy Son should undergo for us the ignominy of the cross to deliver us from the power of the enemy: grant to us thy servants that we may obtain the grace of his resurrection.",
                "$Per eundem"
            ],
            "Lectio": [
                "A lesson from the Epistle of St Paul the Apostle to the Philippians.",
                "!Phil 2:8-11",
                "Brethren: Christ became for us obedient unto death, even the death of the cross. Wherefore God also hath exalted him, and hath given him a name, which is above every name: (here all kneel), that in the name of Jesus every knee should bow, of those that are in heaven, on earth, and under the earth; and that every tongue should confess that the Lord Jesus Christ is in the glory of God the Father."
            ],
            "GradualeP": [
                "! Tempore paschali",
                "Alleluia, alleluia.",
                "!Ps 95:10",
                "V. Say ye among the gentiles, that the Lord hath reigned from the wood. Alleluia.",
                "V. Sweet the wood, sweet the nails, sweet the load that hangs on thee: thou only wast worthy to bear the King and Lord of heaven. Alleluia."
            ],
            "Tractus": [
                "We adore thee, O Christ, and we bless thee: because by thy cross thou hast redeemed the world.",
                "V. We adore thy cross, O Lord, we commemorate thy glorious passion: have mercy on us, thou who didst suffer for us.",
                "V. O blessed cross, which alone wert worthy to bear the king of heaven and the Lord."
            ],
            "Secreta": [
                "May this oblation, we beseech thee, O Lord, cleanse us from all sins: even as on the altar of the cross it took away the sins of the whole world.",
                "$Per eundem"
            ],
            "Postcommunio": [
                "Be nigh unto us, O Lord our God; and defend those by the perpetual defence of the cross whom thou makest to rejoice in its honour.",
                "$Per Dominum"
            ]
        },
        "Propagation": {
            "Introitus": [
                "!Ps 66:2-3",
                "May God have mercy upon us, and bless us: may He cause the light of His countenance to shine upon us, and may He have mercy upon us: that we may know Thy way upon earth, Thy salvation in all nations. (T. P. Alleluia, alleluia.)",
                "!Ps 66:4",
                "Let the people confess to Thee, O God: let all people give praise to Thee.",
                "&Gloria",
                "May God have mercy upon us, and bless us: may He cause the light of His countenance to shine upon us, and may He have mercy upon us: that we may know Thy way upon earth, Thy salvation in all nations. (T. P. Alleluia, alleluia.)"
            ],
            "Lectio": [
                "Lesson from the book of Ecclesiasticus.",
                "!Eccli 36:1-10,17-19",
                "Have mercy upon us, O God of all, and behold us, and shew us the light of thy mercies: And send thy fear upon the nations, that have not sought after thee: that they may know that there is no God beside thee, and that they may shew forth thy wonders. Lift up thy hand over the strange nations, that they may see thy power. For as thou hast been sanctified in us in their sight, so thou shalt be magnified among them in our presence, That they may know thee, as we also have known thee, that there is no God beside thee, O Lord. Renew thy signs, and work new miracles. Glorify thy hand, and thy right arm. Raise up indignation, and pour out wrath. Take away the adversary, and crush the enemy. Hasten the time, and remember the end, that they may declare thy wonderful works. Give testimony to them that are thy creatures from the beginning, and raise up the prophecies which the former prophets spoke in thy name. Reward them that patiently wait for thee, that thy prophets may be found faithful: and hear the prayers of thy servants, According to the blessing of Aaron over thy people, and direct us into the way of justice, and let all know that dwell upon the earth, that thou art God the beholder of all ages."
            ],
            "Graduale": [
                "!Ps 66:6-8",
                "Let people confess to Thee, O God: let all people give praise to Thee: the earth hath yielded her fruit.",
                "V. May God, our God, bless us, may God bless us: and all the ends of the earth fear Him. Alleluia, alleluia.",
                "!Ps 99:1",
                "V. Sing joyfully to God, all the earth: serve ye the Lord with gladness: come in before His presence with exceeding great joy. Alleluia."
            ],
            "GradualeP": [
                "! Tempore paschali",
                "Alleluia, alleluia.",
                "!Ps 99:1-2",
                "V. Sing joyfully to God, all the earth: serve ye the Lord with gladness: come in before His presence with exceeding great joy. Alleluia.",
                "V. Know ye that the Lord He is God: He made us, and not we ourselves. Alleluia."
            ],
            "Tractus": [
                "!Ps 95:3-5",
                "Declare His glory among the Gentiles: His wonders among all people.",
                "V. For the Lord is great, and exceedingly to be praised: He is to be feared above all gods.",
                "V. For all the gods of the Gentiles are devils: but the Lord made the heavens."
            ],
            "Evangelium": [
                "Continuation of the Holy Gospel according to Matthew.",
                "!Matt 9:35-38",
                "At that time, Jesus went about all the cities and towns, teaching in their synagogues, and preaching the gospel of the kingdom, and healing every disease, and every infirmity. And seeing the multitudes, He had compassion on them: because they were distressed, and lying like sheep that have no shepherd. Then He saith to His disciples: The harvest indeed is great, but the labourers are few. Pray ye therefore the Lord of the harvest, that He send forth labourers into His harvest."
            ],
            "Offertorium": [
                "!Ps 95:7-9",
                "Bring unto the Lord, O ye kindreds of the Gentiles, bring unto the Lord glory and honour, bring unto the Lord glory unto His name: bring up sacrifices, and come into His courts: adore ye the Lord in His holy court. (T. P. Alleluia.)"
            ],
            "Communio": [
                "!Ps 116:1-2",
                "Praise the Lord, all ye nations: praise Him, all ye people: for His mercy is confirmed upon us; and the truth of the Lord remaineth for ever. (T. P. Alleluia.)"
            ]
        },
        "Passion": {
            "Introitus": [
                "!Phil 2:8-9",
                "The Lord Jesus Christ humbled himself unto death, even the death of the cross; wherefore God also exalted him and hath given him a name which is above every name. (T. P. Alleluia, alleluia.)",
                "!Ps 88:2",
                "The mercies of the Lord I will sing for ever: to generation and generation.",
                "&Gloria",
                "The Lord Jesus Christ humbled himself unto death, even the death of the cross; wherefore God also exalted him and hath given him a name which is above every name. (T. P. Alleluia, alleluia.)"
            ],
            "Oratio": [
                "O Lord Jesus Christ, who out of the bosom of the Father didst descend from heaven to earth, and didst shed Thy most precious blood for the remission of our sins; we humbly beseech Thee, that in the day of judgment we may be found worthy to stand at Thy right hand, and to hear Thee say unto us, Come, ye blessed.",
                "$Qui cum eodem"
            ],
            "Lectio": [
                "Lesson from the Prophet Zacharias.",
                "!Zach 12:10-12; 13:6-7",
                "Thus saith the Lord: I will pour out upon the house of David, and upon the inhabitants of Jerusalem, the spirit of grace, and of prayers: and they shall look upon me, whom they have pierced: and they shall mourn for him as one mourneth for an only son, and they shall grieve over him as the manner is to grieve for the death of the firstborn. In that day there shall be a great lamentation in Jerusalem, and it shall be said: What are these wounds in the midst of thy hands? And he shall say: With these I was wounded in the house of them that loved me. Awake, O sword, against my shepherd, and against the man that cleaveth to me, saith the Lord of hosts: strike the shepherd, and the sheep shall be scattered, saith the Lord Almighty."
            ],
            "Graduale": [
                "!Ps 68:21-22",
                "My heart hath expected reproach and misery: and I looked for one that would grieve together with me, and there was none: I sought one that would comfort me and I found none.",
                "V. They gave me gall for my food, and in my thirst they gave me vinegar to drink. Alleluia, alleluia.",
                "V. Hail, Thou our King: Thou alone hast had compassion on our errors; obedient to the Father, Thou wert led to be crucified like a meek lamb to the slaughter. Alleluia."
            ],
            "GradualeP": [
                "! Tempore paschali",
                "Alleluia, alleluia.",
                "V. Hail, Thou our King: Thou alone hast had compassion on our errors; obedient to the Father, Thou wert led to be crucified like a meek lamb to the slaughter. Alleluia.",
                "V. To Thee be glory, hosanna: to Thee be triumph and victory: to Thee a crown of highest praise and honour. Alleluia."
            ],
            "Tractus": [
                "!Isa 53:4-5",
                "Surely He hath borne our infirmities, and carried our sorrows.",
                "V. And we have thought Him as it were a leper, and as one struck by God and afflicted.",
                "V. But He was wounded for our iniquities, He was bruised for our sins.",
                "V. The chastisement of our peace was upon Him: and by His bruises we are healed."
            ],
            "Evangelium": [
                "Continuation of the Holy Gospel according to John.",
                "!Joann 19:28-35",
                "At that time, Jesus knowing that all things were now accomplished, that the scripture might be fulfilled, said: I thirst. Now there was a vessel set there full of vinegar. And they putting a sponge full of vinegar about hyssop, put it to his mouth. Jesus therefore when he had taken the vinegar said: It is consummated. And bowing his head, he gave up the ghost. Then the Jews, because it was the parasceve, that the bodies might not remain on the cross on the sabbath-day, for that was a great sabbath-day, besought Pilate that their legs might be broken, and that they might be taken away. The soldiers therefore came: and they broke the legs of the first, and of the other that was crucified with him. But after they were come to Jesus, when they saw that he was already dead, they did not break his legs. But one of the soldiers with a spear opened his side, and immediately there came out blood and water. And he that saw it hath given testimony, and his testimony is true."
            ],
            "Offertorium": [
                "Wicked men rose up against me: without mercy they sought to kill me: and they did not spare to spit in my face: they wounded me with their spears, and all my bones were shaken. (T. P. Alleluia.)"
            ],
            "Secreta": [
                "In virtue of the pleading of the Passion of thine only-begotten Son, may the sacrifice we offer to thee, O Lord, quicken us and strengthen us.",
                "$Qui tecum"
            ],
            "Communio": [
                "!Ps 21:17-18",
                "They have dug my hands and feet; they have numbered all my bones. (T. P. Alleluia.)"
            ],
            "Postcommunio": [
                "O Lord Jesus Christ, Son of the living God, who, at the sixth hour, didst mount the tree of the cross to redeem the world, and didst shed thy precious blood for the washing away of our sins, we humbly beseech thee that, after our death, it may be ours, with joy, to pass through the gates of paradise.",
                "$Qui vivis"
            ]
        },
        "Unity": {
            "Introitus": [
                "!Ps 105:47",
                "Save us, O Lord our God: and gather us from among the nations: that we may give thanks unto Thy holy name: and may glory in Thy praise. (T. P. Alleluia, alleluia.)",
                "!Ps 105:1",
                "Give glory to the Lord, for He is good: for His mercy endureth for ever.",
                "&Gloria",
                "Save us, O Lord our God: and gather us from among the nations: that we may give thanks unto Thy holy name: and may glory in Thy praise. (T. P. Alleluia, alleluia.)"
            ],
            "Oratio": [
                "O God, who settest straight what has gone astray, and gatherest together what is scattered, and keepest what Thou hast gathered together: we beseech Thee in Thy mercy to pour down on Christian people the grace of union with Thee, that, putting disunion aside and joining themselves to the true Shepherd of Thy Church, they may be able to render Thee worthy service.",
                "$Per Dominum"
            ],
            "Lectio": [
                "Lesson from the Epistle of blessed Paul the Apostle to the Ephesians.",
                "!Eph 4:1-7; 13-21",
                "Brethren: I therefore, a prisoner in the Lord, beseech you that you walk worthy of the vocation in which you are called, with all humility and mildness, with patience, supporting one another in charity, careful to keep the unity of the Spirit in the bond of peace. One body and one Spirit; as you are called in one hope of your calling. One Lord, one faith, one baptism. One God and Father of all, who is above all, and through all, and in us all. But to every one of us is given grace, according to the measure of the giving of Christ. Until we all meet into the unity of faith, and of the knowledge of the Son of God, unto a perfect man, unto the measure of the age of the fulness of Christ; that henceforth we be no more children tossed to and fro, and carried about with every wind of doctrine by the wickedness of men, by cunning craftiness, by which they lie in wait to deceive. But doing the truth in charity, we may in all things grow up in him who is the head, even Christ: from whom the whole body, being compacted and fitly joined together, by what every joint supplieth, according to the operation in the measure of every part, maketh increase of the body, unto the edifying of itself in charity. This then I say and testify in the Lord: that henceforward you walk not as also the Gentiles walk in the vanity of their mind, having their understanding darkened, being alienated from the life of God through the ignorance that is in them, because of the blindness of their hearts. Who despairing, have given themselves up to lasciviousness, unto the working of all uncleanness, unto covetousness. But you have not so learned Christ; if so be that you have heard him, and have been taught in him, as the truth is in Jesus."
            ],
            "Graduale": [
                "!Ps 121:6-7",
                "Pray ye for the things that are for the peace of Jerusalem: and abundance for them that love Thee.",
                "V. Let peace be in Thy strength: and abundance in thy towers. Alleluia, alleluia.",
                "!Ps 147:12",
                "V. Praise the Lord, O Jerusalem: praise thy God, O Sion. Alleluia."
            ],
            "GradualeP": [
                "! Tempore paschali",
                "Alleluia, alleluia.",
                "!Ps 147:12,14",
                "V. Praise the Lord, O Jerusalem: praise thy God, O Sion. Alleluia.",
                "V. Who hath placed peace in thy borders: and filleth thee with the fat of corn. Alleluia."
            ],
            "Tractus": [
                "!Ps 75:2-4",
                "In Judea God is known: His name is great in Israel.",
                "V. And His place is in peace: and His abode in Sion.",
                "V. There hath He broken the powers of bows, the shield, the sword and the battle."
            ],
            "Evangelium": [
                "Continuation of the Holy Gospel according to John.",
                "!Joann 17:1,11-23",
                "At that time, Jesus lifting up His eyes to heaven, said: Holy Father, keep them in Thy name whom Thou hast given me; that they may be one, as we also are. While I was with them, I kept them in Thy name. Those whom Thou gavest me have I kept; and none of them is lost, but the son of perdition, that the scripture may be fulfilled. And now I come to Thee; and these things I speak in the world, that they may have my joy filled in themselves. I have given them Thy word, and the world hath hated them, because they are not of the world; as I also am not of the world. I pray not that Thou shouldst take them out of the world, but that Thou shouldst keep them from evil. They are not of the world, as I also am not of the world. Sanctify them in truth. Thy word is truth. As Thou hast sent me into the world, I also have sent them into the world. And for them do I sanctify myself, that they also may be sanctified in truth. And not for them only do I pray, but for them also who through their word shall believe in me; that they all may be one, as Thou, Father, in me, and I in Thee; that they also may be one in us; that the world may believe that Thou hast sent me. And the glory which Thou gavest me, I have given to them; that they may be one, as we also are one. I in them, and Thou in me; that they may be made perfect in one."
            ],
            "Offertorium": [
                "!Rom 15:5-6",
                "God grant you to be of one mind one towards another: that with one mind and one mouth you may honour our God. (T. P. Alleluia.)"
            ],
            "Secreta": [
                "Hallow these gifts which we offer to Thee, O Lord, for union among the Christian people: and by their means grant us the grace of unity and peace within Thy Church.",
                "$Per Dominum"
            ],
            "Communio": [
                "!1 Cor 10:17",
                "We being many are one bread and one body, all that partake of one bread and of one chalice. (T. P. Alleluia.)"
            ],
            "Postcommunio": [
                "Even as this Thy holy Communion, which we have taken, shows forth the union of the faithful in Thee, O Lord: so, we beseech Thee, may it bring about the fruit of unity in Thy Church.",
                "$Per Dominum"
            ]
        }
    }
});

const VOTIVE_EXTERNAL_VERIFIED_V423 = Object.freeze({
    'Votive/Cross': Object.freeze({
        en: Object.freeze({
            Oratio: Object.freeze([
                '! Outside Eastertide',
                'O God, who didst vouchsafe to sanctify the standard of the life-giving cross by the precious blood of thy only-begotten Son; grant, we beseech thee, that those who rejoice in the honour of the same holy cross may also rejoice everywhere in thy protection. Through the same Lord.',
                '! In Eastertide',
                'O God, who didst will that thy Son should undergo for us the ignominy of the cross to deliver us from the power of the enemy: grant to us thy servants that we may obtain the grace of his resurrection. Through the same Lord.'
            ]),
            Tractus: Object.freeze([
                'We adore thee, O Christ, and we bless thee: because by thy cross thou hast redeemed the world.',
                'V. We adore thy cross, O Lord, we commemorate thy glorious passion: have mercy on us, thou who didst suffer for us.',
                'V. O blessed cross, which alone wert worthy to bear the king of heaven and the Lord.'
            ]),
            Secreta: Object.freeze([
                'May this oblation, we beseech thee, O Lord, cleanse us from all sins: even as on the altar of the cross it took away the sins of the whole world. Through the same Lord.'
            ]),
            Postcommunio: Object.freeze([
                'Be nigh unto us, O Lord our God; and defend those by the perpetual defence of the cross whom thou makest to rejoice in its honour. Through our Lord.'
            ])
        }),
        fr: Object.freeze({
            Oratio: Object.freeze([
                '! Extra tempus paschale',
                "Ô Dieu, qui avez voulu rendre saint, par le précieux Sang de votre Fils Unique, l'étendard de la vivifiante Croix ; accordez-nous, nous vous en supplions, que ceux qui se réjouissent d'honorer cette même sainte Croix, puissent aussi partout se réjouir de votre protection.",
                '$Per eundem',
                '! Tempore paschali',
                "Ô Dieu, qui avez voulu que votre Fils fût attaché pour nous au gibet de la Croix, afin de nous délivrer de la puissance de l'ennemi : accordez à nous, vos serviteurs, la grâce de parvenir à la gloire de la résurrection.",
                '$Per eundem'
            ]),
            Tractus: Object.freeze([
                '! Post Septuagesimam',
                "Nous vous adorons, ô Christ. Et nous vous bénissons. Car par votre Croix, vous avez racheté le monde.",
                "V. Nous adorons votre Croix, Seigneur, et nous honorons le souvenir de votre glorieuse passion. O vous ! qui avez souffert pour nous. Seigneur, ayez pitié de nous.",
                "V. O Croix bénie, qui seule as été digne de porter le Roi des cieux, le Seigneur."
            ]),
            Secreta: Object.freeze([
                "Que cette offrande, nous t’en supplions, Seigneur, nous purifie de toutes nos fautes, puisque sur l’autel de la croix le Christ a enlevé le péché du monde entier.",
                '$Per eundem'
            ]),
            Postcommunio: Object.freeze([
                "Soyez présent, Seigneur, notre Dieu : et ceux que vous avez rendu heureux par l’honneur de la sainte Croix, défendez-les aussi par ses secours perpétuels.",
                '$Per Dominum'
            ])
        })
    }),
    'Votive/HolySpirit2': Object.freeze({
        en: Object.freeze({
            Secreta: Object.freeze([
                'May this oblation, O Lord, wash away all stain of sin from our hearts, that they may become a worthy dwelling-place of the Holy Ghost. Through our Lord Jesus Christ, Thy Son, Who with Thee liveth and reigneth in the unity of the same Holy Ghost, God, world without end. Amen.'
            ]),
            Postcommunio: Object.freeze([
                'Grant, we beseech Thee, Almighty God, that we may so please Thy Holy Spirit by our earnest entreaties, that we may by His grace both be freed from all temptations and merit to receive the forgiveness of our sins. Through Christ our Lord. Amen.'
            ])
        })
    })
});
globalThis.AO_VOTIVE_EXTERNAL_VERIFIED_V423 = VOTIVE_EXTERNAL_VERIFIED_V423;

// v17: same-language historical recovery for votive-specific vernacular gaps.
// These recoveries never translate Latin prose. They reuse exact English/French
// material already present in the pinned Divinum Officium corpus and apply only
// structural/seasonal edits that are explicit in the normalized Latin votive source.
// v21: source-defensible French supplementary recovery layer.
// Long non-Psalm readings are fetched from the app's existing pinned public-domain
// Crampon 1923 corpus. Liturgical Psalm verses remain on the pinned Divinum Officium
// French Psalter so Vulgate numbering and traditional liturgical segmentation are preserved.
const VOTIVE_FR_TEXT_V21 = Object.freeze({
    Vocations: Object.freeze({
        Oratio: [
            "Envoyez, Seigneur, des ouvriers à votre moisson, afin que les commandements de votre Fils unique soient toujours observés et que le sacrifice soit renouvelé en tout lieu.",
            "$Qui tecum"
        ],
        Secreta: [
            "Faites, Seigneur, du don que nous vous offrons un sacrement de vie pour votre peuple, afin qu’autour de votre autel des ministres plus nombreux vous présentent les prières et l’offrande.",
            "$Per Dominum"
        ],
        Postcommunio: [
            "Comblés des mystères célestes, nous vous demandons, Dieu tout-puissant, d’augmenter le nombre de vos ministres et de les sanctifier dans la charité.",
            "$Per Dominum"
        ]
    }),
    Angels: Object.freeze({
        Communio: [
            "Anges, Archanges, Trônes et Dominations, Principautés et Puissances, Vertus des cieux, Chérubins et Séraphins, bénissez le Seigneur à jamais. (T. P. Alléluia.)"
        ],
        Postcommunio: [
            "Comblés de votre bénédiction céleste, Seigneur, nous vous supplions : que cette célébration accomplie dans notre faiblesse nous obtienne le secours des saints Anges et Archanges.",
            "$Per Dominum"
        ]
    }),
    Cross: Object.freeze({
        Oratio: [
            "! Extra tempus paschale",
            "Ô Dieu, qui avez voulu sanctifier l’étendard vivifiant de la Croix par le sang précieux de votre Fils unique, accordez à ceux qui se réjouissent de l’honneur de cette sainte Croix de se réjouir aussi partout de votre protection.",
            "$Per eundem",
            "",
            "! Tempore paschali",
            "Ô Dieu, qui avez voulu que votre Fils souffrît pour nous le supplice de la Croix, afin de nous délivrer de la puissance de l’ennemi ; accordez à vos serviteurs la grâce d’avoir part à sa résurrection.",
            "$Per eundem"
        ],
        Tractus: [
            "Nous vous adorons, ô Christ, et nous vous bénissons : car par votre Croix vous avez racheté le monde.",
            "V. Nous adorons votre Croix, Seigneur, nous vénérons votre glorieuse Passion ; ayez pitié de nous, vous qui avez souffert pour nous.",
            "V. Ô Croix bénie, qui seule as été digne de porter le Roi des cieux, le Seigneur."
        ],
        Secreta: [
            "Que cette offrande, Seigneur, nous purifie de toute faute, elle qui, sur l’autel de la Croix, a ôté le péché du monde entier.",
            "$Per eundem"
        ]
    }),
    Propagation: Object.freeze({
        Oratio: [
            "Ô Dieu, qui voulez que tous les hommes soient sauvés et parviennent à la connaissance de la vérité, envoyez des ouvriers à votre moisson et donnez-leur d’annoncer votre parole avec pleine assurance, afin que votre parole se répande et soit glorifiée, et que toutes les nations vous connaissent, vous le seul vrai Dieu, et Jésus-Christ, votre Fils, que vous avez envoyé, notre Seigneur.",
            "$Qui tecum"
        ],
        Secreta: [
            "Ô Dieu notre protecteur, regardez la face de votre Christ, qui s’est donné lui-même en rançon pour tous ; faites que, du levant au couchant, votre nom soit glorifié parmi les nations et qu’en tout lieu une offrande pure soit sacrifiée et présentée à votre nom.",
            "$Per eundem"
        ],
        Postcommunio: [
            "Fortifiés par le don de notre rédemption, nous vous demandons, Seigneur, que par ce secours de salut éternel la vraie foi progresse sans cesse.",
            "$Per Dominum"
        ]
    }),
    EternalPriest: Object.freeze({
        Oratio: [
            "Ô Dieu, qui, pour la gloire de votre majesté et le salut du genre humain, avez établi votre Fils unique souverain et éternel Prêtre : faites que ceux qu’il a choisis comme ministres et dispensateurs de ses mystères soient trouvés fidèles dans l’accomplissement du ministère reçu.",
            "$Per eundem"
        ],
        Secreta: [
            "Que Jésus-Christ, notre médiateur, vous rende agréables ces dons, Seigneur, et qu’avec lui il nous présente nous-mêmes comme une offrande qui vous plaise.",
            "$Qui tecum"
        ],
        Postcommunio: [
            "Que l’offrande divine que nous avons présentée et reçue nous donne la vie, Seigneur ; unis à vous par une charité durable, puissions-nous porter un fruit qui demeure toujours.",
            "$Per Dominum"
        ]
    }),
    Passion: Object.freeze({
        Oratio: [
            "Seigneur Jésus-Christ, qui êtes descendu du ciel sur la terre, du sein du Père, et avez répandu votre précieux Sang pour la rémission de nos péchés : nous vous supplions humblement de nous faire entendre au jour du jugement, à votre droite : « Venez, les bénis de mon Père ».",
            "$Qui cum eodem"
        ],
        AveRex: "V. Salut, notre Roi : vous seul avez eu pitié de nos égarements ; obéissant au Père, vous avez été conduit à la croix comme un agneau doux à l’immolation. Alléluia.",
        GloriaHosanna: "V. À vous gloire, Hosanna : à vous triomphe et victoire ; à vous louange suprême et couronne d’honneur. Alléluia.",
        Offertorium: [
            "Des hommes iniques se sont dressés contre moi : sans miséricorde ils ont cherché à me faire mourir ; ils n’ont pas épargné de cracher à mon visage ; de leurs lances ils m’ont blessé, et tous mes os ont été ébranlés. (T. P. Alléluia.)"
        ],
        Secreta: [
            "Que le sacrifice qui vous est offert, Seigneur, par l’intercession de la Passion de votre Fils unique, nous vivifie et nous protège toujours.",
            "$Per eundem"
        ],
        Postcommunio: [
            "Seigneur Jésus-Christ, Fils du Dieu vivant, qui à la sixième heure êtes monté sur le gibet de la Croix pour la rédemption du monde et avez répandu votre précieux Sang pour la rémission de nos péchés : nous vous supplions humblement de nous accorder, après notre mort, d’entrer avec joie par les portes du paradis.",
            "$Qui vivis"
        ]
    }),
    Trinity: Object.freeze({
        GradualeP: [
            "! Tempore paschali",
            "Alléluia, alléluia.",
            "!Dan 3:52",
            "V. Vous êtes béni, Seigneur, Dieu de nos pères, et digne de louange dans les siècles. Alléluia.",
            "V. Bénissons le Père et le Fils avec le Saint-Esprit. Alléluia."
        ],
        Tractus: [
            "C’est Vous, ô Dieu, Père non engendré, Vous, son Fils unique, Vous, Esprit-Saint Consolateur, ô sainte et indivisible Trinité, c’est Vous que de tout cœur et de bouche nous confessons, nous louons et nous bénissons.",
            "V. Car Vous êtes grand, et Vous faites des prodiges ; Vous seul êtes Dieu.",
            "V. À vous toute louange, toute gloire, toute action de grâces dans les siècles des siècles, ô bienheureuse Trinité."
        ]
    }),
    Unity: Object.freeze({
        Oratio: [
            "Seigneur Dieu, vous qui corrigez les erreurs, rassemblez les dispersés et gardez ceux qui ont été rassemblés, nous vous en prions : dans votre bonté répandez sur le peuple chrétien la grâce de votre union. Ainsi, toute division rejetée, il s’unira au vrai pasteur de votre Église et pourra vous servir dignement.",
            "$Per Dominum"
        ],
        Secreta: [
            "Sanctifiez, Seigneur, ces dons que nous vous offrons pour l’unité du peuple chrétien, et accordez-nous par eux les dons de l’unité et de la paix dans votre Église.",
            "$Per Dominum"
        ],
        Postcommunio: [
            "Que cette sainte communion reçue de vous, Seigneur, comme elle signifie l’union des fidèles en vous, réalise aussi dans votre Église l’œuvre de l’unité.",
            "$Per Dominum"
        ]
    }),
    Pestilence: Object.freeze({
        Oratio: [
            "Ô Dieu, qui ne désirez pas la mort mais la conversion des pécheurs, ramenez avec bonté votre peuple vers vous ; lorsqu’il vous sera dévoué, éloignez de lui avec clémence les fléaux de votre colère.",
            "$Per Dominum"
        ],
        Secreta: [
            "Que l’offrande du présent sacrifice nous vienne en aide, Seigneur ; qu’elle nous délivre puissamment de tout égarement et nous arrache à toute perdition.",
            "$Per Dominum"
        ],
        Postcommunio: [
            "Exaucez-nous, Dieu notre Sauveur : délivrez votre peuple des terreurs de votre colère et donnez-lui la sécurité par l’abondance de votre miséricorde.",
            "$Per Dominum"
        ]
    })
});
const VOTIVE_FR_PATHS_V21 = new Set([
    'Votive/AdVocationes','Votive/Angels','Votive/Cross','Votive/FideiPropagatione',
    'Votive/JesusEternalPriest','Votive/Passion','Votive/Pent01-0r',
    'Votive/ProUnitateEcclesiae','Votive/TemporeMortalitatis'
]);

const VOTIVE_SECTION_RECOVERY_V17 = Object.freeze({
    'Votive/BlessedSacrament': Object.freeze({
        Introitus: { kind: 'stripAlleluia', path: 'Tempora/Pent01-4', section: 'Introitus' },
        Offertorium: { kind: 'stripAlleluia', path: 'Tempora/Pent01-4', section: 'Offertorium' },
        Communio: { kind: 'stripAlleluia', path: 'Tempora/Pent01-4', section: 'Communio' },
    }),
    'Votive/HolySpirit': Object.freeze({
        Oratio: { kind: 'holySpiritCollect' },
        Graduale: { kind: 'holySpiritGradual' },
        Tractus: { kind: 'holySpiritTract' },
    }),
    'Votive/HolySpirit2': Object.freeze({
        Oratio: { kind: 'suffragiumExact', sourceSection: 'Oratio Spiritu', languages: ['en','fr'] },
        Graduale: { kind: 'holySpiritGradual' },
        Tractus: { kind: 'holySpiritTract' },
        // v19: French remains pinned to the exact Suffragium text. English now uses
        // separately identified historical witnesses for the exact votive prayer bodies.
        Secreta: { kind: 'holySpirit2PrayerV19', sourceSection: 'Secreta Spiritu', languages: ['en','fr'] },
        Postcommunio: { kind: 'holySpirit2PrayerV19', sourceSection: 'Postcommunio Spiritu', languages: ['en','fr'] },
    }),
    'Votive/Apostles': Object.freeze({
        Oratio: { kind: 'apostlesGeneric', sourceSection: 'Oratio' },
        Tractus: { kind: 'apostlesTract' },
        Offertorium: { kind: 'apostlesOffertory' },
        Secreta: { kind: 'apostlesGeneric', sourceSection: 'Secreta' },
        Communio: { kind: 'apostlesCommunion' },
        Postcommunio: { kind: 'apostlesGeneric', sourceSection: 'Postcommunio' },
    }),
    'Votive/ApostlesP': Object.freeze({
        Oratio: { kind: 'apostlesGeneric', sourceSection: 'Oratio' },
        Graduale: { kind: 'apostlesPGradual' },
        Offertorium: { kind: 'apostlesOffertory' },
        Secreta: { kind: 'apostlesGeneric', sourceSection: 'Secreta' },
        Communio: { kind: 'apostlesCommunion' },
        Postcommunio: { kind: 'apostlesGeneric', sourceSection: 'Postcommunio' },
    }),
    // v19: the old Patronage of St Joseph Mass (Tempora/Pasc2-3) is the
    // same French formulary as the normalized votive Mass for the prayers, readings
    // and principal chants. Sancti/03-19 supplies the ordinary Gradual and Tract.
    'Votive/Joseph': Object.freeze({
        Introitus: { kind: 'josephSeasonalV19', sourceSection: 'Introitus', languages: ['fr'] },
        Oratio: { kind: 'directSource', path: 'Tempora/Pasc2-3', section: 'Oratio', languages: ['fr'] },
        Lectio: { kind: 'directSource', path: 'Tempora/Pasc2-3', section: 'Lectio', languages: ['fr'] },
        Graduale: { kind: 'josephGradualV19', languages: ['fr'] },
        GradualeP: { kind: 'directSource', path: 'Tempora/Pasc2-3', section: 'Graduale', languages: ['fr'] },
        Tractus: { kind: 'josephTractV19', languages: ['fr'] },
        Evangelium: { kind: 'directSource', path: 'Tempora/Pasc2-3', section: 'Evangelium', languages: ['fr'] },
        Offertorium: { kind: 'josephSeasonalV19', sourceSection: 'Offertorium', languages: ['fr'] },
        Secreta: { kind: 'directSource', path: 'Tempora/Pasc2-3', section: 'Secreta', languages: ['fr'] },
        Communio: { kind: 'josephSeasonalV19', sourceSection: 'Communio', languages: ['fr'] },
        Postcommunio: { kind: 'directSource', path: 'Tempora/Pasc2-3', section: 'Postcommunio', languages: ['fr'] },
    }),
    // v18: the old Octave-Day source for Ss Peter and Paul preserves the exact
    // three votive prayers in both English and French. The remaining literal
    // sections of the ordinary form are likewise recovered from exact apostolic
    // Mass sections already present in the same pinned language corpus.
    'Votive/PeterPaul': Object.freeze({
        Oratio: { kind: 'directSource', path: 'Sancti/07-06', section: 'Oratio' },
        Graduale: { kind: 'directSource', path: 'Sancti/10-28', section: 'Graduale' },
        Tractus: { kind: 'directSource', path: 'Sancti/08-08', section: 'Tractus' },
        Offertorium: { kind: 'directSource', path: 'Sancti/07-04oct', section: 'Offertorium' },
        Secreta: { kind: 'directSource', path: 'Sancti/07-06', section: 'Secreta' },
        Communio: { kind: 'directSource', path: 'Sancti/02-24', section: 'Communio' },
        Postcommunio: { kind: 'directSource', path: 'Sancti/07-06', section: 'Postcommunio' },
    }),
    'Votive/PeterPaulP': Object.freeze({
        Oratio: { kind: 'directSource', path: 'Sancti/07-06', section: 'Oratio' },
        Secreta: { kind: 'directSource', path: 'Sancti/07-06', section: 'Secreta' },
        Postcommunio: { kind: 'directSource', path: 'Sancti/07-06', section: 'Postcommunio' },
    }),
    // v20 Holy Cross: pinned feast material remains preferred where exact; the remaining
    // English votive-specific sections come from the Saint John Fisher / traditional Holy Cross witnesses.
    'Votive/Cross': Object.freeze({
        Introitus: { kind: 'crossIntroit' },
        Oratio: { kind: 'embeddedV20', corpus: 'Cross', languages: ['en'] },
        Lectio: { kind: 'embeddedV20', corpus: 'Cross', languages: ['en'] },
        Graduale: { kind: 'directSource', path: 'Sancti/09-14', section: 'Graduale' },
        GradualeP: { kind: 'crossGradualPV20' },
        Tractus: { kind: 'embeddedV20', corpus: 'Cross', languages: ['en'] },
        Evangelium: { kind: 'crossGospel' },
        Offertorium: { kind: 'crossOffertory' },
        Secreta: { kind: 'embeddedV20', corpus: 'Cross', languages: ['en'] },
        Communio: { kind: 'crossCommunion' },
        Postcommunio: { kind: 'crossPostcommunioV20' },
    }),
    // v20: the English Propagation formulary is fully recoverable from the pinned
    // Commune/Propaganda prayers plus public-domain/traditional same-formulary readings and chants.
    'Votive/FideiPropagatione': Object.freeze({
        Introitus: { kind: 'embeddedV20', corpus: 'Propagation', languages: ['en'] },
        Oratio: { kind: 'directSource', path: 'Commune/Propaganda', section: 'Oratio', languages: ['en'] },
        Lectio: { kind: 'embeddedV20', corpus: 'Propagation', languages: ['en'] },
        Graduale: { kind: 'embeddedV20', corpus: 'Propagation', languages: ['en'] },
        GradualeP: { kind: 'embeddedV20', corpus: 'Propagation', languages: ['en'] },
        Tractus: { kind: 'embeddedV20', corpus: 'Propagation', languages: ['en'] },
        Evangelium: { kind: 'embeddedV20', corpus: 'Propagation', languages: ['en'] },
        Offertorium: { kind: 'embeddedV20', corpus: 'Propagation', languages: ['en'] },
        Secreta: { kind: 'directSource', path: 'Commune/Propaganda', section: 'Secreta', languages: ['en'] },
        Communio: { kind: 'embeddedV20', corpus: 'Propagation', languages: ['en'] },
        Postcommunio: { kind: 'directSource', path: 'Commune/Propaganda', section: 'Postcommunio', languages: ['en'] },
    }),
    // v20: full English Passion formulary from identified traditional/public-domain witnesses.
    'Votive/Passion': Object.freeze({
        Introitus: { kind: 'embeddedV20', corpus: 'Passion', languages: ['en'] },
        Oratio: { kind: 'embeddedV20', corpus: 'Passion', languages: ['en'] },
        Lectio: { kind: 'embeddedV20', corpus: 'Passion', languages: ['en'] },
        Graduale: { kind: 'embeddedV20', corpus: 'Passion', languages: ['en'] },
        GradualeP: { kind: 'embeddedV20', corpus: 'Passion', languages: ['en'] },
        Tractus: { kind: 'embeddedV20', corpus: 'Passion', languages: ['en'] },
        Evangelium: { kind: 'embeddedV20', corpus: 'Passion', languages: ['en'] },
        Offertorium: { kind: 'embeddedV20', corpus: 'Passion', languages: ['en'] },
        Secreta: { kind: 'embeddedV20', corpus: 'Passion', languages: ['en'] },
        Communio: { kind: 'embeddedV20', corpus: 'Passion', languages: ['en'] },
        Postcommunio: { kind: 'embeddedV20', corpus: 'Passion', languages: ['en'] },
    }),
    // v20: full English Mass for the Unity of the Church. Long Scripture passages use
    // the public-domain Douay-Rheims text; short proper prayers follow the traditional formulary.
    'Votive/ProUnitateEcclesiae': Object.freeze({
        Introitus: { kind: 'embeddedV20', corpus: 'Unity', languages: ['en'] },
        Oratio: { kind: 'embeddedV20', corpus: 'Unity', languages: ['en'] },
        Lectio: { kind: 'embeddedV20', corpus: 'Unity', languages: ['en'] },
        Graduale: { kind: 'embeddedV20', corpus: 'Unity', languages: ['en'] },
        GradualeP: { kind: 'embeddedV20', corpus: 'Unity', languages: ['en'] },
        Tractus: { kind: 'embeddedV20', corpus: 'Unity', languages: ['en'] },
        Evangelium: { kind: 'embeddedV20', corpus: 'Unity', languages: ['en'] },
        Offertorium: { kind: 'embeddedV20', corpus: 'Unity', languages: ['en'] },
        Secreta: { kind: 'embeddedV20', corpus: 'Unity', languages: ['en'] },
        Communio: { kind: 'embeddedV20', corpus: 'Unity', languages: ['en'] },
        Postcommunio: { kind: 'embeddedV20', corpus: 'Unity', languages: ['en'] },
    }),
});
function stripSeasonalAlleluiaV17(lines, language) {
    return lines.map(line => String(line)
        .replace(/,\s*all[eé]luia\s*(?=[;:])/gi, language === 'fr' ? ' ' : '')
        .replace(/,\s*all[eé]luia(?:\s*,\s*all[eé]luia)*\s*[.!]?\s*$/gi, '.')
        .replace(/\s+all[eé]luia(?:\s*,\s*all[eé]luia)*\s*[.!]?\s*$/gi, '.'));
}
function stripAlleluiaAndKneelV17(line) {
    return String(line || '')
        .replace(/\s*all[eé]luia\.?\s*/gi, ' ')
        .replace(/\s*\((?:kneel\.?|hic genuflectitur)\)\s*/gi, ' ')
        .replace(/\s{2,}/g, ' ')
        .replace(/\s+([,.;:!?])/g, '$1')
        .trim();
}

// v16: public-domain Missa pro Sponsis corpus. Latin/English follow the fixed
// traditional Nuptial Mass; French follows a pre-1900 French Catholic missal.
// This is an explicit supplementary source because the pinned Missale Meum snapshot
// defines Matrimonium but does not ship a normalized source file for it.
const MATRIMONIUM_V16 = {
la: `[Name]
Missa pro Sponso et Sponsa

[Rule]
no Gloria
no Credo
Prefatio=Communis

[Introitus]
!Tob 7:15; 8:19
Deus Israel conjungat vos: et ipse sit vobiscum, qui misertus est duobus unicis: et nunc, Domine, fac eos plenius benedicere te.
!Ps 127:1
Beati omnes qui timent Dominum: qui ambulant in viis ejus.
&Gloria
Deus Israel conjungat vos: et ipse sit vobiscum, qui misertus est duobus unicis: et nunc, Domine, fac eos plenius benedicere te.

[Oratio]
Exaudi nos, omnipotens et misericors Deus: ut, quod nostro ministratur officio, tua benedictione potius impleatur.
$Per Dominum

[Lectio]
Lectio Epistolae beati Pauli Apostoli ad Ephesios.
!Eph 5:22-33
Fratres: Mulieres viris suis subditae sint, sicut Domino: quoniam vir caput est mulieris, sicut Christus caput est Ecclesiae: ipse salvator corporis ejus. Sed sicut Ecclesia subjecta est Christo, ita et mulieres viris suis in omnibus. Viri, diligite uxores vestras, sicut et Christus dilexit Ecclesiam, et seipsum tradidit pro ea, ut illam sanctificaret, mundans lavacro aquae in verbo vitae, ut exhiberet ipse sibi gloriosam Ecclesiam, non habentem maculam, aut rugam, aut aliquid hujusmodi, sed ut sit sancta et immaculata. Ita et viri debent diligere uxores suas ut corpora sua. Qui suam uxorem diligit, seipsum diligit. Nemo enim umquam carnem suam odio habuit: sed nutrit et fovet eam, sicut et Christus Ecclesiam: quia membra sumus corporis ejus, de carne ejus et de ossibus ejus. Propter hoc relinquet homo patrem et matrem suam, et adhaerebit uxori suae, et erunt duo in carne una. Sacramentum hoc magnum est, ego autem dico in Christo et in Ecclesia. Verumtamen et vos singuli, unusquisque uxorem suam sicut seipsum diligat: uxor autem timeat virum suum.

[Graduale]
!Ps 127:3
Uxor tua sicut vitis abundans in lateribus domus tuae. V. Filii tui sicut novellae olivarum in circuitu mensae tuae. Alleluia, alleluia.
!Ps 19:3
V. Mittat vobis Dominus auxilium de sancto: et de Sion tueatur vos. Alleluia.

[GradualeP]
Alleluia, alleluia.
!Ps 19:3
V. Mittat vobis Dominus auxilium de sancto: et de Sion tueatur vos. Alleluia.
!Ps 133:3
V. Benedicat vobis Dominus ex Sion: qui fecit caelum et terram. Alleluia.

[Tractus]
!Ps 127:4-6
Ecce sic benedicetur omnis homo, qui timet Dominum. V. Benedicat tibi Dominus ex Sion: et videas bona Jerusalem omnibus diebus vitae tuae. V. Et videas filios filiorum tuorum: pax super Israel.

[Evangelium]
Sequentia sancti Evangelii secundum Matthaeum.
!Matt 19:3-6
In illo tempore: Accesserunt ad Jesum Pharisaei tentantes eum, et dicentes: Si licet homini dimittere uxorem suam, quacumque ex causa? Qui respondens, ait eis: Non legistis, quia qui fecit hominem ab initio, masculum et feminam fecit eos? Et dixit: Propter hoc dimittet homo patrem et matrem, et adhaerebit uxori suae, et erunt duo in carne una. Itaque jam non sunt duo, sed una caro. Quod ergo Deus conjunxit, homo non separet.

[Offertorium]
!Ps 30:15-16
In te speravi, Domine: dixi: Tu es Deus meus: in manibus tuis tempora mea.

[Secreta]
Suscipe, quaesumus, Domine, pro sacra connubii lege munus oblatum: et cujus largitor es operis, esto dispositor.
$Per Dominum

[Communio]
!Ps 127:4; 127:6
Ecce sic benedicetur omnis homo, qui timet Dominum: et videas filios filiorum tuorum: pax super Israel.

[Postcommunio]
Quaesumus, omnipotens Deus: instituta providentiae tuae pio favore comitare: ut quos legitima societate connectis, longaeva pace custodias.
$Per Dominum

[Benedictio Nuptialis 1]
Propitiare, Domine, supplicationibus nostris: et institutis tuis, quibus propagationem humani generis ordinasti, benignus assiste: ut quod te auctore jungitur, te auxiliante servetur.
$Per Dominum

[Benedictio Nuptialis 2]
Deus, qui potestate virtutis tuae de nihilo cuncta fecisti: qui, dispositis universitatis exordiis, homini ad imaginem Dei facto, ideo inseparabile mulieris adjutorium condidisti, ut femineo corpori de virili dares carne principium, docens quod ex uno placuisset institui numquam licere disjungi: Deus, qui tam excellenti mysterio conjugalem copulam consecrasti, ut Christi et Ecclesiae sacramentum praesignares in foedere nuptiarum: Deus, per quem mulier jungitur viro, et societas principaliter ordinata, ea benedictione donatur, quae sola nec per originalis peccati poenam, nec per diluvii est ablata sententiam: respice propitius super hanc famulam tuam, quae maritali jungenda consortio tua se expetit protectione muniri: sit in ea jugum dilectionis et pacis: fidelis et casta nubat in Christo, imitatrixque sanctarum permaneat feminarum: sit amabilis viro suo, ut Rachel: sapiens, ut Rebecca: longaeva et fidelis, ut Sara: nihil in ea ex actibus suis ille auctor praevaricationis usurpet: nexa fidei mandatisque permaneat: uni thoro juncta, contactus illicitos fugiat: muniat infirmitatem suam robore disciplinae: sit verecundia gravis, pudore venerabilis, doctrinis caelestibus erudita: sit fecunda in sobole, sit probata et innocens: et ad beatorum requiem atque ad caelestia regna perveniat: et videant ambo filios filiorum suorum usque in tertiam et quartam generationem, et ad optatam perveniant senectutem.
Per eumdem Dominum nostrum Jesum Christum Filium tuum: qui tecum vivit et regnat in unitate Spiritus Sancti Deus, per omnia saecula saeculorum. Amen.

[Benedictio Finalis]
Deus Abraham, Deus Isaac, et Deus Jacob sit vobiscum: et ipse adimpleat benedictionem suam in vobis: ut videatis filios filiorum vestrorum usque ad tertiam et quartam generationem: et postea vitam aeternam habeatis sine fine: adjuvante Domino nostro Jesu Christo, qui cum Patre et Spiritu Sancto vivit et regnat Deus, per omnia saecula saeculorum. Amen.`,
en: `[Name]
Mass for Bridegroom and Bride

[Rule]
no Gloria
no Credo
Prefatio=Communis

[Introitus]
!Tob 7:15; 8:19
May the God of Israel join you together: and may He be with you, who was merciful to two only children: and now, O Lord, make them bless Thee more fully.
!Ps 127:1
Blessed are all they that fear the Lord: that walk in His ways.
&Gloria
May the God of Israel join you together: and may He be with you, who was merciful to two only children: and now, O Lord, make them bless Thee more fully.

[Oratio]
Hear us, almighty and merciful God: that what is performed by our ministry may be abundantly fulfilled with Thy blessing.
$Per Dominum

[Lectio]
Lesson from the Epistle of Blessed Paul the Apostle to the Ephesians.
!Eph 5:22-33
Brethren: Let women be subject to their husbands as to the Lord; for the husband is the head of the wife, as Christ is the head of the Church. He is the savior of His body. Therefore, as the Church is subject to Christ, so also let the wives be to their husbands in all things. Husbands, love your wives, as Christ also loved the Church, and delivered Himself up for it: that He might sanctify it, cleansing it by the laver of water in the word of life; that He might present it to Himself a glorious Church, not having spot or wrinkle, or any such thing, but that it should be holy and without blemish. So also ought men to love their wives as their own bodies. He that loveth his wife loveth himself: for no man ever hated his own flesh, but nourisheth and cherisheth it; as also Christ doth the Church: for we are members of His body, of His flesh, and of His bones. For this cause shall a man leave his father and mother, and shall cleave to his wife; and they shall be two in one flesh. This is a great Sacrament, but I speak in Christ and in the Church. Nevertheless, let every one of you in particular love his wife as himself, and let the wife fear her husband.

[Graduale]
!Ps 127:3
Thy wife shall be as a fruitful vine on the sides of thy house. V. Thy children as olive plants round about thy table. Alleluia, alleluia.
!Ps 19:3
V. May the Lord send you help from the sanctuary, and defend you out of Sion. Alleluia.

[GradualeP]
Alleluia, alleluia.
!Ps 19:3
V. May the Lord send you help from the sanctuary, and defend you out of Sion. Alleluia.
!Ps 133:3
V. May the Lord out of Sion bless you: who hath made heaven and earth. Alleluia.

[Tractus]
!Ps 127:4-6
Behold thus shall the man be blessed that feareth the Lord. V. May the Lord bless thee out of Sion; and mayest thou see the good things of Jerusalem all the days of thy life. V. And mayest thou see thy children's children: peace upon Israel.

[Evangelium]
Continuation of the holy Gospel according to St. Matthew.
!Matt 19:3-6
At that time: The Pharisees came to Jesus, tempting Him and saying: Is it lawful for a man to put away his wife for every cause? Who answering said to them: Have ye not read, that He who made man from the beginning, made them male and female? And He said: For this cause shall a man leave his father and mother, and shall cleave to his wife, and they two shall be in one flesh. Therefore, now they are not two but one flesh. What, therefore, God hath joined together, let no man put asunder.

[Offertorium]
!Ps 30:15-16
In Thee, O Lord, have I hoped: I said, Thou art my God; my times are in Thy hands.

[Secreta]
Accept, we beseech Thee, O Lord, the gifts offered for the sacred law of marriage: and do Thou dispose according to Thy will, that which is instituted by Thy bounty.
$Per Dominum

[Communio]
!Ps 127:4; 127:6
Behold, thus shall every man be blessed that feareth the Lord; and mayest thou see thy children's children; peace upon Israel.

[Postcommunio]
We beseech Thee, almighty God, to accompany with Thy gracious favor the institution of Thy Providence, and keep in lasting peace those whom Thou dost join in lawful union.
$Per Dominum

[Benedictio Nuptialis 1]
Be gracious, O Lord, to our humble supplications: and graciously assist this Thine institution, which Thou hast established for the increase of mankind: that what is joined together by Thine authority, may be preserved by Thine aid.
$Per Dominum

[Benedictio Nuptialis 2]
O God, who by Thine own mighty power didst make all things out of nothing: who, having set in order the beginnings of the world, didst appoint woman to be an inseparable helpmate to man made like unto God, so that Thou didst give to woman's body its beginnings in man's flesh, thereby teaching that what it pleased Thee to form from one substance might never be lawfully separated: O God, who by so excellent a mystery hast consecrated the union of man and wife, as to foreshadow in this nuptial bond the union of Christ with His Church: O God, by whom woman is joined to man, and the partnership ordained from the beginning is endowed with such blessing that it alone was not withdrawn either by the punishment of original sin nor by the sentence of the flood: graciously look upon this Thy handmaid, who, about to be joined in wedlock, seeks Thy defence and protection. May it be to her a yoke of love and peace: faithful and chaste, may she be wedded in Christ, and let her ever be the imitator of holy women: let her be dear to her husband like Rachel, wise like Rebecca, long-lived and faithful like Sara. Let not the author of deceit work any of his evil deeds in her. May she continue clinging to the faith and to the commandments. Bound in one union, let her shun all unlawful contact. Let her protect her weakness by the strength of discipline; let her be grave in behavior, respected for modesty, well-instructed in heavenly doctrine. Let her be fruitful in offspring; be approved and innocent; and come to the repose of the blessed and the kingdom of heaven. May they both see their children's children to the third and fourth generation, and may they reach the old age which they desire.
Through the same Lord Jesus Christ, Thy Son, who liveth and reigneth with Thee in the unity of the Holy Ghost, God, world without end. Amen.

[Benedictio Finalis]
May the God of Abraham, the God of Isaac, and the God of Jacob be with you: and Himself fulfill His blessing on you: that you may see your children's children even to the third and fourth generation: and thereafter possess life everlasting, by the aid of our Lord Jesus Christ. Amen.`,
fr: `[Name]
Messe pour un mariage

[Rule]
no Gloria
no Credo
Prefatio=Communis

[Introitus]
!Tob 7:15; 8:19
Que le Dieu d'Israël vous unisse, et que lui-même soit avec vous, lui qui a eu pitié de deux enfants uniques: faites, Seigneur, qu'ils vous bénissent de plus en plus.
!Ps 127:1
Heureux ceux qui craignent le Seigneur et qui marchent dans ses voies.
&Gloria
Que le Dieu d'Israël vous unisse, et que lui-même soit avec vous, lui qui a eu pitié de deux enfants uniques: faites, Seigneur, qu'ils vous bénissent de plus en plus.

[Oratio]
Exaucez-nous, Dieu tout-puissant et miséricordieux, afin que ce qui se fait par notre ministère reçoive son accomplissement de votre bénédiction.
$Per Dominum

[Lectio]
Leçon tirée de l'Épître de l'Apôtre saint Paul aux Éphésiens.
!Eph 5:22-33
Mes frères, que les femmes soient soumises à leurs maris comme au Seigneur; car le mari est le chef de la femme, comme Jésus-Christ est le chef de l'Église, qui est son corps, dont il est aussi le Sauveur. Comme donc l'Église est soumise à Jésus-Christ, les femmes doivent être soumises en tout à leurs maris. Et vous, maris, aimez vos femmes comme Jésus-Christ a aimé son Église et s'est livré lui-même à la mort pour elle, afin de la sanctifier en la purifiant dans le baptême de l'eau par la parole de vie, pour la faire paraître devant lui pleine de gloire, n'ayant ni tache, ni ride, ni rien de semblable, mais sainte et sans aucun défaut. Ainsi les maris doivent aimer leurs femmes comme leur propre corps. Celui qui aime sa femme s'aime lui-même, car nul ne hait sa propre chair; mais il la nourrit et l'entretient, comme Jésus-Christ agit envers l'Église, parce que nous sommes les membres de son corps, formés de sa chair et de ses os. C'est pourquoi l'homme abandonnera son père et sa mère, et s'attachera à sa femme, et ils seront tous deux une même chair. Ce sacrement est grand; je dis en Jésus-Christ et en l'Église. Que chacun de vous aime donc sa femme comme lui-même, et que la femme craigne et respecte son mari.

[Graduale]
!Ps 127:3
Votre femme sera dans l'intérieur de votre maison comme une vigne fertile. V. Vos enfants seront autour de votre table comme de jeunes plantes d'oliviers. Alléluia, alléluia.
!Ps 19:3
V. Que le Seigneur vous envoie son secours de son sanctuaire, et qu'il veille sur vous du haut de Sion. Alléluia.

[GradualeP]
Alléluia, alléluia.
!Ps 19:3
V. Que le Seigneur vous envoie son secours de son sanctuaire, et qu'il veille sur vous du haut de Sion. Alléluia.
!Ps 133:3
V. Que le Seigneur vous bénisse du haut de Sion, lui qui a fait le ciel et la terre. Alléluia.

[Tractus]
!Ps 127:4-6
Ainsi sera béni tout homme qui craint le Seigneur. V. Que le Seigneur répande de Sion ses bénédictions sur vous, et qu'il vous fasse voir tous les jours de votre vie la prospérité de Jérusalem. V. Et puissiez-vous voir les enfants de vos enfants et la paix dans Israël.

[Evangelium]
Suite du saint Évangile selon saint Matthieu.
!Matt 19:3-6
En ce temps-là, des Pharisiens vinrent à Jésus pour le tenter et lui dirent: Est-il permis à un homme de renvoyer sa femme, pour quelque cause que ce soit? Il leur répondit: N'avez-vous pas lu que celui qui a créé l'homme, créa au commencement l'homme et la femme, et qu'il dit: Pour cette raison, l'homme abandonnera son père et sa mère, s'attachera à sa femme, et ils seront tous deux une même chair? Ainsi ils ne sont plus deux, mais une seule chair. Que l'homme donc ne sépare pas ce que Dieu a uni.

[Offertorium]
!Ps 30:15-16
J'ai espéré en vous, Seigneur; je vous ai dit: vous êtes mon Dieu; mon sort est entre vos mains.

[Secreta]
Daignez recevoir, Seigneur, les dons que nous vous offrons pour le bien sacré du mariage; et, comme vous êtes l'auteur de cette œuvre, soyez-en aussi l'arbitre.
$Per Dominum

[Communio]
!Ps 127:4; 127:6
Ainsi sera béni l'homme qui craint le Seigneur; puissiez-vous voir les enfants de vos enfants, et la paix dans Israël.

[Postcommunio]
Daignez, Dieu tout-puissant, accompagner des faveurs de votre bonté ce que vous avez établi par votre providence, et conserver dans une longue paix ceux que vous unissez par un lien légitime.
$Per Dominum

[Benedictio Nuptialis 1]
Laissez-vous fléchir par nos prières, Seigneur, et accompagnez de votre grâce le sacrement que vous avez institué pour la propagation du genre humain, afin que votre assistance conserve ce qu'unit votre autorité.
$Per Dominum

[Benedictio Nuptialis 2]
Ô Dieu, qui, par votre puissance, avez créé de rien tout l'univers; qui, dès le commencement du monde, après avoir fait l'homme à votre image, lui avez donné, pour être son aide inséparable, la femme que vous avez formée de lui-même, afin de nous apprendre qu'il n'est jamais permis de séparer ce qu'il vous a plu d'unir: ô Dieu, qui avez consacré le mariage par un mystère si précieux que l'alliance nuptiale est la figure de l'union sacrée de Jésus-Christ et de son Église; ô Dieu, par qui la femme est unie à l'homme, et qui donnez à leur union intime la seule bénédiction dont nous n'ayons été dépouillés ni par la punition du péché originel ni par la sentence du déluge, regardez d'un œil favorable votre servante qui, devant être unie à un époux, implore votre protection. Faites que son joug soit un joug d'amour et de paix; faites que, chaste et fidèle, elle se marie en Jésus-Christ, qu'elle suive toujours l'exemple des saintes femmes; qu'elle soit aimable pour son mari comme Rachel, sage comme Rebecca; qu'elle jouisse d'une longue vie et qu'elle soit fidèle comme Sara; que l'auteur du péché ne trouve rien en elle qui soit de lui; qu'elle demeure ferme dans la foi et dans l'observance de vos commandements, afin qu'uniquement attachée à son mari, elle ne souille le lit nuptial par aucun commerce illégitime; que, pour fortifier sa faiblesse, elle ait une vie toujours réglée; que sa pudeur lui mérite le respect; qu'elle s'instruise de ses devoirs dans la doctrine toute céleste de Jésus-Christ; qu'elle obtienne de vous une heureuse fécondité; que sa vie soit pure et irréprochable, et qu'elle parvienne au repos des saints dans le royaume du ciel. Faites, Seigneur, qu'ils voient tous deux les enfants de leurs enfants jusqu'à la troisième et à la quatrième génération, et qu'ils arrivent à une heureuse vieillesse.
Par le même Notre-Seigneur Jésus-Christ, votre Fils, qui, étant Dieu, vit et règne avec vous dans l’unité du Saint-Esprit, dans tous les siècles des siècles. Ainsi soit-il.

[Benedictio Finalis]
Que le Dieu d'Abraham, le Dieu d'Isaac et le Dieu de Jacob soit avec vous, et qu'il répande en vous sa bénédiction, afin que vous voyiez les enfants de vos enfants jusqu'à la troisième et à la quatrième génération, et que vous possédiez ensuite la vie éternelle, par la grâce de Notre-Seigneur Jésus-Christ. Ainsi soit-il.`
};

class ProperResolver {
    fetcher;
    parsedCache = new Map();
    cramponPromiseV21 = null;
    constructor(fetcher) {
        this.fetcher = fetcher;
    }
    clear() { this.parsedCache.clear(); this.cramponPromiseV21 = null; this.fetcher.clear?.(); }
    upstreamUrls(path, language) {
        const directory = source_config_1.LANGUAGE_DIR[language];
        const urls = [`${source_config_1.DIVINUM_MISSA_BASE}/${directory}/${path}.txt`];
        // v14: Missale Meum's normalized 1962 layer references a number of Mass Commons
        // which were later moved out of Divinum Officium's live missa tree. Recover only
        // Commune/* from the same pinned repository revision's historical Mass corpus.
        // This is source recovery, not translation or generated text.
        if (/^Commune\//.test(path)) {
            const legacyDirectory = language === 'fr' ? 'French' : directory;
            const legacyBase = source_config_1.DIVINUM_MISSA_BASE.replace('/web/www/missa', '/obsolete/missa');
            urls.push(`${legacyBase}/${legacyDirectory}/${path}.txt`);
        }
        // v15: the normalized daily Requiem (Votive/Defunctorum) is source-equivalent
        // to the historical Mass-of-the-Dead C9 corpus. Use the same pinned revision
        // as an exact same-language recovery source; this is not generated translation.
        if (path === 'Votive/Defunctorum') {
            const legacyDirectory = language === 'fr' ? 'French' : directory;
            const legacyBase = source_config_1.DIVINUM_MISSA_BASE.replace('/web/www/missa', '/obsolete/missa');
            urls.push(`${legacyBase}/${legacyDirectory}/Commune/C9.txt`);
        }
        urls.push(`${source_config_1.DIVINUM_HORAS_BASE}/${directory}/${path}.txt`);
        return urls;
    }
    async loadUpstreamParsed(path, language, diagnostic) {
        const key = `up:${language}:${path}`;
        const cached = this.parsedCache.get(key);
        if (cached)
            return cloneParsed(cached);
        if (path === 'Votive/Matrimonium' && MATRIMONIUM_V16[language]) {
            const parsed = parseSections(MATRIMONIUM_V16[language]);
            parsed.source = `embedded:v16:MissaProSponsis:${language}`;
            parsed.requestedLanguage = language;
            parsed.translationMissing = false;
            this.parsedCache.set(key, cloneParsed(parsed));
            diagnostic?.warnings?.push(`Missa pro Sponsis loaded from the v16 sourced supplementary corpus (${language}).`);
            return cloneParsed(parsed);
        }
        let text = null;
        let source = null;
        for (const url of this.upstreamUrls(path, language)) {
            text = await this.fetcher.tryGet(url, diagnostic);
            if (text != null) {
                source = url;
                break;
            }
        }
        if (!usableSourceText(text)) {
            if (language !== "la") {
                diagnostic?.languageGaps?.push({ language, path, layer: "upstream", reason: "translation-source-missing" });
                diagnostic?.warnings?.push(`Translation source missing: ${language}/${path}. Latin is retained separately and is not relabelled as ${language}.`);
                const empty = { map: new Map(), order: [], source: null, requestedLanguage: language, translationMissing: true };
                this.parsedCache.set(key, cloneParsed(empty));
                return cloneParsed(empty);
            }
            throw new Error(`Source not found upstream: ${language}/${path}`);
        }
        const parsed = parseSections(text);
        parsed.source = source;
        if (source?.includes('/obsolete/missa/'))
            diagnostic?.legacyCommonRecoveries?.push({ language, path, source });
        parsed.requestedLanguage = language;
        parsed.translationMissing = false;
        this.parsedCache.set(key, cloneParsed(parsed));
        return parsed;
    }
    async loadLocalRoot(path, language, diagnostic) {
        const directory = source_config_1.LANGUAGE_DIR[language];
        const url = `${source_config_1.MISSAL_BASE}/${directory}/${path}.txt`;
        const text = await this.fetcher.tryGet(url, diagnostic);
        const upstream = await this.loadUpstreamParsed(path, language, diagnostic);
        if (language === 'la') {
            if (!usableSourceText(text)) return upstream;
            let parsed = parseSections(text);
            if (upstream?.order?.length) parsed = mergeMissing(parsed, upstream);
            parsed.source = url; parsed.requestedLanguage = language; parsed.translationMissing = false;
            return parsed;
        }

        // v14: Missale Meum's normalized vernacular files may legitimately be empty or
        // partial. In that case they inherit the normalized Latin *structure*, not Latin
        // prose. We therefore merge only reference lines / Rule metadata from the Latin
        // normalized file, then resolve every inherited reference in the requested language.
        let parsed = usableSourceText(text) ? parseSections(text) : cloneParsed(upstream);
        if (usableSourceText(text) && upstream?.order?.length) parsed = mergeMissing(parsed, upstream);
        const latinUrl = `${source_config_1.MISSAL_BASE}/${source_config_1.LANGUAGE_DIR.la}/${path}.txt`;
        const latinText = await this.fetcher.tryGet(latinUrl, diagnostic);
        if (usableSourceText(latinText)) {
            const template = structuralTranslationTemplate(parseSections(latinText));
            if (template.order.length) {
                parsed = mergeMissing(parsed, template);
                diagnostic?.structuralInheritances?.push({ language, path, template: latinUrl, sections: template.order });
            }
        }
        if (!usableSourceText(text))
            diagnostic?.warnings?.push(`Local ${language} source empty for ${path}; inherited normalized Latin reference structure and resolved it only against ${language} sources.`);
        parsed.source = usableSourceText(text) ? url : (upstream.source || null);
        parsed.requestedLanguage = language;
        parsed.translationMissing = !parsed.order.length;
        return parsed;
    }
    async cramponDataV21() {
        if (!this.cramponPromiseV21) {
            this.cramponPromiseV21 = this.fetcher.get(scripture_config_v21_1.CRAMPON_URL).then(raw => JSON.parse(raw));
        }
        return await this.cramponPromiseV21;
    }
    normSourceNameV21(value) {
        return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
    }
    async cramponTextV21(citation) {
        const ref = (0, scripture_refs_v21_1.parseScriptureReference)({ lat: citation });
        if (!ref) throw new Error(`Crampon v21: unsupported citation ${citation}`);
        const data = await this.cramponDataV21();
        const aliases = [ref.frLabel, ref.label].map(x => this.normSourceNameV21(x));
        const book = (data?.books || []).find(b => {
            const n = this.normSourceNameV21(b?.name);
            return aliases.some(a => n === a || n.includes(a) || a.includes(n));
        });
        if (!book) throw new Error(`Crampon v21: book unavailable for ${citation} (${ref.frLabel}).`);
        const chapter = (book.chapters || []).find(c => +c.chapter === ref.chapter);
        if (!chapter) throw new Error(`Crampon v21: chapter unavailable for ${citation}.`);
        const rows = (Array.isArray(chapter.verses) ? chapter.verses : Array.isArray(chapter.content) ? chapter.content : [])
            .map((x, i) => ({ verse: +(x.verse ?? x.number ?? i + 1), text: String(x.text ?? x.content ?? '').trim() }))
            .filter(x => x.verse >= ref.start && x.verse <= ref.end && x.text);
        if (!rows.length) throw new Error(`Crampon v21: verses unavailable for ${citation}.`);
        return rows.map(x => x.text).join(' ').replace(/\s+/g, ' ').trim();
    }
    cleanPsalmFragmentV21(value) {
        return String(value || '')
            .replace(/^\s*\d+:[0-9]+[a-z]?\s+/i, '')
            .replace(/\s*[†‡]\s*/g, ' ')
            .replace(/\s*\*\s*/g, ' ')
            .replace(/\s*\(\d+[a-z]?\)\s*/gi, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }
    async frenchPsalmFragmentsV21(psalm, verse) {
        const key = `v21-psalm-fr:${psalm}`;
        let raw = this.parsedCache.get(key);
        if (typeof raw !== 'string') {
            const url = `${source_config_1.DIVINUM_HORAS_BASE}/Francais/Psalterium/Psalmorum/Psalm${psalm}.txt`;
            raw = await this.fetcher.get(url);
            this.parsedCache.set(key, raw);
        }
        const re = new RegExp(`^${psalm}:${verse}[a-z]?\\s+`, 'i');
        const rows = String(raw || '').split(/\r?\n/).filter(line => re.test(line)).map(line => this.cleanPsalmFragmentV21(line));
        if (!rows.length) throw new Error(`French Psalter v21: Ps ${psalm}:${verse} unavailable.`);
        return rows;
    }
    async frenchPsalmTextV21(psalm, verse) {
        return (await this.frenchPsalmFragmentsV21(psalm, verse)).join(' ').replace(/\s+/g, ' ').trim();
    }
    addTpV21(value, pair = false) {
        const suffix = pair ? ' (T. P. Alléluia, alléluia.)' : ' (T. P. Alléluia.)';
        return String(value || '').replace(/[.]?\s*$/, '') + suffix;
    }
    async buildFrenchVotiveSectionV21(path, section, resolveSource) {
        const ps = (n, v) => this.frenchPsalmTextV21(n, v);
        const psf = (n, v) => this.frenchPsalmFragmentsV21(n, v);
        const sc = c => this.cramponTextV21(c);
        const gospelHeading = book => `Sequéntia ++ sancti Evangélii secúndum ${book}.`;
        const key = `${path}|${section}`;

        // For vocations
        if (path === 'Votive/AdVocationes') {
            if (section === 'Introitus') {
                const main = await sc('Matt 4:18-19'), p = await ps(18, 2), tp = this.addTpV21(main, true);
                return ['!Matth 4:18-19', tp, '!Ps 18:2', p, '&Gloria', tp];
            }
            if (section === 'Oratio') return [...VOTIVE_FR_TEXT_V21.Vocations.Oratio];
            if (section === 'Lectio') return ['Léctio libri Regum', '!1 Reg 3:1-10', await sc('1 Sam 3:1-10')];
            if (section === 'Graduale') {
                const p26 = await psf(26, 4), p83 = await ps(83, 5);
                return ['!Ps 26:4', p26[0], `V. ${p26.slice(1).join(' ') || p26[0]} Alléluia, alléluia.`, '!Ps 83:5', `V. ${p83} Alléluia.`];
            }
            if (section === 'GradualeP') return ['! Tempore paschali', 'Alléluia, alléluia.', '!Ps 83:5', `V. ${await ps(83,5)} Alléluia.`, '!Eccli 39:19', `V. ${await sc('Ecclesiasticus 39:19')} Alléluia.`];
            if (section === 'Tractus') return ['! Post Septuagesimam', '!Ps 83:2-4', await ps(83,2), `V. ${await ps(83,3)}`, `V. ${await ps(83,4)}`];
            if (section === 'Evangelium') return [gospelHeading('Joánnem'), '!Joann 1:35-51', await sc('John 1:35-51')];
            if (section === 'Offertorium') return ['!Ps 15:5', this.addTpV21(await ps(15,5))];
            if (section === 'Secreta') return [...VOTIVE_FR_TEXT_V21.Vocations.Secreta];
            if (section === 'Communio') return ['!Ps 65:16', this.addTpV21(await ps(65,16))];
            if (section === 'Postcommunio') return [...VOTIVE_FR_TEXT_V21.Vocations.Postcommunio];
        }

        // Of the Holy Angels
        if (path === 'Votive/Angels') {
            if (section === 'Introitus') {
                const main = this.addTpV21(await ps(102,20), true), p = await ps(102,1);
                return ['!Ps 102:20', main, '!Ps 102:1', p, '&Gloria', main];
            }
            if (section === 'Oratio') return await resolveSource('Sancti/05-08', 'Oratio');
            if (section === 'Lectio') return ['Léctio libri Apocalýpsis beáti Joánnis Apóstoli', '!Apoc 5:11-14', await sc('Apoc 5:11-14')];
            if (section === 'Graduale') {
                const p137 = await psf(137,1);
                return ['!Ps 148:1-2', await ps(148,1), `V. ${await ps(148,2)} Alléluia, alléluia.`, '!Ps 137:1-2', `V. ${p137.slice(1).join(' ') || p137[0]} Alléluia.`];
            }
            if (section === 'GradualeP') return await resolveSource('Sancti/10-02', 'GradualeP');
            if (section === 'Tractus') return await resolveSource('Sancti/10-02', 'Tractus');
            if (section === 'Evangelium') return [gospelHeading('Joánnem'), '!Joann 1:47-51', await sc('John 1:47-51')];
            if (section === 'Offertorium') {
                const out = await resolveSource('Sancti/10-24', 'Offertorium');
                const i = out.findLastIndex(x => !/^!/.test(String(x).trim()));
                if (i >= 0) out[i] = this.addTpV21(out[i]);
                return out;
            }
            if (section === 'Secreta') return await resolveSource('Sancti/10-24', 'Secreta');
            if (section === 'Communio') return [...VOTIVE_FR_TEXT_V21.Angels.Communio];
            if (section === 'Postcommunio') return [...VOTIVE_FR_TEXT_V21.Angels.Postcommunio];
        }

        // Holy Cross: only the genuinely missing French-specific sections are overridden here;
        // the shared v18/v20 exact feast-source helpers remain authoritative for the rest.
        if (path === 'Votive/Cross') {
            if (section === 'Oratio') return [...VOTIVE_FR_TEXT_V21.Cross.Oratio];
            if (section === 'Lectio') return ['Léctio Epístolæ beáti Pauli Apóstoli ad Philippénses.', '!Phil 2:8-11', await sc('Phil 2:8-11')];
            if (section === 'GradualeP') {
                const feast = await resolveSource('Sancti/09-14', 'Graduale');
                let sweet = [...feast].reverse().find(x => /doux bois|doux clous/i.test(String(x))) || 'V. Ô doux bois, ô doux clous, vous portez un fardeau encore plus doux : ô Croix, toi seule as été digne de soutenir le Seigneur et Roi des Cieux. Alléluia.';
                sweet = String(sweet).replace(/^V\.\s*/i, '');
                return ['! Tempore paschali', 'Alléluia, alléluia.', '!Ps 95:10', 'V. Dites aux nations : le Seigneur a régné par le bois. Alléluia.', `V. ${sweet.replace(/\s*Alléluia\.?\s*$/i,'')} Alléluia.`];
            }
            if (section === 'Tractus') return [...VOTIVE_FR_TEXT_V21.Cross.Tractus];
            if (section === 'Secreta') return [...VOTIVE_FR_TEXT_V21.Cross.Secreta];
        }

        // Propagation of the Faith
        if (path === 'Votive/FideiPropagatione') {
            if (section === 'Introitus') {
                const main = this.addTpV21(`${await ps(66,2)} ${await ps(66,3)}`, true);
                return ['!Ps 66:2-3', main, '!Ps 66:4', await ps(66,4), '&Gloria', main];
            }
            if (section === 'Oratio') return [...VOTIVE_FR_TEXT_V21.Propagation.Oratio];
            if (section === 'Lectio') return ['Léctio libri Sapiéntiæ', '!Eccli 36:1-10,17-19', `${await sc('Ecclesiasticus 36:1-10')} ${await sc('Ecclesiasticus 36:17-19')}`];
            if (section === 'Graduale') return ['!Ps 66:6-8', await ps(66,6), `V. ${await ps(66,7)} Alléluia, alléluia.`, '!Ps 99:1', `V. ${(await psf(99,2)).join(' ')} Alléluia.`];
            if (section === 'GradualeP') return ['! Tempore paschali', 'Alléluia, alléluia.', '!Ps 99:1-3', `V. ${(await psf(99,2)).join(' ')} Alléluia.`, `V. ${(await psf(99,3))[0]} Alléluia.`];
            if (section === 'Tractus') return ['! Post Septuagesimam', '!Ps 95:3-5', await ps(95,3), `V. ${await ps(95,4)}`, `V. ${await ps(95,5)}`];
            if (section === 'Evangelium') return [gospelHeading('Matthǽum'), '!Matt 9:35-38', await sc('Matt 9:35-38')];
            if (section === 'Offertorium') return ['!Ps 95:7-9', this.addTpV21(`${await ps(95,7)} ${await ps(95,8)}`)];
            if (section === 'Secreta') return [...VOTIVE_FR_TEXT_V21.Propagation.Secreta];
            if (section === 'Communio') return ['!Ps 116:1-2', this.addTpV21(`${await ps(116,1)} ${await ps(116,2)}`)];
            if (section === 'Postcommunio') return [...VOTIVE_FR_TEXT_V21.Propagation.Postcommunio];
        }

        // Jesus Christ, Supreme and Eternal Priest
        if (path === 'Votive/JesusEternalPriest') {
            if (section === 'Introitus') {
                const main = this.addTpV21(await ps(109,4), true);
                return ['!Ps 109:4', main, '!Ps 109:1', await ps(109,1), '&Gloria', main];
            }
            if (section === 'Oratio') return [...VOTIVE_FR_TEXT_V21.EternalPriest.Oratio];
            if (section === 'Lectio') return ['Léctio Epístolæ beáti Pauli Apóstoli ad Hebræos.', '!Hebr 5:1-11', await sc('Heb 5:1-11')];
            if (section === 'Graduale') return ['!Luc 4:18', await sc('Luke 4:18'), `V. ${await sc('Heb 7:24')} Alléluia, alléluia.`];
            if (section === 'GradualeP') return ['! Tempore paschali', 'Alléluia, alléluia.', '!Hebr 7:24', `V. ${await sc('Heb 7:24')} Alléluia.`, '!Luc 4:18', `V. ${await sc('Luke 4:18')} Alléluia.`];
            if (section === 'Tractus') {
                const p35 = await psf(9,35);
                return ['! Post Septuagesimam', '!Ps 9:34-36', await ps(9,33), `V. ${p35[0]}`, `V. ${p35.slice(1).join(' ') || p35[0]}`];
            }
            if (section === 'Evangelium') return [gospelHeading('Lucam'), '!Luc 22:14-20', await sc('Luke 22:14-20')];
            if (section === 'Offertorium') return ['!Hebr 10:12,14', this.addTpV21(`${await sc('Heb 10:12')} ${await sc('Heb 10:14')}`)];
            if (section === 'Secreta') return [...VOTIVE_FR_TEXT_V21.EternalPriest.Secreta];
            if (section === 'Communio') return ['!1 Cor 11:24-25', this.addTpV21(await sc('1 Cor 11:24-25'))];
            if (section === 'Postcommunio') return [...VOTIVE_FR_TEXT_V21.EternalPriest.Postcommunio];
        }

        // Passion of Our Lord
        if (path === 'Votive/Passion') {
            if (section === 'Introitus') {
                const main = this.addTpV21(await sc('Phil 2:8-9'), true);
                return ['!Phil 2:8-9', main, '!Ps 88:2', await ps(88,2), '&Gloria', main];
            }
            if (section === 'Oratio') return [...VOTIVE_FR_TEXT_V21.Passion.Oratio];
            if (section === 'Lectio') return ['Lectio Zachariæ Prophetæ.', '!Zach 12:10-12; 13:6-7', `${await sc('Zach 12:10-12')} ${await sc('Zach 13:6-7')}`];
            if (section === 'Graduale') return ['!Ps 68:21-22', await ps(68,21), `V. ${await ps(68,22)} Alléluia, alléluia.`, VOTIVE_FR_TEXT_V21.Passion.AveRex];
            if (section === 'GradualeP') return ['! Tempore paschali', 'Alléluia, alléluia.', VOTIVE_FR_TEXT_V21.Passion.AveRex, VOTIVE_FR_TEXT_V21.Passion.GloriaHosanna];
            if (section === 'Tractus') return ['! Post Septuagesimam', '!Isa 53:4-5', await sc('Isa 53:4'), `V. ${await sc('Isa 53:5')}`];
            if (section === 'Evangelium') return [gospelHeading('Joánnem'), '!Joann 19:28-35', await sc('John 19:28-35')];
            if (section === 'Offertorium') return [...VOTIVE_FR_TEXT_V21.Passion.Offertorium];
            if (section === 'Secreta') return [...VOTIVE_FR_TEXT_V21.Passion.Secreta];
            if (section === 'Communio') {
                const p17 = await psf(21,17), chosen = p17[p17.length - 1];
                return ['!Ps 21:17-18', this.addTpV21(chosen)];
            }
            if (section === 'Postcommunio') return [...VOTIVE_FR_TEXT_V21.Passion.Postcommunio];
        }

        // Most Holy Trinity
        if (path === 'Votive/Pent01-0r') {
            if (['Introitus','Oratio','Graduale','Offertorium','Secreta','Communio','Postcommunio'].includes(section)) return await resolveSource('Tempora/Pent01-0r', section);
            if (section === 'Lectio') return ['Léctio Epístolæ beáti Pauli Apóstoli ad Corínthios.', '!2 Cor 13:11-13', await sc('2 Cor 13:11-13')];
            if (section === 'GradualeP') return [...VOTIVE_FR_TEXT_V21.Trinity.GradualeP];
            if (section === 'Tractus') return [...VOTIVE_FR_TEXT_V21.Trinity.Tractus];
            if (section === 'Evangelium') return [gospelHeading('Joánnem'), '!Joann 15:26; 16:1-4', `${await sc('John 15:26')} ${await sc('John 16:1-4')}`];
        }

        // Unity of the Church
        if (path === 'Votive/ProUnitateEcclesiae') {
            if (section === 'Introitus') {
                const main = this.addTpV21(await ps(105,47), true);
                return ['!Ps 105:47', main, '!Ps 105:1', await ps(105,1), '&Gloria', main];
            }
            if (section === 'Oratio') return [...VOTIVE_FR_TEXT_V21.Unity.Oratio];
            if (section === 'Lectio') return ['Léctio Epístolæ beáti Pauli Apóstoli ad Ephésios.', '!Eph 4:1-7,13-21', `${await sc('Eph 4:1-7')} ${await sc('Eph 4:13-21')}`];
            if (section === 'Graduale') return ['!Ps 121:6-7', await ps(121,6), `V. ${await ps(121,7)} Alléluia, alléluia.`, '!Ps 147:12', `V. ${await ps(147,1)} Alléluia.`];
            if (section === 'GradualeP') return ['! Tempore paschali', 'Alléluia, alléluia.', '!Ps 147:12,14', `V. ${await ps(147,1)} Alléluia.`, `V. ${await ps(147,3)} Alléluia.`];
            if (section === 'Tractus') return ['! Post Septuagesimam', '!Ps 75:2-4', await ps(75,2), `V. ${await ps(75,3)}`, `V. ${await ps(75,4)}`];
            if (section === 'Evangelium') return [gospelHeading('Joánnem'), '!Joann 17:1,11-23', `${await sc('John 17:1')} ${await sc('John 17:11-23')}`];
            if (section === 'Offertorium') return ['!Rom 15:5-6', this.addTpV21(await sc('Rom 15:5-6'))];
            if (section === 'Secreta') return [...VOTIVE_FR_TEXT_V21.Unity.Secreta];
            if (section === 'Communio') return ['!1 Cor 10:17', this.addTpV21(await sc('1 Cor 10:17'))];
            if (section === 'Postcommunio') return [...VOTIVE_FR_TEXT_V21.Unity.Postcommunio];
        }

        // In time of pestilence / mortality
        if (path === 'Votive/TemporeMortalitatis') {
            if (section === 'Introitus') {
                const main = this.addTpV21(await sc('2 Sam 24:16'), true), p79 = await psf(79,2);
                return ['!2 Reg 24:16', main, '!Ps 79:2', p79[0], '&Gloria', main];
            }
            if (section === 'Oratio') return [...VOTIVE_FR_TEXT_V21.Pestilence.Oratio];
            if (section === 'Lectio') return ['Lectio libri Regum', '!2 Reg 24:15-19 et 25', `${await sc('2 Sam 24:15-19')} ${await sc('2 Sam 24:25')}`];
            if (section === 'Graduale') return ['!Ps 106:20-21', await ps(106,20), `V. ${await ps(106,21)} Alléluia, alléluia.`, '!Ps 68:2', `V. ${await ps(68,2)} Alléluia.`];
            if (section === 'GradualeP') return ['! Tempore paschali', 'Alléluia, alléluia.', '!Ps 68:2', `V. ${await ps(68,2)} Alléluia.`, '!Zach 8:7-8', `V. ${await sc('Zach 8:7-8')} Alléluia.`];
            if (section === 'Tractus') return ['! Post Septuagesimam', '!Ps 102:10; 78:8-9', await ps(102,10), `V. ${await ps(78,8)}`, `V. ${await ps(78,9)}`];
            if (section === 'Evangelium') return await resolveSource('Tempora/Pasc7-6', 'Evangelium');
            if (section === 'Offertorium') return ['!Num 16:48', this.addTpV21(await sc('Num 16:48'))];
            if (section === 'Secreta') return [...VOTIVE_FR_TEXT_V21.Pestilence.Secreta];
            if (section === 'Communio') return ['!Luc 6:17-19', this.addTpV21(await sc('Luke 6:17-19'))];
            if (section === 'Postcommunio') return [...VOTIVE_FR_TEXT_V21.Pestilence.Postcommunio];
        }
        return [];
    }

    async recoverVotiveSectionV17(path, section, language, diagnostic, visited, depth) {
        if (language === 'la') return [];
        const spec = VOTIVE_SECTION_RECOVERY_V17[path]?.[section];
        const resolveSource = async (sourcePath, sourceSection) => {
            const parsed = await this.loadUpstreamParsed(sourcePath, language, diagnostic);
            const key = `v20-recovery|${language}|${sourcePath}|${sourceSection}`;
            const next = new Set(visited || []);
            if (next.has(key)) throw new Error(`Votive recovery cycle detected: ${key}`);
            next.add(key);
            return await this.resolveSection(parsed, sourceSection, sourcePath, language, 'upstream', diagnostic, next, depth + 1);
        };
        const v423Exact = language === 'en' ? [...(VOTIVE_EXTERNAL_VERIFIED_V423?.[path]?.en?.[section] || [])] : [];
        if (v423Exact.length) {
            diagnostic?.votiveRecoveries?.push?.({ language, path, section, kind: 'externalVerifiedV423' });
            diagnostic?.warnings?.push?.(`v42.3 exact-source votive recovery: ${language}/${path}:${section}.`);
            return v423Exact;
        }
        if (language === 'fr' && VOTIVE_FR_PATHS_V21.has(path)) {
            const frOut = await this.buildFrenchVotiveSectionV21(path, section, resolveSource);
            if (frOut.length) {
                diagnostic?.votiveRecoveries?.push?.({ language, path, section, kind: 'frenchV21' });
                diagnostic?.warnings?.push?.(`v21 sourced French votive recovery: ${language}/${path}:${section}.`);
                return frOut;
            }
        }
        if (!spec || (spec.languages && !spec.languages.includes(language))) return [];
        let out = [];
        if (spec.kind === 'directSource') {
            out = await resolveSource(spec.path, spec.section || section);
        } else if (spec.kind === 'embeddedV20') {
            out = [...(VOTIVE_EMBEDDED_V20[language]?.[spec.corpus]?.[section] || [])];
        } else if (spec.kind === 'crossGradualPV20') {
            out = language === 'en'
                ? [...(VOTIVE_EMBEDDED_V20.en?.Cross?.GradualeP || [])]
                : await resolveSource('Sancti/05-03', 'Graduale');
        } else if (spec.kind === 'crossPostcommunioV20') {
            out = language === 'en'
                ? [...(VOTIVE_EMBEDDED_V20.en?.Cross?.Postcommunio || [])]
                : await resolveSource('Sancti/09-14', 'Postcommunio');
        } else if (spec.kind === 'stripAlleluia') {
            out = stripSeasonalAlleluiaV17(await resolveSource(spec.path, spec.section), language);
        } else if (spec.kind === 'crossIntroit') {
            out = await resolveSource('Sancti/09-14', 'Introitus');
            const tp = language === 'fr' ? ' (T. P. Alléluia, alléluia.)' : ' (T. P. Alleluia, alleluia.)';
            out = out.map(line => {
                const s = String(line);
                return /Cross of our Lord Jesus Christ|Croix de Notre-Seigneur Jésus-Christ/i.test(s) ? s.replace(/\s*$/, '') + tp : s;
            });
        } else if (spec.kind === 'crossGospel') {
            out = await resolveSource('Tempora/Quad2-3', 'Evangelium');
            out = out.map(line => String(line).replace(/^!Matt\s*20:17-28\.?/i, '!Matt 20:17-19'));
            out = out.map(line => language === 'fr'
                ? String(line).replace(/\s+Alors la mère des fils de Zébédée[\s\S]*$/i, '')
                : String(line).replace(/\s+Then the mother of the sons of Zebedee[\s\S]*$/i, ''));
        } else if (spec.kind === 'crossOffertory') {
            out = await resolveSource('Sancti/09-14', 'Offertorium');
            const tp = language === 'fr' ? ' (T. P. Alléluia.)' : ' (T. P. Alleluia.)';
            const last = out.findLastIndex(line => !/^!/.test(String(line).trim()));
            if (last >= 0) out[last] = String(out[last]).replace(/,\s*all[eé]luia\.\s*$/i, '').replace(/\s*$/, '') + tp;
        } else if (spec.kind === 'crossCommunion') {
            out = await resolveSource('Sancti/09-14', 'Communio');
            const tp = language === 'fr' ? ' (T. P. Alléluia.)' : ' (T. P. Alleluia.)';
            const last = out.findLastIndex(line => !/^!/.test(String(line).trim()));
            if (last >= 0 && !/T\.\s*P\./i.test(String(out[last]))) out[last] = String(out[last]).replace(/\s*$/, '') + tp;
        } else if (spec.kind === 'holySpiritCollect') {
            out = await resolveSource('Tempora/Pasc7-0', 'Oratio');
            out = out.map(line => language === 'fr'
                ? String(line).replace(/,\s*aujourd'hui,\s*/i, ' ')
                : String(line).replace(/\bon this day\s+/i, ''));
        } else if (spec.kind === 'holySpiritGradual') {
            const base = await resolveSource('Tempora/Pent17-0', 'Graduale');
            let cut = base.findIndex(line => /^!Ps\s*101:2/i.test(String(line).trim()));
            if (cut < 0) cut = Math.min(3, base.length);
            const head = base.slice(0, cut);
            const ember = await resolveSource('Tempora/Pasc7-5', 'Graduale');
            let veni = [...ember].reverse().find(line => /^V\./i.test(String(line).trim())) || '';
            if (veni && !/all[eé]luia/i.test(veni)) veni += language === 'fr' ? ' Alléluia.' : ' Alleluia.';
            out = [...head, '! Hic genuflectitur', veni].filter(Boolean);
        } else if (spec.kind === 'holySpiritTract') {
            const pent = await resolveSource('Tempora/Pasc7-0', 'Graduale');
            const pidx = pent.findIndex(line => /^!Ps\.?\s*103:30/i.test(String(line).trim()));
            let emitte = pidx >= 0 ? pent[pidx + 1] : '';
            emitte = stripAlleluiaAndKneelV17(emitte).replace(/^V\.\s*/i, '');
            const ember = await resolveSource('Tempora/Pasc7-5', 'Graduale');
            const eidx = ember.findIndex(line => /^!(?:Wis|Ps)\s*12:1/i.test(String(line).trim()));
            let sweet = eidx >= 0 ? ember[eidx + 1] : '';
            let veni = eidx >= 0 ? ember[eidx + 2] : ([...ember].reverse().find(line => /^V\./i.test(String(line).trim())) || '');
            sweet = stripAlleluiaAndKneelV17(sweet);
            if (sweet && !/^V\./i.test(sweet)) sweet = `V. ${sweet}`;
            veni = stripAlleluiaAndKneelV17(veni);
            if (veni && !/^V\./i.test(veni)) veni = `V. ${veni}`;
            out = ['! Ps 103:30; Sap 12:1', emitte, sweet, '! Hic genuflectitur', veni].filter(Boolean);
        } else if (spec.kind === 'suffragiumExact') {
            out = await resolveSource('Ordo/Suffragium', spec.sourceSection);
        } else if (spec.kind === 'holySpirit2PrayerV19') {
            out = language === 'fr'
                ? await resolveSource('Ordo/Suffragium', spec.sourceSection)
                : [...(VOTIVE_EMBEDDED_V20.en?.HolySpirit2?.[section] || [])];
        } else if (spec.kind === 'josephSeasonalV19') {
            out = await resolveSource('Tempora/Pasc2-3', spec.sourceSection);
            out = stripSeasonalAlleluiaV17(out, language);
            const tp = ' (T. P. Alléluia.)';
            const last = out.findLastIndex(line => !/^!/.test(String(line).trim()) && !/^&/.test(String(line).trim()));
            if (last >= 0 && !/T\.\s*P\./i.test(String(out[last]))) out[last] = String(out[last]).replace(/[.]?\s*$/, '') + tp;
            // The Introit repeats after Gloria; apply the explicit votive T.P. marker there too.
            if (spec.sourceSection === 'Introitus') {
                const prose = out.map((line, i) => ({line:String(line), i})).filter(x => !/^[!&]/.test(x.line.trim()));
                if (prose.length > 1) {
                    const firstText = prose[0].line.replace(/\s*\(T\.\s*P\.[^)]+\)\.?\s*$/i,'').trim();
                    for (const x of prose) {
                        if (x.line.replace(/[.]\s*$/,'').includes(firstText.replace(/[.]\s*$/,'')) && !/T\.\s*P\./i.test(x.line))
                            out[x.i] = x.line.replace(/[.]?\s*$/, '') + tp;
                    }
                }
            }
        } else if (spec.kind === 'josephGradualV19') {
            const feast = await resolveSource('Sancti/03-19', 'Graduale');
            const patronage = await resolveSource('Tempora/Pasc2-3', 'Graduale');
            const ps20 = feast.findIndex(line => /^!Ps\s*20:4-5/i.test(String(line).trim()));
            const ps111 = feast.findIndex(line => /^!Ps\s*111:1-3/i.test(String(line).trim()));
            const head = ps20 >= 0 ? feast.slice(ps20, ps111 > ps20 ? ps111 : ps20 + 3) : [];
            if (head.length > 2) head[head.length - 1] = stripAlleluiaAndKneelV17(head[head.length - 1]).replace(/[.]?\s*$/, '') + '. Alléluia, alléluia.';
            let josephVerse = patronage.find(line => /Faites-nous mener|vie sans tache/i.test(String(line))) || '';
            josephVerse = stripAlleluiaAndKneelV17(josephVerse);
            if (josephVerse && !/^V\./i.test(josephVerse)) josephVerse = `V. ${josephVerse}`;
            out = [...head, josephVerse].filter(Boolean);
        } else if (spec.kind === 'josephTractV19') {
            const feast = await resolveSource('Sancti/03-19', 'Graduale');
            const ps111 = feast.findIndex(line => /^!Ps\s*111:1-3/i.test(String(line).trim()));
            out = ps111 >= 0 ? feast.slice(ps111, ps111 + 4) : [];
        } else if (spec.kind === 'apostlesGeneric') {
            out = await resolveSource('Sancti/10-28', spec.sourceSection);
            // The votive formulary is the same Simon-and-Jude prayer with the feast names omitted.
            // Remove only the proper names; retain the pinned same-language syntax and vocabulary.
            out = out.map(line => String(line).replace(/\s+Simon\s+(?:and|et)\s+Jude\b/gi, ''));
        } else if (spec.kind === 'apostlesTract') {
            out = await resolveSource('Sancti/08-08', 'Tractus');
        } else if (spec.kind === 'apostlesOffertory') {
            out = await resolveSource('Sancti/02-24', 'Offertorium');
            const suffix = language === 'fr' ? ' Alléluia, alléluia.' : ' Alleluia, alleluia.';
            const last = out.findLastIndex(line => !/^!/.test(String(line).trim()));
            if (last >= 0) out[last] = String(out[last]).replace(/[.]?\s*$/, '') + suffix;
        } else if (spec.kind === 'apostlesCommunion') {
            out = await resolveSource('Sancti/07-04oct', 'Offertorium');
            const suffix = language === 'fr' ? ' Alléluia, alléluia.' : ' Alleluia, alleluia.';
            const last = out.findLastIndex(line => !/^!/.test(String(line).trim()));
            if (last >= 0) out[last] = String(out[last]).replace(/[.]?\s*$/, '') + suffix;
        } else if (spec.kind === 'apostlesPGradual') {
            const martyrs = await resolveSource('Sancti/08-08', 'GradualeP');
            const apostle = await resolveSource('Sancti/10-18', 'Graduale');
            const psIdx = martyrs.findIndex(line => /!Ps\s*88:6/i.test(String(line)));
            let psVerse = psIdx >= 0 ? martyrs[psIdx + 1] : ([...martyrs].reverse().find(line => /heavens|cieux/i.test(String(line))) || '');
            psVerse = stripAlleluiaAndKneelV17(psVerse);
            if (psVerse && !/^V\./i.test(psVerse)) psVerse = `V. ${psVerse}`;
            psVerse = psVerse.replace(/[.]?\s*$/, '') + (language === 'fr' ? '. Alléluia, alléluia.' : '. Alleluia, alleluia.');
            let chosen = [...apostle].reverse().find(line => /chosen you|choisis/i.test(String(line))) || '';
            chosen = stripAlleluiaAndKneelV17(chosen).replace(/^!Joann?\s*15:16\.?\s*/i, '');
            if (chosen && !/^V\./i.test(chosen)) chosen = `V. ${chosen}`;
            out = [language === 'fr' ? 'Alléluia, alléluia.' : 'Alleluia, alleluia.', '!Ps 88:6', psVerse, '!Joann 15:16', chosen].filter(Boolean);
        }
        if (out.length) {
            diagnostic?.votiveRecoveries?.push?.({ language, path, section, kind: spec.kind });
            diagnostic?.warnings?.push?.(`v21 same-language votive recovery: ${language}/${path}:${section} (${spec.kind}).`);
        }
        return out;
    }
    async resolveSection(parsed, section, path, language, layer, diagnostic, visited, depth) {
        if (depth > 18)
            throw new Error(`Reference recursion limit exceeded at ${path}:${section}`);
        const body = parsed.map.get(section);
        if (!body || !body.length) {
            const recovered = await this.recoverVotiveSectionV17(path, section, language, diagnostic, visited, depth);
            if (recovered.length) return recovered;
            return [];
        }
        const result = [];
        for (const line of body) {
            const reference = parseReference(line, section);
            if (!reference) {
                result.push(line);
                continue;
            }
            const targetPath = reference.path || path;
            const targetSection = reference.section || section;
            const targetLayer = reference.path ? "upstream" : layer;
            const visitKey = `${targetLayer}|${language}|${targetPath}|${targetSection}|${reference.subs}`;
            if (visited.has(visitKey))
                throw new Error(`Reference cycle detected: ${visitKey}`);
            const next = new Set(visited);
            next.add(visitKey);
            const targetParsed = reference.path ? await this.loadUpstreamParsed(targetPath, language, diagnostic) : parsed;
            let nested = await this.resolveSection(targetParsed, targetSection, targetPath, language, targetLayer, diagnostic, next, depth + 1);
            nested = applySubstitutions(nested, reference.subs, diagnostic, `${targetPath}:${targetSection}`);
            diagnostic.referencesResolved.push({ from: `${layer}:${path}:${section}`, to: `${targetLayer}:${targetPath}:${targetSection}`, substitution: reference.subs || null });
            result.push(...nested);
        }
        return result;
    }
    async resolveSource(path, language, diagnostic) {
        const root = await this.loadLocalRoot(path, language, diagnostic);
        const map = new Map();
        const order = [];
        for (const section of root.order) {
            if (section === "__TOP__")
                continue;
            const lines = await this.resolveSection(root, section, path, language, "root", diagnostic, new Set([`root|${language}|${path}|${section}|`]), 0);
            map.set(section, lines);
            order.push(section);
        }
        return { map, order };
    }
    async resolvePreface(key, diagnostic) {
        const result = {};
        for (const language of ["la", "en", "fr"]) {
            const parsed = await this.loadUpstreamParsed("Ordo/Prefationes", language, diagnostic);
            let lines = await this.resolveSection(parsed, key, "Ordo/Prefationes", language, "upstream", diagnostic, new Set(), 0);
            if (!lines.length)
                lines = await this.resolveSection(parsed, "Communis", "Ordo/Prefationes", language, "upstream", diagnostic, new Set(), 0);
            result[language] = cleanLines(lines, language);
        }
        return result;
    }
    async resolveProper(meta, diagnostic) {
        const sources = {};
        for (const language of ["la", "en", "fr"])
            sources[language] = await this.resolveSource(meta.path, language, diagnostic);
        const rules = ruleInfo(sources);
        const preface = await this.resolvePreface(meta.inherited ? meta.preface || "Communis" : rules.preface || meta.preface || "Communis", diagnostic);
        return normalizeProper(meta, sources, preface, diagnostic);
    }
}
exports.ProperResolver = ProperResolver;
function cleanLines(lines, language) {
    const out = [];
    for (let line of lines || []) {
        line = String(line).trim();
        if (!line)
            continue;
        if (/^\(sed .*rubrica (1570|1910|1930|divino afflatu)/i.test(line))
            continue;
        if (line === "&Gloria") {
            out.push(GLORIA[language]);
            continue;
        }
        if (line === "$Per Dominum") {
            out.push(PER_DOM[language]);
            continue;
        }
        if (line === "$Per eundem") {
            out.push(PER_EUNDEM[language]);
            continue;
        }
        if (line === "$Qui tecum") {
            out.push(QUI_TECUM[language]);
            continue;
        }
        if (line === "$Qui vivis") {
            out.push(QUI_VIVIS[language]);
            continue;
        }
        if (line === "$Qui cum eodem") {
            out.push(QUI_CUM_EODEM[language]);
            continue;
        }
        if (line === "$Deo gratias") {
            out.push(language === "fr" ? "℟. Deo gratias — Rendons grâce à Dieu." : "℟. Deo gratias.");
            continue;
        }
        if (/^!/.test(line)) {
            out.push(line.slice(1).trim());
            continue;
        }
        line = line.replace(/^[Vv]\.\s*/, "℣. ").replace(/^[Rr]\.\s*/, "℟. ").replace(/\+\+/g, "✠").replace(/✠|✚|✙|✛|✜|✝|✞/g, "✠").replace(/(^|\s)\+(?=($|\s|[,.\;:!?)]))/g, "$1✠");
        out.push(line);
    }
    return out.join("\n").trim();
}
function textFrom(sources, section) {
    return {
        lat: cleanLines(sources.la.map.get(section) || [], "la"),
        en: cleanLines(sources.en.map.get(section) || [], "en"),
        fr: cleanLines(sources.fr.map.get(section) || [], "fr"),
    };
}
function firstExisting(sources, ids) {
    return ids.find(id => sources.la.map.has(id) || sources.en.map.has(id) || sources.fr.map.has(id)) || null;
}
function numbered(sources, base, includeBase = false) {
    const ids = new Set();
    for (const language of ["la", "en", "fr"]) {
        for (const id of sources[language].order) {
            if ((includeBase && id === base) || new RegExp(`^${base}\\d+$`).test(id))
                ids.add(id);
        }
    }
    if (includeBase && (sources.la.map.has(base) || sources.en.map.has(base) || sources.fr.map.has(base)))
        ids.add(base);
    return [...ids].sort((a, b) => a.localeCompare(b, undefined, { numeric: true })).map(id => textFrom(sources, id)).filter(value => value.lat || value.en || value.fr);
}
function ruleInfo(sources) {
    const text = (sources.la.map.get("Rule") || []).join("\n");
    const match = text.match(/Prefatio=([^\s;]+)/i);
    return { raw: text, gloria: /^Gloria$/m.test(text), credo: /^Credo$/m.test(text), preface: match ? match[1] : "Communis" };
}
function normalizeProper(meta, sources, preface, diagnostic) {
    const rules = ruleInfo(sources);
    const normal = new Set(["Officium", "Rank", "Rule", "Introitus", "Oratio", "Lectio", "Graduale", "GradualeP", "Tractus", "Sequentia", "Evangelium", "Offertorium", "Secreta", "Communio", "Postcommunio"]);
    const preparatoryLessons = [];
    for (let n = 1; n <= 12; n += 1) {
        const lessonId = `LectioL${n}`;
        if (!(sources.la.map.has(lessonId) || sources.en.map.has(lessonId) || sources.fr.map.has(lessonId)))
            continue;
        const gradualId = firstExisting(sources, [`GradualeL${n}`, `TractusL${n}`, `AlleluiaL${n}`]);
        const collectId = firstExisting(sources, [`OratioL${n}`]);
        preparatoryLessons.push({ id: `preparatory-${n}`, lesson: textFrom(sources, lessonId), gradual: gradualId ? textFrom(sources, gradualId) : {}, collect: collectId ? textFrom(sources, collectId) : {} });
        normal.add(lessonId);
        if (gradualId)
            normal.add(gradualId);
        if (collectId)
            normal.add(collectId);
    }
    const extraIds = [];
    for (const id of [...sources.la.order, ...sources.en.order, ...sources.fr.order]) {
        if (id === "__TOP__" || normal.has(id) || /^LectioL\d+$/.test(id) || /^GradualeL\d+$/.test(id) || /^OratioL\d+$/.test(id))
            continue;
        if (!extraIds.includes(id))
            extraIds.push(id);
    }
    const specialSections = extraIds.map(id => ({ id, text: textFrom(sources, id) })).filter(value => value.text.lat || value.text.en || value.text.fr);
    const gradualId = firstExisting(sources, ["Graduale", "GradualeP", "Tractus"]);
    const proper = {
        name: meta.name,
        nameFr: meta.nameFr || meta.name,
        rank: meta.rank,
        color: meta.color,
        properId: meta.properId,
        sourcePath: meta.path,
        riteProfile: meta.profile,
        introit: textFrom(sources, "Introitus"),
        collects: numbered(sources, "Oratio", true),
        epistle: textFrom(sources, "Lectio"),
        gradual: gradualId ? textFrom(sources, gradualId) : {},
        preGospelChants: gradualId ? [{ kind: gradualId.toLowerCase(), text: textFrom(sources, gradualId) }] : [],
        sequence: textFrom(sources, "Sequentia"),
        gospel: textFrom(sources, "Evangelium"),
        offertory: textFrom(sources, "Offertorium"),
        secrets: numbered(sources, "Secreta"),
        preface,
        communion: textFrom(sources, "Communio"),
        postcommunions: numbered(sources, "Postcommunio"),
        preparatoryLessons,
        specialSections,
        showGloria: meta.gloria,
        showCredo: meta.credo,
        sourceRules: rules.raw,
        sourceRevisions: source_config_1.SOURCE_REVISIONS,
        hasGloria: meta.gloria,
        hasCredo: meta.credo,
    };
    proper.collect = proper.collects[0] || {};
    proper.secret = proper.secrets[0] || {};
    proper.postcommunion = proper.postcommunions[0] || {};
    const expected = [];
    const pushExpected = (label, value) => { if (value?.lat) expected.push([label, value]); };
    pushExpected("Introit", proper.introit);
    proper.collects.forEach((v, i) => pushExpected(`Collect ${i + 1}`, v));
    pushExpected("Epistle / Lesson", proper.epistle);
    pushExpected("Gradual / Tract / Alleluia", proper.gradual);
    pushExpected("Sequence", proper.sequence);
    pushExpected("Gospel", proper.gospel);
    pushExpected("Offertory", proper.offertory);
    proper.secrets.forEach((v, i) => pushExpected(`Secret ${i + 1}`, v));
    pushExpected("Preface", proper.preface);
    pushExpected("Communion", proper.communion);
    proper.postcommunions.forEach((v, i) => pushExpected(`Postcommunion ${i + 1}`, v));
    proper.preparatoryLessons.forEach((row, i) => { pushExpected(`Preparatory lesson ${i + 1}`, row.lesson); pushExpected(`Preparatory chant ${i + 1}`, row.gradual); pushExpected(`Preparatory collect ${i + 1}`, row.collect); });
    proper.languageCoverage = {};
    for (const language of ["en", "fr"]) {
        const missing = expected.filter(([, value]) => !String(value?.[language] || "").trim()).map(([label]) => label);
        proper.languageCoverage[language] = { expected: expected.length, available: expected.length - missing.length, missing, complete: missing.length === 0 };
    }
    diagnostic.warnings.push(...(rules.gloria !== meta.gloria ? [`Gloria metadata (${meta.gloria}) differs from source Rule (${rules.gloria}).`] : []));
    diagnostic.warnings.push(...(rules.credo !== meta.credo ? [`Credo metadata (${meta.credo}) differs from source Rule (${rules.credo}).`] : []));
    return proper;
}


};
__mods[11]=function(module,exports,require){

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BELLARMINE_TRANSCRIPTION = exports.BELLARMINE_JINA_TRANSCRIPTION = exports.BELLARMINE_JINA_OCR = exports.BELLARMINE_IA_OCR = exports.BELLARMINE_SCAN = exports.BELLARMINE_SOURCE = exports.HAYDOCK_BASE = exports.PERONNE_BASE = exports.VULGATE_URL = exports.VULGATE_REVISION = exports.CRAMPON_URL = exports.CRAMPON_REVISION = exports.CATENA_BASE = exports.ODR_BASE = void 0;
exports.ODR_BASE = 'https://raw.githubusercontent.com/janvier-s/original-douay-rheims/main/bible/raw/';
exports.CATENA_BASE = 'https://raw.githubusercontent.com/AlvaroBalbin/catena/main/data/catena/';
exports.HAYDOCK_BASE = 'https://raw.githubusercontent.com/ronaldoscotti/catholic-bible/v2.0.0/data/commentary/haydock/books/';
// Bellarmine 1866 source chain. The Internet Archive scan is the edition-level source of truth.
exports.BELLARMINE_SOURCE = 'https://archive.org/details/commentaryonbook0000bell';
exports.BELLARMINE_SCAN = 'https://commons.wikimedia.org/wiki/File:Commentaryonbook0000bell.pdf';
exports.BELLARMINE_IA_OCR = 'https://archive.org/download/commentaryonbook0000bell/commentaryonbook0000bell_djvu.txt';
// Reader mirrors are retrieval fallbacks only; provenance remains the 1866 James Duffy edition/IA scan.
exports.BELLARMINE_JINA_OCR = 'https://r.jina.ai/http://archive.org/download/commentaryonbook0000bell/commentaryonbook0000bell_djvu.txt';
exports.BELLARMINE_JINA_TRANSCRIPTION = 'https://r.jina.ai/http://www.ecatholic2000.com/bellarmine/commentary-on-psalms.shtml';
exports.BELLARMINE_TRANSCRIPTION = 'https://www.ecatholic2000.com/bellarmine/commentary-on-psalms.shtml';
exports.CRAMPON_REVISION = 'e1b254cef86d0e65b1a5d1a94b8b112d0f296a2c';
exports.CRAMPON_URL = `https://raw.githubusercontent.com/scrollmapper/bible_databases/${exports.CRAMPON_REVISION}/sources/fr/FreCrampon/FreCrampon.json`;
exports.VULGATE_REVISION = exports.CRAMPON_REVISION;
exports.VULGATE_URL = `https://raw.githubusercontent.com/scrollmapper/bible_databases/${exports.VULGATE_REVISION}/sources/la/VulgClementine/VulgClementine.json`;
exports.PERONNE_BASE = 'https://www.apologetique.net/EvangilePere/EvangilePere.aspx?reference=';
exports.PERONNE_WIKISOURCE_API = 'https://fr.wikisource.org/w/api.php';
exports.PERONNE_BNF_CATALOG = 'https://catalogue.bnf.fr/ark:/12148/cb314619721';


};
__mods[12]=function(module,exports,require){

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseScriptureReferences = parseScriptureReferences;
exports.parseScriptureReference = parseScriptureReference;
exports.cleanPericopeText = cleanPericopeText;
const norm = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
// AO canonical identities remain traditional/Vulgate-facing. Modern names are accepted only as aliases.
const books = [
    [/^(?:mt|mat|matt|matthew|matthaeus|matthieu)$/, 'matthew', 'Matthew', 'Matthieu', 'gospel'],
    [/^(?:mk|mc|marc|mark|marcus)$/, 'mark', 'Mark', 'Marc', 'gospel'],
    [/^(?:lk|lc|luc|luke|lucas)$/, 'luke', 'Luke', 'Luc', 'gospel'],
    [/^(?:jn|jo|john|jean|joann|ioann|joannes)$/, 'john', 'John', 'Jean', 'gospel'],
    [/^(?:acts?|act|actus|actes)$/, 'acts', 'Acts', 'Actes', 'nt'],
    [/^(?:rom|romans?|romains)$/, 'romans', 'Romans', 'Romains', 'nt'],
    [/^(?:1 cor|1 corinthians?|i cor|1 corinthiens)$/, '1-corinthians', '1 Corinthians', '1 Corinthiens', 'nt'],
    [/^(?:2 cor|2 corinthians?|ii cor|2 corinthiens)$/, '2-corinthians', '2 Corinthians', '2 Corinthiens', 'nt'],
    [/^(?:gal|galatians?|galates)$/, 'galatians', 'Galatians', 'Galates', 'nt'],
    [/^(?:eph|ephes|ephesians?|ephesiens)$/, 'ephesians', 'Ephesians', 'Éphésiens', 'nt'],
    [/^(?:phil|philippians?|philippiens)$/, 'philippians', 'Philippians', 'Philippiens', 'nt'],
    [/^(?:col|colossians?|colossiens)$/, 'colossians', 'Colossians', 'Colossiens', 'nt'],
    [/^(?:1 thess|1 thessalonians?|i thess|1 thessaloniciens)$/, '1-thessalonians', '1 Thessalonians', '1 Thessaloniciens', 'nt'],
    [/^(?:2 thess|2 thessalonians?|ii thess|2 thessaloniciens)$/, '2-thessalonians', '2 Thessalonians', '2 Thessaloniciens', 'nt'],
    [/^(?:1 tim|1 timothy|i tim|1 timothee)$/, '1-timothy', '1 Timothy', '1 Timothée', 'nt'],
    [/^(?:2 tim|2 timothy|ii tim|2 timothee)$/, '2-timothy', '2 Timothy', '2 Timothée', 'nt'],
    [/^(?:tit|titus|tite)$/, 'titus', 'Titus', 'Tite', 'nt'],
    [/^(?:philem|philemon)$/, 'philemon', 'Philemon', 'Philémon', 'nt'],
    [/^(?:heb|hebrews?|hebreux)$/, 'hebrews', 'Hebrews', 'Hébreux', 'nt'],
    [/^(?:jas|james|jac|jacques)$/, 'james', 'James', 'Jacques', 'nt'],
    [/^(?:1 pet|1 peter|i pet|1 pierre)$/, '1-peter', '1 Peter', '1 Pierre', 'nt'],
    [/^(?:2 pet|2 peter|ii pet|2 pierre)$/, '2-peter', '2 Peter', '2 Pierre', 'nt'],
    [/^(?:1 jn|1 john|i jn|1 jean)$/, '1-john', '1 John', '1 Jean', 'nt'],
    [/^(?:2 jn|2 john|ii jn|2 jean)$/, '2-john', '2 John', '2 Jean', 'nt'],
    [/^(?:3 jn|3 john|iii jn|3 jean)$/, '3-john', '3 John', '3 Jean', 'nt'],
    [/^(?:jude|jud)$/, 'jude', 'Jude', 'Jude', 'nt'],
    [/^(?:apoc|apocalypse|rev|revelation)$/, 'apocalypse', 'Apocalypse', 'Apocalypse', 'nt'],

    [/^(?:gen|genesis|genese)$/, 'genesis', 'Genesis', 'Genèse', 'ot'],
    [/^(?:ex|exod|exodus|exode)$/, 'exodus', 'Exodus', 'Exode', 'ot'],
    [/^(?:lev|leviticus|levitique)$/, 'leviticus', 'Leviticus', 'Lévitique', 'ot'],
    [/^(?:num|numbers|nombres)$/, 'numbers', 'Numbers', 'Nombres', 'ot'],
    [/^(?:deut|deuteronomy|deuteronome)$/, 'deuteronomy', 'Deuteronomy', 'Deutéronome', 'ot'],
    [/^(?:jos|josue|joshua)$/, 'josue', 'Josue', 'Josué', 'ot'],
    [/^(?:judg|judges|juges)$/, 'judges', 'Judges', 'Juges', 'ot'],
    [/^(?:rut|ruth|rute)$/, 'ruth', 'Ruth', 'Ruth', 'ot'],
    [/^(?:1 kings?|1 sam(?:uel)?|i kings?|i sam(?:uel)?)$/, '1-kings', '1 Kings', '1 Samuel', 'ot'],
    [/^(?:2 kings?|2 sam(?:uel)?|ii kings?|ii sam(?:uel)?)$/, '2-kings', '2 Kings', '2 Samuel', 'ot'],
    [/^(?:3 kings?|1 ki|1 rois?|iii kings?)$/, '3-kings', '3 Kings', '1 Rois', 'ot'],
    [/^(?:4 kings?|2 ki|2 rois?|iv kings?)$/, '4-kings', '4 Kings', '2 Rois', 'ot'],
    [/^(?:1 chron(?:icles)?|i chron(?:icles)?|1 paralip(?:omenon)?|i paralip(?:omenon)?)$/, '1-paralipomenon', '1 Paralipomenon', '1 Paralipomènes', 'ot'],
    [/^(?:2 chron(?:icles)?|ii chron(?:icles)?|2 paralip(?:omenon)?|ii paralip(?:omenon)?)$/, '2-paralipomenon', '2 Paralipomenon', '2 Paralipomènes', 'ot'],
    [/^(?:1 esdras|i esdras|ezra|esdras)$/, '1-esdras', '1 Esdras', '1 Esdras', 'ot'],
    [/^(?:2 esdras|ii esdras|nehemias|nehemiah|nehemie)$/, '2-esdras', '2 Esdras', '2 Esdras', 'ot'],
    [/^(?:tob|tobias|tobit|tobie)$/, 'tobias', 'Tobias', 'Tobie', 'ot'],
    [/^(?:jdt|judith)$/, 'judith', 'Judith', 'Judith', 'ot'],
    [/^(?:esth|esther|ester)$/, 'esther', 'Esther', 'Esther', 'ot'],
    [/^(?:1 mach(?:abees)?|i mach(?:abees)?|1 macc(?:abees)?)$/, '1-machabees', '1 Machabees', '1 Machabées', 'ot'],
    [/^(?:2 mach(?:abees)?|ii mach(?:abees)?|2 macc(?:abees)?)$/, '2-machabees', '2 Machabees', '2 Machabées', 'ot'],
    [/^(?:job)$/, 'job', 'Job', 'Job', 'ot'],
    [/^(?:ps|psa|psalm|psalms|psalmus|psalmi|psaume|psaumes)$/, 'psalms', 'Psalms', 'Psaumes', 'psalm'],
    [/^(?:prov|proverbs|proverbes)$/, 'proverbs', 'Proverbs', 'Proverbes', 'ot'],
    [/^(?:eccl|ecclesiastes|qohelet)$/, 'ecclesiastes', 'Ecclesiastes', 'Ecclésiaste', 'ot'],
    [/^(?:cant|canticles|song(?: of songs)?|cantique(?: des cantiques)?)$/, 'canticle-of-canticles', 'Canticle of Canticles', 'Cantique des Cantiques', 'ot'],
    [/^(?:wis|wisdom|sagesse)$/, 'wisdom', 'Wisdom', 'Sagesse', 'ot'],
    [/^(?:ecclus|ecclesiasticus|sirach|siracide)$/, 'ecclesiasticus', 'Ecclesiasticus', 'Ecclésiastique', 'ot'],
    [/^(?:is|isa|isaias|isaiah|isaie)$/, 'isaias', 'Isaias', 'Isaïe', 'ot'],
    [/^(?:jer|jeremias|jeremiah|jeremie)$/, 'jeremias', 'Jeremias', 'Jérémie', 'ot'],
    [/^(?:lam|lamentations)$/, 'lamentations', 'Lamentations', 'Lamentations', 'ot'],
    [/^(?:bar|baruch)$/, 'baruch', 'Baruch', 'Baruch', 'ot'],
    [/^(?:ez|ezech|ezechiel|ezekiel)$/, 'ezechiel', 'Ezechiel', 'Ézéchiel', 'ot'],
    [/^(?:dan|daniel)$/, 'daniel', 'Daniel', 'Daniel', 'ot'],
    [/^(?:os|osee|hosea)$/, 'osee', 'Osee', 'Osée', 'ot'],
    [/^(?:joel)$/, 'joel', 'Joel', 'Joël', 'ot'],
    [/^(?:amos)$/, 'amos', 'Amos', 'Amos', 'ot'],
    [/^(?:abd|abdias|obadiah|obadie)$/, 'abdias', 'Abdias', 'Abdias', 'ot'],
    [/^(?:jon|jonas|jonah)$/, 'jonas', 'Jonas', 'Jonas', 'ot'],
    [/^(?:mic|micheas|micah|michee)$/, 'micheas', 'Micheas', 'Michée', 'ot'],
    [/^(?:nah|nahum)$/, 'nahum', 'Nahum', 'Nahum', 'ot'],
    [/^(?:hab|habacuc)$/, 'habacuc', 'Habacuc', 'Habacuc', 'ot'],
    [/^(?:soph|sophonias|zephaniah|sophonie)$/, 'sophonias', 'Sophonias', 'Sophonie', 'ot'],
    [/^(?:agg|aggeus|haggai|aggee)$/, 'aggeus', 'Aggeus', 'Aggée', 'ot'],
    [/^(?:zach|zacharias|zechariah|zacharie)$/, 'zacharias', 'Zacharias', 'Zacharie', 'ot'],
    [/^(?:mal|malachias|malachi|malachie)$/, 'malachias', 'Malachias', 'Malachie', 'ot'],

    // Vulgate appendix: useful for traditional liturgical citations, but not routed to Haydock.
    [/^(?:prayer of manasses|oratio manassae|manasses)$/, 'prayer-of-manasses', 'Prayer of Manasses', 'Prière de Manassé', 'vulgate-appendix'],
    [/^(?:3 esdras|iii esdras)$/, '3-esdras', '3 Esdras', '3 Esdras', 'vulgate-appendix'],
    [/^(?:4 esdras|iv esdras)$/, '4-esdras', '4 Esdras', '4 Esdras', 'vulgate-appendix']
];
function parseLineReference(line) {
    const re = /^((?:(?:[1-4]|I{1,3}|IV)\s*)?[A-Za-zÀ-ÿÆæ.]+(?:\s+[A-Za-zÀ-ÿÆæ.]+){0,3})\s+(\d{1,3})\s*[:,.]\s*(\d{1,3})(?:\s*[-–—]\s*(\d{1,3}))?/i;
    const m = line.replace(/^IV\s+/i, '4 ').replace(/^III\s+/i, '3 ').replace(/^II\s+/i, '2 ').replace(/^I\s+/i, '1 ').match(re);
    if (!m) return null;
    const token = norm(m[1].replace(/\./g, ''));
    const hit = books.find(([rx]) => rx.test(token));
    if (!hit) return null;
    const [, slug, label, frLabel, kind] = hit;
    return { slug, label, frLabel, kind, chapter:+m[2], start:+m[3], end:+(m[4]||m[3]), display:`${label} ${m[2]}:${m[3]}${m[4]?'–'+m[4]:''}`, displayFr:`${frLabel} ${m[2]},${m[3]}${m[4]?'–'+m[4]:''}` };
}
function sourceLines(obj) {
    // Parse one linguistic representation only, avoiding duplicate citations across EN/LA/FR.
    const candidates = [obj?.en, obj?.eng, obj?.lat, obj?.fr].filter(Boolean);
    let fallback = [];
    for (const source of candidates) {
        const lines = String(source || '').replace(/<br\s*\/?>/gi,'\n').replace(/<[^>]+>/g,' ').split(/\n+/).map(x=>x.replace(/\s+/g,' ').trim()).filter(Boolean);
        if (!fallback.length) fallback = lines;
        if (lines.some(line => !!parseLineReference(line))) return lines;
    }
    return fallback;
}
function parseScriptureReferences(obj) {
    const lines = sourceLines(obj);
    const refs=[];
    for (const line of lines) {
        const first=parseLineReference(line);
        if (!first) continue;
        refs.push(first);
        // Additional citations on the same source line: ; Book 1:2 / + Book 1:2 / ; 1:2 (inherit book).
        const tail=line.replace(/^.*?\d{1,3}\s*[:,.]\s*\d{1,3}(?:\s*[-–—]\s*\d{1,3})?/,'');
        const pieces=tail.split(/\s*(?:;|\+)\s*/).filter(Boolean);
        const sameChapter = [...tail.matchAll(/,\s*(\d{1,3})(?:\s*[-–—]\s*(\d{1,3}))?/g)].map(m => ({start:+m[1],end:+(m[2]||m[1])}));
        for (const sv of sameChapter) {
            const r={...first,start:sv.start,end:sv.end,display:`${first.label} ${first.chapter}:${sv.start}${sv.end!==sv.start?'–'+sv.end:''}`,displayFr:`${first.frLabel} ${first.chapter},${sv.start}${sv.end!==sv.start?'–'+sv.end:''}`};
            if (!refs.some(x=>x.slug===r.slug&&x.chapter===r.chapter&&x.start===r.start&&x.end===r.end)) refs.push(r);
        }
        for (const piece of pieces) {
            let r=parseLineReference(piece);
            if (!r) {
                const m=piece.match(/^(\d{1,3})\s*[:,.]\s*(\d{1,3})(?:\s*[-–—]\s*(\d{1,3}))?/);
                if (m) r={...first,chapter:+m[1],start:+m[2],end:+(m[3]||m[2]),display:`${first.label} ${m[1]}:${m[2]}${m[3]?'–'+m[3]:''}`,displayFr:`${first.frLabel} ${m[1]},${m[2]}${m[3]?'–'+m[3]:''}`};
            }
            if (r && !refs.some(x=>x.slug===r.slug&&x.chapter===r.chapter&&x.start===r.start&&x.end===r.end)) refs.push(r);
        }
        break;
    }
    return { relationship: refs.length>1?'composite':refs.length===1?(refs[0].kind==='psalm'?'psalm_verse':'exact'):'unknown', refs };
}
function parseScriptureReference(obj) {
    return parseScriptureReferences(obj).refs[0] || null;
}
function cleanPericopeText(obj, lang) { const raw = lang === 'en' ? (obj?.en || obj?.eng || '') : (obj?.[lang] || ''); const p = parseScriptureReference(obj); return String(raw).replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, ' ').split(/\n+/).map(x => x.replace(/\s+/g, ' ').trim()).filter(Boolean).filter(x => !(p && /\d\s*[:,]\s*\d/.test(x))).filter(x => !/^(continuation|sequel|lectio|lesson|the holy gospel|the gospel|initium|sequéntia|in illo tempore|fratres|suite|lecture|evangile|évangile|en ce temps-la|en ce temps-là)\b/i.test(x)).join('\n').trim(); }


};

const __cache={};
function __req(id){if(__cache[id])return __cache[id].exports;const m={exports:{}};__cache[id]=m;if(!__mods[id])throw new Error('R09 module '+id+' unavailable');__mods[id](m,m.exports,__req);return m.exports}
class BrowserTextFetcher{
 constructor(){this.memory=new Map()}
 clear(){this.memory.clear()}
 async get(url,diagnostic){
  if(this.memory.has(url)){diagnostic?.cacheHits?.push({url,layer:'r09-browser'});return this.memory.get(url)}
  diagnostic?.requestedFiles?.push(url);
  const r=await fetch(url,{cache:'no-cache',redirect:'follow'});if(!r.ok){const e=new Error(`HTTP ${r.status} · ${url}`);e.status=r.status;throw e}
  const t=await r.text();this.memory.set(url,t);return t
 }
 async tryGet(url,diagnostic){try{return await this.get(url,diagnostic)}catch(e){if(e?.status===404)return null;throw e}}
}
const M8=__req(8), ProperResolver=M8.ProperResolver;
const cacheKey=path=>'ao-r09-proper-cache:'+encodeURIComponent(String(path||''));
function createDiagnostic(){return {requestedFiles:[],cacheHits:[],referencesResolved:[],languageGaps:[],structuralInheritances:[],legacyCommonRecoveries:[],warnings:[],errors:[]}}
async function resolve(meta={}){
 const path=String(meta.path||meta.sourcePath||'').trim();if(!path)throw new Error('Proper source path required');
 const diagnostic=createDiagnostic();const resolver=new ProperResolver(new BrowserTextFetcher());
 const input={name:meta.name||meta.title||path,nameFr:meta.nameFr||meta.name||meta.title||path,rank:meta.rank||'',color:meta.color||'',properId:meta.properId||path,path,profile:meta.profile||'ordinary_mass',preface:meta.preface||'Communis',inherited:!!meta.inherited,gloria:meta.gloria!==false,credo:meta.credo!==false};
 const proper=await resolver.resolveProper(input,diagnostic);
 const rules=String(proper.sourceRules||'');const sourceGloria=/^Gloria$/m.test(rules),sourceCredo=/^Credo$/m.test(rules);const gm=String(meta.gloriaMode||'auto').toLowerCase(),cm=String(meta.credoMode||'auto').toLowerCase();proper.sourceRuleGloria=sourceGloria;proper.sourceRuleCredo=sourceCredo;proper.showGloria=gm==='auto'?sourceGloria:gm==='on';proper.showCredo=cm==='auto'?sourceCredo:cm==='on';proper.celebrationType=meta.celebrationType||'manual';
 const packet={version:'R09-v43.39-module8',path,meta:{...input,gloriaMode:gm,credoMode:cm,celebrationType:proper.celebrationType},proper,diagnostic,resolvedAt:new Date().toISOString()};
 try{localStorage.setItem(cacheKey(path),JSON.stringify(packet));localStorage.setItem('ao-r14-proper-path',path);localStorage.setItem('ao-r14-proper-title',input.name)}catch(_){}
 return packet;
}
function cached(path){try{const x=localStorage.getItem(cacheKey(path));if(!x)return null;const p=JSON.parse(x);return p?.path===path?p:null}catch(_){return null}}
AO.ProperResolverR09=Object.freeze({version:'R09',ProperResolver,BrowserTextFetcher,resolve,cached,cacheKey,moduleIds:Object.freeze([4,8,11,12])});
})();

