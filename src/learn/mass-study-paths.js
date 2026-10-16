/*
 * Formation-only discovery projection. Titles/claims remain owned by the
 * already published eight-lesson Formation record. This is navigation, not
 * a new Mass pedagogy corpus and never part of the ritual reader.
 */
export const MASS_STUDY_PATHS_VERSION="ao-mass-study-paths-v1";
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const tr=(fr,en,french)=>fr?french:en;
const localized=(item,fr)=>String(fr?(item?.fr??item?.en??""):(item?.en??item?.fr??""));

export function massStudyStages(formation){
 if(formation?.schema!=="ao-mass-formation-campion-v1"||
    !Array.isArray(formation.stages)||formation.stages.length!==8)
   throw new Error("Expected eight published Mass Formation stages");
 const stages=formation.stages.map((stage,i)=>{
   if(stage.id!=="MF"+String(i+1).padStart(2,"0")||
      stage.order!==i+1||!stage.title?.en||!stage.title?.fr||
      !stage.summary?.en||!stage.summary?.fr)
     throw new Error("Invalid original Mass Formation stage ownership: "+stage.id);
   // A minimal projection retains original source-owned copy by reference.
   return Object.freeze({id:stage.id,order:stage.order,title:stage.title,summary:stage.summary});
 });
 return Object.freeze(stages);
}

/** The two learning approaches are not two copies of source material:
 * chronological map in this module and the existing topical course owner. */
export function massStudyPathsHtml(stages,{french=false}={}){
 if(!Array.isArray(stages)||!stages.length)return "";
 return '<section id="ao-mx-themes" data-ao-mx-anchor="themes" class="aoMXStudyPaths" aria-label="'+tr(french,"Study the Mass by theme","Étudier la Messe par thème")+'">'+
  '<div class="aoMXStudyPathsHead"><small>'+tr(french,"ANOTHER WAY TO EXPLORE","UNE AUTRE FAÇON D’EXPLORER")+'</small>'+
  '<h2>'+tr(french,"Study by theme","Étudier par thème")+'</h2>'+
  '<p>'+tr(french,
    "The Mass Map follows the order of the liturgy. These eight existing lessons explore its meaning, theology and participation. Both use their original source owners.",
    "La carte suit l’ordre de la liturgie. Ces huit leçons existantes approfondissent son sens, sa théologie et la participation des fidèles. Chaque contenu garde sa source d’origine.")+'</p></div>'+
  '<div class="aoMXStudyPathsList">'+stages.map(stage=>
     '<button type="button" class="aoMXStudyPath" data-ao-mx-stage="'+esc(stage.id)+'">'+
     '<span class="aoMXStudyPathN">'+String(stage.order).padStart(2,"0")+'</span>'+
     '<span><strong>'+esc(localized(stage.title,french))+'</strong>'+
     '<small>'+esc(localized(stage.summary,french))+'</small></span>'+
     '<span class="aoMXStudyPathArrow" aria-hidden="true">↗</span></button>'
   ).join("")+'</div></section>';
}

export function massStudyPathsCss(){
 return [
 '.aoMXStudyPaths{margin:33px 0 10px;padding:18px 0 8px;border-top:1px solid var(--ao-rule,#393c40)}',
 '.aoMXStudyPathsHead small{display:block;color:var(--liturgical,#c9ad78);font:600 .65rem/1.4 var(--ao-font-ui,system-ui);letter-spacing:.1em}',
 '.aoMXStudyPathsHead h2{font:500 1.65rem/1.25 var(--ao-font-display,Georgia,serif);margin:9px 0}',
 '.aoMXStudyPathsHead p{max-width:58ch;color:var(--ao-text-muted,#adb2b7);font:400 .9rem/1.6 var(--ao-font-body,Georgia,serif)}',
 '.aoMXStudyPathsList{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin:18px 0}',
 '.aoMXStudyPath{display:grid;grid-template-columns:25px minmax(0,1fr) 14px;gap:8px;align-items:start;min-height:88px;padding:13px 10px;text-align:left;border:1px solid var(--ao-rule,#393c40);border-radius:10px;background:var(--ao-surface-1,#101821);color:inherit;cursor:pointer}',
 '.aoMXStudyPathN,.aoMXStudyPathArrow{font:.7rem/1.5 var(--ao-font-ui,system-ui);color:var(--liturgical,#c9ad78)}',
 '.aoMXStudyPath strong{display:block;font:500 1rem/1.4 var(--ao-font-display,Georgia,serif)}',
 '.aoMXStudyPath small{display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;color:var(--ao-text-muted,#adb2b7);font:400 .77rem/1.48 var(--ao-font-ui,system-ui);margin-top:6px}',
 '@media(max-width:620px){.aoMXStudyPathsList{grid-template-columns:1fr}.aoMXStudyPath{min-height:74px}}'
 ].join("");
}
