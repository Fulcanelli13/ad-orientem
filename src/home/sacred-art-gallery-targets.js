/**
 * Home released-art gallery -> canonical modules.
 * Only IDs from already released photographs have actionable destinations.
 * Unknown/held artwork, unsupported destination or stale Home surface fails
 * closed. The destination's own route owner sets reading and bead positions.
 */
import {sacredArtCrossModuleLinks} from "../art/sacred-art-crossmodule-links-v1.js";

const ACTIONABLE=new Set(["scripture","rosary","bibleAtlas"]);
export function sacredArtGalleryTargets(workId){
 const links=sacredArtCrossModuleLinks(workId);
 if(!links?.currentlyPublicPhoto)return Object.freeze([]);
 return Object.freeze([
  ...links.scripture.map(x=>Object.freeze({kind:"scripture",id:x.reference,relation:x.relation})),
  ...links.rosary.map(x=>Object.freeze({kind:"rosary",id:x.id,relation:x.relation})),
  ...links.bibleAtlas.map(x=>Object.freeze({kind:"bibleAtlas",id:x.id,relation:x.relation}))
 ]);
}
export function isReleasedSacredArtTarget(workId,kind,id){
 if(!ACTIONABLE.has(kind)||typeof id!=="string")return false;
 return sacredArtGalleryTargets(workId).some(x=>x.kind===kind&&x.id===id);
}
export async function openReleasedSacredArtTarget(win,{workId,kind,id}={}){
 if(!isReleasedSacredArtTarget(workId,kind,id))return false;
 const shell=win?.AO_APP_SHELL_V1;
 if(!shell||shell.getActive?.()!=="home")return false;
 if(kind==="scripture"){
  try{return win?.AO_SCRIPTURE_APP_V1?.openContext?.(id)===true}
  catch{return false}
 }
 let accepted=false;
 try{
  const surface=kind==="rosary"?"pray":"find";
  const navigated=await shell.navigate(surface);
  if(navigated?.ok===true){
   if(kind==="rosary"){
    // The existing Prayer source owner starts at this mystery's card.
    // No mutation of bead corpus, mystery ordering or source text occurs.
    const outcome=await win?.AO_MODULES?.open?.("pray.rosary",{
     sourceObject:{type:"rosary",mysteryId:id},
     returnContext:null,
     onCloseReturn:()=>{void Promise.resolve(shell.navigate("home")).catch(()=>{})}
    });
    accepted=outcome?.ok===true;
   }else if(kind==="bibleAtlas"){
    accepted=(await win?.AO_FIND_APP_V1?.openAtlasEvent?.(
      "biblical:event:"+id,
      {onCloseReturn:()=>{void Promise.resolve(shell.navigate("home")).catch(()=>{})}}
    ))===true;
   }
  }
 }catch(error){
  try{win?.console?.error?.("Sacred Art navigation failed",kind,id,error)}catch{}
 }
 if(!accepted&&shell.getActive?.()!=="home"){
  try{await shell.navigate("home")}catch{}
 }
 return accepted;
}
