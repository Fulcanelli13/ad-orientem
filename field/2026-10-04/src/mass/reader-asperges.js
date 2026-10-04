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

  const chantRows=[
    freeze({id:"ASP-030-A",kind:"TEXT",latin:clean(formula.antiphon),sourceRecordId:"ASP-030"}),
    freeze({id:"ASP-030-P",kind:"TEXT",latin:clean(formula.psalm),sourceRecordId:"ASP-030"}),
  ];
  if(!formulaState.omitGloriaPatri){
    chantRows.push(freeze({id:"ASP-030-G",kind:"TEXT",latin:clean(formula.gloria),sourceRecordId:"ASP-030"}));
  }
  chantRows.push(freeze({id:"ASP-030-R",kind:"TEXT",latin:clean(formula.antiphon),sourceRecordId:"ASP-030"}));

  const versicleRows=(payload.versicles??[]).map((x,index)=>freeze({
    id:"ASP-050-"+String(index+1).padStart(2,"0"),
    kind:String(x.kind??"TEXT").toUpperCase(),
    latin:clean(x.latin),
    sourceRecordId:"ASP-050",
  }));
  versicleRows.push(freeze({
    id:"ASP-050-PRAYER",
    kind:"TEXT",
    latin:clean(payload.prayer?.latin),
    sourceRecordId:"ASP-050",
  }));
  versicleRows.push(freeze({
    id:"ASP-050-AMEN",
    kind:"RESPONSE",
    latin:clean(payload.prayer?.response),
    sourceRecordId:"ASP-050",
  }));

  return freeze({
    schema:"ao-r20-asperges-reader-payload-v1",
    formulaState,
    cards:freeze([
      freeze({
        id:"ASP-R01",title:"Sunday Aspersion",sourceRecordIds:freeze(["ASP-010"]),
        actorScope:"ALL_FAITHFUL",posture:"STAND",paragraphs:freeze([]),
        guide:"Stand for the Sunday sprinkling rite."
      }),
      freeze({
        id:"ASP-R02",title:formulaState.formula==="PASCHAL"?"Vidi aquam":"Asperges me",
        sourceRecordIds:freeze(["ASP-020","ASP-030"]),
        actorScope:"ALL_FAITHFUL",posture:"STAND",paragraphs:freeze(chantRows),
        ministerOnly:freeze({
          sourceRecordId:"ASP-020",posture:"KNEEL",action:"PREPARE_ASPERSORIUM",
          actorScope:"CELEBRANT_MINISTERS"
        })
      }),
      freeze({
        id:"ASP-R03",title:"When you are sprinkled",sourceRecordIds:freeze(["ASP-040"]),
        actorScope:"FAITHFUL_RECIPIENT",posture:"STAND",paragraphs:freeze([]),
        personalTrigger:"ACTUALLY_SPRINKLED",gesture:"MAKE_FULL_SIGN_OF_CROSS",
        guide:"Make the Sign of the Cross when you are actually sprinkled."
      }),
      freeze({
        id:"ASP-R04",title:"Versicles and Prayer",sourceRecordIds:freeze(["ASP-050"]),
        actorScope:"ALL_FAITHFUL",posture:"STAND",paragraphs:freeze(versicleRows),
        guide:"Make the appointed responses."
      }),
      freeze({
        id:"ASP-R05",title:"Mass begins",sourceRecordIds:freeze(["ASP-060"]),
        actorScope:"ALL",posture:"INHERIT",paragraphs:freeze([]),
        handoff:"FOOT_CLUSTER",guide:"The Asperges is complete; the ordinary Mass begins at the Prayers at the Foot."
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
