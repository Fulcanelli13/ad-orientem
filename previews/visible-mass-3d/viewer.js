// Visible Mass P0: experimental scene viewer; deliberately independent of Mass reader.
// The church is an external asset. Hotspots refer to existing canonical glossary IDs.
const $ = id => document.getElementById(id);
const A = window.BABYLON;
if (!A) { $('status').textContent = 'Babylon.js CDN unavailable. Connect to the internet and reload.'; throw new Error('Babylon.js missing'); }
const canvas = $('renderCanvas');
const engine = new A.Engine(canvas, true, { preserveDrawingBuffer: false, stencil: true, adaptToDeviceRatio: true });
const scene = new A.Scene(engine);
scene.clearColor = new A.Color4(0.035,0.047,0.067,1);
const ambient = new A.HemisphericLight('ambient', new A.Vector3(0,1,0),scene);
ambient.intensity = 1.05;
const survey = new A.ArcRotateCamera('survey', -Math.PI/2, Math.PI/2.55, 12,new A.Vector3(0,2,0),scene);
survey.lowerRadiusLimit = 0.5; survey.wheelPrecision = 35;
survey.attachControl(canvas,true);
const walk = new A.UniversalCamera('walk',new A.Vector3(0,1.65,0),scene);
walk.speed = 0.12; walk.angularSensibility = 3500; walk.inertia = 0.3;
walk.keysUp=[87,38];walk.keysDown=[83,40];walk.keysLeft=[65,37];walk.keysRight=[68,39];
walk.minZ = 0.05;
scene.activeCamera = survey;
const REFERENCE = 'https://zenodo.org/records/10341445/files/d6a3c0ce0cb943f2b8e09eb4d21e448f.glb?download=1';
const canonicalIDs = ['G079','G080','G184','G187','G188','G190','G191','G194','G211','G212','G213','G214','G215','G404'];
const fallbackNames = {G079:'Altar',G080:'Tabernacle',G184:'Credence table',G187:'Corporal',G188:'Purificator',G190:'Chalice',G191:'Paten',G194:'Thurible',G211:'Chalice veil',G212:'Burse',G213:'Altar cards',G214:'Roman Missal',G215:'Missal stand',G404:'High altar'};
const entries = new Map();
const markers = new Map();
let source = null, loaded = [], loadedNodes=[], isLoaded=false, mode='survey', pending=null, entrance=null, floorY=null, busy=false;
let draggingTouch = new Set();
function status(message){$('status').textContent=message;}
function enable(id, yes){$(id).disabled=!yes;}
function setMode(next){
  mode=next; survey.detachControl(canvas); walk.detachControl(canvas);
  scene.activeCamera = next === 'walk' ? walk : survey;
  if(next === 'walk'){ walk.attachControl(canvas,true); canvas.focus(); }
  else survey.attachControl(canvas,true);
  $('walk').classList.toggle('primary',next==='walk');$('survey').classList.toggle('primary',next!=='walk');
  $('reticle').classList.toggle('visible',next==='walk');
  $('controls').classList.toggle('visible',next==='walk' && matchMedia('(pointer:coarse)').matches);
  status(next==='walk' ? 'Walking · WASD / touch arrows · click a gold marker to inspect' : 'Survey · drag to orbit · click markers to inspect');
}
async function readGlossary(){
  const files=['concepts-001-150.v1.json','concepts-151-300.v1.json','concepts-301-450.v1.json'];
  try{
    const embedded=document.getElementById('ao-glossary-entries');
    if(embedded){
      for(const e of JSON.parse(embedded.textContent||'[]'))if(canonicalIDs.includes(e.id))entries.set(e.id,e);
    }else{
      const data=await Promise.all(files.map(f=>fetch('../../data/glossary/'+f).then(r=>{if(!r.ok)throw Error(r.status);return r.json();})));
      for(const file of data){for(const e of file.entries||[]){if(canonicalIDs.includes(e.id))entries.set(e.id,e);}}
    }
  }catch(e){status('Glossary entries unavailable. You can still test walking and place markers.');}
  for(const id of canonicalIDs){
    const e=entries.get(id); const option=document.createElement('option');
    option.value=id;option.textContent=(e?.labels?.en||fallbackNames[id])+' · '+id;
    $('kind').appendChild(option);
  }
}
function nameFor(id){return entries.get(id)?.labels?.en || fallbackNames[id] || id;}
function inspect(id){
  const e=entries.get(id);
  $('inspect').hidden=false;
  $('entryTitle').textContent=nameFor(id);
  $('entryLatin').textContent=e?.labels?.la ? e.labels.la : 'Canonical glossary entry '+id;
  $('entryDefinition').textContent=e?.short_definition?.en || 'Definition unavailable in this preview. Open the hosted prototype to load the canonical glossary.';
  $('entryExplanation').textContent=e?.explanation?.en || '';
  $('inspect').scrollIntoView({behavior:'smooth',block:'nearest'});
}
$('closeInspect').onclick=()=>{$('inspect').hidden=true;canvas.focus();};
function mark(id,point){
  markers.get(id)?.dispose();
  const mesh=A.MeshBuilder.CreateSphere('hotspot-'+id,{diameter:0.24,segments:12},scene);
  mesh.position=point.clone();
  const mat=new A.StandardMaterial('marker-'+id,scene);
  mat.diffuseColor=new A.Color3(.75,.56,.24);mat.emissiveColor=new A.Color3(.35,.22,.06);
  mat.alpha=.8; mesh.material=mat;
  mesh.isPickable=true;mesh.metadata={vmMarker:id};
  markers.set(id,mesh);return mesh;
}
function pointFromEvent(evt){
  return scene.pick(scene.pointerX,scene.pointerY,m=>!m.metadata?.vmMarker && m.getTotalVertices()>0 && loaded.includes(m));
}
scene.onPointerObservable.add(info=>{
  if(info.type!==A.PointerEventTypes.POINTERPICK || !isLoaded)return;
  const chosen=info.pickInfo?.pickedMesh;
  if(pending){
    const hit=pointFromEvent(info);
    if(!hit?.hit || !hit.pickedPoint){status('Click a visible surface on the loaded 3D church.');return;}
    if(pending==='entrance'){
      entrance=hit.pickedPoint.clone(); floorY=entrance.y;
      walk.position=entrance.add(new A.Vector3(0,1.65,0));
      walk.rotation=new A.Vector3(0, survey.alpha,0);
      enable('walk',true);status('Entrance set. Choose Walk.');
    }else{mark(pending,hit.pickedPoint);enable('save',true);status(nameFor(pending)+' hotspot placed.');}
    pending=null;enable('stopPlace',false);return;
  }
  if(chosen?.metadata?.vmMarker){inspect(chosen.metadata.vmMarker);return;}
  // Fallback for tiny hotspot spheres: select the closest marker on the pick ray.
  const ray=scene.createPickingRay(scene.pointerX,scene.pointerY,A.Matrix.Identity(),scene.activeCamera);
  let nearest=null,best=0.42;
  for(const [id,m] of markers){const v=m.position.subtract(ray.origin); const d=A.Vector3.Dot(v,ray.direction);
    if(d<0)continue;
    const dist=A.Vector3.Distance(ray.origin.add(ray.direction.scale(d)),m.position);
    if(dist<best){best=dist;nearest=id;}
  }
  if(nearest)inspect(nearest);
});
scene.onBeforeRenderObservable.add(()=>{
  if(mode==='walk' && floorY!==null){walk.position.y=floorY+1.65;}
});
function boundsOf(meshes){
  const valid=meshes.filter(m=>m.getTotalVertices()>0 && m.getBoundingInfo());
  if(!valid.length)throw Error('No renderable geometry in this GLB');
  let mn=new A.Vector3(Infinity,Infinity,Infinity), mx=new A.Vector3(-Infinity,-Infinity,-Infinity);
  for(const m of valid){m.computeWorldMatrix(true);const b=m.getBoundingInfo().boundingBox;
    mn=A.Vector3.Minimize(mn,b.minimumWorld);mx=A.Vector3.Maximize(mx,b.maximumWorld);
  }
  return {center:mn.add(mx).scale(.5),size:mx.subtract(mn),min:mn,max:mx};
}
async function loadModel(item,label){
  if(busy)return;
  busy=true;
  try{
    status('Importing 3D model. This may take a while…');
    if(isLoaded){ for(const m of markers.values())m.dispose();markers.clear();
      loadedNodes.forEach(n=>n.dispose());loaded.forEach(m=>m.dispose());loaded=[];loadedNodes=[];entrance=null;floorY=null;
    }
    // Explicit .glb extension is necessary when the source URL ends in a query or the source is a File.
    const result=await A.SceneLoader.ImportMeshAsync(null,'',item,scene,ev=>{
      if(ev.lengthComputable)status('Loading model · '+Math.round(100*ev.loaded/ev.total)+'%');
    },'.glb');
    loaded=result.meshes;loadedNodes=result.transformNodes||[];
    loaded.forEach(m=>{m.isPickable=m.getTotalVertices()>0;});
    const b=boundsOf(loaded);
    survey.target.copyFrom(b.center);
    survey.radius=Math.max(3,Math.min(200,b.size.length()*0.62));
    survey.lowerRadiusLimit=0.4;
    survey.upperRadiusLimit=Math.max(survey.radius*5,10);
    walk.position=b.center.add(new A.Vector3(0,1.65,0));
    scene.activeCamera=survey;
    isLoaded=true;source=label;
    $('empty').hidden=true;
    ['survey','start','place','save'].forEach(id=>enable(id,true));enable('walk',false);
    setMode('survey');
    status('Loaded '+label+' · '+loaded.filter(m=>m.getTotalVertices()>0).length+' meshes. Set entrance to walk.');
  }catch(e){isLoaded=loaded.length>0;status('Could not load GLB: '+(e?.message||e)+'. If remote, check CORS or use downloaded GLB.');}
  finally{busy=false;}
}
$('modelFile').onchange=async e=>{const file=e.target.files?.[0];if(file)await loadModel(file,file.name);};
$('loadUrl').onclick=()=>{const url=$('modelUrl').value.trim();if(!/^https:\/\//i.test(url))return status('Use a direct HTTPS .glb URL.');loadModel(url,url);};
$('reference').onclick=()=>{if(!confirm('This is a 136.8 MB research-only scan. Its sanctuary is NOT approved for publication. Load it now?'))return; $('modelUrl').value=REFERENCE;loadModel(REFERENCE,'Giravolt — Nativitat de Durro (CC BY, test only)');};
$('survey').onclick=()=>{pending=null;setMode('survey');};
$('walk').onclick=()=>{if(!entrance)return status('First set the entrance in Survey mode.');pending=null;setMode('walk');};
$('start').onclick=()=>{setMode('survey');pending='entrance';enable('stopPlace',true);status('Click the nave floor to define visitor eye level and starting position.');};
$('place').onclick=()=>{setMode('survey');pending=$('kind').value;enable('stopPlace',true);status('Click the real '+nameFor(pending)+' surface in the model.');};
$('stopPlace').onclick=()=>{pending=null;enable('stopPlace',false);status('Placement cancelled.');};
$('save').onclick=()=>{
  const payload={schema:'AO_VISIBLE_MASS_MARKERS_V1',model:source,entrance:entrance?.asArray()||null,markers:[...markers].map(([glossary_id,m])=>({glossary_id,position:m.position.asArray()})),licence_notice:'Model licensing is independent of marker data.'};
  const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});
  const link=document.createElement('a');link.href=URL.createObjectURL(blob);link.download='visible-mass-markers.json';link.click();
  setTimeout(()=>URL.revokeObjectURL(link.href),2000);
};
$('importManifest').onchange=async e=>{
  try{
    const file=e.target.files?.[0];if(!file)return;
    const data=JSON.parse(await file.text());
    if(data.schema!=='AO_VISIBLE_MASS_MARKERS_V1' || !Array.isArray(data.markers))throw Error('Unsupported marker manifest');
    if(!isLoaded)throw Error('Load the matching church GLB first');
    if(data.model!==source && !confirm('This marker file belongs to a different model. Apply anyway?'))return;
    markers.forEach(m=>m.dispose());markers.clear();
    for(const p of data.markers){
      if(!canonicalIDs.includes(p.glossary_id)||!Array.isArray(p.position)||p.position.length!==3||!p.position.every(Number.isFinite))continue;
      mark(p.glossary_id,A.Vector3.FromArray(p.position));
    }
    if(Array.isArray(data.entrance)&&data.entrance.length===3&&data.entrance.every(Number.isFinite)){
      entrance=A.Vector3.FromArray(data.entrance);floorY=entrance.y;walk.position=entrance.add(new A.Vector3(0,1.65,0));enable('walk',true);
    }
    enable('save',true);status('Loaded '+markers.size+' object markers.');
  }catch(err){status('Marker import failed: '+err.message);}
};
const touchKeys={w:38,s:40,a:37,d:39};
document.querySelectorAll('[data-move]').forEach(button=>{
  const code=touchKeys[button.dataset.move];
  button.addEventListener('pointerdown',ev=>{ev.preventDefault();button.setPointerCapture(ev.pointerId);draggingTouch.add(code);walk.cameraDirection.addInPlace(walk.getDirection(new A.Vector3(code===37?-0.35:code===39?0.35:0,0,code===38?0.5:code===40?-0.5:0)));});
  button.addEventListener('pointerup',()=>draggingTouch.delete(code));
  button.addEventListener('pointercancel',()=>draggingTouch.delete(code));
});
scene.onBeforeRenderObservable.add(()=>{
  if(mode!=='walk'||!draggingTouch.size)return;
  for(const code of draggingTouch){const d=new A.Vector3(code===37?-1:code===39?1:0,0,code===38?1:code===40?-1:0);walk.cameraDirection.addInPlace(walk.getDirection(d).scale(0.025));}
});
window.addEventListener('resize',()=>engine.resize());
window.addEventListener('keydown',e=>{if(mode==='walk'&&e.key==='Escape')document.exitPointerLock?.();});
engine.runRenderLoop(()=>scene.render());
await readGlossary();
