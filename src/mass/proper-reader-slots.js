import {validatedPreGospelChantParts} from "./reader-pre-gospel-chant-source.js";
import {correct1962ProperEditorialReferences} from "./1962-proper-editorial-corrections.js";
import {project1962Pent21AlleluiaDisplayRows,PS113_PENT21_ENGLISH_EDITORIAL} from "./1962-ps113-alleluia-editorial.js";
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

// The source's Lectio/Evangelium may already print its terminal ℟. line.
// In the native reader these replies are canonically owned by B020/C0076
// (Deo gratias) and B026/C0087 (Laus tibi, Christe). Keep the original
// resolved Proper untouched; suppress only a matching terminal reply in
// the display text, never a response embedded in the reading itself.
function stripPinnedReadingResponse(text,slot,locale){
  const raw=String(text??"");
  const french=locale==="fr";
  const latin=locale==="lat";
  const epistle=latin
    ?/(?:^|\n)\s*(?:℟\.|R\.)\s*Deo\s+gr[áa]tias\.?\s*$/iu
    :french
      ?/(?:^|\n)\s*(?:℟\.|R\.)\s*(?:Deo\s+gr[áa]tias(?:\s*[-–—]\s*Rendons\s+gr[aâ]ces?\s+[àa]\s+Dieu)?|Rendons\s+gr[aâ]ces?\s+[àa]\s+Dieu)\.?\s*$/iu
      :/(?:^|\n)\s*(?:℟\.|R\.)\s*(?:Deo\s+gr[áa]tias|Thanks\s+be\s+to\s+God)\.?\s*$/iu;
  const gospel=latin
    ?/(?:^|\n)\s*(?:℟\.|R\.)\s*Laus\s+tibi,?\s*Christe\.?\s*$/iu
    :french
      ?/(?:^|\n)\s*(?:℟\.|R\.)\s*(?:Laus\s+tibi,?\s*Christe|Louange\s+[àa]\s+vous,?\s+[ôo]\s+Christ)\.?\s*$/iu
      :/(?:^|\n)\s*(?:℟\.|R\.)\s*(?:Laus\s+tibi,?\s*Christe|Praise\s+be\s+to\s+(?:Thee|you),?\s+O\s+Christ)\.?\s*$/iu;
  const expression=slot==="EPISTLE_OR_LESSON"?epistle:slot==="GOSPEL"?gospel:null;
  if(!expression)return Object.freeze({text:raw,suppressed:false});
  const stripped=raw.replace(expression,"").trimEnd();
  return Object.freeze({text:stripped||raw,suppressed:expression.test(raw)});
}

function readyEnvelope(slot,value,{language="en"}={}){
  const rows=values(value,language);
  // All orations must be source- and translation-complete; no fallback
  // which silently drops one of the commemorations on this Mass day.
  const incomplete=Array.isArray(value)&&value.some(row=>!usable(row,language));
  if(!rows.length||incomplete)return Object.freeze({status:"MISSING",slot,data:null});
  const publicOration=slot==="COLLECT_SET"||slot==="POSTCOMMUNION_SET";
  const threefoldOration=publicOration||slot==="SECRET_SET";
  const french=String(language).toLowerCase().startsWith("fr");
  const spokenBody=(value,locale)=>{
    const raw=String(value??"");
    if(!publicOration)return raw;
    // Full source Missal endings contain a respondent Amen. The speaker
    // owns a separate intermediate response, or canonical C0074/C0255.
    const response=locale==="fr"
      ?/\s+(?:(?:℟\.|R\.)\s+)?(?:Ainsi soit-il|Amen)\.\s*$/iu
      :/\s+(?:(?:℟\.|R\.)\s+)?Amen\.\s*$/iu;
    return raw.replace(response,"").trimEnd()||raw;
  };
  const paragraphs=[];
  for(const [index,row] of rows.entries()){
    const group=slot+"."+(index+1);
    const common={
      orationGroupIndex:threefoldOration?index+1:null,
      liturgicalGroup:threefoldOration?group:null,
      speakerRole:threefoldOration?"PRIEST":null,
      speakerEvidence:threefoldOration?"1962_PROPER_ORATION":null,
      sourcePath:row.sourcePath??null,
    };
    const composed=threefoldOration?row.oneConclusion:null;
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
        ...common,liturgicalGroup:"COLLECT_UNDER_ONE_CONCLUSION",
        id:group+(multiple?".FIRST_COMMEMORATION":".PRINCIPAL"),kind:"TEXT",
        latin:spokenBody(latin.principal,"lat"),
        vernacular:spokenBody(trans.principal,language),
        prayerRole:multiple?"FIRST_COMMEMORATION":"PRINCIPAL_ORATION",
        sourcePath:multiple?composed.sourcePaths?.[0]??common.sourcePath:common.sourcePath,
      }));
      paragraphs.push(Object.freeze({
        ...common,liturgicalGroup:"COLLECT_UNDER_ONE_CONCLUSION",
        id:group+(multiple?".SECOND_COMMEMORATION":
          composed.kind==="INSEPARABLE_APOSTLES"?".PETER":".MISSION"),
        kind:"TEXT",
        latin:spokenBody(extra(latin)+"\n"+latin.conclusion,"lat"),
        vernacular:spokenBody(extra(trans)+"\n"+trans.conclusion,language),
        prayerRole:multiple?"SECOND_COMMEMORATION":"ORATION_UNDER_ONE_CONCLUSION",
        sourcePath:multiple?composed.sourcePaths?.[1]??null:
          composed.sourcePath??common.sourcePath,
      }));
    }else{
      paragraphs.push(Object.freeze({
        ...common,id:group,kind:"TEXT",
        latin:stripPinnedReadingResponse(spokenBody(row.lat??row.la,"lat"),slot,"lat").text,
        vernacular:stripPinnedReadingResponse(spokenBody(vernacularValue(row,language),language),slot,language).text,
        fixedResponseCueId:slot==="EPISTLE_OR_LESSON"?"AO.SM.C0076":slot==="GOSPEL"?"AO.SM.C0087":null,
        prayerRole:threefoldOration
          ?(index===0?"PRINCIPAL_ORATION":"ADDITIONAL_ORATION"):null,
      }));
    }
  }
  // Missal 1962 n. 481: the LAST Secret ends privately until
  // "Per omnia saecula saeculorum", said aloud in C0135 with C0136 Amen.
  // Remove only that exact bilingual audible tail from the *display*,
  // not the frozen source Proper. Earlier Secrets remain fully private.
  if(slot==="SECRET_SET"){
    const index=paragraphs.findLastIndex(p=>p.kind==="TEXT");
    if(index<0)return Object.freeze({status:"MISSING",slot,data:null,
      reason:"Final Secret prayer missing"});
    const last=paragraphs[index];
    const latinTail=/per\s+[oó]mnia\s+s(?:ae|[æǽ])cula\s+s(?:ae|[æǽ])cul[oó]rum\.\s*Amen\.\s*$/iu;
    const vernacularTail=french
      ?/(?:dans (?:tous )?les siècles des siècles|pour (?:tous )?les siècles des siècles|aux siècles des siècles)\.\s*(?:Ainsi soit-il|Amen)\.\s*$/iu
      :/(?:world without end|for ever and ever|forever and ever)\.\s*Amen\.\s*$/iu;
    const latinPresent=latinTail.test(last.latin);
    const transPresent=vernacularTail.test(last.vernacular);
    if(latinPresent&&!transPresent)return Object.freeze({status:"MISSING",slot,data:null,
      reason:"Secret audible conclusion has no matching translation"});
    if(latinPresent&&transPresent)paragraphs[index]=Object.freeze({
      ...last,
      latin:last.latin.replace(latinTail,"").trimEnd(),
      vernacular:last.vernacular.replace(vernacularTail,"").trimEnd(),
      secretConclusionBoundary:"AUDIBLE_PER_OMNIA_IN_CANONICAL_B041",
    });
  }
  return Object.freeze({
    status:"READY",slot,
    data:Object.freeze({paragraphs:Object.freeze(paragraphs)})
  });
}

export function properToReaderSlots(proper,{notApplicableSlots=[],language="en"}={}){
  if(!proper || typeof proper!=="object") throw new TypeError("Resolved Proper object required");
  proper=correct1962ProperEditorialReferences(proper);
  const locale=String(language??"en").toLowerCase().startsWith("fr") ? "fr" : "en";
  const opts={language:locale};

  const principalId=proper.principalCelebrationId??proper.mainId??proper.main?.id??null;
  const prefaceDecision=principalId?inspect1962PrefaceSelection({principalCelebrationId:principalId,selectedPreface:proper.preface,requestedCelebrationId:proper.requestedCelebrationId??null,sourcePath:proper.sourcePath??null,calendarDate:proper.selectedMassDate??null}):null;

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

  // Preserve flattened donor text unless all named [Graduale] and
  // [Alleluia]/[Tractus] originals reconstruct the SAME full la/en/fr Proper.
  // A separately sourced Sequence remains independent, not a phantom chant.
  const parts=validatedPreGospelChantParts(proper);
  const sequenceRows=values(proper.sequence,locale);
  if(parts){
    const gradual=readyEnvelope("GRADUAL",parts[0],opts);
    slots.GRADUAL=Object.freeze({...gradual,data:Object.freeze({
      paragraphs:Object.freeze(gradual.data.paragraphs.map(row=>Object.freeze({
        ...row,liturgicalGroup:"AO.CHANT.GRADUAL",
        sourcePath:parts[0].sourceRef,
      }))),
    })});
  }
  const nextChants=parts?[parts[1],...sequenceRows]:sequenceRows;
  const namedChants=parts?nextChants.map((row,index)=>Object.freeze({
    ...row,
    chantKind:index===0?parts[1].kind:"SEQUENCE",
    sourceRef:index===0?parts[1].sourceRef:
      String(row.sourceRef??row.sourcePath??proper.sourcePath+":Sequentia"),
  })):null;
  const chantSlot=nextChants.length
    ? readyEnvelope("ALLELUIA_TRACT_SEQUENCE",nextChants,opts)
    : Object.freeze({
        status:"NOT_APPLICABLE",
        slot:"ALLELUIA_TRACT_SEQUENCE",
        reason:"No separately sourced Alleluia/Tract or Sequence.",
        data:null,
      });
  slots.ALLELUIA_TRACT_SEQUENCE=parts&&chantSlot.status==="READY"
    ?Object.freeze({...chantSlot,data:Object.freeze({
      paragraphs:Object.freeze(chantSlot.data.paragraphs.map((row,index)=>
        Object.freeze({...row,
          liturgicalGroup:"AO.CHANT."+namedChants[index].chantKind,
          sourcePath:namedChants[index].sourceRef,
        }))),
      })})
    :chantSlot;

  // Source proof and all frozen source text were validated ABOVE. Apply
  // the one authorised English readability improvement only to output rows.
  const presented={...slots};
  let editorialApplied=false;
  for(const id of ["GRADUAL","ALLELUIA_TRACT_SEQUENCE"]){
    const entry=slots[id];
    if(entry?.status!=="READY")continue;
    const rows=project1962Pent21AlleluiaDisplayRows(
      proper,entry.data.paragraphs,{language:locale});
    if(rows===entry.data.paragraphs)continue;
    editorialApplied=true;
    presented[id]=Object.freeze({...entry,
      data:Object.freeze({...entry.data,paragraphs:rows})});
  }
  const missing=REQUIRED_SLOTS.filter(slot=>!["READY","NOT_APPLICABLE"].includes(presented[slot].status));
  return Object.freeze({
    schema:"ao-reader-proper-slots-v1",
    sourcePath:proper.sourcePath??null,
    ...(editorialApplied?{displayTranslationCorrections:
      Object.freeze([PS113_PENT21_ENGLISH_EDITORIAL])}:{}),
    slots:Object.freeze(presented),
    missing:Object.freeze(missing),
    ready:missing.length===0,
  });
}

export function assertReaderProperReady(mapped){
  if(!mapped || mapped.schema!=="ao-reader-proper-slots-v1") throw new TypeError("Reader Proper slot map required");
  if(!mapped.ready) throw new Error("Resolved Proper is incomplete for reader: "+mapped.missing.join(", "));
  return mapped;
}
