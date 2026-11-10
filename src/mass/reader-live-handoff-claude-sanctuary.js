import {R17_FINAL_APPROVED_MASS_ASSETS} from "./reader-final-approved-assets.js";
// Direct source port of the final 2026-11-10 Claude Plan architecture and
// congregation from reference/live_prototype.html (final override).
// The exact coordinates, SVG paths, colour handling and transform are kept.
// Only data ownership is adapted to native source-first Mass state.
import {claudeHandoffFig} from "./reader-live-handoff-claude-figs.js";
function originalClaudeArchFragment({frontal,veil,candles}){
 const IV="#e9e1cc",G="#d4b16a",L=frontal,V=veil;
 const R=(x,y,w,h,f,s,o=.7,rx=0,sw=1)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${f}" stroke="${s}" stroke-opacity="${o}" stroke-width="${sw}"/>`;
 return `<defs><pattern id="st4" width="36" height="36" patternUnits="userSpaceOnUse"><rect width="36" height="36" fill="#22262d"/><path d="M0 0H36M0 0V36" stroke="${IV}" stroke-opacity=".07"/></pattern>
  <pattern id="nv4" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="#14181e"/><path d="M0 20L20 0" stroke="${IV}" stroke-opacity=".03"/></pattern>
  <radialGradient id="glow"><stop offset="0" stop-color="${G}" stop-opacity=".6"/><stop offset="1" stop-color="${G}" stop-opacity="0"/></radialGradient></defs>
 <rect x="-200" y="296" width="1000" height="400" fill="url(#nv4)"/>
 <rect x="40" y="0" width="520" height="296" fill="url(#st4)"/><line x1="40" y1="0" x2="40" y2="296" stroke="${IV}" stroke-opacity=".25"/><line x1="560" y1="0" x2="560" y2="296" stroke="${IV}" stroke-opacity=".25"/>
 <rect x="40" y="0" width="520" height="30" fill="#2b2f36"/><line x1="40" y1="30" x2="560" y2="30" stroke="${IV}" stroke-opacity=".5" stroke-width="1.5"/>
 ${R(176,32,248,8,"#3a3d43",IV,.45,1)}${R(184,40,232,8,"#34373d",IV,.45,1)}
 ${(candles===2?[250,350]:[202,226,250,350,374,398]).map(x=>`<rect x="${x-1.6}" y="33" width="3.2" height="12" rx="1" fill="${G}"/><circle cx="${x}" cy="31.5" r="2.8" fill="#ffe9a8"/>`).join("")}
 <rect x="284" y="30" width="32" height="26" rx="3" fill="${V}" stroke="${G}" stroke-width="1.6"/><path d="M300 34v18M294 41h12" stroke="${G}" stroke-width="1.4"/><path d="M300 22v8M296 26h8" stroke="${G}" stroke-width="1.6"/>
 ${R(166,56,268,42,"#e2dac6","#fff6df",.9,2,1.4)}
 <rect x="176" y="80" width="248" height="16" fill="${L}" stroke="${G}" stroke-width="1.3"/><path d="M300 82v12M294 88h12" stroke="${G}" stroke-width="1.2"/><path d="M295 64h10l-2 6h-6z M299 70h2v5h-2z M296 75h8" fill="${G}" stroke="${G}" stroke-width=".6"/>
 ${R(146,100,308,40,"#3a3f47",IV,.55,2)}${R(160,140,280,18,"#32363d",IV,.45,2)}${R(174,158,252,18,"#2b2f35",IV,.4,2)}
 ${R(462,88,40,24,"#e2dac6","#fff6df",.8,2)}<circle cx="474" cy="100" r="3" fill="#7e93a8"/><circle cx="486" cy="100" r="3" fill="#a64c4c"/>
 ${R(486,140,30,72,"#6a4d34","#c9a57a",.6,3)}<line x1="486" y1="164" x2="516" y2="164" stroke="#c9a57a" stroke-opacity=".5"/><line x1="486" y1="188" x2="516" y2="188" stroke="#c9a57a" stroke-opacity=".5"/>
 <circle cx="104" cy="66" r="3.4" fill="#e0584f"/><circle cx="104" cy="66" r="9" fill="none" stroke="#e0584f" stroke-opacity=".35"/>
 <line x1="60" y1="296" x2="284" y2="296" stroke="${IV}" stroke-width="4" stroke-linecap="round"/><line x1="316" y1="296" x2="540" y2="296" stroke="${IV}" stroke-width="4" stroke-linecap="round"/>
 ${R(110,212,42,34,"#5a4330","#c9a57a",.6,15)}
`;}
function claudeSeats(fig,posture,selected=false){
 const COLS=[230,184,138],SEATS=[];
 COLS.forEach((x,ci)=>[168,234,366,432].forEach((y,ri)=>{if(!(ci===2&&ri<2))SEATS.push([x,y])}));
 const people=SEATS.map(([x,y],i)=>{
   if(posture==="STAND" || !["KNEEL","SIT"].includes(posture))
     return fig("lay","stand",i===5?"#d4b16a":"#8e959e",{x,y:y+22,s:.5,dir:1});
   const icon=R17_FINAL_APPROVED_MASS_ASSETS[posture==="KNEEL"?"final_kneel":"final_sit"];
   const flt=i===5?"invert(.72) sepia(.9) saturate(1.5) hue-rotate(4deg)":"invert(.6)";
   return `<image href="${icon}" x="${x-19}" y="${y+22-40}" width="38" height="40" preserveAspectRatio="xMidYMax meet" style="filter:${flt}"/>`;
 }).join("");
 return COLS.map((x,ci)=>(ci===2?"":`<rect x="${x-24}" y="138" width="6" height="128" rx="2" fill="#4a3829" stroke="#c9a57a" stroke-opacity=".35"/>`)+
 `<rect x="${x-24}" y="334" width="6" height="128" rx="2" fill="#4a3829" stroke="#c9a57a" stroke-opacity=".35"/>`).join("")+
 `<g class="schola"><rect x="104" y="136" width="56" height="132" rx="6" fill="#1b2738" stroke="#7fa2cc" stroke-opacity=".55"/>
 <rect class="schGlow" x="104" y="136" width="56" height="132" rx="6" fill="#5f86b8" opacity="0" style="transition:opacity .5s"/>
 <rect x="146" y="190" width="4" height="24" rx="1" fill="#c9a57a"/>
 ${[160,202,244].map(y=>fig("lay","stand","#9db6d6",{x:128,y:y+4,s:.4,dir:1})).join("")}</g>
 <rect x="108" y="488" width="48" height="20" rx="3" fill="#2a2420" stroke="#c9a57a" stroke-opacity=".5"/>
 ${[0,1,2,3,4,5,6].map(i=>`<rect x="${112+i*6}" y="478" width="3" height="${10+(i%3)*3}" fill="#c9a57a" opacity=".7"/>`).join("")}
 <g class="ppl">${people}</g>`;
}
function sourceStationGeometry(station) {
 const pts={FOOT:[300,190],CENTER:[300,124],EPISTLE:[408,124],GOSPEL:[192,124],SEDILIA:[500,175],PULPIT:[131,229],RAIL:[300,268]};
 return Object.hasOwn(pts,String(station))?pts[station]:null;
}
function sourcePose(nativeCueId,station){
 if(station==="SEDILIA")return "seated";
 // The owning native source position is not sufficient to assert a gesture.
 // A pose requires its independently source-verified gesture in a later stage.
 return "stand";
}
function claudeSourcePlanSVG(scene,fig){
 const colours={WHITE:"#f3ecd9",GREEN:"#3f8a55",RED:"#9b4a55",VIOLET:"#6b4ea3",BLACK:"#151515",ROSE:"#a86885",GOLD:"#d4b16a",NEUTRAL:"#3f8a55"};
 const colour=Object.hasOwn(colours,scene?.colour)?colours[scene.colour]:colours.GREEN;
 const veil=scene?.requiem?colours.VIOLET:colour;
 const railGlow=scene?.choir==="SOURCE_VERIFIED_SCHOLA_ACTIVE"?'.schGlow{opacity:.28}':"";
 const posture=scene?.faithful?.posture||"STAND";
 const old=sourceStationGeometry(scene?.priest?.station);
 const pos=old?{x:525-.87*old[1],y:300+.86*(old[0]-300)}:null;
 const dir=["PEOPLE","PEOPLE_DURING_TURN","COMMUNICANT"].includes(scene?.priest?.facing)?-1:1;
 const priest=pos?fig("priest",sourcePose(scene?.priest?.positionReferenceCueId,scene?.priest?.station),colour,
   {x:pos.x,y:pos.y+12,dir,s:.74}):"";
 const isSimple=scene?.server&&scene.form!=="SOLEMN";
 const server=isSimple?fig("server","kneel","",{x:525-.87*202,y:300+.86*(360-300)+12,dir:1,s:.58}):"";
 const people=claudeSeats(fig,posture);
 // Direct from Claude's final Plan: architecture and congregation live in
 // the ORIGINAL frame; the latter is drawn outside the rotation to stay
 // upright. The precise approved portrait transform is unchanged.
 return `<svg class="ao-lb-plan ao-lb-sanctuary-plan ao-claude-original-plan" viewBox="98 70 434 460" preserveAspectRatio="xMidYMid meet"
   role="img" aria-label="Source-backed sanctuary, original Claude reference artwork, not observed ceremonial motion">
   <style>.ao-claude-original-plan{--cap:Georgia,serif;--serif:Georgia,serif}${railGlow}</style>
   <g class="ao-claude-architecture" transform="translate(525 0) rotate(90) translate(300 0) scale(.86 .87) translate(-300 0)">
    ${originalClaudeArchFragment({frontal:colour,veil,candles:scene?.candles||6})}
   </g>
   <g class="ao-claude-pews">${people}</g>
   <g class="ao-claude-figures">${server}<g data-actor="priest">${priest}</g></g>
  </svg>`;
}
export function renderClaudeNativeSanctuary(scene){
 if(!scene || scene.status==="NATIVE_CROSSWALK_REQUIRED")return "";
 return claudeSourcePlanSVG(scene,claudeHandoffFig);
}
export {originalClaudeArchFragment};

export function renderClaudeNativeRouteOverlay({scene,route,step}={}){
 if(!route?.ok ||route.scope!=="REFERENCE_ONLY" || !step?.current?.point||!scene)return "";
 const cols={WHITE:"#f3ecd9",GREEN:"#3f8a55",RED:"#9b4a55",VIOLET:"#6b4ea3",BLACK:"#151515",ROSE:"#a86885",NEUTRAL:"#3f8a55"};
 const colour=cols[scene.colour]??cols.GREEN;
 const p=step.current.point,n=step.next?.point;
 const target=n&&(n.x!==p.x||n.y!==p.y)
  ?'<circle class="ao-lb-route-next" data-lb-route-next cx="'+n.x+'" cy="'+n.y+'" r="17"/>':"";
 return '<g class="ao-lb-route-overlay" data-lb-route-overlay data-source="REFERENCE_ONLY_NOT_OBSERVED">'
  +target
  +'<g data-lb-route-actor transform="translate('+p.x+' '+p.y+')">'
  +'<g data-lb-route-heading transform="scale(1 1)">'
  +claudeHandoffFig("priest","stand",colour,{x:0,y:12,s:.74,dir:1})
  +'</g></g></g>';
}
