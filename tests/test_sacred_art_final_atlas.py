#!/usr/bin/env python3
"""Fail-closed synthetic regression for the one-file sacred-art editorial atlas."""
import datetime, hashlib, json, subprocess, sys, tempfile
from pathlib import Path
from PIL import Image

ROOT=Path(__file__).resolve().parents[1]
BUILDER=ROOT/"tools/calendar/build-sacred-art-final-atlas.py"
def main():
    with tempfile.TemporaryDirectory() as temp:
        base=Path(temp)
        originals=base/"originals"
        originals.mkdir()
        jpg=originals/"test-1.jpg"
        Image.new("RGB",(2600,1800),(121,91,71)).save(jpg,"JPEG")
        sha=hashlib.sha256(jpg.read_bytes()).hexdigest()
        registry={"schema":"AO_SACRED_ART_CANDIDATES_V1","artworks":[
          {"id":"test-1","title":"Test Painting","artist":"Sample Artist","museum":"Sample Museum",
           "dated":"1600","source":{"objectUrl":"https://example.org/object","rights":"CC0"},
           "association":{"subjectKeys":["annunciation"],"prayerKeys":["rosary.joy1"]},
           "acquisition":{"originalSha256":sha,"archiveOriginal":"originals/test-1.jpg"}}
        ]}
        days=[]
        for i in range(365):
            date=(datetime.date(2026,1,1)+datetime.timedelta(days=i)).isoformat()
            days.append({"date":date,"class":1 if i==0 else 4,"observedPrincipalId":"test:"+str(i),
                         "observedTitle":"Sample Day "+str(i),"coverage":"GENERIC_ONLY",
                         "alternatives":[{"artworkId":"test-1","tier":"STRICT_DAY_SOURCE_LINK",
                                          "evidence":"Test source"}] if i==0 else []})
        associations={"schema":"AO_SACRED_ART_FULL_YEAR_MULTIPLE_ASSOCIATIONS_V1",
                      "days":days,"summary":{"dates":365}}
        (base/"registry.json").write_text(json.dumps(registry),encoding="utf8")
        (base/"association.json").write_text(json.dumps(associations),encoding="utf8")
        html=base/"atlas.html"
        subprocess.run([sys.executable,str(BUILDER),"--registry",str(base/"registry.json"),
                        "--associations",str(base/"association.json"),
                        "--images-root",str(originals),"--output",str(html),"--strict-images"],check=True)
        content=html.read_text(encoding="utf8")
        for required in ("AO_SACRED_ART_FULL_YEAR_NEGATIVE_EXCEPTION_REVIEW_V1",
                         "sacred-art-negative-exceptions.json","MISPLACED_ON_DAY",
                         "REJECT_ARTWORK_GLOBALLY","INVESTIGATE_FURTHER",
                         "2026-01-01","Test Painting","data:image/webp;base64,"):
            assert required in content,required
        report=json.loads((base/"build-stats.json").read_text(encoding="utf8"))
        assert report["artworks"]==1 and report["calendarDates"]==365
        assert report["linkedArtworkDayAssociations"]==1
        assert not report["missingPreviews"]
        script=content.rsplit("<script>",1)[1].split("</script>",1)[0]
        js=base/"atlas.js"
        js.write_text(script,encoding="utf8")
        subprocess.run(["node","--check",str(js)],check=True)
        print("SACRED_ART_ATLAS_SYNTHETIC_TEST_PASS=1")
if __name__=="__main__":main()
