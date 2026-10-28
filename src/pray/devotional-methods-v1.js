/**
 * Authenticated prayer-sequence definitions. NOT a second Rosary bead owner.
 * The canonical donor owns every live method. Unsupported or unverified
 * alternatives remain declarative; no second bead owner is introduced.
 */
export const DEVOTIONAL_METHOD_VERSION="2026-10-11-r1";
export const ROSARY_METHODS=Object.freeze({
 ordinary:Object.freeze({id:"ordinary",label:{en:"Traditional",fr:"Traditionnel"},
  status:"canonical-active",source:"https://www.newadvent.org/cathen/13184b.htm",
  policy:"Use unchanged canonical Rosary prayers and 15 mysteries."}),
 dominican:Object.freeze({id:"dominican",label:{en:"Dominican opening",fr:"Ouverture dominicaine"},
  status:"canonical-active",source:"https://rosaryconfraternity.org/the-rosary/how-to-pray-the-rosary/",
  policy:"Dominican versicles and responses, the same traditional mysteries, and the Dominican closing prayers."}),
 montfort:Object.freeze({id:"montfort",label:{en:"St Louis-Marie de Montfort",fr:"Saint Louis-Marie de Montfort"},
  status:"adapted-active",source:"https://www.montfort.org/content/uploads/pdf/PDF_FR_30_1.pdf",
  policy:"First method: adapted five-decade opening, decade offerings and petitions for the grace of each mystery. Original French linked; not a verbatim translation."}),
 montfort_short:Object.freeze({id:"montfort_short",label:{en:"Montfort · second, shorter method",fr:"Montfort · deuxième méthode abrégée"},
  status:"source-verified-active",source:"https://www.montfort.org/content/uploads/pdf/PDF_FR_30_1.pdf#page=3",
  policy:"One original French mystery clause follows Jesus in all ten Hail Marys of each decade. English and Latin are editorial translations; a group prayer concludes five decades."}),
 scriptural:Object.freeze({id:"scriptural",label:{en:"Scripture-linked Rosary",fr:"Rosaire relié aux Écritures"},
  status:"editorial-meditations-active",source:"https://github.com/Fulcanelli13/ad-orientem/blob/main/src/pray/rosary-guided-bead-evidence.v1.js",
  laterCommentarySource:"https://www.vatican.va/content/john-paul-ii/en/apost_letters/2002/documents/hf_jp-ii_apl_20021016_rosarium-virginis-mariae.html",
  provenance:"Editorial method · Douay–Rheims/CPDV English and Crampon 1923 French, source-linked in the internal verse registry",
  policy:"Uses the existing guided editorial meditations with linked Douay–Rheims and Crampon readings, not unverified biblical quotations."}),
 clausules:Object.freeze({id:"clausules",label:{en:"With clausules",fr:"Avec clausules"},
  status:"traditional-text-verification",source:"https://www.vatican.va/content/dam/wss/roman_curia/congregations/ccdds/documents/rc_con_ccdds_doc_20020513_vers-direttorio_en.html",
  policy:"General or per-bead clausule editions remain held for independent source collation; distinct from Montfort’s second method."})
});
export const TRADITIONAL_MYSTERY_ORDER=Object.freeze([
 ...Array.from({length:5},(_,i)=>"joy"+(i+1)),
 ...Array.from({length:5},(_,i)=>"sor"+(i+1)),
 ...Array.from({length:5},(_,i)=>"glo"+(i+1))
]);
export function rosaryPlan({method="ordinary",decades=5,set="joyful",guidance="guided"}={}){
 if(!Object.hasOwn(ROSARY_METHODS,method))throw new TypeError("Unknown Rosary method");
 if(![5,15].includes(decades))throw new RangeError("Rosary has five or fifteen decades");
 if(!["simple","guided","deep"].includes(guidance))throw new TypeError("Unknown guidance");
 if(!["joyful","sorrowful","glorious"].includes(set))throw new TypeError("Traditional mysteries only");
 const ids=decades===15?TRADITIONAL_MYSTERY_ORDER:
   Object.freeze(Array.from({length:5},(_,i)=>({joyful:"joy",sorrowful:"sor",glorious:"glo"})[set]+(i+1)));
 return Object.freeze({method,decades,guidance,ids:Object.freeze([...ids]),
  readyForLive:method==="ordinary"||(decades===5&&["dominican","montfort","montfort_short","scriptural"].includes(method)),
  canonicalOwner:"AO_ROSARY_V381",
  source:ROSARY_METHODS[method].source});
}
/** A pure fifteen-decade cursor. Deliberately does not launch or replace the v3.4.14 donor. */
export function rosaryJourney({method="ordinary",decades=15,set="joyful"}={}){
 const plan=rosaryPlan({method,decades,set});
 return Object.freeze(plan.ids.map((id,index)=>Object.freeze({
  id,index,number:index+1,total:plan.ids.length,
  set:id.startsWith("joy")?"joyful":id.startsWith("sor")?"sorrowful":"glorious",
  localMystery:Number(id.slice(3)),
  previous:index?plan.ids[index-1]:null,
  next:index+1<plan.ids.length?plan.ids[index+1]:null,
  isFinal:index===plan.ids.length-1
 })));
}
export function rosaryJourneyAt(journey,index){
 if(!Array.isArray(journey)||!Number.isSafeInteger(index))return null;
 return journey[index]??null;
}
/** Canonical Rosary journey: opening once, fifteen decade cycles, conclusion once.
 * An adapter can consume these semantic events without changing prayer text.
 */
export function rosaryJourneyEvents(options={}){
 const mysteries=rosaryJourney(options);
 const events=[Object.freeze({kind:"opening",id:"opening"})];
 for(const m of mysteries){
  events.push(Object.freeze({kind:"mystery",id:m.id,set:m.set,number:m.number,total:m.total}));
  events.push(Object.freeze({kind:"decade",id:m.id,set:m.set,number:m.number,total:m.total}));
 }
 events.push(Object.freeze({kind:"conclusion",id:"conclusion"}));
 return Object.freeze(events);
}
export function rosaryJourneyTransition(events,index){
 if(!Array.isArray(events)||!Number.isSafeInteger(index)||index<0||index>=events.length)return null;
 return Object.freeze({current:events[index],previous:events[index-1]??null,next:events[index+1]??null,
  complete:index===events.length-1});
}
/** Fail-closed adapter for the existing canonical Rosary player.
 * The caller must supply set selection and a verifiable set-specific start.
 * Never guess native step indexes or replace the native player.
 */
export function createContinuousRosaryBridge(donor,{selectSet,beginSet}={}){
 if(!donor||typeof donor.state!=="function"||typeof donor.steps!=="function"||
  typeof donor.setStep!=="function"||typeof selectSet!=="function"||typeof beginSet!=="function")
  return Object.freeze({supported:false,reason:"canonical-donor-transition-api-unavailable"});
 const journey=rosaryJourney({decades:15});
 let index=0,started=false,finished=false;
 return Object.freeze({
  supported:true,
  state:()=>Object.freeze({index,started,finished,mystery:journey[index]}),
  start:()=>{
   if(started)return false;
   if(selectSet(journey[0].set)!==true||beginSet(journey[0])!==true)return false;
   started=true;return true;
  },
  advance:()=>{
   if(!started||finished)return false;
   if(index===journey.length-1){finished=true;return true;}
   const next=journey[index+1];
   if(next.set!==journey[index].set&&selectSet(next.set)!==true)return false;
   if(beginSet(next)!==true)return false;
   index++;return true;
  }
 });
}
export const MERCY_WITNESSES=Object.freeze({
 en:"https://www.vaticannews.va/en/prayers/divine-mercy-chaplet.html",
 fr:"https://www.vaticannews.va/fr/priere/chapelet-de-la-divine-misericorde.html"
});
/**
 * Diary references are verified against the USCCB chaplet prayer page.
 * Its modern English translation has no identified blanket reuse licence:
 * expose direct official source access, not a falsely public-domain copy or
 * an invented Latin/French prayer. These never enter divineMercySteps().
 */
export const MERCY_OPTIONAL_OPENINGS=Object.freeze([
 Object.freeze({id:"mercy_you_expired",title:"You expired, Jesus",
   diary:"Diary 1319",source:"https://www.usccb.org/prayers/chaplet-divine-mercy",
   availability:"EN_LINK_ONLY",rights:"MODERN_TRANSLATION_REUSE_PENDING",
   kind:"optional-before-chaplet"}),
 Object.freeze({id:"mercy_blood_water",title:"O Blood and Water",
   diary:"Diary 84",source:"https://www.usccb.org/prayers/chaplet-divine-mercy",
   availability:"EN_LINK_ONLY",rights:"MODERN_TRANSLATION_REUSE_PENDING",
   kind:"optional-before-chaplet"})
]);
export const MERCY_PRAYERS=Object.freeze({
 cross:Object.freeze({en:"In the name of the Father, and of the Son, and of the Holy Spirit. Amen.",
  fr:"Au nom du Père, et du Fils, et du Saint-Esprit. Amen."}),
 pater:Object.freeze({en:"Our Father, who art in heaven, hallowed be Thy name; Thy kingdom come; Thy will be done on earth as it is in heaven. Give us this day our daily bread; and forgive us our trespasses, as we forgive those who trespass against us; and lead us not into temptation, but deliver us from evil. Amen.",
  fr:"Notre Père, qui êtes aux cieux, que votre nom soit sanctifié, que votre règne arrive, que votre volonté soit faite sur la terre comme au ciel. Donnez-nous aujourd'hui notre pain de chaque jour. Pardonnez-nous nos offenses, comme nous pardonnons à ceux qui nous ont offensés. Et ne nous laissez pas succomber à la tentation, mais délivrez-nous du mal. Ainsi soit-il."}),
 ave:Object.freeze({en:"Hail Mary, full of grace, the Lord is with thee. Blessed art thou among women, and blessed is the fruit of thy womb, Jesus. Holy Mary, Mother of God, pray for us sinners, now and at the hour of our death. Amen.",
 fr:"Je vous salue, Marie, pleine de grâce, le Seigneur est avec vous. Vous êtes bénie entre toutes les femmes, et Jésus, le fruit de vos entrailles, est béni. Sainte Marie, Mère de Dieu, priez pour nous, pauvres pécheurs, maintenant et à l'heure de notre mort. Amen."}),
 creed:Object.freeze({en:"I believe in God, the Father almighty, Creator of heaven and earth; and in Jesus Christ, His only Son, our Lord, who was conceived by the Holy Spirit, born of the Virgin Mary, suffered under Pontius Pilate, was crucified, died and was buried. He descended into hell; on the third day He rose again from the dead; He ascended into heaven and is seated at the right hand of God the Father almighty; from there He will come to judge the living and the dead. I believe in the Holy Spirit, the holy Catholic Church, the communion of saints, the forgiveness of sins, the resurrection of the body, and life everlasting. Amen.",
 fr:"Je crois en Dieu, le Père tout-puissant, créateur du ciel et de la terre ; et en Jésus-Christ, son Fils unique, notre Seigneur, qui a été conçu du Saint-Esprit, est né de la Vierge Marie, a souffert sous Ponce Pilate, a été crucifié, est mort et a été enseveli, est descendu aux enfers ; le troisième jour est ressuscité des morts, est monté aux cieux, est assis à la droite de Dieu le Père tout-puissant, d'où il viendra juger les vivants et les morts. Je crois au Saint-Esprit, à la sainte Église catholique, à la communion des saints, à la rémission des péchés, à la résurrection de la chair, à la vie éternelle. Amen."}),
 offering:Object.freeze({en:"Eternal Father, I offer You the Body and Blood, Soul and Divinity of Your dearly beloved Son, Our Lord Jesus Christ, in atonement for our sins and those of the whole world.",
 fr:"Père Éternel, je T'offre le Corps et le Sang, l'Âme et la Divinité de Ton Fils bien-aimé, notre Seigneur Jésus-Christ, en réparation de nos péchés et de ceux du monde entier."}),
 invocation:Object.freeze({en:"For the sake of His sorrowful Passion, have mercy on us and on the whole world.",
 fr:"Par Sa douloureuse Passion, sois miséricordieux pour nous et pour le monde entier."}),
 trisagion:Object.freeze({en:"Holy God, Holy Mighty One, Holy Immortal One, have mercy on us and on the whole world.",
 fr:"Dieu Saint, Dieu Fort, Dieu Éternel, prends pitié de nous et du monde entier."}),
 closing:Object.freeze({en:"Eternal God, in whom mercy is endless and the treasury of compassion inexhaustible, look kindly upon us and increase Your mercy in us, that in difficult moments we might not despair nor become despondent, but with great confidence submit ourselves to Your holy will, which is Love and Mercy itself.",
 fr:"Dieu éternel, en qui la miséricorde est infinie et le trésor de compassion inépuisable, pose sur nous un regard bienveillant et multiplie en nous ta miséricorde, pour que, dans les moments difficiles, nous ne désespérions ni ne perdions courage, mais qu'avec une grande confiance nous nous soumettions à ta sainte volonté, qui est l'Amour et la Miséricorde même."})
});
const step=(key,group,index=0,total=1,optional=false)=>Object.freeze({key,group,index,total,optional,
 source:MERCY_WITNESSES.en});
export function divineMercySteps({includeClosing=false}={}){
 const out=[step("cross","opening"),step("pater","opening"),
  step("ave","opening"),step("creed","opening")];
 for(let decade=1;decade<=5;decade++){
  out.push(Object.freeze({...step("offering","large-bead",decade,5),decade}));
  for(let bead=1;bead<=10;bead++){
   out.push(Object.freeze({...step("invocation","small-bead",bead,10),decade,bead}));
  }
 }
 for(let i=1;i<=3;i++)out.push(step("trisagion","conclusion",i,3));
 if(includeClosing)out.push(step("closing","optional-conclusion",1,1,true));
 return Object.freeze(out);
}
export function mercyStepText(step,language="en"){
 if(!step||!Object.hasOwn(MERCY_PRAYERS,step.key))return null;
 return MERCY_PRAYERS[step.key][language==="fr"?"fr":"en"];
}
export function devotionalStepAt(steps,index){
 if(!Array.isArray(steps)||!Number.isSafeInteger(index))return null;
 return steps[index]??null;
}
