/** Exact Vatican Raphael original for the frozen Second Sunday of Lent.
 * This original artwork identity is MV.40333, NOT the Dulwich Gallery
 * "The Transfiguration" (507), despite its mislabelled Google Art Project
 * attribution. The existing artbook-scan original is retained unaltered.
 */
import {annualHomeArtworkDay2026} from "./annual-home-artwork-2026.js";

export const RAPHAEL_VATICAN_2026_SOURCE=Object.freeze({
 date:"2026-03-01",principalId:"tempora:Quad2-0:1:v",properPath:"Tempora/Quad2-0",
 artist:"Raphael",title:"The Transfiguration",titleFr:"La Transfiguration",
 artworkId:"frozen-date:2026-03-01",
 editorialBasis:"NEW_DATE_SPECIFIC_APPROVAL",
 sourceObject:"https://www.museivaticani.va/content/museivaticani/en/collezioni/musei/la-pinacoteca/sala-viii---secolo-xvi/raffaello-sanzio--trasfigurazione.html",
 collectionIdentity:"Vatican Museums, Pinacoteca Vaticana, MV.40333",
 photoFilePage:"https://commons.wikimedia.org/wiki/File:Raffael-verkl%C3%A4rung-christi.jpg",
 image:"/assets/home/class-i-2026/raphael-transfiguration-vatican-original.jpg",
 imageSize:Object.freeze([3737,5691]),
 sha1:"489fffc5a957e61fb4f46fcd758b3a126f39c187",
 sha256:"1f61791a23d3ba16f25e953f7d17c0a7e1c2fdf967b26f041bee546ebf22601a",
 photoOriginalBytes:5205139,
 photoCredit:"2011 art-book reproduction scan, Commons user Hgrobe; original book VEB E. A. Seemann Verlag, Leipzig",
 rights:"Wikimedia Commons Public Domain Mark: faithful 2D reproduction of public-domain Raphael painting; related photographic rights vary by jurisdiction. Not a Vatican Museums photographic master.",
 imageStatus:"LOCAL_VATICAN_RAPHAEL_SOURCE_VERIFIED_UNALTERED_ARTBOOK_SCAN",
 selectionKind:"FROZEN_CLASS_I_RAPHAEL_VATICAN_EXACT_LOCAL_PHOTO",
 ownerArtworkDecisionNewlyCreated:false,
 photographCropCertified:false,
 photoSourceIsMuseumMaster:false
});

export function releasedRaphaelVaticanHomeArtwork2026(date,principalId,properPath){
 const r=RAPHAEL_VATICAN_2026_SOURCE;
 const frozen=annualHomeArtworkDay2026(date,principalId);
 if(date!==r.date||principalId!==r.principalId||properPath!==r.properPath||
    frozen?.rank!=="I"||
    frozen?.selection?.title!==r.title||
    frozen?.selection?.artist!==r.artist||
    frozen?.selection?.editorialBasis!==r.editorialBasis)return null;
 return Object.freeze({
  date,principalId,properPath,artworkId:r.artworkId,
  title:r.title,titleFr:r.titleFr,artist:r.artist,
  image:r.image,infoImage:r.image,
  source:r.sourceObject,rights:r.rights,
  imageSource:r.photoFilePage,
  photoCredit:r.photoCredit,collectionIdentity:r.collectionIdentity,
  photoOriginalSha1:r.sha1,photoOriginalSha256:r.sha256,
  photoOriginalBytes:r.photoOriginalBytes,
  photoSourceIsMuseumMaster:false,
  imageStatus:r.imageStatus,selectionKind:r.selectionKind,
  offlineOriginalCertified:true,photographCropCertified:false,
  ownerArtworkDecisionNewlyCreated:false
 });
}
