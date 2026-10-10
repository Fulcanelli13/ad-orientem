/**
 * Prayer Library source-bounded context. It describes existing editorial
 * categories and safe reader use, not newly approved histories, indulgences,
 * ritual rubrics or putative 1962 editions.
 */
const GROUPS=Object.freeze({
  essentials:Object.freeze({
    en:["These foundational prayers are available individually here, without prescribing a compulsory daily sequence.","Pray the selected text attentively. If it occurs in a public rite or a longer devotion, follow that rite or devotion for its actual order."],
    fr:["Ces prières fondamentales sont proposées séparément, sans imposer une séquence quotidienne.","Priez attentivement le texte choisi. S’il fait partie d’un rite public ou d’une dévotion plus longue, suivez l’ordre propre à ce rite ou à cette dévotion."]
  }),
  massdev:Object.freeze({
    en:["These are prayers associated with traditional Mass devotion; this standalone library is not the live order of Mass.","For participation in Mass, use the Mass reader and follow what is actually taking place; do not use the Library as a substitute for the rite."],
    fr:["Ces prières sont associées aux dévotions traditionnelles autour de la Messe ; ce recueil ne présente pas le déroulement de la Messe en direct.","Pour suivre la Messe, utilisez le lecteur de Messe et suivez le rite réellement célébré ; ce recueil ne le remplace pas."]
  }),
  marian:Object.freeze({
    en:["The collection groups Marian prayers and distinct witnessed forms. A shared title does not mean different editions are interchangeable.","Read the selected form as printed, and consult its Source / provenance disclosure for the particular textual witness."],
    fr:["Cette collection réunit des prières mariales et des formes textuelles distinctes. Un même titre ne rend pas les éditions interchangeables.","Priez la forme affichée et consultez « Source / provenance » pour connaître le témoin textuel."]
  }),
  eucharistic:Object.freeze({
    en:["These prayers and hymns concern Eucharistic devotion; a standalone text is not a complete order for a public service.","Use the prayer privately where appropriate. During public Adoration or Benediction follow the prayers, ministers and ceremonial actually in use."],
    fr:["Ces prières et hymnes relèvent de la dévotion eucharistique ; un texte isolé ne constitue pas l’ordre complet d’un office public.","Utilisez la prière à titre privé lorsque cela convient. Lors d’une adoration publique ou de la Bénédiction, suivez les prières, les ministres et le cérémonial effectivement employés."]
  }),
  saints:Object.freeze({
    en:["This category brings together prayers concerning saints, the Church and protection; their purposes are not all identical.","Use the selected text without assuming a required novena, fixed repetition count or posture not specified in its source."],
    fr:["Cette catégorie réunit des prières relatives aux saints, à l’Église et à la protection ; leurs finalités ne sont pas toutes identiques.","Priez le texte choisi sans supposer une neuvaine obligatoire, un nombre fixe de répétitions ou une posture que sa source ne prescrit pas."]
  }),
  holyghost:Object.freeze({
    en:["These texts are grouped by their invocation of the Holy Ghost. They may belong to different devotional or liturgical settings.","Follow the printed text, and distinguish personal prayer from the use of a hymn or sequence in an actual public rite."],
    fr:["Ces textes sont regroupés selon leur invocation du Saint-Esprit. Ils peuvent appartenir à des contextes dévotionnels ou liturgiques différents.","Suivez le texte imprimé et distinguez la prière personnelle de l’usage d’un hymne ou d’une séquence dans un rite public."]
  }),
  hearts:Object.freeze({
    en:["The prayers are grouped around the Sacred Heart and reparation; they are separate acts, not stages that must all be completed.","Select and pray the text attentively. Do not treat a short aspiration as a substitute for a distinct consecration or litany."],
    fr:["Ces prières sont regroupées autour du Sacré-Cœur et de la réparation ; elles sont des actes distincts, non des étapes obligatoires.","Choisissez le texte et priez-le attentivement. Ne confondez pas une courte aspiration avec une consécration ou des litanies distinctes."]
  }),
  canticles:Object.freeze({
    en:["These are biblical canticles, presented in the Prayer Library for reading or prayer. Scripture reference details are shown when available.","Read or recite the text without assuming that this standalone view reproduces the ceremonial or musical form of a liturgical office."],
    fr:["Il s’agit de cantiques bibliques, présentés ici pour la lecture ou la prière. Les références bibliques sont affichées lorsqu’elles sont disponibles.","Lisez ou récitez le texte sans supposer que cette page reproduit le cérémonial ou la forme musicale d’un office liturgique."]
  }),
  dead:Object.freeze({
    en:["These are prayers for the departed, including prayers of suffrage and a biblical psalm.","Pray for the departed using the text given. This private reader does not simulate funeral rites, the priest's absolution or another public ceremony."],
    fr:["Ces prières sont destinées aux défunts, notamment des suffrages et un psaume biblique.","Priez pour les défunts avec le texte donné. Ce lecteur privé ne simule ni les rites funéraires, ni l’absoute sacerdotale, ni un autre cérémonial public."]
  })
});
const LORETO_VARIANTS=Object.freeze({
  litany_loreto_1962:Object.freeze({
    en:"This is the separately indexed historical Loreto form; do not silently append invocations from the current form.",
    fr:"Il s’agit de la forme historique de Lorette, indexée séparément ; n’y ajoutez pas silencieusement les invocations de la forme actuelle."
  }),
  litany_loreto_current:Object.freeze({
    en:"This is the separately indexed current Loreto form; do not silently back-project its wording into 1962.",
    fr:"Il s’agit de la forme actuelle de Lorette, indexée séparément ; n’en reportez pas silencieusement le texte en 1962."
  })
});
export const PRAYER_LIBRARY_GUIDE_CATEGORIES=Object.freeze(Object.keys(GROUPS));
export function libraryGuideForPrayer(prayer,{french=false}={}){
  if(!prayer||typeof prayer!=="object"||!prayer.id)return null;
  const group=GROUPS[prayer.category];
  if(!group)return null; // fail closed for unreviewed category
  const lang=french?"fr":"en";
  const [context,practice]=group[lang];
  const p=prayer.provenance||{};
  const witness=String(p.witness||prayer.source||"").trim()||null;
  return Object.freeze({
    id:String(prayer.id),category:String(prayer.category),
    context,practice,witness,
    versionNote:LORETO_VARIANTS[prayer.id]?.[lang]??null,
  });
}
