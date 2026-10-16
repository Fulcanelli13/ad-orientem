/*
 * Mass Map — a read-only visual index inside Mass Explorer, not a new
 * ritual, text, history, or calendar owner. Every stop and source block is
 * projected from the already published 32-entry Guide and Sung source corpus.
 */
import {massMomentStudyLinks} from "./mass-moments-study.js";

const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const tr=(fr,en,frText)=>fr?frText:en;

export const MASS_MAP_PHASES=Object.freeze([
 Object.freeze({id:"before",range:[0,0],title:["Before Mass","Avant la Messe"]}),
 Object.freeze({id:"word",range:[1,9],title:["Entrance and the Word","Entrée et liturgie de la Parole"]}),
 Object.freeze({id:"canon",range:[10,18],title:["Offertory and Roman Canon","Offertoire et Canon romain"]}),
 Object.freeze({id:"communion",range:[19,25],title:["Communion","Communion"]}),
 Object.freeze({id:"closing",range:[26,31],title:["Conclusion and thanksgiving","Conclusion et action de grâces"]})
]);

export function massMapPhaseIndex(position){
 if(!Number.isInteger(position)||position<0||position>31)return -1;
 return MASS_MAP_PHASES.findIndex(phase=>position>=phase.range[0]&&position<=phase.range[1]);
}
export function projectMassMap(catalog){
 if(!catalog?.byKey||!catalog?.byBlock||!Array.isArray(catalog.sequence)||catalog.sequence.length!==32)
   throw new Error("Mass Map requires the original 32 published Guide moments");
 const phases=MASS_MAP_PHASES.map((phase,phaseIndex)=>{
   const stops=catalog.sequence.map((key,index)=>({key,index,entry:catalog.byKey.get(key)}))
     .filter(x=>massMapPhaseIndex(x.index)===phaseIndex)
     .map(({key,index,entry})=>{
       if(!entry?.guide||!Array.isArray(entry.blocks))throw new Error("Mass Map owner unavailable: "+key);
       const links=massMomentStudyLinks(key);
       return Object.freeze({key,index,title:String(entry.guide.moment),
         short:String(entry.guide.short||""),blocks:entry.blocks,
         conditional:entry.blocks.some(b=>b.Branch_Status&&b.Branch_Status!=="NORMATIVE_1962"),
         variable:entry.blocks.some(b=>Boolean(b.Proper_Slot)),
         scriptureCount:links.scriptureAnchorIds.length,stageId:links.stageId});
     });
   return Object.freeze({...phase,index:phaseIndex,stops:Object.freeze(stops)});
 });
 const flat=phases.flatMap(x=>x.stops);
 if(flat.length!==32||new Set(flat.map(x=>x.key)).size!==32||flat.reduce((n,x)=>n+x.blocks.length,0)!==catalog.byBlock.size)
   throw new Error("Mass Map cannot silently lose or duplicate source material");
 return Object.freeze({phases:Object.freeze(phases),momentCount:flat.length,blockCount:catalog.byBlock.size,
   provenance:"PUBLISHED_SUNG_GUIDE_AND_SOURCE_ONLY",relationshipStatus:catalog.crosswalkStatus});
}

export function massMapHtml(catalog,{french=false,readerContext=false}={}){
 const map=projectMassMap(catalog);
 const phaseButtons=map.phases.map(phase=>
   '<button type="button" data-ao-mx-phase="'+phase.index+'" aria-controls="ao-mx-phase-'+phase.id+'">'+
   '<span class="aoMXMapPhaseNumber">'+String(phase.index+1).padStart(2,"0")+'</span>'+
   '<span>'+esc(phase.title[french?1:0])+'</span></button>').join("");
 const steps=map.phases.map(phase=>
  '<section class="aoMXMapPhase" id="ao-mx-phase-'+phase.id+'" data-ao-mx-phase-section="'+phase.index+'">'+
  '<div class="aoMXMapPhaseHead"><span>'+String(phase.index+1).padStart(2,"0")+'</span>'+
  '<div><h2>'+esc(phase.title[french?1:0])+'</h2>'+
  '<small>'+phase.stops.length+' '+(french?(phase.stops.length===1?"étape":"étapes"):(phase.stops.length===1?"moment":"moments"))+'</small></div></div>'+
  '<ol class="aoMXMapStops">'+phase.stops.map(stop=>
    '<li class="aoMXMapStop" data-ao-mx-stop="'+esc(stop.key)+'">'+
    '<button class="aoMXMapMoment" type="button" data-ao-mx-moment="'+esc(stop.key)+'">'+
    '<span class="aoMXMapNumber" aria-hidden="true">'+(stop.index===0||stop.index===31?"·":String(stop.index).padStart(2,"0"))+'</span>'+
    '<span class="aoMXMapMomentText"><strong>'+esc(stop.title)+'</strong>'+
    '<span class="aoMXMapSummary">'+esc(stop.short)+'</span>'+
    '<span class="aoMXMapMeta">'+
      (stop.blocks.length?'<span>'+stop.blocks.length+' '+tr(french,"source texts","textes sources")+'</span>':"")+
      (stop.scriptureCount?'<span>'+tr(french,"Scripture links","Liens bibliques")+'</span>':"")+
      (stop.stageId?'<span>'+tr(french,"Formation","Formation")+'</span>':"")+
      (stop.variable?'<span>'+tr(french,"Variable Proper","Propre variable")+'</span>':"")+
      (stop.conditional?'<span>'+tr(french,"Conditional rite","Rite conditionnel")+'</span>':"")+
    '</span></span><span class="aoMXMapArrow" aria-hidden="true">→</span></button>'+
    (stop.blocks.length?'<details class="aoMXMapBlockDrawer"><summary>'+
      tr(french,"Browse individual prayers and actions","Voir les prières et actions")+
      '</summary><div class="aoMXMapBlockList">'+stop.blocks.map(block=>
      '<button type="button" data-ao-mx-map-block="'+esc(block.Block_ID)+'">'+esc(block.Title)+'</button>').join("")+'</div></details>':"")+
    '</li>').join("")+'</ol></section>'
 ).join("");
 return '<main class="aoMXWrap aoMXMap" data-ao-mx-map="sung">'+
   '<div class="aoMXHero"><small>'+tr(french,"THE 1962 SUNG MASS · STUDY MAP","MESSE CHANTÉE DE 1962 · CARTE D’ÉTUDE")+'</small>'+
   '<h1>'+tr(french,"Mass Map","Carte de la Messe")+'</h1>'+
   '<p>'+tr(french,
     "Select a moment to explore its prayers, actions, Guide commentary and Scripture.",
     "Choisissez une étape pour consulter ses prières, les actions, le Guide et les Écritures.")+
   '</p></div>'+
   '<div class="aoMXMapToolbar"><div><strong>'+map.momentCount+'</strong> '+tr(french,"Guide moments","étapes du Guide")+
    ' <span aria-hidden="true">·</span> <strong>'+map.blockCount+'</strong> '+tr(french,"source blocks","textes sources")+'</div>'+
    '<button type="button" data-ao-mx-view="list">'+tr(french,"Text index","Index textuel")+'</button></div>'+
   '<nav class="aoMXMapPhases" aria-label="'+tr(french,"Jump to a Mass part","Accéder à une partie de la Messe")+'">'+phaseButtons+'</nav>'+
   '<div class="aoMXMapJourney">'+steps+'</div>'+
   (readerContext?'<section class="aoMXMapRitualLink"><button type="button" data-ao-mx-return-mass>'+tr(french,"Return to Mass","Retourner à la Messe")+' →</button></section>':
   '<section class="aoMXMapRitualLink"><h2>'+tr(french,"Follow an actual Mass","Suivre une Messe réelle")+'</h2>'+
     '<p>'+tr(french,
       "The separate Mass reader selects the actual celebration and Proper. Opening it does not jump to a numbered study stop.",
       "Le lecteur de Messe distinct choisit la célébration et son Propre. Il ne passe pas automatiquement à une étape de cette carte.")+
     '</p><button type="button" data-ao-mx-open-mass>'+tr(french,"Open Mass preparation","Ouvrir la préparation de la Messe")+' ↗</button>'+
   '</section>')+'</main>';
}

export function massMapCss(){
 return [
 ".aoMXMap .aoMXHero{padding:2px 0 12px}.aoMXMap .aoMXHero h1{font-size:clamp(1.8rem,5vw,2.65rem);margin:6px 0 8px}.aoMXMap .aoMXHero p{font-size:.94rem;line-height:1.5;margin:8px 0 0;max-width:55ch}",
 ".aoMXMapToolbar{display:flex;align-items:center;justify-content:space-between;gap:12px;border-block:1px solid var(--ao-rule,#393c40);padding:12px 0;font:400 .8rem/1.4 var(--ao-font-ui,system-ui)}.aoMXMapToolbar strong{color:var(--liturgical,#c9ad78)}.aoMXMapToolbar button,.aoMXMapRitualLink button{min-height:44px;padding:8px 12px;background:transparent;border:1px solid var(--liturgical,#c9ad78);color:var(--liturgical,#c9ad78);border-radius:9px;cursor:pointer}",
 ".aoMXMapPhases{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:6px;margin:12px 0 25px}.aoMXMapPhases button{display:flex;flex-direction:column;gap:7px;text-align:left;padding:10px;min-height:80px;cursor:pointer;color:inherit;background:var(--ao-surface-1,#101821);border:1px solid var(--ao-rule,#393c40);border-radius:10px;font:500 .72rem/1.4 var(--ao-font-ui,system-ui)}.aoMXMapPhaseNumber{font:600 .71rem/1.3 var(--ao-font-ui,system-ui);color:var(--liturgical,#c9ad78)}.aoMXMapPhases button[aria-current=step]{border-color:var(--liturgical,#c9ad78)}",
 ".aoMXMapJourney{position:relative;margin:0}.aoMXMapPhase{position:relative;scroll-margin-top:112px;margin:0 0 38px;padding:0 0 0 22px;border-left:1px solid var(--ao-rule,#393c40)}.aoMXMapPhase:before{content:'';position:absolute;left:-5px;top:22px;width:9px;height:9px;border-radius:50%;background:var(--liturgical,#c9ad78)}.aoMXMapPhaseHead{display:flex;gap:17px;align-items:start;padding:8px 0 18px}.aoMXMapPhaseHead>span{color:var(--liturgical,#c9ad78);font:600 .72rem/1.5 system-ui}.aoMXMapPhaseHead h2{margin:0;font:500 1.5rem/1.25 var(--ao-font-display,Georgia,serif)}.aoMXMapPhaseHead small{color:var(--ao-text-muted,#adb2b7);font:.75rem/1.6 system-ui}",
 ".aoMXMapStops{margin:0;padding:0;list-style:none;display:grid;gap:8px}.aoMXMapStop{min-width:0;background:var(--ao-surface-1,#101821);border:1px solid var(--ao-rule,#393c40);border-radius:11px;overflow:hidden}.aoMXMapMoment{display:grid;grid-template-columns:36px minmax(0,1fr) 20px;gap:10px;width:100%;min-height:74px;align-items:start;padding:13px;text-align:left;background:transparent;color:inherit;border:0;cursor:pointer}.aoMXMapNumber{padding-top:2px;color:var(--liturgical,#c9ad78);font:600 .77rem/1.5 system-ui}.aoMXMapMomentText{display:grid;gap:6px;min-width:0}.aoMXMapMomentText strong{font:500 1.11rem/1.35 var(--ao-font-display,Georgia,serif)}.aoMXMapSummary{font:400 .87rem/1.45 var(--ao-font-body,Georgia,serif);color:var(--ao-text-muted,#adb2b7);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.aoMXMapMeta{display:flex;flex-wrap:wrap;gap:5px 12px;font:500 .68rem/1.3 var(--ao-font-ui,system-ui);color:var(--liturgical,#c9ad78)}.aoMXMapArrow{justify-self:end;color:var(--liturgical,#c9ad78)}",
 ".aoMXMapBlockDrawer{border-top:1px solid var(--ao-rule,#393c40)}.aoMXMapBlockDrawer>summary{padding:9px 13px;min-height:44px;cursor:pointer;font:500 .78rem/1.5 var(--ao-font-ui,system-ui);color:var(--ao-text-muted,#adb2b7)}.aoMXMapBlockList{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px;padding:8px 12px 14px}.aoMXMapBlockList button{min-width:0;min-height:44px;padding:9px 10px;text-align:left;background:var(--ao-bg-canvas,#080c12);border:1px solid var(--ao-rule,#393c40);border-radius:8px;color:inherit;font:.8rem/1.4 var(--ao-font-ui,system-ui)}",
 ".aoMXMapRitualLink{padding:22px 0;margin-top:22px;border-top:1px solid var(--ao-rule,#393c40)}.aoMXMapRitualLink h2{font:500 1.25rem/1.3 var(--ao-font-display,Georgia,serif)}.aoMXMapRitualLink p{max-width:640px;color:var(--ao-text-muted,#adb2b7);line-height:1.55}",
 "@media(max-width:620px){.aoMXMapPhases{grid-template-columns:repeat(2,minmax(0,1fr))}.aoMXMapPhases button{min-height:64px}.aoMXMapBlockList{grid-template-columns:1fr}.aoMXMapPhase{padding-left:13px}.aoMXMapPhaseHead{gap:11px}.aoMXMapMoment{grid-template-columns:27px minmax(0,1fr) 16px;gap:7px;padding:11px}.aoMXMapToolbar{align-items:start}.aoMXMapToolbar div{max-width:170px}}",
 "@media(min-width:768px){.aoMXMapJourney{max-width:800px}.aoMXMapPhaseHead{padding-bottom:14px}.aoMXMapStops{grid-template-columns:repeat(2,minmax(0,1fr))}}",
 "#ao-mass-explorer-root .aoMXMap :is(button,summary):focus-visible{outline:2px solid var(--liturgical,#c9ad78);outline-offset:-2px}"
 ].join("");
}
