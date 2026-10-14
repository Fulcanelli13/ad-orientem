import {parseScriptureContext,scriptureContextCapsule} from "../scripture/context.js";
import {NOVENA_CORPUS_V4_IDS} from "./novena-corpus-v4.js";

/**
 * Optional biblical study next to existing 16 novenas, not historical proof
 * of their prayer texts, indulgences or feast-day conditions. Scripture
 * source references are explicit; nothing is harvested from prayer text.
 * The canonical Bible reader owns witnesses, commentary and translations.
 */
export const NOVENA_SCRIPTURE_CONTEXT_V1=Object.freeze({
 holy_ghost:{reference:"Acts 2:1–4",relation:"BIBLICAL_EVENT",
  en:"Pentecost: the descent of the Holy Ghost upon the disciples.",
  fr:"La Pentecôte : la descente du Saint-Esprit sur les disciples."},
 christmas:{reference:"Luke 2:1–20",relation:"BIBLICAL_EVENT",
  en:"The Nativity of Our Lord; the novena's prayers are distinct from the Gospel.",
  fr:"La Nativité de Notre-Seigneur ; les prières de la neuvaine sont distinctes de l'Évangile."},
 corpus_christi:{reference:"John 6:48–58",relation:"THEOLOGICAL_ASSOCIATION",
  en:"Our Lord's Bread of Life discourse illuminates Eucharistic devotion; it is not the historical novena text.",
  fr:"Le discours sur le Pain de vie éclaire la dévotion eucharistique ; ce n'est pas le texte historique de la neuvaine."},
 sacred_heart:{reference:"John 19:31–37",relation:"DEVOTIONAL_MEDITATION",
  en:"The piercing of Christ's side is contemplated in Sacred Heart devotion; this passage does not prescribe a novena.",
  fr:"Le côté transpercé du Christ est médité dans la dévotion au Sacré-Cœur ; le passage ne prescrit pas de neuvaine."},
 immaculate_conception:{reference:"Luke 1:26–38",relation:"DOCTRINAL_ASSOCIATION_NOT_PROOF",
  en:"The Annunciation offers Marian biblical context; it does not itself state the later dogmatic definition of the Immaculate Conception.",
  fr:"L'Annonciation donne le contexte biblique marial ; elle ne formule pas elle-même la définition dogmatique de l'Immaculée Conception."},
 annunciation:{reference:"Luke 1:26–38",relation:"BIBLICAL_EVENT",
  en:"Gabriel's announcement to Mary and her assent belong to the Gospel; the novena's other prayers are later devotions.",
  fr:"L'annonce de Gabriel et le consentement de Marie appartiennent à l'Évangile ; les autres prières de la neuvaine sont postérieures."},
 assumption:{reference:"Revelation 12:1–6",relation:"TYPOLOGICAL_READING_NOT_HISTORICAL_REPORT",
  en:"The woman clothed with the sun is read in Marian typology; Revelation does not narrate Mary's bodily Assumption as an eyewitness event.",
  fr:"La Femme revêtue du soleil reçoit une lecture typologique mariale ; l'Apocalypse ne raconte pas l'Assomption corporelle de Marie comme un témoignage oculaire."},
 seven_sorrows:{reference:"Luke 2:34–35",relation:"BIBLICAL_EVENT",
  en:"Simeon's prophecy of a sword that will pierce Mary's soul; the sevenfold devotional arrangement is subsequent.",
  fr:"La prophétie de Siméon sur le glaive qui transpercera l'âme de Marie ; la dévotion aux sept douleurs est postérieure."},
 st_joseph:{reference:"Matthew 1:18–25",relation:"BIBLICAL_EVENT",
  en:"The angel's message to Joseph and his faithful response; the novena itself is a later devotion.",
  fr:"Le message de l'ange à Joseph et sa réponse fidèle ; la neuvaine elle-même est une dévotion postérieure."},
 holy_souls:{reference:"2 Maccabees 12:43–46",relation:"DOCTRINAL_ASSOCIATION_NOT_PROOF",
  en:"Prayer and offerings for the dead in the deuterocanonical book; not the wording of this novena or a complete treatise on purgatory.",
  fr:"Prière et offrandes pour les défunts dans le livre deutérocanonique ; ce n'est ni le texte de la neuvaine ni un traité complet du purgatoire."},
 perpetual_help:{reference:"John 19:25–27",relation:"DEVOTIONAL_MEDITATION",
  en:"Christ entrusts Mary and the beloved disciple to one another; the passage does not describe or date the icon of Perpetual Help.",
  fr:"Le Christ confie Marie et le disciple bien-aimé l'un à l'autre ; le passage ne décrit ni ne date l'icône du Perpétuel Secours."},
 st_therese:{reference:"Matthew 18:1–5",relation:"DEVOTIONAL_MEDITATION",
  en:"Spiritual childhood in Christ's teaching is a theme for meditation, not a quotation from St Thérèse's writings.",
  fr:"L'enfance spirituelle dans l'enseignement du Christ est un thème de méditation, non une citation des écrits de sainte Thérèse."},
 st_anthony_nine_tuesdays:{reference:"Luke 15:3–7",relation:"DEVOTIONAL_MEDITATION",
  en:"Christ's parable of the lost sheep offers a theme for prayer; it does not recount St Anthony's life or establish the Nine Tuesdays.",
  fr:"La parabole de la brebis perdue nourrit la prière ; elle ne raconte pas la vie de saint Antoine et n'institue pas les neuf mardis."},
 christ_the_king:{reference:"John 18:33–37",relation:"BIBLICAL_EVENT",
  en:"Christ's testimony about His kingship before Pilate; the 1925 feast and novena are later liturgical and devotional acts.",
  fr:"Le témoignage de la royauté du Christ devant Pilate ; la fête de 1925 et la neuvaine sont des actes liturgiques et dévotionnels postérieurs."},
 immaculate_heart:{reference:"Luke 2:19",relation:"DEVOTIONAL_MEDITATION",
  en:"Mary treasures and ponders these things in her heart; this verse is not the full doctrinal account of the Immaculate Heart devotion.",
  fr:"Marie garde et médite ces choses dans son cœur ; ce verset ne résume pas toute la doctrine de la dévotion au Cœur Immaculé."},
 st_michael:{reference:"Revelation 12:7–9",relation:"BIBLICAL_EVENT",
  en:"Michael and his angels' battle is biblical imagery; the Leonine prayer used in this novena is a later composition.",
  fr:"Le combat de Michel et de ses anges appartient à l'imagerie biblique ; la prière léonine de cette neuvaine est une composition postérieure."}
});
const escape=value=>String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
export const NOVENA_SCRIPTURE_RELATIONSHIPS=Object.freeze([
 "BIBLICAL_EVENT","THEOLOGICAL_ASSOCIATION","DEVOTIONAL_MEDITATION",
 "DOCTRINAL_ASSOCIATION_NOT_PROOF","TYPOLOGICAL_READING_NOT_HISTORICAL_REPORT"
]);
const ids=Object.keys(NOVENA_SCRIPTURE_CONTEXT_V1);
if(ids.length!==NOVENA_CORPUS_V4_IDS.length ||
 ids.some((id,index)=>id!==NOVENA_CORPUS_V4_IDS[index]))throw new Error("Novena Scripture links drifted from the canonical 16-target corpus");
for(const [id,row] of Object.entries(NOVENA_SCRIPTURE_CONTEXT_V1)){
 if(!NOVENA_SCRIPTURE_RELATIONSHIPS.includes(row.relation)||
    !row.en||!row.fr||!parseScriptureContext(row.reference))
  throw new Error("Invalid source-bounded novena biblical context: "+id);
}
export function novenaScriptureContext(id){return NOVENA_SCRIPTURE_CONTEXT_V1[id]??null}
export function novenaScriptureContextHtml(id,{french=false}={}){
 const source=novenaScriptureContext(id);
 if(!source)return "";
 const lang=french?"fr":"en";
 const heading=french?"Passage biblique à méditer":"Scripture for meditation";
 const note=french
  ?"Étude facultative : ce lien éclaire la dévotion, mais n'est ni une citation de la neuvaine ni une preuve de ses origines ou de ses indulgences."
  :"Optional study: this passage illuminates the devotion, but is neither a quotation from the novena nor proof of its origins or indulgences.";
 return '<details class="aoN1Details aoN1ScriptureContext" data-n1-scripture-context="'+escape(id)+'"><summary>'+
  escape(heading)+'</summary><p class="aoN1Fine">'+escape(note)+'</p>'+
  scriptureContextCapsule(source.reference,{french})+
  '<p class="aoN1Fine">'+escape(source[lang])+'</p></details>';
}
