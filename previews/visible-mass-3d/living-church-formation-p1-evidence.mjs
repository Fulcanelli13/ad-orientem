/**
 * Source-owned Formation P1 Mass evidence for Living Church review.
 * Does NOT release any Mass Explorer deep studies, draft source passages,
 * new theological paraphrases, or unspecified future claims.
 */
export const LIVING_CHURCH_FORMATION_EVIDENCE_VERSION="AO_LC_P8_FORMATION_P1_EVIDENCE_V1";
const FORMATION_URL=new URL("../../data/learn/mass-formation-campion.v1.json",import.meta.url);
const RELEASE_URLS=[
 new URL("../../data/learn/mass-explorer-approved-studies.v1.json",import.meta.url),
 new URL("../../data/learn/mass-formation-approved-passages.v1.json",import.meta.url)
];
const EXPECTED_STAGES=Object.freeze(["MF01","MF02","MF03","MF04","MF05","MF06","MF07","MF08"]);
const EXPECTED_SOURCE_IDS=Object.freeze([
 "SRC-MR62","SRC-MEDIATOR-DEI","SRC-OCONNELL-1962","SRC-CAMPION-1954"
]);
const topicRules=Object.freeze([
 {id:"MF01-C01",rx:/\b(catechumens and faithful|mass of the catechumens|mass of the faithful|messe des catechumenes|messe des fideles)\b/},
 {id:"MF01-C02",rx:/\b(parts of the first half|beginning of the mass|introit kyrie|before the gospel|avant l.evangile|debut de la messe)\b/},
 {id:"MF02-C02",rx:/\b(gestures of the faithful|same gestures as the priest|congregation kneel|faithful posture|gestes des fideles|attitude des fideles)\b/},
 {id:"MF03-C01",rx:/\b(orate fratres|my sacrifice and yours|mon sacrifice et le votre)\b/},
 {id:"MF03-C02",rx:/\b(faithful offer|offer with the priest|laity offer|offrande des fideles|fide.les offrent)\b/},
 {id:"MF04-C01",rx:/\b(why is the (roman )?canon silent|why is the canon said (in a )?low voice|silence of the canon|silent roman canon|canon (is )?silent|canon a voix basse|silence du canon)\b/},
 {id:"MF04-C02",rx:/\b(who (does the canon|is remembered in the canon) pray for|whom does the canon|living and dead in the canon|who is commemorated in the canon|pour qui prie le canon)\b/},
 {id:"MF04-C03",rx:/\b(mementos|memento (of|for) (the )?(living|dead)|mementos? des vivants|mementos? des morts)\b/},
 {id:"MF05-C03",rx:/\b(why are the (host|chalice|species) elevated|why the elevation|meaning of the elevations|elevation of the host|sens des elevations)\b/},
 {id:"MF06-C02",rx:/\b(abel abraham (and )?melchi|why (does )?(the )?(roman )?canon name abel|abel in the canon|abel abraham melchisedech)\b/},
 {id:"MF07-C01",rx:/\b(why must the priest receive|priest (must|has to) receive communion|communion obligatoire du pretre|pourquoi le pretre communie)\b/},
 {id:"MF07-C02",rx:/\b(must the faithful receive communion|do i have to receive communion|must everyone receive communion|can you attend mass without communion|faut.il communier a la messe)\b/},
 {id:"MF08-C01",rx:/\b(postcommunion prayer|postcommunion thanksgiving|prayer after communion|action de graces apres la communion)\b/}
]);
const plain=x=>typeof x==="string"&&x.trim()===x&&x.length>15&&x.length<2000;
const safeUrl=value=>{
 try{const u=new URL(value);return u.protocol==="https:"?u.href:null;}catch{return null;}
};
const normalize=s=>String(s||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
const sourceGap=(code,fr)=>Object.freeze({ok:false,code,mode:"SOURCE_GAP",citations:[],
 text:fr?"Ce point n’est pas couvert par une formulation approuvée dans ce parcours. Consultez la Formation originale.":"The original Formation material does not support a sufficiently precise answer here. Open the original Formation module."});
export async function loadFormationP1Evidence({fetchImpl=fetch,lang="en"}={}){
 const fr=lang==="fr";
 const fetched=await Promise.all([FORMATION_URL,...RELEASE_URLS].map(u=>fetchImpl(u)));
 if(fetched.some(x=>!x?.ok))throw Error("Original Formation P1 or editorial release manifests unavailable");
 const [formation,studyRelease,passageRelease]=await Promise.all(fetched.map(x=>x.json()));
 if(formation?.schema!=="ao-mass-formation-campion-v1"||
    formation?.status!=="SOURCE_BACKED_FORMATION"||
    formation?.route!=="learn.mass"||
    !Array.isArray(formation.stages)||formation.stages.length!==8||
    formation.stages.some((s,i)=>s.id!==EXPECTED_STAGES[i]||
      s.order!==i+1||!Array.isArray(s.claims)||s.claims.length!==3)||
    !Array.isArray(formation.sources)||formation.sources.length!==4||
    formation.sources.some((x,i)=>x.id!==EXPECTED_SOURCE_IDS[i]||
      !safeUrl(x.canonical_url))||
    studyRelease?.schema!=="ao-mass-explorer-study-publication-v1"||
    studyRelease?.status!=="NO_APPROVED_STUDIES"||
    passageRelease?.schema!=="ao-formation-approved-passages-v1"||
    passageRelease?.status!=="NO_APPROVED_PASSAGES")
  throw Error("Formation P1 evidence or editorial release gates changed: manual review required");
 const sources=new Map(formation.sources.map(s=>[s.id,s]));
 const claims=new Map();
 for(const stage of formation.stages){
  for(const [i,claim] of stage.claims.entries()){
   const expected=stage.id+"-C"+String(i+1).padStart(2,"0");
   if(claim.id!==expected||claims.has(claim.id)||!plain(claim.text?.en)||
      !plain(claim.text?.fr)||!Array.isArray(claim.sources)||
      !claim.sources.length||claim.sources.some(id=>!sources.has(id)))
     throw Error("Formation P1 claim lineage changed: manual review required");
   claims.set(claim.id,Object.freeze({
    id:claim.id,stageId:stage.id,stageTitle:Object.freeze({...stage.title}),
    text:Object.freeze({...claim.text}),sourceIds:Object.freeze([...claim.sources])
   }));
  }
 }
 if(claims.size!==24)throw Error("Unexpected Formation P1 claim count");
 const answer=question=>{
  const q=normalize(question);
  if(q.length<8||q.length>320)return sourceGap("UNSUPPORTED_QUERY",fr);
  const matched=topicRules.filter(x=>x.rx.test(q));
  if(matched.length!==1)return sourceGap("NOT_SINGLE_PUBLISHED_P1_CLAIM",fr);
  const claim=claims.get(matched[0].id);
  if(!claim)return sourceGap("NO_P1_CLAIM",fr);
  const citations=claim.sourceIds.map(id=>{
   const s=sources.get(id);
   return Object.freeze({id,label:s.title,locator:"Document-level reference · exact passage not independently certified",url:safeUrl(s.canonical_url)});
  });
  return Object.freeze({ok:true,mode:"EXACT_PUBLISHED_FORMATION_P1_CLAIM",id:claim.id,
    owner:"Formation",title:claim.stageTitle[fr?"fr":"en"],
    text:claim.text[fr?"fr":"en"],detail:"",
    citations:Object.freeze(citations),
    citationPrecision:"DOCUMENT_LEVEL_NOT_QUOTATION_WITNESS",
    wordingOrigin:"EXISTING_FORMATION_P1_NOT_NEW_GENERATION",publication:"REVIEW_ONLY"
  });
 };
 // The static claim list is a read-only editorial audit, not an alternate storage
 // of the claims or a request to publish new material.
 return Object.freeze({
  version:LIVING_CHURCH_FORMATION_EVIDENCE_VERSION,
  answer,
  audit:()=>Object.freeze({stageCount:formation.stages.length,claimCount:claims.size,
   sourceCount:sources.size,referencedClaims:Object.freeze(topicRules.map(x=>x.id)),
   evidenceIds:Object.freeze([...claims.keys()]),newlyApprovedStudyCount:0,
   newlyApprovedPassageCount:0,hasGenerationBackend:false})
 });
}
