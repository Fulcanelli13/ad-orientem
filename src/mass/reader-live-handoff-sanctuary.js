// Source-gated Stage C sanctuary reference illustration.
// The owner-approved plan and geometry are illustrated, but priest positions
// are always imported from CURRENT native cue state. A prayer-card swipe is
// not evidence that the real celebrant moved or that anyone sang or rang.
import {LIVE_HANDOFF_SOURCE_POINTS, LIVE_HANDOFF_ALTAR_PLAN,
  projectLiveHandoffPlanPosition} from "./reader-live-handoff-geometry.js";
import {resolveMassLiturgicalTheme} from "./reader-liturgical-theme.js";
import {isExplicitRequiemMass} from "./reader-requiem-conditions.js";
import {R17_FINAL_APPROVED_MASS_ASSETS} from "./reader-final-approved-assets.js";

const freeze=Object.freeze;
const STATIONS=freeze({
  FOOT_CENTER:"FOOT",
  ALTAR_CENTER:"CENTER",
  ALTAR_EPISTLE_MISSAL:"EPISTLE",
  ALTAR_EPISTLE_SIDE:"EPISTLE",
  ALTAR_GOSPEL_MISSAL:"GOSPEL",
  SEDILIA:"SEDILIA",
  COMMUNION_RAIL:"RAIL",
});
const COLOURS=freeze({
  WHITE:"#f1ece3",RED:"#a95450",GREEN:"#4a7654",VIOLET:"#705184",
  ROSE:"#bc819d",BLACK:"#242429",GOLD:"#ccaa60",NEUTRAL:"#666c75"
});
const POSTURES=new Set(["STAND","SIT","KNEEL"]);
const STATION_NOT_OBSERVED=new Set(["PRIEST_TRACK_ASYNC",
  "ROUTE_CONTROLLED","IN_TRANSIT","UNCONFIRMED"]);
const safeColor=v=>Object.values(COLOURS).includes(v)?v:COLOURS.NEUTRAL;
const point=id=>projectLiveHandoffPlanPosition(LIVE_HANDOFF_SOURCE_POINTS[id]);
const number=x=>Number(x).toFixed(1);
const line=(x1,y1,x2,y2,cls,extra="")=>'<line x1="'+number(x1)+'" y1="'+number(y1)+'" x2="'+number(x2)+'" y2="'+number(y2)+'" class="'+cls+'" '+extra+'/>';
const rect=(x,y,w,h,cls,extra="")=>'<rect x="'+number(x)+'" y="'+number(y)+'" width="'+number(w)+'" height="'+number(h)+'" class="'+cls+'" '+extra+'/>';
const circle=(x,y,r,cls)=>'<circle cx="'+number(x)+'" cy="'+number(y)+'" r="'+r+'" class="'+cls+'"/>';
const labelFree=html=>!/<text\b|<foreignObject\b|>YOU<|>STAND<|>PRIEST</i.test(html);

/** Source positions are reference states, not live observations.
 * Fail closed on asynchronous/route-controlled stages and any cue not
 * belonging to the current native card's source evidence.
 */
export function projectLiveHandoffSanctuary({gate,nativeState,prepared}={}){
  if(gate?.ok!==true||!gate.reference)
    return freeze({status:"NATIVE_CROSSWALK_REQUIRED",priest:null,faithful:null,
      server:null,form:null,colour:"NEUTRAL",requiem:false});
  const form=String(prepared?.session?.resolvedMass?.form??"").toUpperCase();
  const theme=resolveMassLiturgicalTheme(prepared);
  const requiem=isExplicitRequiemMass(prepared);
  const colour=theme.key;
  const cue=String(nativeState?.nativeCueId??"");
  const expected=gate.reference.evidence?.sourceCueIds??[];
  const cueMatches=/^AO\.SM\.C\d{4}$/.test(cue)&&expected.includes(cue)&&
    nativeState?.cueProjectionSupported!==false;
  const posture=String(nativeState?.posture?.value??nativeState?.posture?.label??"").toUpperCase();
  const faithful=cueMatches&&POSTURES.has(posture)
    ?freeze({posture,source:"CURRENT_NATIVE_POSTURE_PROFILE"}):null;
  const location=nativeState?.priestPosition??null;
  const stationId=String(location?.station??"");
  const isSupported=cueMatches && Object.hasOwn(STATIONS,stationId) &&
    !STATION_NOT_OBSERVED.has(stationId) &&
    !["UNCONFIRMED","IN_TRANSIT"].includes(String(location?.locationConfidence??""));
  const facing=String(location?.facing??"");
  const validFacing=["LITURGICAL_EAST","PEOPLE","PEOPLE_DURING_TURN",
    "MISSAL","COMMUNICANT","CROSS","OBLATIONS","MINISTER"].includes(facing);
  const priest=isSupported&&validFacing
    ?freeze({station:STATIONS[stationId],nativeStation:stationId,
      facing,pose:stationId==="SEDILIA"?"seated":"stand",
      independentlyObserved:false,
      owner:String(location.owner??"NATIVE_CUE_SOURCE"),
      positionReferenceCueId:cue,
      source:"REFERENCE_POSITION_NOT_OBSERVED_REAL_TIME"})
    :null;
  // Only illustrate a static server (without a claimed gesture or route)
  // in Low / Sung reference forms. Actual serverAt awaits O'Connell QA.
  const simpleServer=["LOW","MISSA_CANTATA_SIMPLE",
    "MISSA_CANTATA_INCENSE"].includes(form);
  const server=priest&&simpleServer
    ?freeze({station:"FOOT",pose:"stand",scope:"REFERENCE_PRESENCE_ONLY",
      bell:false,paten:false,route:null}):null;
  return freeze({
    status:!cueMatches?"CURRENT_CUE_NOT_SOURCE_MATCHED":
      priest?"SOURCE_STATION_REFERENCE":"PRIEST_POSITION_NOT_CONFIRMED",
    priest,faithful,server,form,colour,requiem,
    candles:form==="LOW"?2:form==="MISSA_CANTATA_SIMPLE"||
      form==="MISSA_CANTATA_INCENSE"||form==="SOLEMN"?6:null,
    ministers:"SOLEMN_REVIEW_HOLD",
    movement:"NO_AUTOMATIC_REAL_WORLD_MOVEMENT",
    choir:"NO_INFERRED_AUDIBLE_PERFORMANCE",
  });
}
export const LIVE_SANCTUARY_STATION_MAP=STATIONS;

/** Faithful artwork is the *existing approved family*, not package drafts. */
export function approvedFaithfulArt(posture){
  const choices={
    STAND:R17_FINAL_APPROVED_MASS_ASSETS.final_review_posture_stand,
    SIT:R17_FINAL_APPROVED_MASS_ASSETS.final_sit,
    KNEEL:R17_FINAL_APPROVED_MASS_ASSETS.final_review_posture_kneel
  };
  return Object.hasOwn(choices,String(posture))?choices[posture]:null;
}
function figure(kind,pos,color,pose="stand",dir=1,scale=.46){
  // Parametric side-profile family adapted from the supplied figs.js,
  // without facial features or references to unapproved icon assets.
  if(!pos)return "";
  const liturgical=kind==="priest",server=kind==="server";
  const garment=liturgical?color:server?"#17191d":"#a9adab";
  const head=liturgical||server?"#ead7b8":garment;
  const body=pose==="seated"
    ?'<path d="M-14 -55 L14 -55 L16 -31 L26 -31 L26 -4 L18 -4 L17 -24 L-14 -26Z" fill="'+(server?"#17191d":"#ece5da")+'"/>'
    :'<path d="M-15 -51 L14 -51 L18 -4 Q0 1 -17 -4Z" fill="'+(server?"#17191d":"#eee8dc")+'"/>';
  const chasuble=liturgical
    ?'<path d="M-12 -79 Q1 -85 13 -79 L18 -27 Q1 -23 -15 -27Z" fill="'+garment+'" stroke="#c6a966" stroke-width="1.8"/>'
    :server?'<path d="M-12 -78 Q1 -83 12 -78 L18 -40 Q2 -35 -16 -40Z" fill="#eee9df"/>':
    '<path d="M-12 -78 Q2 -82 12 -78 L16 -38 Q2 -35 -16 -38Z" fill="'+garment+'"/>';
  const chair=pose==="seated"?'<path d="M-16 -67 L-16 -4 M-16 -29 L27 -29 M20 -29 L20 -4" stroke="#805b3f" stroke-width="4" fill="none"/>':"";
  const feet='<ellipse cx="10" cy="-2" rx="8" ry="3" fill="#191b1b"/>';
  return '<g class="ao-lb-actor" transform="translate('+number(pos.x)+' '+number(pos.y)+') scale('
    +number(dir*scale)+' '+number(scale)+')" data-actor="'+kind+'">'
    +'<ellipse cx="0" cy="1" rx="18" ry="4" fill="#000" opacity=".24"/>'
    +chair+body+feet+chasuble
    +'<path d="M-1 -80 L3 -70" stroke="'+head+'" stroke-width="6"/>'
    +'<circle cx="3" cy="-90" r="9" fill="'+head+'"/>'
    +'<path d="M3 -73 L10 -58 L17 -64" fill="none" stroke="#f0e5d4" stroke-width="6" stroke-linecap="round"/>'
    +'</g>';
}
function faithfulImage(src,x,y,gold=false,pose="STAND"){
  if(!src)return "";
  // The URL comes exclusively from immutable app-shipped approved assets.
  const p=pose==="KNEEL"?40:pose==="SIT"?37:43;
  const transform=gold?"sepia(1) saturate(1.8) hue-rotate(356deg) brightness(1.22)":"grayscale(1) brightness(.8)";
  return '<image class="ao-lb-faithful" data-posture="'+pose+'" x="'+(x-18)+'" y="'+(y-p)
    +'" width="36" height="'+p+'" preserveAspectRatio="xMidYMax meet" href="'+src
    +'" style="filter:'+transform+';opacity:'+(gold?".95":".6")+'"/>';
}
function sanctuaryArchitecture(scene){
  const altar=point("CENTER"),railX=525-.87*LIVE_HANDOFF_ALTAR_PLAN.sanctuaryRailY;
  const px=point("PULPIT"),sd=point("SEDILIA");
  const candleCount=scene.candles??0;
  const frontal=safeColor(COLOURS[scene.colour]??COLOURS.NEUTRAL);
  const veil=scene.requiem?COLOURS.VIOLET:frontal;
  const candles=candleCount?Array.from({length:candleCount},(_,i)=>{
    const n=candleCount===2?(i?1:0):i/5;
    const y=candleCount===2?(i?223:377):208+n*184;
    return rect(478,y,4,16,"ao-lb-candle")
      +'<path d="M480 '+(y-3)+'q-4 -6 0 -10q4 4 0 10Z" class="ao-lb-flame"/>';
  }).join(""):"";
  const pews=[117,159,201,243].map(x=>
    line(x,110,x,250,"ao-lb-pew")+line(x,350,x,490,"ao-lb-pew")).join("");
  const schola=[115,140,165].map(x=>circle(x,132,8,"ao-lb-choir")).join("");
  return [
    rect(64,75,railX-64,450,"ao-lb-nave"),
    rect(railX,75,537-railX,450,"ao-lb-sanctuary"),
    pews,
    line(railX,75,railX,272,"ao-lb-rail"),
    line(railX,328,railX,525,"ao-lb-rail"),
    rect(railX-2,272,4,56,"ao-lb-gate"),
    rect(386,182,5,236,"ao-lb-step"),
    rect(401,177,6,246,"ao-lb-step"),
    rect(452,198,8,204,"ao-lb-gradine"),
    rect(465,193,47,214,"ao-lb-high-altar",'style="fill:'+frontal+';fill-opacity:.28"'),
    rect(490,217,18,166,"ao-lb-gradine"),
    rect(502,285,16,30,"ao-lb-tabernacle",'style="fill:'+veil+';fill-opacity:.83"'),
    line(522,281,522,320,"ao-lb-cross"),
    line(514,289,530,289,"ao-lb-cross"),
    candles,
    rect(389,450,21,12,"ao-lb-credence"),
    [0,1,2].map(i=>rect(sd.x-9,sd.y-45+i*24,29,15,"ao-lb-sedilia")).join(""),
    circle(px.x,px.y,21,"ao-lb-pulpit"),
    circle(364,113,5,"ao-lb-lamp"),
    schola,
    rect(83,171,94,9,"ao-lb-choir-stand"),
    rect(73,200,28,37,"ao-lb-organ"),
    [0,1,2,3].map(i=>line(79+i*5,206,79+i*5,229,"ao-lb-organ-pipe")).join("")
  ].join("");
}

/** A rendered plan is a read-only illustration; icon/status layers only
 * show flags that have an independent current native source observation.
 */
export function renderLiveHandoffSanctuarySvg(scene){
  if(!scene||scene.status==="NATIVE_CROSSWALK_REQUIRED")return "";
  const p=scene.priest?point(scene.priest.station):null;
  const facing=scene.priest?.facing;
  const dir=["PEOPLE","PEOPLE_DURING_TURN","COMMUNICANT"].includes(facing)?-1:1;
  const priest=scene.priest?figure("priest",p,
    safeColor(COLOURS[scene.colour]??COLOURS.NEUTRAL),scene.priest.pose,dir,.53):"";
  // Server figure is a reference presence only; no bell, paten, motion or
  // assumption about the Solemn minister positioning has been approved.
  const fp=point("FOOT");
  const sp=scene.server?{x:fp.x-8,y:fp.y+42}:null;
  const server=scene.server?figure("server",sp,"#eee9df","stand",1,.40):"";
  const approved=approvedFaithfulArt(scene.faithful?.posture);
  const people=scene.faithful
    ?faithfulImage(approved,150,237,false,scene.faithful.posture)
      +faithfulImage(approved,150,386,false,scene.faithful.posture)
      +faithfulImage(approved,191,392,true,scene.faithful.posture):"";
  const svg='<svg viewBox="0 0 600 600" class="ao-lb-plan ao-lb-sanctuary-plan" role="img"'
    +' aria-label="Illustrative sanctuary reference, not observation of actual clergy movement">'
    +sanctuaryArchitecture(scene)+people+server+priest+'</svg>';
  if(!labelFree(svg))throw Error("LIVE_PLAN_LABEL_OR_MARKER_FORBIDDEN");
  return svg;
}
export const LIVE_SANCTUARY_CSS=[
".ao-lb-sanctuary-plan{max-width:640px;opacity:1;overflow:visible}",
".ao-lb-sanctuary-plan .ao-lb-nave{fill:rgba(8,14,17,.85)}",
".ao-lb-sanctuary-plan .ao-lb-sanctuary{fill:rgba(202,199,176,.10);stroke:rgba(221,212,180,.25);stroke-width:1.4}",
".ao-lb-sanctuary-plan .ao-lb-step{fill:rgba(230,225,203,.20)}",
".ao-lb-sanctuary-plan .ao-lb-high-altar{stroke:rgba(236,222,170,.76);stroke-width:2}",
".ao-lb-sanctuary-plan .ao-lb-gradine{fill:rgba(225,211,172,.40)}",
".ao-lb-sanctuary-plan .ao-lb-rail{stroke:rgba(234,226,186,.75);stroke-width:4}",
".ao-lb-sanctuary-plan .ao-lb-gate{fill:rgba(234,226,186,.18)}",
".ao-lb-sanctuary-plan .ao-lb-candle{fill:#f0e4c2}",
".ao-lb-sanctuary-plan .ao-lb-flame{fill:#e9bf68}",
".ao-lb-sanctuary-plan .ao-lb-tabernacle{stroke:#e3c991;stroke-width:1.4}",
".ao-lb-sanctuary-plan .ao-lb-cross{stroke:#d7bd78;stroke-width:2.7}",
".ao-lb-sanctuary-plan .ao-lb-credence{fill:#75664f}",
".ao-lb-sanctuary-plan .ao-lb-sedilia{fill:rgba(124,87,61,.62)}",
".ao-lb-sanctuary-plan .ao-lb-pulpit{fill:rgba(147,118,79,.37);stroke:#bdab84}",
".ao-lb-sanctuary-plan .ao-lb-lamp{fill:#e4b66e}",
".ao-lb-sanctuary-plan .ao-lb-choir{fill:rgba(168,186,193,.88)}",
".ao-lb-sanctuary-plan .ao-lb-choir-stand{fill:#7f7364}",
".ao-lb-sanctuary-plan .ao-lb-organ{fill:rgba(98,109,114,.54)}",
".ao-lb-sanctuary-plan .ao-lb-organ-pipe{stroke:#ddd7c8;stroke-width:2}",
".ao-lb-sanctuary-plan .ao-lb-pew{stroke:rgba(199,207,193,.25);stroke-width:12;stroke-linecap:round}"
].join("\n");
