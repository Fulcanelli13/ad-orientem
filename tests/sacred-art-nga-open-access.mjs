import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {NGA_PROVIDER,ngoObjectId,parseCsv,selectNGAOpenImages} from "../tools/calendar/acquire-sacred-art-nga.mjs";
const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const intake=read("data/research/sacred-art-bulk-source-intake-451-20261020.v1.json");
const freeze=read("data/research/sacred-art-user-frozen-decisions-20261017.v1.json");
const approved=new Set(freeze.approved.map(x=>x.artworkId));
const prior=new Set(freeze.historicallyFiveIDsPreservedSeparately);
const rejected=new Set(freeze.rejected.map(x=>x.artworkId));
const works=intake.works.filter(x=>x.provider===NGA_PROVIDER);
assert.equal(works.length,6);
assert.equal(intake.counts.eligibleExactNga,6);
assert.equal(intake.counts.eligibleOtherSource,54);
const exactIDs=works.map(x=>ngoObjectId(x.sourceUrl));
assert.deepEqual(new Set(exactIDs),new Set([106362,63264,46164,50298,46185,12209]));
assert.equal(new Set(exactIDs).size,6);
assert(works.every(x=>!x.sourcePolicy?.noFetch&&!rejected.has(x.id)));
assert(works.every(x=>x.reviewGate==="APPROVED"?approved.has(x.id):x.reviewGate==="LEGACY_FIVE_PRESERVED"&&prior.has(x.id)));
assert(works.every(x=>!/(?:museodelprado|prado)/i.test(x.sourceUrl+x.id)));
assert.throws(()=>ngoObjectId("https://www.museodelprado.es/artworks/50298-test"));
assert.throws(()=>ngoObjectId("https://www.nga.gov/other-art/50298"));
let a=[];
assert.equal(parseCsv('one,two\r\n"a,b","escaped ""quote"""\r\n"x\ny",tail\r\n',r=>a.push(r)),3);
assert.deepEqual(a[1],["a,b",'escaped "quote"']);
assert.deepEqual(a[2],["x\ny","tail"]);
const H="uuid,iiifURL,iiifThumbURL,viewtype,sequence,width,height,maxpixels,openaccess,created,modified,depictstmsobjectid,assistivetext\r\n";
const uuid="aabbccdd-aaaa-bbbb-cccc-001122334455";
const image=(access,url,view,id="46164")=>[uuid,url,"",view,"1","3000","2000","",""+access,"","",""+id,""].join(",")+"\r\n";
const raw=H+
 image(0,"https://api.nga.gov/iiif/"+uuid,"primary")+
 image(1,"https://api.nga.gov/iiif/"+uuid,"primary")+
 image(1,"https://api.nga.gov/iiif/"+uuid,"alternate")+
 image(1,"https://evil.example/iiif/"+uuid,"primary")+
 image(1,"https://api.nga.gov/iiif/"+uuid,"primary","123456")+
 image(1,"https://api.nga.gov/iiif/"+uuid,"primary","50298");
const res=selectNGAOpenImages(raw,new Set([46164,50298,99999]));
assert.equal(res.rowCount,7);
assert.equal(res.selected.get(46164).objectId,46164);
assert.equal(res.selected.get(50298).objectId,50298);
assert.equal(res.selected.get(99999),null);
const onlyRestricted=selectNGAOpenImages(H+image(0,"https://api.nga.gov/iiif/"+uuid,"primary"),new Set([46164]));
assert.equal(onlyRestricted.selected.get(46164),null,"NGA CSV has restricted works; CC0 dataset does not license image");
assert.throws(()=>parseCsv('a,b\n"open,end',()=>{}),/Malformed NGA CSV/);
assert.deepEqual(read("data/calendar/sacred-art-certified-media.v1.json").media,[]);
const script=readFileSync(new URL("../tools/calendar/acquire-sacred-art-nga.mjs",import.meta.url),"utf8");
assert(script.includes('col("openaccess")!=="1"'));
assert(script.includes('results:')||script.includes("results};"));
assert(!script.includes("git push"));
console.log("NGA six official object IDs verified; quoted CSV parser, restricted image, wrong-host and Prado tests: PASS");
