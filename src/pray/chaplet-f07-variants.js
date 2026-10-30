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
   '<path class="aoF07WoundsCrossLine" d="M43 4 V81 M6 23 H80"/>'+spots+'</svg>'+
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
 if(!selected&&bead!==0)throw new RangeError("Opening and conclusion have no repeated prayer position");
 let completed=0;
 for(let i=0;i<7;i++){
  const m=PRECIOUS_BLOOD_MYSTERIES_V1[i];
  if(m.pater!==(i===6?3:5)||m.gloria!==1)throw new TypeError("Raccolta prayer group changed");
  if(i+1<phase)completed+=m.pater+2;
 }
 if(selected)completed+=bead;
 if(phase===8)completed=47;
 const title=phase===0?translate("Ouverture","Opening",french):
  phase===8?translate("Conclusion","Conclusion",french):
  (french?selected.fr:selected.en);
 const note=selected?(bead<selected.pater?
   translate("Notre Père","Our Father",french)+" "+(bead+1)+"/"+selected.pater:
   bead===selected.pater?translate("Gloire au Père","Glory Be",french):
   translate("Répons · Te ergo","Response · Te ergo",french)):
   phase===0?translate("Prières initiales","Opening prayers",french):
   translate("Prière finale","Final prayer",french);
 const segments=PRECIOUS_BLOOD_MYSTERIES_V1.map((m,i)=>{
  const status=phase>i+1?"passed":phase===i+1?"current":"upcoming";
  return '<span class="aoF07BloodSegment" data-f07-blood-status="'+status+
    '" title="'+esc(french?m.fr:m.en)+'" aria-hidden="true"></span>';
 }).join("");
 return '<section class="aoF07BloodGuide" data-f07-variant="precious-blood" data-f07-phase="'+phase+
  '" data-f07-bead="'+bead+'" data-f07-completed="'+completed+'" data-f07-total="47" aria-label="'+
  esc(translate("Sept effusions","Seven sheddings",french)+": "+title)+'">'+
  '<div class="aoF07BloodProgress" role="progressbar" aria-valuemin="0" aria-valuemax="47" aria-valuenow="'+completed+
   '" aria-label="'+esc(translate("Progrès du chapelet","Chaplet prayer progress",french))+'">'+segments+'</div>'+
  '<div class="aoF07BloodContext"><small>'+esc(phase===0?translate("AVANT LES SEPT EFFUSIONS","BEFORE SEVEN SHEDDINGS",french):
  phase===8?translate("APRÈS LES SEPT EFFUSIONS","AFTER SEVEN SHEDDINGS",french):
  translate("EFFUSION","SHEDDING",french)+" "+phase+" / 7")+'</small><strong>'+esc(title)+'</strong><span>'+esc(note)+'</span></div>'+
  '</section>';
}

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
#aoPray435930 .aoF07ReaderLanguage>.aoF07LanguageOptions{position:absolute;right:0;top:43px;width:148px;z-index:4;display:flex;flex-direction:column;gap:2px;border-radius:10px;border:1px solid var(--border,rgba(210,190,150,.28));background:var(--surface-2,#292520);padding:4px;box-shadow:0 8px 22px rgba(0,0,0,.28)}
#aoPray435930 .aoF07LanguageOptions>button{display:block;width:100%;min-height:44px;border:0;border-radius:7px;background:transparent;color:var(--text,#eee);padding:8px 12px;text-align:left;font:500 13px var(--ao-font-ui,system-ui,sans-serif)}
#aoPray435930 .aoF07LanguageOptions>button[aria-pressed="true"]{background:rgba(205,185,145,.18);color:var(--text,#fff)}
#aoPray435930:has(.aoFiveWounds[data-ao-f07-variant="five-wounds"]) .aoP435930Head{grid-template-columns:44px minmax(0,1fr) 44px!important}
#aoPray435930:has(.aoFiveWounds[data-ao-f07-variant="five-wounds"]) .aoP435930Head>.aoP435930SessionLanguage{display:none}
#aoPray435930:has(.aoFiveWounds[data-ao-f07-variant="five-wounds"]) .aoP435930Head>.aoP435930Home{grid-column:3;grid-row:1}
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
/* F07 Precious Blood: a prayer-first seven-shedding reader, not a 47-dot
   dashboard. Full 33+7+7 source events stay behind the same player. */
#aoPray435930 .aoPreciousBlood[data-ao-f07-variant="precious-blood"]{display:flex;flex-direction:column}
#aoPray435930 .aoPreciousBlood[data-ao-f07-variant="precious-blood"]>.aoPreciousBloodTop{display:none}
#aoPray435930 .aoF07BloodOpeningTop{display:flex;align-items:flex-start;gap:8px;margin:3px 0 4px}
#aoPray435930 .aoF07BloodGuide{flex:1;min-width:0;display:flex;flex-direction:column;gap:6px;padding:0;margin:0;background:transparent;border:0}
#aoPray435930 .aoF07BloodProgress{display:flex;gap:4px;height:4px;min-width:0;width:100%}
#aoPray435930 .aoF07BloodSegment{flex:1 1 0;border-radius:5px;background:var(--border,rgba(203,181,143,.24));opacity:.72}
#aoPray435930 .aoF07BloodSegment[data-f07-blood-status="passed"]{background:var(--liturgical,#cbb28b);opacity:.75}
#aoPray435930 .aoF07BloodSegment[data-f07-blood-status="current"]{background:#b85a52;opacity:1}
#aoPray435930 .aoF07BloodContext{display:flex;flex-direction:column;gap:3px;min-width:0}
#aoPray435930 .aoF07BloodContext small{font:600 9px/1.25 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.12em;color:var(--liturgical,#cbb28b)}
#aoPray435930 .aoF07BloodContext strong{font:400 19px/1.2 var(--ao-font-liturgical,Georgia,serif);color:var(--text,#efe5d7);overflow-wrap:anywhere}
#aoPray435930 .aoF07BloodContext span{font:400 11px/1.25 var(--ao-font-ui,system-ui,sans-serif);color:var(--muted,#b8aea0)}
#aoPray435930 .aoF07BloodLanguage{position:relative;flex:0 0 auto}
#aoPray435930 .aoF07BloodLanguage>summary{display:flex;align-items:center;justify-content:center;list-style:none;cursor:pointer;width:38px;height:38px;border:1px solid var(--border,rgba(203,181,143,.25));border-radius:50%;font:500 12px/1 var(--ao-font-ui,system-ui,sans-serif);color:var(--muted,#b8aea0)}
#aoPray435930 .aoF07BloodLanguage>summary::-webkit-details-marker{display:none}
#aoPray435930 .aoF07BloodLanguageOptions{position:absolute;right:0;top:43px;z-index:6;width:150px;display:flex;flex-direction:column;gap:2px;border-radius:10px;background:var(--surface-2,#29241e);border:1px solid var(--border,rgba(203,181,143,.3));padding:4px;box-shadow:0 8px 22px rgba(0,0,0,.28)}
#aoPray435930 .aoF07BloodLanguageOptions button{min-height:44px;text-align:left;width:100%;border:0;border-radius:7px;padding:8px 12px;background:transparent;color:var(--text,#eee);font:500 13px/1.2 var(--ao-font-ui,system-ui,sans-serif)}
#aoPray435930 .aoF07BloodLanguageOptions button[aria-pressed="true"]{background:rgba(205,185,145,.18)}
#aoPray435930 .aoPreciousBlood[data-ao-f07-variant="precious-blood"]>header,
#aoPray435930 .aoPreciousBlood[data-ao-f07-variant="precious-blood"]>div:not(.aoF07BloodOpeningTop)>.aoPreciousBloodTop{display:none}
#aoPray435930 .aoPreciousBlood[data-ao-f07-variant="precious-blood"] .aoPreciousBloodCard{margin-top:3px}
#aoPray435930 .aoPreciousBlood[data-ao-f07-variant="precious-blood"] .aoPreciousBloodCard p{font-size:clamp(19px,5vw,22px);line-height:1.5}
#aoPray435930 .aoPreciousBlood[data-ao-f07-variant="precious-blood"] .aoPreciousBloodCard .aoPreciousBloodPrayerHead{margin-bottom:6px}
#aoPray435930 .aoPreciousBlood[data-ao-f07-variant="precious-blood"] .aoPreciousBloodMeditation{order:5;margin:3px 0;padding:0;border:0}
#aoPray435930 .aoPreciousBlood[data-ao-f07-variant="precious-blood"] .aoPreciousBloodMeditation>summary{font:400 11px/1.4 var(--ao-font-ui,system-ui,sans-serif);color:var(--muted,#b8aea0)}
#aoPray435930 .aoF07BloodJump{order:10;position:relative;margin:3px 0 7px}
#aoPray435930 .aoF07BloodJump>summary{display:flex;justify-content:center;align-items:center;gap:6px;min-height:44px;font:500 12px/1.3 var(--ao-font-ui,system-ui,sans-serif);color:var(--muted,#b8aea0);cursor:pointer;list-style:none}
#aoPray435930 .aoF07BloodJump>summary::-webkit-details-marker{display:none}
#aoPray435930 .aoF07BloodJump>nav{display:grid;grid-template-columns:1fr;gap:3px;background:var(--surface-2,#29251e);border:1px solid var(--border,rgba(203,181,143,.26));border-radius:11px;padding:5px;margin-bottom:6px}
#aoPray435930 .aoF07BloodJump>nav button{display:flex;gap:10px;align-items:center;justify-content:flex-start;width:100%;min-height:44px;border:0;background:transparent;color:var(--text,#efe5d7);font:400 12px/1.3 var(--ao-font-ui,system-ui,sans-serif);text-align:left;border-radius:6px;padding:6px 10px}
#aoPray435930 .aoF07BloodJump>nav button[aria-current="step"]{background:rgba(203,181,143,.15)}
#aoPray435930 .aoF07BloodJump>nav button span{font:500 10px/1.2 var(--ao-font-ui,system-ui,sans-serif);color:var(--liturgical,#cbb28b)}
#aoPray435930 .aoF07BloodJump>nav button strong{min-width:0;white-space:normal;font:400 13px/1.35 var(--ao-font-ui,system-ui,sans-serif);color:var(--text,#eee8de)}
#aoPray435930 .aoF07BloodJump>nav button[aria-current="step"] strong{font-weight:600}
#aoPray435930 .aoPreciousBlood[data-ao-f07-variant="precious-blood"] .aoPreciousBloodActions{order:11;display:flex;align-items:center;justify-content:space-between;gap:8px}
#aoPray435930 .aoPreciousBlood[data-ao-f07-variant="precious-blood"] .aoPreciousBloodActions>button{min-height:48px;border-radius:999px;font:500 13px/1 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:0}
#aoPray435930 .aoF07BloodPrevious{min-width:48px;width:48px;padding:0;border:1px solid var(--border,rgba(203,181,143,.35));background:transparent;color:var(--text,#fff);font-size:23px!important}
#aoPray435930 .aoF07BloodNext{min-width:98px;padding:0 18px;background:var(--text,#e8dccb);color:#211a16;border:0}
#aoPray435930 .aoF07BloodDockCount{flex:1;text-align:center;color:var(--muted,#b8aea0);font:500 11px/1.2 var(--ao-font-ui,system-ui,sans-serif)}
#aoPray435930 .aoPreciousBlood[data-ao-f07-variant="precious-blood"] .aoPreciousBloodProvenance{order:12;margin:0 0 6px}
@media(max-width:390px){
 #aoPray435930 .aoF07BloodContext strong{font-size:17px}
 #aoPray435930 .aoF07BloodOpeningTop{gap:5px}
 #aoPray435930 .aoF07BloodLanguage>summary{width:34px;height:34px}
 #aoPray435930 .aoPreciousBlood[data-ao-f07-variant="precious-blood"] .aoPreciousBloodCard p{font-size:19px}
}
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
/* The original 320x568 browser capture put the first prayer at y=595 and
   the sticky Prayer heading intercepted bead 14. Keep the full 282px
   fifteen-bead circle and 48px hit targets; reclaim *chrome* instead. */
/* A sticky title can still cover the upper-right bead after native
   scrollIntoView on iOS/Chromium. Crown reading has direct 48px tap points,
   so its title must scroll with the document rather than mask those points. */
#aoPray435930:has(.aoLittleCrown[data-ao-f07-variant="little-crown"]) .aoP435930Head{
 position:relative!important;top:auto!important
}
#aoPray435930:has(.aoLittleCrown[data-ao-f07-variant="little-crown"]) .aoP435930Mount{
 scroll-padding-top:78px
}
#aoPray435930 .aoLittleCrown[data-ao-f07-variant="little-crown"] .aoF07LittleCrownBead{
 scroll-margin-top:82px;
}
@media(max-width:359px) and (max-height:620px){
 #aoPray435930:has(.aoLittleCrown[data-ao-f07-variant="little-crown"]) .aoP435930Head{
  padding:4px 9px 5px;align-items:center;grid-template-columns:38px minmax(0,1fr) 38px;gap:6px
 }
 #aoPray435930:has(.aoLittleCrown[data-ao-f07-variant="little-crown"]) .aoP435930Head button{
  width:36px;height:36px
 }
 #aoPray435930:has(.aoLittleCrown[data-ao-f07-variant="little-crown"]) .aoP435930Head div{
  padding:0;min-width:0
 }
 #aoPray435930:has(.aoLittleCrown[data-ao-f07-variant="little-crown"]) .aoP435930Head small,
 #aoPray435930:has(.aoLittleCrown[data-ao-f07-variant="little-crown"]) .aoP435930Head p{
  display:none
 }
 #aoPray435930:has(.aoLittleCrown[data-ao-f07-variant="little-crown"]) .aoP435930Head h1{
  font-size:15px;line-height:1.05;margin:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis
 }
 #aoPray435930 .aoLittleCrown[data-ao-f07-variant="little-crown"]{
  padding:0 10px 12px;gap:0
 }
 #aoPray435930 .aoLittleCrown[data-ao-f07-variant="little-crown"] .aoF07LittleCrownTools{
  min-height:30px;margin:0
 }
 #aoPray435930 .aoLittleCrown[data-ao-f07-variant="little-crown"] .aoF07LittleCrownBand{
  gap:0;margin:0
 }
 #aoPray435930 .aoLittleCrown[data-ao-f07-variant="little-crown"] .aoF07LittleCrownPrompt{
  display:none
 }
 #aoPray435930 .aoLittleCrown[data-ao-f07-variant="little-crown"] .aoLittleCrownPrayer{
  padding:5px 9px;margin:0
 }
 #aoPray435930 .aoLittleCrown[data-ao-f07-variant="little-crown"] .aoLittleCrownPrayerTop{
  position:relative;min-height:20px;padding-right:46px
 }
 #aoPray435930 .aoLittleCrown[data-ao-f07-variant="little-crown"] .aoF07LittleCrownLanguage{
  position:absolute;right:0;top:-3px
 }
 #aoPray435930 .aoLittleCrown[data-ao-f07-variant="little-crown"] .aoLittleCrownAspiration{
  font-size:15px;line-height:1.25;margin:2px auto 3px
 }
 #aoPray435930 .aoLittleCrown[data-ao-f07-variant="little-crown"] .aoLittleCrownPrayerText{
  font-size:19px;line-height:1.45
 }
}
/* Keep the Aa menu at the prayer-card heading, not in a second band
   above the circle; its 44px choices remain touch accessible. */
#aoPray435930 .aoLittleCrown[data-ao-f07-variant="little-crown"] .aoLittleCrownPrayerTop{position:relative}
#aoPray435930 .aoLittleCrown[data-ao-f07-variant="little-crown"] .aoF07LittleCrownLanguage{z-index:8}
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
/* F07 editorial pass V1 — preserve the existing host/nav and source engines,
   but give the four Claude-inspired chaplets one quiet reading hierarchy. */
#aoPray435930:has(.aoFiveWounds[data-ao-f07-variant="five-wounds"],.aoPreciousBlood[data-ao-f07-variant="precious-blood"],.aoLittleCrown[data-ao-f07-variant="little-crown"]) .aoP435930Head{
 padding:7px 10px 8px!important;gap:7px;align-items:center;
}
#aoPray435930:has(.aoFiveWounds[data-ao-f07-variant="five-wounds"],.aoPreciousBlood[data-ao-f07-variant="precious-blood"],.aoLittleCrown[data-ao-f07-variant="little-crown"]) .aoP435930Head>div{padding-top:0}
#aoPray435930:has(.aoFiveWounds[data-ao-f07-variant="five-wounds"],.aoPreciousBlood[data-ao-f07-variant="precious-blood"],.aoLittleCrown[data-ao-f07-variant="little-crown"]) .aoP435930Head h1{
 font-size:clamp(17px,4.75vw,22px);line-height:1.08;margin:2px 0 0;letter-spacing:-.012em
}
#aoPray435930:has(.aoFiveWounds[data-ao-f07-variant="five-wounds"],.aoPreciousBlood[data-ao-f07-variant="precious-blood"],.aoLittleCrown[data-ao-f07-variant="little-crown"]) .aoP435930Head small{
 font-size:9px;line-height:1;letter-spacing:.13em
}
#aoPray435930:has(.aoFiveWounds[data-ao-f07-variant="five-wounds"],.aoPreciousBlood[data-ao-f07-variant="precious-blood"],.aoLittleCrown[data-ao-f07-variant="little-crown"]) .aoP435930Head p{
 font-size:10px;line-height:1.15;margin:2px 0 0
}
#aoPray435930:has(.aoFiveWounds[data-ao-f07-variant="five-wounds"],.aoPreciousBlood[data-ao-f07-variant="precious-blood"],.aoLittleCrown[data-ao-f07-variant="little-crown"]) .aoP435930Head button{
 width:38px;height:38px
}
/* The source/meditation details remain accessible; the actual action dock
   comes last in visual order and stays in reach while a long prayer scrolls. */
#aoPray435930 .aoFiveWounds[data-ao-f07-variant="five-wounds"]{
 display:flex;flex-direction:column;min-height:calc(94dvh - 86px)
}
#aoPray435930 .aoFiveWounds[data-ao-f07-variant="five-wounds"] .aoFiveWoundsSource{
 order:8;margin:9px 0 5px
}
#aoPray435930 .aoFiveWounds[data-ao-f07-variant="five-wounds"] .aoFiveWoundsActions{
 order:10;position:sticky;bottom:0;z-index:18;margin-top:auto;
 padding:8px 3px max(8px,env(safe-area-inset-bottom));
 background:var(--surface-1,#0c1418)
}
#aoPray435930 .aoPreciousBlood[data-ao-f07-variant="precious-blood"]{
 display:flex;flex-direction:column;min-height:calc(94dvh - 86px)
}
#aoPray435930 .aoPreciousBlood[data-ao-f07-variant="precious-blood"] .aoPreciousBloodProvenance{
 order:10;margin:5px 0 4px
}
#aoPray435930 .aoPreciousBlood[data-ao-f07-variant="precious-blood"] .aoPreciousBloodActions{
 order:12;position:sticky;bottom:0;z-index:18;margin-top:auto;
 padding:8px 2px max(8px,env(safe-area-inset-bottom));
 background:var(--surface-1,#0c1418)
}
#aoPray435930 .aoLittleCrown[data-ao-f07-variant="little-crown"]{
 min-height:calc(94dvh - 86px)
}
#aoPray435930 .aoLittleCrown[data-ao-f07-variant="little-crown"] .aoF07LittleCrownPrompt{
 display:none
}
#aoPray435930 .aoLittleCrown[data-ao-f07-variant="little-crown"] .aoLittleCrownSource{
 order:10;margin:7px 0 4px
}
#aoPray435930 .aoLittleCrown[data-ao-f07-variant="little-crown"] .aoLittleCrownActions{
 order:12;position:sticky;bottom:0;z-index:18;margin-top:auto;
 padding:8px 3px max(8px,env(safe-area-inset-bottom));
 background:var(--surface-1,#0c1418);border-top:1px solid var(--border,rgba(210,190,150,.23))
}
@media(max-width:359px){
 #aoPray435930 .aoFiveWounds[data-ao-f07-variant="five-wounds"],
 #aoPray435930 .aoPreciousBlood[data-ao-f07-variant="precious-blood"],
 #aoPray435930 .aoLittleCrown[data-ao-f07-variant="little-crown"]{
  min-height:calc(94dvh - 72px)
 }
 #aoPray435930 .aoLittleCrown[data-ao-f07-variant="little-crown"] .aoLittleCrownPrayer{
  margin-top:0
 }
}
/* A 320px short phone has only ~421px before the persistent app controls.
   A pinned Little Crown dock would cover the *first* Our Father line; on
   mobile the canonical 15-bead ring remains direct-tappable and actions
   follow the complete source prayer in the scroll, as in the safe donor. */
@media(max-width:420px){
 #aoPray435930 .aoLittleCrown[data-ao-f07-variant="little-crown"]{
  min-height:0
 }
 #aoPray435930 .aoLittleCrown[data-ao-f07-variant="little-crown"] .aoLittleCrownActions{
  position:relative;bottom:auto;z-index:1;margin-top:8px;
  background:transparent;border-top:0
 }
}
/* F07 c1: at 390px the full Our Father ended immediately above the
   app tab bar, pushing Next below the fold. Keep all 15 direct 48px
   targets nonoverlapping (282px diameter / 116px bead radius); save room
   by using the prototype's 20px / 1.5 scripture-reading rhythm. */
#aoPray435930 .aoLittleCrown[data-ao-f07-variant="little-crown"] .aoF07LittleCrownCircle{
 width:min(100%,282px)
}
#aoPray435930 .aoLittleCrown[data-ao-f07-variant="little-crown"]{
 gap:4px
}
#aoPray435930 .aoLittleCrown[data-ao-f07-variant="little-crown"] .aoLittleCrownPrayerText{
 line-height:1.5
}
#aoPray435930 .aoLittleCrown[data-ao-f07-variant="little-crown"] .aoLittleCrownActions{
 order:10
}
#aoPray435930 .aoLittleCrown[data-ao-f07-variant="little-crown"] .aoLittleCrownSource{
 order:12
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

/* Prayer-book presentation contract: the source text, never its controls,
   is the dominant surface. No panel chrome or oversized rounded pills.
   Applies only to the opt-in F07 visual variants, not baseline readers. */
#aoPray435930 .aoFiveWounds[data-ao-f07-variant="five-wounds"] .aoFiveWoundsPrayer,
#aoPray435930 .aoPreciousBlood[data-ao-f07-variant="precious-blood"] .aoPreciousBloodCard,
#aoPray435930 .aoLittleCrown[data-ao-f07-variant="little-crown"] .aoLittleCrownPrayer,
#aoPray435930 .aoF07VariantBand{
 border:0!important;border-radius:0!important;
 background:transparent!important;box-shadow:none!important;
}
#aoPray435930 .aoFiveWounds[data-ao-f07-variant="five-wounds"] .aoFiveWoundsPrayer,
#aoPray435930 .aoPreciousBlood[data-ao-f07-variant="precious-blood"] .aoPreciousBloodCard,
#aoPray435930 .aoLittleCrown[data-ao-f07-variant="little-crown"] .aoLittleCrownPrayer{
 padding:9px 4px 12px!important;
}
#aoPray435930 .aoF07VariantBand{
 padding:5px 0!important;margin:4px 0 7px!important;
}
#aoPray435930 .aoFiveWounds[data-ao-f07-variant="five-wounds"] .aoFiveWoundsActions,
#aoPray435930 .aoPreciousBlood[data-ao-f07-variant="precious-blood"] .aoPreciousBloodActions,
#aoPray435930 .aoLittleCrown[data-ao-f07-variant="little-crown"] .aoLittleCrownActions{
 border:0!important;box-shadow:none!important;background:var(--surface-1,#101719);
}
#aoPray435930 .aoFiveWounds[data-ao-f07-variant="five-wounds"] .aoFiveWoundsActions>button,
#aoPray435930 .aoPreciousBlood[data-ao-f07-variant="precious-blood"] .aoPreciousBloodActions>button,
#aoPray435930 .aoLittleCrown[data-ao-f07-variant="little-crown"] .aoLittleCrownActions>button{
 min-height:44px;border:0!important;border-radius:0!important;
 background:transparent!important;box-shadow:none!important;
 color:var(--text,#eee2d4)!important;font-weight:400;
}
#aoPray435930 .aoFiveWounds[data-ao-f07-variant="five-wounds"] .aoFiveWoundsActions>button:not(:disabled):last-child,
#aoPray435930 .aoPreciousBlood[data-ao-f07-variant="precious-blood"] .aoPreciousBloodActions>button:not(:disabled):last-child,
#aoPray435930 .aoLittleCrown[data-ao-f07-variant="little-crown"] .aoLittleCrownActions>button:not(:disabled):last-child{
 color:var(--liturgical,#d4bb93)!important;font-weight:550;
}
#aoPray435930 .aoF07WoundChips button,
#aoPray435930 .aoF07ReaderLanguage>summary,
#aoPray435930 .aoF07BloodLanguage>summary,
#aoPray435930 .aoF07BloodJump>summary,
#aoPray435930 .aoF07LittleCrownLanguage>summary{
 border:0!important;border-radius:0!important;
 background:transparent!important;box-shadow:none!important;
}
#aoPray435930 .aoF07WoundChips button[aria-current="step"]{
 border:0!important;border-bottom:1px solid var(--liturgical,#cbb28b)!important;
 background:transparent!important;
}
#aoPray435930 .aoF07BloodJump>nav,
#aoPray435930 .aoF07LanguageOptions,
#aoPray435930 .aoF07BloodLanguageOptions,
#aoPray435930 .aoF07LittleCrownLanguageOptions{
 border:0!important;border-radius:3px!important;
 box-shadow:none!important;
}
#aoPray435930 .aoFiveWounds[data-ao-f07-variant="five-wounds"] .aoFiveWoundsSource,
#aoPray435930 .aoPreciousBlood[data-ao-f07-variant="precious-blood"] .aoPreciousBloodProvenance,
#aoPray435930 .aoLittleCrown[data-ao-f07-variant="little-crown"] .aoLittleCrownSource{
 order:99!important;border:0!important;border-top:0!important;
 margin:14px 0 4px!important;padding:0!important;
 font:400 11px/1.45 var(--ao-font-ui,system-ui,sans-serif);
}
#aoPray435930 .aoFiveWounds[data-ao-f07-variant="five-wounds"] .aoFiveWoundsSource>summary,
#aoPray435930 .aoPreciousBlood[data-ao-f07-variant="precious-blood"] .aoPreciousBloodProvenance>summary,
#aoPray435930 .aoLittleCrown[data-ao-f07-variant="little-crown"] .aoLittleCrownSource>summary{
 min-height:34px!important;font-size:11px!important;
 font-weight:400!important;color:var(--muted,#aaa394)!important;
 opacity:.65;letter-spacing:0!important;text-transform:none!important;
}
#aoPray435930 .aoFiveWounds[data-ao-f07-variant="five-wounds"] .aoFiveWoundsSource a,
#aoPray435930 .aoPreciousBlood[data-ao-f07-variant="precious-blood"] .aoPreciousBloodProvenance a,
#aoPray435930 .aoLittleCrown[data-ao-f07-variant="little-crown"] .aoLittleCrownSource a{
 font-size:11px!important;color:var(--muted,#aaa394)!important;
 text-decoration:underline;text-underline-offset:3px;
}
`;
export function installF07VariantStyles(doc=globalThis.document){
 if(!doc||doc.getElementById("ao-f07-variant-style"))return;
 const tag=doc.createElement("style");tag.id="ao-f07-variant-style";tag.textContent=STYLES;doc.head.append(tag);
}
installF07VariantStyles();
