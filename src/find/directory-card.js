// Exact-identity, approved-media-only Traditional Mass venue cards.
import { massInstitutionEmblem } from "./institution-emblems.js";
const E=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
const A=v=>Array.isArray(v)?v:[];
const L=(lang,en,fr)=>lang==="fr"?fr:en;
const path=/^assets\/approved\/(?:place-media|place-gallery)\/[A-Za-z0-9_-]+\.webp$/;
const licenses=new Set(["PUBLIC_DOMAIN","CC0","CC-BY-4.0","CC-BY-SA-2.0","CC-BY-SA-3.0","CC-BY-SA-4.0"]);
const https=x=>/^https:\/\/[^\s<>"']+$/.test(String(x??""));

export function eligibleDirectoryImage(img,placeId){
  return Boolean(img&&img.place_id===placeId&&img.status==="APPROVED"&&
    path.test(String(img.asset_path??""))&&licenses.has(String(img.license??""))&&
    https(img.license_url)&&https(img.source_url)&&
    img.rights_verified===true&&img.subject_verified===true&&img.crop_reviewed===true&&
    /^[a-f0-9]{64}$/i.test(String(img.derivative_sha256??""))&&
    String(img.credit??"").trim()&&String(img.alt_en??"").trim()&&String(img.alt_fr??"").trim());
}

// TLM uses a lightweight map loader. These three small, existing registries
// provide approved media without downloading the entire Explore data corpus.
const MEDIA_URLS=Object.freeze({
  places:new URL("../../data/geography/seed-registry.v1.json",import.meta.url).href,
  approved:new URL("../../data/geography/approved-place-media.v1.json",import.meta.url).href,
  gallery:new URL("../../data/geography/approved-place-gallery.v1.json",import.meta.url).href,
});
export async function loadDirectoryCardMedia({fetchImpl=fetch}={}){
  const json=async url=>{
    try{
      const response=await fetchImpl(url,{headers:{accept:"application/json"}});
      return response?.ok?await response.json():null;
    }catch{return null;}
  };
  const [places,images,galleries]=await Promise.all([
    json(MEDIA_URLS.places),json(MEDIA_URLS.approved),json(MEDIA_URLS.gallery),
  ]);
  return Object.freeze({
    directoryPlaceLinks:places?.schema==="EXPLORE_GEOGRAPHY_SEED_V1"?A(places.directoryPlaceLinks):[],
    approved:images?.schema==="AO_APPROVED_PLACE_MEDIA_V1"?A(images.items):[],
    gallery:galleries?.schema==="AO_APPROVED_PLACE_GALLERY_V1"?A(galleries.items):[],
  });
}

// Source identity must be an exact, confirmed LOCATED_AT relation.
// Never infer a Place from similar names, nearby provisional pins or an image query.
export function attachApprovedDirectoryMedia(items,{directoryPlaceLinks=[],approved=[],gallery=[]}={}){
  const exact=new Map();
  for(const link of A(directoryPlaceLinks)){
    if(link?.confidence!=="CONFIRMED"||link?.relationship!=="LOCATED_AT"||!link?.venue_id||!link?.place_id)continue;
    if(exact.has(link.venue_id)&&exact.get(link.venue_id)!==link.place_id)exact.set(link.venue_id,null);
    else if(!exact.has(link.venue_id))exact.set(link.venue_id,link.place_id);
  }
  return A(items).map(item=>{
    if(item?.kind!=="TLM_VENUE")return item;
    const placeId=exact.get(item.source_id);
    if(!placeId)return item;
    const covers=A(approved).filter(img=>eligibleDirectoryImage(img,placeId));
    const photos=A(gallery).filter(img=>eligibleDirectoryImage(img,placeId));
    if(!covers.length&&!photos.length)return item;
    return {...item,place_id:placeId,cover_media:covers[0]??photos[0],gallery_media:photos};
  });
}
const inlineIcon=(role)=>{
  const paths={
    place:'<path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
    schedule:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18"/><path d="M12 13v4l2 1"/>',
  };
  const shape=paths[role];return shape?'<svg class="aoTlmVenueIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+shape+'</svg>':"";
};
const churchGlyph='<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 54h44M15 54V29l17-13 17 13v25M25 54V39a7 7 0 0 1 14 0v15M32 9V3M26 9h12M16 31h32"/><path d="M22 34h3m14 0h3"/></svg>';

export function renderDirectoryVenueCard(item,language="en"){
  const img=item?.cover_media;
  const photo=Boolean(img&&eligibleDirectoryImage(img,item.place_id));
  const emblem=massInstitutionEmblem(item?.community_id);
  const sources=A(item?.source_links).filter(s=>https(s?.url)).length;
  const status=String(item?.status??"");
  const provisional=Boolean(item?.preliminary_group)||item?.map_state==="PROVISIONAL"||
    ["SOURCE-REPORTED","UNCLASSIFIED","SCHEDULE UNVERIFIED","OFFICIAL · TIMES UNCONFIRMED"].includes(status);
  const schedule=L(language,provisional?"Mass times not independently verified":A(item?.sections).length?"Mass details available · check official source":"Mass times not verified",
    provisional?"Horaires non vérifiés indépendamment":A(item?.sections).length?"Horaires disponibles · vérifier à la source":"Horaires non vérifiés");
  return '<button type="button" class="aoFindCard aoExploreCard aoTlmVenueCard" data-explore-item="'+E(item.item_id)+'" data-explore-lens="tlm">'
    +'<span class="aoTlmVenueVisual">'
    +(photo?'<img loading="lazy" decoding="async" src="'+E(img.asset_path)+'" alt="'+E(language==="fr"?img.alt_fr:img.alt_en)+'">':'<span class="aoTlmVenueGlyph">'+churchGlyph+'</span>')
    +'</span><span class="aoTlmVenueContent"><span class="aoTlmVenueInstitution">'
    +(emblem?'<img src="'+E(emblem.image)+'" alt="" loading="lazy" decoding="async">':'')
    +'<span>'+E(item.eyebrow||item.community_id||L(language,"Church / chapel","Église / chapelle"))+'</span></span>'
    +'<strong class="aoTlmVenueTitle">'+E(item.title||L(language,"Unnamed venue","Lieu sans nom"))+'</strong>'
    +'<span class="aoTlmVenueLocality">'+inlineIcon('place')+'<span>'+E(item.subtitle||"")+'</span></span>'
    +'<span class="aoTlmVenueSchedule">'+inlineIcon('schedule')+'<span>'+E(schedule)+'</span></span>'
    +(status?'<span class="aoTlmVenueStatus">'+E(status==="SCHEDULE UNVERIFIED"?L(language,"SCHEDULE UNVERIFIED","HORAIRES NON VÉRIFIÉS"):status==="OFFICIAL · TIMES UNCONFIRMED"?L(language,"OFFICIAL · TIMES UNCONFIRMED","OFFICIEL · HORAIRES NON CONFIRMÉS"):status)+'</span>':'')
    +'<span class="aoTlmVenueFoot"><small>'+E(sources?L(language,"Source-backed listing","Fiche sourcée"):L(language,"Source review pending","Sources en cours d’examen"))+'</small><span>'+E(L(language,"View church","Voir l’église"))+' <span aria-hidden="true">→</span></span></span>'
    +'</span></button>';
}
// Full venue galleries consume only already-approved, exact-place photos.
// A source's media_role is optional; never infer interior/exterior from a title.
export function renderDirectoryGallery(item,language="en"){
  if(item?.kind!=="TLM_VENUE"||!item.place_id)return "";
  const seen=new Set([item?.cover_media?.asset_path].filter(Boolean));
  const photos=A(item.gallery_media).filter(img=>{
    if(!eligibleDirectoryImage(img,item.place_id)||seen.has(img.asset_path))return false;
    seen.add(img.asset_path);return true;
  });
  if(!photos.length)return "";
  const names={
    EXTERIOR:L(language,"Exterior","Extérieur"),
    INTERIOR:L(language,"Interior","Intérieur"),
    SACRED_DETAIL:L(language,"Sacred detail","Détail sacré"),
  };
  return '<section class="aoTlmPhotoGallery" aria-label="'+E(L(language,"Church photographs","Photographies de l’église"))+'">'
    +'<h3>'+E(L(language,"Discover this church","Découvrir cette église"))+'</h3>'
    +'<div class="aoTlmGalleryGrid">'
    +photos.map(img=>'<figure><img loading="lazy" decoding="async" src="'+E(img.asset_path)+'" alt="'+E(language==="fr"?img.alt_fr:img.alt_en)+'">'
      +'<figcaption><strong>'+E(names[img.media_role]||img["label_"+language]||img.label_en||L(language,"Church photograph","Photographie de l’église"))+'</strong>'
      +'<small>'+E(img.credit)+' · '+E(img.license)+'</small>'
      +'<a href="'+E(img.source_url)+'" target="_blank" rel="noopener noreferrer">'+E(L(language,"Photo source","Source de la photo"))+'</a>'
      +'</figcaption></figure>').join("")
    +'</div></section>';
}
export const DIRECTORY_CARD_STYLE = ".aoFindList .aoTlmVenueCard{display:grid;grid-template-columns:116px minmax(0,1fr);align-items:stretch;gap:0;padding:0;overflow:hidden;min-height:174px;border-radius:16px;background:linear-gradient(145deg,#162633,#0d151f);border:1px solid rgba(217,197,154,.23);transition:border-color .15s ease,transform .15s ease}\n.aoFindList .aoTlmVenueCard:hover{border-color:rgba(217,197,154,.64);transform:translateY(-1px)}\n.aoFindList .aoTlmVenueCard:focus-visible{outline:2px solid #d9c59a;outline-offset:3px}\n.aoTlmVenueVisual{display:flex;align-items:center;justify-content:center;min-height:174px;background:linear-gradient(150deg,#294252,#15242f);overflow:hidden}\n.aoTlmVenueVisual>img{width:100%;height:100%;object-fit:contain;object-position:center;display:block}\n.aoTlmVenueGlyph{display:grid;place-items:center;width:76px;height:76px;color:#b9a57b;opacity:.75}\n.aoTlmVenueGlyph svg{width:100%;height:100%}\n.aoTlmVenueContent{display:flex;flex-direction:column;gap:6px;padding:14px 14px 12px;min-width:0}\n.aoTlmVenueInstitution{display:flex;gap:7px;align-items:center;font:650 10px/1.25 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.055em;color:#d0b78b}\n.aoTlmVenueInstitution img{width:23px;height:23px;object-fit:contain;flex:none}\n.aoFindList .aoTlmVenueTitle{font:600 19px/1.15 var(--ao-font-display,Georgia,serif);margin:0;color:#f3e8d8;overflow-wrap:anywhere}\n.aoTlmVenueLocality{font:500 12px/1.3 var(--ao-font-ui,system-ui,sans-serif);color:#adc0c9}\n.aoTlmVenueSchedule{margin-top:4px;font:500 12px/1.35 var(--ao-font-ui,system-ui,sans-serif);color:#d7d1c4}\n.aoTlmVenueFoot{display:flex;justify-content:space-between;gap:8px;margin-top:auto;padding-top:9px;border-top:1px solid #ccb17d20;color:#e1c590;font:650 11px/1.3 var(--ao-font-ui,system-ui,sans-serif)}\n.aoTlmVenueFoot small{font:500 10px/1.3 var(--ao-font-ui,system-ui,sans-serif);color:#92a5ab}\n@media(max-width:420px){.aoFindList .aoTlmVenueCard{grid-template-columns:100px minmax(0,1fr);min-height:168px}.aoTlmVenueVisual{min-height:168px}.aoTlmVenueContent{padding:12px 11px;gap:6px}.aoFindList .aoTlmVenueTitle{font-size:17px}.aoTlmVenueFoot small{font-size:9px}}\n@media(prefers-reduced-motion:reduce){.aoFindList .aoTlmVenueCard{transition:none}}\n.aoTlmPreviewPhoto{display:block;width:100%;height:156px;object-fit:contain;background:#0b141e;border-radius:11px;margin:8px 0 4px}\n.aoTlmPreviewPhotoCredit{display:block;color:#adbdc6;font:500 10px/1.4 var(--ao-font-ui,system-ui,sans-serif);margin:0 0 8px}\n.aoTlmPreviewPhotoCredit a,.aoTlmDetailPhoto figcaption a{color:#d8c18f;text-decoration:underline;text-underline-offset:2px}\n.aoTlmDetailPhoto{margin:7px 0 16px}.aoTlmDetailPhoto img{display:block;width:100%;max-height:300px;object-fit:contain;background:#0b141e;border-radius:10px}\n.aoTlmDetailPhoto figcaption{font:500 10px/1.4 var(--ao-font-ui,system-ui,sans-serif);color:#a9a08e;margin-top:6px}\n.aoTlmVenueLocality,.aoTlmVenueSchedule{display:flex;gap:7px;align-items:flex-start}\n.aoTlmVenueIcon{width:15px;height:15px;flex:none;display:block;opacity:.85}\n.aoTlmVenueLocality .aoTlmVenueIcon{color:#9bbac8}\n.aoTlmVenueSchedule .aoTlmVenueIcon{color:#c8b17d}\n.aoTlmPhotoGallery{margin:16px 0 20px}\n.aoTlmPhotoGallery h3{margin:4px 0 12px;color:#f1e6d2;font:600 20px/1.25 var(--ao-font-display,Georgia,serif)}\n.aoTlmGalleryGrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,190px),1fr));gap:12px}\n.aoTlmGalleryGrid figure{margin:0;min-width:0;border:1px solid #cab27d33;border-radius:12px;overflow:hidden;background:#131f2a}\n.aoTlmGalleryGrid img{display:block;width:100%;height:160px;object-fit:contain;background:#09141f}\n.aoTlmGalleryGrid figcaption{display:grid;gap:5px;padding:9px 11px;font:500 11px/1.3 var(--ao-font-ui,system-ui,sans-serif)}\n.aoTlmGalleryGrid figcaption strong{color:#e8dbbd;font:600 13px/1.25 var(--ao-font-ui,system-ui,sans-serif)}\n.aoTlmGalleryGrid figcaption small{color:#9caeb6;font-size:10px}\n.aoTlmGalleryGrid figcaption a{color:#d8c18f;text-decoration:underline;text-underline-offset:3px;min-height:26px}\n.aoTlmVenueStatus{font:600 10px/1.25 var(--ao-font-ui,system-ui,sans-serif);color:#c5b083;letter-spacing:.05em}";
