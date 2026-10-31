// Exact-identity, approved-media-only Traditional Mass venue cards.
import { massInstitutionEmblem } from "./institution-emblems.js";
const E=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
const A=v=>Array.isArray(v)?v:[];
const L=(lang,en,fr)=>lang==="fr"?fr:en;
const groupLabel=(id,lang)=>{
 const codes={
  CANONS_ST_JOHN_CANTIUS:["Canons of St John Cantius","Chanoines de Saint-Jean-de-Cantius"],
  SSPX_SISTERS:["SSPX Sisters","Sœurs FSSPX"],
  BENEDICTINE:["Benedictines","Bénédictins"],
 };
 const code=String(id??"");
 return codes[code]?.[lang==="fr"?1:0]||
   code.replaceAll("_"," ").toLowerCase().replace(/\b\p{L}/gu,c=>c.toUpperCase());
};
const path=/^assets\/approved\/(?:place-media|place-gallery)\/[A-Za-z0-9_-]+\.webp$/;
// The credit's license label and URL must identify the same grant.
// Keep the approved gallery's CC-BY-3.0 support without weakening release flags.
const licenseUrls=Object.freeze({
  "PUBLIC_DOMAIN":"https://creativecommons.org/publicdomain/mark/1.0/",
  "CC0-1.0":"https://creativecommons.org/publicdomain/zero/1.0/",
  "CC-BY-2.0":"https://creativecommons.org/licenses/by/2.0/",
  "CC-BY-2.5":"https://creativecommons.org/licenses/by/2.5/",
  "CC-BY-3.0":"https://creativecommons.org/licenses/by/3.0/",
  "CC-BY-4.0":"https://creativecommons.org/licenses/by/4.0/",
  "CC-BY-SA-2.0":"https://creativecommons.org/licenses/by-sa/2.0/",
  "CC-BY-SA-2.5":"https://creativecommons.org/licenses/by-sa/2.5/",
  "CC-BY-SA-3.0":"https://creativecommons.org/licenses/by-sa/3.0/",
  "CC-BY-SA-4.0":"https://creativecommons.org/licenses/by-sa/4.0/",
});
const https=x=>/^https:\/\/[^\s<>"']+$/.test(String(x??""));

export function eligibleDirectoryImage(img,placeId){
  return Boolean(img&&img.place_id===placeId&&img.status==="APPROVED"&&
    path.test(String(img.asset_path??""))&&
    licenseUrls[String(img.license??"")]===String(img.license_url??"")&&
    https(img.source_url)&&
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
    // An exact canonical Place link exists even before its photo passes rights review.
    // Preserve the link for the Directory/Explore model without publishing any unapproved media.
    if(!covers.length&&!photos.length)return {...item,place_id:placeId};
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

// Only source-matched, approved photographs outrank a venue's visual fallback.
// An institution's emblem identifies its Mass ministry, never church ownership.
const namedSourceMark=(value)=>{
 const tokens=String(value??"").replace(/[^A-Za-zÀ-ÿ0-9 ]+/g," ").split(/\s+/).filter(Boolean);
 const first=tokens.filter(t=>!/^(de|des|du|of|the|la|le|les|and|et|saint|st)$/i.test(t));
 // Typographic initials, never an imitation heraldic crest or logo.
 return (first.length?first:tokens).slice(0,2).map(t=>t[0]?.toLocaleUpperCase()).join("")||"•";
};
export function renderDirectoryIdentityFallback(item,language="en",variant="card"){
  const group=String(item?.community_id??"").toUpperCase();
  const emblem=massInstitutionEmblem(group);
  const sourceLabel=String(item?.eyebrow??"").trim();
  const sourceIsNamed=Boolean(sourceLabel)&&!(/^(other|unknown|unclassified(?:\s*\(.*\))?|affiliation unverified|friendly community\s*[-—]\s*unclassified)$/i.test(sourceLabel));
  const useNamed=Boolean(!emblem&&sourceIsNamed&&group!=="DIOCESAN"&&group!=="DIOCESAN_UNSPECIFIED");
  const label=useNamed?sourceLabel:
    emblem?.label||(group==="DIOCESAN"||group==="DIOCESAN_UNSPECIFIED"
    ?L(language,"Diocesan church","Église diocésaine")
    :L(language,"Church / chapel","Église / chapelle"));
  const mode=["card","preview","detail"].includes(variant)?variant:"card";
  // Names are explicit source labels; neither a monogram nor a logo establishes
  // a building's operator, status, rite or individual Mass's Una Cum.
  return '<span class="aoTlmVenueIdentity aoTlmVenueIdentity--'+mode+'" data-visual-kind="'+(emblem?"emblem":useNamed?"named":"neutral")+'">'+
    (emblem?'<img src="'+E(emblem.image)+'" alt="" loading="lazy" decoding="async">':
      useNamed?'<span class="aoTlmVenueNamedMark" aria-hidden="true">'+E(namedSourceMark(sourceLabel))+'</span>':
        '<span class="aoTlmVenueGlyph">'+churchGlyph+'</span>')+
    '<small>'+E(useNamed?L(language,"Listed as: ","Selon la source : ")+label:label)+'</small></span>';
}

export function renderDirectoryVenueCard(item,language="en"){
  const img=item?.cover_media;
  const photo=Boolean(img&&eligibleDirectoryImage(img,item.place_id));
  // A large fallback emblem does not need a duplicate small badge.
  // Holy See arms are not an identity for an individual diocesan church.
  const emblem=photo&&String(item?.community_id??"").toUpperCase()!=="DIOCESAN"
    ?massInstitutionEmblem(item?.community_id):null;
  const sources=A(item?.source_links).filter(s=>https(s?.url)).length;
  const status=String(item?.status??"");
  const provisional=Boolean(item?.preliminary_group)||item?.map_state==="PROVISIONAL"||
    ["SOURCE-REPORTED","UNCLASSIFIED","SCHEDULE UNVERIFIED","OFFICIAL · TIMES UNCONFIRMED"].includes(status);
  const schedule=L(language,provisional?"Mass times not independently verified":A(item?.sections).length?"Mass details available · check official source":"Mass times not verified",
    provisional?"Horaires non vérifiés indépendamment":A(item?.sections).length?"Horaires disponibles · vérifier à la source":"Horaires non vérifiés");
  return '<button type="button" class="aoFindCard aoExploreCard aoTlmVenueCard" data-explore-item="'+E(item.item_id)+'" data-explore-lens="tlm">'
    +'<span class="aoTlmVenueVisual" data-visual-kind="'+(photo?"photo":"fallback")+'">'
    +(photo?'<img loading="lazy" decoding="async" src="'+E(img.asset_path)+'" alt="'+E(language==="fr"?img.alt_fr:img.alt_en)+'">':renderDirectoryIdentityFallback(item,language,"card"))
    +'</span><span class="aoTlmVenueContent"><span class="aoTlmVenueInstitution">'
    +(emblem?'<img src="'+E(emblem.image)+'" alt="" loading="lazy" decoding="async">':'')
    +'<span>'+E(item.eyebrow||groupLabel(item.community_id,language)||L(language,"Church / chapel","Église / chapelle"))+'</span></span>'
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
      +'<small>'+E(img.credit)+' · <a href="'+E(img.license_url)+'" target="_blank" rel="noopener noreferrer">'+E(img.license)+'</a></small>'
      +'<a href="'+E(img.source_url)+'" target="_blank" rel="noopener noreferrer">'+E(L(language,"Photo source","Source de la photo"))+'</a>'
      +'</figcaption></figure>').join("")
    +'</div></section>';
}
const DIRECTORY_NAMED_IDENTITY_STYLE=String.raw`
.aoTlmVenueNamedMark{width:69px;height:69px;display:grid;place-items:center;flex:none;border:1px solid rgba(222,195,144,.44);border-radius:50%;background:linear-gradient(140deg,#263e4c,#15232e);font:600 26px/1 var(--ao-font-display,Georgia,serif);letter-spacing:.04em;color:#ead8b5}
.aoTlmVenueIdentity--card .aoTlmVenueNamedMark{width:59px;height:59px;font-size:22px}
.aoTlmVenueIdentity--detail .aoTlmVenueNamedMark,.aoTlmVenueIdentity--preview .aoTlmVenueNamedMark{width:78px;height:78px;font-size:29px}
.aoTlmVenueIdentity[data-visual-kind="named"] small{text-transform:none;letter-spacing:.01em;font:600 12px/1.38 var(--ao-font-ui,system-ui,sans-serif);color:#dfd0b3}
@media(max-width:420px){.aoTlmVenueIdentity--card .aoTlmVenueNamedMark{width:50px;height:50px;font-size:19px}.aoTlmVenueIdentity--card[data-visual-kind="named"] small{font-size:10px}}
`;
const DIRECTORY_VISUAL_FALLBACK_STYLE = "\n.aoTlmVenueIdentity{width:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:9px;box-sizing:border-box;text-align:center;color:#dac39a}\n.aoTlmVenueIdentity img{display:block;width:75%;max-width:92px;height:87px;object-fit:contain}\n.aoTlmVenueIdentity .aoTlmVenueGlyph{width:68px;height:68px}\n.aoTlmVenueIdentity small{max-width:100%;padding:0 8px;font:650 10px/1.3 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.055em;text-transform:uppercase;color:#dac39a;overflow-wrap:anywhere}\n.aoTlmVenueIdentity--preview,.aoTlmVenueIdentity--detail{min-height:160px;border:1px solid rgba(217,197,154,.18);border-radius:11px;background:linear-gradient(150deg,#24394a,#0d1924);margin:8px 0 10px}\n.aoTlmVenueIdentity--preview img,.aoTlmVenueIdentity--detail img{max-width:140px;height:110px}\n.aoTlmVenueIdentity--detail{min-height:200px}\n.aoTlmVenueIdentity--detail img{max-width:170px;height:145px}\n@media(max-width:420px){.aoTlmVenueIdentity--card img{max-width:76px;height:70px}.aoTlmVenueIdentity--card small{font-size:9px}}\n";

const DIRECTORY_PREVIEW_EDITORIAL_STYLE=String.raw`
.aoTlmPreviewPhotographic{position:relative;margin:8px 0 3px;overflow:visible}
.aoTlmPreviewPhotographic .aoTlmPreviewPhoto{height:190px;max-height:31dvh;margin:0;object-fit:contain;object-position:center;background:#0b141e;border-radius:11px}
.aoTlmPreviewEmblem{position:absolute;right:12px;bottom:11px;display:grid;place-items:center;width:52px;height:52px;padding:7px;box-sizing:border-box;border:1px solid rgba(222,198,150,.45);border-radius:12px;background:rgba(18,27,37,.93);box-shadow:0 4px 15px #0008}
.aoTlmPreviewEmblem img{display:block;max-width:100%;max-height:100%;object-fit:contain}
.aoTlmPreviewPhotoCredit{display:block;margin:2px 0 8px;color:#a8b6b9;font:500 10px/1.5 var(--ao-font-ui,system-ui,sans-serif)}
.aoTlmPreviewPhotoCredit summary{cursor:pointer;list-style:none;min-height:27px;display:flex;align-items:center;color:#b9c1c0}
.aoTlmPreviewPhotoCredit summary::-webkit-details-marker{display:none}
.aoTlmPreviewPhotoCredit summary:focus-visible{outline:2px solid #d9c59a;outline-offset:2px}
.aoTlmPreviewPhotoCredit>div{padding:3px 0 5px}
@media(max-width:359px){.aoTlmPreviewPhotographic .aoTlmPreviewPhoto{height:145px}.aoTlmPreviewEmblem{width:44px;height:44px}}
`;
export const DIRECTORY_CARD_STYLE = ".aoFindList .aoTlmVenueCard{display:grid;grid-template-columns:116px minmax(0,1fr);align-items:stretch;gap:0;padding:0;overflow:hidden;min-height:174px;border-radius:16px;background:linear-gradient(145deg,#162633,#0d151f);border:1px solid rgba(217,197,154,.23);transition:border-color .15s ease,transform .15s ease}\n.aoFindList .aoTlmVenueCard:hover{border-color:rgba(217,197,154,.64);transform:translateY(-1px)}\n.aoFindList .aoTlmVenueCard:focus-visible{outline:2px solid #d9c59a;outline-offset:3px}\n.aoTlmVenueVisual{display:flex;align-items:center;justify-content:center;min-height:174px;background:linear-gradient(150deg,#294252,#15242f);overflow:hidden}\n.aoTlmVenueVisual>img{width:100%;height:100%;object-fit:contain;object-position:center;display:block}\n.aoTlmVenueGlyph{display:grid;place-items:center;width:76px;height:76px;color:#b9a57b;opacity:.75}\n.aoTlmVenueGlyph svg{width:100%;height:100%}\n.aoTlmVenueContent{display:flex;flex-direction:column;gap:6px;padding:14px 14px 12px;min-width:0}\n.aoTlmVenueInstitution{display:flex;gap:7px;align-items:center;font:650 10px/1.25 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.055em;color:#d0b78b}\n.aoTlmVenueInstitution img{width:23px;height:23px;object-fit:contain;flex:none}\n.aoFindList .aoTlmVenueTitle{font:600 19px/1.15 var(--ao-font-display,Georgia,serif);margin:0;color:#f3e8d8;overflow-wrap:anywhere}\n.aoTlmVenueLocality{font:500 12px/1.3 var(--ao-font-ui,system-ui,sans-serif);color:#adc0c9}\n.aoTlmVenueSchedule{margin-top:4px;font:500 12px/1.35 var(--ao-font-ui,system-ui,sans-serif);color:#d7d1c4}\n.aoTlmVenueFoot{display:flex;justify-content:space-between;gap:8px;margin-top:auto;padding-top:9px;border-top:1px solid #ccb17d20;color:#e1c590;font:650 11px/1.3 var(--ao-font-ui,system-ui,sans-serif)}\n.aoTlmVenueFoot small{font:500 10px/1.3 var(--ao-font-ui,system-ui,sans-serif);color:#92a5ab}\n@media(max-width:420px){.aoFindList .aoTlmVenueCard{grid-template-columns:100px minmax(0,1fr);min-height:168px}.aoTlmVenueVisual{min-height:168px}.aoTlmVenueContent{padding:12px 11px;gap:6px}.aoFindList .aoTlmVenueTitle{font-size:17px}.aoTlmVenueFoot small{font-size:9px}}\n@media(prefers-reduced-motion:reduce){.aoFindList .aoTlmVenueCard{transition:none}}\n.aoTlmPreviewPhoto{display:block;width:100%;height:156px;object-fit:contain;background:#0b141e;border-radius:11px;margin:8px 0 4px}\n.aoTlmPreviewPhotoCredit{display:block;color:#adbdc6;font:500 10px/1.4 var(--ao-font-ui,system-ui,sans-serif);margin:0 0 8px}\n.aoTlmPreviewPhotoCredit a,.aoTlmDetailPhoto figcaption a{color:#d8c18f;text-decoration:underline;text-underline-offset:2px}\n.aoTlmDetailPhoto{margin:7px 0 16px}.aoTlmDetailPhoto img{display:block;width:100%;max-height:300px;object-fit:contain;background:#0b141e;border-radius:10px}\n.aoTlmDetailPhoto figcaption{font:500 10px/1.4 var(--ao-font-ui,system-ui,sans-serif);color:#a9a08e;margin-top:6px}\n.aoTlmVenueLocality,.aoTlmVenueSchedule{display:flex;gap:7px;align-items:flex-start}\n.aoTlmVenueIcon{width:15px;height:15px;flex:none;display:block;opacity:.85}\n.aoTlmVenueLocality .aoTlmVenueIcon{color:#9bbac8}\n.aoTlmVenueSchedule .aoTlmVenueIcon{color:#c8b17d}\n.aoTlmPhotoGallery{margin:16px 0 20px}\n.aoTlmPhotoGallery h3{margin:4px 0 12px;color:#f1e6d2;font:600 20px/1.25 var(--ao-font-display,Georgia,serif)}\n.aoTlmGalleryGrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,190px),1fr));gap:12px}\n.aoTlmGalleryGrid figure{margin:0;min-width:0;border:1px solid #cab27d33;border-radius:12px;overflow:hidden;background:#131f2a}\n.aoTlmGalleryGrid img{display:block;width:100%;height:160px;object-fit:contain;background:#09141f}\n.aoTlmGalleryGrid figcaption{display:grid;gap:5px;padding:9px 11px;font:500 11px/1.3 var(--ao-font-ui,system-ui,sans-serif)}\n.aoTlmGalleryGrid figcaption strong{color:#e8dbbd;font:600 13px/1.25 var(--ao-font-ui,system-ui,sans-serif)}\n.aoTlmGalleryGrid figcaption small{color:#9caeb6;font-size:10px}\n.aoTlmGalleryGrid figcaption a{color:#d8c18f;text-decoration:underline;text-underline-offset:3px;min-height:26px}\n.aoTlmVenueStatus{font:600 10px/1.25 var(--ao-font-ui,system-ui,sans-serif);color:#c5b083;letter-spacing:.05em}"+DIRECTORY_VISUAL_FALLBACK_STYLE+DIRECTORY_PREVIEW_EDITORIAL_STYLE+DIRECTORY_NAMED_IDENTITY_STYLE;
