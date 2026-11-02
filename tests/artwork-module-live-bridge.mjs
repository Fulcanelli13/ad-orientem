import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
import {RELEASED_MODULE_PAINTINGS,releasedModulePhoto,releasedModulePhotoMarkup} from "../src/art/released-module-paintings.v1.js";
import {renderPilotAngelusEntry} from "../src/pray/prayer-design-pilot.js";
const source=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");
assert.deepEqual(Object.keys(RELEASED_MODULE_PAINTINGS),["angelus","adoration"]);
for(const id of Object.keys(RELEASED_MODULE_PAINTINGS)){
 const a=releasedModulePhoto(id);
 assert.ok(existsSync(new URL("../"+a.image,import.meta.url)), "Released photo missing: "+id);
 assert.ok(existsSync(new URL("../"+a.original,import.meta.url)), "Released original missing: "+id);
 assert.match(a.source,/^https:\/\/www.metmuseum.org\/art\/collection\/search\//);
 const markup=releasedModulePhotoMarkup(id,{className:"aoTestPhoto"});
 assert.match(markup,/data-ao-released-module-photo/);
 assert.match(markup,/data-ao-photo-release-pr="2277"/);
 assert.ok(markup.includes(a.image));
}
assert.equal(releasedModulePhoto("confession"),null,"Do not publish staged Confession");
assert.equal(releasedModulePhotoMarkup("regina"),"","Do not use Angelus painting for Regina Caeli");
const args={head:()=>"",L:(en,fr)=>en,esc:s=>s,posture:"Kneel",moduleIcon:()=>"",recitation:"individual",hour:12};
const angelus=renderPilotAngelusEntry({...args,form:"angelus"});
assert.ok(angelus.includes("angelus-frameless.webp"));
assert.ok(angelus.includes('data-ao-art-publication="released"'));
const regina=renderPilotAngelusEntry({...args,form:"regina"});
assert.ok(!regina.includes("angelus-frameless.webp"));
assert.ok(regina.includes('data-ao-art-publication="unassigned"'));
const pilot=source("src/pray/prayer-design-pilot.js");
const runtime=source("src/pray/presentation-runtime.js");
const home=source("src/home/c3-gallery.js");
for(const s of ['tile.id==="eucharistic"','aoPrayPilotReleasedTilePhoto','releasedModulePhotoMarkup("angelus"'])
 assert.ok(pilot.includes(s),"Missing Prayer discovery/Angelus integration "+s);
for(const s of ['familyId==="eucharistic"','releasedModulePhotoMarkup("adoration"','releasedDoorPhoto?', 'aoPrayerAdorationCover'])
 assert.ok(runtime.includes(s),"Missing Prayer shelf/Adoration integration "+s);
assert.ok(home.includes("C3_APPROVED_MET_PRAYER_ART=RELEASED_MODULE_PAINTINGS"),"Home must share released registry");
assert.ok(source("src/pray/art-slot-map.v1.js").includes('publicationState:"UNASSIGNED"'),"Do not auto-release other door artwork");
assert.ok(source("src/pray/stations-verified-artwork-release.v1.js").includes("Object.freeze({})"),"Do not publish staged Stations");
console.log("Approved Met art bridge PASS: Home, Eucharistic mosaic and shelf, Angelus entry, Adoration chooser; other art held.");
