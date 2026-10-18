/** M5: verified complementary photographs, never interpolated camera positions.
 * Each close view is a distinct source with independent authorship and pose.
 * Newman is a Catholic architectural visit, not a 1962 Mass record.
 */
export const M5_PHOTO_VIEWS=Object.freeze({
 NEWMAN_ALTAR_1:Object.freeze({
  id:"NEWMAN_ALTAR_1",venue:"NEWMAN_DUBLIN",key:"newman_altar1",kind:"STILL",
  label:"Main altar · front",caption:"Newman University Church, Dublin · separate main-altar photograph",
  filename:"Dublin Newman University Church Interior Choir Main Altar 1.jpg",
  creator:"Zairon",licence:"CC BY 4.0",licenceUrl:"https://creativecommons.org/licenses/by/4.0/",
  source:"https://commons.wikimedia.org/wiki/File:Dublin_Newman_University_Church_Interior_Choir_Main_Altar_1.jpg"
 }),
 NEWMAN_ALTAR_2:Object.freeze({
  id:"NEWMAN_ALTAR_2",venue:"NEWMAN_DUBLIN",key:"newman_altar2",kind:"STILL",
  label:"Main altar · detail",caption:"Newman University Church, Dublin · separate close view of the altar",
  filename:"Dublin Newman University Church Interior Choir Main Altar 2.jpg",
  creator:"Zairon",licence:"CC BY 4.0",licenceUrl:"https://creativecommons.org/licenses/by/4.0/",
  source:"https://commons.wikimedia.org/wiki/File:Dublin_Newman_University_Church_Interior_Choir_Main_Altar_2.jpg"
 }),
 NEWMAN_APSE:Object.freeze({
  id:"NEWMAN_APSE",venue:"NEWMAN_DUBLIN",key:"newman_apse",kind:"STILL",
  label:"Apse · close",caption:"Newman University Church, Dublin · distinct apse photograph",
  filename:"Dublin Newman University Church Interior Choir Apse 1.jpg",
  creator:"Zairon",licence:"CC BY 4.0",licenceUrl:"https://creativecommons.org/licenses/by/4.0/",
  source:"https://commons.wikimedia.org/wiki/File:Dublin_Newman_University_Church_Interior_Choir_Apse_1.jpg"
 }),
 NEWMAN_PULPIT:Object.freeze({
  id:"NEWMAN_PULPIT",venue:"NEWMAN_DUBLIN",key:"newman_pulpit",kind:"STILL",
  label:"Pulpit · close",caption:"Newman University Church, Dublin · separate nave pulpit photograph",
  filename:"Dublin Newman University Church Interior Nave Pulpit.jpg",
  creator:"Zairon",licence:"CC BY 4.0",licenceUrl:"https://creativecommons.org/licenses/by/4.0/",
  source:"https://commons.wikimedia.org/wiki/File:Dublin_Newman_University_Church_Interior_Nave_Pulpit.jpg"
 })
});
export const M5_SOURCE_IDS=Object.freeze(["BROMPTON_PANO","BROMPTON_ALTAR_2019_A","NEWMAN_360",...Object.keys(M5_PHOTO_VIEWS)]);
export function m5PhotoRequest(id){
 const photo=M5_PHOTO_VIEWS[id];if(!photo)throw Error("Unknown original close photograph");
 return "https://commons.wikimedia.org/w/api.php?"+new URLSearchParams({
  action:"query",format:"json",formatversion:"2",prop:"imageinfo",iiprop:"url|size",
  iiurlwidth:"1800",titles:"File:"+photo.filename,origin:"*"
 });
}
export function m5OriginalPhotoURL(value){
 return typeof value==="string"&&/^https:\/\/(?:upload|thumb)\.wikimedia\.org\/wikipedia\/commons\//.test(value);
}
export function m5PhotoPose(id,pose){
 if(!Object.hasOwn(M5_PHOTO_VIEWS,id))throw Error("Unknown original close photograph");
 const zoom=Number(pose?.zoom);
 if(!Number.isFinite(zoom))throw Error("Original still zoom unavailable");
 return Object.freeze({sceneId:id,zoom:Math.min(2.25,Math.max(1,zoom)),
  offsetX:Math.max(0,Number(pose.offsetX)||0),offsetY:Math.max(0,Number(pose.offsetY)||0)});
}
