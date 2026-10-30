/**
 * Research-only, language-aware safety guard for *individual* spiritual verdicts.
 *
 * A catechism topic can define grace, temptation, and conditions for sin;
 * it cannot determine a visitor's subjective culpability, interior state,
 * God's judgment, or the validity of their particular confession.
 *
 * This gate classifies question INTENT, not whether a person is morally guilty.
 * It never produces theological or pastoral answers.
 */
const fold=v=>String(v??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"")
 .toLowerCase().replace(/[’‘']/g," ").replace(/[^a-z0-9 ]+/g," ")
 .replace(/\s+/g," ").trim();

function english(text){
 // Historical moral teaching cannot certify another living person's guilt.
 const thirdPartyCase=/\b(can i declare|may i declare|can i accuse|may i accuse|can i judge|may i judge|can i condemn|may i condemn)\b/.test(text)
  &&/\b(person|personnel|musician|director|singer|neighbor|neighbour|priest|someone|friend|parishioner)\b/.test(text)
  &&/\b(mortal sin|grave sin|damned|guilty|heretic|culpable|lost grace)\b/.test(text);
 if(thirdPartyCase)return true;
 // Second-person autobiographical assessments are still individual
 // spiritual diagnoses, not an invitation to retrieve doctrinal definitions.
 const secondPersonCase=/\b(did your|does your|do your|has your|have your|were your)\b/.test(text)
  &&/\b(distract\w*|tempt\w*|prayer|confession|soul|thought\w*|fault\w*|conscience)\b/.test(text)
  &&/\b(grace|salvation|mortal|guilty|guilt|sin|damnation|forgiven|abandoned|possess)\b/.test(text);
 if(secondPersonCase)return true;
 const personal=/\b(i|i'm|i've|me|my|mine|myself)\b/.test(text);
 if(!personal)return false;
 // A demand for the *definition* of grace does not become a personal verdict
 // just because the visitor also says that they are learning.
 const inquiry=/\b(have i|did i|am i|was i|has god|did god|does my|do my|is my|was my|can you (?:tell|determine|judge|assess|decide|know|diagnose|conclude)|could you (?:tell|determine|judge|assess|decide|diagnose|conclude)|tell me whether|tell me if|are you (?:sure|certain)|does (?:it|this|that) (?:prove|show|mean))\b/.test(text);
 if(!inquiry)return false;
 const verdict=/\b(sanctifying grace|state of grace|lost (?:my |the )?grace|forfeited grace|mortal sin|grave sin|committed sin|sin(?:ned)?|damned|damnation|saved|salvation|culpable|guilty|guilt|forgiven|forgave|abandoned|invalid|validity|valid confession|consented|consent to|spiritual state|condition of my soul|offended god|personally lost it)\b/.test(text);
 return verdict;
}
function french(text){
 const personal=/\b(je|j|moi|me|m|mon|ma|mes|mien|mienne|suis je|ai je)\b/.test(text);
 if(!personal)return false;
 const inquiry=/\b(ai je|suis je|avais je|est ce que (?:je|j|mon|ma|mes)|pouvez vous|peux tu|pourriez vous|dieu m a t il|m a t il|ma confession etait elle|(?:mon|ma|mes).{0,100}?(?:signifie|prouve|rend|demontre|indique)|(?:pouvez vous|peux tu).{0,60}?(?:conclure|determiner|juger))\b/.test(text);
 if(!inquiry)return false;
 const verdict=/\b(grace sanctifiante|etat de grace|perdu (?:la |ma )?grace|peche mortel|peche grave|peche|damne|damnee|damnation|salut|coupable|culpabilite|pardonne|abandonne|invalide|validite|consenti|consentement|etat de mon ame|jugement de dieu|offense dieu)\b/.test(text);
 return verdict;
}
export const PERSONAL_VERDICT_GAP_REASON="A historical catechism or papal document cannot determine this visitor's individual culpability, interior state, particular sacramental validity, or God's judgment from a question.";
export function screenPersonalSpiritualVerdict(question,{language="en"}={}){
 const n=fold(question);
 if(!n)return null;
 if(language==="fr"?french(n):english(n))
  return Object.freeze({reason:"UNSUPPORTED_PERSONAL_SPIRITUAL_VERDICT",
   scope:"INDIVIDUAL_SPIRITUAL_VERDICT_NOT_A_DOCTRINAL_DEFINITION",
   sourceGap:PERSONAL_VERDICT_GAP_REASON});
 return null;
}
