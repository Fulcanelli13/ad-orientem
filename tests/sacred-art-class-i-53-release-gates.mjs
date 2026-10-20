import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
import {createHash} from "node:crypto";
import {selectCertifiedSacredArt} from "../src/calendar/sacred-art-release-selector.js";
import {PRADO_SOURCE_HELD_ARTWORK_IDS} from "../src/calendar/sacred-art-prado-source-holds.js";
const root=new URL("../",import.meta.url);
const load=p=>JSON.parse(readFileSync(new URL(p,root),"utf8"));
const intake=load("data/research/sacred-art-class-i-53-release-intake-20261017.v1.json");
const freeze=load("data/research/sacred-art-user-frozen-decisions-20261017.v1.json");
const media=load("data/calendar/sacred-art-certified-media.v1.json");
// The previously linked 'taken down from the cross' is Station XIII, not XII.
const goodFriday=intake.dates.find(x=>x.date==="2026-04-03");
const stationXII=goodFriday.unreleasedArtResearchLeads.find(x=>x.artworkId===
  "ART-iandomenico-iepolo-an-olo-ia-rucis-tation-12-eath-on-the-ross");
assert.equal(stationXII?.sourceUrl,
  "https://chorusvenezia.org/en/visita/via-crucis-jesus-dies-on-the-cross/");
assert.equal(stationXII?.productionReady,false,
  "Correct collection object does not imply photograph rights or crop certification");
const fullLeads=load("data/research/sacred-art-class-i-53-unrejected-research-leads-20261017.v1.json");
assert(!JSON.stringify(fullLeads).includes("via-crucis-jesus-is-taken-down-from-the-cross/"),
  "Station XIII source must not contaminate Station XII research");
const pradoEntries=intake.dates.flatMap(d=>d.unreleasedArtResearchLeads.filter(w=>w.sourcePolicy?.status==="HOLD_PRADO_SOURCE_POLICY"));
assert.equal(pradoEntries.length,4,"Four Class I Prado-source leads stay in the editorial ledger but cannot be acquired");
assert(pradoEntries.every(w=>w.sourcePolicy.noFetch===true && w.sourcePolicy.noPromotion===true));
assert.equal(fullLeads.dates.flatMap(d=>d.proposedWorks).filter(w=>w.sourcePolicy?.status==="HOLD_PRADO_SOURCE_POLICY").length,4);
assert.equal(PRADO_SOURCE_HELD_ARTWORK_IDS.length,31);
assert(PRADO_SOURCE_HELD_ARTWORK_IDS.includes('ART-os-de-ibera-acob-s-ream'),"Previously unsourced Ribera Jacob's Dream is held independently of any file or mirror source");
assert.equal(intake.dates.length,53);
assert.equal(new Set(intake.dates.map(x=>x.date)).size,53);
assert.equal(intake.counts.classIDates,53);
assert.equal(intake.counts.certifiedMedia,0);
assert.equal(intake.counts.unreleasedResearchProposals,76);
assert.equal(intake.dates.reduce((n,d)=>n+d.unreleasedArtResearchLeads.length,0),76);
assert(intake.dates.every(d=>d.unreleasedArtResearchLeads.every(x=>x.productionReady===false)));
assert(intake.dates.every(d=>d.unreleasedArtResearchLeads.every(x=>!freeze.rejected.some(r=>r.artworkId===x.artworkId))));
assert.equal(intake.dates.filter(x=>x.excludedLegacyArt).length,3);
assert(intake.dates.every(x=>x.productionReleaseStatus==="HOLD_NO_CERTIFIED_MEDIA"));
assert(intake.dates.every(x=>x.researchApprovedWorkLeads.every(y=>y.published===false)));
const accepts=new Set(freeze.approved.map(x=>x.artworkId));
const rejects=new Set(freeze.rejected.map(x=>x.artworkId));
assert.equal(accepts.size,107);
assert.equal(rejects.size,68);
assert(intake.dates.every(x=>x.researchApprovedWorkLeads.every(y=>accepts.has(y.artworkId)&&!rejects.has(y.artworkId))));
assert.deepEqual(media.media,[]);
const proper={status:"ready",source:"CANONICAL_1962_PROPER",gospelVerified:true,date:"2026-01-06",principalId:"sancti:01-06:1:w",gospelRef:"Matthew 2:1–12"};
const image={exactOriginalVerified:true,nonPradoSourceVerified:true,publicReuseRightsVerified:true,photoFileRightsVerified:true,cropVerified:true,phoneVisualQaVerified:true,localFilePresent:true,path:"assets/approved/sacred-art/test.webp",sha256:"a".repeat(64),attribution:"Museum; licensed original",sourceUrl:"https://example.org/image",rightsEvidenceUrl:"https://example.org/rights",rightsBasis:"PUBLIC_DOMAIN"};
const g={artworkId:"approved-A",status:"PRODUCTION_CERTIFIED",media:image,placements:[{status:"CERTIFIED_EXACT_PLACEMENT",date:proper.date,principalId:proper.principalId,role:"GOSPEL_SCENE",match:"GOSPEL_EXACT",gospelRef:proper.gospelRef,priority:1}]};
const feat={artworkId:"approved-B",status:"PRODUCTION_CERTIFIED",media:image,placements:[{status:"CERTIFIED_EXACT_PLACEMENT",date:proper.date,principalId:proper.principalId,role:"FEAST_ICONOGRAPHY",match:"EXACT_FEAST_SUBJECT",feastPrincipalId:proper.principalId,priority:1}]};
assert.equal(selectCertifiedSacredArt({resolvedProper:proper,releaseRecords:media.media,approved:freeze.approved,rejected:freeze.rejected}),null);
assert.equal(selectCertifiedSacredArt({resolvedProper:proper,releaseRecords:[feat,g],approved:["approved-A","approved-B"]})?.artworkId,"approved-A");
assert.equal(selectCertifiedSacredArt({resolvedProper:proper,releaseRecords:[g],approved:["approved-A"],rejected:["approved-A"]}),null);
assert.equal(selectCertifiedSacredArt({resolvedProper:proper,releaseRecords:[{...g,media:{...image,nonPradoSourceVerified:false}}],approved:["approved-A"]}),null);
assert.equal(selectCertifiedSacredArt({resolvedProper:proper,releaseRecords:[{...g,media:{...image,sourceUrl:"https://commons.wikimedia.org/wiki/File:Museo_del_Prado.jpg"}}],approved:["approved-A"]}),null);
assert.equal(selectCertifiedSacredArt({resolvedProper:proper,releaseRecords:[{...g,artworkId:"ART-eter-aul-ubens-doration-of-the-agi"}],approved:["ART-eter-aul-ubens-doration-of-the-agi"]}),null);
assert.equal(selectCertifiedSacredArt({resolvedProper:proper,releaseRecords:[g],approved:[]}),null);
assert.equal(selectCertifiedSacredArt({resolvedProper:{...proper,status:"failed"},releaseRecords:[g],approved:["approved-A"]}),null);
assert.equal(selectCertifiedSacredArt({resolvedProper:{...proper,gospelRef:"Luke 2:1–14"},releaseRecords:[g],approved:["approved-A"]}),null);
assert.equal(selectCertifiedSacredArt({resolvedProper:{...proper,principalId:"other"},releaseRecords:[g],approved:["approved-A"]}),null);
assert.equal(selectCertifiedSacredArt({resolvedProper:proper,releaseRecords:[{...g,media:{...image,cropVerified:false}}],approved:["approved-A"]}),null);
assert.equal(selectCertifiedSacredArt({resolvedProper:proper,releaseRecords:[{...g,media:{...image,path:"https://example.org/image.jpg"}}],approved:["approved-A"]}),null);
assert.equal(selectCertifiedSacredArt({resolvedProper:proper,releaseRecords:[{...g,placements:[{...g.placements[0],match:"CONTEXTUAL"}]}],approved:["approved-A"]}),null);
for(const art of media.media){
 const file=new URL(art.media.path,root);
 assert(existsSync(file),"Certified sacred art original asset missing: "+art.media.path);
 assert.equal(createHash("sha256").update(readFileSync(file)).digest("hex"),art.media.sha256,"certified image hash mismatch");
}
console.log("53-date Sacred Art intake and fail-closed certified release selection: PASS");
