/**
 * Rose Window for the original nine-day novena corpus, adapted from owner-
 * supplied prototype D. VISUAL day navigator only: prayer bodies, source
 * readings, translations, and stage navigation stay with novena-runtime.
 */
export const NOVENA_ROSE_WINDOW_VERSION="novena-rose-holy-ghost-v1";
const esc=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
export function rosePetalPath(index){
 const N=9,cx=170,cy=170,R0=63,R1=153;
 const a=(index*360/N-90)*Math.PI/180;
 const w=(360/N/2-3.2)*Math.PI/180;
 const p=(r,angle)=>[cx+r*Math.cos(angle),cy+r*Math.sin(angle)];
 const [x1,y1]=p(R0,a-w),[x2,y2]=p(R0,a+w),
 [x3,y3]=p(R1-31,a+w),[x4,y4]=p(R1,a),[x5,y5]=p(R1-31,a-w),
 [u,v]=p(R1-5,a+w*.55),[q,r]=p(R1-5,a-w*.55);
 const pt=(x,y)=>x.toFixed(1)+" "+y.toFixed(1);
 return "M"+pt(x1,y1)+" A"+R0+" "+R0+" 0 0 1 "+pt(x2,y2)+
  " L"+pt(x3,y3)+" Q"+pt(u,v)+" "+pt(x4,y4)+
  " Q"+pt(q,r)+" "+pt(x5,y5)+" Z";
}
const palette=[
 ["#522447","#be623d"],["#6b3761","#d8a461"],["#2b527a","#b87695"],
 ["#3d6b61","#c9a55d"],["#844639","#ca7175"],["#234d71","#d1a05b"],
 ["#694d76","#a7a063"],["#386b61","#ca8155"],["#633d58","#d6a05b"]
];
export function renderNovenaRoseWindow(n,active=1,{french=false}={}){
 if(!n||!Array.isArray(n.days)||n.days.length!==9)return "";
 const safe=Math.min(9,Math.max(1,Number(active)||1));
 const label=(en,fr)=>french?fr:en;
 const defs=n.days.map((_,i)=>'<linearGradient id="ao-n1-glass-'+i+'" x1="12%" y1="0%" x2="90%" y2="100%"><stop offset="0%" stop-color="'+palette[i][0]+'"/><stop offset="43%" stop-color="'+palette[i][1]+'"/><stop offset="100%" stop-color="'+palette[i][0]+'"/></linearGradient>').join("");
 const petals=n.days.map((day,i)=>{
  const number=i+1,angle=(i*40-90)*Math.PI/180,
   x=170+100*Math.cos(angle),y=170+100*Math.sin(angle),
   x1=170+73*Math.cos(angle),y1=170+73*Math.sin(angle),
   x2=170+142*Math.cos(angle),y2=170+142*Math.sin(angle);
  const title=esc(label(day.theme?.en||"Day "+number,day.theme?.fr||day.theme?.en||"Jour "+number));
  return '<g class="aoN1RosePetal" role="button" tabindex="0" data-n1-rose-day="'+number+'" data-n1-rose-theme="'+title+'" aria-label="'+esc(label("Select day ","Choisir le jour ")+number+": ")+title+'" aria-pressed="'+String(number===safe)+'">'+
    '<path class="aoN1RoseGlass" d="'+rosePetalPath(i)+'" fill="url(#ao-n1-glass-'+i+')"/>'+
    '<path d="M'+x1.toFixed(1)+' '+y1.toFixed(1)+'L'+x2.toFixed(1)+' '+y2.toFixed(1)+'" fill="none" stroke="#d5b17d" opacity=".55"/>'+
    '<path class="aoN1RoseLead" d="'+rosePetalPath(i)+'"/>'+
    '<text class="aoN1RoseNumber" x="'+x.toFixed(1)+'" y="'+y.toFixed(1)+'">'+number+'</text></g>';
 }).join("");
 const notches=Array.from({length:36},(_,i)=>{const a=i*10*Math.PI/180;return '<circle cx="'+(170+160*Math.cos(a)).toFixed(1)+'" cy="'+(170+160*Math.sin(a)).toFixed(1)+'" r="1.6" fill="#c19a66"/>'}).join("");
 const selectedTheme=label(n.days[safe-1].theme?.en,n.days[safe-1].theme?.fr);
 return '<section class="aoN1RoseWindow" data-n1-rose-window data-n1-rose-novena="'+esc(n.id)+'" data-n1-rose-selected="'+safe+'">'+
  '<small class="aoN1RoseKicker">'+esc(label("NINE LIGHTS · NINE DAYS","NEUF VITRAUX · NEUF JOURS"))+'</small>'+
  '<svg class="aoN1RoseSvg" viewBox="0 0 340 340" role="group" aria-label="'+esc(label("Nine-day rotating rose window","Rosace tournante des neuf jours"))+'">'+
  '<defs>'+defs+'</defs><circle cx="170" cy="170" r="167" fill="#120d12" stroke="#aa8659" stroke-width="1.5"/>'+
  '<circle cx="170" cy="170" r="158" fill="none" stroke="#7c5b41" stroke-width="1"/>'+
  '<g class="aoN1RoseRotor" style="--ao-n1-rose-rotation:-'+((safe-1)*40)+'deg;--ao-n1-rose-counter:'+((safe-1)*40)+'deg">'+petals+'</g>'+
  '<circle cx="170" cy="170" r="59" fill="#211619" stroke="#c3a16b" stroke-width="6"/>'+
  '<circle cx="170" cy="170" r="50" fill="#38251e" stroke="#dbba77" stroke-width="1"/>'+
  '<path d="M146 175c8-21 14-30 24-17 10-13 16-4 24 17-12-9-18-5-24 9-6-14-12-18-24-9z" fill="#e8d9b7" opacity=".9" aria-hidden="true"/>'+
  '<text x="170" y="210" text-anchor="middle" fill="#dbbd81" font-size="6.7" letter-spacing="1.1">VENI SANCTE SPIRITUS</text>'+notches+
  '<path d="M170 2l-4 11h8z" fill="#edce90"/></svg>'+
  '<p class="aoN1RoseCaption"><span data-n1-rose-count>'+esc(label("Day ","Jour ")+safe+label(" of nine"," sur neuf"))+'</span><strong data-n1-rose-title>'+esc(selectedTheme)+'</strong></p>'+
  '<p class="aoN1RoseHint">'+esc(label("Select a light to turn the rose; select it again to pray that day.","Choisissez un vitrail pour tourner la rosace ; choisissez-le à nouveau pour prier ce jour."))+'</p>'+
  '</section>';
}
export function selectNovenaRoseDay(rose,day,{french=false}={}){
 if(!rose||!Number.isInteger(day)||day<1||day>9)return false;
 rose.dataset.n1RoseSelected=String(day);
 const rot=rose.querySelector(".aoN1RoseRotor");
 if(rot){rot.style.setProperty("--ao-n1-rose-rotation",(-((day-1)*40))+"deg");rot.style.setProperty("--ao-n1-rose-counter",((day-1)*40)+"deg")}
 for(const el of rose.querySelectorAll("[data-n1-rose-day]"))el.setAttribute("aria-pressed",String(Number(el.dataset.n1RoseDay)===day));
 const selected=rose.querySelector('[data-n1-rose-day="'+day+'"]');
 const name=selected?.dataset.n1RoseTheme||"";
 const count=rose.querySelector("[data-n1-rose-count]"),title=rose.querySelector("[data-n1-rose-title]");
 if(count)count.textContent=(french?"Jour ":"Day ")+day+(french?" sur neuf":" of nine");
 if(title)title.textContent=name;
 return true;
}
