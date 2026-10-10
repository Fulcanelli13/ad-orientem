import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {LEARN_MODULE_IDS} from "../src/learn/presentation.js";
import {HOLY_NAME_LITANY_V381} from "../src/pray/traditional-pray-data.js";

const read=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");
const json=path=>JSON.parse(read(path));
const map=json("data/app/pray-formation-organisational-map.v1.json");
const navigation=json("data/app/content-navigation-registry.v1.json");
const guides=json("data/app/guide-coverage-two-function-audit.v1.json");
const prayerLeaf=json("data/app/content-items-pray.v1.json");
const formationLeaf=json("data/app/content-items-formation.v1.json");
const ethicsLeaf=json("data/app/content-items-sexual-ethics.v1.json");
const apostolateLeaf=json("data/app/content-items-apostolate.v1.json");
const prayerSource=read("src/pray/presentation-runtime.js");
const familySource=prayerSource.slice(prayerSource.indexOf("function prayFamilies()"),prayerSource.indexOf("function prayFamilyDoor("));

assert.equal(map.schema,"AO_PRAY_FORMATION_ORGANISATIONAL_MAP_V1");
assert.equal(map.status,"PARTIAL_ENTRY_PRESENTATION_IMPLEMENTED");
assert.equal(map.acceptance.entry_presentation_implemented,true);
assert.equal(map.acceptance.user_visible_content_crosslinks_implemented,true);
assert.equal(map.connections.editorially_proposed_item_links.filter(x=>x.state==="SOURCE_WIRED_PHONE_UNVERIFIED").length,18);
assert.equal(map.connections.editorially_proposed_item_links.filter(x=>x.state==="PROPOSED_NOT_WIRED").length,2);
const unique=(entries,label)=>{
  const ids=entries.map(x=>x.id);
  assert.equal(new Set(ids).size,ids.length,label+" duplicates a content ID");
  return ids;
};
const sort=x=>[...x].sort();
const prayerEntries=map.pray.entries;
assert.equal(prayerEntries.length,23);
const srcPray=[...familySource.matchAll(/\['(?:own|external)','([^']+)'/g)].map(x=>x[1]);
assert.equal(srcPray.length,22,"Prayer runtime source family count changed");
const srcLazy=[...familySource.matchAll(/\['external','([^']+)'/g)].map(x=>x[1]);
assert.equal(srcLazy.length,10,"Prayer lazy routes changed");
assert.ok(familySource.includes("direct:'pray.library'"));
assert.deepEqual(sort(unique(prayerEntries,"Prayer")),sort([...srcPray,"pray.library"]));
assert.deepEqual(sort(map.pray.landing.families.map(x=>x.id)),sort(["daily_marian","before_the_blessed_sacrament","penance_and_passion","devotions_and_novenas","prayer_library"]));
for(const item of prayerEntries){
  assert.ok(map.pray.landing.families.some(x=>x.id===item.proposed_group),item.id+" is ungrouped");
  const declaration=navigation.routes.find(x=>x.id===item.id);
  assert.equal(item.canonical_owner,declaration?.canonical_owner,item.id+" ownership mismatch");
  if(srcLazy.includes(item.id))assert.equal(item.current_handoff,"lazy_external",item.id+" lost lazy entry");
}
assert.equal(prayerEntries.filter(x=>x.proposed_group==="daily_marian").length,5);
assert.equal(prayerEntries.filter(x=>x.proposed_group==="before_the_blessed_sacrament").length,4);
assert.equal(prayerEntries.filter(x=>x.proposed_group==="penance_and_passion").length,5);
assert.equal(prayerEntries.filter(x=>x.proposed_group==="devotions_and_novenas").length,8);
assert.equal(prayerEntries.filter(x=>x.proposed_group==="prayer_library").length,1);

const formationEntries=map.formation.entries;
assert.equal(formationEntries.length,15);
assert.deepEqual(sort(unique(formationEntries,"Formation")),sort(LEARN_MODULE_IDS));
for(const item of formationEntries){
  assert.ok(map.formation.groups.some(x=>x.id===item.primary_group),item.id+" is ungrouped");
  assert.equal(item.canonical_owner,navigation.routes.find(x=>x.id===item.id)?.canonical_owner,item.id+" owner mismatch");
}
const gated=["learn.apologetics","learn.church_crisis"];
const retired=["learn.catholic_life","learn.seasonal_rites"];
assert.deepEqual(sort(map.formation.unpublished_routes),sort(gated));
assert.deepEqual(sort(map.formation.retired_compatibility),sort(retired));
for(const id of [...gated,...retired])assert.ok(!formationEntries.some(x=>x.id===id),id+" published accidentally");

const apostolate=map.apostolate.entries;
assert.equal(apostolate.length,36);
const sourceScenarios=apostolateLeaf.items.filter(x=>x.kind==="apostolate-scenario");
assert.deepEqual(sort(unique(apostolate,"Apostolate")),sort(sourceScenarios.map(x=>x.id)));
assert.equal(apostolate.filter(x=>x.proposed_group==="answer_questions").length,8);
assert.equal(apostolate.filter(x=>x.proposed_group==="help_others").length,15);
assert.equal(apostolate.filter(x=>x.proposed_group==="introduce_the_faith").length,13);
const apostolatePresentation=read("src/apostolate/presentation.js");
const apostolateBrowser=read("src/apostolate/browser-entry.js");
assert.match(apostolatePresentation,/\["introduce","ao-refined-study"/,"Apostolate does not expose the Introductory Path");
assert.match(apostolatePresentation,/mode==="introduce"/,"Apostolate cannot filter introduced scenarios");
assert.match(apostolateBrowser,/\["answer","help","introduce","practice"\]/,"Apostolate owner rejects Introduce route");
for(const item of apostolate)assert.equal(item.canonical_owner,"apostolate");

assert.equal(map.pray.leaf_projections.length,100);
assert.deepEqual(sort(unique(map.pray.leaf_projections,"Prayer leaf")),sort(prayerLeaf.items.map(x=>x.id)));
for(const x of map.pray.leaf_projections){
  assert.ok(prayerEntries.some(item=>item.id===x.launch_route),x.id+" points to missing Prayer entry");
  assert.equal(x.canonical_owner,"pray");
}
const sourceKinds=(items,kindField="kind")=>Object.fromEntries([...new Set(items.map(x=>x[kindField]))].map(kind=>[kind,items.filter(x=>x[kindField]===kind).length]));
assert.deepEqual(map.content_census.pray.by_kind,sourceKinds(prayerLeaf.items,"type"));
assert.deepEqual(map.content_census.formation.by_kind,sourceKinds(formationLeaf.items));
assert.deepEqual(map.content_census.sexual_ethics.by_kind,sourceKinds(ethicsLeaf.items));

assert.equal(map.connections.registry_declared_handoffs.length,15);
assert.deepEqual(map.connections.registry_declared_handoffs.map(x=>[x.from,x.to,x.action]),navigation.cross_module_handoffs.map(x=>[x.from,x.to,x.action]));
const reachable=new Set([...prayerEntries,...formationEntries,...apostolate].map(x=>x.id));
assert.equal(map.connections.editorially_proposed_item_links.length,20);
for(const link of map.connections.editorially_proposed_item_links){
  assert.ok(reachable.has(link.from),link.from+" unknown origin");
  assert.ok(reachable.has(link.to),link.to+" unknown target");
  assert.ok(["PROPOSED_NOT_WIRED","SOURCE_WIRED_PHONE_UNVERIFIED"].includes(link.state),"Invalid contextual link status");
  if(link.state==="SOURCE_WIRED_PHONE_UNVERIFIED")assert.ok(link.evidence&&link.evidence.length>10,"Wired relation lacks an original handler/source witness");
  else assert.equal(link.evidence,null,"Proposed relation must not pretend to have a verified handler");
  assert.equal(link.return_to_origin_required,true);
}
const guideById=new Map(guides.routes.map(x=>[x.id,x]));
for(const item of [...prayerEntries,...formationEntries]){
  const g=guideById.get(item.id);
  assert.equal(item.guide_source_evidence.information,g?.information_status,item.id+" guide info status drift");
  assert.equal(item.guide_source_evidence.walkthrough,g?.walkthrough_status,item.id+" guide walkthrough drift");
}
// All live Apostolate handoffs must stay on existing owners. A declared route
// is not automatically a tested phone journey or exact Mass subroute.
const apostolateSources=[
  "src/apostolate/corpus.js","src/apostolate/hs-corpus.js",
  "src/apostolate/fh-corpus.js","src/apostolate/tf-corpus.js",
  "src/apostolate/dv-corpus.js","src/apostolate/wc-corpus.js",
];
const actualHandoffs=[];
for(const file of apostolateSources){
  const source=read(file);
  const cuts=[...source.matchAll(/id:"((?:AQ|HS|FH|TF|DV|WC)\d{2})",publication:/g)].map(match=>({id:match[1],index:match.index}));
  for(let i=0;i<cuts.length;i++){
    const section=source.slice(cuts[i].index,cuts[i+1]?.index??source.length);
    for(const match of section.matchAll(/(owned|formation)\("([^"]+)","([^"]+)","([^"]+)"\)/g)){
      actualHandoffs.push({from:"apostolate:"+cuts[i].id,to:match[3],source:file,reason:match[4]});
    }
  }
}
const handoffs=map.connections.apostolate_source_handoffs;
assert.equal(handoffs.length,72,"Apostolate 72 existing handoffs incomplete");
assert.deepEqual(
  sort(handoffs.map(x=>[x.from,x.to,x.source,x.reason].join("|"))),
  sort(actualHandoffs.map(x=>[x.from,x.to,x.source,x.reason].join("|"))),
  "Apostolate graph no longer matches actual scenario source declarations"
);
const navigationRouteSet=new Set(navigation.routes.map(x=>x.id));
const knownScenarios=new Set(apostolate.map(x=>x.scenario_id));
for(const x of handoffs){
  if(x.resolution==="MASS_PREPARE_SURFACE_ONLY"){
    assert.equal(x.to,"mass.prepare");
    assert.equal(x.phone_verified,false);
  }else if(x.resolution==="SCENARIO_INTERNAL"){
    assert.ok(knownScenarios.has(x.to),"Invalid Apostolate-to-Apostolate target "+x.to);
  }else{
    assert.equal(x.resolution,"REGISTERED_TARGET");
    assert.ok(navigationRouteSet.has(x.to),"Unregistered Apostolate target "+x.to);
  }
}
assert.equal(handoffs.filter(x=>x.resolution==="REGISTERED_TARGET").length,65);
assert.equal(handoffs.filter(x=>x.resolution==="SCENARIO_INTERNAL").length,2);
assert.equal(handoffs.filter(x=>x.resolution==="MASS_PREPARE_SURFACE_ONLY").length,5);
assert.equal(handoffs.filter(x=>x.resolution==="UNRESOLVED_TARGET").length,0);
for(const obsolete of ["pray.marian","pray.holy_souls"]){
  assert.ok(!handoffs.some(x=>x.to===obsolete),"Obsolete Prayer route exposed from Apostolate: "+obsolete);
}
const prayerStyles=read("src/pray/presentation-styles.js");
assert.match(prayerSource,/aoP435930RootOrganised/);
assert.match(prayerStyles,/ao-pray-organised-family-entry-style/);
const formationPresentation=read("src/learn/presentation.js");
const formationBrowser=read("src/learn/browser-entry.js");
assert.match(formationPresentation,/aoLearnIntentLayout/);
assert.match(formationPresentation,/data-ao-learn-questions/);
assert.match(formationBrowser,/data-ao-learn-questions/);
assert.match(formationBrowser,/openModule\("learn\.sexual_ethics"\)/);
assert.equal(map.pray.library_categories.reduce((n,x)=>n+x.count,0),48);
assert.equal(map.guides.source_level_followup_count,25);
assert.equal(map.guides.source_level_followups.length,25);
assert.equal(map.guides.fully_verified_in_phone,false);
const followups=map.connections.editorially_proposed_item_links;
for(const [from,to] of [["learn.rites.matrimony","learn.sexual_ethics"],["learn.latin","learn.glossary"]]){
  const link=followups.find(x=>x.from===from&&x.to===to);
  assert.equal(link?.state,"SOURCE_WIRED_PHONE_UNVERIFIED","new source-owned contextual handoff missing: "+from);
}
for(const [from,id] of [["pray.confession","G034"],["pray.adoration","G301"]]){
  const link=followups.find(x=>x.from===from&&x.to==="learn.catechism");
  assert.equal(link?.state,"PROPOSED_NOT_WIRED","direct Catechism route must not be falsely certified");
  assert.equal(link.interim_reference?.entry_id,id);
  assert.equal(link.interim_reference?.exact_catechism_deep_link,false);
}
const traditionalMarriage=read("src/learn/traditional-life.js");
const ethicsOverlay=read("src/learn/sexual-ethics.js");
const latinCourse=read("src/learn/latin-course-v2.js");
assert.match(traditionalMarriage,/data-ao-tradlearn-ethics-context/);
assert.match(traditionalMarriage,/sectionId:"marriage",origin:"context",trigger/);
assert.match(ethicsOverlay,/contextReturn/);
assert.match(ethicsOverlay,/context\.trigger\.focus/);
assert.match(latinCourse,/data-l2-open-glossary/);
assert.match(latinCourse,/origin:"context",categoryId:"latin_rubrics",trigger/);
assert.match(prayerSource,/glossaryContextCapsule\(\x27G034\x27/);
assert.match(prayerSource,/glossaryContextCapsule\("G301"/);
assert.equal(map.connections.content_level_relation_audit.doctrine_references_in_place,2);

const contextualRoutes=new Map(map.connections.editorially_proposed_item_links.map(x=>[x.from+" → "+x.to,x]));
for(const key of ["learn.spiritual_life → pray.nightly_examen","learn.spiritual_life → pray.adoration","learn.rites.sick → pray.good_death","pray.communion_treasury → learn.rites.first_communion","pray.good_death → learn.rites.sick","learn.sexual_ethics → pray.confession","programme.first_friday → pray.sacred_heart"]){
  assert.equal(contextualRoutes.get(key)?.state,"SOURCE_WIRED_PHONE_UNVERIFIED",key+" is not source wired");
}
const spiritualSource=read("src/learn/spiritual-life.js");
assert.match(spiritualSource,/SL03:Object\.freeze\(\[\{surface:"pray",target:"pray\.adoration"/);
assert.match(spiritualSource,/SL06:Object\.freeze\(\[\{surface:"pray",target:"pray\.nightly_examen"/);
assert.match(spiritualSource,/lessonHandoffs\(lesson\)/);
const traditionalFormation=read("src/learn/traditional-life.js");
assert.match(traditionalFormation,/route:"pray\.good_death"/);
assert.match(traditionalFormation,/route:"pray\.eternal_rest"/);
assert.doesNotMatch(traditionalFormation,/route:"pray\.holy_souls"/);
const traditionalPrayer=read("src/pray/traditional-pray-runtime.js");
assert.match(traditionalPrayer,/data-tp381-route="learn\.rites\.first_communion"/);
assert.match(traditionalPrayer,/data-tp381-route="learn\.rites\.sick"/);
assert.match(traditionalPrayer,/data-tp381-litany-mode="guided"/);
assert.match(traditionalPrayer,/data-tp381-litany-step/);
assert.match(traditionalPrayer,/if\(b\.dataset\.tp381LitanyMode\)/);
const sections=value=>String(value).trim().split(/\n\s*\n/).map(x=>x.trim()).filter(Boolean);
const latin=sections(HOLY_NAME_LITANY_V381.la),english=sections(HOLY_NAME_LITANY_V381.en),french=sections(HOLY_NAME_LITANY_V381.fr);
assert.deepEqual([latin.length,english.length,french.length],[7,7,7],"Holy Name original text sections are not aligned");
assert.deepEqual(latin.map(x=>x.split("\n").length),[5,4,38,23,3,2,3],"Litany source structural verses changed");
for(const code of ["la","en","fr"])assert.equal(sections(HOLY_NAME_LITANY_V381[code]).join("\n\n"),HOLY_NAME_LITANY_V381[code].trim(),"Litany full source changed: "+code);
assert.equal(map.guides.newly_implemented[0].id,"pray.holy_name_litany");
assert.equal(map.guides.newly_implemented[0].phone_verified,false);
assert.equal(map.formation.sexual_ethics_topic_projection.topics.length,50);
assert.equal(map.formation.sexual_ethics_topic_projection.question_ids.length,150);
assert.equal(map.formation.sexual_ethics_topic_projection.extended_debate_question_ids.length,55);
assert.equal(map.acceptance.runtime_implemented,false);
assert.equal(map.acceptance.phone_verified,false);
console.log("PASS Pray-Formation IA: 23 Prayer doors, 15 Formation entries, 36 Apostolate scenarios, 100 Prayer leaves, 15 declared handoffs, 18 source-wired/2 Catechism direct links deferred (doctrine inline), Holy Name seven stages aligned; publication gates intact");
