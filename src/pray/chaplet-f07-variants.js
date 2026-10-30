/**
 * F07 — a read-only, source-bound presentation of THREE different chaplets.
 * Data, prayers, historical qualifications, navigation and completion remain
 * owned by the original Five Wounds / Precious Blood / Little Crown readers.
 */
import {FIVE_WOUNDS_CHAPLET_V1,FIVE_WOUNDS_WOUNDS_V1} from "./five-wounds-chaplet.v1.js";
import {PRECIOUS_BLOOD_MYSTERIES_V1,PRECIOUS_BLOOD_TOTALS_V1} from "./precious-blood-chaplet.v1.js";
import {LITTLE_CROWN_B30_BEADS} from "./little-crown-b30.js";

export const F07_VARIANT_SCHEMA="ao-f07-variants-source-projection-v1";
const esc=value=>String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const translate=(fr,en,french)=>french?fr:en;
const assertCursor=(cursor,maximum)=>{
 if(!Number.isInteger(cursor)||cursor<0||cursor>maximum)throw new RangeError("Invalid source chaplet position");
};
const dot=(label,current,passed,kind="bead")=>
 '<span class="aoF07VariantDot aoF07VariantDot-'+kind+'" data-f07-status="'+
 (current?"current":passed?"passed":"upcoming")+'" title="'+esc(label)+'" aria-hidden="true"></span>';
const group=(name,beads,key)=>
 '<div class="aoF07VariantGroup" data-f07-group="'+esc(key)+'" aria-label="'+esc(name)+'">'+
 '<div class="aoF07VariantDots">'+beads.join("")+'</div></div>';
const shell=(type,position,total,heading,subheading,groups,{french=false,phase=""}={})=>
 '<section class="aoF07VariantBand" data-f07-variant="'+esc(type)+'" data-f07-position="'+esc(position)+
 '" data-f07-total="'+esc(total)+'" data-f07-phase="'+esc(phase)+
 '" aria-label="'+esc(translate("Position dans le chapelet","Chaplet position",french)+": "+heading)+'">'+
 '<div class="aoF07VariantCopy"><small>'+esc(translate("REPÈRE DU CHAPELET","CHAPLET POSITION",french))+'</small>'+
 '<strong>'+esc(heading)+'</strong><span>'+esc(subheading)+'</span></div>'+
 '<div class="aoF07VariantSegments" aria-hidden="true">'+groups.join("")+'</div></section>';

export function renderF07FiveWounds(position,{french=false}={}){
 if(FIVE_WOUNDS_CHAPLET_V1.length!==30||FIVE_WOUNDS_WOUNDS_V1.length!==5)
  throw new TypeError("Canonical Five Wounds structure changed");
 assertCursor(position,29);
 const selected=FIVE_WOUNDS_CHAPLET_V1[position];
 const labels=FIVE_WOUNDS_WOUNDS_V1;
 const grouped=labels.map((w,i)=>{
  const entries=FIVE_WOUNDS_CHAPLET_V1.filter(x=>x.group===i);
  if(entries.length!==6||entries.filter(x=>x.kind==="gloria").length!==5||entries[5].kind!=="ave")
   throw new TypeError("Five Wounds source grouping has changed");
  return group(french?w.fr:w.en,entries.map((x,j)=>
   dot((french?"Plaie ":"Wound ")+(i+1)+" · "+(x.kind==="ave"?(french?"Ave Maria":"Hail Mary"):
    (french?"Gloria ":"Glory Be ")+(j+1)),x===selected,i*6+j<position,x.kind)),w.id);
 });
 const title=french?labels[selected.group].fr:labels[selected.group].en;
 const prayer=selected.kind==="ave"?translate("Je vous salue Marie","Hail Mary",french):
  translate("Gloire au Père","Glory Be",french)+" "+(selected.bead+1)+" / 5";
 return shell("five-wounds",position,30,title,translate("Méditez cette plaie","Meditate on this wound",french)+" · "+prayer+" · "+(position+1)+" / 30",grouped,{french,phase:String(selected.group+1)});
}

export function renderF07PreciousBlood(phase,bead,{french=false}={}){
 if(PRECIOUS_BLOOD_MYSTERIES_V1.length!==7||
 PRECIOUS_BLOOD_TOTALS_V1.pater!==33||PRECIOUS_BLOOD_TOTALS_V1.gloria!==7||
 PRECIOUS_BLOOD_TOTALS_V1.versicles!==7)
  throw new TypeError("Precious Blood Raccolta source pattern changed");
 assertCursor(phase,8);
 if(!Number.isInteger(bead)||bead<0)throw new RangeError("Invalid source prayer position");
 const selected=phase>0&&phase<8?PRECIOUS_BLOOD_MYSTERIES_V1[phase-1]:null;
 if(selected&&bead>selected.pater+1)throw new RangeError("Invalid source mystery position");
 const groups=PRECIOUS_BLOOD_MYSTERIES_V1.map((m,i)=>{
  if((i===6?m.pater!==3:m.pater!==5)||m.gloria!==1)
   throw new TypeError("Precious Blood source repeat pattern changed");
  const sequence=[...Array.from({length:m.pater},(_,n)=>({kind:"pater",n})),
   {kind:"gloria",n:m.pater},{kind:"response",n:m.pater+1}];
  return group(french?m.fr:m.en,sequence.map((s,j)=>{
   const active=phase===i+1&&bead===j;
   const passed=phase>i+1||(phase===i+1&&bead>j);
   const title=s.kind==="pater"?(french?"Notre Père":"Our Father")+" "+(j+1):
    s.kind==="gloria"?(french?"Gloire au Père":"Glory Be"):
    (french?"Répons Te ergo":"Te ergo response");
   return dot(title,active,passed,s.kind);
  }),m.id);
 });
 const title=phase===0?translate("Prières initiales","Opening prayers",french):
  phase===8?translate("Conclusion","Conclusion",french):
  (french?selected.fr:selected.en);
 const note=!selected?translate("Hors des sept mystères","Outside the seven mysteries",french):
  bead<selected.pater?(french?"Notre Père ":"Our Father ")+(bead+1)+" / "+selected.pater:
  bead===selected.pater?translate("Gloire au Père","Glory Be",french):
   translate("Répons historique · Te ergo","Historical response · Te ergo",french);
 // 33 Pater + 7 Gloria + 7 Te ergo = 47 displayed mystery positions.
 return shell("precious-blood",phase===0?"opening":phase===8?"closing":phase+":"+bead,
 47,title,note,groups,{french,phase:String(phase)});
}

/**
 * Claude F07 c1 projection: 15 beads on one circular rail, not a second
 * progress controller. The source-owning Little Crown reader supplies the
 * interactive HTML; standalone calls use decorative source-position marks.
 */
export function renderF07LittleCrown(position,{french=false,interactiveBeads=""}={}){
 if(LITTLE_CROWN_B30_BEADS.length!==15||
 LITTLE_CROWN_B30_BEADS.slice(0,3).some(x=>x.group!=="holy-family"||x.prayerId!=="foundations_our_father")||
 LITTLE_CROWN_B30_BEADS.slice(3).some(x=>x.group!=="childhood"||x.prayerId!=="foundations_hail_mary"))
  throw new TypeError("Little Crown historical 3 + 12 source pattern changed");
 assertCursor(position,14);
 const step=LITTLE_CROWN_B30_BEADS[position];
 const subject=position<3?
  (french?["Jésus","Marie","Joseph"]:["Jesus","Mary","Joseph"])[position]:
  translate("Enfance de Jésus","Holy Childhood",french);
 const title=step.prayerId==="foundations_our_father"?
  translate("Notre Père","Our Father",french):translate("Je vous salue Marie","Hail Mary",french);
 const markers=LITTLE_CROWN_B30_BEADS.map((x,i)=>{
  const a=(i*2*Math.PI/15)-Math.PI/2;
  const left=(50+41.25*Math.cos(a)).toFixed(3);
  const top=(50+41.25*Math.sin(a)).toFixed(3);
  const status=i===position?"current":i<position?"passed":"upcoming";
  return '<span class="aoF07CrownMarker aoF07CrownMarker-'+(x.group==="holy-family"?"pater":"ave")+
   '" data-f07-status="'+status+'" data-f07-bead="'+i+
   '" style="--crown-x:'+left+'%;--crown-y:'+top+'%" title="'+
   esc(i<3?(french?["Jésus","Marie","Joseph"]:["Jesus","Mary","Joseph"])[i]:
   translate("Année","Year",french)+" "+(i-2))+'" aria-hidden="true"></span>';
 }).join("");
 const circle=interactiveBeads||markers;
 return '<section class="aoF07LittleCrownBand" data-f07-variant="little-crown" data-f07-position="'+position+
  '" data-f07-total="15" data-f07-phase="'+step.group+'" aria-label="'+
  esc(translate("Petite Couronne","Little Crown",french)+" · "+(position+1)+"/15")+'">'+
  '<div class="aoF07LittleCrownCircle" aria-label="'+
   esc(translate("Quinze grains","Fifteen beads",french))+'">'+
   circle+
   '<div class="aoF07LittleCrownCentre" role="progressbar" aria-valuemin="0" aria-valuemax="15" aria-valuenow="'+(position+1)+
    '" aria-label="'+esc(translate("Position dans la couronne","Crown progress",french))+'">'+
    '<small>'+esc(translate("PETITE COURONNE","LITTLE CROWN",french))+'</small>'+
    '<strong>'+(position+1)+'<span> / 15</span></strong><span>'+esc(subject)+'</span></div>'+
  '</div>'+
  '<div class="aoF07LittleCrownPrompt"><strong>'+esc(title)+'</strong>'+
   '<small>'+esc(translate("L’aspiration précède chaque grain","The aspiration precedes each bead",french))+'</small></div>'+
  '</section>';
}

const STYLES=`
#aoPray435930 .aoF07VariantBand{display:grid;grid-template-columns:minmax(105px,0.75fr) minmax(0,1.55fr);gap:12px;align-items:center;min-width:0;margin:4px 0 9px;padding:10px 12px;border:1px solid var(--border,rgba(200,175,130,.2));border-radius:12px;background:var(--surface-1,rgba(190,165,122,.035));box-sizing:border-box}
#aoPray435930 .aoF07VariantCopy{min-width:0;display:flex;flex-direction:column;gap:3px}
#aoPray435930 .aoF07VariantCopy small{font:600 10px/1.25 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.08em;color:var(--liturgical,#c6ad83)}
#aoPray435930 .aoF07VariantCopy strong{font:500 16px/1.15 var(--ao-font-liturgical,Georgia,serif);color:var(--text,#efe5d6);overflow-wrap:anywhere}
#aoPray435930 .aoF07VariantCopy span{font:400 11px/1.4 var(--ao-font-ui,system-ui,sans-serif);color:var(--muted,#b8aea0);overflow-wrap:anywhere}
#aoPray435930 .aoF07VariantSegments{display:flex;align-items:center;justify-content:space-evenly;gap:4px;min-width:0;width:100%}
#aoPray435930 .aoF07VariantGroup{display:flex;flex:1 1 0;min-width:0;align-items:center;justify-content:center}
#aoPray435930 .aoF07VariantDots{display:flex;gap:3px;align-items:center;justify-content:center;flex-wrap:wrap;max-width:100%}
#aoPray435930 .aoF07VariantDot{box-sizing:border-box;display:block;flex:0 0 6px;width:6px;height:6px;border-radius:50%;border:1px solid var(--liturgical,#c6ad83);background:transparent;opacity:.65}
#aoPray435930 .aoF07VariantDot-pater{height:8px;width:8px;flex-basis:8px}
#aoPray435930 .aoF07VariantDot-ave{height:5px;width:5px;flex-basis:5px}
#aoPray435930 .aoF07VariantDot-gloria{height:8px;width:8px;flex-basis:8px;border-width:1.5px}
#aoPray435930 .aoF07VariantDot-response{border-radius:1px;transform:rotate(45deg)}
#aoPray435930 .aoF07VariantDot[data-f07-status="passed"]{background:var(--liturgical,#c6ad83);opacity:.46}
#aoPray435930 .aoF07VariantDot[data-f07-status="current"]{background:var(--liturgical,#c6ad83);border-color:var(--text,#fff2db);opacity:1;box-shadow:0 0 0 2px rgba(195,158,100,.2)}
/* Five Wounds carries both EN/FR and Home controls. Allocate two
   adjacent columns instead of allowing a wrapped, empty second header row. */
#aoPray435930:has(.aoFiveWounds[data-ao-f07-variant="five-wounds"]) .aoP435930Head{grid-template-columns:44px minmax(0,1fr) 44px 44px!important;gap:6px!important}
#aoPray435930:has(.aoFiveWounds[data-ao-f07-variant="five-wounds"]) .aoP435930Head>.aoP435930SessionLanguage{grid-column:3;grid-row:1}
#aoPray435930:has(.aoFiveWounds[data-ao-f07-variant="five-wounds"]) .aoP435930Head>.aoP435930Home{grid-column:4;grid-row:1}
#aoPray435930 .aoFiveWounds[data-ao-f07-variant="five-wounds"]>header{display:none}
#aoPray435930 .aoPreciousBlood[data-ao-f07-variant="precious-blood"]>header{display:none}
#aoPray435930 .aoLittleCrown[data-ao-f07-variant="little-crown"]>.aoLittleCrownIntro{display:none}
#aoPray435930 .aoFiveWounds[data-ao-f07-variant="five-wounds"] .aoFiveWoundsProgress,
#aoPray435930 .aoFiveWounds[data-ao-f07-variant="five-wounds"] .aoFiveWoundsBeads,
#aoPray435930 .aoPreciousBlood[data-ao-f07-variant="precious-blood"] .aoPreciousBloodProgress,
#aoPray435930 .aoPreciousBlood[data-ao-f07-variant="precious-blood"] .aoPreciousBloodBeads,
#aoPray435930 .aoLittleCrown[data-ao-f07-variant="little-crown"] .aoLittleCrownProgress{display:none}
/* F07 c1: an active, source-owned fifteen-bead circle.
   The 48px touch targets in the ring belong to little-crown-presentation-b30. */
#aoPray435930 .aoLittleCrown[data-ao-f07-variant="little-crown"]{display:flex;flex-direction:column;min-width:0}
#aoPray435930 .aoLittleCrown[data-ao-f07-variant="little-crown"]>.aoLittleCrownIntro,
#aoPray435930 .aoLittleCrown[data-ao-f07-variant="little-crown"]>.aoLittleCrownProgress{display:none}
#aoPray435930 .aoF07LittleCrownBand{display:flex;flex-direction:column;align-items:center;gap:4px;min-width:0;width:100%;margin:0 0 4px;padding:0;background:transparent;border:0}
#aoPray435930 .aoF07LittleCrownCircle{position:relative;isolation:isolate;width:min(100%,302px);aspect-ratio:1;margin:auto;flex:0 0 auto}
#aoPray435930 .aoF07LittleCrownCircle::before{content:"";position:absolute;inset:8.75%;border-radius:50%;border:1px solid var(--border,rgba(212,184,135,.24));pointer-events:none}
#aoPray435930 .aoF07LittleCrownBead,
#aoPray435930 .aoF07CrownMarker{position:absolute;left:var(--crown-x);top:var(--crown-y);transform:translate(-50%,-50%);box-sizing:border-box;border-radius:50%;width:48px;height:48px;display:flex;align-items:center;justify-content:center}
#aoPray435930 button.aoF07LittleCrownBead{cursor:pointer;z-index:2;border:0;background:transparent;touch-action:manipulation;padding:0}
#aoPray435930 button.aoF07LittleCrownBead::before,
#aoPray435930 .aoF07CrownMarker::before{content:"";box-sizing:border-box;width:12px;height:12px;border-radius:50%;border:1.5px solid var(--liturgical,#cbb28b);background:var(--surface-2,#30271f);transition:background .1s ease}
#aoPray435930 .aoF07LittleCrownBead.family::before,
#aoPray435930 .aoF07CrownMarker-pater::before{width:16px;height:16px;border-width:2px}
#aoPray435930 .aoF07LittleCrownBead.done::before,
#aoPray435930 .aoF07CrownMarker[data-f07-status="passed"]::before{background:var(--liturgical,#cbb28b);opacity:.7}
#aoPray435930 .aoF07LittleCrownBead.active::before,
#aoPray435930 .aoF07CrownMarker[data-f07-status="current"]::before{background:#b6574e;border-color:#eaa19a;box-shadow:0 0 0 5px rgba(182,87,78,.14);opacity:1}
#aoPray435930 .aoF07LittleCrownBead:focus-visible{outline:2px solid var(--liturgical,#cbb28b);outline-offset:0}
#aoPray435930 .aoF07LittleCrownCentre{position:absolute;inset:32%;z-index:1;pointer-events:none;display:flex;flex-direction:column;justify-content:center;align-items:center;gap:2px;text-align:center}
#aoPray435930 .aoF07LittleCrownCentre small{font:600 9px/1.25 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.09em;color:var(--liturgical,#cbb28b);white-space:nowrap}
#aoPray435930 .aoF07LittleCrownCentre strong{font:400 29px/1.1 var(--ao-font-liturgical,Georgia,serif);color:var(--text,#f3e8da);white-space:nowrap}
#aoPray435930 .aoF07LittleCrownCentre strong span{font:400 12px/1.1 var(--ao-font-ui,system-ui,sans-serif);color:var(--muted,#b8aea0)}
#aoPray435930 .aoF07LittleCrownCentre>span{font:400 10px/1.2 var(--ao-font-ui,system-ui,sans-serif);color:var(--muted,#b8aea0)}
#aoPray435930 .aoF07LittleCrownTools{display:flex;align-items:center;justify-content:space-between;gap:8px;min-height:34px;margin:0 0 1px}
#aoPray435930 .aoF07LittleCrownTools>small{font:600 9px/1.25 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.09em;color:var(--liturgical,#cbb28b)}
#aoPray435930 .aoF07LittleCrownPrompt{display:flex;align-items:baseline;gap:7px;min-width:0;text-align:center;flex-wrap:wrap;justify-content:center}
#aoPray435930 .aoF07LittleCrownPrompt strong{font:400 16px/1.2 var(--ao-font-liturgical,Georgia,serif);color:var(--text,#f3e8da)}
#aoPray435930 .aoF07LittleCrownPrompt small{font:400 10px/1.25 var(--ao-font-ui,system-ui,sans-serif);color:var(--muted,#b8aea0)}
#aoPray435930 .aoLittleCrown[data-ao-f07-variant="little-crown"] .aoLittleCrownPrayer{margin-top:2px;padding-top:5px}
#aoPray435930 .aoLittleCrown[data-ao-f07-variant="little-crown"] .aoLittleCrownPrayerTop{min-height:20px}
#aoPray435930 .aoLittleCrown[data-ao-f07-variant="little-crown"] .aoLittleCrownPrayerTop [data-p435930-crown-latin]{display:none}
#aoPray435930 .aoF07LittleCrownLanguage{position:relative;flex:0 0 auto;z-index:6}
#aoPray435930 .aoF07LittleCrownLanguage>summary{display:flex;align-items:center;justify-content:center;list-style:none;cursor:pointer;min-width:36px;height:36px;border-radius:50%;border:1px solid var(--border,rgba(212,184,135,.3));font:500 12px var(--ao-font-ui,system-ui,sans-serif);color:var(--muted,#b8aea0)}
#aoPray435930 .aoF07LittleCrownLanguage>summary::-webkit-details-marker{display:none}
#aoPray435930 .aoF07LittleCrownLanguageOptions{position:absolute;right:0;top:41px;display:flex;flex-direction:column;gap:2px;width:144px;z-index:8;padding:4px;border-radius:10px;background:var(--surface-2,#27211c);border:1px solid var(--border,rgba(212,184,135,.3));box-shadow:0 8px 22px rgba(0,0,0,.3)}
#aoPray435930 .aoF07LittleCrownLanguageOptions>button{min-height:44px;width:100%;text-align:left;border:0;border-radius:7px;color:var(--text,#eee);background:transparent;padding:8px 12px;font:500 13px var(--ao-font-ui,system-ui,sans-serif)}
#aoPray435930 .aoF07LittleCrownLanguageOptions>button[aria-pressed="true"]{background:rgba(212,184,135,.17)}
#aoPray435930 .aoLittleCrown[data-ao-f07-variant="little-crown"] .aoLittleCrownActions{display:flex;gap:8px;align-items:center;justify-content:space-between;margin-top:auto;padding:8px 3px}
#aoPray435930 .aoLittleCrown[data-ao-f07-variant="little-crown"] .aoLittleCrownActions>button{min-height:48px;letter-spacing:0;border-radius:999px;font:500 13px/1 var(--ao-font-ui,system-ui,sans-serif);text-transform:none}
#aoPray435930 .aoF07LittleCrownPrevious{width:48px;min-width:48px;padding:0;border:1px solid var(--border,rgba(212,184,135,.3));background:transparent;color:var(--text,#eee);font-size:23px!important}
#aoPray435930 .aoF07LittleCrownNext{min-width:98px;padding:0 18px;background:var(--text,#e9ddd0);border:0;color:#211b15}
#aoPray435930 .aoF07LittleCrownDockCount{flex:1;text-align:center;font:500 11px/1.25 var(--ao-font-ui,system-ui,sans-serif);color:var(--muted,#b8aea0)}
#aoPray435930:has(.aoLittleCrown[data-ao-f07-variant="little-crown"]) .aoP435930Head>.aoP435930SessionLanguage{display:none}
@media(max-width:359px){#aoPray435930 .aoF07LittleCrownCircle{width:min(100%,282px)}
 #aoPray435930 .aoF07LittleCrownPrompt{gap:3px}
 #aoPray435930 .aoF07LittleCrownPrompt small{font-size:9px}}
#aoPray435930 .aoF07JumpDisclosure{margin:3px 0 7px}
#aoPray435930 .aoF07JumpDisclosure>summary{min-height:44px;display:flex;align-items:center;justify-content:center;font:500 12px/1.4 var(--ao-font-ui,system-ui,sans-serif);color:var(--muted,#bbb3a7);cursor:pointer}
#aoPray435930 .aoF07JumpDisclosure>nav{padding-bottom:8px}
@media(max-width:390px){
 #aoPray435930 .aoF07VariantBand{grid-template-columns:minmax(92px,0.8fr) minmax(0,1.5fr);gap:6px;margin:3px 0 5px;padding:5px 7px;min-height:54px}
 #aoPray435930 .aoF07VariantCopy{gap:2px}
 #aoPray435930 .aoF07VariantCopy small{font-size:9px}
 #aoPray435930 .aoF07VariantCopy strong{font-size:14px;line-height:1.14}
 #aoPray435930 .aoF07VariantCopy span{font-size:10px}
 #aoPray435930 .aoF07VariantSegments{gap:2px}
 #aoPray435930 .aoF07VariantDots{gap:2px}
 #aoPray435930 .aoF07VariantDot{width:5px;height:5px;flex-basis:5px}
 #aoPray435930 .aoF07VariantDot-pater,#aoPray435930 .aoF07VariantDot-gloria{width:7px;height:7px;flex-basis:7px}
 #aoPray435930 .aoLittleCrown[data-ao-f07-variant="little-crown"] .aoLittleCrownIntro{margin-bottom:2px}
 #aoPray435930 .aoLittleCrown[data-ao-f07-variant="little-crown"] .aoLittleCrownPrayer{margin-top:4px}
 #aoPray435930 .aoFiveWounds[data-ao-f07-variant="five-wounds"] .aoFiveWoundsRail{margin:3px 0}
 #aoPray435930 .aoPreciousBlood[data-ao-f07-variant="precious-blood"] .aoPreciousBloodRail{margin-bottom:2px}
}
`;
export function installF07VariantStyles(doc=globalThis.document){
 if(!doc||doc.getElementById("ao-f07-variant-style"))return;
 const tag=doc.createElement("style");tag.id="ao-f07-variant-style";tag.textContent=STYLES;doc.head.append(tag);
}
installF07VariantStyles();
