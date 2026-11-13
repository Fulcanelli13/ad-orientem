import { SACRED_ART_HOLY_TRINITY_OWNER_SELECTED_V1 } from "./sacred-art-holy-trinity-owner-selected.v1.js";
/**
 * Sacred Art taxonomy: 24 eligible items from original 25-work inventory (one rejected), plus six owner additions.
 *
 * This is an iconographic/placement index, not a source-photo promotion.
 * The 16 exact released module photos and nine previously pending works remain
 * distinct from the six owner-selected Holy Trinity paintings added 2026-11-13.
 * The frozen 989 research groups remain separate and unchanged; Durer is linked
 * to his existing HERO::khm:GG-838 group. Owner approval never releases bytes.
 */
export const SACRED_ART_CATEGORIES_V1=Object.freeze({
  INCARNATION:{en:"Incarnation & Childhood",fr:"Incarnation et enfance"},
  MINISTRY:{en:"Ministry & Miracles",fr:"Vie publique et miracles"},
  PASSION:{en:"Passion & Resurrection",fr:"Passion et Résurrection"},
  MARY:{en:"Our Lady",fr:"Notre-Dame"},
  EUCHARIST:{en:"Eucharist & Adoration",fr:"Eucharistie et adoration"},
  HOLY_SPIRIT:{en:"Holy Spirit",fr:"Saint-Esprit"},
  SAINTS:{en:"Saints & Doctors",fr:"Saints et docteurs"},
  ANGELS:{en:"Angels",fr:"Anges"},
  MERCY:{en:"Mercy & Penance",fr:"Miséricorde et pénitence"},
  LAST_THINGS:{en:"Last Things & Souls",fr:"Fins dernières et âmes"},
  TRINITY:{en:"Holy Trinity",fr:"Sainte Trinité"},
  OLD_TESTAMENT:{en:"Old Testament",fr:"Ancien Testament"},
  CHURCH_LIFE:{en:"Christian Life & Prayer",fr:"Vie chrétienne et prière"},
  CREATION:{en:"Creation & Nature",fr:"Création et nature"}
});
const entry=(id,photoModuleId,title,artist,scene,categories,persons,scripture,placement,notes="")=>Object.freeze({
  id,photoModuleId,title,artist,
  scene,categoryIds:Object.freeze(categories),
  depictedPersonsCandidates:Object.freeze(persons),
  scriptureAnchors:Object.freeze(scripture),
  existingMatching: Object.freeze(placement),
  subjectEvidence:"CATALOGUED_TITLE_AND_CURATED_PLACEMENT_NOT_NEW_VISUAL_APPROVAL",
  photoReleaseState:photoModuleId?"ALREADY_RELEASED_MODULE_PHOTO":"PHOTOGRAPH_NOT_RELEASED",
  newPhotoPublication:false,
  sceneIsDirectScriptureIllustration:scripture.length>0&& !/devotional|symbolic|allegorical/i.test(notes),
  notes
});
export const SACRED_ART_CURATED_WORKS_V1=Object.freeze([
  entry("released-photo:angelus","angelus","The Annunciation","Philippe de Champaigne","Annunciation to the Virgin Mary",["INCARNATION","MARY"],["Virgin Mary","Archangel Gabriel"],["Luke 1:26-38"],{releasedModule:"angelus",existingPrayerSlots:[]}),
  entry("released-photo:adoration","adoration","The Virgin Adoring the Host","Jean Auguste Dominique Ingres","Marian adoration of the Eucharist",["MARY","EUCHARIST"],["Virgin Mary","Christ in the Eucharist"],[],{releasedModule:"adoration",existingPrayerSlots:[]},"Devotional composition; not a Gospel episode"),
  entry("released-photo:confession","confession","The Return of the Prodigal Son","Bartolomé Esteban Murillo","Parable of the prodigal son's return",["MINISTRY","MERCY"],["Prodigal son","Father","Christ as narrator"],["Luke 15:11-32"],{releasedModule:"confession",existingPrayerSlots:[]}),
  entry("released-photo:joseph","joseph","The Dream of Saint Joseph","Philippe de Champaigne","Angelic message to Saint Joseph",["INCARNATION","SAINTS","ANGELS"],["Saint Joseph","Angel"],["Matthew 1:18-25"],{releasedModule:"joseph",existingPrayerSlots:[]}),
  entry("released-photo:regina","regina","Resurrection of Christ (central panel)","Peter Paul Rubens","Resurrection of Christ",["PASSION"],["Jesus Christ"],["Matthew 28:1-10"],{releasedModule:"regina",existingPrayerSlots:[]}),
  entry("released-photo:souls","souls","Madonna and Child with Souls in Purgatory","Luca Giordano","Marian intercession for souls in Purgatory",["MARY","LAST_THINGS"],["Virgin Mary","Christ Child","Souls in Purgatory"],[],{releasedModule:"souls",existingPrayerSlots:[]},"Devotional composition; no single biblical incident depicted"),
  entry("released-photo:visit","visit","The Adoration of the Shepherds","Gerrit van Honthorst","Shepherds adoring the newborn Christ",["INCARNATION"],["Christ Child","Virgin Mary","Saint Joseph","Shepherds"],["Luke 2:8-20"],{releasedModule:"visit",existingPrayerSlots:[]}),
  entry("released-photo:heart-jesus","heart-jesus","The Heart of Jesus","Juan Patricio Morlete Ruiz","Sacred Heart devotion",["PASSION","MERCY"],["Jesus Christ"],["John 19:34"],{releasedModule:"heart-jesus",existingPrayerSlots:[]},"Devotional iconography; biblical verse is thematic, not a literal scene"),
  entry("released-photo:heart-mary","heart-mary","The Heart of Mary","Juan Patricio Morlete Ruiz","Immaculate Heart devotion",["MARY","PASSION"],["Virgin Mary"],["Luke 2:35"],{releasedModule:"heart-mary",existingPrayerSlots:[]},"Devotional iconography; biblical verse is thematic"),
  entry("released-photo:king","king","Salvator Mundi","Ambrosius Benson","Christ as Saviour and King",["PASSION"],["Jesus Christ"],["John 18:37"],{releasedModule:"king",existingPrayerSlots:[]},"Devotional royal iconography; Gospel reference is thematic"),
  // The former released-photo:bouts is globally rejected for exact Cleveland original.
  entry("released-photo:cavallino","cavallino","Adoration of the Shepherds","Bernardo Cavallino","Shepherds adoring the infant Jesus",["INCARNATION"],["Christ Child","Virgin Mary","Shepherds"],["Luke 2:8-20"],{releasedModule:"cavallino",existingPrayerSlots:[]}),
  entry("released-photo:girardin","girardin","The Trinity","Laurent Girardin","Representation of the Holy Trinity",["TRINITY"],["Father","Son","Holy Spirit"],["Matthew 28:19"],{releasedModule:"girardin",existingPrayerSlots:[]},"Theological iconography, not direct narrative"),
  entry("released-photo:hondius","hondius","Christ among the Doctors","Abraham Hondius","Finding Jesus teaching in the Temple",["INCARNATION","MINISTRY"],["Young Jesus","Temple teachers","Virgin Mary","Saint Joseph"],["Luke 2:41-52"],{releasedModule:"hondius",existingPrayerSlots:[]}),
  entry("released-photo:latour","latour","The Penitent Magdalen","Georges de La Tour","Mary Magdalene in penitential meditation",["SAINTS","MERCY"],["Saint Mary Magdalene"],[],{releasedModule:"latour",existingPrayerSlots:[]},"Meditative portrait; do not assert that it depicts Luke 7"),
  entry("released-photo:giordano-flight","giordano-flight","The Flight into Egypt","Luca Giordano","Holy Family fleeing into Egypt",["INCARNATION","MARY"],["Jesus Christ","Virgin Mary","Saint Joseph"],["Matthew 2:13-15"],{releasedModule:"giordano-flight",existingPrayerSlots:[]}),
  entry("artwork-pending:01",null,"The Crucifixion","Follower of Sodoma","Crucifixion of Jesus Christ",["PASSION"],["Jesus Christ","Virgin Mary","Disciples and witnesses — exact persons to verify"],["John 19:17-30"],{existingPrayerSlots:["STG-pray.five_wounds-02","STG-pray.five_wounds-03","COV-pray.stations","COV-pray.seven_words","STG-pray.seven_words-01","STG-pray.seven_words-02","STG-pray.seven_words-04","STG-pray.seven_words-05","STG-pray.tenebrae-02"]}),
  entry("artwork-pending:02",null,"Saint Teresa of Avila Interceding for Souls in Purgatory","Workshop of Peter Paul Rubens","Intercession for souls in Purgatory",["SAINTS","LAST_THINGS","MERCY"],["Saint Teresa of Avila","Souls in Purgatory"],[],{existingPrayerSlots:["COV-novena.holy_souls","STG-novena.holy_souls-01","COV-foundations_eternal_rest","COV-dead_de_profundis","COV-dead_fidelium_deus","STG-pray.penitential_psalms-06"]},"Devotional scene, not direct scriptural incident"),
  entry("artwork-pending:03",null,"Pentecost","Mateo Cerezo","Descent of the Holy Spirit at Pentecost",["HOLY_SPIRIT","MARY"],["Holy Spirit","Apostles","Virgin Mary — verify in specific image"],["Acts 2:1-4"],{existingPrayerSlots:["HERO-14","COV-sacrament_come_holy_spirit","STG-pray.rosary-14","COV-novena.holy_ghost","STG-novena.holy_ghost-01"]}),
  entry("artwork-pending:04",null,"Agony in the Garden — Antwerp Rosary cycle","David Teniers the Elder","Agony in Gethsemane",["PASSION"],["Jesus Christ","Apostles","Angel — exact figures to verify"],["Matthew 26:36-46"],{existingPrayerSlots:["HERO-06","STG-pray.rosary-07","STG-pray.precious_blood-02","STG-pray.tenebrae-01"]}),
  entry("artwork-pending:05",null,"Presentation of Jesus at the Temple","Philippe de Champaigne","Presentation of the infant Christ in the Temple",["INCARNATION","MARY"],["Jesus Christ","Virgin Mary","Saint Joseph","Simeon"],["Luke 2:22-35"],{existingPrayerSlots:["HERO-04","STG-pray.rosary-05","STG-prayer.seven_sorrows_chaplet-01","STG-pray.st_joseph_seven_sorrows-04"]},"Brussels 1648 inventory 25; never confuse with Dijon 1628 CA104"),
  entry("artwork-pending:06",null,"Saint Thomas Aquinas","Carlo Crivelli","Saint Thomas Aquinas, Dominican Doctor of the Church",["SAINTS","EUCHARIST"],["Saint Thomas Aquinas"],[],{existingPrayerSlots:["COV-benediction_o_salutaris","COV-benediction_tantum_ergo","STG-pray.benediction-02","STG-pray.litany_saints-05"]},"Eucharistic connection is theological/liturgical, not a depicted biblical scene"),
  entry("artwork-pending:07",null,"Adoration of the Mystic Lamb","Hubert and Jan van Eyck","Apocalyptic worship of the Lamb, symbolic depiction",["EUCHARIST","LAST_THINGS","SAINTS"],["Lamb of God","Angels","Saints and worshippers"],["Apocalypse 5:6-14","Apocalypse 7:9-17"],{existingPrayerSlots:["STG-pray.benediction-04","COV-pray.litany_saints","STG-pray.litany_saints-06"]},"Symbolic theological scene, not a literal painting of a single Gospel episode"),
  entry("artwork-pending:08",null,"Archangel Michael Defeating Satan","Guido Reni","Saint Michael's victory over Satan",["ANGELS","LAST_THINGS"],["Saint Michael the Archangel","Satan"],["Apocalypse 12:7-9"],{existingPrayerSlots:["COV-novena.st_michael","COV-mass_devotion_leonine","COV-devotion_prayer_st_michael"]},"Rome original; do not substitute Stockholm's copy"),
  entry("artwork-pending:09",null,"Miracle of Loaves and Fishes","Giovanni Lanfranco","Miracle of the multiplication of loaves and fishes",["MINISTRY","EUCHARIST"],["Jesus Christ","Apostles","Crowd"],["John 6:1-14"],{existingPrayerSlots:["COV-foundations_our_father","COV-foundations_grace_before_meals","COV-foundations_grace_after_meals"]},"NGI.72; Eucharistic association is theological typology"),
  ...SACRED_ART_HOLY_TRINITY_OWNER_SELECTED_V1
]);
const byId=new Map(SACRED_ART_CURATED_WORKS_V1.map(w=>[w.id,w]));
export function sacredArtWorkById(id){return byId.get(id)??null;}
export function sacredArtReleasedPhotoClassification(moduleId){
 return byId.get("released-photo:"+String(moduleId??""))??null;
}
export function sacredArtWorksInCategory(categoryId,{releasedOnly=false}={}){
 if(!Object.hasOwn(SACRED_ART_CATEGORIES_V1,categoryId))return [];
 return SACRED_ART_CURATED_WORKS_V1.filter(w=>w.categoryIds.includes(categoryId)&&(!releasedOnly||Boolean(w.photoModuleId)));
}
export function sacredArtMatchesForPrayerSlot(slot){
 return SACRED_ART_CURATED_WORKS_V1.filter(w=>w.existingMatching.existingPrayerSlots.includes(slot));
}
