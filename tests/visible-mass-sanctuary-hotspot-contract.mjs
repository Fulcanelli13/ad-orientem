import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { createHash } from 'node:crypto';

const root=path.resolve(import.meta.dirname,'..');
const html=fs.readFileSync(path.join(root,'previews/visible-mass-3d/sanctuary-hotspot-pilot.html'),'utf8');
const registry=JSON.parse(fs.readFileSync(path.join(root,'previews/visible-mass-3d/PHASE1_SANCTUARY_PILOT_QUESTIONS_20261017.v1.json'),'utf8'));
const main=fs.readFileSync(path.join(root,'previews/visible-mass-3d/PHASE1_OBJECT_QUESTION_RECONCILIATION_20261017.md'),'utf8');
const photos=JSON.parse(fs.readFileSync(path.join(root,'previews/visible-mass-3d/sanctuary-inspection-sources-20261017.v1.json'),'utf8'));
assert.equal(photos.assets.length,17,'seventeen documented inspection subjects');
assert.deepEqual(new Set(photos.assets.map(a=>a.object_id)).size,17,'every inspection has distinct physical object identity');
assert.deepEqual(photos.assets.slice(0,7).map(a=>a.object_id),['AL03','AL16','BK01','SV01','SV02','LN02','LN03']);
for(const id of ['SV03','SN05','LN04','LN05','EQ01','EQ02','SV13','AL14','LN01','SN07'])
 assert.ok(photos.assets.some(a=>a.object_id===id),'required reconciliation expansion: '+id);
for(const photo of photos.assets) {
 assert.match(photo.image_url,/^https:\/\/(?:upload|thumb)\.wikimedia\.org\/wikipedia\/commons\//);
 assert.match(photo.source_url,/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
 assert.ok(photo.creator && photo.licence && photo.licence_url,'explicit rights evidence');
 const url=new URL(photo.image_url);
 const bits=decodeURIComponent(url.pathname).split('/').filter(Boolean);
 const i=bits.indexOf('commons')+1;
 const sliced=bits[i]==='thumb'?bits.slice(i+1):bits.slice(i);
 const filename=sliced[2];
 const hash=createHash('md5').update(filename,'utf8').digest('hex');
 assert.equal(sliced[0],hash[0],photo.object_id+' Wikimedia storage prefix');
 assert.equal(sliced[1],hash.slice(0,2),photo.object_id+' Wikimedia filename hash');

 assert.equal(photo.scene,'SEPARATE_INSPECTION_PHOTOGRAPH');
 assert.ok(typeof photo.note==='string'&&photo.note.length>50,'inspection provenance note');
 assert.ok(['Altar & sanctuary','Books','Vessels','Sacred linens','Serving equipment'].includes(photo.zone));
 assert.ok(['PHOTO_OBJECT','PHOTO_MUSEUM','PHOTO_CONTEXT','HISTORICAL_ILLUSTRATION'].includes(photo.asset_kind));
 const object=registry.objects.find(o=>o.object_id===photo.object_id);
 assert.ok(object,'inspection must be a registry subject: '+photo.object_id);
 assert.equal(object.glossary_id,photo.glossary_id);
 assert.ok(object.question_ids.length>=3,'inspection must support linked questions');
}
assert.match(html,/sanctuary-inspection-sources-20261017\.v1\.json/);
assert.match(html,/Separate reference photograph/);
assert.match(html,/Return to Brompton/);
assert.match(html,/showInspection/);
assert.match(html,/showChurch/);

const script=html.match(/<script>([\s\S]*?)<\/script>/);
assert.ok(script,'exactly one embedded JS controller');
new vm.Script(script[1],{filename:'sanctuary-hotspot-pilot-inline.js'});
const segment=script[1].match(/const SPOTS=\[([\s\S]*?)\];/);
assert.ok(segment,'hotspots are declarative');
const spots=[...segment[1].matchAll(/\{id:"([A-Z]{2}\d{2})",g:"(G\d{3})",title:"([^"]+)",n:(\d+),x:([\d.]+),y:([\d.]+),match:"([DR])"\}/g)]
.map(m=>({id:m[1],g:m[2],title:m[3],n:+m[4],x:+m[5],y:+m[6],match:m[7]}));
assert.equal(spots.length,6,'only six inspected hotspots');
const high=spots.find(x=>x.id==='AL01'); const steps=spots.find(x=>x.id==='SN04');
assert.ok(Math.hypot(high.x-steps.x,high.y-steps.y)>12,
 'high altar and steps should not overlap on the 750-pixel mobile pan canvas');
assert.deepEqual(spots.map(s=>s.id),['AL01','AL06','AL07','AL19','SN02','SN04']);
assert.equal(new Set(spots.map(s=>s.id)).size,6);
assert.equal(registry.objects.length,30);
assert.equal(registry.questions.length,134);
const relatedSection=script[1].match(/const RELATED_OBJECTS=\{([\s\S]*?)\};/);
assert.ok(relatedSection,'related object adapter must be declared');
const graph=vm.runInNewContext('({'+relatedSection[1]+'})');
const visual=new Set([...spots.map(s=>s.id),...photos.assets.map(a=>a.object_id)]);
const missing=registry.objects.filter(o=>!visual.has(o.object_id)).map(o=>o.object_id).sort();
assert.deepEqual(missing,['AL08','AL10','AL13','AL17','AL18','BK02','EQ06']);
const reached=new Set(spots.map(s=>s.id));
let frontier=[...reached];
while(frontier.length){
 const next=[];
 for(const from of frontier)for(const to of graph[from]||[]){
  assert.ok(registry.objects.some(o=>o.object_id===to),'relation must refer to real pilot object: '+to);
  if(!reached.has(to)){reached.add(to);next.push(to);}
 }
 frontier=next;
}
assert.equal(reached.size,30,'every pilot object must be navigable from an actual scene hotspot');
assert.ok(missing.every(id=>reached.has(id)),'non-photographed subjects must still be discoverable');
assert.match(html,/No independent object photograph or direct church hotspot has been verified/);
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
assert.match(html,/inspection-choices/);
assert.match(html,/inspection-provenance/);
assert.match(html,/photo-credit/);
assert.match(html,/photo-viewport/);
assert.match(html,/renderRelatedObjects/);
assert.match(html,/inspect-family/);
assert.match(html,/HISTORICAL_ILLUSTRATION/);
assert.match(html,/id="inspection-type"/);

assert.match(html,/PHASE1_SANCTUARY_PILOT_QUESTIONS_20261017\.v1\.json/);
assert.match(html,/not yet been published/,'not fabricating Phase 1.5 answers');
assert.match(html,/aria-label="Selected object and questions"/);
assert.match(html,/prefers-reduced-motion:reduce/);
assert.doesNotMatch(html,/<canvas\b/,'this photo must not pretend to be GLB/3D');
console.log('VISIBLE MASS SANCTUARY P1 CONTRACT PASS:',spots.length,'photo hotspots;',registry.questions.length,'registered questions');
