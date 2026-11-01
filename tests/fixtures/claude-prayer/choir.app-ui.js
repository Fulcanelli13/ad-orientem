
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

/* ===================== FAMILY 5 · Litanies ===================== */
(function(){
/* Litany of Loreto (1962-era form, sections as in the source). Response printed once, in the choir bar. */
const SEC=[
 {n:"Kyrie",pair:1,items:[[["Lord, have mercy on us.","Christ, have mercy on us."],["Kýrie, eléison.","Christe, eléison."]],[["Lord, have mercy on us. Christ, hear us.","Christ, graciously hear us."],["Kýrie, eléison. Christe, audi nos.","Christe, exáudi nos."]]]},
 {n:"The Holy Trinity",r:["have mercy on us.","miserére nobis."],items:[["God the Father of heaven,","Pater de cælis, Deus,"],["God the Son, Redeemer of the world,","Fili, Redémptor mundi, Deus,"],["God the Holy Ghost,","Spíritus Sancte, Deus,"],["Holy Trinity, one God,","Sancta Trínitas, unus Deus,"]]},
 {n:"Holy Mary",r:["pray for us.","ora pro nobis."],items:[["Holy Mary,","Sancta María,"],["Holy Mother of God,","Sancta Dei Génetrix,"],["Holy Virgin of virgins,","Sancta Virgo vírginum,"]]},
 {n:"Mother",r:["pray for us.","ora pro nobis."],items:[["Mother of Christ,","Mater Christi,"],["Mother of divine grace,","Mater divínæ grátiæ,"],["Mother most pure,","Mater puríssima,"],["Mother most chaste,","Mater castíssima,"],["Mother of good counsel,","Mater boni consílii,"],["Mother of our Saviour,","Mater Salvatóris,"]],more:1},
 {n:"Virgin",r:["pray for us.","ora pro nobis."],items:[["Virgin most prudent,","Virgo prudentíssima,"],["Virgin most powerful,","Virgo potens,"],["Virgin most merciful,","Virgo clemens,"],["Virgin most faithful,","Virgo fidélis,"]],more:1},
 {n:"Titles",r:["pray for us.","ora pro nobis."],items:[["Mirror of justice,","Spéculum justítiæ,"],["Seat of wisdom,","Sedes sapiéntiæ,"],["Cause of our joy,","Causa nostræ lætítiæ,"],["Tower of ivory,","Turris ebúrnea,"],["Morning star,","Stella matutína,"]],more:1},
 {n:"Queen",r:["pray for us.","ora pro nobis."],items:[["Queen of Angels,","Regína Angelórum,"],["Queen of all Saints,","Regína Sanctórum ómnium,"],["Queen of the most holy Rosary,","Regína sacratíssimi Rosárii,"],["Queen of peace,","Regína pacis,"]],more:1},
 {n:"Agnus Dei",items:[["Lamb of God, who takest away the sins of the world,","Agnus Dei, qui tollis peccáta mundi,",["spare us, O Lord.","parce nobis, Dómine."]],["Lamb of God, who takest away the sins of the world,","Agnus Dei, qui tollis peccáta mundi,",["graciously hear us, O Lord.","exáudi nos, Dómine."]],["Lamb of God, who takest away the sins of the world,","Agnus Dei, qui tollis peccáta mundi,",["have mercy on us.","miserére nobis."]]]}];
const VR={en:["Pray for us, O holy Mother of God.","That we may be made worthy of the promises of Christ."],la:["Ora pro nobis, sancta Dei Génetrix.","Ut digni efficiámur promissiónibus Christi."]};
const COL={en:["Let us pray. Grant, we beseech thee, O Lord God, that we thy servants may enjoy perpetual health of mind and body…"],la:["Orémus. Concéde nos fámulos tuos, quǽsumus, Dómine Deus, perpétua mentis et córporis sanitáte gaudére…"],ph:2};
const pick=(arr,L)=>L==="la"?arr[1]:L==="both"?`<span class="la" lang="la">${arr[1]}</span><span class="en">${arr[0]}</span>`:arr[0];
const cfg={title:"Litany of Loreto",
 cards:()=>["title","litany","prayer","end"],
 toc:()=>[["","Title",0],["","The invocations",1],["℣","Versicle and prayer",2],["✠","End",3]],
 aa:[["§The litany"],["Response bar","bar",[["on","Shown"],["off","Inline"]]]],state:{bar:"on"},
 view(st,id){const L=st.lang;
  if(id==="title")return {tl:"Litany of Loreto",fo:"i",html:`<div class="ltitle slide-${st.dir}"><h2>Litany of the Blessed Virgin Mary</h2><p class="rub c">called of Loreto</p>
   ${plate("Our Lady, Queen of Angels","Pl. — Our Lady · the plate changes by section","placeholder")}<div class="secs">${SEC.map(s=>s.n).join(" · ")}</div>
   <p class="rub c">The response is printed once, at the foot. Answer it after each invocation.</p><button class="act" data-a="next"><span>Begin the Litany</span><span class="mn">☞</span></button></div>`};
  if(id==="prayer")return {tl:"Litany of Loreto",fo:"iii",html:`<div class="scr slide-${st.dir}"><div class="sch">Versicle and prayer</div>${para(VR,L)}${para(COL,L)}${para({en:["Amen."],la:["Amen."],g:["℟"]},L)}</div><div class="foot"><span class="where"><b>The prayer</b></span><button class="nx" data-a="next">End <span class="mn">☞</span></button></div>`};
  if(id==="end")return {tl:"Litany of Loreto",fo:"iv",noAa:1,html:`<div class="end slide-${st.dir}"><div class="cr">✠</div><h2>Amen</h2><p class="rub c">Sancta Maria, ora pro nobis.</p><div class="nxt">&nbsp;</div><button class="act" data-a="exit"><span>Return to Pray</span><span class="mn">☞</span></button><button class="act quiet" data-a="goto" data-k="0"><span>Pray again</span><span class="mn">☞</span></button></div>`};
  const inline=st.bar==="off";let body="";
  SEC.forEach((s,si)=>{body+=`<div class="secp">${plate("","")}<span class="n">${s.n}</span></div>`;
   s.items.forEach(it=>{if(s.pair){const v={en:it[0],la:it[1]};body+=`<div class="q pair">${lines(v,L)}</div>`;return;}
    const r=it[2]||s.r;body+=`<div class="q" data-r="${encodeURIComponent(pick(r,L))}"><div class="ln"><span class="g"></span><span>${pick([it[0],it[1]],L)}${inline?` <i style="color:var(--rub)">℟</i> <i>${pick(r,L)}</i>`:""}</span></div></div>`;});
   if(s.more)body+=`<div class="q" data-r="${encodeURIComponent(pick(s.r,L))}"><div class="ln"><span class="g"></span><span><span class="cap">Further invocations of this section, from source</span>${PH(1)}</span></div></div>`;});
  return {tl:"Litany of Loreto",fo:"ii",html:`<div class="choirw"><div class="scr slide-${st.dir}">${body}</div>${inline?"":`<div class="resp" aria-live="polite"><span class="g">℟</span><b></b><small>all</small></div>`}</div>`};},
 onLit(el,st,i,p){const r=el.querySelector(".resp");if(!r)return;const b=r.querySelector("b");const t=p&&p.dataset.r?decodeURIComponent(p.dataset.r):"";
  r.style.visibility=t?"visible":"hidden";if(b.innerHTML!==t)b.innerHTML=t;r.classList.remove("ring");void r.offsetWidth;r.classList.add("ring");},
 act(a,n,st,api){if(a==="exit")api.go(0,"r");}};
Book(document.getElementById("l1"),cfg,{});
Book(document.getElementById("l2"),cfg,{c:1,jump:12});
Book(document.getElementById("l3"),cfg,{c:1,lang:"la",jump:33});

})();
