/**
 * Sacred Art Batch 1 — living index of photographs that have ALREADY been
 * released to production. Importing this module never promotes a candidate,
 * changes any dated Calendar art, or alters existing Prayer placement rules.
 *
 * Identity here is a release-photo identity, not a physical-painting census.
 * The source-backed gallery intentionally remains separate from the 989
 * research groups and the 25 user-approved but unreleased photo records.
 */
import { RELEASED_MODULE_PAINTINGS } from "./released-module-paintings.v1.js";

const imagePath = /^assets\/(?:prayer|home)\/[a-z0-9/_.-]+\.(?:jpg|jpeg|png|webp)$/i;
const permittedRights = /\bCC0\b|\bPD-Art\b|public domain/i;

function releasedEntry(id, photo) {
  if(!photo || !photo.title || !photo.artist ||
     !/^https:\/\//.test(photo.source ?? "") ||
     !imagePath.test(photo.image ?? "") ||
     !imagePath.test(photo.original ?? "") ||
     !Number.isInteger(photo.releasePr) ||
     !permittedRights.test(photo.photographRights ?? "")) return null;
  return Object.freeze({
    id: "released-photo:" + id,
    moduleId: id,
    title: photo.title,
    artist: photo.artist,
    source: photo.source,
    image: "/" + photo.image,
    original: "/" + photo.original,
    rights: photo.photographRights,
    releasePr: photo.releasePr,
    releaseState: "PREVIOUSLY_RELEASED_EXACT_MODULE_PHOTO",
    // Image rights and user editorial placement are never inferred from a
    // matching title or from inclusion in this gallery.
    newEditorialApproval: false,
    newPublication: false
  });
}

/** Stable insertion order: exactly the known previous 16 released photos. */
export const SACRED_ART_RELEASED_GALLERY_V1 = Object.freeze(
  Object.entries(RELEASED_MODULE_PAINTINGS)
    .map(([id, photo]) => releasedEntry(id, photo))
    .filter(Boolean)
);
export function releasedGalleryBySource(source) {
  if(typeof source !== "string" || !source) return null;
  return SACRED_ART_RELEASED_GALLERY_V1.find(a => a.source === source) ?? null;
}
export function releasedGalleryAt(index) {
  return Number.isInteger(index) && index >= 0 &&
    index < SACRED_ART_RELEASED_GALLERY_V1.length
    ? SACRED_ART_RELEASED_GALLERY_V1[index] : null;
}
