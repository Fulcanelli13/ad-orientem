/** B29 — Fr Mateo: voluntary home night watch using existing Adoration reader.
 * Source-scoped practical schedule, not a reproduction or adaptation of the
 * 1944 booklet's extended visionary/dialogue text. No sacramental presence,
 * enrollment, current indulgence grant or mandatory time is implied.
 */
export const NIGHT_HOME_B29_SOURCE=Object.freeze({
 candidateId:"AO-AQ-066",
 programmeId:"adoration.night_home",
 historicalName:"Night Adoration in the Home",
 associatedWith:"Father Mateo Crawley-Boevey, SS.CC.",
 historicalWitness:"Night Adoration in the Home; historical English pamphlet with Pius XI correspondence dated 1929 and 1930 and later edition context",
 onlineWitness:"https://sensusfidelium.com/2020/03/21/night-adoration-in-the-home-fr-mateo/",
 historicalCorrespondence:["1929-04-04","1930-10-25"],
 sourceType:"MODERN_DIGITAL_TRANSCRIPTION_OF_HISTORICAL_DEVOTION",
 originalPrintedPagePhotographicallyCollated:false,
 longHistoricalBookletTextReproduced:false,
 instructions:"Original Ad Orientem bilingual editorial directions based on source practical suggestions and regulations, never presented as verbatim Fr Mateo or speech of Christ.",
 context:"Private prayer before an image of the Sacred Heart at home, in spiritual union with Christ in the Blessed Sacrament in churches. This is not Eucharistic exposition or a substitute for attending a church service.",
 historicPattern:{months:1,customaryNightStart:"21:00",customaryNightEnd:"06:00",historicDurationMinutes:60,bindingOnPainOfSin:false,requiresEnrollmentToUseReader:false},
 currentIndulgenceStatus:"NOT_VERIFIED_OR_CLAIMED",
 dateWindow:"SUGGESTED_HISTORICAL_ONLY_NO_AUTOMATIC_LITURGICAL_OBLIGATION",
 privacy:"No membership, family attendance, prayer frequency, or historical certification is captured.",
 noModernTranslationsPresentedAsHistorical:true
});
export const NIGHT_HOME_B29_STAGES=Object.freeze([
 Object.freeze({
  id:"prepare",title:{en:"Prepare the home",fr:"Préparer le foyer"},
  now:{en:"Choose a quiet place, preferably before an image of the Sacred Heart if you have one. Alone or with your family, offer this time freely. A crucifix may help recollection; candles and flowers are optional, never required.",
       fr:"Choisissez un lieu paisible, de préférence devant une image du Sacré-Cœur si vous en avez une. Seul ou en famille, offrez librement ce temps. Un crucifix peut aider au recueillement ; cierges et fleurs restent facultatifs."},
  silence:{en:"Set aside distractions. This image is a devotional aid; Christ is not sacramentally present in the picture.",
           fr:"Éloignez les distractions. L’image aide la dévotion ; elle ne constitue pas une présence sacramentelle du Christ."},
  canonicalIds:["foundations_sign_of_cross","foundations_act_of_faith"],sourcePart:"Practical Suggestions — family/home arrangement"
 }),
 Object.freeze({
  id:"union",title:{en:"Unite with Christ",fr:"S’unir au Christ"},
  now:{en:"Adore the Sacred Heart of Jesus in spirit and unite your prayer with Christ present in the tabernacles of churches. Father Mateo recommends a meditation on the Canon of the Mass; this is private reading, not recitation of the priest’s liturgical role.",
       fr:"Adorez spirituellement le Sacré-Cœur et unissez votre prière au Christ présent dans les tabernacles des églises. Le père Mateo recommande la méditation du Canon de la messe ; il s’agit d’une lecture privée, non d’un rôle liturgique du prêtre."},
  silence:{en:"Remain with Christ's love and the Eucharist without imagining an exposed Host in your home.",
           fr:"Contemplez l’amour du Christ et l’Eucharistie sans imaginer une hostie exposée dans votre foyer."},
  canonicalIds:["foundations_prayer_of_adoration"],sourcePart:"Practical Suggestions — Eucharistic adoration in spirit; Canon meditation"
 }),
 Object.freeze({
  id:"reparation",title:{en:"An act of reparation",fr:"Un acte de réparation"},
  now:{en:"Acknowledge your own sins and seek mercy. Pray in reparation for indifference to the Sacred Heart. The Act of Reparation below is the existing Pius XI prayer; it is not newly attributed to Father Mateo.",
       fr:"Reconnaissez vos propres péchés et demandez miséricorde. Priez en réparation de l’indifférence envers le Sacré-Cœur. L’acte de réparation ci-dessous est la prière existante de Pie XI ; il n’est pas attribué au père Mateo."},
  silence:{en:"Do not turn this time into a judgment of other people. Rest in Christ's mercy.",
           fr:"Ne transformez pas cette prière en jugement des autres. Reposez-vous dans la miséricorde du Christ."},
  canonicalIds:["sacrament_act_of_contrition","sacred_heart_short_prayer"],sourcePart:"Historical Holy Hour — Act of Reparation by Pius XI"
 }),
 Object.freeze({
  id:"family",title:{en:"Family and Church",fr:"Famille et Église"},
  now:{en:"Pray for the Pope, priests, peace, your household, those estranged from the Faith, and people dying tonight. Father Mateo's historical exercise invites five Our Fathers, five Hail Marys and five Glory Bes for the family. Each complete text is shown once below: repeat each set five times if you choose.",
       fr:"Priez pour le pape, les prêtres, la paix, votre famille, ceux qui se sont éloignés de la foi et les personnes à l’agonie cette nuit. L’exercice historique propose cinq Notre Père, cinq Je vous salue Marie et cinq Gloria pour la famille. Chaque prière est affichée une fois ; répétez l’ensemble cinq fois si vous le souhaitez."},
  silence:{en:"Present your intentions in your own words; the historical repetitions are a devotional suggestion, not an obligation.",
           fr:"Confiez vos intentions avec vos propres mots ; les répétitions historiques sont une proposition de dévotion, non une obligation."},
  canonicalIds:["foundations_our_father","foundations_hail_mary","foundations_glory_be"],sourcePart:"Practical Suggestions and family intercession"
 }),
 Object.freeze({
  id:"communion",title:{en:"Spiritual Communion",fr:"Communion spirituelle"},
  now:{en:"If appropriate, make a Spiritual Communion, desiring union with Jesus in the Blessed Sacrament. You are praying at home; this does not confer sacramental Communion.",
       fr:"Si cela convient, faites une communion spirituelle en désirant vous unir à Jésus au Saint-Sacrement. Cette prière à domicile ne confère pas la communion sacramentelle."},
  silence:{en:"Stay in silence and contemplation, without treating this prayer as a substitute for the Eucharist.",
           fr:"Demeurez en silence et dans la contemplation, sans présenter cette prière comme un remplacement de l’Eucharistie."},
  canonicalIds:["adoration_spiritual_communion"],sourcePart:"Historical Holy Hour — recommended Spiritual Communion"
 }),
 Object.freeze({
  id:"close",title:{en:"Entrust the night",fr:"Confier la nuit"},
  now:{en:"Offer thanksgiving and ask to remain faithful to the Sacred Heart. Conclude in silence and return to family life peacefully. The historic hour may be shared among family members or kept privately; the app does not enroll anyone or certify the hour.",
       fr:"Rendez grâce et demandez la fidélité au Sacré-Cœur. Terminez en silence et retrouvez paisiblement la vie familiale. L’heure historique peut être partagée en famille ou accomplie seul ; l’application n’inscrit personne et ne certifie aucune heure."},
  silence:{en:"The prayer ends when you choose. The hour and monthly frequency are historical customary practice, not a device-enforced condition.",
           fr:"La prière s’achève lorsque vous le décidez. L’heure et la fréquence mensuelle relèvent de la pratique historique, non d’une obligation imposée par l’appareil."},
  canonicalIds:["foundations_act_of_love","foundations_sign_of_cross"],sourcePart:"Regulations — voluntary promise, historical monthly practice"
 })
]);
export function nightHomeStage(index){
 return Number.isInteger(index)&&index>=0&&index<NIGHT_HOME_B29_STAGES.length?NIGHT_HOME_B29_STAGES[index]:null;
}
export function nightHomeAsGuided(language="en"){
 const lang=language==="fr"?"fr":"en";
 return NIGHT_HOME_B29_STAGES.map(x=>({
  id:x.id,title:x.title[lang],now:x.now[lang],silence:x.silence[lang],
  prayers:x.canonicalIds.map(id=>({id})),sourcePart:x.sourcePart
 }));
}
