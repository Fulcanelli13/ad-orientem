/**
 * Distinguish historically sourced legislation from contemporary legal or
 * disciplinary rulings and assessments of specific living people.
 * Research-only: abstains, never states current Church law or infers fault.
 */
const normalise=v=>String(v??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"")
 .toLowerCase().replace(/[’‘']/g," ").replace(/[^a-z0-9 ]+/g," ")
 .replace(/\s+/g," ").trim();
export function screenContemporaryChurchDiscipline(question,{language="en"}={}){
 const s=normalise(question);
 if(!s)return null;
 const current=/\b(today|currently|current|nowadays|today s|modern|202[0-9]|in force|binding|aujourd hui|actuel|actuelle|actuellement|maintenant|de nos jours|en vigueur)\b/.test(s);
 const norms=/\b(law|laws|rule|rules|legally|legal|legality|binding|universal|forbidden|allowed|permitted|violation|violat|defying|interdit|interdite|interdits|permis|autorise|obligatoire|loi|lois|regle|regles|droit canonique|droit|canonique|universel|universelle|applicable|enfrein|sanction|validity)\b/.test(s);
 const worship=/\b(church|catholic|choir|choirmaster|liturg|music|musical|mass|messe|musique|chant|chorale|eglise|paroisse|paroissial|paroissiale|parish|catechism|catechesis|catechisme|catechese|sacrement|decree|decret|motu proprio|eucharist|eucharistie)\b/.test(s);
 const person=/\b(my parish|our parish|which director|which singer|this musician|ma paroisse|notre paroisse|quel directeur|quelle chorale|quel chanteur)\b/.test(s);
 if(worship&&((current&&norms)||(person&&norms)))
  return Object.freeze({reason:"CONTEMPORARY_DISCIPLINE_NOT_IN_HISTORICAL_SOURCE",
   scope:"PRESENT_DAY_OR_PERSON_SPECIFIC_LEGAL_JUDGMENT_UNVERIFIED",
   sourceGap:"Historical legislation and doctrinal passages do not establish a contemporary legal judgment about a current parish or individual."});
 return null;
}
