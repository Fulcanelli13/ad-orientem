import source from "../../data/mass/1962-in-albis-secret-source.v1.json" with {type:"json"};

// This is a *single* named source repair, not a calendar-based inference of
// every Eastertide Secret. Source text is pinned unchanged with git blob
// hashes in data/mass/1962-in-albis-secret-source.v1.json.
export const IN_ALBIS_SECRET_SOURCE_VERSION="AO_IN_ALBIS_1962_SECRET_SOURCE_V1";
const SOURCE_PATH="Tempora/Pasc1-0";
const OWNER_ID="tempora:Pasc1-0:1:w";
const MACRO=/^\$Per Dominum\.?$/u;
const latinIntro=/^Súscipe múnera, Dómine, quǽsumus, exsultántis Ecclésiæ:/u;
const englishIntro=/^Receive, we beseech Thee, O Lord, the gifts of Thine exultant Church:/u;
const frenchIntro=/^Accueillez, Seigneur, les présents de votre Église transportée d'allégresse,/u;
const sha=/^[0-9a-f]{40}$/u;
function anyText(v){return typeof v==="string"&&v.trim().length>0}
function resolvedText(v){return anyText(v)&&!/^\s*[$@]/u.test(v)&&
  !/^\s*Tempora\/Pasc1-0:Secreta\.?\s*$/iu.test(String(v))}
function normalize(v){return String(v??"").normalize("NFD").replace(/[\u0300-\u036f]/gu,"")
 .replace(/[œ]/gu,"oe").replace(/[æ]/gu,"ae").replace(/[^a-z0-9]+/giu," ").trim().toLowerCase()}
// The pinned French [Secreta] places the conclusion macro before the body.
// Accept only the exact, source-attested reversal of the two certified lines;
// never treat an arbitrary conclusion-first or unrelated prayer as equivalent.
function exactFrenchDonorOrder(existing,canonical){
 const lines=String(canonical??"").trim().split("\n");
 if(lines.length!==2||!frenchIntro.test(lines[0])||
   !/^Par Notre-Seigneur Jésus-Christ, votre Fils/u.test(lines[1]))return false;
 return normalize(existing)===normalize(lines[1]+"\n"+lines[0]);
}
function sameCertifiedPrayerBody(existing,certified){
 const observed=String(existing??"").trim().split("\n");
 const expected=String(certified??"").trim().split("\n");
 return observed.length===2&&expected.length===2&&
   normalize(observed[0])===normalize(expected[0]);
}
function matchPartial(existing,actual){
 const value=String(existing??"").trim();
 if(!value||/^\s*\$Per Dominum\.?$/u.test(value))return true;
 // Source-donor evidence: [Secreta] literally contains
 // @Tempora/Pasc1-0:Secreta. The normalizer may retain the pointer
 // with or without "@". This *specific* circular marker is not a prayer.
 // Never accept a different @source identity or a generic unresolved text.
 if(/^@?Tempora\/Pasc1-0:Secreta\.?$/iu.test(value))return true;
 const current=normalize(value),expected=normalize(actual);
 return current.length>=32&&(current.startsWith(expected.slice(0,Math.min(32,expected.length)))||
   expected.startsWith(current.slice(0,Math.min(32,current.length))));
}
export function hasExact1962InAlbisSecretSourceOwner(data,principalCelebrationId){
 if(!data||principalCelebrationId!==OWNER_ID||
   String(data.sourcePath??"")!==SOURCE_PATH)return false;
 if(data.principalCelebrationId&&data.principalCelebrationId!==OWNER_ID)return false;
 if(data.requestedCelebrationId&&data.requestedCelebrationId!=="mass_of_day")return false;
 if(/(?:votive|requiem|mass_of_dead)/i.test(String(data.riteProfile??data.profile??"")))return false;
 if((data.calendarCommemorations?.length??0)>0||
   (data.appliedCommemorations?.length??0)>0)return false;
 return true;
}
/**
 * A single attested [Secreta] prayer in three actual source languages.
 * French source has "$Per Dominum." *before* the prayer body; move only
 * that literal macro after the body to preserve the Missal's oration order.
 * Expansion is delegated to the EXISTING canonical recovery normalizer.
 */
export function recover1962InAlbisSecretFromPinnedSource(data,principalCelebrationId,cleanLines){
 if(!hasExact1962InAlbisSecretSourceOwner(data,principalCelebrationId)||
   typeof cleanLines!=="function")return null;
 if(source?.schema!==IN_ALBIS_SECRET_SOURCE_VERSION||
   source.canonicalSourcePath!==SOURCE_PATH||source.section!=="Secreta")return null;
 const contents={};const proof={};
 for(const [key,section] of Object.entries({lat:"la",en:"en",fr:"fr"})){
   const original=source.languages?.[section];
   if(!original||!sha.test(String(original.gitBlobSha))||
       !String(original.url??"").startsWith(
          "https://github.com/DivinumOfficium/divinum-officium/blob/master/web/www/missa/")||
       !String(original.sourcePath??"").endsWith("/Tempora/Pasc1-0.txt")||
       !Array.isArray(original.rows)||original.rows.length!==2)return null;
   const rows=[...original.rows];
   const macroIndex=rows.findIndex(x=>MACRO.test(String(x)));
   if(macroIndex<0||rows.filter(x=>MACRO.test(String(x))).length!==1)return null;
   if(section==="fr"&&macroIndex!==0||section!=="fr"&&macroIndex!==1)return null;
   const plain=rows.find(x=>!MACRO.test(String(x)));
   if(!plain||!(section==="la"?latinIntro:section==="en"?englishIntro:frenchIntro).test(plain))
     return null;
   // Source order is certified independently above; no other source edits.
   const ordered=[plain,"$Per Dominum"];
   const text=cleanLines(ordered,section);
   if(!resolvedText(text)||text.includes("$Per Dominum")||
     !text.includes("\n")||text.length<210)return null;
   contents[key]=text;
   proof[key]=Object.freeze({url:original.url,gitBlobSha:original.gitBlobSha,
     sourcePath:original.sourcePath,originalRows:rows.length});
 }
 const existing=Array.isArray(data.secrets)&&data.secrets.length
   ?data.secrets:data.secret?[data.secret]:[];
 if(existing.length>1)return null;
 if(existing.some(row=>row?.oneConclusion||row?.sourcePath&&
    !String(row.sourcePath).startsWith(SOURCE_PATH)))return null;
 const old=existing[0]??{};
 // Do not replace an authentic complete oration; and never overwrite any
 // partial text that disagrees with the certified named Secret.
 const reversedPinnedFrench=exactFrenchDonorOrder(old.fr,contents.fr);
 // With a fully populated French donor reversal, require *full prayer-body*
 // agreement in both other languages, not merely the shared first 32 words.
 // The canonical conclusion may have equivalent typographical differences.
 if(reversedPinnedFrench&&
   (!sameCertifiedPrayerBody(old.lat??old.la,contents.lat)||
    !sameCertifiedPrayerBody(old.en,contents.en)))return null;
 // A complete genuine Secret is never replaced. The single exception is
 // the attested French macro-first source ordering, with exact source parity.
 if(["lat","en","fr"].every(lang=>resolvedText(old[lang]??(lang==="lat"?old.la:null)))&&
   !reversedPinnedFrench)return null;
 for(const lang of ["lat","en","fr"]){
   const observed=old[lang]??(lang==="lat"?old.la:null);
   if(lang==="fr"&&reversedPinnedFrench)continue;
   if(!matchPartial(observed,contents[lang]))return null;
 }
 return Object.freeze({
   ...contents,sourcePath:"Tempora/Pasc1-0:Secreta",
   recoveryScope:"DOMINICA_IN_ALBIS_1962_EXACT_SOURCE",
   sourceEvidence:Object.freeze({
     schema:IN_ALBIS_SECRET_SOURCE_VERSION,
     principalCelebrationId:OWNER_ID,
     canonicalProperPath:SOURCE_PATH,
     namedSection:"Secreta",
     languages:Object.freeze(proof)
   })
 });
}
