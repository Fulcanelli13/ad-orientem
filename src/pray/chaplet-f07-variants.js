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

// Claude F07 w1 cross is a *view* of the five source-owned groups, not
// a second 30-step controller. Direct wound navigation stays in the existing
// presentation runtime and its five-wound event handler.
export function renderF07FiveWounds(position,{french=false}={}){
 if(FIVE_WOUNDS_CHAPLET_V1.length!==30||FIVE_WOUNDS_WOUNDS_V1.length!==5)
  throw new TypeError("Canonical Five Wounds structure changed");
 assertCursor(position,29);
 const selected=FIVE_WOUNDS_CHAPLET_V1[position];
 const labels=FIVE_WOUNDS_WOUNDS_V1;
 for(let i=0;i<5;i++){
  const entries=FIVE_WOUNDS_CHAPLET_V1.filter(x=>x.group===i);
  if(entries.length!==6||entries.slice(0,5).some(x=>x.kind!=="gloria")||entries[5].kind!=="ave")
   throw new TypeError("Five Wounds source grouping has changed");
 }
 // Coordinates: left/right feet, left/right hands, sacred side.
 const points=[[38,73],[50,73],[10,23],[76,23],[52,42]];
 const spots=labels.map((w,i)=>{
  const [cx,cy]=points[i];
  const status=i===selected.group?"current":i<selected.group?"passed":"upcoming";
  return '<circle class="aoF07WoundPoint" data-f07-wound-status="'+status+
   '" cx="'+cx+'" cy="'+cy+'" r="'+(i===selected.group?4.6:3.7)+'"><title>'+
    esc(french?w.fr:w.en)+'</title></circle>';
 }).join("");
 const shortNames=french?["PIED GAUCHE","PIED DROIT","MAIN GAUCHE","MAIN DROITE","CÔTÉ SACRÉ"]:
  ["LEFT FOOT","RIGHT FOOT","LEFT HAND","RIGHT HAND","SACRED SIDE"];
 const prayer=selected.kind==="ave"?translate("Je vous salue Marie","Hail Mary",french):
  translate("Gloire au Père","Glory Be",french);
 const beadNote=selected.kind==="ave"?translate("Une prière à Notre-Dame des Douleurs","One for Our Lady of Sorrows",french):
  (selected.bead+1)+" "+translate("sur","of",french)+" 5";
 const aria=translate("Les cinq plaies","Five Wounds",french)+": "+(french?labels[selected.group].fr:labels[selected.group].en);
 return '<section class="aoF07FiveWoundsBand" data-f07-variant="five-wounds" data-f07-position="'+position+
  '" data-f07-total="30" data-f07-phase="'+(selected.group+1)+'" aria-label="'+esc(aria)+'">'+
  '<svg class="aoF07WoundsCross" viewBox="0 0 86 84" role="img" aria-label="'+esc(aria)+'">'+
   '<path class="aoF07WoundsCrossLine" d="M43 4 V81 M6 23 H80"/>'+spots.join("")+'</svg>'+
  '<div class="aoF07FiveWoundsMeta"><small>'+esc(shortNames[selected.group])+'</small>'+
   '<strong>'+esc(prayer)+'</strong><span>'+esc(beadNote)+'</span></div>'+
  '</section>';
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

export function renderF07LittleCrown(position,{french=false}={}){
 if(LITTLE_CROWN_B30_BEADS.length!==15||
 LITTLE_CROWN_B30_BEADS.slice(0,3).some(x=>x.group!=="holy-family"||x.prayerId!=="foundations_our_father")||
 LITTLE_CROWN_B30_BEADS.slice(3).some(x=>x.group!=="childhood"||x.prayerId!=="foundations_hail_mary"))
  throw new TypeError("Little Crown historical 3 + 12 source pattern changed");
 assertCursor(position,14);
 const holy=LITTLE_CROWN_B30_BEADS.slice(0,3);
 const child=LITTLE_CROWN_B30_BEADS.slice(3);
 const groups=[
  group(translate("Jésus, Marie, Joseph","Jesus, Mary, Joseph",french),
   holy.map(x=>dot((french?["Jésus","Marie","Joseph"]:["Jesus","Mary","Joseph"])[x.index],x.index===position,x.index<position,"pater")),"holy-family"),
  group(translate("Douze années de la Sainte Enfance","Twelve years of the Holy Childhood",french),
   child.map(x=>dot((french?"Année ":"Year ")+(x.index-2),x.index===position,x.index<position,"ave")),"childhood")
 ];
 const current=LITTLE_CROWN_B30_BEADS[position];
 const title=position<3?(french?["Jésus","Marie","Joseph"]:["Jesus","Mary","Joseph"])[position]:
 (french?"Année de l’Enfance ":"Year of the Holy Childhood ")+(position-2);
 const subtitle=position<3?translate("Notre Père","Our Father",french):
  translate("Je vous salue Marie","Hail Mary",french);
 return shell("little-crown",position,15,title,subtitle+" · "+(position+1)+" / 15 · "+translate("Aspiration de l’Incarnation avant chaque grain","Incarnation aspiration before every bead",french),groups,{french,phase:current.group});
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
/* F07 w1: five wounds are five liturgical meditation points, not 30
   dashboard dots. Native source-owned controls remain responsible for jumps. */
#aoPray435930 .aoFiveWounds[data-ao-f07-variant="five-wounds"]{position:relative}
#aoPray435930 .aoF07FiveWoundsTop{display:flex;align-items:flex-start;gap:5px;min-width:0;margin:5px 0 2px}
#aoPray435930 .aoF07FiveWoundsBand{display:grid;grid-template-columns:84px minmax(0,1fr);align-items:center;flex:1;min-width:0;gap:12px;background:transparent;border:0;margin:0;padding:0;box-sizing:border-box}
#aoPray435930 .aoF07WoundsCross{display:block;width:84px;height:84px;overflow:visible;flex:none}
#aoPray435930 .aoF07WoundsCrossLine{fill:none;stroke:var(--muted,#d9cfbc);stroke-width:1.35;opacity:.8}
#aoPray435930 .aoF07WoundPoint{fill:var(--surface-1,#261f1a);stroke:var(--text,#eee3d5);stroke-width:1.6}
#aoPray435930 .aoF07WoundPoint[data-f07-wound-status="passed"]{fill:var(--text,#e9ddd0);opacity:.8}
#aoPray435930 .aoF07WoundPoint[data-f07-wound-status="current"]{fill:#b95b54;stroke:#df938b;stroke-width:1.5}
#aoPray435930 .aoF07FiveWoundsMeta{min-width:0;display:flex;flex-direction:column;gap:4px;font-family:var(--ao-font-liturgical,Georgia,serif)}
#aoPray435930 .aoF07FiveWoundsMeta small{font:600 9px/1.2 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.13em;color:var(--liturgical,#b95b54)}
#aoPray435930 .aoF07FiveWoundsMeta strong{font-size:23px;font-weight:400;line-height:1.15;color:var(--text,#f3e6d7)}
#aoPray435930 .aoF07FiveWoundsMeta span{font:400 12px/1.3 var(--ao-font-ui,system-ui,sans-serif);color:var(--muted,#b8aea0)}
#aoPray435930 .aoF07WoundChips{display:flex;gap:5px;overflow-x:auto;scrollbar-width:none;white-space:nowrap;padding:2px 0 8px;margin:1px 0 3px;min-width:0}
#aoPray435930 .aoF07WoundChips::-webkit-scrollbar{display:none}
#aoPray435930 .aoF07WoundChips button{display:inline-flex;align-items:center;flex:0 0 auto;justify-content:center;min-height:32px;height:32px;padding:0 10px;border-radius:999px;border:1px solid var(--border,rgba(210,190,150,.28));background:transparent;color:var(--muted,#b8aea0);font:500 11px/1.15 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:0;text-transform:none}
#aoPray435930 .aoF07WoundChips button[aria-current="step"]{border-color:var(--text,#f2e4d7);color:var(--text,#f2e4d7);background:rgba(210,190,150,.13)}
#aoPray435930 .aoF07WoundChips button:focus-visible{outline:2px solid var(--liturgical,#c6ad83);outline-offset:2px}
#aoPray435930 .aoF07ReaderLanguage{position:relative;flex:0 0 auto;z-index:3}
#aoPray435930 .aoF07ReaderLanguage>summary{list-style:none;cursor:pointer;display:flex;align-items:center;justify-content:center;min-width:38px;height:38px;border:1px solid var(--border,rgba(210,190,150,.28));border-radius:50%;font:500 12px var(--ao-font-ui,system-ui,sans-serif);color:var(--muted,#b8aea0)}
#aoPray435930 .aoF07ReaderLanguage>summary::-webkit-details-marker{display:none}
#aoPray435930 .aoF07ReaderLanguage>button{display:block;position:absolute;right:0;top:43px;min-height:44px;min-width:132px;z-index:4;border-radius:10px;border:1px solid var(--border,rgba(210,190,150,.28));background:var(--surface-2,#292520);color:var(--text,#eee);padding:8px 12px;font:500 13px var(--ao-font-ui,system-ui,sans-serif)}
#aoPray435930 .aoFiveWounds[data-ao-f07-variant="five-wounds"] .aoFiveWoundsPrayerTop button[data-p435930-five-latin]{display:none}
#aoPray435930 .aoFiveWounds[data-ao-f07-variant="five-wounds"] .aoFiveWoundsPrayer{margin:5px 0 0}
#aoPray435930 .aoFiveWounds[data-ao-f07-variant="five-wounds"] .aoFiveWoundsActions{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:auto;padding:8px 3px;background:transparent;border:0}
#aoPray435930 .aoFiveWounds[data-ao-f07-variant="five-wounds"] .aoFiveWoundsActions>button{min-height:44px;letter-spacing:0;font-family:var(--ao-font-ui,system-ui,sans-serif);text-transform:none;border-radius:999px}
#aoPray435930 .aoFiveWounds[data-ao-f07-variant="five-wounds"] .aoF07WoundPrevious{width:44px;min-width:44px;padding:0;border:1px solid var(--border,rgba(210,190,150,.28));background:transparent;color:var(--text,#eee);font-size:23px}
#aoPray435930 .aoFiveWounds[data-ao-f07-variant="five-wounds"] .aoF07WoundNext{width:auto;min-width:98px;padding:0 22px;background:var(--text,#eee2d4);color:#201b17;border:0;font-size:13px}
#aoPray435930 .aoF07WoundDockCount{font:500 11px/1.2 var(--ao-font-ui,system-ui,sans-serif);color:var(--muted,#b9b2a7);letter-spacing:.02em;flex:1;text-align:center}
#aoPray435930 .aoFiveWounds[data-ao-f07-variant="five-wounds"] .aoFiveWoundsSource{margin-top:0}
@media(max-width:390px){
 #aoPray435930 .aoF07FiveWoundsTop{gap:3px}
 #aoPray435930 .aoF07FiveWoundsBand{grid-template-columns:78px minmax(0,1fr);gap:7px}
 #aoPray435930 .aoF07WoundsCross{width:78px;height:78px}
 #aoPray435930 .aoF07FiveWoundsMeta strong{font-size:20px}
 #aoPray435930 .aoF07ReaderLanguage>summary{min-width:34px;height:34px}
 #aoPray435930 .aoF07WoundChips{padding-bottom:6px}
}
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
