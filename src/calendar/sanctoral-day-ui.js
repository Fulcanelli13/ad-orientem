// Accessible secondary Calendar day content. No Mass/Proper actions.
const esc=value=>String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
const loc=(fr,en,french)=>fr?french:en;
const sourceLink=url=>/^https:\/\/(?:press\.vatican\.va|www\.vatican\.va|www\.causesanti\.va|bible\.usccb\.org)\/[\w\-./%?=&]+$/i.test(url||"");
export const SANCTORAL_DAY_CSS=[
".aoCalSecondarySaints{margin:12px auto 0;max-width:620px;padding:0 12px 12px;border-top:1px solid rgba(215,194,153,.13)}",
".aoCalSecondarySaints h3{font:600 14px/1.35 var(--ao-font-serif,Georgia,serif);margin:12px 0 4px;color:#ddd3c4}",
".aoCalSecondarySaints>p{color:#a69c8d;font:400 11px/1.45 var(--ao-font-ui,system-ui,sans-serif);margin:0 0 10px}",
".aoCalSecondarySaintCard{border:1px solid rgba(215,194,153,.12);border-radius:8px;padding:12px 14px;background:rgba(12,17,22,.32);margin-top:8px}",
".aoCalSecondarySaintCard>small{display:block;font:550 10px/1.4 var(--ao-font-ui,system-ui,sans-serif);color:#b6a386;margin-bottom:6px}",
".aoCalSecondarySaintCard>h4{margin:0 0 5px;font:550 16px/1.35 var(--ao-font-serif,Georgia,serif);color:#e4ded3}",
".aoCalSecondarySaintCard>p{margin:0 0 8px;color:#bcb6ac;font:400 12px/1.55 var(--ao-font-ui,system-ui,sans-serif)}",
".aoCalSecondarySaintCard>.aoCalSaintPlace{font:400 11px/1.5 var(--ao-font-ui,system-ui,sans-serif);color:#9a9b94}",
".aoCalSecondarySaintCard details{margin-top:6px;color:#bbb3a6;font:400 11px/1.45 var(--ao-font-ui,system-ui,sans-serif)}",
".aoCalSecondarySaintCard summary{cursor:pointer;display:flex;align-items:center;padding:9px 0;min-height:44px;touch-action:manipulation}",
".aoCalSecondarySaintCard a{display:inline-block;color:#d6c4a6;padding:5px 0;overflow-wrap:anywhere}",
".aoCalSecondarySaintCard a:focus-visible,.aoCalSecondarySaintCard summary:focus-visible{outline:2px solid #bea77e;outline-offset:3px}"
].join("");
export function renderSecondarySaintSection(cards,{language="en"}={}) {
  if(!Array.isArray(cards)||!cards.length)return "";
  const fr=language==="fr",parts=[];
  for(const c of cards){
    if(!c?.secondaryOnly||c.massSelectionAuthority!=="NONE"||c.changes1962Principal||c.selectedFormularyId!==null)continue;
    if(!c.title||!c.whyHonoured)continue;
    const source=c.sourceUrls?.find(sourceLink)||null;
    const kind=fr?(c.kind==="COLLECTIVE_MARTYR_PROFILE"?"Groupe de martyrs":"Saint honoré aujourd’hui"):
                  (c.kind==="COLLECTIVE_MARTYR_PROFILE"?"Martyr group":"Saint honoured today");
    const scope=c.sourceScope==="GENERAL_ROMAN_VATICAN_DECREE"
      ?loc(fr,"General Roman Calendar · decree","Calendrier romain général · décret")
      :c.sourceScope==="GENERAL_ROMAN_PAPAL_ANNOUNCEMENT"
        ?loc(fr,"General Roman Calendar · papal announcement","Calendrier romain général · annonce pontificale")
      :c.sourceScope==="DICASTERY_CAUSES_SAINTS_LITURGICAL_DATE"
        ?loc(fr,"Holy See feast-date witness · scope not established","Date liturgique attestée par le Saint-Siège · portée non établie")
      :loc(fr,"U.S. calendar reference","Référence du calendrier américain");
    const siteName=c.site?.placeName||"";
    let html='<article class="aoCalSecondarySaintCard"><small>'+esc(kind)+" · "+esc(scope)+"</small><h4>"+esc(c.title)+"</h4><p>"+esc(c.whyHonoured)+"</p>";
    if(c.context)html+="<p>"+esc(c.context)+"</p>";
    if(siteName)html+='<p class="aoCalSaintPlace">'+esc(loc(fr,"Associated place: ","Lieu associé : "))+esc(siteName)+"</p>";
    if(source)html+='<details><summary>'+esc(loc(fr,"Further reading","Pour approfondir"))+'</summary><a href="'+esc(source)+'" target="_blank" rel="noopener noreferrer">'+esc(loc(fr,"Read the source","Lire la source"))+' ↗</a></details>';
    html+="</article>";
    parts.push(html);
  }
  if(!parts.length)return "";
  return '<section class="aoCalSecondarySaints" aria-label="'+esc(loc(fr,"Also honoured","Également honorés"))+'"><h3>'+
    esc(loc(fr,"Also honoured","Également honorés"))+"</h3><p>"+
    esc(loc(fr,
      "Dates evidenced by Church sources, not a replacement for the 1962 Calendar. The feast and Mass above follow the traditional Missal.",
      "Dates attestées par des sources ecclésiales, sans remplacer le calendrier de 1962. La fête et la messe ci-dessus suivent le missel traditionnel."))+
    "</p>"+parts.join("")+"</section>";
}
