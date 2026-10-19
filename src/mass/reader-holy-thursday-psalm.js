// Holy Thursday altar-stripping Psalm 21 (Pian Psalter) bilingual text.
// Each translation follows one pre-existing complete Latin source row in
// reader-holy-thursday-post.v1.json. Latin/event identifiers remain donor-owned.
// Distinguish source completeness from performed extent: the 1962 Missal directs
// clerics, when present, to continue *until the altars are stripped*; if absent,
// only the antiphon and FIRST VERSE are recited by the celebrant.
// Read the printed rubrics, not the duration of a timer.
export const HOLY_THURSDAY_PSALM_SOURCE=Object.freeze({
  translation:"AD_ORIENTEM_ORIGINAL_EDITORIAL_LATIN_PARALLEL_NOT_1962_APPROVED_VERNACULAR",
  latinWitness:"https://propria.org/wp-content/uploads/2019/04/propers-for-holy-thursday-ps.-21-from-pian-psalter.pdf",
  romanRubricWitness:"https://archive.ccwatershed.org/pdfs/5183-holy-thursday-excerpt-1965-missal/download/",
  // This 1965 bilingual printing confirms the revised Holy Week ceremonial
  // rubric, not an edition claim about this translation of the Pian Psalter.
  romanRubric:"Celebrans dicit clara voce ... Clerici, si adsunt, prosequuntur recitationem huius psalmi, usque dum altarium denudatio peracta sit; alioquin celebrans dicat antiphonam et primum tantum versum psalmi ante denudationem altaris maioris.",
  canonicalLatinSource:"data/presentation/reader-holy-thursday-post.v1.json#stripping",
  verseGroups:13,
  note:"The 13 source rows are verse-groups, not 13 numbered psalm verses; no Gloria Patri is supplied at this solemnity.",
});
const A=Object.freeze({
  english:"They divide my garments among them, and cast lots for my clothing.",
  french:"Ils se partagent mes vêtements et tirent au sort ma tunique.",
});
const T=Object.freeze([
  Object.freeze({
    english:"My God, my God, why have You forsaken me? You are far from my pleas, from the words of my cry. My God, I call by day and You do not answer; by night, and You do not heed me.",
    french:"Mon Dieu, mon Dieu, pourquoi m'avez-vous abandonné ? Vous êtes loin de mes supplications, des paroles de mon cri. Mon Dieu, je crie le jour et vous ne répondez pas ; la nuit, et vous ne m'écoutez pas.",
  }),
  Object.freeze({
    english:"Yet You dwell in the sanctuary, the praise of Israel. In You our fathers trusted; they trusted, and You delivered them. They cried to You and were saved; in You they trusted and were not put to shame.",
    french:"Pourtant, vous habitez dans le sanctuaire, vous qui êtes la louange d'Israël. En vous nos pères ont espéré ; ils ont espéré et vous les avez délivrés. Ils ont crié vers vous et furent sauvés ; ils ont espéré en vous et ne furent pas confondus.",
  }),
  Object.freeze({
    english:"But I am a worm and no man, the reproach of men and the scorn of the people. All who see me mock me; they stretch their lips and shake their heads: ‘He trusts in the Lord; let Him deliver him, let Him rescue him, if He loves him.’",
    french:"Mais moi, je suis un ver et non un homme, l'opprobre des hommes et le mépris du peuple. Tous ceux qui me voient se moquent de moi ; ils ouvrent les lèvres et hochent la tête : « Il se confie au Seigneur ; qu'il le délivre, qu'il le sauve, s'il l'aime ! »",
  }),
  Object.freeze({
    english:"Yet it was You who brought me forth from the womb; You kept me safe at my mother's breast. To You I was entrusted from birth; from my mother's womb You have been my God. Do not stand far from me, for distress is near; be close, for there is none to help.",
    french:"C'est pourtant vous qui m'avez tiré du sein maternel ; vous m'avez donné la sécurité sur la poitrine de ma mère. Dès ma naissance je fus confié à vous ; dès le sein de ma mère, vous êtes mon Dieu. Ne restez pas loin de moi, car la détresse est proche ; soyez près de moi, car personne ne vient à mon secours.",
  }),
  Object.freeze({
    english:"Many young bulls surround me; the bulls of Bashan encircle me. They open their mouths against me like a ravening, roaring lion. I am poured out like water, and all my bones are disjointed. My heart has become like wax, melting within my breast.",
    french:"De nombreux jeunes taureaux m'entourent ; les taureaux de Basan m'encerclent. Ils ouvrent contre moi leur gueule, comme un lion ravisseur et rugissant. Je suis répandu comme l'eau, et tous mes os sont disloqués. Mon cœur est devenu comme la cire ; il fond au-dedans de moi.",
  }),
  Object.freeze({
    english:"My throat is dry as a potsherd, and my tongue clings to my jaws; You have brought me down to the dust of death. For many dogs surround me; a band of evildoers encircles me. They have pierced my hands and my feet; I can count all my bones.",
    french:"Ma gorge est desséchée comme un tesson, et ma langue s'attache à mon palais ; vous m'avez fait descendre dans la poussière de la mort. Car de nombreux chiens m'entourent ; une troupe de malfaiteurs m'encercle. Ils ont percé mes mains et mes pieds ; je puis compter tous mes os.",
  }),
  Object.freeze({
    english:"They look on and gaze at me with delight; they divide my garments among them, and cast lots for my clothing. But You, O Lord, do not stand far away: my strength, make haste to help me.",
    french:"Ils me regardent et se réjouissent de me voir ; ils se partagent mes vêtements et tirent au sort ma tunique. Mais vous, Seigneur, ne restez pas loin : vous qui êtes ma force, hâtez-vous de me secourir.",
  }),
  Object.freeze({
    english:"Rescue my life from the sword, and my life from the power of the dog. Save me from the lion's mouth, and my afflicted self from the horns of wild oxen. I will proclaim Your name to my brothers; in the midst of the assembly I will praise You.",
    french:"Délivrez ma vie de l'épée, et mon existence du pouvoir du chien. Sauvez-moi de la gueule du lion, et moi, misérable, des cornes des buffles. J'annoncerai votre nom à mes frères ; au milieu de l'assemblée je vous louerai.",
  }),
  Object.freeze({
    english:"You who fear the Lord, praise Him; all the offspring of Jacob, glorify Him; all the offspring of Israel, fear Him. For He has neither despised nor scorned the misery of the afflicted, nor hidden His face from him; when he cried to Him, He heard.",
    french:"Vous qui craignez le Seigneur, louez-le ; toute la descendance de Jacob, célébrez-le ; toute la descendance d'Israël, craignez-le. Car il n'a ni méprisé ni dédaigné la détresse du malheureux ; il ne lui a pas caché sa face et, lorsqu'il a crié vers lui, il l'a entendu.",
  }),
  Object.freeze({
    english:"From You comes my praise in the great assembly; I will fulfil my vows before those who fear Him. The poor shall eat and be satisfied; those who seek the Lord shall praise Him. May your hearts live for ever.",
    french:"De vous vient ma louange dans la grande assemblée ; j'accomplirai mes vœux devant ceux qui le craignent. Les pauvres mangeront et seront rassasiés ; ceux qui cherchent le Seigneur le loueront. Que vos cœurs vivent à jamais.",
  }),
  Object.freeze({
    english:"All the ends of the earth shall remember and turn to the Lord; all the families of the nations shall bow down before Him. For kingship belongs to the Lord, and He rules over the nations.",
    french:"Toutes les extrémités de la terre se souviendront et se tourneront vers le Seigneur ; toutes les familles des nations se prosterneront devant lui. Car la royauté appartient au Seigneur, et c'est lui qui domine les nations.",
  }),
  Object.freeze({
    english:"Him alone shall worship all who sleep in the earth; before Him shall bow all who descend into the dust. And my soul shall live for Him; my descendants shall serve Him.",
    french:"Lui seul sera adoré par tous ceux qui dorment dans la terre ; devant lui se courberont tous ceux qui descendent dans la poussière. Et mon âme vivra pour lui ; ma descendance le servira.",
  }),
  Object.freeze({
    english:"A coming generation shall tell of the Lord, and they shall proclaim His justice to a people yet to be born: ‘The Lord has done this.’",
    french:"La génération à venir parlera du Seigneur ; on annoncera sa justice à un peuple qui naîtra : « Voilà ce que le Seigneur a fait. »",
  }),
]);
const FIRST_LATIN="Deus meus, Deus meus, quare me dereliquísti? Longe abes a précibus, a verbis clamóris mei.";
const FIRST_EN="My God, my God, why have You forsaken me? You are far from my pleas, from the words of my cry.";
const FIRST_FR="Mon Dieu, mon Dieu, pourquoi m'avez-vous abandonné ? Vous êtes loin de mes supplications, des paroles de mon cri.";
export function buildHolyThursdayPsalmRows(stripping,{clericsPresent=null}={}){
  if(clericsPresent!==null && typeof clericsPresent!=="boolean")
    throw new Error("HOLY_THURSDAY_CLERICS_FLAG_MUST_BE_EXPLICIT_BOOLEAN_OR_UNKNOWN");
  const latin=String(stripping?.antiphon??"").trim();
  const repeated=String(stripping?.repeatAntiphon??"").trim();
  const verses=stripping?.psalm21Pian;
  if(!latin.startsWith("Divídunt sibi")||latin!==repeated ||
    !Array.isArray(verses)||verses.length!==HOLY_THURSDAY_PSALM_SOURCE.verseGroups ||
    !String(verses[0]).startsWith(FIRST_LATIN) ||
    !String(verses[0]).includes("Deus meus, clamo per diem") ||
    !String(verses.at(-1)).includes("Hæc fecit Dóminus"))
    throw new Error("HOLY_THURSDAY_PSALM_WITNESS_CHANGED_RECOLLATION_REQUIRED");
  const row=(id,kind,body,en,fr)=>Object.freeze({
    id,kind,latin:String(body).trim(),english:en,french:fr,
    sourceRecordId:"HT-STRIP-010",
    sourceStatus:HOLY_THURSDAY_PSALM_SOURCE.translation,
  });
  const full=Object.freeze([
    row("HT-R05-A1","TEXT",latin,A.english,A.french),
    ...verses.map((body,i)=>row("HT-R05-P"+(i+1),"TEXT",body,T[i].english,T[i].french)),
    row("HT-R05-A2","TEXT",repeated,A.english,A.french),
  ]);
  if(clericsPresent===false){
    // ONLY the first complete 1945-Pian-Psalter verse. The donor row
    // bundles more than one biblical verse: using the first row unchanged
    // would falsely include 'Deus meus, clamo per diem'.
    const short=Object.freeze([
      full[0],
      row("HT-R05-P1-FIRSTVERSE","TEXT",FIRST_LATIN,FIRST_EN,FIRST_FR),
      full.at(-1),
    ]);
    return Object.freeze({rows:short,referenceRows:full,
      performance:"CELEBRANT_FIRST_VERSE_ONLY_NO_CLERICS",
      completedRecitation:false,clericsPresent:false});
  }
  return Object.freeze({rows:full,referenceRows:full,
    performance:clericsPresent===true
      ?"CLERICS_RECITE_UNTIL_STRIPPING_COMPLETE"
      :"CLERICS_UNRESOLVED_FULL_PSALM_REFERENCE_ONLY",
    completedRecitation:false,clericsPresent});
}
