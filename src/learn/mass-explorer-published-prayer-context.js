/**
 * Mass Explorer's IN-APP prayer-level teaching projection.
 * Original Latin remains owned by reader-text-sung; every explanatory
 * paragraph below is an EXACT previously published Formation P1 claim.
 *
 * Deliberately sparse: not every source block has a certified prayer-specific
 * explanation. Editorial-only P2 84-prayer drafts are NEVER loaded here.
 */
export const MASS_EXPLORER_PUBLISHED_PRAYER_CONTEXT_VERSION="ao-mass-explorer-p1-prayer-context-v1";

const claimEdges=Object.freeze([
 ["AO.SM.B031","MF03-C03","BROADER_OFFERTORY"],
 ["AO.SM.B039","MF03-C01","IN_PRAYER"],
 ["AO.SM.B047","MF04-C02","IN_PRAYER"],
 ["AO.SM.B048","MF04-C03","IN_PRAYER"],
 ["AO.SM.B049","MF04-C02","IN_PRAYER"],
 ["AO.SM.B051","MF05-C01","WHAT_FOLLOWS"],
 ["AO.SM.B052","MF05-C01","IN_PRAYER"],
 ["AO.SM.B052","MF05-C02","IN_PRAYER"],
 ["AO.SM.B053","MF05-C01","IN_PRAYER"],
 ["AO.SM.B053","MF05-C02","IN_PRAYER"],
 ["AO.SM.B054","MF06-C01","IN_PRAYER"],
 ["AO.SM.B055","MF06-C02","IN_PRAYER"],
 ["AO.SM.B056","MF06-C03","BROADER_CANON"],
 ["AO.SM.B057","MF04-C03","IN_PRAYER"],
 ["AO.SM.B058","MF04-C02","IN_PRAYER"],
 ["AO.SM.B074","MF07-C01","IN_PRAYER"],
 ["AO.SM.B076","MF07-C01","IN_PRAYER"],
 ["AO.SM.B081","MF07-C02","COMMUNION_CONTEXT"],
 ["AO.SM.B082","MF07-C02","COMMUNION_CONTEXT"],
 ["AO.SM.B086","MF08-C01","THANKSGIVING_CONTEXT"],
 ["AO.SM.B087","MF08-C01","THANKSGIVING_CONTEXT"]
]);
const validKinds=new Set(["IN_PRAYER","WHAT_FOLLOWS","BROADER_OFFERTORY",
 "BROADER_CANON","COMMUNION_CONTEXT","THANKSGIVING_CONTEXT"]);
const escape=s=>String(s??"").replace(/[&<>"']/g,c=>({
 "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
}[c]));
const notices=Object.freeze({
 IN_PRAYER:{en:"Published teaching directly relevant to this prayer",fr:"Enseignement publié lié à cette prière"},
 WHAT_FOLLOWS:{en:"Published teaching on the Consecration that follows",fr:"Enseignement publié sur la Consécration qui suit"},
 BROADER_OFFERTORY:{en:"Published teaching on the Offertory as a whole",fr:"Enseignement publié sur l’ensemble de l’Offertoire"},
 BROADER_CANON:{en:"Published teaching on the wider Canon",fr:"Enseignement publié sur l’ensemble du Canon"},
 COMMUNION_CONTEXT:{en:"Published teaching on Communion",fr:"Enseignement publié sur la Communion"},
 THANKSGIVING_CONTEXT:{en:"Published teaching on thanksgiving after Communion",fr:"Enseignement publié sur l’action de grâces après la Communion"}
});

/**
 * Validate all editorial relationships against the already released P1
 * Formation stages and precise certified source block IDs. Any drift fails
 * the whole projection closed instead of quietly assigning wrong theology.
 */
export function projectPublishedMassPrayerContexts(catalog,formation){
 const none=new Map();
 if(formation?.schema!=="ao-mass-formation-campion-v1"||
    formation?.status!=="SOURCE_BACKED_FORMATION"||
    catalog?.byBlock?.size!==96||catalog?.sequence?.length!==32)return none;
 const stages=new Map(formation.stages.map(stage=>[stage.id,stage]));
 const out=new Map(),seen=new Set();
 for(const [blockId,claimId,kind] of claimEdges){
  const owner=catalog.byBlock.get(blockId);
  const stageId=claimId.slice(0,4);
  const stage=stages.get(stageId);
  const claim=stage?.claims?.find(c=>c.id===claimId);
  const key=blockId+"|"+claimId;
  if(!owner||owner.source?.Block_ID!==blockId||
     owner.source?.Branch_Status!=="NORMATIVE_1962"||
     owner.source?.Proper_Slot||!owner.source?.units?.length||
     !validKinds.has(kind)||seen.has(key)||
     !claim?.text?.en||!claim.text.fr||
     !Array.isArray(claim.sources)||!claim.sources.length||
     claim.sources.some(id=>!formation.sources.some(src=>src.id===id)))
    return new Map();
  seen.add(key);
  const rows=out.get(blockId)||[];
  rows.push(Object.freeze({id:claimId,kind,stageId,stageTitle:stage.title,
    text:claim.text,claimSourceIds:Object.freeze([...claim.sources])}));
  out.set(blockId,rows);
 }
 for(const [key,rows] of out)out.set(key,Object.freeze(rows));
 return out;
}
export function publishedMassPrayerContextHtml(context,{french=false}={}){
 if(!Array.isArray(context)||context.length===0)return "";
 const lg=french?"fr":"en";
 const groups=[];
 for(const item of context){
  const group=groups.find(g=>g.kind===item.kind);
  if(group)group.rows.push(item);
  else groups.push({kind:item.kind,rows:[item]});
 }
 return '<section class="aoMXPrayerMeaning" id="ao-mx-prayer-meaning" data-ao-mx-anchor="meaning">'+
 '<h2>'+escape(french?"Comprendre ce passage":"Understand this passage")+'</h2>'+
 groups.map(group=>
  '<div class="aoMXMeaningGroup"><small>'+escape(notices[group.kind][lg])+'</small>'+
  group.rows.map(row=>
   '<p data-ao-mx-published-claim="'+escape(row.id)+'">'+escape(row.text[lg])+'</p>'
  ).join("")+'</div>'
 ).join("")+
 '<p class="aoMXQuiet">'+escape(french?
  "Ces explications reprennent les affirmations déjà publiées dans les leçons de Formation. Les recherches historiques supplémentaires restent en examen.":
  "These explanations reuse already published Formation teaching. Additional historical research remains under editorial review.")+'</p>'+
 '</section>';
}
