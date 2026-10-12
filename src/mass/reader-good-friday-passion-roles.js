// These are speech-role witnesses, NOT physical singer assignments.
// 1962 Good Friday: Christus, Chronista, Synagoga are the three Passion
// textual voices. A lone three-voice score does not license silently
// labeling every unannotated portion of John 18–19.
const ROLES=new Set(["CHRISTUS","SYNAGOGA"]);
const SCHEMA="AO_MR1962_GOOD_FRIDAY_PASSION_VOICE_ANCHORS_V1";
const freeze=v=>Object.freeze(v);
function sourceOccurrence(text,phrase,ordinal){
 let start=-1,next=0;
 for(let count=0;count<=ordinal;count++){
  start=text.indexOf(phrase,next);
  if(start<0)return -1;
  next=start+phrase.length;
 }
 return start;
}
export function sourceBoundPassionVoiceSpans(registry,passion){
 if(registry==null)return null;
 if(registry.schema!==SCHEMA||!Array.isArray(registry.anchors)||
   !Number.isInteger(registry.expectedAnchors)||
   registry.anchors.length!==registry.expectedAnchors||
   registry.expectedAnchors<40||
   registry.status!=="PARTIAL_VERIFIED_TEXTUAL_SPEECH_ANCHORS__FULL_PASSION_SEGMENTATION_OPEN")
  throw new Error("Good Friday source-owned Passion voice witness incomplete");
 const out=new Map(),identity=new Set();
 for(const a of registry.anchors){
  const text=passion?.[a.block]?.[a.index];
  if(a.block!=="preDeath"||!Number.isInteger(a.index)||a.index<0||
    !Number.isInteger(a.occurrence)||a.occurrence<0||
    !ROLES.has(a.role)||!String(a.phrase??"").trim()||typeof text!=="string"||
    !registry.authority?.threeRoleScores?.[a.sourceRole])
    throw new Error("Good Friday Passion voice/source index invalid");
  const start=sourceOccurrence(text,a.phrase,a.occurrence);
  if(start<0)throw new Error("Good Friday Passion source utterance not found: "+a.phrase);
  const end=start+a.phrase.length,key=a.block+":"+a.index;
  const unique=key+":"+start+":"+end;
  if(identity.has(unique))throw new Error("Good Friday duplicated voice anchor "+unique);
  identity.add(unique);
  if(!out.has(key))out.set(key,[]);
  out.get(key).push(freeze({start,end,role:a.role,phrase:a.phrase,
    sourceRole:a.sourceRole,source:"CANTUS_PASSIONIS_1962_TEXTUAL_VOICE"}));
 }
 for(const [key,spans] of out){
  spans.sort((a,b)=>a.start-b.start);
  for(let i=1;i<spans.length;i++)if(spans[i-1].end>spans[i].start)
    throw new Error("Overlapping Good Friday Passion voice source spans: "+key);
  out.set(key,freeze(spans));
 }
 return out;
}
