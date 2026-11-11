import assert from "node:assert/strict";
import {sanctuaryCueProjection,SANCTUARY_PROTOCOL,
 createReaderSanctuaryPreview} from "../src/mass/reader-sanctuary-visual.js";
const card={sectionId:"AO.LIVECURATED.AO.CARD.003.2",
 sourceSectionId:"AO.CARD.003",title:"Gloria · Praise and Supplication"};
const state={nativeCueId:"AO.SM.C0055",schola:{trackId:"GLORIA"}};
const p=sanctuaryCueProjection({card,state,form:"SOLEMN",mode:"LIVE"});
assert.equal(p.type,SANCTUARY_PROTOCOL);
assert.equal(p.cardTitle,card.title);
assert.equal(p.sourceCueId,"AO.SM.C0055");
assert.equal(p.sourceSectionId,"AO.CARD.003");
assert.equal(p.scholaOnly,false);
assert.equal(p.certifiedSourceFocus,true);
assert.equal(sanctuaryCueProjection({card,state,form:"SOLEMN",mode:"MISSAL"}),null);
assert.equal(sanctuaryCueProjection({card,state,form:"UNVERIFIED",mode:"LIVE"}),null);
assert.equal(sanctuaryCueProjection({card:{...card,stateOnly:true},state,
 form:"LOW",mode:"LIVE"}),null);
assert.equal(sanctuaryCueProjection({card,state:{nativeCueId:"SCHOLA:OFFERTORY"},
 form:"MISSA_CANTATA_SIMPLE",mode:"LIVE"}).sourceCueId,null);
assert.equal(createReaderSanctuaryPreview({enabled:false}).active,false);
console.log("PASS: LIVE sanctuary receives exact native card and cue only, no Schola or Missal source");
