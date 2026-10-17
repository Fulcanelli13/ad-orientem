/**
 * Pure visual cursor over the canonical Divine Mercy prayer event list.
 * This module never owns texts, saves counters, or changes the actual step order.
 */
export const MERCY_BEAD_NAVIGATION_VERSION="2026-10-18-v1";
const OPENING_LABELS=Object.freeze({cross:["Sign of the Cross","Signe de croix"],pater:["Our Father","Notre Père"],ave:["Hail Mary","Je vous salue Marie"],creed:["Apostles’ Creed","Symbole des Apôtres"]});
const ROMAN=Object.freeze(["I","II","III","IV","V"]);
export function mercyBeadNavigationModel(steps,index,{french=false}={}){
 if(!Array.isArray(steps)||!steps.length||!Number.isInteger(index)||index<0||index>=steps.length)
  throw new RangeError("Invalid canonical Divine Mercy cursor");
 const item=steps[index];
 const starts=Array.from({length:5},(_,i)=>steps.findIndex(s=>s.group==="large-bead"&&s.decade===i+1));
 if(starts.some(x=>x<0))throw new TypeError("The five canonical decades are absent");
 const conclusionStart=steps.findIndex(s=>s.group==="conclusion");
 if(conclusionStart<0)throw new TypeError("Canonical concluding invocations are absent");
 const phase=item.group==="opening"?"opening":item.group==="conclusion"||item.group==="optional-conclusion"?"conclusion":"decade";
 const activeDecade=phase==="decade"?item.decade:null;
 const currentBead=phase==="decade"?(item.group==="large-bead"?0:item.bead):null;
 if(phase==="decade"&&(!Number.isInteger(activeDecade)||!Number.isInteger(currentBead)||currentBead<0||currentBead>10))
  throw new TypeError("Invalid canonical bead");
 const stepIndexes=activeDecade?Array.from({length:11},(_,i)=>starts[activeDecade-1]+i):[];
 if(activeDecade&&stepIndexes.some((n,i)=>{
  const s=steps[n];return !s||s.decade!==activeDecade||
   (i===0?s.group!=="large-bead":s.group!=="small-bead"||s.bead!==i);
 }))throw new TypeError("Malformed canonical decade");
 const caption=phase==="opening"
  ?french?"Prières initiales":"Opening prayers"
  :phase==="conclusion"
  ?french?"Prières finales":"Closing prayers"
  :`${french?"Dizaine":"Decade"} ${ROMAN[activeDecade-1]} · ${currentBead===0
   ?french?"Gros grain":"Large bead"
   :french?"Petit grain "+currentBead:"Small bead "+currentBead}`;
 const shortName=phase==="opening"?(OPENING_LABELS[item.key]?.[french?1:0]??caption):
  phase==="conclusion"?(french?"Invocations finales":"Closing invocations"):
  currentBead===0?(french?"Père éternel":"Eternal Father"):(french?"Par sa douloureuse Passion":"For the sake of His sorrowful Passion");
 return Object.freeze({
  phase,index,total:steps.length,activeDecade,currentBead,caption,shortName,
  opening:0,conclusion:conclusionStart,
  decades:Object.freeze(starts.map((start,i)=>Object.freeze({
   decade:i+1,roman:ROMAN[i],start,
   status:activeDecade===i+1?"active":index>start+10?"prayed":"unreached"
  }))),
  beads:Object.freeze(stepIndexes.map((stepIndex,i)=>Object.freeze({
   bead:i,step:stepIndex,large:i===0,status:i===currentBead?"active":i<currentBead?"prayed":"unreached"
  })))
 });
}
