import assert from "node:assert/strict";
import fs from "node:fs";
import {M4_PANORAMA_SCENES,m4PanoramaPose,m4EquirectangularUV,m4SourceRequest}
 from "../previews/visible-mass-3d/visible-mass-m4-panorama.mjs";

const scenes=Object.values(M4_PANORAMA_SCENES);
assert.deepEqual(scenes.map(x=>x.id),["BROMPTON_PANO","NEWMAN_360"]);
assert.equal(new Set(scenes.map(x=>x.venue)).size,2,"separate Catholic church visits");
for(const scene of scenes){
 assert.match(scene.source,/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
 assert.equal(scene.creator,"David Iliff");
 assert.equal(scene.licence,"CC BY-SA 3.0");
 assert.equal(scene.licenceUrl,"https://creativecommons.org/licenses/by-sa/3.0/");
 const request=new URL(m4SourceRequest(scene.id));
 assert.equal(request.searchParams.get("titles"),"File:"+scene.filename);
 assert.equal(request.searchParams.get("origin"),"*");
 assert.equal(request.searchParams.get("iiurlwidth"),"2048");
}
assert.match(M4_PANORAMA_SCENES.NEWMAN_360.caption,/not a 1962 Mass record/);
assert.throws(()=>m4SourceRequest("UNKNOWN"),/Unknown original/);
const pose=m4PanoramaPose("BROMPTON_PANO",{yaw:0,pitch:0,fov:70});
const centre=m4EquirectangularUV(199.5,99.5,400,200,pose);
assert.ok(Math.abs(centre.u-.5)<.001 && Math.abs(centre.v-.5)<.001,"equator maps to panorama middle");
assert.ok(m4EquirectangularUV(199,0,400,200,pose).v<.5,"look UP must read upper (zenith) image rows");
assert.ok(m4EquirectangularUV(199,199,400,200,pose).v>.5,"look DOWN must read lower (nadir) image rows");
const up=m4PanoramaPose("BROMPTON_PANO",{yaw:0,pitch:.35,fov:70});
assert.ok(m4EquirectangularUV(199,99,400,200,up).v<.5,"upward camera pitch must not invert photograph");
const clamped=m4PanoramaPose("NEWMAN_360",{yaw:20,pitch:3,fov:5});
assert.equal(clamped.pitch,1.25);assert.equal(clamped.fov,36);
assert.ok(Math.abs(clamped.yaw)<=Math.PI);
assert.throws(()=>m4PanoramaPose("BROMPTON_PANO",{yaw:NaN,pitch:0,fov:60}),/Invalid panorama/);
const html=fs.readFileSync(new URL("../previews/visible-mass-3d/sanctuary-hotspot-pilot.html",import.meta.url),"utf8");
for(const target of ['data-photo-mode="still"','data-photo-mode="brompton"','data-photo-mode="newman"',
 'id="panorama-stage"','id="photo-viewport"','visible-mass-m4-panorama.mjs',
 'returnPhotoMode','panoramaController?.hide()','if(state.view!=="church")showChurch()', 'id="m5-close-stage"'])
 assert.ok(html.includes(target),"M4 same-viewer integration: "+target);
assert.match(html,/state\.view="panorama"[\s\S]*?\$\("photo-viewport"\)\.hidden=true/,"no six still-photo hotspots on panorama");
assert.match(html,/state\.view="church"[\s\S]*?\$\("panorama-stage"\)\.hidden=true/,"original still stays independent");
assert.equal((html.match(/className="marker"/g)||[]).length,1,"existing six-marker controller unchanged");
assert.ok(html.includes('id="photo-license"')&&html.includes('id="photo-transform"'),"original photographer, licence and perspective adaptation independently linked");
const implementation=fs.readFileSync(new URL("../previews/visible-mass-3d/visible-mass-m4-panorama.mjs",import.meta.url),"utf8");
assert.match(implementation,/img\.naturalWidth>2048/,"prevent large-image black GPU texture regression");
assert.match(implementation,/function createM4Gpu/,"optional fast real-photo projection retained");
assert.match(implementation,/const ctx=gpu\?null:canvas\.getContext/,"software fallback survives without WebGL");

console.log("PASS M4 original upright 360° sources, distinct venues, no coordinate transfer, isolated panorama camera view.");
