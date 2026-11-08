#!/usr/bin/env node
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
 sacredArtGalleryTargets,isReleasedSacredArtTarget,openReleasedSacredArtTarget
} from "../src/home/sacred-art-gallery-targets.js";

const read=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");
const angelus=sacredArtGalleryTargets("released-photo:angelus");
assert.ok(angelus.some(x=>x.kind==="scripture"&&x.id==="Luke 1:26-38"));
assert.ok(angelus.some(x=>x.kind==="rosary"&&x.id==="joy1"));
assert.ok(angelus.some(x=>x.kind==="bibleAtlas"&&x.id==="nazareth-e1"));
assert.equal(sacredArtGalleryTargets("artwork-pending:01").length,0);
assert.equal(sacredArtGalleryTargets("nonexistent").length,0);
assert.equal(isReleasedSacredArtTarget("released-photo:angelus","rosary","joy1"),true);
assert.equal(isReleasedSacredArtTarget("released-photo:angelus","rosary","joy2"),false);
assert.equal(isReleasedSacredArtTarget("released-photo:angelus","mass","MC-CNS-040"),false);
assert.equal(isReleasedSacredArtTarget("artwork-pending:04","rosary","sor1"),false);

let active="home",steps=[],context=null;
const win={
 AO_APP_SHELL_V1:{
   getActive:()=>active,
   navigate:async surface=>{
     steps.push(["surface",surface]);active=surface;return {ok:true};
   }
 },
 AO_SCRIPTURE_APP_V1:{openContext:reference=>{steps.push(["scripture",reference]);return true;}},
 AO_MODULES:{open:async(id,opts)=>{steps.push(["module",id]);context=opts;return {ok:true};}},
 AO_FIND_APP_V1:{openAtlasEvent:async id=>{steps.push(["atlas",id]);return true;}},
 console:{error:()=>{}}
};
assert.equal(await openReleasedSacredArtTarget(win,{
 workId:"released-photo:angelus",kind:"scripture",id:"Luke 1:26-38"
}),true);
assert.deepEqual(steps,[["scripture","Luke 1:26-38"]]);
steps.length=0;
assert.equal(await openReleasedSacredArtTarget(win,{
 workId:"released-photo:angelus",kind:"rosary",id:"joy1"
}),true);
assert.deepEqual(steps,[["surface","pray"],["module","pray.rosary"]]);
assert.deepEqual(context.sourceObject,{type:"rosary",mysteryId:"joy1"});
assert.equal(context.returnContext,null);
steps.length=0;active="home";
assert.equal(await openReleasedSacredArtTarget(win,{
 workId:"released-photo:angelus",kind:"bibleAtlas",id:"nazareth-e1"
}),true);
assert.deepEqual(steps,[["surface","find"],["atlas","biblical:event:nazareth-e1"]]);
steps.length=0;active="home";
assert.equal(await openReleasedSacredArtTarget(win,{
 workId:"artwork-pending:04",kind:"rosary",id:"sor1"
}),false);
assert.equal(steps.length,0,"pending photograph cannot trigger navigation");
active="pray";
assert.equal(await openReleasedSacredArtTarget(win,{
 workId:"released-photo:angelus",kind:"rosary",id:"joy1"
}),false);
assert.equal(steps.length,0,"non-Home reader must not be commandeered");
active="home";
win.AO_MODULES.open=async()=>({ok:false});
assert.equal(await openReleasedSacredArtTarget(win,{
 workId:"released-photo:angelus",kind:"rosary",id:"joy1"
}),false);
assert.deepEqual(steps,[["surface","pray"],["surface","home"]],"failed route restores Home");
active="home";steps.length=0;
win.AO_FIND_APP_V1.openAtlasEvent=async()=>false;
assert.equal(await openReleasedSacredArtTarget(win,{
 workId:"released-photo:angelus",kind:"bibleAtlas",id:"nazareth-e1"
}),false);
assert.deepEqual(steps,[["surface","find"],["surface","home"]]);

const gallery=read("src/home/c3-gallery.js");
const entry=read("src/home/browser-entry.js");
const html=read("src/home/today-h4-view.js");
const styles=read("src/home/c3-styles.js");
assert.match(gallery,/sacredArtGalleryTargets\(taxonomy\.id\)/);
assert.match(gallery,/data\.c3ArtTargetKind=target\.kind/);
assert.match(gallery,/dlg\.__c3CurrentWorkId=taxonomy\?\.id/);
assert.match(entry,/openReleasedSacredArtTarget\(win,/);
assert.match(entry,/dialog\.contains\(artworkTarget\)/);
assert.match(html,/data-c3-art-target-error/);
assert.match(styles,/min-height:44px/);
console.log("Sacred Art Gallery: released-only exact Scripture/Rosary/Atlas targets + fail-closed navigation, recovery and UI contract passed");
