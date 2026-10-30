#!/usr/bin/env node
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {dirname,join} from "node:path";
import {fileURLToPath} from "node:url";
const here=dirname(fileURLToPath(import.meta.url));
const read=(p)=>JSON.parse(readFileSync(join(here,p),"utf8"));
const d=read("p103-app-layout-and-license-readiness.json");
const geo=read("../../../../data/geography/seed-registry.v1.json");
const cov=read("../../../../data/geography/approved-place-media.v1.json");
const gal=read("../../../../data/geography/approved-place-gallery.v1.json");
const p102=read("../p102-source-preview-editorial-20261030/p102-actual-preview-editorial.json");
const photos=d.new_release_candidates;
assert.equal(d.schema,"AO_P103_PHOTO_APP_LAYOUT_AND_COPYRIGHT_PRE_RELEASE_V1");
assert.deepEqual(photos.map(p=>p.photo_id),[61,71,195]);
assert.equal(geo.places.length,529);
assert.equal(geo.directoryPlaceLinks.length,22);
assert.equal(cov.items.length,36);
assert.equal(gal.items.length,33);
assert.equal(d.release_candidates_with_confirmed_place_join,0);
for(const x of photos){
 const source=p102.entries.find(e=>e.photo_id===x.photo_id);
 assert.equal(source?.exact_source_file_page,x.exact_source_page);
 assert.equal(source?.independent_sha1,x.independent_sha1);
 assert.equal(source?.independent_sha256,x.independent_sha256);
 assert.equal(source?.editorial_preview_role,"PREFERRED_EXTERIOR_PREVIEW");
 assert.equal(x.verified_place_join,false);
 assert.equal(x.canonical_place_id,null);
 assert.equal(x.confirmed_directory_link_id,null);
 assert.equal(x.full_native_pixel_visual_inspection_completed,false);
 assert.equal(x.actual_mobile_desktop_render_test_completed,false);
 assert.equal(x.credit_and_rights_final_app_review_completed,false);
 assert.equal(x.editorial_approved,false);
 assert.equal(x.published,false);
 assert.equal(cov.items.some(a=>a.source_url===x.exact_source_page),false);
 assert.equal(gal.items.some(a=>a.source_url===x.exact_source_page),false);
 assert.equal(x.source_page_free_license_observed,true);
 assert.ok(x.license_url.startsWith("https://creativecommons.org/"));
}
assert.deepEqual(photos.map(x=>x.declared_free_license),["CC-BY-SA-4.0","CC-BY-SA-4.0","CC0-1.0"]);
const rights=Object.freeze({
 "PUBLIC_DOMAIN":"https://creativecommons.org/publicdomain/mark/1.0/",
 "CC0-1.0":"https://creativecommons.org/publicdomain/zero/1.0/",
 "CC-BY-3.0":"https://creativecommons.org/licenses/by/3.0/",
 "CC-BY-4.0":"https://creativecommons.org/licenses/by/4.0/",
 "CC-BY-SA-2.0":"https://creativecommons.org/licenses/by-sa/2.0/",
 "CC-BY-SA-3.0":"https://creativecommons.org/licenses/by-sa/3.0/",
 "CC-BY-SA-4.0":"https://creativecommons.org/licenses/by-sa/4.0/"
});
for(const a of [...cov.items,...gal.items])assert.equal(a.license_url,rights[a.license],"Inaccurate license URL in "+a.asset_path);
assert.equal(d.production_images_added,0);
assert.equal(d.files_downloaded_from_wikimedia_this_pass,0);
assert.equal(d.cost_eur,0);
console.log("PASS P103: 69 existing approved records have matched license URLs; 3 research candidates held without exact Place joins; no media release.");
