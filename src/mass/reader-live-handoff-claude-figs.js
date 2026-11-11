// Direct 10 Nov 2026 Claude handoff: src/figs.js, SVG paths unchanged.
const FG={"SKIN":"#ead7b8","HAIR":"#3b2f27","ALB":"#efeadf","ALBS":"#d9d2c2","CAS":"#17171b","SUR":"#f5f2ea","SURS":"#ddd7ca","GOLD":"#d4b16a","SHOE":"#1d1a17"};
function shade(hex,k){const n=parseInt(hex.slice(1),16);let r=n>>16,g=n>>8&255,b=n&255;const f=v=>Math.max(0,Math.min(255,Math.round(k<0?v*(1+k):v+(255-v)*k)));return "#"+[f(r),f(g),f(b)].map(v=>v.toString(16).padStart(2,"0")).join("")}
function upper(kind,col,arms,lay){
 const head=`<circle cx="3" cy="-88" r="8.6" fill="${lay?col:FG.SKIN}"/>`+(lay?"":`<path d="M-5.6,-91.5 A8.6 8.6 0 0 1 10.6,-92.6 Q6,-96.8 -1,-96.4 Q-6.2,-95 -5.6,-91.5Z" fill="${FG.HAIR}"/><path d="M-5.4,-89 Q-6.6,-84 -4,-81" stroke="${FG.HAIR}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`);
 const neck=lay?"":`<path d="M-1,-80.5 L6,-80.5 L5.5,-76 L-1.5,-76Z" fill="${shade(FG.SKIN,-.12)}"/>`;
 let garment="";
 if(lay) garment=`<path d="M-9,-77 Q3,-81 11,-77 C14,-66 15,-52 14,-40 L-11,-40 C-12,-54 -12,-67 -9,-77Z" fill="${col}"/>`;
 else if(kind==="server") garment=`<path d="M-10,-78 Q2,-82 11,-78 C16,-66 19,-52 20,-40 Q4,-35 -16,-40 C-15,-54 -14,-67 -10,-78Z" fill="${FG.SUR}"/><path d="M-16,-40 Q4,-35 20,-40" stroke="${FG.SURS}" stroke-width="1.2" fill="none"/><path d="M-3,-80 Q3,-77 8,-80" stroke="${FG.CAS}" stroke-width="3" fill="none"/>`;
 else if(kind==="deacon"||kind==="subdeacon") garment=`<path d="M-11,-78 Q2,-82 12,-78 L19,-66 L15,-62 C16,-52 17,-40 17,-30 Q2,-26 -15,-30 C-15,-44 -14,-60 -11,-78Z" fill="${col}"/><path d="M14,-74 L14,-31" stroke="${FG.GOLD}" stroke-width="1.6"/><path d="M-13,-36 Q2,-32 16,-36" stroke="${FG.GOLD}" stroke-width="1.4" fill="none"/><path d="M-2,-80 Q3,-77 8,-80" stroke="${FG.ALB}" stroke-width="3" fill="none"/>`;
 else garment=`<path d="M-11,-78 Q2,-82 12,-78 C16,-64 18,-46 17,-31 Q3,-26 -14,-31 C-16,-46 -15,-63 -11,-78Z" fill="${col}"/><path d="M12,-78 C16,-64 18,-46 17,-31" stroke="${FG.GOLD}" stroke-width="1.8" fill="none"/><path d="M-14,-31 Q3,-26 17,-31" stroke="${FG.GOLD}" stroke-width="1.6" fill="none"/><path d="M-12.4,-70 L-13.6,-38" stroke="${shade(col,-.25)}" stroke-width="2.2"/><path d="M-2,-80 Q3,-77 8,-80" stroke="${FG.ALB}" stroke-width="3" fill="none"/>`;
 const sl=lay?col:kind==="server"?FG.SUR:FG.ALB;const hand=lay?col:FG.SKIN;
 let a="";
 if(arms==="joined") a=`<path d="M3,-73 L6.5,-58 L15,-63" stroke="${shade(sl,-.08)}" stroke-width="5.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M16,-62 L19.5,-71" stroke="${hand}" stroke-width="3.6" stroke-linecap="round"/>`;
 else if(arms==="up") a=`<path d="M4,-73 Q8,-86 10,-100" stroke="${sl}" stroke-width="5.4" fill="none" stroke-linecap="round"/><circle cx="10.5" cy="-104" r="3" fill="${hand}"/><circle cx="11.5" cy="-110.5" r="5.6" fill="#fffbec" stroke="${FG.GOLD}" stroke-width="1.2"/>`;
 else if(arms==="forward") a=`<path d="M4,-72 Q10,-66 20,-68" stroke="${sl}" stroke-width="5.4" fill="none" stroke-linecap="round"/><circle cx="22.5" cy="-68.5" r="3" fill="${hand}"/><circle cx="25.5" cy="-74" r="4.6" fill="#fffbec" stroke="${FG.GOLD}" stroke-width="1.1"/>`;
 else if(arms==="paten") a=`<path d="M4,-72 Q9,-64 20,-62" stroke="${sl}" stroke-width="5.4" fill="none" stroke-linecap="round"/><circle cx="22" cy="-62" r="2.8" fill="${hand}"/><ellipse cx="27" cy="-63.5" rx="7" ry="1.8" fill="${FG.GOLD}"/>`;
 else if(arms==="orans") a=`<path d="M4,-72 Q12,-70 18,-80" stroke="${sl}" stroke-width="5.4" fill="none" stroke-linecap="round"/><ellipse cx="19.5" cy="-83" rx="2.6" ry="3.6" fill="${hand}"/>`;
 else if(arms==="bell") a=`<path d="M4,-72 Q9,-63 17,-60" stroke="${sl}" stroke-width="5.4" fill="none" stroke-linecap="round"/><circle cx="19" cy="-60" r="2.8" fill="${hand}"/><path d="M19,-62 L19,-57 M15.5,-51 Q19,-60 22.5,-51Z" stroke="${FG.GOLD}" fill="${FG.GOLD}" stroke-width="1.2"/>`;
 else a=`<path d="M4,-72 Q8,-60 9,-50" stroke="${sl}" stroke-width="5.4" fill="none" stroke-linecap="round"/><circle cx="9.5" cy="-47" r="3" fill="${hand}"/>`;
 return neck+garment+head+a}
function lower(kind,pose,col,lay){
 const robe=lay?col:kind==="server"?FG.CAS:FG.ALB, edge=lay?col:kind==="server"?"#0c0c0f":FG.ALBS, shoe=lay?col:FG.SHOE;
 if(pose==="kneel") return [`<path d="M-19,-1 L15,-1 Q17,-4 15.5,-8 L11,-27 L-9,-28 L-10,-9 L-19,-7.5Z" fill="${robe}"/><path d="M-19,-1 L15,-1" stroke="${edge}" stroke-width="1.2"/><path d="M-21,-1.2 L-15,-1.2 L-15,-6 Q-19,-6 -21,-3Z" fill="${shoe}"/>`,24];
 if(pose==="genuflect") return [`<path d="M-15,-1 L-2,-1 C2,-8 6,-14 4,-22 L18,-22 C20,-16 22,-8 22,-1 L28,-1 L26,-5 L20,-30 C17,-40 14,-46 11,-50 L-9,-50 C-12,-38 -12,-26 -9,-12 L-15,-6Z" fill="${robe}"/><ellipse cx="25" cy="-1.5" rx="5.5" ry="2.2" fill="${shoe}"/>`,22];
 if(pose==="seated") return [`<path d="M-11,-40 L-11,-30 L13,-30 L13,-2 L20,-2 L20,-33 C20,-39 15,-41 10,-41 Z" fill="${robe}"/><ellipse cx="17" cy="-1.5" rx="5.2" ry="2.2" fill="${shoe}"/><rect x="-16" y="-30" width="26" height="3.2" rx="1" fill="#6a4d34"/><rect x="-17.5" y="-74" width="3.4" height="74" rx="1.4" fill="#6a4d34"/><rect x="6" y="-28" width="3" height="28" fill="#6a4d34"/>`,30];
 return [`<path d="M-11,-50 L11,-50 C13,-36 15,-18 15.5,-2.5 Q2,-0.5 -12.5,-2.5 C-12.5,-18 -12,-36 -11,-50Z" fill="${robe}"/><path d="M-12.5,-2.5 Q2,-0.5 15.5,-2.5" stroke="${edge}" stroke-width="1.2" fill="none"/><ellipse cx="11" cy="-1.2" rx="6" ry="2.2" fill="${shoe}"/>`,0]}
const ARMS={"stand":"joined","bow":"joined","kneel":"joined","genuflect":"joined","elevate":"up","host":"forward","seated":"rest","paten":"paten","orans":"orans","bell":"bell","read":"joined"};
function fig(kind,pose,col,o={}){const lay=kind==="lay";const [lo,dy]=lower(kind,pose,col,lay);
 let up=upper(kind,col,o.arms||ARMS[pose]||"joined",lay);
 if(pose==="bow") up=`<g transform="rotate(${o.deep?62:28} 0 -50)">${up}</g>`;
 const dir=o.dir||1, s=o.s||.45;
 return `<g transform="translate(${o.x||0} ${o.y||0}) scale(${dir*s} ${s})"><ellipse cx="2" cy="0" rx="18" ry="3.2" fill="#000" opacity=".32"/>${lo}<g transform="translate(0 ${dy})">${up}</g></g>`}
export {fig as claudeHandoffFig};
