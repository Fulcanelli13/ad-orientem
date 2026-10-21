/**
 * Research-only source-owner frame for two easily confused liturgical topics.
 * Never determines doctrine, produces an answer, or infers the visitor's guilt.
 * Differentiates lay Rosary at Mass, personal thanksgiving after Communion,
 * and clergy's interior meditation rather than treating words as synonyms.
 */
const normalise=value=>String(value??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"")
 .toLowerCase().replace(/[’‘']/g," ").replace(/[^a-z0-9 ]+/g," ")
 .replace(/\s+/g," ").trim();
const seen=(q,re)=>re.test(q);
const R={
 rosary:/\b(rosary|chaplet|decades?|rosaire|chapelet)\b/,
 mass:/\b(mass|messe|missa|holy sacrifice|divine sacrifice|sacrifice de la messe|sacrifice|liturg(?:y|ie)|celebran(?:t|ts)|celebrat(?:e|es|ed|ing|ion)|celebr(?:e|er|ait|ant|ent|ation)|officie|officiait)\b/,
 clergy:/\b(priest|priests|clergy|pretre|pretres|celebrant|celebrants|pastor|pasteur|cure|ministre)\b/,
 lay:/\b(lay|laity|laypeople|layperson|worshippers?|congregants?|congregation|faithful|people|parishioners?|fidele|fideles|laic|laics|paroissien|paroissiens|assistance)\b/,
 prayer:/\b(think|thinking|attention|reflection|reflect|participat(?:e|ion|ing)|pray|prayer|prayers|praying|meditat(?:e|es|ion|ing)|mental prayer|contemplation|prie|prier|priere|prieres|medit(?:e|er|ation)|oraison|recit(?:e|er|ation)|chapelet|rosaire)\b/,
 reception:/\b(receiv(?:e|es|ed|ing)|reception|received|recevoir|recu|recue|recevant|communie|communier)\b/,
 eucharist:/\b(communion|host|hostie|eucharist|eucharistie|blessed sacrament|corps du christ|body of christ|corps de notre seigneur|sainte table)\b/,
 after:/\b(after|follow|follows|following|once|afterwards|ensuite|apres|aussitot apres|apres avoir|following reception|once i)\b/,
 inward:/\b(thanksgiving|thank|thanks|gratitude|quiet|silence|silent|recollection|recollected|adoration|devotion|attitude|interior|inward|acts|prayer|prayers|pray|remercier|remerciement|remercions|graces|action de graces|recueillement|silencieuse|silencieux|silence|adoration|attitude|prier|priere|oraison|faire)\b/,
 priestPostcommunion:/\b(postcommunion|post communion prayer|postcommunion prayer|collect after communion|oraison de postcommunion|priest says|pretre recite|pretre dit)\b/,
 ontology:/\b(real presence|presence reelle|tabernacle|sacred vessel|symbol of jesus|substance|substance du christ|transubstantiation)\b/
};
export function scopeLiturgicalQuestion(question,{language="en"}={}){
 const q=normalise(question);
 if(!q)return null;
 const rosary=seen(q,R.rosary),mass=seen(q,R.mass);
 const firstPersonAct=/\b(may i|can i pray|can i say|i pray|my own prayers|my prayer during|je prie|puis je prier|mes prieres pendant)\b/.test(q);
 const lay=seen(q,R.lay)||firstPersonAct,prayer=seen(q,R.prayer),clergy=seen(q,R.clergy);
 // A 1905 historical permission for lay Rosary cannot itself adjudicate
 // whether a visitor is sinful or morally culpable in a particular Mass.
 if(rosary&&mass&&/\b(sin|sins|sinful|sinned|mortal sin|grave sin|guilt|guilty|peche|peche mortel|culpable|culpabilite)\b/.test(q))
  return Object.freeze({kind:"ABSTAIN",
   reason:"ROSARY_AT_MASS_MORAL_CULPABILITY_NOT_IN_SOURCE",
   scope:"HISTORICAL_PERMISSION_NOT_AN_INDIVIDUAL_SIN_VERDICT"});
 // The priest mentioned as celebrant is not necessarily the person whose
 // prayer or meditation is in question; grammatical lay subject takes priority.
 if(rosary&&mass&&!seen(q,/\b(priest s own rosary|priest himself recites|pretre lui meme recite)\b/))
  return Object.freeze({kind:"SOURCE_OWNER",sourceId:"SPX-PILOT-02",
   scope:"LAY_ROSARY_DURING_MASS",language});
 const eucharist=seen(q,R.eucharist);
 // The priest's *Postcommunion* is a liturgical oration, NOT a lay
 // communicant's private thanksgiving or Sarto's Salzano instruction.
 const officialPostcommunion=seen(q,/\b(postcommunion|post communion|oraison de postcommunion)\b/)
  ||(clergy&&seen(q,/\b(liturgical prayer|oraison liturgique|prayer said by the priest|priere dite par le pretre)\b/)
   &&seen(q,/\b(after communion|apres la communion|following communion)\b/));
 if(officialPostcommunion)return Object.freeze({kind:"EXISTING_TOPIC_OWNER",
  topicId:"mass.postcommunion",scope:"PRIEST_LITURGICAL_ORATION_NOT_PRIVATE_THANKSGIVING"});
 const afterReception=seen(q,R.after)&&seen(q,R.reception)&&eucharist;
 if(afterReception&&!seen(q,R.priestPostcommunion)&&!seen(q,R.ontology)){
  if(seen(q,R.inward))
   return Object.freeze({kind:"SOURCE_OWNER",sourceId:"SPX-PILOT-04",
    scope:"PERSONAL_THANKSGIVING_AFTER_RECEPTION",language});
  return Object.freeze({kind:"ABSTAIN",reason:"POST_RECEPTION_SCOPE_UNSPECIFIED",
   scope:"NOT_ENOUGH_TO_LOCATE_THANKSGIVING_PASSAGE"});
 }
 if(mass&&lay&&prayer){
  // A broad question about faithful prayer cannot borrow a priestly
  // exhortation merely because it mentions the celebrant or meditation.
  // Restrict to a source only if a precise, independently owned topic exists.
  return Object.freeze({kind:"ABSTAIN",reason:"LAY_MASS_PRAYER_SOURCE_NOT_IDENTIFIED",
   scope:"LAY_PRAYER_NOT_PRIESTLY_MEDITATION"});
 }
 // A priest's own interior meditation is covered by Haerent animo's
 // separately indexed topic; do not pre-empt the existing two-facet guard.
 return null;
}
