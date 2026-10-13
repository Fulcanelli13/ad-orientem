import {inspect1962PrefaceSelection} from "./1962-preface-decision.js";
const REQUIRED_SLOTS = Object.freeze([
  "INTROIT","COLLECT_SET","EPISTLE_OR_LESSON","GRADUAL",
  "GOSPEL","OFFERTORY","SECRET_SET","PREFACE","COMMUNION","POSTCOMMUNION_SET"
]);
export const READER_PROPER_SLOTS = Object.freeze([
  ...REQUIRED_SLOTS.slice(0,4),
  "ALLELUIA_TRACT_SEQUENCE",
  ...REQUIRED_SLOTS.slice(4),
]);

function vernacularValue(value,language="en"){
  if(!value || typeof value!=="object")return "";
  const lang=String(language??"en").toLowerCase();
  if(lang.startsWith("fr")) return String(value.fr ?? "").trim();
  return String(value.en ?? value.vernacular ?? value.translation ?? "").trim();
}

function usable(value,language="en"){
  return value && typeof value==="object" &&
    Boolean(String(value.lat??value.la??"").trim()) &&
    Boolean(vernacularValue(value,language));
}

function values(value,language="en"){
  if(Array.isArray(value)) return value.filter(row=>usable(row,language));
  return usable(value,language) ? [value] : [];
}

function readyEnvelope(slot,value,{language="en"}={}){
  const rows=values(value,language);
  // Never discard one incomplete commemorated oration while retaining
  // another. The whole threefold Mass Proper must be source-complete.
  const incomplete=Array.isArray(value)&&value.some(row=>!usable(row,language));
  if(!rows.length||incomplete)return Object.freeze({status:"MISSING",slot,data:null});

  const spokenOrations=slot==="COLLECT_SET"||slot==="POSTCOMMUNION_SET";
  const french=String(language).toLowerCase().startsWith("fr");
  const paragraphs=[];
  // The source witness frequently prints the congregation's terminal Amen
  // as part of the complete prayer text. In Collects/Postcommunions that
  // response is instead projected as a separate, speaker-labelled paragraph
  // (intermediate derived response or final canonical C0074/C0255).
  // Preserve the original text for provenance/conclusion validation above.
  const spokenBody=(text,locale)=>{
    const raw=String(text??"");
    if(!spokenOrations)return raw;
    const response=locale==="fr"
      ?/\s*(?:(?:℟\.|R\.)\s*)?(?:Ainsi soit-il|Amen)\.\s*$/iu
      :/\s*(?:(?:℟\.|R\.)\s*)?Amen\.\s*$/iu;
    const without=raw.replace(response,"").trimEnd();
    return without||raw;
  };
  for(const [index,row] of rows.entries()){
    const group=slot+"."+(index+1);
    // The source donor already has the first Oremus at C0072/C0253.
    // A *separately concluded* added oration requires its own Oremus;
    // two commemorations under one conclusion require just ONE here.
    // A Secret never acquires an invented public Oremus or response.
    if(index>0&&spokenOrations)paragraphs.push(Object.freeze({
      id:group+".OREMUS",kind:"VERSICLE",
      latin:"Orémus.",vernacular:french?"Prions.":"Let us pray.",
      speakerRole:"PRIEST",speakerEvidence:"1962_ADDITIONAL_ORATION_DIALOGUE",
      sourceCueIds:Object.freeze([]),liturgicalGroup:group,prayerRole:"ORATION_INVITATION",
    }));
    const composed=["COLLECT_SET","SECRET_SET","POSTCOMMUNION_SET"].includes(slot)?row.oneConclusion:null;
    const common={liturgicalGroup:group,speakerRole:"PRIEST",
      speakerEvidence:"1962_PROPER_ORATION",sourcePath:row.sourcePath??null};
    if(composed){
      const latin=composed.segments?.lat,trans=composed.segments?.[language];
      const extra=segment=>segment?.additional??segment?.mission;
      const rejoin=segment=>segment?.principal+"\n\n"+extra(segment)+"\n"+segment?.conclusion;
      if(composed.status!=="CERTIFIED"||!latin||!trans||
        rejoin(latin)!==String(row.lat??row.la)||
        rejoin(trans)!==vernacularValue(row,language))
        return Object.freeze({status:"MISSING",slot,data:null,
          reason:"Unverified one-conclusion oration composition"});
      const multiple=composed.kind==="MULTIPLE_COMMEMORATIONS";
      paragraphs.push(Object.freeze({
        ...common,
        id:group+(multiple?".FIRST_COMMEMORATION":".PRINCIPAL"),kind:"TEXT",
        latin:spokenBody(latin.principal,"lat"),vernacular:spokenBody(trans.principal,language),
        prayerRole:multiple?"FIRST_COMMEMORATION":"PRINCIPAL_ORATION",
        sourcePath:multiple?composed.sourcePaths?.[0]??common.sourcePath:common.sourcePath,
      }));
      paragraphs.push(Object.freeze({
        ...common,
        id:group+(multiple?".SECOND_COMMEMORATION":composed.kind==="INSEPARABLE_APOSTLES"?".PETER":".MISSION"),
        kind:"TEXT",latin:spokenBody(extra(latin)+"\n"+latin.conclusion,"lat"),
        vernacular:spokenBody(extra(trans)+"\n"+trans.conclusion,language),
        prayerRole:multiple?"SECOND_COMMEMORATION":"ORATION_UNDER_ONE_CONCLUSION",
        sourcePath:multiple?composed.sourcePaths?.[1]??null:composed.sourcePath??common.sourcePath,
      }));
    }else{
      paragraphs.push(Object.freeze({
        ...common,id:group,kind:"TEXT",
        latin:spokenBody(row.lat??row.la,"lat"),vernacular:spokenBody(vernacularValue(row,language),language),
        prayerRole:index===0?"PRINCIPAL_ORATION":"ADDITIONAL_ORATION",
      }));
    }
    // The donor C0074/C0255 already provides the LAST response. Only
    // intermediate separately concluded groups need a derived Amen.
    if(spokenOrations&&index<rows.length-1)paragraphs.push(Object.freeze({
      id:group+".AMEN",kind:"RESPONSE",
      latin:"℟. Amen.",vernacular:"℟. Amen.",
      speakerRole:"RESPONDERS",speakerEvidence:"1962_INTERMEDIATE_ORATION_RESPONSE",
      sourceCueIds:Object.freeze([]),liturgicalGroup:group,prayerRole:"ORATION_RESPONSE",
    }));
  }
  // Roman Missal 1962, n. 481: the last Secret's conclusion is private
  // UNTIL "Per omnia saecula saeculorum", which is spoken aloud in
  // canonical block B041 (C0135), followed by the server's Amen (C0136).
  // Do not print the same audible ending and Amen inside the Secret text.
  // Ordinary source fixtures without a full ending are not rewritten.
  if(slot==="SECRET_SET"){
    const final=paragraphs.findLastIndex(p=>p.kind==="TEXT");
    if(final<0)return Object.freeze({status:"MISSING",slot,data:null,
      reason:"No final Secret prayer"});
    const row=paragraphs[final];
    const latinTail=/per\s+[oó]mnia\s+s(?:ae|[æǽ])cula\s+s(?:ae|[æǽ])cul[oó]rum\.\s*Amen\.\s*$/iu;
    const vernacularTail=french
      ?/(?:dans (?:tous )?les siècles des siècles|pour (?:tous )?les siècles des siècles|aux siècles des siècles)\.\s*(?:Ainsi soit-il|Amen)\.\s*$/iu
      :/(?:world without end|for ever and ever|forever and ever)\.\s*Amen\.\s*$/iu;
    const latinPresent=latinTail.test(row.latin);
    const vernacularPresent=vernacularTail.test(row.vernacular);
    if(latinPresent!==vernacularPresent){
      return Object.freeze({status:"MISSING",slot,data:null,
        reason:"Final Secret public conclusion does not align in Latin and translation"});
    }
    if(latinPresent){
      paragraphs[final]=Object.freeze({
        ...row,
        latin:row.latin.replace(latinTail,"").trimEnd(),
        vernacular:row.vernacular.replace(vernacularTail,"").trimEnd(),
        secretConclusionBoundary:"AUDIBLE_PER_OMNIA_IN_CANONICAL_B041",
      });
    }
  }
  return Object.freeze({
    status:"READY",slot,
    data:Object.freeze({paragraphs:Object.freeze(paragraphs)})
  });
}

export function properToReaderSlots(proper,{notApplicableSlots=[],language="en"}={}){
  if(!proper || typeof proper!=="object") throw new TypeError("Resolved Proper object required");
  const locale=String(language??"en").toLowerCase().startsWith("fr") ? "fr" : "en";
  const opts={language:locale};

  const principalId=proper.principalCelebrationId??proper.mainId??proper.main?.id??null;
  const prefaceDecision=principalId?inspect1962PrefaceSelection({principalCelebrationId:principalId,selectedPreface:proper.preface,requestedCelebrationId:proper.requestedCelebrationId??null}):null;

  const slots={
    INTROIT:readyEnvelope("INTROIT",proper.introit,opts),
    COLLECT_SET:readyEnvelope("COLLECT_SET",proper.collects?.length?proper.collects:proper.collect,opts),
    EPISTLE_OR_LESSON:readyEnvelope("EPISTLE_OR_LESSON",proper.epistle,opts),
    GRADUAL:readyEnvelope("GRADUAL",proper.gradual,opts),
    GOSPEL:readyEnvelope("GOSPEL",proper.gospel,opts),
    OFFERTORY:readyEnvelope("OFFERTORY",proper.offertory,opts),
    SECRET_SET:readyEnvelope("SECRET_SET",proper.secrets?.length?proper.secrets:proper.secret,opts),
    PREFACE:readyEnvelope("PREFACE",proper.preface,opts),
    COMMUNION:readyEnvelope("COMMUNION",proper.communion,opts),
    POSTCOMMUNION_SET:readyEnvelope("POSTCOMMUNION_SET",proper.postcommunions?.length?proper.postcommunions:proper.postcommunion,opts),
  };

  if(proper.inseparableOrationsDecision?.status==="UNVERIFIED"){
    for(const slot of ["COLLECT_SET","SECRET_SET","POSTCOMMUNION_SET"]){
      slots[slot]=Object.freeze({status:"MISSING",slot,data:null,
        reason:"Inseparable Peter-Paul oration source unverified: "+
          proper.inseparableOrationsDecision.reason});
    }
  }

  // Two or more Calendar commemorations may exceed the permitted count
  // or demand seasonal precedence. An unresolved source selection must not
  // become apparently READY just because legacy Proper arrays have text.
  if(proper.commemorationFormDecision?.status==="UNVERIFIED"&&
     proper.commemorationFormDecision?.reason===
       "MULTIPLE_COMMEMORATIONS_SOURCE_PRIORITY_PENDING"){
    for(const slot of ["COLLECT_SET","SECRET_SET","POSTCOMMUNION_SET"]){
      slots[slot]=Object.freeze({status:"MISSING",slot,data:null,
        reason:"1962 multiple commemorations: Mass-form priority and "+
          "oration selection not source-certified."});
    }
  }

  // Missing/competing §453 source or conclusion: never render a
  // source-incomplete Mission Sunday as a certified ready Collect.
  if(proper.missionSundayCollectDecision?.status==="UNVERIFIED"){
    slots.COLLECT_SET=Object.freeze({status:"MISSING",slot:"COLLECT_SET",data:null,
      reason:"Mission Sunday Collect source/precedence unverified: "+
        proper.missionSundayCollectDecision.reason});
  }

  // A source contradiction must not be displayed as a certified ready Preface.
  // This is a reader safety gate, NOT a substitute for repairing source selection.
  if(prefaceDecision && ["CONTRADICTION","MISSING_PREFACE","NEEDS_SELECTED_FORMULARY"].includes(prefaceDecision.status)){
    slots.PREFACE=Object.freeze({status:"MISSING",slot:"PREFACE",data:null,
      reason:"1962 Preface source decision: "+prefaceDecision.status,
      requiredId:prefaceDecision.requiredId,actualId:prefaceDecision.actualId});
  }

  // The source Calendar lists commemorations separately from the prayer
  // arrays. A one-prayer fallback is NOT a complete Proper when an identified
  // commemoration still requires its own Collect, Secret and Postcommunion.
  const selection=proper.commemorationFormDecision;
  const effectiveCommemorations=selection?.status==="CERTIFIED"&&
    selection?.source==="1962_PROPER_RESOLVER"&&
    Number.isInteger(selection.appliedCount)&&
    Array.isArray(proper.appliedCommemorations)&&
    selection.appliedCount===proper.appliedCommemorations.length
      ?proper.appliedCommemorations:proper.calendarCommemorations;
  const extra=(Array.isArray(effectiveCommemorations)?
    effectiveCommemorations:[]).filter(row=>row&&!row.inseparable).length;
  const certifiedGroupCount=selection?.status==="CERTIFIED"&&
    selection?.source==="1962_PROPER_RESOLVER"&&
    Number.isInteger(selection?.prayerGroupCount)&&
    selection.prayerGroupCount>=1&&
    selection.prayerGroupCount<=1+extra?selection.prayerGroupCount:null;
  const minimum=certifiedGroupCount??1+extra;
  if(extra>0){
    for(const [slot,plural,singular] of [
      ["COLLECT_SET","collects","collect"],
      ["SECRET_SET","secrets","secret"],
      ["POSTCOMMUNION_SET","postcommunions","postcommunion"]]){
      const group=Array.isArray(proper[plural])&&proper[plural].length?
        proper[plural]:proper[singular]?[proper[singular]]:[];
      if(group.length<minimum){
        slots[slot]=Object.freeze({
          status:"MISSING",slot,data:null,
          reason:"Source-owned commemoration orations are incomplete.",
        });
      }
    }
  }

  const explicitNA=new Set((notApplicableSlots??[]).map(String));
  for(const slot of explicitNA){
    if(!REQUIRED_SLOTS.includes(slot))throw new Error("Unknown not-applicable Proper slot: "+slot);
    slots[slot]=Object.freeze({
      status:"NOT_APPLICABLE",slot,
      reason:"Explicitly suppressed by certified rite projection.",
      data:null,
    });
  }

  // Divinum/Missale source normalization frequently carries Gradual/Tract/Alleluia
  // together in proper.gradual. Only a genuinely separate Sequence gets a second block.
  const sequenceRows=values(proper.sequence,locale);
  slots.ALLELUIA_TRACT_SEQUENCE=sequenceRows.length
    ? readyEnvelope("ALLELUIA_TRACT_SEQUENCE",proper.sequence,opts)
    : Object.freeze({
        status:"NOT_APPLICABLE",
        slot:"ALLELUIA_TRACT_SEQUENCE",
        reason:"No separate Sequence; Gradual/Tract/Alleluia remains in GRADUAL.",
        data:null,
      });

  const missing=REQUIRED_SLOTS.filter(slot=>!["READY","NOT_APPLICABLE"].includes(slots[slot].status));
  return Object.freeze({
    schema:"ao-reader-proper-slots-v1",
    sourcePath:proper.sourcePath??null,
    slots:Object.freeze(slots),
    missing:Object.freeze(missing),
    ready:missing.length===0,
  });
}

export function assertReaderProperReady(mapped){
  if(!mapped || mapped.schema!=="ao-reader-proper-slots-v1") throw new TypeError("Reader Proper slot map required");
  if(!mapped.ready) throw new Error("Resolved Proper is incomplete for reader: "+mapped.missing.join(", "));
  return mapped;
}
