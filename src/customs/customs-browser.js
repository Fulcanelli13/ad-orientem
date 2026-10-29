import {CUSTOMS_YEAR_GROUPS,createCustomsLibrary,selectCustoms,selectResearch} from "./customs-library.js";
import {calendarCustomArticle} from "../calendar/customs-read-model.js";
import {calendarCustomHistoricalVariants} from "../calendar/customs-22-regional-variants.js";

const ROOT="ao-customs-library-root";
const E=value=>String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const DATA=Object.freeze({
  customs:"../../data/customs/customs-atlas-seed.v1.json",
  temporal:"../../data/customs/customs-temporal-projection.v1.json",
  archive:"../../data/customs/research/weiser-public-reference-index.v1.json",
  sources:"../../data/customs/source-registry.v1.json",
  p0:"../../data/customs/customs-p0-guidance-en-fr.v1.json",
  p1:"../../data/customs/customs-p1-guidance-en-fr.v1.json",
  frCopy:"../../data/customs/customs-fr-canonical-copy.v1.json",
  historical:"../../data/customs/customs-historical-folios.v1.json"
});
const CSS="#ao-customs-library-root{position:fixed;inset:0;z-index:90010;overflow:auto;overscroll-behavior:contain;background:#080c12;color:#e9e0d0;font:16px/1.55 var(--ao-font-body,Georgia,serif)}#ao-customs-library-root *{box-sizing:border-box}#ao-customs-library-root button,#ao-customs-library-root input,#ao-customs-library-root select{font:14px/1.45 var(--ao-font-ui,system-ui,sans-serif);color:inherit}#ao-customs-library-root button{cursor:pointer}#ao-customs-library-root button:focus-visible,#ao-customs-library-root input:focus-visible,#ao-customs-library-root select:focus-visible,#ao-customs-library-root a:focus-visible{outline:2px solid #e2c88d;outline-offset:3px}.aoCustFrame{max-width:990px;margin:auto;padding:24px clamp(16px,4vw,45px) 90px}.aoCustHead{display:flex;justify-content:space-between;align-items:center;gap:12px}.aoCustEyebrow{font:650 11px/1.4 var(--ao-font-ui,system-ui,sans-serif);text-transform:uppercase;letter-spacing:.1em;color:#bca67e}.aoCustClose,.aoCustBack,.aoCustBtn{border:1px solid #65533f;background:#14202b;border-radius:9px;padding:11px 15px;min-height:44px}.aoCustTitle{font:normal clamp(28px,5vw,45px)/1.2 var(--ao-font-display,Georgia,serif);margin:18px 0;color:#f3e5d0}.aoCustIntro{max-width:70ch;color:#cec0ae;line-height:1.7}.aoCustTabs{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px;margin:28px 0 18px}.aoCustTabs button{min-height:50px;background:#15212a;border:1px solid #514638;border-radius:9px;padding:8px}.aoCustTabs button[aria-current=page]{border-color:#d9c59a;background:#3d3020}.aoCustTools{display:flex;gap:8px;flex-wrap:wrap;margin:16px 0}.aoCustTools input,.aoCustTools select{background:#141d27;border:1px solid #5f5141;border-radius:8px;padding:10px;min-height:44px;min-width:0}.aoCustTools input{flex:1 1 180px}.aoCustGroup{padding:20px 0;border-top:1px solid #514331}.aoCustGroup h2,.aoCustArticle h2{font:normal 24px/1.3 var(--ao-font-display,Georgia,serif);margin:0 0 13px}.aoCustCards{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,260px),1fr));gap:10px;margin:16px 0}.aoCustCard{padding:16px;text-align:left;min-height:125px;background:linear-gradient(130deg,#172330,#101820);border:1px solid #514331;border-radius:10px;display:flex;flex-direction:column;align-items:flex-start;gap:10px}.aoCustCard strong{font:normal 19px/1.27 var(--ao-font-display,Georgia,serif)}.aoCustSmall{font:12px/1.45 var(--ao-font-ui,system-ui,sans-serif);color:#c4aa80}.aoCustSummary{font:14px/1.5 var(--ao-font-body,Georgia,serif);color:#c9bcaa}.aoCustArticle{max-width:740px;margin:28px 0}.aoCustArticle section{border-top:1px solid #504234;padding:19px 0}.aoCustArticle details summary{cursor:pointer;color:#e7d4b2;min-height:44px;padding:10px 0}.aoCustHistorySources{margin-top:14px;padding:10px 13px;border-left:2px solid #816f50;background:#111b26}.aoCustHistorySources ul{margin:8px 0;padding-left:19px}.aoCustHistorical p{line-height:1.75}.aoCustArticle p,.aoCustArticle li{line-height:1.75;overflow-wrap:anywhere}.aoCustArticle a{color:#ebcc8c}.aoCustNotice{padding:14px 18px;border-left:3px solid #bda47d;background:#14202b;margin:16px 0}.aoCustResearchRow{width:100%;min-height:62px;background:transparent;border:0;border-bottom:1px solid #493d32;text-align:left;display:flex;align-items:flex-start;gap:14px;padding:13px 3px}.aoCustResearchRow span{flex:0 0 93px;color:#c6ae86;font:12px/1.5 monospace}.aoCustResearchRow strong{font:normal 15px/1.5 var(--ao-font-body,Georgia,serif)}@media(max-width:430px){.aoCustFrame{padding:15px 16px 70px}.aoCustTabs{gap:4px}.aoCustTabs button{font-size:12px}.aoCustResearchRow span{flex-basis:78px;font-size:10px}}";

function makeOwner(win=globalThis){
  let root=null,library=null,loading=null,focusBack=null;
  const state={tab:"year",archive:false,q:"",triage:"",chapter:0,limit:60,custom:null,research:null};
  const FR=()=>win?.AO_RUNTIME_V8?.store?.getState?.()?.language==="fr";
  const L=(en,fr)=>FR()?fr:en;
  const FAMILY_FR=Object.freeze({"Home & family":"Maison et famille","Sacred Heart":"Sacré-Cœur","Life events":"Étapes de la vie","Marian domestic devotion":"Dévotion mariale au foyer","Pilgrimage":"Pèlerinage","Sacred objects":"Objets de dévotion","Death & Holy Souls":"Défunts et âmes du purgatoire","Sacred time & bells":"Temps sacrés et cloches","Food & sacramentals":"Aliments et sacramentaux","Sacramentals":"Sacramentaux","Saints & sacramental blessings":"Saints et bénédictions","Saints & patronal feasts":"Saints et fêtes patronales","Marian feasts":"Fêtes mariales","Saints & charity":"Saints et charité","Marian feast-day sacramentals":"Sacramentaux des fêtes mariales","Easter domestic customs":"Coutumes familiales de Pâques","Advent household customs":"Coutumes de l'Avent au foyer","Advent community customs":"Coutumes communautaires de l'Avent","Christmas household customs":"Coutumes familiales de Noël","Holy Week lay devotions":"Dévotions de la Semaine sainte","Rogation household customs":"Coutumes familiales des Rogations","Epiphany charity":"Charité de l'Épiphanie","Epiphany household":"Épiphanie au foyer","Corpus Christi regional decorations":"Décors régionaux de la Fête-Dieu","Eastertide regional devotional walks":"Marches régionales du temps pascal","Marian household customs":"Coutumes mariales au foyer"});
  const familyLabel=value=>FR()?FAMILY_FR[value]||value:value;
  const dateHint=c=>FR()?c.temporal.calendar_hint_fr||c.temporal.calendar_hint:c.temporal.calendar_hint;
  const title=c=>FR()&&c.title_fr?c.title_fr:c.title_en;
  const desc=c=>FR()&&c.description_fr?c.description_fr:c.description_en;
  const sources=c=>c.sources.filter(s=>/^https:\/\//.test(s.url||""));
  const header=()=>'<header class="aoCustHead"><span class="aoCustEyebrow">AD ORIENTEM · '+E(L("Catholic life","Vie catholique"))+'</span><button class="aoCustClose" data-cust-close>'+E(L("Close","Fermer"))+'</button></header>';
  function card(c){
    return '<button class="aoCustCard" data-cust-id="'+E(c.id)+'"><span class="aoCustSmall">'+E(c.publication_state==="CONTEXT_ONLY"?L("Historical or regional context","Contexte historique ou régional"):familyLabel(c.family))+'</span><strong>'+E(title(c))+'</strong><span class="aoCustSummary">'+E(dateHint(c)||desc(c))+'</span></button>';
  }
  function article(c){
    const regionalVariants=c.publication_state==="PUBLISHED"?calendarCustomHistoricalVariants(c.id,{fr:FR()}):[];
    const segments=[
      [L("When","Quand"),dateHint(c)],
      [L("Meaning","Sens"),FR()?c.meaning_fr||c.meaning_en:c.meaning_en],
      [L("Optional observance","Pratique facultative"),FR()?c.how_fr||c.how_en:c.how_en],
      // Published customs share their current pastoral wording with the existing Calendar.
      // Context-only source evidence retains its separate historical guardrail.
      [L("Historical and pastoral context","Contexte historique et pastoral"),
        (c.publication_state==="PUBLISHED"?calendarCustomArticle(c.id)?.caution[FR()?"fr":"en"]:null)
          ||(FR()?c.caution_fr||c.guardrail:c.guardrail)]
    ];
    let html='<button class="aoCustBack" data-cust-back>'+E(L("← Return to collection","← Retour à la collection"))+'</button>'+
      '<p class="aoCustEyebrow">'+E(familyLabel(c.family))+'</p><h1 class="aoCustTitle">'+E(title(c))+'</h1>'+
      '<p class="aoCustIntro">'+E(desc(c))+'</p>';
    if(c.publication_state==="CONTEXT_ONLY")html+='<div class="aoCustNotice">'+E(L("Regional or historical context only; not a universal custom.","Contexte régional ou historique ; ce n’est pas une coutume universelle."))+'</div>';
    html+='<div class="aoCustArticle">';
    if(c.history)html+='<section class="aoCustHistorical"><h2>'+E(L("Historical witness","Témoignage historique"))+'</h2><p>'+
      E(FR()?c.history.history_fr:c.history.history_en)+'</p><div class="aoCustHistorySources"><strong class="aoCustSmall">'+
      E(L("Evidence behind this account","Sources de cette présentation"))+'</strong><ul>'+
      c.history.source_ids.map(id=>{
        const s=c.sources.find(source=>source.id===id);
        return s&&/^https:\/\//.test(s.url||"")?'<li><a href="'+E(s.url)+'" target="_blank" rel="noopener noreferrer">'+E(s.title||s.id)+'</a></li>':'';
      }).join("")+'</ul></div></section>';

    for(const [heading,body] of segments)if(body)html+='<section><h2>'+E(heading)+'</h2><p>'+E(body)+'</p></section>';
    if(c.attestations.length)html+='<section><details class="aoCustEvidenceDetails"><summary>'+E(L("Further source observations","Autres témoignages des sources"))+
      ' · '+c.attestations.length+'</summary><p class="aoCustSmall">'+E(L("Original editorial evidence notes in English; each observation is limited to its cited locality and period.","Notes éditoriales originales en anglais ; chaque témoignage ne concerne que les lieux et périodes attestés."))+'</p><ul>'+
      c.attestations.map(a=>'<li>'+E([a.period_label,a.evidence_note].filter(Boolean).join(" · "))+'</li>').join("")+'</ul></details></section>';
    if(sources(c).length){
      const all=sources(c),link=s=>'<li><a href="'+E(s.url)+'" target="_blank" rel="noopener noreferrer">'+E(s.title||s.id)+'</a></li>';
      html+='<section><h2>'+E(L("Independent sources","Sources indépendantes"))+'</h2><ul>'+
        all.slice(0,5).map(link).join("")+'</ul>';
      if(all.length>5)html+='<details class="aoCustEvidenceDetails"><summary>'+
        E(L("Additional references","Autres références"))+' · '+(all.length-5)+'</summary><ul>'+
        all.slice(5).map(link).join("")+'</ul></details>';
      html+='</section>';
    }
    if(regionalVariants.length){
      html+='<section class="aoCustRegionalVariants"><details class="aoCustEvidenceDetails"><summary>'+
        E(L("Historical regional variations","Variantes régionales historiques"))+' · '+regionalVariants.length+'</summary>'+
        '<p class="aoCustSmall">'+E(L(
          "Historical testimony only; locality, current practice and any priestly rite must not be presumed.",
          "Témoignages historiques uniquement : on ne présume ni la continuité locale, ni un rite sacerdotal autorisé."))+'</p>'+
        regionalVariants.map(v=>'<article class="aoCustRegionalVariant"><h3>'+E(v.title)+'</h3><p>'+E(v.history)+
          '</p><p>'+E(v.context_or_practice)+'</p><small class="aoCustSmall">'+
          E(v.geography.join(" · "))+' · '+E(L("Printed page","Page imprimée"))+' '+E(v.source.printed_page)+
          '</small><p><a href="'+E(v.source.url)+'" target="_blank" rel="noopener noreferrer">'+
          E(L("Read historical source","Lire la source historique"))+'</a></p></article>').join("")+
        '</details></section>';
    }
    return html+'</div>';
  }
  function researchArticle(r){
    let html='<button class="aoCustBack" data-cust-back>'+E(L("← Source index","← Index des sources"))+'</button>'+
      '<p class="aoCustEyebrow">'+E(r.original_triage)+' · '+E(L("Unpublished research","Recherche non publiée"))+'</p>'+
      '<h1 class="aoCustTitle">'+E(r.title)+'</h1>'+
      '<div class="aoCustNotice">'+E(L("Historical source locator, not proof of an approved living custom, priestly rite or local event.","Référence historique, non une preuve de coutume actuelle approuvée, de rite sacerdotal ou d’événement local."))+'</div>'+
      '<div class="aoCustArticle"><section><h2>'+E(L("Source and page","Source et page"))+'</h2><p>'+E(library.provenance)+' · '+E(L("chapter","chapitre"))+' '+r.chapter+', p. '+r.printed_page+' · '+E(r.id)+'</p></section>'+
      '<section><h2>'+E(L("Editorial disposition","Statut éditorial"))+'</h2><p>'+E(r.original_triage)+' · '+E(r.action||"")+'</p></section>';
    if(r.canonical)html+='<section><h2>'+E(L("Related canonical custom","Coutume canonique associée"))+'</h2><button class="aoCustBtn" data-cust-id="'+E(r.canonical.id)+'">'+E(title(r.canonical))+'</button></section>';
    return html+'</div>';
  }
  function yearPage(){
    const rows=selectCustoms(library,{view:"year",query:state.q});
    return '<p class="aoCustIntro">'+E(L("Seasonal customs, arranged for discovery. Actual movable feast dates remain owned by the Calendar.","Les coutumes saisonnières. Les dates mobiles restent calculées par le Calendrier."))+'</p>'+
      CUSTOMS_YEAR_GROUPS.map(([key,en,fr])=>{
        const group=rows.filter(x=>x.temporal.group===key);
        return group.length?'<section class="aoCustGroup"><h2>'+E(L(en,fr))+'</h2><div class="aoCustCards">'+group.map(card).join("")+'</div></section>':"";
      }).join("");
  }
  function lifePage(){
    const rows=selectCustoms(library,{view:"life",query:state.q});
    const families=[...new Set(rows.map(x=>x.family))];
    return '<p class="aoCustIntro">'+E(L("Undated customs, household traditions, personal milestones and pilgrimages.","Coutumes non datées, traditions familiales, événements personnels et pèlerinages."))+'</p>'+
      families.map(f=>'<section class="aoCustGroup"><h2>'+E(familyLabel(f))+'</h2><div class="aoCustCards">'+rows.filter(x=>x.family===f).map(card).join("")+'</div></section>').join("");
  }
  function collectionPage(){
    let html='<p class="aoCustIntro">'+library.stats.canonical+' '+E(L("canonical records including ","fiches canoniques dont "))+library.contextOnly+' '+E(L("context-only entries.","fiches contextuelles."))+'</p>'+
      '<button class="aoCustBtn" data-cust-archive>'+E(state.archive?L("Return to canonical traditions","Revenir aux coutumes canoniques"):L("Browse all 568 historical source observations","Parcourir les 568 notices historiques"))+'</button>';
    if(!state.archive)return html+'<div class="aoCustCards">'+selectCustoms(library,{view:"all",query:state.q}).map(card).join("")+'</div>';
    html+='<div class="aoCustNotice">'+E(L("Research index only: these 568 items are not 568 verified or independent living customs. Excluded and held observations remain labelled.","Index de recherche : ces 568 notices ne sont pas 568 coutumes vivantes vérifiées. Les exclusions et réserves restent visibles."))+'</div>';
    const categories=["","COVERED","ENRICH","CANDIDATE","REGIONAL","HISTORY_ONLY","EXCLUDE"];
    html+='<div class="aoCustTools"><select data-cust-triage aria-label="'+E(L("Category","Catégorie"))+'">'+
      categories.map(x=>'<option value="'+E(x)+'"'+(x===state.triage?" selected":"")+'>'+E(x||L("All categories","Toutes les catégories"))+'</option>').join("")+'</select>'+
      '<select data-cust-chapter aria-label="'+E(L("Chapter","Chapitre"))+'"><option value="0">'+E(L("All chapters","Tous les chapitres"))+'</option>'+
      Array.from({length:28},(_,i)=>'<option value="'+(i+1)+'"'+(state.chapter===i+1?" selected":"")+'>'+E(L("Chapter","Chapitre"))+' '+(i+1)+'</option>').join("")+'</select></div>';
    const rows=selectResearch(library,{query:state.q,triage:state.triage,chapter:state.chapter});
    html+='<p>'+rows.length+' '+E(L("matching observations","notices trouvées"))+'</p>';
    html+=rows.slice(0,state.limit).map(r=>'<button class="aoCustResearchRow" data-cust-research="'+E(r.id)+'"><span>'+E(r.id)+'</span><strong>'+E(r.title)+'<small class="aoCustSmall"> · p. '+r.printed_page+' · '+E(r.original_triage)+'</small></strong></button>').join("");
    if(rows.length>state.limit)html+='<button class="aoCustBtn" data-cust-more>'+E(L("Show more","Afficher davantage"))+'</button>';
    return html;
  }
  function paint(reset=false){
    if(!root)return;
    let body=header();
    if(!library)body+='<p role="status">'+E(L("Loading customs and sources…","Chargement des coutumes et sources…"))+'</p>';
    else if(state.custom&&library.byId.has(state.custom))body+=article(library.byId.get(state.custom));
    else if(state.research&&library.byResearchId.has(state.research))body+=researchArticle(library.byResearchId.get(state.research));
    else{
      body+='<h1 class="aoCustTitle">'+E(L("Customs & Traditions","Coutumes & Traditions"))+'</h1>'+
        '<p class="aoCustIntro">'+E(L("Catholic life through the year, at home and across generations. Every record and historical source remains accessible.","La vie catholique au fil de l’année, dans la famille et au fil des générations. Chaque fiche et chaque source historique reste accessible."))+'</p>'+
        '<nav class="aoCustTabs" aria-label="'+E(L("Collections","Collections"))+'">'+
        [["year",L("Through the Year","Au fil de l’année")],["life",L("Catholic Life","Vie catholique")],["all",L("Collection","Collection")]].map(([id,name])=>
          '<button data-cust-view="'+id+'"'+(state.tab===id?' aria-current="page"':'')+'>'+E(name)+'</button>').join("")+'</nav>'+
        '<form class="aoCustTools" data-cust-search><input name="q" aria-label="'+E(L("Search","Rechercher"))+'" value="'+E(state.q)+'"/><button class="aoCustBtn" type="submit">'+E(L("Search","Chercher"))+'</button></form>'+
        (state.tab==="year"?yearPage():state.tab==="life"?lifePage():collectionPage());
    }
    root.querySelector("main").innerHTML=body;
    if(reset)root.scrollTop=0;
  }
  async function ensure(){
    if(library)return library;
    if(!loading)loading=Promise.all(Object.entries(DATA).map(async([key,path])=>{
      const response=await (win.fetch||fetch)(new URL(path,import.meta.url).href,{headers:{accept:"application/json"}});
      if(!response.ok)throw Error("Customs source unavailable: "+key);return [key,await response.json()];
    })).then(rows=>(library=createCustomsLibrary(Object.fromEntries(rows)))).finally(()=>{loading=null;});
    return loading;
  }
  async function open({view="year",customId=null}={}){
    if(!win.document?.body)return false;
    if(root)return true;
    focusBack=win.document.activeElement;state.tab=["year","life","all"].includes(view)?view:"year";
    state.archive=false;state.custom=customId;state.research=null;state.q="";state.limit=60;
    root=win.document.createElement("section");root.id=ROOT;root.setAttribute("role","dialog");root.setAttribute("aria-modal","true");
    root.setAttribute("aria-label",L("Customs and Traditions","Coutumes et Traditions"));
    root.innerHTML='<style>'+CSS+'</style><main class="aoCustFrame"></main>';win.document.body.appendChild(root);
    root.addEventListener("click",onClick);root.addEventListener("submit",onSubmit);root.addEventListener("change",onChange);
    root.addEventListener("keydown",event=>{if(event.key==="Escape"){event.preventDefault();close();}});
    paint();root.querySelector("[data-cust-close]")?.focus();
    try{await ensure();if(root){if(state.custom&&!library.byId.has(state.custom))state.custom=null;paint();}return true;}
    catch(error){if(root)root.querySelector("main").innerHTML=header()+'<div class="aoCustNotice" role="alert">'+E(L("Customs could not be loaded. Calendar data is unchanged.","Chargement impossible. Le calendrier reste inchangé."))+'</div>';return false;}
  }
  function close(){if(!root)return;root.remove();root=null;focusBack?.focus?.();focusBack=null;}
  function onClick(event){
    const b=event.target.closest?.("button");if(!b||!root?.contains(b))return;
    if(b.hasAttribute("data-cust-close")){close();return;}
    if(b.hasAttribute("data-cust-back")){state.custom=null;state.research=null;paint(true);return;}
    if(b.dataset.custId&&library.byId.has(b.dataset.custId)){state.custom=b.dataset.custId;state.research=null;paint(true);return;}
    if(b.dataset.custResearch&&library.byResearchId.has(b.dataset.custResearch)){state.research=b.dataset.custResearch;state.custom=null;paint(true);return;}
    if(b.dataset.custView){state.tab=b.dataset.custView;state.archive=false;state.q="";paint(true);return;}
    if(b.hasAttribute("data-cust-archive")){state.archive=!state.archive;state.q="";state.limit=60;paint();return;}
    if(b.hasAttribute("data-cust-more")){state.limit+=60;paint();return;}
  }
  function onSubmit(event){
    if(!event.target.matches?.("[data-cust-search]"))return;event.preventDefault();
    state.q=String(event.target.elements.q.value||"").trim();state.limit=60;paint();
  }
  function onChange(event){
    if(event.target.matches?.("[data-cust-triage]"))state.triage=event.target.value;
    else if(event.target.matches?.("[data-cust-chapter]"))state.chapter=Number(event.target.value)||0;
    else return;state.limit=60;paint();
  }
  return Object.freeze({open,close,get status(){return {open:Boolean(root),ready:Boolean(library),canonical:library?.stats.canonical||0,research:library?.stats.research||0};}});
}
export function installCustomsBrowserOwner(win=globalThis){
  return win.AO_CUSTOMS_APP_V1||(win.AO_CUSTOMS_APP_V1=makeOwner(win));
}
