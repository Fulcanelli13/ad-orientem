/**
 * The Raccolta, Chaplet of the Precious Blood — full seven-mystery form.
 *
 * Historical EN textual witness: Ambrose St John (trans.), The Raccolta,
 * 1910 ed., §138, PDF pp. 63–65 (zero-index PDF pp. 62–64).
 * Cross-edition comparison: The Raccolta 1857 §35 (liturgialatina.org).
 *
 * Repeat pattern 5+5+5+5+5+5+3 Pater, seven Gloria, and one Te ergo
 * versicle after each mystery. Opening versicles + Gloria, then closing
 * Most Precious Blood prayer + Redemisti nos/Et fecisti + historical collect.
 * This is distinct from modern 33-bead five-Gloria variants.
 * The §40 short-form transcription conflicts with its 33-Pater rationale:
 * it remains withheld. Neither old indulgences nor exact 1857 page-image
 * collation are asserted as current/certified.
 *
 * Source prayers are preserved as period English: no AI French or Latin
 * translation for the long meditation/closing prayer. The repeat prayers
 * reuse the locked canonical EN/FR/LA existing texts.
 */
import {PRAY_CANONICAL_DATA_V435930} from "./canonical-data.js";
const COMMON=PRAY_CANONICAL_DATA_V435930.prayers;
const SOURCE_1910="https://www.saintsbooks.net/books/The%20Raccolta%20-%201910.pdf";
const SOURCE_1857="https://www.liturgialatina.org/raccolta/blood.htm";
export const PRECIOUS_BLOOD_HISTORICAL_SOURCE_V1=Object.freeze({
 id:"raccolta_1857_precious_blood_full",
 title:"Chaplet of the Precious Blood",
 works:Object.freeze([{edition:"1857",entry:"35",url:SOURCE_1857},
 {edition:"1910",entry:"138",pdfPages:Object.freeze([63,64,65]),url:SOURCE_1910}]),
 typedTranscriptReconciled:true,originalPageImageCertified:false,
 historicalIndulgencesCurrent:false,vernacularOriginal:"en",
 noInventedFrench:true,noInventedLatin:true
});
const RAW=Object.freeze([
 ["circumcision","Circumcision of Our Lord","Circoncision de Notre-Seigneur",5,
 "The first time our loving Saviour shed his Precious Blood for us was on the eighth day after his birth, when he was circumcised in order to fulfil the law of Moses. While, then, we reflect that Jesus did this to satisfy the justice of God for our lax ways, let us rouse ourselves to sorrow for them, and promise, with the help of his all-powerful grace, to be henceforth truly chaste in body and in soul."],
 ["agony","Agony in the Garden","Agonie au Jardin",5,
 "Next, in the Garden of Olives, Jesus shed his Blood for us in such quantity that it bathed the earth around. He did this at the sight of the ingratitude with which men would meet his love. Let us, then, repent sincerely that we have hitherto corresponded so ill with the countless blessings of God, and resolve to make good use of his graces and inspirations."],
 ["scourging","Scourging at the Pillar","Flagellation",5,
 "Next, in his cruel scourging, Jesus shed his Blood when his flesh was so torn that streams of Blood flowed from every part of his body, all of which he offered all the time to his Eternal Father in payment of our impatience and our softness. How comes it, then, that we do not curb our anger and love of self? Henceforth we will try our best to bear our troubles well, and, despising self, take peacefully the injuries which men may do us."],
 ["crowning","Crowning with Thorns","Couronnement d'épines",5,
 "Again, from the sacred Head of Jesus, Blood poured down when it was crowned with thorns, in punishment of our pride and evil thoughts. Shall we, then, continue to nurture haughtiness, foster foul imaginations, and feed the wayward will within us? Henceforth let there be ever before our eyes our utter nothingness, our misery, and our weakness; and with generous hearts let us resist all the temptations of the devil."],
 ["carrying","Carrying of the Cross","Portement de la Croix",5,
 "What streams of Precious Blood did not our loving Lord pour forth from his veins when laden with the heavy Cross on that most grievous journey to Calvary! The very streets and ways of Jerusalem, through which He passed, were watered with it! This He did in satisfaction for the scandals and bad example by which his own creatures had led others astray. Who can tell how many of us are of this unhappy number? Who knows how many he himself alone has, by his own bad example, brought down to hell? And what have we done to remedy this evil? Henceforth let us at least do all we can to save souls by word and by example, making ourselves a pattern to all of goodness and a holy life."],
 ["crucifixion","Crucifixion","Crucifixion",5,
 "More, and still more Precious Blood did the Redeemer of mankind shed in his barbarous Crucifixion; when, his veins being rent and arteries burst, there rushed forth in a torrent, from his hands and his feet, that saving balm of life eternal, to pay for all the crimes and enormities of a lost world. Who, after this, would continue in sin, and so renew the cruel crucifixion of the Son of God? Let us weep bitterly for our bad deeds done, and detest them before the feet of the sacred minister of God; let us amend our evil ways, and henceforth begin a truly Christian life, with the remembrance ever in our hearts of all the Blood which our salvation cost the Saviour of men."],
 ["piercing","Piercing of His Side","Transfixion du Côté",3,
 "Last of all, after his death, when his sacred Side was opened by the lance, and his loving Heart was wounded, Jesus shed Blood, and with it there came forth water, to show us how his Blood was all poured out to the last drop for our salvation. Oh, the great goodness of our redeeming Lord! Who will not love Thee, Saviour of my soul? What heart will not consume itself away for love of Thee, who hast done all this for our redemption? The tongue wants words to praise Thee; so let us invite all creatures upon earth, all angels and all saints in Paradise, and most of all our dear Mother Mary, to bless, praise, and celebrate thy most Precious Blood. Glory to the Blood of Jesus! Now and ever throughout all ages. Amen."]
]);
export const PRECIOUS_BLOOD_MYSTERIES_V1=Object.freeze(RAW.map(([id,en,fr,pater,meditationEn],i)=>
 Object.freeze({id,order:i+1,en,fr,pater,gloria:1,meditationEn,
   paterId:"foundations_our_father",gloriaId:"foundations_glory_be",
   responseId:"precious_blood_te_ergo_1910_la"})));
export const PRECIOUS_BLOOD_HISTORICAL_PRAYERS_V1=Object.freeze({
 opening:Object.freeze({
   en:Object.freeze(["O God, come to my assistance.","O Lord, make haste to help me."]),
   la:Object.freeze(["Deus, in adjutorium meum intende.","Domine, ad adjuvandum me festina."])
 }),
 repeatedResponse:Object.freeze({
   la:"Te ergo quæsumus tuis famulis subveni, quos pretioso Sanguine redemisti.",
   en:"We beseech Thee, therefore, help thy servants, whom Thou hast redeemed with thy Precious Blood."
 }),
 closingBloodPrayerEn:"Most Precious Blood of life eternal! price and ransom of the world! drink and bath of the soul! ever pleading the cause of man before the throne of Mercy; I adore Thee most profoundly; I would, if I were able, make Thee some compensation for the outrages and wrongs Thou dost ever suffer from men, and especially from those who dare in their rashness to blaspheme Thee. Who will not bless this Blood of value infinite? who does not feel himself on fire with the love of Jesus, who shed it all for us? What should I be but for this Blood, which hath redeemed me? And what drew Thee, Thou Precious Blood, from the veins of my Lord, even to the last drop? It was love. O boundless love, which gave to us this saving balsam! O balsam beyond all price, streaming forth from the fount of immeasurable love! Give to all hearts, all tongues, power to praise, celebrate, and thank Thee, now and ever, and throughout all eternity. Amen.",
 finalVersicle:Object.freeze({
   la:Object.freeze(["Redemisti nos, Domine, in Sanguine tuo.","Et fecisti nos Deo nostro regnum."]),
   en:Object.freeze(["Thou hast redeemed us, O Lord, with Thy Blood.","And hast made us a kingdom to our God."])
 }),
 collect:Object.freeze({
   en:"Almighty and everlasting God, who hast appointed thine only-begotten Son the Saviour of the world, and hast willed to be appeased by his Blood; grant us, we beseech Thee, so to venerate this Blood, the price of our salvation, and so to be defended on earth by its power from the evils of this present life, that in heaven we may be made glad by its everlasting fruit. Who liveth and reigneth, etc. Amen.",
   la:"Omnipotens sempiterne Deus, qui unigenitum Filium tuum mundi Redemptorem constituisti, ac ejus Sanguine placari voluisti; concede nobis, quæsumus, salutis nostræ pretium ita venerari, atque a præsentis vitæ malis ejus virtute defendi in terris, ut fructu perpetuo lætemur in cœlis. Qui tecum vivit et regnat, etc. Amen."
 }),
 closingTextLanguage:"en",
 historicalEtcExplicit:true
});
export function preciousBloodMystery(index,language="en"){
 if(!Number.isInteger(index)||index<0||index>=7||!["en","fr","la"].includes(language))return null;
 const m=PRECIOUS_BLOOD_MYSTERIES_V1[index],pater=COMMON[m.paterId],gloria=COMMON[m.gloriaId];
 if(!pater?.[language]||!gloria?.[language])return null;
 return Object.freeze({
  ...m,title:language==="fr"?m.fr:m.en,language,
  paterText:pater[language],gloriaText:gloria[language],
  responseText:language==="la"?PRECIOUS_BLOOD_HISTORICAL_PRAYERS_V1.repeatedResponse.la
  :PRECIOUS_BLOOD_HISTORICAL_PRAYERS_V1.repeatedResponse.en,
  responseLanguage:language==="la"?"la":"en",
  historicalMeditationLanguage:"en"
 });
}
export function preciousBloodPrayerAt(mysteryIndex,position,language="en"){
 const m=preciousBloodMystery(mysteryIndex,language);
 if(!m||!Number.isInteger(position)||position<0||position>m.pater+1)return null;
 const kind=position<m.pater?"pater":position===m.pater?"gloria":"versicle";
 return Object.freeze({
  kind,mysteryIndex,position,maxPosition:m.pater+1,
  repeatNumber:position<m.pater?position+1:null,
  text:kind==="pater"?m.paterText:kind==="gloria"?m.gloriaText:m.responseText,
  language:kind==="versicle"?m.responseLanguage:language,
  sourceId:kind==="pater"?m.paterId:kind==="gloria"?m.gloriaId:"historical:precious_blood_te_ergo_1910"
 });
}
export const PRECIOUS_BLOOD_TOTALS_V1=Object.freeze({
 mysteries:7,pater:PRECIOUS_BLOOD_MYSTERIES_V1.reduce((n,x)=>n+x.pater,0),
 gloria:7,versicles:7,openingGloria:1,concludingPrayer:1,closingVersicles:2,closingCollect:1
});
