/**
 * Isolated R5D QA fixture; intentionally NOT imported by production Prayer.
 * "qaOnly: true" is required for any rendered image. Staging is not approval.
 */
import {prayerEditorialSlot} from "../../src/pray/editorial-artwork-assignments.v1.js";
import {resolvePrayerEditorialArtwork} from "../../src/pray/art-slot-map.v1.js";

export const R5D_RESEARCH_PHOTOS=Object.freeze([
  {
    "title": "The Crucifixion",
    "artist": "follower of Sodoma",
    "sourcePage": "https://www.clevelandart.org/art/1916.786",
    "imagePath": "assets/prayer/research/r5d-museum-originals/cleveland-1916.786.jpg",
    "sha256": "022572a6fa03b4ff9e1a04dc6b92345b2239b0c2998468e58705028b1dad073b",
    "slots": [
      "COV-pray.seven_words",
      "COV-pray.stations",
      "STG-pray.five_wounds-02",
      "STG-pray.five_wounds-03",
      "STG-pray.seven_words-01",
      "STG-pray.seven_words-02",
      "STG-pray.seven_words-04",
      "STG-pray.seven_words-05",
      "STG-pray.tenebrae-02"
    ]
  },
  {
    "title": "Saint Teresa of Avila Interceding for Souls in Purgatory",
    "artist": "Workshop of Peter Paul Rubens",
    "sourcePage": "https://www.metmuseum.org/art/collection/search/437542",
    "imagePath": "assets/prayer/research/r5d-museum-originals/met-437542.jpg",
    "sha256": "8d1914deed2b46063f9c4ae89a8471b1ada97fc09f0604b62443280070c4cf0e",
    "slots": [
      "COV-dead_de_profundis",
      "COV-dead_fidelium_deus",
      "COV-foundations_eternal_rest",
      "COV-novena.holy_souls",
      "STG-novena.holy_souls-01",
      "STG-pray.penitential_psalms-06"
    ]
  },
  {
    "title": "The Immaculate Conception",
    "artist": "Bartolomé Esteban Murillo (Spanish, 1617–1682)",
    "sourcePage": "https://clevelandart.org/art/1959.189",
    "imagePath": "assets/prayer/research/r5d-bulk-museum-originals/cleveland-1959.189.jpg",
    "sha256": "9630b345caf4062287f16d9d8e0b728b87938f4a3b22eb1ae43d888c518f9d6a",
    "slots": [
      "COV-litany_loreto_1962",
      "STG-pray.montfort_consecration-03"
    ]
  },
  {
    "title": "Holy Family with a Shepherd",
    "artist": "Battista Dossi (Italian, c. 1490–1548)",
    "sourcePage": "https://clevelandart.org/art/1949.185",
    "imagePath": "assets/prayer/research/r5d-bulk-museum-originals/cleveland-1949.185.jpg",
    "sha256": "ad354b41cb5b18f54f1362c6bbee187b4d03859b6f8c0cc7dcd6078cf66698ad",
    "slots": [
      "STG-pray.adoration.night-01",
      "STG-pray.adoration.night-04"
    ]
  },
  {
    "title": "Paradise",
    "artist": "Carlo Saraceni",
    "sourcePage": "https://www.metmuseum.org/art/collection/search/437607",
    "imagePath": "assets/prayer/research/r5d-bulk-museum-originals/met-437607.jpg",
    "sha256": "dd8a69a0c86c0855b7836a63439d7978205ae37fa108db05e7d18035f2a54e78",
    "slots": [
      "HERO-20",
      "STG-pray.litany_saints-03"
    ]
  },
  {
    "title": "Saints Presenting a Devout Woman to the Virgin and Child",
    "artist": "Giovanni Battista Pittoni (Italian, 1687–1767)",
    "sourcePage": "https://clevelandart.org/art/1982.36",
    "imagePath": "assets/prayer/research/r5d-bulk-museum-originals/cleveland-1982.36.jpg",
    "sha256": "d738e33cf352a13f1bc8e4178449c0938cc59f6d149f4cfb2477d7dd93ccc71a",
    "slots": [
      "STG-litany_loreto_1962-01",
      "STG-pray.angelus_regina-01"
    ]
  },
  {
    "title": "The Trinity",
    "artist": "Hendrik van Balen (Flemish, 1575–1632)",
    "sourcePage": "https://clevelandart.org/art/1996.26",
    "imagePath": "assets/prayer/research/r5d-bulk-museum-originals/cleveland-1996.26.jpg",
    "sha256": "1880866ce9b1cfc27c59a177fbe16689d6d2a595aa69b3cf2fbf9a62c59f49a7",
    "slots": [
      "COV-benediction_divine_praises",
      "DOOR-D2"
    ]
  },
  {
    "title": "The Adoration of the Christ Child",
    "artist": "Jan Joest of Kalkar",
    "sourcePage": "https://www.metmuseum.org/art/collection/search/436781",
    "imagePath": "assets/prayer/research/r5d-bulk-museum-originals/met-436781.jpg",
    "sha256": "c68cefb090b0f7b0009b1ee6d97a41304e9ffa5d7e1dd500e8ef3f39d2a15bd2",
    "slots": [
      "STG-novena.st_therese-01",
      "STG-pray.st_joseph_seven_sorrows-02"
    ]
  },
  {
    "title": "The Agony in the Garden",
    "artist": "Nicolas Poussin",
    "sourcePage": "https://www.metmuseum.org/art/collection/search/442488",
    "imagePath": "assets/prayer/research/r5d-bulk-museum-originals/met-442488.jpg",
    "sha256": "acc13b2f34ed893edb300bbebd0dea66ddd95d824b8bd9fb94bc1e2a9d17abaf",
    "slots": [
      "COV-pray.tenebrae",
      "STG-pray.adoration.night-02"
    ]
  },
  {
    "title": "Christ Presented to the People (Ecce Homo)",
    "artist": "Sodoma (Giovanni Antonio Bazzi)",
    "sourcePage": "https://www.metmuseum.org/art/collection/search/437978",
    "imagePath": "assets/prayer/research/r5d-bulk-museum-originals/met-437978.jpg",
    "sha256": "cfe165e22f7b9fe81b1952fc1f81c909a1de49ccbcf50d764b09f77d76aae7d6",
    "slots": [
      "HERO-07",
      "STG-pray.adoration.four_ends-03"
    ]
  },
  {
    "title": "Christ Crowned with Thorns (Ecce Homo), and the Mourning Virgin (Mater Dolorosa)",
    "artist": "Adriaen Isenbrant",
    "sourcePage": "https://www.metmuseum.org/art/collection/search/436721",
    "imagePath": "assets/prayer/research/r5d-bulk-museum-originals/met-436721.jpg",
    "sha256": "69fe6aae9e565c621b05515ed4205044b216be63a5bcff6d7fe87163deb97623",
    "slots": [
      "STG-pray.precious_blood-04"
    ]
  },
  {
    "title": "The Burial of Christ",
    "artist": "Annibale Carracci",
    "sourcePage": "https://www.metmuseum.org/art/collection/search/438338",
    "imagePath": "assets/prayer/research/r5d-bulk-museum-originals/met-438338.jpg",
    "sha256": "6146de5ad9544812623cee4499e7cc717d1b0c152500be72c73103a781fc5757",
    "slots": [
      "STG-prayer.seven_sorrows_chaplet-07"
    ]
  },
  {
    "title": "Christ Healing the Sick",
    "artist": "Christian Wilhelm Ernst Dietrich",
    "sourcePage": "https://www.metmuseum.org/art/collection/search/436199",
    "imagePath": "assets/prayer/research/r5d-bulk-museum-originals/met-436199.jpg",
    "sha256": "f68a9d408b8d03554f26cd84aa31a9c4f7f4eafd0693482bdba2ce69d7536a97",
    "slots": [
      "STG-litany_loreto_1962-04"
    ]
  },
  {
    "title": "The Holy Family",
    "artist": "Gaetano Gandolfi (Italian, 1734–1802)",
    "sourcePage": "https://clevelandart.org/art/1998.10",
    "imagePath": "assets/prayer/research/r5d-bulk-museum-originals/cleveland-1998.10.jpg",
    "sha256": "6edb1762e9001a78a19efb71173959befeb9cf7f90a9538bab62b6bffd3f3814",
    "slots": [
      "COV-pray.adoration.night"
    ]
  },
  {
    "title": "The Rest on the Flight into Egypt",
    "artist": "Gerard David",
    "sourcePage": "https://www.metmuseum.org/art/collection/search/436101",
    "imagePath": "assets/prayer/research/r5d-bulk-museum-originals/met-436101.jpg",
    "sha256": "a30c4d70bbd9e70a3a67c2b9eb45f75688952711c8cea565ff26e2800ff145b1",
    "slots": [
      "COV-devotion_ad_te_beate_ioseph"
    ]
  },
  {
    "title": "The Annunciation",
    "artist": "Hans Memling",
    "sourcePage": "https://www.metmuseum.org/art/collection/search/437490",
    "imagePath": "assets/prayer/research/r5d-bulk-museum-originals/met-437490.jpg",
    "sha256": "4a5b21d087c1c827c792b89b0c37c689e1c72b0779cc1a3b8bea92a1de69a36a",
    "slots": [
      "STG-litany_loreto_1962-02"
    ]
  },
  {
    "title": "Saint Thomas Aquinas",
    "artist": "Carlo Crivelli",
    "sourcePage": "https://commons.wikimedia.org/wiki/File:Saint_Thomas_Aquinas_(Crivelli%2C_15th-century).jpg",
    "imagePath": "assets/prayer/research/r5d-commons-originals/commons-5cbf0a0d01ffdd3.jpg",
    "sha256": "67509963a0515b44b6403c7ea33451d96b6e564d9c05e07f7a1e645970afdc0f",
    "slots": [
      "COV-benediction_o_salutaris",
      "COV-benediction_tantum_ergo",
      "STG-pray.benediction-02",
      "STG-pray.litany_saints-05"
    ]
  },
  {
    "title": "The Nativity or the Adoration of the Angels",
    "artist": "Gerard Seghers",
    "sourcePage": "https://commons.wikimedia.org/wiki/File:Gerard_Seghers_-_The_Nativity_or_the_Adoration_of_the_Angels.jpg",
    "imagePath": "assets/prayer/research/r5d-commons-originals/commons-a535435237abb59.jpg",
    "sha256": "025dbb3803660a497060f157199d4936cc4d375dde79349c54f0802dae6e883a",
    "slots": [
      "COV-pray.adoration.four_ends",
      "HERO-02",
      "STG-pray.adoration.four_ends-01"
    ]
  },
  {
    "title": "Archangel Michael Defeating Satan",
    "artist": "Guido Reni",
    "sourcePage": "https://commons.wikimedia.org/wiki/File:GuidoReni_MichaelDefeatsSatan.jpg",
    "imagePath": "assets/prayer/research/r5d-commons-originals/commons-62c24c9b47b85c8.jpg",
    "sha256": "4f9eaee1c1abe0df9ae70e36bfcfd113c0e556a8022c4c98d7a72d2a392b71ad",
    "slots": [
      "COV-devotion_prayer_st_michael",
      "COV-mass_devotion_leonine",
      "COV-novena.st_michael"
    ]
  },
  {
    "title": "Presentation of Jesus at the Temple",
    "artist": "Philippe de Champaigne",
    "sourcePage": "https://commons.wikimedia.org/wiki/File:Philippe%20de%20Champaigne-Pr%C3%A9sentation%20au%20temple.jpg",
    "imagePath": "assets/prayer/research/r5d-commons-originals/commons-edb1eee5613d724.jpg",
    "sha256": "c4250c3888a03434b5128c8b6bccaca0a37168e323b8fb31a1edd7d13ad12869",
    "slots": [
      "HERO-04",
      "STG-pray.st_joseph_seven_sorrows-04",
      "STG-prayer.seven_sorrows_chaplet-01"
    ]
  },
  {
    "title": "Agony in the Garden — Antwerp Rosary cycle",
    "artist": "David Teniers the Elder",
    "sourcePage": "https://commons.wikimedia.org/wiki/File:David_Teniers_the_Elder_-_The_Agony_in_the_Garden.jpg",
    "imagePath": "assets/prayer/research/r5d-commons-recovered-originals/commons-5e6f63ecbf0e480.jpg",
    "sha256": "6a697614cfe96b9f62921af0015eeca08fbc26ed0103dbefe9abe98c5342658e",
    "slots": [
      "HERO-06",
      "STG-pray.precious_blood-02",
      "STG-pray.tenebrae-01"
    ]
  }
].map(
  r=>Object.freeze({...r,slots:Object.freeze(r.slots)})));
export const R5D_RESEARCH_TOTALS=Object.freeze({works:21,slots:53,published:0});
const bySlot=new Map();
for(const artwork of R5D_RESEARCH_PHOTOS)for(const slot of artwork.slots){
  if(bySlot.has(slot))throw Error("Duplicate R5D source stage: "+slot);
  bySlot.set(slot,artwork);
}
const normalize=value=>decodeURIComponent(String(value??""))
 .replace(/^https:\/\/(www\.)?/,"").replace(/\/$/,"");
const esc=value=>String(value??"").replace(/[&<>"']/g,
 c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
export function resolveR5dResearchPhoto(slotId,{qaOnly=false}={}){
 if(qaOnly!==true)return null;
 const id=String(slotId??""),work=bySlot.get(id);
 if(!work || /rosary-/i.test(id))return null;
 const selected=prayerEditorialSlot(id);
 if(!selected || !selected.selected || selected.hold || selected.protectedCover ||
    !selected.approvedOrInherited || !selected.sourceIdentityVerified)return null;
 if(normalize(selected.selected.sourcePage)!==normalize(work.sourcePage))return null;
 if(resolvePrayerEditorialArtwork(id).state==="PUBLISHED_EXACT_PHOTO")return null;
 return Object.freeze({slotId:id,photo:work,publicationAuthorized:false,
   state:"R5D_RESEARCH_ONLY_NEEDS_VISUAL_AND_READER_QA"});
}
export function renderR5dResearchPhoto(slotId,{qaOnly=false,className=""}={}){
 const item=resolveR5dResearchPhoto(slotId,{qaOnly});
 if(!item)return "";
 const p=item.photo,cls=String(className).replace(/[^A-Za-z0-9 _-]/g,"");
 return '<div class="aoEditorialArtworkSlot aoR5dResearchPhoto" '+
   'data-ao-editorial-slot="'+esc(item.slotId)+'" '+
   'data-ao-editorial-source="research-unreleased" data-ao-published="false">'+
   '<figure class="aoReleasedModulePhoto '+esc(cls)+'" data-ao-research-only="true">'+
   '<img src="/'+esc(p.imagePath)+'" alt="'+esc(p.title+" — "+p.artist)+
   '" loading="eager" decoding="async">'+
   '<figcaption>'+esc(p.artist)+' · <a href="'+esc(p.sourcePage)+
   '" target="_blank" rel="noopener noreferrer">'+esc(p.title)+'</a></figcaption>'+
   '<p class="aoR5dResearchDisclaimer" role="note">Research artwork · publication NOT approved</p>'+
   '</figure></div>';
}
