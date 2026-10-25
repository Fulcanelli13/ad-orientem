import { requiemAgnusVariantsForResolvedMass } from "./reader-requiem-conditions.js";
// Native Schola state for certified sung forms. Low Mass is a structural absence; Solemn shares the recovered sung Schola donor.
// The opening intonations of Gloria and Credo belong to the celebrant,
// even though their trailing donor syllables were catalogued SCHOLA_PUBLIC.
const PRIEST_INTONATION_END_CUES=new Set(["AO.SM.C0054","AO.SM.C0090"]);

// The Schola has its own progression clock. Reader card changes may select a
// relevant track, but only exact Schola cues or explicit Schola navigation
// advance within that track.

const SUPPORTED_FORMS=new Set(["MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"]);
const INTERLECTION_TRACKS=new Set(["GRADUAL","ALLELUIA_TRACT_SEQUENCE"]);
const PRIEST_PRAYERS_BEFORE_COMMUNION=new Set(["AO.SM.B069","AO.SM.B070","AO.SM.B071","AO.SM.B072","AO.SM.B073"]);

const TRACK_SPECS=Object.freeze([
  {id:"INTROIT",kind:"PROPER",slot:"INTROIT",cards:[1],canonicalBlockIds:["AO.SM.B014"]},
  {id:"KYRIE",kind:"ORDINARY",macroId:"AO.SM.M02",cards:[2]},
  {id:"GLORIA",kind:"ORDINARY",macroId:"AO.SM.M03",cards:[3]},
  {id:"GRADUAL",kind:"PROPER",slot:"GRADUAL",cards:[6],canonicalBlockIds:["AO.SM.B021"]},
  {id:"ALLELUIA_TRACT_SEQUENCE",kind:"PROPER",slot:"ALLELUIA_TRACT_SEQUENCE",cards:[6],canonicalBlockIds:["AO.SM.B022"],optional:true},
  {id:"CREDO",kind:"ORDINARY",macroId:"AO.SM.M09",cards:[9]},
  {id:"OFFERTORY",kind:"PROPER",slot:"OFFERTORY",cards:[10,11],canonicalBlockIds:["AO.SM.B030"]},
  {id:"SANCTUS_BENEDICTUS",kind:"ORDINARY",macroId:"AO.SM.M13",cards:[13,14,17]},
  {id:"AGNUS_DEI",kind:"ORDINARY",macroId:"AO.SM.M21",cards:[20,21]},
  {id:"COMMUNION",kind:"PROPER",slot:"COMMUNION",cards:[25,26],canonicalBlockIds:["AO.SM.B085"]},
]);

function clean(value){const s=String(value??"").trim();return s||null}
function freezeSegment(segment){return Object.freeze({...segment});}

function ordinarySegments(corpus,macroId,{language="en",frenchOrdinary=null,ordinaryVariants=null}={}){
  const blocks=(corpus?.blocks??[]).filter(b=>b.Macro_ID===macroId);
  const rows=[];
  for(const block of blocks){
    for(const unit of block.units??[]){
      if(unit.clock!=="SCHOLA_PUBLIC"||PRIEST_INTONATION_END_CUES.has(unit.cue_id))continue;
      const variant=ordinaryVariants?.[unit.cue_id]??null;
      const latin=clean(variant?.lat??unit.latin);
      const fr=String(language).toLowerCase().startsWith("fr");
      // The Schola's translation follows the reader's language, but Latin
      // always remains the immutable default sung text.
      const english=fr
        ? clean(variant?.fr??frenchOrdinary?.byCue?.[unit.cue_id]??unit.english)
        : clean(variant?.en??unit.english);
      if(!latin&&!english)continue;
      rows.push(freezeSegment({
        id:unit.cue_id,cueId:unit.cue_id,
        latin,english,source:"SUNG_CORPUS_SCHOLA_PUBLIC",
        sort:Number(unit.sort),
      }));
    }
  }
  rows.sort((a,b)=>a.sort-b.sort);
  return Object.freeze(rows);
}

function properSegments(properSlots,slot){
  const envelope=properSlots?.slots?.[slot]??properSlots?.[slot]??null;
  if(envelope?.status==="NOT_APPLICABLE")return Object.freeze([]);
  const paragraphs=envelope?.data?.paragraphs??[];
  return Object.freeze(paragraphs.map((p,index)=>freezeSegment({
    id:String(p.id??slot+"."+(index+1)),
    cueId:null,
    latin:clean(p.latin??p.lat),
    english:clean(p.vernacular??p.en??p.english),
    source:"RESOLVED_PROPER_"+slot,
    sort:index+1,
  })).filter(x=>x.latin||x.english));
}

export function buildNativeScholaTracks({sungCorpus,properSlots,prepared,frenchOrdinary=null}={}){
  const form=String(prepared?.session?.resolvedMass?.form??"").toUpperCase();
  if(form==="LOW")return Object.freeze({
    supported:true,structuralAbsence:true,reason:null,tracks:Object.freeze([])
  });
  if(!SUPPORTED_FORMS.has(form))return Object.freeze({
    supported:false,reason:"SCHOLA_NOT_CERTIFIED_FOR_"+(form||"UNKNOWN_FORM"),tracks:Object.freeze([])
  });
  if(!sungCorpus?.blocks)throw new TypeError("Verified Sung corpus required for Schola");
  const tracks=TRACK_SPECS.map(spec=>{
    const segments=spec.kind==="ORDINARY"
      ? ordinarySegments(sungCorpus,spec.macroId,{
          language:prepared?.readerPreferences?.language??"en",frenchOrdinary,
          ordinaryVariants:requiemAgnusVariantsForResolvedMass(prepared?.session?.resolvedMass),
        })
      : properSegments(properSlots,spec.slot);
    if(!segments.length && !spec.optional)throw new Error("Native Schola track has no source text: "+spec.id);
    return Object.freeze({...spec,segments});
  }).filter(track=>track.segments.length);
  return Object.freeze({supported:true,reason:null,tracks:Object.freeze(tracks)});
}

export function createNativeScholaController(args={}){
  const built=buildNativeScholaTracks(args);
  if(built.structuralAbsence){
    const state=()=>Object.freeze({
      supported:true,structuralAbsence:true,reason:null,schola:null,
      ownership:"R18_FORM_ABSENT_SCHOLA",trackId:null,index:0,total:0,complete:true,
    });
    return Object.freeze({
      schema:"ao-r18-native-schola-absence-v1",supported:true,structuralAbsence:true,reason:null,
      tracks:Object.freeze([]),trackIds:Object.freeze([]),project:state,
      activateForCard:state,syncCue:state,next:state,previous:state,finish:state,selectTrack:state,
    });
  }
  if(!built.supported)return Object.freeze({
    schema:"ao-r17-native-schola-v1",supported:false,reason:built.reason,
    project:()=>Object.freeze({supported:false,reason:built.reason,schola:null,ownership:"LEGACY_FALLBACK"}),
  });
  const byId=new Map(built.tracks.map(t=>[t.id,t]));
  const cueToTrack=new Map();
  for(const track of built.tracks)for(const segment of track.segments){
    if(segment.cueId)cueToTrack.set(segment.cueId,{trackId:track.id,index:track.segments.indexOf(segment)});
  }
  let activeTrackId=null,index=0,complete=false,lastSyncedCueId=null;
  // Choir setting belongs to the actual local performance. It cannot be
  // inferred from the Mass form, date, priest's paragraph or display timer.
  const normalizeStyle=v=>["GREGORIAN","POLYPHONIC"].includes(v)?v:"UNSPECIFIED";
  let sanctusPerformance=normalizeStyle(args?.prepared?.readerPreferences?.sanctusPerformance);
  let benedictusReleased=sanctusPerformance==="GREGORIAN";
  const isSanctus=()=>activeTrackId==="SANCTUS_BENEDICTUS";
  const isHeld=()=>isSanctus()&&index===2&&!benedictusReleased;
  function setSanctusPerformance(value){
    const style=normalizeStyle(value);
    if(style===sanctusPerformance)return state();
    sanctusPerformance=style;
    benedictusReleased=style==="GREGORIAN";
    if(isSanctus()&&!benedictusReleased&&index>=3){
      index=2;complete=false;lastSyncedCueId=null;
    }
    return state();
  }
  function releaseBenedictus(){
    // Explicit button press AFTER independently observing the Schola begin
    // after Chalice Consecration (or an unclassified local performance).
    // Merely scrolling over the priest's Benedictus cannot release it.
    if(!isSanctus()||benedictusReleased)return state();
    benedictusReleased=true;
    index=3;complete=false;lastSyncedCueId=null;
    return state();
  }

  function state(){
    const track=activeTrackId?byId.get(activeTrackId):null;
    const segment=track?.segments?.[index]??null;
    const hold=isHeld();
    return Object.freeze({
      supported:true,reason:null,
      schola:segment?Object.freeze({
        label:segment.latin??segment.english,
        latin:segment.latin,english:segment.english,
        trackId:track.id,segmentId:segment.id,cueId:segment.cueId,
        index,total:track.segments.length,complete,
        benedictusHold:hold,sanctusPerformance,
        musicStatus:"EXPECTED_NOT_OBSERVED",
        owner:"R17_NATIVE_SCHOLA",
      }):null,
      ownership:segment?"R17_NATIVE_SCHOLA":"R17_EXACT_SCHOLA_NONE",
      trackId:track?.id??null,index,total:track?.segments?.length??0,complete,
      benedictusHold:hold,sanctusPerformance,
    });
  }
  function activate(trackId,{reset=true}={}){
    if(!byId.has(trackId)){activeTrackId=null;index=0;complete=false;lastSyncedCueId=null;return state()}
    if(activeTrackId!==trackId || reset){
      activeTrackId=trackId;index=0;complete=false;lastSyncedCueId=null;
      if(trackId==="SANCTUS_BENEDICTUS")benedictusReleased=sanctusPerformance==="GREGORIAN";
    }
    return state();
  }
  // A boundary expires a musical opportunity; it never proves that the
  // choir was heard finishing. These sung exchanges, unlike priest scroll,
  // delimit Offertory and Communion scenes in the 1958 instruction §27.
  function reachLiturgicalBoundary(cueId){
    const id=String(cueId??"");
    if(id==="AO.SM.C0135" && activeTrackId==="OFFERTORY")return activate(null);
    if(id==="AO.SM.C0251" && activeTrackId==="COMMUNION")return activate(null);
    // The Gospel's Dominus vobiscum: the chants between the readings are over.
    if(id==="AO.SM.C0082" && INTERLECTION_TRACKS.has(activeTrackId))return activate(null);
    // The choir begins the Agnus Dei after answering the Pax (Et cum spiritu
    // tuo), while the priest says Haec commixtio and the Agnus Dei himself.
    if(id==="AO.SM.C0220" && byId.has("AGNUS_DEI") && activeTrackId!=="AGNUS_DEI")
      return activate("AGNUS_DEI",{reset:false});
    // The priest's Communion: the Agnus Dei window gives way to the Communion.
    if(id==="AO.SM.C0232" && activeTrackId==="AGNUS_DEI")return activate(null);
    return state();
  }

  // All navigable cards may represent one part of an original macro.
  // The DOM runtime must not apply historical 1..30 card-number lookup to
  // the 48- or curated 65-card presentation sequences. Instead resolve
  // canonical chant source cues and Proper slot block ownership.
  function tracksForSourceCard(card){
    const cueIds=new Set((card.paragraphs??[]).flatMap(p=>
      (p.sourceCueIds??[]).map(String)));
    const blockIds=new Set((card.blocks??[]).map(p=>String(p.blockId)));
    const matches=built.tracks.filter(track=>track.kind==="ORDINARY"
      ? track.segments.some(segment=>segment.cueId&&cueIds.has(segment.cueId))
      : (track.canonicalBlockIds??[]).some(blockId=>blockIds.has(blockId)));
    return matches;
  }
  function activateForCard(cardOrSequence){
    // Legacy numeric macro calls remain supported for existing 30/48
    // consumers until all callers have migrated to source-aware objects.
    if(!cardOrSequence||typeof cardOrSequence!=="object"){
      const n=Number(cardOrSequence);
      const current=activeTrackId?byId.get(activeTrackId):null;
      if(current?.cards?.includes(n))return state();
      const matches=built.tracks.filter(t=>t.cards.includes(n));
      if(!matches.length)return activate(null);
      return activate(matches[0].id);
    }
    const card=cardOrSequence;
    const sourceSection=String(card.sourceSectionId??card.sectionId??"");
    const blockIds=new Set((card.blocks??[]).map(block=>String(block.blockId)));
    const matches=tracksForSourceCard(card);
    const current=activeTrackId?byId.get(activeTrackId):null;
    if(current&&matches.some(t=>t.id===current.id)){
      // When a verified Alleluia/Tract and Sequence occupy separate
      // navigable B022 paragraphs, show the exact selected paragraph;
      // other Schola tracks still keep their independent progression.
      if(current.id==="ALLELUIA_TRACT_SEQUENCE"){
        const ids=new Set((card.paragraphs??[]).map(p=>String(p.id)));
        const at=current.segments.findIndex(segment=>ids.has(segment.id));
        if(at>=0&&at!==index){index=at;complete=false;lastSyncedCueId=null}
      }
      return state();
    }
    if(matches.length)return activate(matches[0].id);

    // The Introit belongs to the actual entrance, not its later printed
    // Proper (B014). The first ordinary opening prayer cards are the
    // earliest visible Mass scene; a pre-Mass rite retains exclusive
    // ownership until its actual handoff to the opening Mass card.
    if(sourceSection==="AO.CARD.001")return activate("INTROIT",{reset:false});

    // 1958 §27(c): Communion is sung at the priest's reception when no
    // faithful communicate, or during distribution if they do. The app
    // cannot know either performance in advance. Beginning with B074,
    // expose the *expected musical window*; never claim heard singing.
    // Retain that window through reception, optional Confiteor, the
    // faithful's Communion, ablutions and the later printed B085 Proper.
    // The first public Postcommunion greeting closes it.
    if(blockIds.has("AO.SM.B074"))return activate("COMMUNION",{reset:false});
    if(activeTrackId==="COMMUNION" &&
       ["AO.CARD.023","AO.CARD.024","AO.CARD.025","AO.CARD.026"].includes(sourceSection))
      return state();

    // The choir's Offertory has a musical window extending across all five
    // curated Offertory cards, Orate fratres and the quiet Secret. The public
    // Secret conclusion (C0135), or leaving this section, ends the window.
    // Do not use the single printed B030 Proper card as its stop clock.
    if(activeTrackId==="OFFERTORY" &&
       ["AO.CARD.010","AO.CARD.011"].includes(sourceSection))return state();

    // The Gradual, Alleluia, Tract or Sequence is still being sung while the
    // priest (or deacon) says Munda cor meum and goes to the Gospel side
    // (B023). The Gospel's Dominus vobiscum (B024 / C0082) ends the window.
    if(INTERLECTION_TRACKS.has(activeTrackId) && blockIds.has("AO.SM.B023"))return state();

    // The Agnus Dei window opens with the commingling (B067), after the
    // choir answers the Pax, and continues through the priest's prayers
    // before his Communion (B069-B073). B074 (his Communion) hands over to
    // the Communion window above.
    if(blockIds.has("AO.SM.B067") && byId.has("AGNUS_DEI"))
      return activate("AGNUS_DEI",{reset:false});
    if(activeTrackId==="AGNUS_DEI" && blockIds.size &&
       [...blockIds].every(id=>PRIEST_PRAYERS_BEFORE_COMMUNION.has(id)))return state();

    // The Benedictus may continue while the priest prays silently in
    // the Canon. Keep its independent Schola clock across those cards;
    // never advance or rewind it merely because the reader is swiped.
    const macro=Number(card.guideSequence??card.sourceSequence);
    if(activeTrackId==="SANCTUS_BENEDICTUS" &&
       Number.isInteger(macro)&&macro>=14&&macro<=18)return state();
    return activate(null);
  }
  function syncCue(cueId){
    const id=String(cueId??"");
    const hit=cueToTrack.get(id);
    if(!hit)return state();
    if(hit.trackId==="SANCTUS_BENEDICTUS"&&hit.index>=3&&!benedictusReleased){
      // This source cue is the priestly prayer, NOT an observation that the
      // Schola has begun singing the delayed polyphonic Benedictus.
      if(isSanctus()&&index<2)index=2;
      return state();
    }
    // The text focus is the reader's clock, not the choir's. Once the
    // Schola is already in this track, a different paragraph gaining focus
    // cannot advance OR rewind the independent musical performance.
    // Only an explicit choir control or an independently observed musical
    // event may change the phrase index.
    if(activeTrackId===hit.trackId){
      lastSyncedCueId=id;
      return state();
    }
    activeTrackId=hit.trackId;index=hit.index;complete=false;
    lastSyncedCueId=id;
    return state();
  }
  function next(){
    const track=activeTrackId?byId.get(activeTrackId):null;
    if(!track)return state();
    if(isHeld())return state(); // timer or arrow cannot invent the choir
    if(index>=track.segments.length-1){complete=true;return state()}
    index+=1;complete=false;return state();
  }
  function previous(){
    const track=activeTrackId?byId.get(activeTrackId):null;
    if(!track)return state();
    index=Math.max(0,index-1);complete=false;return state();
  }
  function finish(){if(activeTrackId)complete=true;return state()}
  function selectTrack(trackId){return activate(trackId)}

  return Object.freeze({
    schema:"ao-r17-native-schola-v1",supported:true,reason:null,
    tracks:built.tracks,project:state,activateForCard,syncCue,next,previous,finish,selectTrack,
    setSanctusPerformance,releaseBenedictus,reachLiturgicalBoundary,
    trackIds:Object.freeze(built.tracks.map(t=>t.id)),
  });
}
