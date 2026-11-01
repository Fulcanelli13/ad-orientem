// Historical photograph selected by the user for the St Therese novena cover.
// The photographic original is 362x498, so never enlarge it with synthetic pixels.
export const USER_SELECTED_THERESE_PORTRAIT=Object.freeze({
 novenaId:"st_therese",
 asset:"assets/prayer/user-approved/st-therese-lisieux-historical-portrait.webp",
 source:"https://commons.wikimedia.org/wiki/File:Therese_lisieux_portrait.jpg",
 originalWidth:362,originalHeight:498,
 status:"USER_FINAL_SELECTED_PUBLIC_DOMAIN",
 stage:"novena-cover"
});
export function selectedThereseNovenaCover(id,french=false){
 if(id!=="st_therese")return "";
 const src=USER_SELECTED_THERESE_PORTRAIT.asset;
 const alt=french?"Photographie historique de sainte Thérèse de Lisieux":"Historical photograph of Saint Thérèse of Lisieux";
 const caption=french?"Sainte Thérèse de Lisieux · photographie prise avant 1897.":"Saint Thérèse of Lisieux · photograph taken before 1897.";
 return '<figure class="aoThereseChosenNovenaCover" data-ao-user-selected-st-therese-photo="true"><img src="'+src+'" width="362" height="498" loading="lazy" decoding="async" alt="'+alt+'"><figcaption>'+caption+'</figcaption></figure>';
}
