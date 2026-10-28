import {resolve1962OrganPermission} from "./reader-rite-music-authority.js";
// Source-first, read-only Schola event itinerary for the existing curated
// LIVE Mass cards. Musical windows are not evidence of observed singing.
// Source blocks and exact curated IDs, never historical numeric card slots,
// determine ownership. No imports from the unapproved GABC research archive.
const freeze=Object.freeze;
const SUNG=new Set(["MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"]);
const ALL_KINDS=new Set(["CHANT","PRIEST_VOICE","QUIET_INTERVAL","ORGAN_OPTION",
  "LOCAL_OPTION","DISPLAY_REFERENCE"]);
const source=(section,block=null)=>freeze({section,block});
// The event order is editorial, but EACH position must be recovered from
// the actual resolved 65/66/67-card source model; this catalogue does not
// create new liturgical blocks or advance the Schola's independent clock.
export const MASS_SCHOLA_EVENT_SPECS=freeze([
  {id:"ENTRANCE_ORGAN_OPTION",kind:"ORGAN_OPTION",label:"Entrance organ music (if permitted)",at:source("AO.CARD.001")},
  {id:"INTROIT",kind:"CHANT",trackId:"INTROIT",label:"Introit",at:source("AO.CARD.001","AO.SM.B014")},
  {id:"KYRIE",kind:"CHANT",trackId:"KYRIE",label:"Kyrie",at:source("AO.CARD.002")},
  {id:"GLORIA_INTONATION",kind:"PRIEST_VOICE",label:"Celebrant intones Gloria",at:source("AO.CARD.003"),needs:"GLORIA"},
  {id:"GLORIA",kind:"CHANT",trackId:"GLORIA",label:"Gloria · choir response",at:source("AO.CARD.003"),needs:"GLORIA"},
  {id:"COLLECT",kind:"PRIEST_VOICE",label:"Collect and sung responses",at:source("AO.CARD.004")},
  {id:"LESSON",kind:"QUIET_INTERVAL",label:"Lesson · attend to the reading",at:source("AO.CARD.005")},
  {id:"GRADUAL",kind:"CHANT",trackId:"GRADUAL",label:"Gradual / source-owned pre-Gospel chant",at:source("AO.CARD.006","AO.SM.B021")},
  // B022 may be absent, or may be a Sequence only; do not invent a split
  // Alleluia/Tract where the B021 source still holds combined text.
  {id:"PRE_GOSPEL_FOLLOWUP",kind:"CHANT",trackId:"ALLELUIA_TRACT_SEQUENCE",
    label:"Source-owned Alleluia, Tract or Sequence",at:source("AO.CARD.006","AO.SM.B022")},
  {id:"GOSPEL",kind:"PRIEST_VOICE",label:"Gospel and responses",at:source("AO.CARD.007")},
  {id:"HOMILY",kind:"QUIET_INTERVAL",label:"Sermon · no Schola setting assumed",at:source("AO.CARD.008")},
  {id:"CREDO_INTONATION",kind:"PRIEST_VOICE",label:"Celebrant intones Credo",at:source("AO.CARD.009"),needs:"CREDO"},
  {id:"CREDO",kind:"CHANT",trackId:"CREDO",label:"Credo · choir response",at:source("AO.CARD.009"),needs:"CREDO"},
  {id:"OFFERTORY",kind:"CHANT",trackId:"OFFERTORY",label:"Offertory antiphon",at:source("AO.CARD.010","AO.SM.B030")},
  {id:"OFFERTORY_LOCAL_MOTET",kind:"LOCAL_OPTION",label:"Further Offertory music · local programme only",at:source("AO.CARD.010")},
  {id:"OFFERTORY_ORGAN_OPTION",kind:"ORGAN_OPTION",label:"Offertory organ interlude (if permitted)",at:source("AO.CARD.011")},
  {id:"ORATE_SECRET",kind:"PRIEST_VOICE",label:"Orate fratres and public Secret conclusion",at:source("AO.CARD.011")},
  {id:"PREFACE_DIALOGUE",kind:"PRIEST_VOICE",label:"Preface dialogue and chant",at:source("AO.CARD.012")},
  {id:"SANCTUS",kind:"CHANT",trackId:"SANCTUS_BENEDICTUS",label:"Sanctus",at:source("AO.CARD.013")},
  {id:"BENEDICTUS_CONTINUOUS",kind:"CHANT",trackId:"SANCTUS_BENEDICTUS",
    label:"Benedictus · same Gregorian performance",at:source("AO.CARD.013"),performance:"GREGORIAN"},
  {id:"CANON",kind:"QUIET_INTERVAL",label:"Canon · Schola progress remains independent",at:source("AO.CANON.01")},
  {id:"HOST_CONSECRATION_SILENCE",kind:"QUIET_INTERVAL",label:"Consecration of Host · organ silent",
    at:source("AO.CANON.06","AO.SM.B052"),precision:"CONSECRATION_CUE_ONLY"},
  {id:"CHALICE_CONSECRATION_SILENCE",kind:"QUIET_INTERVAL",label:"Consecration of Chalice · organ silent",
    at:source("AO.CANON.07","AO.SM.B053"),precision:"CONSECRATION_CUE_ONLY"},
  // The independently observed delayed Benedictus may only start AFTER
  // the last B053 card, never just because that prayer is on-screen.
  {id:"BENEDICTUS_AFTER_CHALICE",kind:"CHANT",trackId:"SANCTUS_BENEDICTUS",
    label:"Benedictus · after Chalice (local polyphonic practice)",
    afterBlock:"AO.SM.B053",at:source("AO.CANON.07"),performance:"POLYPHONIC",
    manualOnly:true},
  {id:"PATERNOSTER",kind:"PRIEST_VOICE",label:"Pater noster and responses",at:source("AO.CARD.019")},
  {id:"PAX_COMMICTIO",kind:"PRIEST_VOICE",label:"Pax Domini and commingling",at:source("AO.CARD.020")},
  {id:"AGNUS_DEI",kind:"CHANT",trackId:"AGNUS_DEI",label:"Agnus Dei",at:source("AO.CARD.021")},
  {id:"PRIEST_COMMUNION_PREPARATION",kind:"QUIET_INTERVAL",
    label:"Prayers before the priest's Communion",at:source("AO.CARD.022")},
  {id:"COMMUNION",kind:"CHANT",trackId:"COMMUNION",label:"Communion antiphon · reception window",
    at:source("AO.CARD.023","AO.SM.B074")},
  {id:"COMMUNION_LOCAL_MOTET",kind:"LOCAL_OPTION",label:"Communion motet / further chant · local choice",
    at:source("AO.CARD.025")},
  {id:"COMMUNION_PRINTED",kind:"DISPLAY_REFERENCE",
    label:"Printed Communion antiphon (same chant, not a second performance)",
    at:source("AO.CARD.026","AO.SM.B085")},
  {id:"POSTCOMMUNION",kind:"PRIEST_VOICE",label:"Postcommunion and response",at:source("AO.CARD.027")},
  {id:"DISMISSAL",kind:"PRIEST_VOICE",label:"Dismissal / Requiescant in pace",at:source("AO.CARD.028")},
  {id:"BLESSING",kind:"QUIET_INTERVAL",label:"Final blessing · organ silent while given",
    at:source("AO.CARD.029"),precision:"BLESSING_CUE_ONLY",omitForRequiem:true},
  {id:"LAST_GOSPEL",kind:"PRIEST_VOICE",label:"Last Gospel",at:source("AO.CARD.030")},
  {id:"RECESSIONAL_ORGAN_OPTION",kind:"ORGAN_OPTION",label:"Recessional organ (if permitted)",
    at:source("AO.CARD.030")},
].map(row=>freeze(row)));

const sourceId=card=>String(card?.sourceSectionId??card?.sectionId??"");
const blockOwned=(card,id)=>(card?.blocks??[]).some(b=>b.blockId===id&&
   b.omittedByRite==null && (b.paragraphCount==null || b.paragraphCount>0));

const KNOWN_SEASONS=new Set(["ADVENT","LENT","PASSIONTIDE","SEPTUAGESIMA","SEXAGESIMA",
 "QUINQUAGESIMA","CHRISTMAS","EPIPHANY","EASTER","PENTECOST","ORDINARY"]);
/** Only the canonical 1958 resolver determines organ permission.
 * Verified date/season is mandatory outside the independently attested
 * Requiem ban. No broad card is a substitute for a precise priest cue. */
export function organAuthorityForScholaEvent(event,resolvedMass){
 if(event?.kind!=="ORGAN_OPTION")return null;
 const plan=resolvedMass?.provenance?.organ1962??null;
 const verified=plan?.verified===true&&plan.source==="LITURGICAL_PLAN_1962";
 const requiem=resolvedMass?.overlays?.includes("REQUIEM")===true;
 const season=verified&&KNOWN_SEASONS.has(String(plan?.season??"").toUpperCase())
   ?String(plan.season).toUpperCase():null;
 const base=freeze({authority:"EXISTING_1958_ORGAN_PERMISSION",
  actuallyPlaying:"UNKNOWN",notAnObservation:true,
  precision:"SOURCE_SECTION_NOT_EXACT_PRIEST_CUE"});
 if(!season&&!requiem)return freeze({...base,status:"REQUIRES_CONTEXT",
  reason:"LITURGICAL_SEASON_NOT_SOURCE_VERIFIED",solo:"REQUIRES_CONTEXT",
  accompaniment:"REQUIRES_CONTEXT",references:freeze([])});
 // The special Triduum exceptions need a verified moment boundary, not
 // only a season label. Separate rite controllers own those boundaries.
 if(verified&&plan.triduum===true)return freeze({...base,status:"REQUIRES_EXACT_RITE_STAGE",
  reason:"TRIDUUM_STAGE_NOT_CERTIFIED_BY_ORDINARY_CARD",
  solo:"REQUIRES_CONTEXT",accompaniment:"REQUIRES_CONTEXT",references:freeze(["84"])});
 const ctx={season,requiem,septEmberFerial:verified&&plan.septEmberFerial===true,
  exceptionalFeastConfirmed:verified&&plan.exceptionalFeastConfirmed===true};
 const solo=resolve1962OrganPermission({...ctx,kind:"SOLO"});
 const accompaniment=resolve1962OrganPermission({...ctx,kind:"ACCOMPANY_CHANT"});
 const status=solo.status==="FORBIDDEN"?"SOLO_FORBIDDEN":
  solo.status==="PERMITTED_NOT_OBSERVED"?"SOLO_POTENTIALLY_PERMITTED":
  "REQUIRES_CONTEXT";
 return freeze({...base,status,reason:solo.reason,solo:solo.status,
  accompaniment:accompaniment.status,
  references:freeze([...new Set([...solo.authority,...accompaniment.authority])]),
  reminder:"Even if solo playing is allowed for this liturgical context, priest chants, responses, Consecration and blessing have their own prohibitions. No playing is observed."});
}

const asCard=card=>freeze({id:String(card.sectionId),sourceSectionId:sourceId(card),
  title:String(card.title??""),sequence:card.sequence});
const empty=(reason)=>freeze({schema:"ao-schola-music-itinerary-v1",supported:false,
 reason,events:freeze([]),unresolved:freeze([]),sourceCardCount:0,
 actuallySinging:"UNKNOWN",activeClock:"SCHOLA_INDEPENDENT"});

/**
 * Event anchors are resolved against real sourced presentation cards.
 * The module never advances chanting, picks a musical setting, or takes
 * the place of the 1958 organ-permission resolver.
 */
export function buildScholaMusicItinerary({cards,form,tracks=[],sanctusPerformance="UNSPECIFIED",
 resolvedMass=null}={}){
 const selected=String(form??"").toUpperCase();
 if(selected==="LOW")return empty("LOW_MASS_HAS_NO_SCHOLA");
 if(!SUNG.has(selected))return empty("UNSUPPORTED_SUNG_FORM");
 if(!Array.isArray(cards)||!cards.length)return empty("SOURCE_CARDS_REQUIRED");
 // Stage A only projects the certified curated LIVE family; source-model
 // fallback or separate rites cannot borrow its Schola time windows.
 if(!cards.every(c=>String(c?.sectionId??"").startsWith("AO.LIVECURATED.")&&
    typeof c.sourceSectionId==="string"&&Number.isInteger(c.sequence)))
   return empty("SOURCE_FIRST_CURATED_LIVE_REQUIRED");
 if(new Set(cards.map(c=>c.sectionId)).size!==cards.length)return empty("DUPLICATE_SOURCE_CARD_ID");
 const bySource=new Map(),bySection=new Map();
 cards.forEach((card,index)=>{
  const source=sourceId(card),arr=bySource.get(source)??[];
  arr.push({card,index});bySource.set(source,arr);bySection.set(String(card.sectionId),index);
 });
 const available=new Set(tracks.map(t=>typeof t==="string"?t:t?.id).filter(Boolean));
 const requiem=resolvedMass?.overlays?.includes("REQUIEM")===true;
 const styles=new Set(["GREGORIAN","POLYPHONIC"]);
 const setting=styles.has(sanctusPerformance)?sanctusPerformance:"UNSPECIFIED";
 const events=[],unresolved=[];
 for(let rank=0;rank<MASS_SCHOLA_EVENT_SPECS.length;rank++){
  const spec=MASS_SCHOLA_EVENT_SPECS[rank];
  if(!ALL_KINDS.has(spec.kind))throw Error("UNKNOWN_MUSIC_EVENT_KIND:"+spec.id);
  if(spec.needs && !available.has(spec.needs))continue;
  if(spec.trackId&&!available.has(spec.trackId))continue;
  if(requiem && (spec.needs==="GLORIA"||spec.needs==="CREDO"||spec.omitForRequiem))continue;
  if(spec.performance && spec.performance!==setting)continue;
  const sourceCards=bySource.get(spec.at.section)??[];
  if(!sourceCards.length){unresolved.push(freeze({id:spec.id,reason:"MISSING_CANONICAL_SOURCE_SECTION"}));continue;}
  let chosen=null;
  if(spec.afterBlock){
   const last=cards.reduce((at,c,i)=>blockOwned(c,spec.afterBlock)?i:at,-1);
   if(last<0){unresolved.push(freeze({id:spec.id,reason:"MISSING_POST_CHALICE_BOUNDARY"}));continue;}
   chosen=cards[last+1]?{card:cards[last+1],index:last+1}:null;
  }else if(spec.at.block){
   chosen=sourceCards.find(({card})=>blockOwned(card,spec.at.block));
  }else{
   chosen=sourceCards[0];
  }
  if(!chosen){unresolved.push(freeze({id:spec.id,reason:"SOURCE_BLOCK_OR_BOUNDARY_UNAVAILABLE"}));continue;}
  const organ=spec.kind==="ORGAN_OPTION";
  const local=spec.kind==="LOCAL_OPTION";
  events.push(freeze({
   id:spec.id,kind:spec.kind,trackId:spec.trackId??null,label:spec.label,
   ordinal:rank+1,card:asCard(chosen.card),cardIndex:chosen.index,
   sourceRef:spec.afterBlock??spec.at.block??spec.at.section,
   sourcePrecision:spec.precision??(spec.at.block?"SOURCE_BLOCK":"SOURCE_SECTION"),
   organPermission:organ?organAuthorityForScholaEvent(spec,resolvedMass):null,
   status:organ?"ORGAN_CANDIDATE_REQUIRES_RITUAL_CUE":local?"LOCAL_PROGRAMME_UNCONFIRMED":
     spec.manualOnly?"AWAIT_EXPLICIT_CHOIR_OBSERVATION":
     spec.kind==="QUIET_INTERVAL"?"SOURCE_STAGE_NOT_PERFORMANCE_OBSERVATION":
       spec.kind==="DISPLAY_REFERENCE"?"PRINTED_REFERENCE_NOT_NEW_CHANT":"EXPECTED_NOT_OBSERVED",
   actuallySinging:"UNKNOWN",actuallyPlaying:"UNKNOWN",
   manualOnly:spec.manualOnly===true,
   independentFromPriestScroll:true,
  }));
 }
 events.sort((a,b)=>a.cardIndex-b.cardIndex||a.ordinal-b.ordinal);
 return freeze({
  schema:"ao-schola-music-itinerary-v1",supported:true,reason:null,
  events:freeze(events),unresolved:freeze(unresolved),
  sourceCardCount:cards.length,cardOrder:freeze(cards.map(c=>String(c.sectionId))),
  actuallySinging:"UNKNOWN",activeClock:"SCHOLA_INDEPENDENT",
  organAuthority:"EXISTING_1958_ORGAN_PERMISSION_CONTEXT_FILTERED_NOT_A_PLAYING_CLAIM",
  specialRiteAuthority:"EXISTING_SEPARATE_RITE_MUSIC_REGISTRY",
 });
}

/** Display prediction only: the NEXT eligible score/text in Mass order, not
 * a heard or timed event. Never treat the current card as musical progress. */
export function nextScholaMusicEvent(itinerary,cardId){
 if(!itinerary?.supported || !cardId)return null;
 const id=String(cardId);
 const currentIndex=itinerary.cardOrder?.indexOf(id)??-1;
 if(currentIndex<0)return null;
 const next=itinerary.events.find(e=>e.cardIndex>currentIndex &&
   e.kind==="CHANT" && e.status==="EXPECTED_NOT_OBSERVED");
 if(!next)return null;
 return freeze({id:next.id,label:next.label,cardId:next.card.id,
  sourceRef:next.sourceRef,status:"UPCOMING_IN_MASS_ORDER_NOT_HEARD",
  actuallySinging:"UNKNOWN",independentFromPriestScroll:true});
}
