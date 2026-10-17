import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';

const root=path.resolve(import.meta.dirname,'..');
const html=fs.readFileSync(path.join(root,'previews/visible-mass-3d/sanctuary-hotspot-pilot.html'),'utf8');
const registry=JSON.parse(fs.readFileSync(path.join(root,'previews/visible-mass-3d/PHASE1_SANCTUARY_PILOT_QUESTIONS_20261017.v1.json'),'utf8'));
const main=fs.readFileSync(path.join(root,'previews/visible-mass-3d/PHASE1_OBJECT_QUESTION_RECONCILIATION_20261017.md'),'utf8');
const script=html.match(/<script>([\s\S]*?)<\/script>/);
assert.ok(script,'exactly one embedded JS controller');
new vm.Script(script[1],{filename:'sanctuary-hotspot-pilot-inline.js'});
const segment=script[1].match(/const SPOTS=\[([\s\S]*?)\];/);
assert.ok(segment,'hotspots are declarative');
const spots=[...segment[1].matchAll(/\{id:"([A-Z]{2}\d{2})",g:"(G\d{3})",title:"([^"]+)",n:(\d+),x:([\d.]+),y:([\d.]+),match:"([DR])"\}/g)]
.map(m=>({id:m[1],g:m[2],title:m[3],n:+m[4],x:+m[5],y:+m[6],match:m[7]}));
assert.equal(spots.length,6,'only six inspected hotspots');
assert.deepEqual(spots.map(s=>s.id),['AL01','AL06','AL07','AL19','SN02','SN04']);
assert.equal(new Set(spots.map(s=>s.id)).size,6);
assert.equal(registry.objects.length,30);
assert.equal(registry.questions.length,134);
for(const s of spots) {
 assert.ok(s.x>0&&s.x<100&&s.y>0&&s.y<100, s.id+' off image');
 assert.ok(s.title.length>3);
 const obj=registry.objects.find(x=>x.object_id===s.id);
 assert.ok(obj,s.id+' missing from question register');
 assert.equal(obj.glossary_id,s.g);
 assert.equal(obj.glossary_match,s.match);
 assert.equal(obj.scene_audit.photographic_state,'VISIBLE_OBJECT_CONFIRMED_IN_REFERENCE_STILLS',s.id+' not photo verified');
 assert.ok(obj.question_ids.length>=3,s.id+' needs relevant questions');
 assert.ok(main.includes('| '+s.id+' |'),s.id+' absent from original master');
}
assert.match(html,/The_High_Altar_-_geograph\.org\.uk_-_6213275\.jpg/);
assert.match(html,/Anthony O'Neil/);
assert.match(html,/CC BY-SA 2\.0/);
assert.match(html,/data\/glossary\/concepts-/,'use canonical definitions');
assert.match(html,/PHASE1_SANCTUARY_PILOT_QUESTIONS_20261017\.v1\.json/);
assert.match(html,/not yet been published/,'not fabricating Phase 1.5 answers');
assert.match(html,/aria-label="Selected object and questions"/);
assert.match(html,/prefers-reduced-motion:reduce/);
assert.doesNotMatch(html,/<canvas\b/,'this photo must not pretend to be GLB/3D');
console.log('VISIBLE MASS SANCTUARY P1 CONTRACT PASS:',spots.length,'photo hotspots;',registry.questions.length,'registered questions');
