// C3 Living Gallery. Canonical Home routes and 1962 Calendar remain authoritative.
import { APPROVED_CLASS_I_2026 } from "../calendar/approved-class-i-heroes-2026.js";
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const norm=v=>String(v??"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z]+/g," ");
const cleanArt=a=>a&&a.qualityGate==="PASS"&&typeof a.file==="string"&&
  /^https:\/\/commons\.wikimedia\.org\/wiki\/File:/.test(a.sourcePage??"")&&
  /^(public domain|cc0|cc by)/i.test(String(a.license??a.rights??""));
const artUrl=(file,w)=>"https://commons.wikimedia.org/wiki/Special:Redirect/file/"+encodeURIComponent(file)+"?width="+w;
const C3_EXACT_APPROVED_PATHS=Object.freeze({"2026-11-01":"Sancti/11-01","2026-11-02":"Sancti/11-02m1"});
function certifiedWeekArt(provider,date){
  const selection=APPROVED_CLASS_I_2026.find(r=>r.date===date),path=C3_EXACT_APPROVED_PATHS[date];
  if(!selection||!path||selection.imagePublicationStatus==="HELD_SOURCE_REUSE_RIGHTS")return null;
  const row=provider?.effectiveRow?.(path),a=row?.status==="GREEN"?provider?.effectiveArtwork?.(row.primaryArtId):null;
  if(!cleanArt(a)||norm(a.artist)!==norm(selection.artist))return null;
  if(date==="2026-11-01"&&!norm(a.title).includes("paradise"))return null;
  if(date==="2026-11-02"&&!/purgatory|souls/.test(norm(a.title)))return null;
  return a;
}
// Home must not quietly substitute legacy Proper artwork for the user's
// exact Class I feast selection. Use only the same Commons preview already
// displayed by the canonical Calendar, never a new or held reproduction.
export function c3ApprovedDatedHomeArt(provider,state){
  const date=state?.selectedDate,path=C3_EXACT_APPROVED_PATHS[date];
  if(!path||provider?.properPath?.(state)!==path)return null;
  return APPROVED_CLASS_I_2026.find(row=>row.date===date)??null;
}
function eligibleCalendarPreview(row){
  return Boolean(row?.image&&row.imageTier==="commons-pd-art"&&
    row.imagePublicationStatus==="REMOTE_COMMONS_PREVIEW_NOT_OFFLINE_CERTIFIED"&&
    /^https:\/\/commons\.wikimedia\.org\/wiki\/File:/.test(row.source??"")&&
    /^https:\/\/upload\.wikimedia\.org\/wikipedia\/commons\//.test(row.image));
}
function info(a,img){
  if(!a||!img?.getAttribute?.("src"))return null;
  return {title:a.title,artist:a.artist,date:a.date??"",rights:a.license??a.rights??"",
    source:a.sourcePage,image:img.currentSrc||img.src};
}
export function c3PrayerMarkup({fr=false,feature=null,attrs="",role="",title="",description="",due=""}={}){
  const first=feature?.id??"prayer.library";
  const alternatives=[
    {id:"confession",title:"Confession",desc:fr?"Préparer son examen de conscience":"Prepare an examination of conscience",role:fr?"Prière":"Prayer",route:"pray.confession"},
    {id:"adoration",title:"Adoration",desc:fr?"Prier devant le Saint-Sacrement":"Prayer before the Blessed Sacrament",role:fr?"Prière":"Prayer",route:"pray.adoration"},
    {id:"library",title:fr?"Toutes les prières":"Prayer library",desc:fr?"Choisir une prière":"Explore traditional prayers",role:fr?"Découvrir":"Discover",route:"pray.library"},
    {id:"daily",title:fr?"Prières quotidiennes":"Daily prayers",desc:fr?"Matin et soir":"Morning and evening",role:fr?"Quotidien":"Daily",route:"pray.morning_evening"}
  ];
  const selectedRoute=feature?.route??(/data-home-cu-route="([^"]+)"/.exec(attrs)?.[1]??null);
  const pages=[{id:first,title,desc:description,role:role+(due?" · "+due:""),action:attrs},
    ...alternatives.filter(item=>item.route!==selectedRoute).slice(0,3).map(item=>({...item,action:'data-home-cu-route="'+item.route+'"'}))];
  return '<div class="aoC3PrayerFrame" data-home-c3-prayer-deck data-c3-feature="'+esc(first)+'">'+
    pages.map((s,i)=>'<article class="aoC3PrayerSlide" data-home-c3-slide="'+i+'"'+(i?' hidden aria-hidden="true"':' aria-hidden="false"')+'>'+
      '<div class="aoC3PrayerArt" aria-hidden="true" data-c3-prayer-art="'+esc(s.id)+'"></div>'+
      '<button type="button" class="'+(i===0?'aoH4Prayer np ':'')+'aoC3PrayerAction" '+s.action+'>'+
      '<span class="aoC3PrayerRole">'+esc(s.role)+'</span><strong>'+esc(s.title)+'</strong><small>'+esc(s.desc)+'</small>'+
      '<span class="aoC3Arrow" aria-hidden="true">›</span></button>'+
      '<button class="aoC3Info" type="button" data-home-c3-info="prayer" aria-label="'+(fr?"À propos de ce tableau":"About this painting")+'" hidden><span>i</span></button>'+
      '</article>').join("")+
    '<nav class="aoC3PrayerPager" aria-label="'+(fr?"Choisir une prière":"Choose a prayer")+'">'+
    pages.map((s,i)=>'<button type="button" data-home-c3-prayer-step="'+i+'" aria-current="'+(i===0?'true':'false')+'" aria-label="'+esc((fr?"Afficher : ":"Show: ")+s.title)+'"><span></span></button>').join("")+
    '</nav></div>';
}
export function c3UpcomingMarkup(rows,fr,dateLabel,dayOf){
  return (rows??[]).map(d=>'<div class="aoC3UpcomingCard" data-c3-week-date="'+esc(d.date)+'">'+
    '<div class="aoC3UpcomingArt" data-home-c3-week-art="'+esc(d.date)+'" aria-hidden="true"></div>'+
    '<button type="button" class="aoTodayV2Event aoTcmRow" data-home-calendar data-home-calendar-view="day" data-home-calendar-date="'+esc(d.date)+'">'+
    '<span class="aoH4Eyebrow">'+esc(dateLabel(d.date,fr))+'</span><strong>'+esc(fr?d.fr:d.en)+'</strong>'+
    '<small>'+esc(dayOf(d.date,fr))+'</small><span aria-hidden="true" class="aoC3WeekArrow">›</span></button>'+
    '<button type="button" class="aoC3Info" data-home-c3-info="week" aria-label="'+(fr?"À propos du tableau":"About this painting")+'" hidden><span>i</span></button>'+
    '</div>').join("");
}
export function selectC3PrayerSlide(root,index){
  const deck=root?.querySelector?.("[data-home-c3-prayer-deck]");
  const pages=[...deck?.querySelectorAll("[data-home-c3-slide]")??[]];
  if(!Number.isInteger(index)||index<0||index>=pages.length)return false;
  pages.forEach((p,i)=>{p.hidden=i!==index;p.setAttribute("aria-hidden",i===index?"false":"true")});
  deck.querySelectorAll("[data-home-c3-prayer-step]").forEach((p,i)=>p.setAttribute("aria-current",i===index?"true":"false"));
  return true;
}
export function hydrateC3Art(root,state,win=globalThis){
  const home=root?.querySelector?.(".homeScreen.aoH7Screens");
  if(!home)return false;
  const p=win.AO_PHASE1_ART,hero=home.querySelector(".aoH7Hero");
  const slot=hero?.querySelector("[data-ao-home-art-slot]");
  const mainInfo=hero?.querySelector('[data-home-c3-info="mass"]');
  if(mainInfo){mainInfo.hidden=true;mainInfo.__c3Artwork=null;}
  const selected=c3ApprovedDatedHomeArt(p,state);
  let datedPreview=null;
  if(selected&&slot){
    // The Calendar already publishes these *exact* user-approved Commons
    // preview URLs; this is re-use, not artwork discovery or rights promotion.
    // An ineligible image fails closed instead of displaying wrong-feast art.
    slot.replaceChildren();
    hero?.classList?.add("aoTodayV2ArtMissing");
    if(eligibleCalendarPreview(selected)){
      const doc=win.document,img=doc.createElement("img");
      img.className="aoC3DatedImage";img.src=selected.image;
      img.alt=selected.title+" — "+selected.artist;
      img.referrerPolicy="no-referrer";img.loading="eager";img.decoding="async";
      const credit=doc.createElement("div");credit.className="aoC3DatedCredit";
      const name=doc.createElement("span");name.textContent=selected.artist+" · "+selected.title;
      const link=doc.createElement("a");link.href=selected.source;
      link.target="_blank";link.rel="noopener noreferrer";link.textContent="Source ↗";
      credit.append(name,link);slot.append(img,credit);
      hero?.classList?.remove("aoTodayV2ArtMissing");
      datedPreview=selected;
      img.addEventListener("error",()=>{
        slot.replaceChildren();hero?.classList?.add("aoTodayV2ArtMissing");
        if(mainInfo){mainInfo.hidden=true;mainInfo.__c3Artwork=null;}
      },{once:true});
    }
  }
  const mainImg=hero?.querySelector("[data-ao-home-art-slot] img");
  if(mainImg){
    const orientation=()=>{
      const ratio=mainImg.naturalWidth/Math.max(1,mainImg.naturalHeight);
      if(mainImg.naturalWidth&&mainImg.naturalHeight)hero.dataset.c3Orientation=ratio>1.22?"landscape":ratio<.82?"portrait":"balanced";
    };
    if(mainImg.complete)orientation();else mainImg.addEventListener("load",orientation,{once:true});
    const row=p?.effectiveRow?.(p?.properPath?.(state));
    const a=row?.status==="GREEN"?p?.effectiveArtwork?.(row.primaryArtId):null;
    if(mainInfo&&datedPreview){
      mainInfo.__c3Artwork={title:datedPreview.title,artist:datedPreview.artist,
        date:"",rights:"Commons public-domain artwork preview (offline image not certified)",
        source:datedPreview.source,image:datedPreview.image};mainInfo.hidden=false;
    }else if(mainInfo&&!selected&&cleanArt(a)){
      mainInfo.__c3Artwork=info(a,mainImg);mainInfo.hidden=false;
    }
  }
  for(const slot of home.querySelectorAll("[data-home-c3-week-art]")){
    const a=certifiedWeekArt(p,slot.dataset.homeC3WeekArt);
    const button=slot.parentElement?.querySelector('[data-home-c3-info="week"]');
    if(button)button.hidden=true;
    if(!a)continue;
    const img=win.document.createElement("img");img.src=artUrl(a.file,800);img.loading="lazy";
    img.alt=a.artist+" — "+a.title;img.referrerPolicy="no-referrer";
    img.addEventListener("error",()=>{slot.replaceChildren();if(button)button.hidden=true},{once:true});
    slot.replaceChildren(img);
    if(button){button.__c3Artwork=info(a,img);button.hidden=false;}
  }
  // Prayer paintings are not promoted until independently cleared for frame,
  // reproduction rights and the selected prayer's exact subject.
  return true;
}
export function showC3ArtInfo(root,button){
  const a=button?.__c3Artwork,dlg=root?.querySelector?.("[data-home-c3-art-dialog]");
  if(!a||!dlg?.showModal)return false;
  dlg.querySelector("[data-c3-art-title]").textContent=a.title;
  dlg.querySelector("[data-c3-art-meta]").textContent=[a.artist,a.date,a.rights].filter(Boolean).join(" · ");
  const image=dlg.querySelector("[data-c3-art-image]");image.src=a.image;image.alt=a.artist+" — "+a.title;
  dlg.querySelector("[data-c3-art-source]").href=a.source;
  if(!dlg.open)dlg.showModal();
  return true;
}
export function closeC3ArtInfo(root){
  const dlg=root?.querySelector?.("[data-home-c3-art-dialog]");
  if(!dlg?.open)return false;dlg.close();return true;
}
