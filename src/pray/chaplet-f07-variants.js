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

// The seven source-owned sheddings are the only *primary* progress markers.
// The full 47 prayers remain in PRECIOUS_BLOOD_MYSTERIES_V1 / the canonical
// player; decorative forty-seven dots make the reading area unusable.
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
