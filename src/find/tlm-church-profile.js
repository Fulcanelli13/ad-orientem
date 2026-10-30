/** Expanded TLM church profile: source-first, ministry-aware, never building-wide ecclesial guesses.
 * Uses the canonical Directory venue/ministry/schedule join and approved Place imagery.
 * Read-only presentation: no duplicate Place, schedule or ecclesial assertion registry.
 */
import {massInstitutionEmblem} from "./institution-emblems.js";
import {eligibleDirectoryImage,renderDirectoryGallery,renderDirectoryIdentityFallback} from "./directory-card.js";
const A=v=>Array.isArray(v)?v:[];
const T=v=>String(v??"").trim();
const E=v=>T(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
const L=(language,en,fr)=>language==="fr"?fr:en;
const https=v=>/^https:\/\/[^\s<>"']+$/i.test(T(v));
const values=v=>A(v).map(T).filter(Boolean);
const unknown=lang=>L(lang,"Not established","Non établi");
const human=(v)=>T(v).replaceAll("_"," ").replace(/\s+/g," ");
const codes=Object.freeze({
 ROMAN:"Roman",DOMINICAN:"Dominican",CARMELITE:"Carmelite",
 AMBROSIAN:"Ambrosian",PREMONSTRATENSIAN:"Premonstratensian",
 SARUM:"Sarum",MOZARABIC:"Mozarabic",
});
const position=Object.freeze({
 ROMAN_PONTIFF_RECOGNISED:["Recognises the Roman Pontiff","Reconnaît le Pontife romain"],
 SEDEVACANTIST:["Sedevacantist","Sédévacantiste"],
 SEDEPRIVATIONIST:["Sedeprivationist","Sédéprivationniste"],
 OTHER_POSITION:["Other stated position","Autre position déclarée"],
});
const translateCode=(v,lang)=>T(v)==="UNKNOWN"||!T(v)?unknown(lang):human(v);
const dated=d=>/^\d{4}-\d{2}-\d{2}/.test(T(d))?T(d).slice(0,10):null;
const isUnavailable=item=>["DIRECTORY_LISTED_UNVERIFIED","OFFICIAL_LISTED_MASS_TIMES_UNCONFIRMED"].includes(T(item?.raw?.venue?.publication_state))
 ||["SCHEDULE UNVERIFIED","OFFICIAL · TIMES UNCONFIRMED"].includes(T(item?.status));
function minIdentity(ministry,language){
 const profile=ministry?.communityProfile?.communionProfile;
 const direct=T(ministry?.upstream?.una_cum_status_raw).toUpperCase().replaceAll("-","_");
 const explicit=({YES:"Yes",NO:"No",VARIES:"Varies",DISPUTED:"Disputed",
  UNA_CUM:"Yes",NON_UNA_CUM:"No"})[direct]??null;
 return Object.freeze({
  community:T(ministry?.external_community_name)||T(ministry?.community_id)||unknown(language),
  relationship:T(ministry?.relationship)||null,
  unaCum:explicit?L(language,explicit,({Yes:"Oui",No:"Non",Varies:"Variable",Disputed:"Contesté"})[explicit]):unknown(language),
  unaCumBasis:explicit?L(language,"Recorded for this ministry","Consigné pour ce ministère"):
    L(language,"A community's position does not establish each Mass's una-cum status",
      "La position d'une communauté ne détermine pas le caractère una cum de chaque messe"),
  recognises:profile?.recognises_current_pontiff&&profile.recognises_current_pontiff!=="UNKNOWN"?
    (profile.recognises_current_pontiff==="YES"?L(language,"Yes","Oui"):L(language,"No","Non")):unknown(language),
  canon:profile?.pope_named_in_canon&&profile.pope_named_in_canon!=="UNKNOWN"?
    (profile.pope_named_in_canon==="YES"?L(language,"Yes","Oui"):profile.pope_named_in_canon==="NO"?L(language,"No","Non"):human(profile.pope_named_in_canon)):unknown(language),
  position:position[profile?.position_family]?L(language,...position[profile.position_family]):unknown(language),
  policyBasis:profile?.certainty?L(language,"Community-level policy, not a site-wide fact",
    "Règle communautaire, non une propriété du lieu"):null,
  rite:codes[T(ministry?.liturgical_usage?.family)]||translateCode(ministry?.liturgical_usage?.family,language),
  missal:!T(ministry?.liturgical_usage?.books)||T(ministry?.liturgical_usage?.books)==="UNKNOWN"?unknown(language):
    T(ministry.liturgical_usage.books)==="PRE_1955"?L(language,"Pre-1955","Avant 1955"):E(human(ministry.liturgical_usage.books)),
  rubrics:translateCode(ministry?.liturgical_usage?.rubrical_basis??ministry?.liturgical_usage?.rubrics,language),
  usageBasis:A(ministry?.liturgical_usage?.evidence_source_ids).length?
    L(language,"Source-linked ministry record","Fiche de ministère liée à ses sources"):
    L(language,"Ministry record; specific edition not independently verified","Fiche de ministère ; édition précise non vérifiée indépendamment"),
  status:A(ministry?.communityProfile?.statusAssertions).filter(s=>T(s?.statusCode)).map(s=>({
   code:T(s.statusCode),date:dated(s.effectiveDate),source:T(s.sourceId),summary:T(s.summary)
  })),
 });
}
export function buildTlmChurchProfile(item,language="en"){
 const record=item?.raw??{};
 const venue=record?.venue??{};
 const ministries=A(record?.ministries).map(ministry=>({
  raw:ministry,...minIdentity(ministry,language),
  schedules:isUnavailable(item)?[]:A(ministry?.schedules).filter(s=>T(s?.service_type)==="MASS"||T(s?.service_type)===""),
 }));
 return Object.freeze({item,venue,ministries,language,unverified:isUnavailable(item)});
}
const detail=(label,value,note)=>'<div class="aoTlmProfileDatum"><small>'+E(label)+'</small><strong>'+E(value)+'</strong>'+
 (note?'<span>'+E(note)+'</span>':'')+'</div>';
const link=(url,title,cls)=>https(url)?'<a'+(cls?' class="'+E(cls)+'"':'')+' href="'+E(url)+'" target="_blank" rel="noopener noreferrer">'+E(title)+'</a>':"";
const heading=(title,lang)=>'<h3>'+E(title)+'</h3>';
export function renderTlmChurchProfile(item,language="en"){
 const v=buildTlmChurchProfile(item,language),venue=v.venue;
 const sourceLinks=A(item?.source_links).filter(s=>https(s?.url));
 const contact=venue?.contact??{};
 const hasPhoto=eligibleDirectoryImage(item?.cover_media,item?.place_id);
 const address=T(venue?.address?.formatted)||[venue?.address?.line1,venue?.address?.postal_code,venue?.address?.city,venue?.address?.country_code].map(T).filter(Boolean).join(", ");
 const listedAffiliation=T(item?.eyebrow)||T(item?.community_id)||unknown(language);
 const listedEmblem=massInstitutionEmblem(item?.community_id);
 const one=v.ministries.length===1?v.ministries[0]:null;
 // Emblems identify a reported ministry, never the building's ownership
 // or the ecclesial position / Una Cum of a particular celebration.
 const introEmblem=!v.ministries.length?listedEmblem:one?massInstitutionEmblem(one.raw?.community_id):null;
 const introLabel=one?one.community:v.ministries.length>1?
   L(language,"Multiple ministries","Plusieurs ministères"):listedAffiliation;
 const preliminary=Boolean(item?.preliminary_group)||T(item?.map_state)==="PROVISIONAL"||v.unverified;
 const statusText=preliminary?L(language,"Provisional venue · check source","Lieu provisoire · consulter la source"):
   T(item?.status)||L(language,"Consult original sources","Consulter les sources originales");
 let html='<div class="aoFindSheetBackdrop" data-find-close-detail><section class="aoFindSheet aoTlmChurchProfile" role="dialog" aria-modal="true" aria-label="'+E(item?.title)+'" data-tlm-church-profile="'+E(item?.source_id)+'">';
 html+='<nav class="aoTlmProfileChrome" aria-label="'+E(L(language,"Church profile navigation","Navigation de la fiche"))+'">'+
  '<button type="button" data-explore-collapse-detail>'+E(L(language,"← Back to preview","← Retour à l’aperçu"))+'</button>'+
  '<button type="button" class="aoTlmProfileClose" data-find-close-detail aria-label="'+E(L(language,"Close","Fermer"))+'">×</button></nav>';
 html+='<div class="aoTlmProfileSpotlight"><div class="aoTlmProfileMedia">';
 if(hasPhoto){const m=item.cover_media;
  html+='<figure class="aoTlmProfileHero"><img loading="lazy" decoding="async" src="'+E(m.asset_path)+'" alt="'+E(language==="fr"?m.alt_fr:m.alt_en)+'"><figcaption><details class="aoTlmProfileCredits"><summary>'+E(L(language,"Photograph & credit","Photographie et crédit"))+'</summary><div>'+
   E(m.credit)+' · '+link(m.license_url,m.license)+' · '+link(m.source_url,L(language,"Original photograph","Photographie originale"))+'</div></details></figcaption></figure>';
 }else html+=renderDirectoryIdentityFallback(item,language,"detail");
 html+='</div><header class="aoTlmProfileHeading"><small>'+E(L(language,"TRADITIONAL MASS · CHURCH PROFILE","MESSE TRADITIONNELLE · FICHE D’ÉGLISE"))+'</small>'+
  '<h2>'+E(item?.title)+'</h2><p class="aoTlmProfileLocation">'+E(item?.subtitle)+'</p>'+
  (venue?.diocese?.name?'<p class="aoTlmProfileDiocese">'+E(venue.diocese.name)+'</p>':'')+
  '<div class="aoTlmProfileAffiliation">'+
   (introEmblem?'<img src="'+E(introEmblem.image)+'" alt="" loading="lazy" decoding="async">':'')+
   '<div><small>'+E(v.ministries.length?L(language,"Ministry / community","Ministère / communauté"):L(language,"Affiliation · source-reported","Affiliation · selon la source"))+'</small>'+
   '<strong>'+E(introLabel)+'</strong></div></div>'+
   '<p class="aoTlmProfileVerification'+(preliminary?' is-provisional':'')+'">'+E(statusText)+'</p>'+
  '</header></div>';
 // Provisional source labels are useful for identification, not ecclesial proof.
 if(!v.ministries.length)html+='<p class="aoTlmProfileListedNote" data-tlm-source-affiliation="'+E(item?.community_id)+'">'+
 E(L(language,"Affiliation is source-reported; it does not establish any specific Mass, rite, missal or ecclesial status.",
  "L’affiliation provient de la source et ne prouve ni messe particulière, ni rite, missel ou statut ecclésial."))+'</p>';
 html+='<section class="aoTlmProfilePanel" aria-label="'+E(L(language,"Liturgical and ecclesial identity","Identité liturgique et ecclésiale"))+'">';
 html+='<h3>'+E(L(language,"Liturgy & ecclesial identity","Liturgie et identité ecclésiale"))+'</h3>';
 if(!v.ministries.length)html+='<p>'+E(L(language,"No independently verified ministry-level liturgical classification is attached to this directory record.","Aucune classification liturgique de ministère vérifiée indépendamment n’est associée à cette fiche."))+'</p>';
 for(const [idx,m] of v.ministries.entries()){
   const emblem=massInstitutionEmblem(m.raw?.community_id);
   html+='<article class="aoTlmProfileMinistry"><div class="aoTlmProfileMinistryHead">'+
     (emblem?'<img loading="lazy" decoding="async" src="'+E(emblem.image)+'" alt="">':'')+
     '<div><small>'+E(L(language,"Ministry","Ministère"))+' '+(idx+1)+'</small><h4>'+E(m.community)+'</h4>'+
     (m.relationship?'<span>'+E(human(m.relationship))+'</span>':'')+'</div></div>';
   html+='<div class="aoTlmProfileIdentityGrid">';
   html+=detail("Una cum",m.unaCum,m.unaCumBasis);
   html+=detail(L(language,"Ecclesial position","Position ecclésiale"),m.position,m.policyBasis);
   html+=detail(L(language,"Recognises Pope","Reconnaît le Pape"),m.recognises,m.policyBasis);
   html+=detail(L(language,"Pope named in Canon","Pape nommé au Canon"),m.canon,m.policyBasis);
   html+=detail(L(language,"Liturgical rite","Rite liturgique"),m.rite,m.usageBasis);
   html+=detail(L(language,"Missal / books","Missel / livres"),m.missal,m.usageBasis);
   html+=detail(L(language,"Rubrical basis","Base rubricale"),m.rubrics,null);
   html+=detail(L(language,"Canonical status","Statut canonique"),m.status.length?human(m.status[0].code):unknown(language),m.status.length?[(m.status[0].date||""),(m.status[0].source||"")].filter(Boolean).join(" · "):null);
   html+='</div></article>';
 }
 html+='</section><section class="aoTlmProfilePanel"><h3>'+E(L(language,"Mass programme","Programme des messes"))+'</h3>';
 const schedules=v.ministries.flatMap(m=>m.schedules.map(s=>({m,s})));
 if(!schedules.length)html+='<p class="aoTlmProfileCaution">'+E(L(language,"No currently publishable Mass times in this record. Consult the original directory or community source.","Aucun horaire de messe publiable dans cette fiche. Consultez la source originale de l’annuaire ou de la communauté."))+'</p>';
 for(const {m,s} of schedules){
  const raw=T(s?.payload?.raw);
  const type=T(s?.mass_type)&&T(s.mass_type)!=="UNKNOWN"?human(s.mass_type):L(language,"Mass (type unspecified)","Messe (type non précisé)");
  const checked=dated(s?.verification?.checked_at),state=T(s?.verification?.state);
  // Use a celebration-specific rite and edition when expressly recorded.
  // Never classify a scheduled Mass from the building or a different ministry.
  const use=s?.liturgical_usage??s?.payload?.liturgical_usage??{};
  const rite=T(use?.family)||T(s?.rite);
  const books=T(use?.books)||T(s?.missal_edition);
  const rubrics=T(use?.rubrical_basis)||T(s?.rubrical_basis);
  const edition=[rite&&(codes[rite]||human(rite)),books&&human(books),rubrics&&human(rubrics)].filter(Boolean);
  html+='<article class="aoTlmProfileSchedule"><div><small>'+E(m.community)+' · '+E(type)+'</small>'+
   (edition.length?'<span class="aoTlmProfileScheduleEdition">'+E(edition.join(" · "))+' · '+E(L(language,"specific celebration","célébration précise"))+'</span>':'')+
   '<strong>'+E(raw||L(language,"Refer to official timetable","Voir les horaires officiels"))+'</strong></div><span>'+
   E([checked?L(language,"Checked","Vérifié")+" "+checked:null,state?human(state):null].filter(Boolean).join(" · "))+'</span></article>';
 }
 html+='<p class="aoTlmProfileCaution">'+E(L(language,"Schedules are source assertions, not live availability. Confirm feast days, exceptions and any changes before travelling.",
    "Les horaires proviennent des sources, ce ne sont pas des disponibilités en temps réel. Vérifiez les fêtes, exceptions et changements avant le déplacement."))+'</p></section>';
 html+=renderDirectoryGallery(item,language);
 html+='<section class="aoTlmProfilePanel"><h3>'+E(L(language,"Visit & contacts","Visite et coordonnées"))+'</h3>';
 if(address)html+='<p class="aoTlmProfileAddress">'+E(address)+'</p>';
 if(item?.geo?.approximate||item?.geo?.indicative_only)html+='<p class="aoTlmProfileCaution">'+E(L(language,"Map pin is indicative; the entrance is not verified.","Repère cartographique indicatif ; entrée non vérifiée."))+'</p>';
 const urls=[...values(contact.website),...values(contact.schedule_url),...values(contact.bulletin_url)];
 const links=[...new Set(urls.filter(https))];
 if(links.length)html+='<div class="aoTlmProfileActions">'+links.slice(0,5).map((u,i)=>link(u,i===0?L(language,"Church / institute website","Site de l’église / institut"):L(language,"Schedule / bulletin source","Source horaires / bulletin"))).join("")+'</div>';
 const dirs=A(item?.actions).filter(a=>a?.label==="Directions"&&https(a?.url));
 if(dirs.length)html+='<div class="aoTlmProfileActions">'+link(dirs[0].url,L(language,"Directions on Google Maps","Itinéraire sur Google Maps"))+'</div>';
 if(values(contact.phone).length)html+=detail(L(language,"Telephone","Téléphone"),values(contact.phone).join(" · "),null);
 if(values(contact.email).length)html+=detail("Email",values(contact.email).join(" · "),null);
 if(item?.place_id)html+='<button type="button" data-explore-open-place="'+E(item.place_id)+'">'+E(L(language,"Explore this exact Place · history, relics, prayers","Explorer ce lieu exact · histoire, reliques, prières"))+'</button>';
 html+='</section><section class="aoTlmProfileSourceSection"><details class="aoTlmProfileSourceDisclosure"><summary>'+
  E(L(language,"Sources & verification","Sources et vérification"))+' <span aria-hidden="true">⌄</span></summary><div class="aoTlmProfileSourceContent">';
 if(sourceLinks.length)html+='<div class="aoTlmProfileSources">'+sourceLinks.map(s=>link(s.url,s.title||s.issuer||L(language,"Source","Source"))).join("")+'</div>';
 else html+='<p>'+E(L(language,"Source link not yet verified","Lien source non vérifié"))+'</p>';
 html+='<p class="aoTlmProfileCaution">'+E(L(language,"An institute's declared policy and a particular celebration's practice are distinct. Unknown fields remain unknown.",
    "La politique déclarée d’un institut et la pratique d’une célébration particulière sont distinctes. Les champs inconnus demeurent inconnus."))+'</p></div></details>';
 return html+'</section></div>';
}
export const TLM_CHURCH_PROFILE_STYLE=String.raw`
.aoTlmChurchProfile{width:min(100%,780px);max-width:780px;max-height:min(92dvh,960px);overflow-y:auto;overscroll-behavior:contain;padding:16px 18px 28px;background:linear-gradient(150deg,#182633,#0b131d 60%);border:1px solid #d0b77a44;border-radius:19px}
.aoTlmProfileHeading{display:flex;justify-content:space-between;gap:12px;align-items:start}
.aoTlmProfileHeading h2{font:600 clamp(23px,4vw,31px)/1.15 var(--ao-font-display,Georgia,serif);margin:5px 0;color:#f4e6cb}
.aoTlmProfileHeading small{font:650 10px/1.3 var(--ao-font-ui,system-ui,sans-serif);color:#d8bc83;letter-spacing:.12em}
.aoTlmProfileHeading p{font:12px/1.4 var(--ao-font-ui,system-ui,sans-serif);color:#abbcc5;margin:4px 0}
.aoTlmProfileHeading button{flex:none;background:#222e38;border:1px solid #d0b77a44;border-radius:12px;color:#f4e6cb;width:40px;height:40px;font-size:23px}
.aoTlmProfileHero{margin:13px 0 12px}.aoTlmProfileHero img{display:block;width:100%;max-height:270px;object-fit:contain;background:#09131d;border-radius:12px}
.aoTlmProfileHero figcaption{margin:6px 2px;font:10px/1.4 var(--ao-font-ui,system-ui,sans-serif);color:#b2b5b4}
.aoTlmChurchProfile a{color:#e5c98e;text-decoration:underline;text-underline-offset:3px}
.aoTlmProfileListedAffiliation{display:flex;align-items:center;gap:12px;padding:12px 14px;margin:11px 0;border:1px solid #c4aa7740;border-radius:12px;background:#20303a}
.aoTlmProfileListedAffiliation img{height:46px;width:46px;flex:none;object-fit:contain}
.aoTlmProfileListedAffiliation div{display:flex;flex-direction:column;gap:3px;min-width:0}
.aoTlmProfileListedAffiliation small{font:650 10px/1.25 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.035em;color:#d1b581}
.aoTlmProfileListedAffiliation strong{font:600 16px/1.25 var(--ao-font-display,Georgia,serif);color:#f0e3c9;overflow-wrap:anywhere}
.aoTlmProfileListedAffiliation span{font:11px/1.35 var(--ao-font-ui,system-ui,sans-serif);color:#aab7be}
.aoTlmProfilePanel{margin:15px 0 0;padding:16px;background:#111d27;border:1px solid #bca47530;border-radius:14px}
.aoTlmProfilePanel h3{font:600 20px/1.23 var(--ao-font-display,Georgia,serif);color:#f4e6cb;margin:0 0 14px}
.aoTlmProfilePanel p{color:#dad1c1;font:13px/1.55 var(--ao-font-ui,system-ui,sans-serif)}
.aoTlmProfileMinistry+.aoTlmProfileMinistry{margin-top:17px;border-top:1px solid #d9c59a30;padding-top:17px}
.aoTlmProfileMinistryHead{display:flex;gap:12px;align-items:center;margin-bottom:12px}
.aoTlmProfileMinistryHead img{width:47px;height:47px;object-fit:contain;flex:none}
.aoTlmProfileMinistryHead small{display:block;color:#b8a47e;font:10px/1.3 var(--ao-font-ui,system-ui,sans-serif)}
.aoTlmProfileMinistryHead h4{font:600 17px/1.28 var(--ao-font-display,Georgia,serif);margin:0;color:#fff0d2}
.aoTlmProfileMinistryHead span{font:11px/1.4 var(--ao-font-ui,system-ui,sans-serif);color:#aebdc2}
.aoTlmProfileIdentityGrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}
.aoTlmProfileDatum{display:flex;flex-direction:column;gap:3px;min-width:0;padding:10px;background:#1a2933;border:1px solid #d0b77a22;border-radius:10px}
.aoTlmProfileDatum small{font:650 10px/1.25 var(--ao-font-ui,system-ui,sans-serif);color:#d1b581;letter-spacing:.035em}
.aoTlmProfileDatum strong{font:600 14px/1.3 var(--ao-font-ui,system-ui,sans-serif);color:#f5e7ce;overflow-wrap:anywhere}
.aoTlmProfileDatum span{font:10px/1.45 var(--ao-font-ui,system-ui,sans-serif);color:#a4b5ba}
.aoTlmProfileSchedule{display:flex;justify-content:space-between;gap:12px;padding:12px 0;border-top:1px solid #d0b77a22}
.aoTlmProfileScheduleEdition{display:block;margin:3px 0;color:#e7c691;font:600 11px/1.4 var(--ao-font-ui,system-ui,sans-serif)}
.aoTlmProfileSchedule div{min-width:0}.aoTlmProfileSchedule small{display:block;font:10px/1.35 var(--ao-font-ui,system-ui,sans-serif);color:#d1b581}
.aoTlmProfileSchedule strong{display:block;font:500 13px/1.6 var(--ao-font-ui,system-ui,sans-serif);color:#eee3d3;white-space:pre-line;overflow-wrap:anywhere}
.aoTlmProfileSchedule>span{font:10px/1.4 var(--ao-font-ui,system-ui,sans-serif);color:#a9b2b8;max-width:140px;flex:none}
.aoTlmProfileCaution{font-size:11px!important;color:#b6b5ad!important}
.aoTlmProfileActions,.aoTlmProfileSources{display:flex;flex-wrap:wrap;gap:10px;margin:10px 0}
.aoTlmProfileActions a,.aoTlmProfileSources a{padding:9px 11px;background:#263540;border:1px solid #c4a76844;border-radius:9px;min-height:44px;box-sizing:border-box;font-size:12px}
.aoTlmChurchProfile button[data-explore-open-place]{background:#302a20;color:#f4e0bb;border:1px solid #d8b576;border-radius:10px;min-height:44px;padding:9px 12px;text-align:left;max-width:100%}
.aoTlmProfileAddress{overflow-wrap:anywhere}
@media(max-width:560px){.aoTlmChurchProfile{width:100%;max-width:none;max-height:90dvh;padding:12px 13px max(30px,env(safe-area-inset-bottom));border-radius:18px 18px 0 0}.aoTlmProfilePanel{padding:12px}.aoTlmProfileIdentityGrid{gap:7px}.aoTlmProfileDatum{padding:9px 8px}.aoTlmProfileDatum strong{font-size:12px}.aoTlmProfileSchedule{flex-direction:column;gap:4px}.aoTlmProfileSchedule>span{max-width:none}}
@media(prefers-reduced-motion:reduce){.aoTlmChurchProfile{scroll-behavior:auto}}

/* Editorial church-profile layout: photographic cover and distinct ministry
 * insignia, with text-first provenance and no unverified status inference. */
.aoTlmChurchProfile{width:min(100%,920px);max-width:920px;max-height:min(94dvh,1000px);overflow-x:hidden;overflow-y:auto;overscroll-behavior:contain;padding:0 21px 28px;border-radius:20px;box-shadow:0 24px 85px #04080ca0}
.aoTlmProfileChrome{position:sticky;top:0;z-index:6;display:flex;justify-content:space-between;align-items:center;gap:12px;padding:10px 0;background:#14212bee;border-bottom:1px solid #d0b77a22;backdrop-filter:blur(12px)}
.aoTlmProfileChrome button{min-height:44px;border:0;background:transparent;color:#e9d6ae;font:600 12px/1.3 var(--ao-font-ui,system-ui,sans-serif);cursor:pointer}
.aoTlmProfileChrome .aoTlmProfileClose{width:44px;border-radius:50%;background:#263440;font-size:24px}
.aoTlmProfileChrome button:focus-visible,.aoTlmProfileSourceDisclosure summary:focus-visible,.aoTlmProfileCredits summary:focus-visible{outline:2px solid #e8c48b;outline-offset:2px}
.aoTlmProfileSpotlight{display:grid;grid-template-columns:minmax(0,41fr) minmax(0,59fr);gap:22px;align-items:stretch;padding:19px 0 18px;border-bottom:1px solid #d0b77a33}
.aoTlmProfileSpotlight>*,.aoTlmProfileHeading{min-width:0}
.aoTlmProfileMedia{display:flex;flex-direction:column;min-width:0}
.aoTlmProfileSpotlight .aoTlmVenueIdentity--detail{height:100%;min-height:235px;margin:0}
.aoTlmProfileSpotlight .aoTlmProfileHero{margin:0;display:flex;flex-direction:column;min-width:0;flex:1}
.aoTlmProfileSpotlight .aoTlmProfileHero img{display:block;width:100%;height:100%;min-height:235px;max-height:340px;object-fit:contain;background:#09131d;border-radius:12px}
.aoTlmProfileSpotlight .aoTlmProfileHero figcaption{margin:4px 2px 0}
.aoTlmProfileHeading{display:flex;flex-direction:column;align-items:flex-start;justify-content:center;padding:6px 0;gap:0}
.aoTlmProfileHeading h2{font:600 clamp(25px,3.8vw,38px)/1.12 var(--ao-font-display,Georgia,serif);margin:9px 0 10px;color:#f4e6cb;overflow-wrap:anywhere}
.aoTlmProfileHeading>small{font:650 10px/1.3 var(--ao-font-ui,system-ui,sans-serif);color:#d8bc83;letter-spacing:.12em}
.aoTlmProfileHeading p{font:12px/1.45 var(--ao-font-ui,system-ui,sans-serif);color:#abbcc5;margin:3px 0}
.aoTlmProfileAffiliation{display:flex;align-items:center;gap:12px;max-width:100%;margin:17px 0 13px;padding:11px 13px;border:1px solid #d0b77a33;border-radius:12px;background:#26333c}
.aoTlmProfileAffiliation img{width:48px;height:48px;object-fit:contain;flex:none}
.aoTlmProfileAffiliation div{display:flex;flex-direction:column;min-width:0;gap:4px}
.aoTlmProfileAffiliation small{font:600 10px/1.25 var(--ao-font-ui,system-ui,sans-serif);color:#d0b789;letter-spacing:.035em}
.aoTlmProfileAffiliation strong{font:600 16px/1.25 var(--ao-font-display,Georgia,serif);color:#f5e6cd;overflow-wrap:anywhere}
.aoTlmProfileVerification{display:inline-flex;align-items:center;max-width:100%;gap:7px;padding:5px 9px;border:1px solid #a1bec13a;border-radius:999px;color:#c0d9da!important;font:600 10px/1.4 var(--ao-font-ui,system-ui,sans-serif)!important;overflow-wrap:anywhere}
.aoTlmProfileVerification:before{content:'';width:6px;height:6px;flex:none;border-radius:50%;background:#90b9ae}
.aoTlmProfileVerification.is-provisional{color:#d9bea2!important;border-color:#caad7847}
.aoTlmProfileVerification.is-provisional:before{background:#d5b47e}
.aoTlmProfileListedNote{font:12px/1.5 var(--ao-font-ui,system-ui,sans-serif);color:#bdc5c5;padding:0 3px;margin:14px 0}
.aoTlmProfileSourceSection{margin:15px 0 0;border:1px solid #c6ad7b35;border-radius:12px;overflow:hidden;background:#111e28}
.aoTlmProfileSourceDisclosure summary{list-style:none;min-height:48px;display:flex;justify-content:space-between;align-items:center;gap:12px;padding:12px 15px;cursor:pointer;color:#dbc79e;font:600 13px/1.3 var(--ao-font-ui,system-ui,sans-serif)}
.aoTlmProfileSourceDisclosure summary::-webkit-details-marker,.aoTlmProfileCredits summary::-webkit-details-marker{display:none}
.aoTlmProfileSourceContent{padding:0 15px 14px;border-top:1px solid #d0b77a22}
.aoTlmProfileCredits{font:11px/1.45 var(--ao-font-ui,system-ui,sans-serif);color:#bec6c5}
.aoTlmProfileCredits summary{min-height:27px;cursor:pointer;color:#bbbdba}
.aoTlmProfileCredits>div{padding:5px 0 3px}
@media(max-width:560px){
 .aoTlmChurchProfile{width:100%;max-width:none;max-height:94dvh;padding:0 13px max(30px,env(safe-area-inset-bottom));border-radius:19px 19px 0 0}
 .aoTlmProfileChrome{padding:8px 0}
 .aoTlmProfileSpotlight{grid-template-columns:minmax(0,1fr);gap:12px;padding:12px 0 14px}
 .aoTlmProfileSpotlight .aoTlmProfileHero img{height:auto;min-height:0;max-height:220px}
 .aoTlmProfileSpotlight .aoTlmVenueIdentity--detail{min-height:150px}
 .aoTlmProfileHeading{padding:0 3px}
 .aoTlmProfileHeading h2{font-size:clamp(24px,7vw,30px);margin:6px 0}
 .aoTlmProfileAffiliation{margin:10px 0 8px;padding:9px 11px}
 .aoTlmProfileAffiliation img{width:40px;height:40px}
}
@media(max-width:359px){
 .aoTlmChurchProfile{padding-inline:11px}
 .aoTlmProfileSpotlight .aoTlmProfileHero img{max-height:185px}
}
`;
