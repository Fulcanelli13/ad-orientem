// 1962 Ritus servandus XIV. Conditional directions for a SINGLE priest
// celebrating successive Masses on All Souls. Never infer continuity from
// the selected formulary, the date alone, or the congregant's observation.
// Primary printed Latin: Ritus servandus XIV.1(a-b), XIV.2.
// https://summorum-pontificum.de/z_archive/vorort/ritus_servandus_62.html
export const RITUS_XIV_SOURCE="https://summorum-pontificum.de/z_archive/vorort/ritus_servandus_62.html";
export const BEFORE_OPTIONS=Object.freeze(["UNKNOWN","IMMEDIATE","INTERRUPTED","NONE"]);
export const AFTER_OPTIONS=Object.freeze(["UNKNOWN","IMMEDIATE","INTERRUPTED_LT3","INTERRUPTED_GTE3","NONE"]);
const belongs=(array,x)=>array.includes(x);
const freeze=x=>Object.freeze(x);
export function resolve1962AllSoulsSuccession({
 date,sourcePath,massNumber,previous="UNKNOWN",next="UNKNOWN"
}={}){
 const num=Number(massNumber),path=String(sourcePath??"");
 if(!/^\d{4}-11-02$/.test(String(date??""))||
    ![1,2,3].includes(num)||path!=="Sancti/11-02m"+num)
   throw Error("RITUS_XIV_ALL_SOULS_SOURCE_IDENTITY_MISMATCH");
 if(!belongs(BEFORE_OPTIONS,previous)||!belongs(AFTER_OPTIONS,next))
   throw Error("RITUS_XIV_UNSUPPORTED_CELEBRANT_SEQUENCE");
 if(num===1&&previous!=="NONE"||num===3&&next!=="NONE")
   throw Error("RITUS_XIV_IMPOSSIBLE_MASS_NUMBER_SEQUENCE");
 return freeze({
   schema:"ao-ritus-xiv-all-souls-succession-v1",
   date,sourcePath:path,massNumber:num,previous,next,
   precedingMassImmediate:num>1&&previous==="IMMEDIATE",
   followingMassImmediate:num<3&&next==="IMMEDIATE",
   interruptedWaterOnly:num<3&&next==="INTERRUPTED_LT3",
   contextualStatus:
     (num===1||previous!=="UNKNOWN")&&(num===3||next!=="UNKNOWN")
       ?"EXPLICIT_CIRCUMSTANCES":"UNKNOWN_CIRCUMSTANCES",
   source:RITUS_XIV_SOURCE,
   sourceSections:freeze(["XIV.1(a)","XIV.1(b)","XIV.2"]),
 });
}
const annotations=freeze({
  offertory:freeze({cueId:"AO.SM.C0112",section:"XIV.1(b)",
    en:"The same priest has just celebrated the preceding Mass without leaving the altar. At the Offertory he keeps the chalice within the corporal, sets it briefly toward the Epistle side, and does not wipe its interior before adding wine and water.",
    fr:"Le même prêtre vient de célébrer la messe précédente sans quitter l'autel. À l'offertoire, il garde le calice sur le corporal, le place un moment du côté de l'épître et n'en essuie pas l'intérieur avant d'y verser le vin et l'eau."}),
  immediateFirst:freeze({cueId:"AO.SM.C0247",section:"XIV.1(a)",
    en:"As the same priest will celebrate another Mass immediately, he does not purify or wipe the chalice after consuming the Precious Blood. He sets it on the corporal and covers it with the pall. He continues with Quod ore sumpsimus.",
    fr:"Comme le même prêtre célébrera aussitôt une autre messe, il ne purifie ni n'essuie le calice après avoir communié au Précieux Sang. Il le dépose sur le corporal et le couvre de la pale, puis dit Quod ore sumpsimus."}),
  immediateSecond:freeze({cueId:"AO.SM.C0248",section:"XIV.1(a)",
    en:"He washes his fingers with water in a separate vessel while saying Corpus tuum, then wipes them; the unpurified chalice stays on the corporal and is covered for the following Mass.",
    fr:"Il lave ses doigts avec de l'eau dans un récipient distinct en disant Corpus tuum, puis les essuie ; le calice non purifié reste sur le corporal et est recouvert pour la messe suivante."}),
  interrupted:freeze({cueId:"AO.SM.C0247",section:"XIV.2",
    en:"The same priest will celebrate again after an interruption of less than three hours: he performs the prescribed ablutions, but uses water only. This is not the unpurified-chalice procedure for immediately consecutive Masses.",
    fr:"Le même prêtre célébrera de nouveau après une interruption de moins de trois heures : il effectue les ablutions prescrites, mais avec de l'eau seulement. Il ne suit pas ici le rite du calice non purifié des messes immédiatement consécutives."}),
});
export function ritusXIVRubricsForCue(decision,cueId,language="en"){
 if(decision?.schema!=="ao-ritus-xiv-all-souls-succession-v1"||
    decision.sourcePath!=="Sancti/11-02m"+decision.massNumber||
    !/^\d{4}-11-02$/.test(decision.date))return freeze([]);
 const rows=[];
 if(decision.precedingMassImmediate&&cueId===annotations.offertory.cueId)rows.push(annotations.offertory);
 if(decision.followingMassImmediate){
   if(cueId===annotations.immediateFirst.cueId)rows.push(annotations.immediateFirst);
   if(cueId===annotations.immediateSecond.cueId)rows.push(annotations.immediateSecond);
 }else if(decision.interruptedWaterOnly&&cueId===annotations.interrupted.cueId)
   rows.push(annotations.interrupted);
 return freeze(rows.map(x=>freeze({
   id:"AO.RITUS.XIV."+decision.massNumber+"."+x.section+"."+cueId,
   sourceCueId:cueId,actor:"PRIEST",
   kind:"CONDITIONAL_DIRECTION",shortAction:"RITUS_XIV_"+x.section,
   displayText:x[String(language).startsWith("fr")?"fr":"en"],
   sourceId:"MR62_RITUS",sourceUrl:RITUS_XIV_SOURCE,
   review:"RITUS_1962_EXPLICIT_PRIEST_SUCCESSION",
   observedNow:false,owner:"RITUS_XIV_SOURCE_CONDITIONAL",
 })));
}
export function with1962RitusXIVParagraphRubrics(paragraphs,decision,{language="en"}={}){
 if(!Array.isArray(paragraphs))return freeze([]);
 if(decision?.schema!=="ao-ritus-xiv-all-souls-succession-v1")return paragraphs;
 return freeze(paragraphs.map(p=>{
   const cues=p?.sourceCueIds??[];
   const extras=cues.flatMap(id=>ritusXIVRubricsForCue(decision,id,language));
   return extras.length?freeze({...p,publishedMissalRubrics:freeze([
     ...(p.publishedMissalRubrics??[]),...extras
   ])}):p;
 }));
}
