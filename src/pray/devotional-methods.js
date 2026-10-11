/**
 * Source-first devotional method registry — does NOT own the existing
 * AO_ROSARY_V381 bead state. Divine Mercy has its own distinct sequence.
 *
 * The short Divine Mercy invocations are independently set from the customary
 * formula, checked against Vatican News FR and Marian Fathers EN witnesses.
 * They are NOT presented as a verbatim edition of St Faustina's Diary.
 * Common prayers resolve to the canonical PRAY_CORPUS, never get copied here.
 */
export const DEVOTIONAL_METHODS_VERSION="rosary-methods-divine-mercy-v1";
export const DEVOTIONAL_METHOD_SOURCES=Object.freeze({
 mercyFr:"https://www.vaticannews.va/fr/priere/chapelet-de-la-divine-misericorde.html",
 mercyEn:"https://thedivinemercy.org/message/devotions/pray-the-chaplet",
 dominican:"https://rosaryconfraternity.org/the-rosary/how-to-pray-the-rosary/",
 dominicanOrder:"https://english.op.org/about-us/rosary/how-to-pray-the-rosary/",
 montfortOriginal:"https://www.montfort.org/content/uploads/pdf/PDF_FR_30_1.pdf",
 montfortMethod:"https://www.montfort.org.uk/Writings/MSR.php",
 fifteen:"https://rosaryconfraternity.org/the-rosary/how-to-pray-the-rosary/"
});
export const ROSARY_METHODS=Object.freeze([
 Object.freeze({id:"common",en:"Ordinary Rosary",fr:"Rosaire habituel",
  noteEn:"Canonical five-decade prayer as already used in the app.",
  noteFr:"Récitation habituelle conservée sans modification.",enabled:true}),
 Object.freeze({id:"dominican",en:"Dominican opening",fr:"Ouverture dominicaine",
  noteEn:"Traditional Dominican versicles before the mysteries; existing decades remain canonical.",
  noteFr:"Versets et répons dominicains avant les mystères ; dizaines inchangées.",enabled:true}),
 Object.freeze({id:"montfort",en:"Montfortian meditation",fr:"Méditation montfortaine",
  noteEn:"Mystery-specific graces from St Louis-Marie's first method; no copyrighted English text reproduced.",
  noteFr:"Grâces liées à chaque mystère selon la première méthode de saint Louis-Marie.",enabled:true})
]);
const pair=(en,fr)=>Object.freeze({en,fr});
export const DIVINE_MERCY_TEXT=Object.freeze({
 eternal:pair(
  "Eternal Father, I offer You the Body and Blood, the Soul and Divinity of Your beloved Son, Our Lord Jesus Christ, in reparation for our sins and those of the whole world.",
  "Père éternel, je vous offre le Corps et le Sang, l’Âme et la Divinité de votre Fils bien-aimé, Notre-Seigneur Jésus-Christ, en réparation de nos péchés et de ceux du monde entier."
 ),
 passion:pair(
  "For the sake of His sorrowful Passion, have mercy on us and on the whole world.",
  "Par sa douloureuse Passion, ayez pitié de nous et du monde entier."
 ),
 trisagion:pair(
  "Holy God, Holy Mighty One, Holy Immortal One, have mercy on us and on the whole world.",
  "Dieu saint, Dieu fort, Dieu immortel, ayez pitié de nous et du monde entier."
 )
});
const common=Object.freeze({
 sign:"foundations_sign_of_cross",
 pater:"foundations_our_father",
 ave:"foundations_hail_mary",
 credo:"foundations_apostles_creed"
});
const part=(kind,title,en,fr,more={})=>
 Object.freeze({kind,title:Object.freeze({en:title.en,fr:title.fr}),text:pair(en,fr),...more});
const canonical=(key,phase="opening")=>Object.freeze({
 kind:"canonical",canonicalId:common[key],phase,title:pair(
 ({sign:"Sign of the Cross",pater:"Our Father",ave:"Hail Mary",credo:"Apostles’ Creed"})[key],
 ({sign:"Signe de Croix",pater:"Notre Père",ave:"Je vous salue Marie",credo:"Symbole des Apôtres"})[key]),
 source:DEVOTIONAL_METHOD_SOURCES.mercyFr
});
/** Exactly five large beads, 50 small beads, three concluding Trisagions. */
export function divineMercySteps(){
 const steps=[
  canonical("sign"),canonical("pater"),canonical("ave"),canonical("credo")
 ];
 for(let decade=1;decade<=5;decade++){
  steps.push(part("large",pair("Eternal Father","Père éternel"),
   DIVINE_MERCY_TEXT.eternal.en,DIVINE_MERCY_TEXT.eternal.fr,
   {decade,bead:0,phase:"decade",source:DEVOTIONAL_METHOD_SOURCES.mercyFr}));
  for(let bead=1;bead<=10;bead++){
   steps.push(part("small",pair("Sorrowful Passion","Douloureuse Passion"),
    DIVINE_MERCY_TEXT.passion.en,DIVINE_MERCY_TEXT.passion.fr,
    {decade,bead,phase:"decade",source:DEVOTIONAL_METHOD_SOURCES.mercyFr}));
  }
 }
 for(let n=1;n<=3;n++)steps.push(part("conclusion",pair("Holy God","Dieu saint"),
  DIVINE_MERCY_TEXT.trisagion.en,DIVINE_MERCY_TEXT.trisagion.fr,
  {repetition:n,phase:"conclusion",source:DEVOTIONAL_METHOD_SOURCES.mercyFr}));
 return Object.freeze(steps);
}
export const MERCY_GUIDE=Object.freeze([
 Object.freeze({en:"This chaplet uses ordinary five-decade Rosary beads, but its prayers are different from the Marian Rosary.",
 fr:"Ce chapelet utilise les grains d’un rosaire de cinq dizaines, avec des prières distinctes du Rosaire marial.",source:DEVOTIONAL_METHOD_SOURCES.mercyFr}),
 Object.freeze({en:"After the introductory prayers, each large bead has the offering to the Eternal Father. Each small bead invokes mercy through Christ’s Passion.",
 fr:"Après les prières initiales, chaque gros grain porte l’offrande au Père éternel ; chaque petit grain invoque la miséricorde par la Passion du Christ.",source:DEVOTIONAL_METHOD_SOURCES.mercyFr}),
 Object.freeze({en:"At the end, pray the Holy God invocation three times. Additional opening and closing prayers are optional, not part of the minimum sequence.",
 fr:"À la fin, récitez trois fois l’invocation « Dieu saint ». Les prières d’ouverture et de clôture supplémentaires sont facultatives.",source:DEVOTIONAL_METHOD_SOURCES.mercyEn}),
 Object.freeze({en:"The Hour of Mercy at three in the afternoon is a separate devotional observance; this chaplet can be said at other times.",
 fr:"L’Heure de la Miséricorde à quinze heures est une pratique distincte ; ce chapelet peut être récité à d’autres heures.",source:DEVOTIONAL_METHOD_SOURCES.mercyEn})
]);
export const DOMINICAN_OPENING=Object.freeze([
 Object.freeze({role:"V",text:pair("Hail Mary, full of grace; the Lord is with thee.","Je vous salue, Marie, pleine de grâce ; le Seigneur est avec vous.")}),
 Object.freeze({role:"R",text:pair("Blessed art thou among women, and blessed is the fruit of thy womb, Jesus.","Vous êtes bénie entre toutes les femmes, et Jésus, le fruit de vos entrailles, est béni.")}),
 Object.freeze({role:"V",text:pair("O Lord, open my lips.","Seigneur, ouvrez mes lèvres.")}),
 Object.freeze({role:"R",text:pair("And my mouth shall proclaim thy praise.","Et ma bouche annoncera votre louange.")}),
 Object.freeze({role:"V",text:pair("O God, come to my assistance.","Ô Dieu, venez à mon aide.")}),
 Object.freeze({role:"R",text:pair("O Lord, make haste to help me.","Seigneur, hâtez-vous de me secourir.")})
]);
export const MONTFORT_GRACES=Object.freeze({
 joy1:pair("Deep humility","Profonde humilité"),joy2:pair("Charity toward our neighbour","Charité envers le prochain"),
 joy3:pair("Poverty of spirit","Pauvreté d’esprit"),joy4:pair("Wisdom and purity","Sagesse et pureté"),
 joy5:pair("Conversion and wisdom","Conversion et sagesse"),
 sor1:pair("Contrition and conformity to God's will","Contrition et conformité à la volonté de Dieu"),
 sor2:pair("Mortification of the senses","Mortification des sens"),
 sor3:pair("Contempt for worldly vanity","Mépris des vanités du monde"),
 sor4:pair("Patience in our crosses","Patience dans nos croix"),
 sor5:pair("Love for Christ and the Cross","Amour de Jésus et de la Croix"),
 glo1:pair("Living faith","Foi vive"),glo2:pair("Hope and desire for heaven","Espérance et désir du ciel"),
 glo3:pair("The gifts of the Holy Spirit","Dons du Saint-Esprit"),
 glo4:pair("Tender devotion to Our Lady","Tendre dévotion à Notre-Dame"),
 glo5:pair("Final perseverance","Persévérance finale")
});
export const FIFTEEN_CYCLE=Object.freeze(["joyful","sorrowful","glorious"]);
export function nextFullRosarySet(set){
 const i=FIFTEEN_CYCLE.indexOf(set);
 return i<0||i===2?null:FIFTEEN_CYCLE[i+1];
}
export function lastDecadeBoundary(steps){
 if(!Array.isArray(steps))return -1;
 for(let i=steps.length-1;i>=0;i--){
  const s=steps[i];
  if(s?.phase==="decade"&&s.mi===4)return i;
 }
 return -1;
}
export function firstMysteryIndex(steps){
 return Array.isArray(steps)?steps.findIndex(s=>s?.kind==="mystery"&&s.mi===0):-1;
}
export function mercyStepInfo(steps,index){
 const n=Math.max(0,Math.min(steps.length-1,Math.trunc(Number(index)||0)));
 const step=steps[n];
 return Object.freeze({index:n,count:steps.length,step,decade:step?.decade??null,
  bead:step?.bead??null,completed:n===steps.length-1});
}
