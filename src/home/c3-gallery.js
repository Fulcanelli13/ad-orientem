// C3 Living Gallery. Canonical Home routes and 1962 Calendar remain authoritative.
import { APPROVED_CLASS_I_2026 } from "../calendar/approved-class-i-heroes-2026.js";
import { RELEASED_MODULE_PAINTINGS } from "../art/released-module-paintings.v1.js";
import { SACRED_ART_RELEASED_GALLERY_V1, releasedGalleryAt, releasedGalleryBySource } from "../art/released-gallery-batch1.v1.js";
import { SACRED_ART_CATEGORIES_V1, sacredArtReleasedPhotoClassification } from "../art/sacred-art-taxonomy-v1.js";
import { sacredArtCrossModuleLinks } from "../art/sacred-art-crossmodule-links-v1.js";
import { releasedDateGospelHero2026 } from "./released-date-gospel-heroes-2026.js";
import {approved2026HomeArtwork} from "./approved-dated-artwork-2026.js";
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const norm=v=>String(v??"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z]+/g," ");
const cleanArt=a=>a&&a.qualityGate==="PASS"&&typeof a.file==="string"&&
  /^https:\/\/commons\.wikimedia\.org\/wiki\/File:/.test(a.sourcePage??"")&&
  /^(public domain|cc0|cc by)/i.test(String(a.license??a.rights??""));
const artUrl=(file,w)=>"https://commons.wikimedia.org/wiki/Special:Redirect/file/"+encodeURIComponent(file)+"?width="+w;
// Reuse *only* the existing Calendar's date-specific Commons previews, with
// the exact 1962 Proper path. These are not bundled image masters or a new
// artwork approval. The held Oct 25 / Nov 29 sources intentionally stay out.
const C3_EXACT_APPROVED_PATHS=Object.freeze({
  "2026-03-29":"Tempora/Quad6-0r",
  "2026-04-02":"Tempora/Quad6-4r",
  "2026-05-23":"Tempora/Pasc6-6",
  "2026-05-24":"Tempora/Pasc7-0",
  "2026-05-27":"Tempora/Pasc7-3",
  "2026-06-12":"Tempora/Pent02-5",
  "2026-11-01":"Sancti/11-01",
  "2026-11-02":"Sancti/11-02m1"
});
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
  const observed=provider?.properPath?.(state);
  const exact=observed===path||(date==="2026-11-02"&&/^Sancti\/11-02m[23]$/.test(observed??""));
  if(!path||!exact)return null;
  return APPROVED_CLASS_I_2026.find(row=>row.date===date)??null;
}
function eligibleCalendarPreview(row){
  return Boolean(row?.image&&["commons-pd-art","commons-pd-self"].includes(row.imageTier)&&
    row.imagePublicationStatus==="REMOTE_COMMONS_PREVIEW_NOT_OFFLINE_CERTIFIED"&&
    /^https:\/\/commons\.wikimedia\.org\/wiki\/File:/.test(row.source??"")&&
    /^https:\/\/upload\.wikimedia\.org\/wikipedia\/commons\//.test(row.image));
}
function info(a,img){
  if(!a||!img?.getAttribute?.("src"))return null;
  return {title:a.title,artist:a.artist,date:a.date??"",rights:a.license??a.rights??"",
    source:a.sourcePage,image:img.currentSrc||img.src};
}
// Exact Met originals with user-approved frame-free phone crops (2 November 2026).
export const C3_APPROVED_MET_PRAYER_ART=RELEASED_MODULE_PAINTINGS;
function approvedC3Artwork(page){
  if(page?.id==="adoration"||page?.route==="pray.adoration")return C3_APPROVED_MET_PRAYER_ART.adoration;
  if(page?.id==="confession"||page?.route==="pray.confession")return C3_APPROVED_MET_PRAYER_ART.confession;
  if(String(page?.id??"").startsWith("angelus."))return C3_APPROVED_MET_PRAYER_ART.angelus;
  return null;
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
      '<div class="aoC3PrayerArt" aria-hidden="true" data-c3-prayer-art="'+esc(s.id)+'">'+
        (approvedC3Artwork(s)?'<img class="aoC3ApprovedMetPhoto" src="'+esc(approvedC3Artwork(s).image)+'" alt="" loading="lazy" decoding="async" data-approved-module-art="true" '+(approvedC3Artwork(s)===C3_APPROVED_MET_PRAYER_ART.confession?'data-approved-nga-art="true"':'data-approved-met-art="true"')+'>':'')+'</div>'+
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
  // If the production Home renderer has already mounted an authoritative
  // dated painting, C3 must never re-select a competing Proper donor.
  const mounted=slot?.querySelector("img[data-ao-home-authoritative-date]");
  const authoritative=mounted?approved2026HomeArtwork(state,p):null;
  const selected=mounted?null:c3ApprovedDatedHomeArt(p,state);
  const gospelHero=mounted?null:(selected?null:releasedDateGospelHero2026(state,p));
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
      // C3 keeps the hero free of caption overlays: its existing discreet
      // artwork-info control reveals title, attribution, source and full image.
      slot.append(img);
      hero?.classList?.remove("aoTodayV2ArtMissing");
      datedPreview=selected;
      img.addEventListener("error",()=>{
        slot.replaceChildren();hero?.classList?.add("aoTodayV2ArtMissing");
        if(mainInfo){mainInfo.hidden=true;mainInfo.__c3Artwork=null;}
      },{once:true});
    }
  }
  if(gospelHero&&slot){
    // Exact 1962 selected Gospel + dated Proper; image already released for
    // Angelus under the Met CC0 source and the approved frameless display crop.
    slot.replaceChildren();
    const img=win.document.createElement("img");
    img.className="aoC3DatedImage";
    img.src=gospelHero.image;
    img.alt=gospelHero.title+" — "+gospelHero.artist;
    img.loading="eager";img.decoding="async";
    img.dataset.aoReleasedGospelDate=gospelHero.date;
    img.dataset.aoReleasedGospelArtwork=gospelHero.artworkId;
    slot.append(img);
    hero?.classList?.remove("aoTodayV2ArtMissing");
    img.addEventListener("error",()=>{
      slot.replaceChildren();
      hero?.classList?.add("aoTodayV2ArtMissing");
      if(mainInfo){mainInfo.hidden=true;mainInfo.__c3Artwork=null;}
    },{once:true});
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
    if(mainInfo&&authoritative){
      mainInfo.__c3Artwork={
        title:authoritative.title,artist:authoritative.artist,
        date:"",rights:authoritative.rights,
        source:authoritative.source,image:authoritative.infoImage
      };
      mainInfo.hidden=false;
    }else if(mainInfo&&datedPreview){
      mainInfo.__c3Artwork={title:datedPreview.title,artist:datedPreview.artist,
        date:"",rights:"Commons public-domain artwork preview (offline image not certified)",
        source:datedPreview.source,image:datedPreview.image};mainInfo.hidden=false;
    }else if(mainInfo&&gospelHero){
      mainInfo.__c3Artwork={title:gospelHero.title,artist:gospelHero.artist,
        date:"",rights:gospelHero.photographRights,
        source:gospelHero.source,image:gospelHero.original};
      mainInfo.hidden=false;
    }else if(mainInfo&&!selected&&cleanArt(a)){
      mainInfo.__c3Artwork=info(a,mainImg);mainInfo.hidden=false;
    }
  }
  // Only released, exact-route artwork appears in the Home Prayer carousel.
  for(const art of home.querySelectorAll("[data-c3-prayer-art]")){
    const name=art.dataset.c3PrayerArt;
    const data=approvedC3Artwork({id:name});
    const photo=art.querySelector("img[data-approved-module-art]");
    const infoButton=art.parentElement?.querySelector('[data-home-c3-info="prayer"]');
    if(!photo||!data||!infoButton)continue;
    infoButton.__c3Artwork={title:data.title,artist:data.artist,date:"",
      rights:data.photographRights+"; "+(name==="confession"?"full source displayed with contain fit":"approved frame-free display crop"),
      source:data.source,image:data.original};
    infoButton.hidden=false;
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
  return true;
}
function paintC3ArtInfoDialog(dlg,artwork){
  if(!artwork||!dlg?.querySelector)return false;
  const title=dlg.querySelector("[data-c3-art-title]");
  const metadata=dlg.querySelector("[data-c3-art-meta]");
  const image=dlg.querySelector("[data-c3-art-image]");
  const source=dlg.querySelector("[data-c3-art-source]");
  if(!title||!metadata||!image||!source)return false;
  title.textContent=artwork.title;
  metadata.textContent=[artwork.artist,artwork.date,artwork.rights].filter(Boolean).join(" · ");
  image.src=artwork.image;
  image.alt=artwork.artist+" — "+artwork.title;
  source.href=artwork.source;
  return true;
}
const releaseGalleryDialog=root=>root?.querySelector?.("[data-home-c3-art-dialog]")??null;
// Subject categories filter *only* the 16 photographs previously released.
// Nothing here publishes or infers photo approval for the nine pending works.
export const C3_RELEASED_ART_CATEGORY_CHOICES=Object.freeze(
 Object.entries(SACRED_ART_CATEGORIES_V1)
   .map(([id,label])=>({id,...label,count:SACRED_ART_RELEASED_GALLERY_V1.filter(w=>sacredArtReleasedPhotoClassification(w.moduleId)?.categoryIds.includes(id)).length}))
   .filter(w=>w.count>0)
   .map(w=>Object.freeze(w))
);
function visibleReleasedGalleryIndices(dialog){
 const category=dialog?.__c3GalleryCategory??"all";
 return SACRED_ART_RELEASED_GALLERY_V1.flatMap((photo,index)=>
   category==="all"||sacredArtReleasedPhotoClassification(photo.moduleId)?.categoryIds.includes(category)
    ?[index]:[]);
}

function showReleasedGalleryIndex(dlg,index){
  const entry=releasedGalleryAt(index);
  if(!dlg?.open||!entry)return false;
  const visible=visibleReleasedGalleryIndices(dlg);
  const position=visible.indexOf(index);
  if(position<0)return false;
  if(!paintC3ArtInfoDialog(dlg,{
    title:entry.title,artist:entry.artist,date:"",rights:entry.rights,
    image:entry.image,source:entry.source
  }))return false;
  dlg.__c3GalleryIndex=index;
  const taxonomy=sacredArtReleasedPhotoClassification(entry.moduleId);
  const scene=dlg.querySelector("[data-c3-art-scene]");
  if(scene){
    scene.textContent=taxonomy ? taxonomy.scene+" · "+taxonomy.categoryIds.map(c=>SACRED_ART_CATEGORIES_V1[c]?.en).filter(Boolean).join(" · ") : "";
    scene.hidden=!taxonomy;
  }
  const connections=dlg.querySelector("[data-c3-art-connections]");
  if(connections){
    const links=taxonomy?sacredArtCrossModuleLinks(taxonomy.id):null;
    const fr=dlg.ownerDocument?.documentElement?.lang?.startsWith("fr")??false;
    const rosaryNames={joy:"Joyful",sor:"Sorrowful",glo:"Glorious",lum:"Luminous"};
    const rosaryNamesFr={joy:"joyeux",sor:"douloureux",glo:"glorieux",lum:"lumineux"};
    const parts=[];
    if(links?.scripture.length)parts.push((fr?"Écriture : ":"Scripture: ")+links.scripture.map(x=>x.reference).join(", "));
    if(links?.rosary.length)parts.push((fr?"Rosaire : ":"Rosary: ")+links.rosary.map(x=>{
      const family=x.id.slice(0,3),n=x.id.slice(3);
      return fr?"mystère "+(rosaryNamesFr[family]??family)+" "+n:(rosaryNames[family]??family)+" mystery "+n;
    }).join(", "));
    if(links?.bibleAtlas.length)parts.push(fr?"Historia Salutis : scène correspondante":"Historia Salutis: corresponding scene");
    if(links?.mass.length)parts.push(fr?"Messe : lien théologique":"Mass: theological connection");
    if(links?.calendar.length)parts.push((fr?"Calendrier : ":"Calendar: ")+links.calendar.map(x=>x.date).join(", "));
    connections.textContent=parts.join(" · ");
    connections.hidden=!parts.length;
  }
  const nav=dlg.querySelector("[data-home-c3-gallery-nav]");
  if(nav)nav.hidden=false;
  const launcher=dlg.querySelector("[data-home-c3-gallery-launcher]");
  if(launcher)launcher.hidden=true;
  const counter=dlg.querySelector("[data-home-c3-gallery-counter]");
  if(counter)counter.textContent=(position+1)+" / "+visible.length;
  return true;
}
export function showC3ArtInfo(root,button){
  const a=button?.__c3Artwork,dlg=releaseGalleryDialog(root);
  if(!a||!dlg?.showModal)return false;
  if(!paintC3ArtInfoDialog(dlg,a))return false;
  dlg.__c3OriginalArtwork=a;
  dlg.__c3GalleryIndex=null;
  dlg.__c3GalleryCategory="all";
  const scene=dlg.querySelector("[data-c3-art-scene]");
  if(scene){scene.hidden=true;scene.textContent="";}
  const connections=dlg.querySelector("[data-c3-art-connections]");
  if(connections){connections.hidden=true;connections.textContent="";}
  const select=dlg.querySelector("[data-home-c3-gallery-category]");
  if(select)select.value="all";
  const launcher=dlg.querySelector("[data-home-c3-gallery-launcher]");
  if(launcher)launcher.hidden=SACRED_ART_RELEASED_GALLERY_V1.length===0;
  const nav=dlg.querySelector("[data-home-c3-gallery-nav]");
  if(nav)nav.hidden=true;
  if(!dlg.open)dlg.showModal();
  return true;
}
/** Gallery browsing is a deliberate action inside the existing artwork info
 * dialog. It reuses already-released photograph bytes, never candidate work.
 */
export function openC3ReleasedArtGallery(root){
  const dlg=releaseGalleryDialog(root);
  if(!dlg?.open||!dlg.__c3OriginalArtwork||SACRED_ART_RELEASED_GALLERY_V1.length===0)return false;
  dlg.__c3GalleryCategory="all";
  const select=dlg.querySelector("[data-home-c3-gallery-category]");
  if(select)select.value="all";
  const prior=releasedGalleryBySource(dlg.__c3OriginalArtwork.source);
  const index=prior?SACRED_ART_RELEASED_GALLERY_V1.findIndex(entry=>entry.id===prior.id):0;
  return showReleasedGalleryIndex(dlg,index);
}
export function filterC3ReleasedArtGallery(root,categoryId){
  const dlg=releaseGalleryDialog(root);
  if(!dlg?.open||!Number.isInteger(dlg.__c3GalleryIndex))return false;
  if(categoryId!=="all"&&!C3_RELEASED_ART_CATEGORY_CHOICES.some(c=>c.id===categoryId))return false;
  dlg.__c3GalleryCategory=categoryId;
  const visible=visibleReleasedGalleryIndices(dlg);
  if(!visible.length)return false;
  return showReleasedGalleryIndex(dlg,visible.includes(dlg.__c3GalleryIndex)?dlg.__c3GalleryIndex:visible[0]);
}
export function stepC3ReleasedArtGallery(root,direction){
  const dlg=releaseGalleryDialog(root);
  if(!dlg?.open||!Number.isInteger(dlg.__c3GalleryIndex)||
     !Number.isInteger(direction)||![1,-1].includes(direction)||
     SACRED_ART_RELEASED_GALLERY_V1.length===0)return false;
  const visible=visibleReleasedGalleryIndices(dlg);
  const pos=visible.indexOf(dlg.__c3GalleryIndex);
  if(pos<0||visible.length===0)return false;
  return showReleasedGalleryIndex(dlg,visible[(pos+direction+visible.length)%visible.length]);
}
export function returnFromC3ReleasedArtGallery(root){
  const dlg=releaseGalleryDialog(root);
  if(!dlg?.open||!dlg.__c3OriginalArtwork||
     !Number.isInteger(dlg.__c3GalleryIndex))return false;
  if(!paintC3ArtInfoDialog(dlg,dlg.__c3OriginalArtwork))return false;
  dlg.__c3GalleryIndex=null;
  dlg.__c3GalleryCategory="all";
  const scene=dlg.querySelector("[data-c3-art-scene]");
  if(scene){scene.hidden=true;scene.textContent="";}
  const connections=dlg.querySelector("[data-c3-art-connections]");
  if(connections){connections.hidden=true;connections.textContent="";}
  const nav=dlg.querySelector("[data-home-c3-gallery-nav]");
  if(nav)nav.hidden=true;
  const launcher=dlg.querySelector("[data-home-c3-gallery-launcher]");
  if(launcher)launcher.hidden=false;
  return true;
}
export function closeC3ArtInfo(root){
  const dlg=releaseGalleryDialog(root);
  if(!dlg?.open)return false;
  dlg.close();
  dlg.__c3OriginalArtwork=null;
  dlg.__c3GalleryIndex=null;
  dlg.__c3GalleryCategory="all";
  return true;
}
