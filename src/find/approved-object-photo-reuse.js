// Reuse only an already-approved, byte-pinned Place cover for the *same*
// specifically sourced physical relic housing. Never guess from names, Places,
// galleries, research ZIPs, subjects in nearby rooms, or generic shrine photos.
export const APPROVED_OBJECT_PHOTO_REUSE_VERSION="ao.approved-object-photo-reuse.v1";
const rows=x=>Array.isArray(x)?x:[];
const txt=x=>typeof x==="string"?x.trim():"";
const hex40=x=>/^[a-f0-9]{40}$/.test(txt(x));
const hex64=x=>/^[a-f0-9]{64}$/.test(txt(x));
const https=x=>/^https:\/\/[^\s]+$/.test(txt(x));
const approvedPhotoTypes=new Set([
  "RELIQUARY_HOUSING_REPUTED_RELIC",
  "GLASS_SHRINE_REPORTED_BODILY_REMAINS"
]);
export function resolveApprovedObjectPhotoReuse(records,covers,placeId,relicId){
  if(!txt(placeId)||!txt(relicId))return null;
  const matches=rows(records).filter(row=>row?.place_id===placeId&&row?.subject_relic_id===relicId);
  // Duplicate registrations are an editorial conflict: never choose the first.
  if(matches.length!==1)return null;
  const row=matches[0];
  if(row.status!=="APPROVED_REUSE_OF_EXISTING_VERIFIED_PLACE_COVER"||
     !approvedPhotoTypes.has(row.depicts_kind)||
     row.photographic_subject_scope!=="SAME_PHYSICAL_SHRINE_HOUSING_RELIC_NOT_HEAD_DETAIL"||
     !/^\d{4}-\d{2}-\d{2}$/.test(txt(row.photographed_at))||
     !/^https:\/\/[^\s]+$/.test(txt(row.official_subject_source_url))||
     !hex40(row.approved_cover_source_sha1)||!hex64(row.approved_cover_derivative_sha256)||
     !/^assets\/approved\/place-media\/[a-zA-Z0-9_.-]+\.webp$/.test(txt(row.approved_cover_asset_path))||
     !txt(row.media_id)||!txt(row.label_en)||!txt(row.label_fr)||
     !txt(row.alt_en)||!txt(row.alt_fr)||!txt(row.caption_en)||!txt(row.caption_fr)||
     row.site_photo_also_used_as_place_cover!==true||
     row.not_approved_for_any_other_relic!==true||row.no_new_image_bytes!==true||
     row.no_user_keep_vote_modified!==true)return null;
  const same=rows(covers).filter(item=>item?.place_id===placeId&&
    item.asset_path===row.approved_cover_asset_path);
  if(same.length!==1)return null;
  const cover=same[0];
  const width=Number(cover.width),height=Number(cover.height);
  if(cover.status!=="APPROVED"||!cover.rights_verified||!cover.subject_verified||
     !cover.crop_reviewed||cover.source_sha1!==row.approved_cover_source_sha1||
     cover.derivative_sha256!==row.approved_cover_derivative_sha256||
     !hex40(cover.source_sha1)||!hex64(cover.derivative_sha256)||
     !https(cover.source_url)||!/^https:\/\/commons\.wikimedia\.org\/wiki\/File(?:%3A|:)/.test(cover.source_url)||
     !https(cover.license_url)||!/^https:\/\/creativecommons\.org\/licenses\//.test(cover.license_url)||
     !txt(cover.credit)||!txt(cover.license)||!txt(cover.changes_en)||!txt(cover.changes_fr)||
     !Number.isFinite(width)||!Number.isFinite(height)||Math.min(width,height)<500||
     cover.orientation!==(height>width?"portrait":"landscape"))return null;
  return Object.freeze({
    media_id:row.media_id,place_id:placeId,subject_relic_id:relicId,
    depicts_kind:row.depicts_kind,photographed_at:row.photographed_at,
    asset_path:cover.asset_path,source_url:cover.source_url,source_sha1:cover.source_sha1,
    derivative_sha256:cover.derivative_sha256,credit:cover.credit,
    license:cover.license,license_url:cover.license_url,
    changes_en:cover.changes_en,changes_fr:cover.changes_fr,
    alt_en:row.alt_en,alt_fr:row.alt_fr,caption_en:row.caption_en,caption_fr:row.caption_fr,
    label_en:row.label_en,label_fr:row.label_fr,
    media_reuse_source:"EXACT_APPROVED_PLACE_COVER",additional_asset_bytes:0
  });
}
