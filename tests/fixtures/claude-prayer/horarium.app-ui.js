
/* =====================================================================
   APP UI — MISSAL CHASSIS ENGINE (shared). Book = cards + running head + ribbon contents + Aa + reading light.
   ===================================================================== */
const PH=n=>n?`<span class="ph-lines" aria-hidden="true">${"<i></i>".repeat(n)}</span>`:"";
const RN=["I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII","XIII","XIV","XV"];
const rn=i=>RN[i]?RN[i].toLowerCase():String(i+1);
const ORD=["first","second","third","fourth","fifth","sixth","seventh","eighth","ninth"];
const cap1=s=>s.charAt(0).toUpperCase()+s.slice(1);
/* common texts: public-domain common forms; production renders canonical texts from the app source */
const T={
 pater:{en:["Our Father, who art in heaven, hallowed be thy name; thy kingdom come; thy will be done on earth as it is in heaven.","Give us this day our daily bread; and forgive us our trespasses, as we forgive them that trespass against us; and lead us not into temptation, but deliver us from evil. Amen."],
  la:["Pater noster, qui es in cælis, sanctificétur nomen tuum. Advéniat regnum tuum. Fiat volúntas tua, sicut in cælo et in terra.","Panem nostrum quotidiánum da nobis hódie, et dimítte nobis débita nostra, sicut et nos dimíttimus debitóribus nostris. Et ne nos indúcas in tentatiónem, sed líbera nos a malo. Amen."]},
 ave:{en:["Hail Mary, full of grace, the Lord is with thee; blessed art thou among women, and blessed is the fruit of thy womb, Jesus.","Holy Mary, Mother of God, pray for us sinners, now and at the hour of our death. Amen."],
  la:["Ave María, grátia plena, Dóminus tecum; benedícta tu in muliéribus, et benedíctus fructus ventris tui, Iesus.","Sancta María, Mater Dei, ora pro nobis peccatóribus, nunc et in hora mortis nostræ. Amen."]},
 gloria:{en:["Glory be to the Father, and to the Son, and to the Holy Ghost.","As it was in the beginning, is now, and ever shall be, world without end. Amen."],
  la:["Glória Patri, et Fílio, et Spirítui Sancto.","Sicut erat in princípio, et nunc, et semper, et in sǽcula sæculórum. Amen."]}};
/* one paragraph: key into T, or an inline {en:[..], la:[..], ph}. Two-part texts get ℣/℟. */
function lines(src,lang){const t=typeof src==="string"?T[src]:src;const en=t.en,la=t.la||null;const L=lang==="la"&&la?la:en;const vr=t.vr!==false&&L.length===2;
 return L.map((x,i)=>{const g=t.g?t.g[i]:vr?(i?"℟":"℣"):"";const body=lang==="both"&&la?`<span class="la" lang="la">${la[i]}</span><span class="en">${en[i]}</span>`:`<span${lang==="la"&&la?' lang="la"':""}>${x}</span>`;
  return `<div class="ln"><span class="g">${g}</span><span>${body}${i===L.length-1?PH(t.ph):""}${i===L.length-1&&t.cap?`<span class="cap">${t.cap}</span>`:""}</span></div>`;}).join("");}
const para=(src,lang,k,extra)=>`<div class="q" ${extra||""}>${k?`<span class="k">${k}</span>`:""}${lines(src,lang)}</div>`;
const plate=(subj,cap,fo)=>`<div class="plate"><div class="im"><span>${subj}</span></div>${cap?`<div class="cp"><span>${cap}</span><i>${fo||""}</i></div>`:""}</div>`;

/* READING LIGHT: the reading line travels from the top of the text (start) to its foot (end). */
function light(sc,onLit){const ps=[...sc.querySelectorAll(".q")];let cur=-1,lock=0;
 const sp=document.createElement("div");sp.className="spacer";sp.style.setProperty("--sp",Math.round(sc.clientHeight*.38)+"px");sc.appendChild(sp);
 function idxAt(s){const max=sc.scrollHeight-sc.clientHeight;if(max<=0)return 0;const t=s/max;const y=s+10+(sc.clientHeight-sp.offsetHeight*t-20)*t;let i=0;ps.forEach((p,k)=>{if(p.offsetTop<=y)i=k;});return s>=max-2?ps.length-1:i;}
 function set(i){ps.forEach((p,k)=>{p.classList.toggle("lit",k===i);p.classList.toggle("past",k<i);});if(i!==cur){cur=i;onLit&&onLit(i,ps[i],ps.length);}}
 sc.addEventListener("scroll",()=>{if(Date.now()<lock)return;requestAnimationFrame(()=>set(idxAt(sc.scrollTop)));});
 function go(i){const max=sc.scrollHeight-sc.clientHeight;let s=0;for(;s<=max;s+=3){if(idxAt(s)>=i)break;}set(i);lock=Date.now()+700;sc.scrollTo({top:Math.min(s,max),behavior:"smooth"});}
 sc.addEventListener("click",e=>{const p=e.target.closest(".q");if(p&&!e.target.closest("button"))go(ps.indexOf(p));});
 if(ps.length)set(0);return {go,set,ps,get cur(){return cur;}};}

/* BOOK: cfg = {title, cards(st)→[ids], view(st,id,i)→{tl,fo,html}, toc(st)→[[n,title,k]], aa:[[label,key,[[v,l]..]]], after(el,st,api), act(name,a,st,api), onLit}
   Horizontal swipe / ←→ / foot "next" / contents change card. Nothing advances by itself. */
const BOOKS=[];
function Book(el,cfg,init){
 const st=Object.assign({c:0,lang:"en",fs:"m",panel:null,dir:"l"},JSON.parse(JSON.stringify(cfg.state||{})),init);
 const api={st,el,render,go,lt:null};BOOKS.push(api);
 const cards=()=>cfg.cards(st);
 function head(tl,fo,noAa){return `<div class="head"><button class="bk" data-a="back" aria-label="Back">‹</button><span class="tl">${tl}</span>${noAa?"":`<button class="aa" data-a="aa" aria-label="Text and options" aria-expanded="${st.panel==="aa"}">Aa</button>`}<span class="fo">${fo}</span></div><button class="ribbon" data-a="toc" aria-label="Contents" aria-expanded="${st.panel==="toc"}"></button>`;}
 function tocPanel(){const rows=cfg.toc?cfg.toc(st):[];return `<div class="drop ${st.panel==="toc"?"on":""}" data-p="toc" role="dialog" aria-label="Contents"><div class="rb">${cfg.title}</div>${rows.map(([n,t,k,f])=>`<button class="toc ${k===st.c?"cu":k<st.c?"dn":""}" data-a="goto" data-k="${k}"><span class="n">${n}</span><span class="t">${t}</span><span class="f">${f||rn(k)}</span></button>`).join("")}</div>`;}
 function aaPanel(){const ch=(key,opts)=>`<span class="ch">${opts.map(([v,l])=>`<button data-a="opt" data-k="${key}" data-v="${v}" aria-pressed="${String(st[key])===String(v)}">${l}</button>`).join("")}</span>`;
  const rows=[["Language","lang",[["en","English"],["la","Latin"],["both","Both"]]],["Size","fs",[["s","Small"],["m","Usual"],["l","Large"]]],...(cfg.aa||[])];
  return `<div class="drop ${st.panel==="aa"?"on":""}" data-p="aa" role="dialog" aria-label="Text and options">${rows.map(r=>r[0].startsWith("§")?`<div class="rb">${r[0].slice(1)}</div>`:`<div class="opt"><span>${r[0]}</span>${ch(r[1],r[2])}</div>`).join("")}<div class="opt"><span>Sources</span><span class="ch"><button data-a="noop" aria-label="Sources">ⓘ</button></span></div></div>`;}
 function render(){const ids=cards();st.c=Math.max(0,Math.min(ids.length-1,st.c));const v=cfg.view(st,ids[st.c],st.c,api);
  el.classList.toggle("fs-s",st.fs==="s");el.classList.toggle("fs-l",st.fs==="l");
  el.innerHTML=head(v.tl,v.fo,v.noAa)+v.html+`<div class="veil ${st.panel?"on":""}" data-a="close"></div>`+tocPanel()+aaPanel();
  el.style.setProperty("--hh",el.querySelector(".head").offsetHeight+"px");
  const sc=el.querySelector(".scr");api.lt=sc?light(sc,(i,p,n)=>cfg.onLit&&cfg.onLit(el,st,i,p,n,api)):null;
  cfg.after&&cfg.after(el,st,api);
  if(st.jump!=null&&api.lt){const j=st.jump;setTimeout(()=>api.lt&&api.lt.go(j),60);}}
 function go(k,dir){const n=cards().length;if(k<0||k>=n)return;st.dir=dir||(k>st.c?"l":"r");st.c=k;st.panel=null;st.jump=null;render();}
 function panel(p){st.panel=st.panel===p?null:p;el.querySelectorAll(".drop").forEach(d=>d.classList.toggle("on",d.dataset.p===st.panel));
  el.querySelector(".veil").classList.toggle("on",!!st.panel);const r=el.querySelector(".ribbon"),a=el.querySelector(".aa");r&&r.setAttribute("aria-expanded",st.panel==="toc");a&&a.setAttribute("aria-expanded",st.panel==="aa");}
 el.addEventListener("click",e=>{const a=e.target.closest("[data-a]");if(!a||!el.contains(a))return;const act=a.dataset.a;
  if(act==="goto")return go(+a.dataset.k);
  if(act==="next")return go(st.c+1,"l");
  if(act==="back"){if(st.panel)return panel(null);return cfg.back?cfg.back(st,api):go(Math.max(0,st.c-1),"r");}
  if(act==="toc"||act==="aa")return panel(act);
  if(act==="close")return panel(null);
  if(act==="opt"){const k=a.dataset.k,v=a.dataset.v;st[k]=v==="true"?true:v==="false"?false:isNaN(+v)||v===""?v:+v;st.dir="none";st.jump=null;return render();}
  cfg.act&&cfg.act(act,a,st,api);});
 let x0=null,y0=null;el.addEventListener("pointerdown",e=>{x0=e.clientX;y0=e.clientY;st.jump=null;});
 el.addEventListener("pointerup",e=>{if(x0==null||st.panel)return;const dx=e.clientX-x0,dy=e.clientY-y0;x0=null;if(Math.abs(dx)>=50&&Math.abs(dx)>Math.abs(dy)*1.4){if(cfg.swipe&&cfg.swipe(dx<0?1:-1,st,api)===false)return;go(st.c+(dx<0?1:-1));}});
 el.addEventListener("keydown",e=>{if(st.panel)return;if(e.key==="ArrowRight")go(st.c+1,"l");if(e.key==="ArrowLeft")go(st.c-1,"r");});
 render();return api;}
window.AOB={all(){BOOKS.forEach(b=>b.render());}};

/* ===================== FAMILY 1 · Hours ===================== */
(function(){
/* Ritual of the hour · Angelus (Regina Cæli in Eastertide). Hour from the clock, season from the calendar. */
const ANG=[{t:"The Angel of the Lord",v:{en:["The Angel of the Lord declared unto Mary.","And she conceived of the Holy Ghost."],la:["Angelus Dómini nuntiávit Maríæ.","Et concépit de Spíritu Sancto."]},ave:1},
 {t:"Behold the handmaid",v:{en:["Behold the handmaid of the Lord.","Be it done unto me according to thy word."],la:["Ecce ancílla Dómini.","Fiat mihi secúndum verbum tuum."]},ave:1},
 {t:"The Word was made flesh",rub:"Here all genuflect.",v:{en:["And the Word was made flesh.","And dwelt among us."],la:["Et Verbum caro factum est.","Et habitávit in nobis."]},ave:1},
 {t:"Let us pray",v:{en:["Pray for us, O holy Mother of God.","That we may be made worthy of the promises of Christ."],la:["Ora pro nobis, sancta Dei Génetrix.","Ut digni efficiámur promissiónibus Christi."]},
  col:{en:["Let us pray. Pour forth, we beseech thee, O Lord, thy grace into our hearts…"],la:["Orémus. Grátiam tuam, quǽsumus, Dómine, méntibus nostris infúnde…"],ph:3}}];
const REG=[{t:"Queen of Heaven",rub:"Said standing.",v:{en:["Queen of Heaven, rejoice, alleluia.","For he whom thou didst merit to bear, alleluia."],la:["Regína cæli, lætáre, allelúia.","Quia quem meruísti portáre, allelúia."]}},
 {t:"He is risen",v:{en:["Hath risen, as he said, alleluia.","Pray for us to God, alleluia."],la:["Resurréxit, sicut dixit, allelúia.","Ora pro nobis Deum, allelúia."]}},
 {t:"Rejoice and be glad",v:{en:["Rejoice and be glad, O Virgin Mary, alleluia.","For the Lord hath risen indeed, alleluia."],la:["Gaude et lætáre, Virgo María, allelúia.","Quia surréxit Dóminus vere, allelúia."]},
  col:{en:["Let us pray. O God, who by the resurrection of thy Son… didst vouchsafe to give joy to the world…"],la:["Orémus. Deus, qui per resurrectiónem Fílii tui… mundum lætificáre dignátus es…"],ph:2}}];
const SKY={6:["#3b2a2a","#c98a6a"],12:["#22303a","#c9c2a6"],18:["#2a2238","#b0704a"]};
function horarium(h,id){const t=(h-6)/12,P=[[24,96],[150,-36],[276,96]];const bx=(1-t)**2*P[0][0]+2*(1-t)*t*P[1][0]+t*t*P[2][0],by=(1-t)**2*P[0][1]+2*(1-t)*t*P[1][1]+t*t*P[2][1];const s=SKY[h];
 return `<svg viewBox="0 0 300 110" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Hour of the day"><defs><linearGradient id="sk${id}" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="${s[1]}" stop-opacity=".55"/><stop offset="1" stop-color="${s[0]}" stop-opacity=".12"/></linearGradient></defs>
 <rect width="300" height="110" fill="url(#sk${id})"/><path d="M24 92 Q150 -36 276 92" fill="none" stroke="currentColor" stroke-opacity=".35" stroke-dasharray="2 4"/><line x1="0" y1="93" x2="300" y2="93" stroke="currentColor" stroke-opacity=".5"/>
 <circle cx="${bx}" cy="${by}" r="9" fill="#E6C36A"/><circle cx="${bx}" cy="${by}" r="17" fill="#E6C36A" opacity=".16"/>
 ${[[6,24,96],[12,150,30],[18,276,96]].map(([hh,x,y])=>`<g class="tick" data-a="hour" data-h="${hh}"><rect x="${x-22}" y="84" width="44" height="26" fill="transparent"/><text x="${x}" y="108" text-anchor="middle" font-family="IM Fell English SC,Georgia" font-size="13" fill="currentColor" fill-opacity="${hh===h?1:.5}">${{6:"vi",12:"xii",18:"xviii"}[hh]}</text></g>`).join("")}</svg>`;}
const HN={6:["Morning","at dawn"],12:["Midday","at noon"],18:["Evening","at dusk"]};
const strokes=(i,n)=>`<div class="strokes" aria-label="Bell strokes">${[3,3,3,9].slice(0,n===3?4:4).map((g,k)=>`<span class="${k<i?"dn":k===i?"cu":""}">${"<i></i>".repeat(g)}</span>`).join("")}</div>`;
let UID=0;
const cfg={title:"The Angelus",state:{h:12,season:"ord"},
 cards:st=>["hour",...(st.season==="pasch"?REG:ANG).map((_,i)=>"m"+i),"amen"],
 toc:st=>{const M=st.season==="pasch"?REG:ANG;return [["","The hour",0],...M.map((m,i)=>[RN[i],m.t,i+1]),["✠","Amen",M.length+1]];},
 aa:[["§Review only — from the app"],["Season","season",[["ord","Year"],["pasch","Eastertide"]]]],
 view(st,id,c){const M=st.season==="pasch"?REG:ANG,name=st.season==="pasch"?"Regina Cæli":"The Angelus",L=st.lang,u=++UID;
  if(id==="hour")return {tl:name,fo:HN[st.h][0],html:`<div class="hor big">${horarium(st.h,u)}</div><div class="hourp slide-${st.dir}"><div class="t">${HN[st.h][0]} · the bell rings ${HN[st.h][1]}</div><h2>${name}</h2>
   ${plate(st.season==="pasch"?"The Resurrection":"The Annunciation",`Pl. — ${st.season==="pasch"?"The Resurrection":"The Annunciation"} · ${HN[st.h][0].toLowerCase()} plate`,"placeholder")}
   ${strokes(-1)}<button class="act" data-a="next"><span>Begin at the bell</span><span class="mn">☞</span></button>${st.season==="pasch"?`<p class="rub c">In Eastertide the Regina Cæli is said instead of the Angelus, standing.</p>`:""}</div>`};
  if(id==="amen"){const nx=st.h<12?"midday":st.h<18?"evening":"morning";
   return {tl:name,fo:"Amen",html:`<div class="end slide-${st.dir}"><div class="cr">✠</div><h2>Amen</h2><p class="rub c">${st.season==="pasch"?"For the Lord hath risen indeed, alleluia.":"Be it done unto me according to thy word."}</p>
   <div class="nxt">The bell will ring again at ${nx}</div><button class="act" data-a="exit"><span>Return to Pray</span><span class="mn">☞</span></button><button class="act quiet" data-a="goto" data-k="0"><span>Pray again</span><span class="mn">☞</span></button></div>`};}
  const i=c-1,m=M[i];
  return {tl:name,fo:`${HN[st.h][0]} · ${rn(i)}`,html:`<div class="hor">${horarium(st.h,u)}</div>${strokes(i)}
   <div class="scr slide-${st.dir}"><div class="sch">${m.t}</div>${m.rub?`<p class="rub">${m.rub}</p>`:""}${para(m.v,L)}${m.ave?para("ave",L):""}${m.col?para({en:m.col.en,la:m.col.la,ph:m.col.ph},L)+para({en:["Amen."],la:["Amen."],g:["℟"]},L):""}</div>
   <div class="foot"><span class="where"><b>${m.t}</b></span><button class="nx" data-a="next">${i<M.length-1?M[i+1].t:"Amen"} <span class="mn">☞</span></button></div>`};},
 act(a,n,st,api){if(a==="hour"){st.h=+n.dataset.h;st.dir="none";api.render();}if(a==="exit")api.go(0,"r");}};
Book(document.getElementById("h1"),cfg,{});
Book(document.getElementById("h2"),cfg,{c:3,h:18});
Book(document.getElementById("h3"),cfg,{c:1,season:"pasch",h:6,lang:"both"});

})();
