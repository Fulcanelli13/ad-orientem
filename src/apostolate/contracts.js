export const APOSTOLATE_SOT_VERSION="APOSTOLATE_SOT_V1";
export const APOSTOLATE_OWNER="AO_APOSTOLATE_APP_V1";

export const APOSTOLATE_ENGINES=Object.freeze({
  ANSWER:"ANSWER_ENGINE",
  HELP:"HELP_ENGINE",
  INTRODUCE:"INTRODUCE_ENGINE",
});

export const APOSTOLATE_SCENARIO_FAMILIES=Object.freeze([
  Object.freeze({prefix:"AQ",count:8,engine:APOSTOLATE_ENGINES.ANSWER}),
  Object.freeze({prefix:"HS",count:7,engine:APOSTOLATE_ENGINES.HELP}),
  Object.freeze({prefix:"FH",count:8,engine:APOSTOLATE_ENGINES.HELP}),
  Object.freeze({prefix:"TF",count:5,engine:APOSTOLATE_ENGINES.INTRODUCE}),
  Object.freeze({prefix:"DV",count:5,engine:APOSTOLATE_ENGINES.INTRODUCE}),
  Object.freeze({prefix:"WC",count:3,engine:APOSTOLATE_ENGINES.INTRODUCE}),
]);

export const APOSTOLATE_SCENARIO_IDS=Object.freeze(
  APOSTOLATE_SCENARIO_FAMILIES.flatMap(family=>
    Array.from({length:family.count},(_,index)=>family.prefix+String(index+1).padStart(2,"0"))
  )
);

export const APOSTOLATE_SKILLS=Object.freeze([
  Object.freeze({id:"APF01",name:"Apostolic spirit"}),
  Object.freeze({id:"APF02",name:"Listen before answering"}),
  Object.freeze({id:"APF03",name:"Discern the real need"}),
  Object.freeze({id:"APF04",name:"Explain clearly"}),
  Object.freeze({id:"APF05",name:"Charity, fairness & tact"}),
  Object.freeze({id:"APF06",name:"Handle objections without wrangling"}),
  Object.freeze({id:"APF07",name:"Know what you do not know"}),
  Object.freeze({id:"APF08",name:"Know your boundaries"}),
  Object.freeze({id:"APF09",name:"Practise, follow up & deepen"}),
]);

export const APOSTOLATE_CLAIM_CLASSES=Object.freeze(["D","N","T","H","S","P","C"]);
export const APOSTOLATE_PUBLICATION_STATES=Object.freeze(["RESEARCH_ONLY","READY"]);
export const APOSTOLATE_SOURCE_STRENGTHS=Object.freeze(["PRIMARY","PRIMARY_PLUS_CATECHETICAL","MIXED_VERIFIED"]);
export const APOSTOLATE_TEACHING_STEPS=Object.freeze(["understand","minimum","prepare","launch","followUp"]);
export const APOSTOLATE_ONRAMP_STEPS=Object.freeze(["minimum","anxiety","boundary","handoff"]);

export const APOSTOLATE_OWNERSHIP_BOUNDARIES=Object.freeze({
  MASS:Object.freeze({owner:"mass",target:"mass"}),
  CONFESSION:Object.freeze({owner:"pray",target:"pray.confession"}),
  RECEPTION:Object.freeze({owner:"formation",target:null}),
  ANOINTING_VIATICUM:Object.freeze({owner:"formation",target:"learn.rites.sick"}),
  FIRST_COMMUNION:Object.freeze({owner:"formation",target:"learn.rites.first_communion"}),
  NOVENAS:Object.freeze({owner:"pray",target:"pray.novenas"}),
});

export const APOSTOLATE_HANDOFF_DIRECTIONS=Object.freeze({
  FORMATION_TO_APOSTOLATE:"FORMATION_TO_APOSTOLATE",
  APOSTOLATE_TO_FORMATION:"APOSTOLATE_TO_FORMATION",
});

const scenarioSet=new Set(APOSTOLATE_SCENARIO_IDS);
const skillSet=new Set(APOSTOLATE_SKILLS.map(skill=>skill.id));
const claimSet=new Set(APOSTOLATE_CLAIM_CLASSES);
const publicationSet=new Set(APOSTOLATE_PUBLICATION_STATES);

export function engineForScenarioId(value){
  const id=String(value??"").trim().toUpperCase();
  if(!scenarioSet.has(id))return null;
  const family=APOSTOLATE_SCENARIO_FAMILIES.find(entry=>id.startsWith(entry.prefix));
  return family?.engine??null;
}

function nonEmpty(value){return typeof value==="string"&&value.trim().length>0;}

export function makeApostolateScenario(input={}){
  const id=String(input.id??"").trim().toUpperCase();
  if(!scenarioSet.has(id))throw new Error("Unknown Apostolate scenario id: "+id);
  const engine=engineForScenarioId(id);
  if(input.engine&&input.engine!==engine)throw new Error("Scenario engine does not match frozen family: "+id);
  const publication=String(input.publication??"RESEARCH_ONLY").trim().toUpperCase();
  if(!publicationSet.has(publication))throw new Error("Unknown Apostolate publication state: "+publication);

  const record={
    id,
    engine,
    publication,
    claimClass:input.claimClass??null,
    title:input.title&&typeof input.title==="object"?input.title:{},
    text:input.text&&typeof input.text==="object"?input.text:{},
    explanation:input.explanation&&typeof input.explanation==="object"?input.explanation:{},
    avoid:input.avoid&&typeof input.avoid==="object"?input.avoid:{},
    apfSkills:Array.isArray(input.apfSkills)?input.apfSkills.filter(nonEmpty):[],
    doctrineRefs:Array.isArray(input.doctrineRefs)?input.doctrineRefs.filter(nonEmpty):[],
    sourceStrength:nonEmpty(input.sourceStrength)?input.sourceStrength:null,
    teaching:input.teaching&&typeof input.teaching==="object"?input.teaching:{},
    onRamp:input.onRamp&&typeof input.onRamp==="object"?input.onRamp:{},
    sourceIds:Array.isArray(input.sourceIds)?input.sourceIds.filter(nonEmpty):[],
    handoffs:Array.isArray(input.handoffs)?input.handoffs:[],
  };

  if(publication==="READY"){
    if(!claimSet.has(record.claimClass))throw new Error("READY Apostolate scenario requires a valid claim class: "+id);
    if(record.sourceIds.length===0)throw new Error("READY Apostolate scenario requires resolved source IDs: "+id);
    if(!nonEmpty(record.title.en)||!nonEmpty(record.title.fr))throw new Error("READY Apostolate scenario requires English and French titles: "+id);
    if(!nonEmpty(record.text.en)||!nonEmpty(record.text.fr))throw new Error("READY Apostolate scenario requires English and French text: "+id);
    if(!nonEmpty(record.explanation.en)||!nonEmpty(record.explanation.fr))throw new Error("READY Apostolate scenario requires English and French explanations: "+id);
    if(record.apfSkills.length===0||record.apfSkills.some(skill=>!skillSet.has(skill)))throw new Error("READY Apostolate scenario requires valid APF skills: "+id);
    if(!Array.isArray(record.avoid.en)||record.avoid.en.length===0||!Array.isArray(record.avoid.fr)||record.avoid.fr.length===0)throw new Error("READY Apostolate scenario requires bilingual avoidances: "+id);
    if(record.handoffs.length===0)throw new Error("READY Apostolate scenario requires at least one canonical handoff: "+id);
    if(id.startsWith("TF")){
      if(record.doctrineRefs.length===0)throw new Error("READY TF scenario requires doctrineRefs: "+id);
      if(!APOSTOLATE_SOURCE_STRENGTHS.includes(record.sourceStrength))throw new Error("READY TF scenario requires a valid sourceStrength: "+id);
      const incomplete=APOSTOLATE_TEACHING_STEPS.filter(step=>!nonEmpty(record.teaching?.[step]?.en)||!nonEmpty(record.teaching?.[step]?.fr));
      if(incomplete.length)throw new Error("READY TF scenario requires bilingual INTRODUCE teaching steps: "+id+" ("+incomplete.join(",")+")");
    }
    if(id.startsWith("DV")){
      if(!APOSTOLATE_SOURCE_STRENGTHS.includes(record.sourceStrength))throw new Error("READY DV scenario requires a valid sourceStrength: "+id);
      const incomplete=APOSTOLATE_ONRAMP_STEPS.filter(step=>!nonEmpty(record.onRamp?.[step]?.en)||!nonEmpty(record.onRamp?.[step]?.fr));
      if(incomplete.length)throw new Error("READY DV scenario requires bilingual on-ramp steps: "+id+" ("+incomplete.join(",")+")");
    }
  }

  return Object.freeze({
    ...record,
    title:Object.freeze({...record.title}),
    text:Object.freeze({...record.text}),
    explanation:Object.freeze({...record.explanation}),
    avoid:Object.freeze({
      en:Object.freeze([...(Array.isArray(record.avoid.en)?record.avoid.en:[])]),
      fr:Object.freeze([...(Array.isArray(record.avoid.fr)?record.avoid.fr:[])]),
    }),
    apfSkills:Object.freeze([...record.apfSkills]),
    doctrineRefs:Object.freeze([...record.doctrineRefs]),
    teaching:Object.freeze(Object.fromEntries(
      Object.entries(record.teaching).map(([key,value])=>[key,Object.freeze({...value})])
    )),
    onRamp:Object.freeze(Object.fromEntries(
      Object.entries(record.onRamp).map(([key,value])=>[key,Object.freeze({...value})])
    )),
    sourceIds:Object.freeze([...record.sourceIds]),
    handoffs:Object.freeze([...record.handoffs]),
  });
}

export function makeApostolateHandoff(input={}){
  const direction=String(input.direction??"").trim().toUpperCase();
  if(!Object.values(APOSTOLATE_HANDOFF_DIRECTIONS).includes(direction))throw new Error("Unknown Apostolate handoff direction");
  const fromId=String(input.fromId??"").trim();
  const targetId=String(input.targetId??"").trim();
  const reason=String(input.reason??"").trim();
  if(!fromId||!targetId||!reason)throw new Error("Apostolate handoff requires fromId, targetId and reason");

  if(direction===APOSTOLATE_HANDOFF_DIRECTIONS.APOSTOLATE_TO_FORMATION&&!targetId.startsWith("learn.")){
    throw new Error("Apostolate → Formation handoff must target the canonical learn.* namespace");
  }
  if(direction===APOSTOLATE_HANDOFF_DIRECTIONS.FORMATION_TO_APOSTOLATE&&!scenarioSet.has(targetId)&&!skillSet.has(targetId)){
    throw new Error("Formation → Apostolate handoff must target a frozen scenario or APF skill");
  }

  return Object.freeze({
    schema:"AO_APOSTOLATE_HANDOFF_V1",
    direction,
    fromId,
    targetId,
    reason,
    sourceSurface:direction===APOSTOLATE_HANDOFF_DIRECTIONS.APOSTOLATE_TO_FORMATION?"apostolate":"learn",
    targetSurface:direction===APOSTOLATE_HANDOFF_DIRECTIONS.APOSTOLATE_TO_FORMATION?"learn":"apostolate",
  });
}

export function auditApostolateScenario(record){
  try{
    makeApostolateScenario(record);
    return Object.freeze({pass:true,issues:Object.freeze([])});
  }catch(error){
    return Object.freeze({pass:false,issues:Object.freeze([String(error?.message??error)])});
  }
}
