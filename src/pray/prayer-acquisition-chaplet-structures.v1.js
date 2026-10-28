/**
 * Research-only historical chaplet structures. Not public Prayer UI content.
 * An index heading is not a full witnessed devotional text.
 *
 * The Five Wounds (1857 Raccolta 32) is a stable five-group repetition.
 * Full Precious Blood (1857 §35 / 1910 §138): 33 Pater noster, complete
 * historical closing English witness; period page-image not certified.
 * The short Precious Blood (1857 Raccolta 40) is ON HOLD: a reproduced
 * historical text lists five Pater for all seven mysteries (35 total),
 * despite invoking the 33-Pater chaplet indulgence. Never silently
 * substitute the two forms or manufacture a resolution to this conflict.
 *
 * These historical indulgence passages are NOT evidence of a current grant.
 * All existing canonical prayer text owners must be reused.
 */
export const HISTORICAL_CHAPLET_SOURCE_CANDIDATES_V1=Object.freeze([
 Object.freeze({
   id:"raccolta_1857_five_wounds",
   title:"Chaplet of the Five Wounds",
   sourceWork:"The Raccolta (1857)",historicalEntry:32,
   sourceUrls:Object.freeze([
     "https://passionistarchives.org/chaplet-of-the-five-wounds-its-history-blessing-and-indulgences/",
     "https://www.liturgialatina.org/raccolta/crucified.htm",
     "https://www.saintsbooks.net/books/The%20Raccolta%20-%201910.pdf"
   ]),
   editionWitnesses:Object.freeze(["1857 index and later transcription","1910 independent confirmation (entry 126)"]),
   structureStatus:"PASSIONIST_AND_RACCOLTA_RECENSION_CONFIRMED",
   groups:Object.freeze(Array.from({length:5},(_,i)=>Object.freeze({
     number:i+1,meditation:"One of the Five Wounds of Our Lord",
     repeatedPrayerId:"foundations_glory_be",repetitions:5,
     concludingPrayerId:"foundations_hail_mary",concludingRepetitions:1
   }))),
   derivedCounts:Object.freeze({glory_be:25,hail_mary:5}),
   historicalIndulgencesCurrent:false,
   originalPrintScanCertified:false,
   exactRubricalMeaning:"Five decades of five Glory Bes with a Hail Mary at the end of each; historical special chaplet blessing mentioned for indulgences, which are not asserted to apply today.",
   displayGroup:"passion",existingCanonicalTextsOnly:true,
   sourceTextStatus:"FORMULA_AND_STRUCTURE_CORROBORATED_BY_PASSIONIST_ARCHIVE_AND_RACCOLTA_TRANSCRIPTION",
   releaseStatus:"PUBLISHED_GUIDED_FORM_SOURCE_RECONCILED",
   userFacing:true
 }),
 Object.freeze({
   id:"raccolta_1857_precious_blood_full",
   title:"Chaplet of the Precious Blood — seven mysteries",
   sourceWork:"The Raccolta (1857)",historicalEntry:35,
   sourceUrls:Object.freeze([
     "https://www.saintsbooks.net/books/The%20Raccolta%20-%201910.pdf",
     "https://www.liturgialatina.org/raccolta/blood.htm"
   ]),
   structureStatus:"SEVEN_MYSTERIES_SOURCE_SUPPORTED",
   mysteries:Object.freeze([
     Object.freeze({id:"circumcision",title:"Circumcision of Our Lord",pater:5,gloria:1}),
     Object.freeze({id:"agony",title:"Agony in the Garden",pater:5,gloria:1}),
     Object.freeze({id:"scourging",title:"Scourging at the Pillar",pater:5,gloria:1}),
     Object.freeze({id:"crowning",title:"Crowning with Thorns",pater:5,gloria:1}),
     Object.freeze({id:"carrying",title:"Carrying the Cross",pater:5,gloria:1}),
     Object.freeze({id:"crucifixion",title:"Crucifixion",pater:5,gloria:1}),
     Object.freeze({id:"piercing",title:"Piercing of His Side",pater:3,gloria:1})
   ]),
   repeatedPrayerIds:Object.freeze({pater:"foundations_our_father",gloria:"foundations_glory_be"}),
   interMysteryVersicle:"Te ergo quaesumus tuis famulis subveni, quos pretioso Sanguine redemisti.",
   openingVersicle:"Deus in adjutorium meum intende.",
   closingPrayer:"historical:precious_blood_most_precious_blood_1910_en",
   historicalIndulgencesCurrent:false,originalPrintScanCertified:false,
   displayGroup:"passion",existingCanonicalTextsOnly:false,
   interpretation:"Seven complete historical English mystery meditations optional; canonical Our Father and Glory Be in their verified existing languages. English period closing prayer is never silently translated.",
   sourceTextStatus:"1910_ENG_TRANSCRIPT_CROSSWITNESSED_1857_NOT_IMAGE_CERTIFIED",
   releaseStatus:"PUBLISHED_GUIDED_FULL_FORM_TEXTUAL_WITNESSES",
   userFacing:true
 }),
 Object.freeze({
   id:"raccolta_1857_precious_blood_short",
   title:"Short Chaplet of the Precious Blood",
   sourceWork:"The Raccolta (1857)",historicalEntry:40,
   sourceUrls:Object.freeze([
     "https://en.wikisource.org/wiki/The_Raccolta_%281857%29/Index",
     "https://www.liturgialatina.org/raccolta/blood.htm"
   ]),
   structureStatus:"CONTRADICTORY_SOURCE_REPETITION_COUNT",
   claimedTotalPater:33,
   reproducedMysteryCounts:Object.freeze([5,5,5,5,5,5,5]),
   reproducedTotalPater:35,
   question:"Later transcription says five Pater for seventh mystery too, but introduction treats it as equivalent to the 33-Pater full chaplet. Check original printed edition and variant notes before use.",
   displayGroup:"passion",
   releaseStatus:"HOLD_SOURCE_CONFLICT",
   userFacing:false
 })
]);
export const historicalChapletCandidate=id=>
 HISTORICAL_CHAPLET_SOURCE_CANDIDATES_V1.find(p=>p.id===id)||null;
