// Historical landscape facts for the double-opt-in Atlas research view.
// Source notes describe studied changes, NEVER period-corrected coastlines,
// speculative harbour coordinates, routes, or ancient text of Scripture.
export const ATLAS_LANDSCAPE_CONTEXT=Object.freeze({
 ephesus:Object.freeze({
  key:"ephesus",era:"APOSTLES",status:"SOURCE_ATTESTED_TOPOGRAPHIC_CHANGE_NO_GEOMETRY",
  heading_en:"Ephesus · a changing harbour",heading_fr:"Éphèse · un port en transformation",
  evidence_en:"UNESCO documents a Roman harbour city with successive shorelines and harbours as the Kaystros estuary filled with sediment. Published geoarchaeology identifies pronounced silting in the Hellenistic and Roman harbour basin.",
  evidence_fr:"L’UNESCO décrit une ville portuaire romaine dont les côtes et les ports se sont déplacés avec l’alluvionnement de l’estuaire du Caystre. Les recherches géoarchéologiques documentent l’envasement du bassin portuaire aux époques hellénistique et romaine.",
  caveat_en:"Today’s coastline cannot be used to reconstruct St Paul’s harbour or a precise scene in Acts.",
  caveat_fr:"Le littoral actuel ne permet pas de reconstituer le port à l’époque de saint Paul ni le lieu exact d’une scène des Actes.",
  sources:Object.freeze([
   Object.freeze({url:"https://whc.unesco.org/en/list/1018/",label:"UNESCO · Ephesus",basis:"Roman port, shifting shoreline and harbour basin"}),
   Object.freeze({url:"https://doi.org/10.1002/esp.3914",label:"Stock et al. (2016) · harbour geoarchaeology",basis:"Hellenistic/Roman harbour sedimentation"})
  ])
 }),
 miletus:Object.freeze({
  key:"miletus",era:"APOSTLES",status:"SOURCE_ATTESTED_TOPOGRAPHIC_CHANGE_NO_GEOMETRY",
  heading_en:"Miletus · the lost Latmian Gulf",heading_fr:"Milet · l’ancien golfe Latmique",
  evidence_en:"The University of Hamburg describes ancient Miletus on a peninsula projecting into the Latmian Gulf. Meander River sediment progressively filled the gulf, leaving Lake Bafa and an inland archaeological site.",
  evidence_fr:"L’université de Hambourg situe Milet sur une ancienne péninsule avançant dans le golfe Latmique. Les dépôts du Méandre ont peu à peu comblé le golfe, laissant le lac Bafa et un site archéologique aujourd’hui éloigné de la mer.",
  caveat_en:"The modern physical-map shoreline does not represent Miletus when St Paul summoned the elders of Ephesus (Acts 20:17).",
  caveat_fr:"Le littoral de la carte physique actuelle ne représente pas Milet lorsque saint Paul convoqua les anciens d’Éphèse (Actes 20, 17).",
  sources:Object.freeze([
   Object.freeze({url:"https://www.miletgrabung.uni-hamburg.de/en/milet/milet-landschaft.html",label:"University of Hamburg · Milesian landscape",basis:"Latmian Gulf, peninsula, later siltation"}),
   Object.freeze({url:"https://www.miletgrabung.uni-hamburg.de/en/milet.html",label:"University of Hamburg · Miletus excavation",basis:"Archaeological settlement and harbour history"})
  ])
 })
});
const esc=v=>String(v??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
export function atlasLandscapeForStop(stop){
 const context=ATLAS_LANDSCAPE_CONTEXT[stop?.geo?.key];
 return context&&stop?.era===context.era?context:null;
}
export function atlasLandscapeReview(stop,language="en"){
 const x=atlasLandscapeForStop(stop);if(!x)return "";
 const fr=language==="fr";
 const header=fr?"Ancien paysage":"Ancient landscape";
 const basis=fr?x.evidence_fr:x.evidence_en;
 const caveat=fr?x.caveat_fr:x.caveat_en;
 const heading=fr?x.heading_fr:x.heading_en;
 const refs=x.sources.map(s=>'<a href="'+esc(s.url)+'" target="_blank" rel="noopener noreferrer">'+esc(s.label)+" ↗</a>").join("");
 return '<details class="aoBibleAtlasLandscapeNote" data-bible-landscape="'+esc(x.key)+
  '" data-bible-landscape-status="'+esc(x.status)+'"><summary>'+esc(header)+
  ' · '+esc(heading)+'</summary><p>'+esc(basis)+'</p><p class="aoBibleAtlasLandscapeCaveat">'+
  esc(caveat)+'</p><div class="aoBibleAtlasLandscapeSources">'+refs+'</div></details>';
}
