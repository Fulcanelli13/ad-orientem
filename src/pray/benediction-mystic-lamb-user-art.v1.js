// Approved thematic Benediction artwork; the rite itself stays unchanged.
// The source image is permanent and recorded in assets/prayer/user-approved/source-provenance.v1.json.
// This scene is heavenly adoration; do not present it as an illustration of the minister's blessing.
const SOURCE="assets/prayer/user-approved/benediction-mystic-lamb.webp";
export const BENEDICTION_USER_ART_20261031=Object.freeze({
 slot:"STG-pray.benediction-03",
 scene:"Heavenly Adoration of the Mystic Lamb",
 artist:"Jan and Hubert van Eyck",
 source:SOURCE,
 displayedStage:"adoration",
 rights:"Wikimedia Commons PD-Art/public-domain reproduction",
 otherPreviouslyApprovedCoverPreserved:true
});
export function renderSelectedBenedictionArtwork(stage,isFrench=false){
 if(stage!=="adoration")return "";
 return '<figure class="aoBenedictionSelectedArt" data-ao-user-selected-theme="mystic-lamb" aria-label="'+
  (isFrench?"L’Adoration de l’Agneau mystique":"The Adoration of the Mystic Lamb")+'">'+
  '<img src="'+SOURCE+'" alt="'+(isFrench?
  "Jan van Eyck, L’Adoration de l’Agneau mystique : l’Agneau de Dieu entouré des saints.":
  "Jan van Eyck, The Adoration of the Mystic Lamb: the Lamb of God surrounded by saints.")+
  '" loading="lazy" decoding="async">'+
  '<figcaption>'+(isFrench?
  "Jan van Eyck · L’Adoration de l’Agneau mystique (vers 1432) · vision céleste, non représentation de la bénédiction liturgique.":
  "Jan van Eyck · The Adoration of the Mystic Lamb (c. 1432) · heavenly adoration, not a depiction of the liturgical blessing.")+
  '</figcaption></figure>';
}
