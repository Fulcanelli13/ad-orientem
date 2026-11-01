// R20 native Asperges payload/controller.
// Rite text comes from a pinned 1962 Missale witness. Participation semantics
// come from the recovered ASP graph; minister-only state never propagates to the faithful.

function freeze(value){return Object.freeze(value)}
function clean(value){const s=String(value??"").trim();return s||null}


// Sunday Asperges formula context is derived from explicit host seasonalMode when
// available, with a deterministic Gregorian-date fallback. This keeps Vidi aquam
// and the Passiontide Gloria-Patri omission out of UI guesswork.
function easterSundayUtc(year){
  const a=year%19,b=Math.floor(year/100),cc=year%100,d=Math.floor(b/4),e=b%4;
  const ff=Math.floor((b+8)/25),g=Math.floor((b-ff+1)/3);
  const h=(19*a+b-d-g+15)%30,i=Math.floor(cc/4),k=cc%4;
  const l=(32+2*e+2*i-h-k)%7,m=Math.floor((a+11*h+22*l)/451);
  const month=Math.floor((h+l-7*m+114)/31);
  const day=((h+l-7*m+114)%31)+1;
  return new Date(Date.UTC(year,month-1,day));
}
function addUtcDays(date,days){
  return new Date(date.getTime()+Number(days)*86400000);
}
function isoUtcDate(value){
  const m=String(value??"").match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if(!m)return null;
  return new Date(Date.UTC(Number(m[1]),Number(m[2])-1,Number(m[3])));
}
// Printed 1961 Solesmes Kyriale, 2*: "In dominica II Passionis aspersio omittitur".
// The 1962 Palm Sunday calendar is the Sunday one week before Easter.
export function is1962PalmSunday(value){
 const date=isoUtcDate(value);
 if(!date || date.toISOString().slice(0,10)!==String(value??""))return false;
 const easter=easterSundayUtc(date.getUTCFullYear());
 return date.getTime()===addUtcDays(easter,-7).getTime();
}

export function resolveAspergesRiteContext(prepared={}){
  const resolved=prepared?.session?.resolvedMass??prepared?.resolvedMass??prepared;
  const explicit=String(resolved?.provenance?.seasonalMode??"").trim().toUpperCase().replace(/[ -]+/g,"_");
  if(/PASCH|EASTER/.test(explicit))return freeze({paschaltide:true,omitGloriaPatri:false,source:"HOST_SEASONAL_MODE"});
  if(/PASSION/.test(explicit))return freeze({paschaltide:false,omitGloriaPatri:true,source:"HOST_SEASONAL_MODE"});
  if(explicit && !/^(ORDINARY|TEMPUS_PER_ANNUM|ADVENT|CHRISTMAS|EPIPHANY|SEPTUAGESIMA|LENT|PRE_LENT)$/.test(explicit)){
    throw new Error("ASPERGES_SEASONAL_MODE_UNRECOGNIZED:"+explicit);
  }

  const date=isoUtcDate(resolved?.date);
  if(!date)throw new Error("ASPERGES_DATE_REQUIRED_FOR_FORMULA");
  const easter=easterSundayUtc(date.getUTCFullYear());
  const passionSunday=addUtcDays(easter,-14);
  const pentecost=addUtcDays(easter,49);
  if(date>=easter && date<=pentecost)return freeze({paschaltide:true,omitGloriaPatri:false,source:"DATE_DERIVED_1962_SEASON"});
  if(date>=passionSunday && date<easter)return freeze({paschaltide:false,omitGloriaPatri:true,source:"DATE_DERIVED_1962_SEASON"});
  return freeze({paschaltide:false,omitGloriaPatri:false,source:explicit?"HOST_SEASONAL_MODE":"DATE_DERIVED_1962_SEASON"});
}

export function resolveAspergesFormula({paschaltide=false,omitGloriaPatri=false}={}){
  return freeze({
    formula:paschaltide?"PASCHAL":"ORDINARY",
    paschaltide:Boolean(paschaltide),
    omitGloriaPatri:Boolean(!paschaltide && omitGloriaPatri),
  });
}

export function buildAspergesPayload({graph,payload,riteContext={}}={}){
  if(!Array.isArray(graph) || graph.length!==6)throw new Error("Certified six-record ASP graph required");
  if(payload?.schema!=="ao-r20-asperges-payload-v1")throw new Error("Pinned Asperges payload required");
  const byId=new Map(graph.map(x=>[x.id,x]));
  for(const id of ["ASP-010","ASP-020","ASP-030","ASP-040","ASP-050","ASP-060"]){
    if(!byId.has(id))throw new Error("Asperges graph missing "+id);
  }

  const formulaState=resolveAspergesFormula(riteContext);
  const formula=payload.formulas?.[formulaState.formula];
  if(!formula?.antiphon || !formula?.psalm)throw new Error("Asperges formula text incomplete");

  // Latin is the certified sung/ritual text; EN/FR are reading aids only.
  // Never replace the source-owned Latin or assign a translated phrase to
  // a new ceremonial cue, priest observation, chant clock or Mass event.
  const chantRow=(id,key)=>freeze({
    id,kind:"TEXT",latin:clean(formula[key]),
    english:clean(formula.english?.[key]),french:clean(formula.french?.[key]),
    sourceRecordId:"ASP-030",
  });
  const chantRows=[
    chantRow("ASP-030-A","antiphon"),
    chantRow("ASP-030-P","psalm"),
  ];
  if(!formulaState.omitGloriaPatri)chantRows.push(chantRow("ASP-030-G","gloria"));
  chantRows.push(chantRow("ASP-030-R","antiphon"));

  const versicleRows=(payload.versicles??[]).map((x,index)=>{
    const kind=String(x.kind??"TEXT").toUpperCase();
    const marker=kind==="VERSICLE"?"℣. ":kind==="RESPONSE"?"℟. ":"";
    // The printed 1961 Kyriale p. 3* adds Alleluia to both opening
    // versicle and response in Eastertide. Do not append it elsewhere.
    const paschalPair=formulaState.paschaltide && index<2;
    if(paschalPair && (!x.paschalAddition?.latin || !x.paschalAddition?.english ||
      !x.paschalAddition?.french))throw new Error("ASPERGES_PASCHAL_RESPONSE_ALLELUIA_SOURCE_MISSING");
    const withSeason=(text,addition)=>clean(text)+(paschalPair?" "+clean(addition):"");
    return freeze({
      id:"ASP-050-"+String(index+1).padStart(2,"0"),
      kind,latin:marker+withSeason(x.latin,x.paschalAddition?.latin),
      english:withSeason(x.english,x.paschalAddition?.english),
      french:withSeason(x.french,x.paschalAddition?.french),
      sourceRecordId:"ASP-050",
    });
  });
  // The appointed Orémus belongs immediately before Exaudi nos; it was
  // missing from the printed special-rite reader, not from the source rite.
  versicleRows.push(freeze({
    id:"ASP-050-OREMUS",kind:"VERSICLE",latin:"℣. Orémus.",
    english:"Let us pray.",french:"Prions.",sourceRecordId:"ASP-050",
  }));
  versicleRows.push(freeze({
    id:"ASP-050-PRAYER",kind:"TEXT",
    latin:clean(payload.prayer?.latin),
    english:clean(payload.prayer?.english),
    french:clean(payload.prayer?.french),
    sourceRecordId:"ASP-050",
  }));
  versicleRows.push(freeze({
    id:"ASP-050-AMEN",kind:"RESPONSE",
    latin:"℟. "+clean(payload.prayer?.response),
    english:clean(payload.prayer?.responseEnglish),
    french:clean(payload.prayer?.responseFrench),
    sourceRecordId:"ASP-050",
  }));

  return freeze({
    schema:"ao-r20-asperges-reader-payload-v1",
    formulaState,
    cards:freeze([
      freeze({
        id:"ASP-R01",title:"Sunday Aspersion",titleFr:"Aspersion dominicale",sourceRecordIds:freeze(["ASP-010"]),
        actorScope:"ALL_FAITHFUL",posture:"STAND",paragraphs:freeze([]),
        guide:"Stand for the Sunday sprinkling rite.",
        guideFr:"Restez debout pour l'aspersion dominicale."
      }),
      freeze({
        id:"ASP-R02",title:formulaState.formula==="PASCHAL"?"Vidi aquam":"Asperges me",
        titleFr:formulaState.formula==="PASCHAL"?"Vidi aquam":"Asperges me",
        sourceRecordIds:freeze(["ASP-020","ASP-030"]),
        actorScope:"ALL_FAITHFUL",posture:"STAND",paragraphs:freeze(chantRows),
        ministerOnly:freeze({
          sourceRecordId:"ASP-020",posture:"KNEEL",action:"PREPARE_ASPERSORIUM",
          actorScope:"CELEBRANT_MINISTERS"
        })
      }),
      freeze({
        id:"ASP-R03",title:"When you are sprinkled",titleFr:"Lorsque vous recevez l'aspersion",sourceRecordIds:freeze(["ASP-040"]),
        actorScope:"FAITHFUL_RECIPIENT",posture:"STAND",paragraphs:freeze([]),
        personalTrigger:"ACTUALLY_SPRINKLED",gesture:"MAKE_FULL_SIGN_OF_CROSS",
        guide:"Make the Sign of the Cross when you are actually sprinkled.",
        guideFr:"Faites le signe de croix lorsque vous recevez effectivement l'aspersion."
      }),
      freeze({
        id:"ASP-R04",title:"Versicles and Prayer",titleFr:"Versets et oraison",sourceRecordIds:freeze(["ASP-050"]),
        actorScope:"ALL_FAITHFUL",posture:"STAND",paragraphs:freeze(versicleRows),
        guide:"Make the appointed responses.",guideFr:"Répondez aux versets prescrits."
      }),
      freeze({
        id:"ASP-R05",title:"Mass begins",titleFr:"Début de la Messe",sourceRecordIds:freeze(["ASP-060"]),
        actorScope:"ALL",posture:"INHERIT",paragraphs:freeze([]),
        handoff:"FOOT_CLUSTER",guide:"The Asperges is complete; the ordinary Mass begins at the Prayers at the Foot.",
        guideFr:"L'aspersion est terminée ; la Messe commence par les prières au bas de l'autel."
      }),
    ])
  });
}

export function createAspergesReaderController(args={}){
  const built=buildAspergesPayload(args);
  let index=0;
  let actuallySprinkled=false;

  function state(){
    const card=built.cards[index]??null;
    const personalActive=card?.personalTrigger==="ACTUALLY_SPRINKLED" ? actuallySprinkled : true;
    return freeze({
      schema:"ao-r20-asperges-reader-state-v1",
      supported:true,
      index,
      total:built.cards.length,
      atStart:index===0,
      atEnd:index===built.cards.length-1,
      card,
      faithfulGesture:personalActive ? card?.gesture??null : null,
      personalTriggerActive:personalActive,
      handoff:card?.handoff??null,
      formulaState:built.formulaState,
    });
  }

  function next(){index=Math.min(index+1,built.cards.length-1);return state()}
  function previous(){index=Math.max(index-1,0);return state()}
  function goTo(cardId){
    const hit=built.cards.findIndex(x=>x.id===cardId);
    if(hit>=0)index=hit;
    return state();
  }
  function setActuallySprinkled(value=true){actuallySprinkled=Boolean(value);return state()}

  return freeze({
    schema:"ao-r20-asperges-reader-controller-v1",
    supported:true,
    cards:built.cards,
    project:state,
    next,previous,goTo,setActuallySprinkled,
  });
}


async function readJson(fetchImpl,url,label){
  const response=await fetchImpl(url);
  if(!response?.ok)throw new Error("Unable to load "+label+" ("+(response?.status??"network")+")");
  const data=await response.json();
  if(!data || typeof data!=="object")throw new Error(label+" did not return JSON object");
  return data;
}

export async function loadAspergesReaderData({
  fetchImpl=globalThis.fetch,
  baseUrl=import.meta.url,
}={}){
  if(typeof fetchImpl!=="function")throw new TypeError("fetch implementation required");
  const payloadUrl=new URL("../../data/presentation/reader-asperges.v1.json",baseUrl);
  const extensionUrl=new URL("../../data/mass/special-days-extension.v1.3.json",baseUrl);
  const [payload,extension]=await Promise.all([
    readJson(fetchImpl,payloadUrl,"Asperges reader payload"),
    readJson(fetchImpl,extensionUrl,"special-days extension"),
  ]);
  const graph=extension?.graphs?.ASP;
  if(!Array.isArray(graph))throw new Error("Certified ASP graph unavailable");
  return freeze({
    payload,
    graph:freeze([...graph]),
    urls:freeze({payload:String(payloadUrl),extension:String(extensionUrl)}),
  });
}
