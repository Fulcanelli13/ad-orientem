import assert from "node:assert/strict";
import fs from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  AO_ASSET_BANK_CONTRACT,
  AO_CANONICAL_CORE_ASSETS,
  AO_CANONICAL_EXTENSION_ASSETS,
  AO_RUNTIME_ASSET_RECOVERIES,
  AO_REMOVED_ASSET_IDS,
  AO_SHARED_IDENTITY_MAPPINGS,
  getCanonicalAsset,
  resolveCanonicalAssetUrl,
} from "../src/assets/asset-registry.js";
import { R17_FROZEN_ACTIVE_ICON_ASSETS } from "../src/mass/reader-icon-bank.js";
import { auditHostIconBank } from "../src/mass/reader-icons.js";

const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,"..");
const v4=JSON.parse(fs.readFileSync(path.join(root,"assets/inventory/asset-manifest-v4.json"),"utf8"));
const hardened=JSON.parse(fs.readFileSync(path.join(root,"assets/inventory/asset-manifest-v4.1.1.json"),"utf8"));
const activeCsv=fs.readFileSync(path.join(root,"assets/inventory/active-assets-v4.csv"),"utf8");

assert.equal(v4.version,"4.0");
assert.equal(v4.state,"FROZEN");
assert.equal(v4.active_asset_count,109);
assert.equal(v4.files.length,109);

assert.equal(hardened.version,"4.1.1");
assert.equal(hardened.state,"HARDENED");
assert.equal(hardened.core_version,"4.0");
assert.equal(hardened.core_asset_count,109);
assert.equal(hardened.extension_asset_count,8);
assert.equal(hardened.active_asset_count,117);
assert.equal(hardened.core_files.length,109);
assert.equal(hardened.extensions.length,8);

const compact=(record)=>({
  semantic_id:record.semantic_id,
  semantic_label:record.semantic_label,
  asset_id:record.asset_id,
  kind:record.kind,
  file_path:record.file_path,
  sha256:record.sha256,
});
assert.deepEqual(
  hardened.core_files.map(compact),
  v4.files.map(compact),
  "V4.1.1 stopped preserving the V4 frozen core exactly",
);

assert.equal(AO_ASSET_BANK_CONTRACT.version,"4.1.1");
assert.equal(Object.keys(AO_CANONICAL_CORE_ASSETS).length,109);
assert.equal(Object.keys(AO_CANONICAL_EXTENSION_ASSETS).length,8);
assert.equal(
  new Set([
    ...Object.keys(AO_CANONICAL_CORE_ASSETS),
    ...Object.keys(AO_CANONICAL_EXTENSION_ASSETS),
  ]).size,
  117,
  "canonical asset ids are not unique",
);

for(const id of AO_REMOVED_ASSET_IDS){
  assert.equal(getCanonicalAsset(id),null,"removed asset id regained canonical ownership: "+id);
}
assert.equal(
  AO_SHARED_IDENTITY_MAPPINGS.find(x=>x.route==="pray.benediction")?.asset_id,
  "ao-rich-adoration",
);
assert.equal(
  AO_SHARED_IDENTITY_MAPPINGS.find(x=>x.route==="pray.forty_hours")?.asset_id,
  "ao-rich-adoration",
);

const frozenBlessing=AO_CANONICAL_CORE_ASSETS["ao-live-blessing"];
assert.equal(frozenBlessing.path,"assets/active/live-actions/ao-live-blessing.png","frozen V4 blessing identity/path drifted");
assert.equal(frozenBlessing.sha256,"620d70d4c40ba75deec8985f043683df6dae0e6bfe72490744eae7c83190417c","frozen V4 blessing checksum drifted");
const blessingRecovery=AO_RUNTIME_ASSET_RECOVERIES["ao-live-blessing"];
assert.equal(blessingRecovery?.sourceSha256,frozenBlessing.sha256,"runtime blessing recovery is not provenance-linked to frozen V4");
assert.equal(blessingRecovery?.path,"assets/recovered/ao-live-blessing.svg");
const blessingRuntimePath=fileURLToPath(resolveCanonicalAssetUrl("ao-live-blessing"));
assert.equal(path.relative(root,blessingRuntimePath).split(path.sep).join("/"),blessingRecovery.path,"blessing resolver bypassed the explicit runtime recovery");
assert.ok(fs.existsSync(blessingRuntimePath),"recovered blessing runtime asset is missing");
assert.equal(
  createHash("sha256").update(fs.readFileSync(blessingRuntimePath)).digest("hex"),
  blessingRecovery.recoverySha256,
  "recovered blessing silhouette drifted",
);

assert.ok(activeCsv.startsWith("index,semantic_id,semantic_label,"));
assert.ok(!activeCsv.startsWith("<PARSED TEXT"),"Library parser banner leaked into canonical CSV");

const basenameAssetId=(url)=>{
  const name=path.basename(new URL(url).pathname);
  return name.replace(/\.[^.]+$/,"");
};

const collectFiles=(dir)=>{
  const out=[];
  for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
    const full=path.join(dir,entry.name);
    if(entry.isDirectory())out.push(...collectFiles(full));
    else out.push(full);
  }
  return out;
};

const activeRoot=path.join(root,"assets/active");
const externalized=collectFiles(activeRoot).filter(file=>/\.(png|svg|jpg|jpeg|webp)$/i.test(file));
for(const file of externalized){
  const assetId=path.basename(file).replace(/\.[^.]+$/,"");
  const record=getCanonicalAsset(assetId);
  assert.ok(record,"non-canonical asset entered assets/active: "+path.relative(root,file));
  assert.equal(record.status,"FROZEN_ACTIVE");
  const sha256=createHash("sha256").update(fs.readFileSync(file)).digest("hex");
  assert.equal(sha256,record.sha256,"externalized asset drifted from frozen V4 bytes: "+assetId);
}

assert.equal(auditHostIconBank(R17_FROZEN_ACTIVE_ICON_ASSETS).complete,true);
for(const [readerKey,url] of Object.entries(R17_FROZEN_ACTIVE_ICON_ASSETS)){
  const assetId=basenameAssetId(url);
  const record=getCanonicalAsset(assetId);
  assert.ok(record,"R17 "+readerKey+" does not resolve to a canonical V4 asset id: "+assetId);
  assert.equal(record.status,"FROZEN_ACTIVE");
  assert.ok(resolveCanonicalAssetUrl(assetId),"canonical URL missing for "+assetId);
  const actualPath=path.relative(root,fileURLToPath(url)).split(path.sep).join("/");
  assert.equal(actualPath,record.path,"R17 "+readerKey+" is not using the manifest canonical path for "+assetId);
  const bytes=fs.readFileSync(fileURLToPath(url));
  const sha256=createHash("sha256").update(bytes).digest("hex");
  assert.equal(sha256,record.sha256,"R17 compatibility asset drifted from frozen V4 bytes: "+assetId);
}

console.log("asset bank contract: PASS — V4 core 109 + 8 hardened extensions; "+externalized.length+" externalized assets and all 20 R17 assets use byte-exact manifest canonical paths.");
