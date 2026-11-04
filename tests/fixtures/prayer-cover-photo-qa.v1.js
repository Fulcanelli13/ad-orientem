/**
 * Exact user-selected Prayer covers recovered from PR #2110.
 * Research/phone-QA ONLY: the full-size original photographs remain blocked
 * for live use until their actual photo rights, crop and full-device QA pass.
 * Never silently replace a different painting or infer a missing reader route.
 */
export const PRAYER_SELECTED_COVER_PHOTO_QA=Object.freeze({
 "COV-pray.confession":Object.freeze({
  workArtist:"Bartolomé Esteban Murillo",
  workTitle:"The Return of the Prodigal Son",
  sourcePage:"https://commons.wikimedia.org/wiki/File:Bartolom%C3%A9_Esteban_Murillo,_The_Return_of_the_Prodigal_Son,_1667-1670,_NGA_34956.jpg",
  exactMuseumObject:"NGA 34956",
  reportedPhotoLicense:"CC0",
  stagedAsset:"/assets/staged/prayer-selected-cover-qa/confession-murillo-nga-cc0.jpg",
  expectedSHA256:"71b30dda1ce9aaba5e05499b15ecb842078975d1d512090988c40ad07add0d1a",
  originalPixels:[4000,3658],sourceRightsBasis:"Commons file CC0 / NGA Open Access",
  nativeImageQA:"PRELIMINARY_PAINTING_ONLY_NOT_FINAL",croppingApproved:false,
  publicationAuthorized:false
 }),
 "COV-prayer.seven_sorrows_chaplet":Object.freeze({
  workArtist:"Master of the Female Half-Lengths (attributed)",
  workTitle:"The Virgin of the Seven Sorrows",
  sourcePage:"https://commons.wikimedia.org/wiki/File:Master_of_the_Half_Lengths_-_Virgin_of_the_Seven_Sorrows_-_Google_Art_Project.jpg",
  exactMuseumObject:"MNAC 008327-000",
  reportedPhotoLicense:"Commons PD-Art",
  stagedAsset:"/assets/staged/prayer-selected-cover-qa/seven-sorrows-mnac-pd-art.jpg",
  expectedSHA256:"9ac17078b83f2cf6031aa70a86917929cdeea16927e66c4bb7c0f7671ec89667",
  originalPixels:[3250,4391],sourceRightsBasis:"Commons PD-Art; original MNAC object public domain",
  nativeImageQA:"PRELIMINARY_PAINTING_ONLY_NOT_FINAL",croppingApproved:false,
  publicationAuthorized:false,
  readerRouteVerified:false
 })
});
const escaped=x=>String(x||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
export function renderPrayerSelectedCoverQA(slot,french=false,{qaOnly=false}={}){
 const record=PRAYER_SELECTED_COVER_PHOTO_QA[slot];
 // This is a nonpublishing rehearsal: no user-facing production images.
 // Explicit opt-in must come from the test harness, not a local preference.
 if(!qaOnly||!record||record.publicationAuthorized!==false)return "";
 const alt=slot==="COV-pray.confession"
  ?(french?"Murillo, Le Retour de l’enfant prodigue":"Murillo, The Return of the Prodigal Son")
  :(french?"Vierge des Sept Douleurs, tableau du MNAC":"Virgin of the Seven Sorrows, MNAC painting");
 return '<figure class="aoPrayerSelectedCoverQA" data-ao-prayer-art-qa="'+escaped(slot)+'" data-ao-production-release="false">'+
  '<img src="'+escaped(record.stagedAsset)+'" loading="eager" decoding="async" alt="'+escaped(alt)+'">'+
  '<figcaption>'+escaped(record.workArtist)+' · '+escaped(record.workTitle)+'</figcaption></figure>';
}
