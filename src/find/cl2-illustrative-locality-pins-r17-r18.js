// R17 + R18: two separate original-CL2, Excel GEO-only approved US chapels.
// These are named institution/school CAMPUS locality discovery markers, not chapel footprint or visitor entrance GPS.
// St Thomas More San Jose (SSPX) and Chelsea Academy Front Royal (FSSP) are distinct churches and physical campuses.
export const CL2_ILLUSTRATIVE_LOCALITY_PINS_R17_R18=Object.freeze({
  "RG-18E53EDD9E9C": {
    sourceId:"AO-B45-SSPX-US-98A6ADD77DBE",
    name:"Saint Thomas More Chapel",
    country:"US",
    addressNeedle:"1565 S White Road",
    placeId:null,
    lat:37.34851,lng:-121.813227,
    precision:"locality",
    sourceRef:"independent:r17-illustrative-rg18e53edd9e9c",
    sourceUrl:"https://www.citysettings.com/privateschools/st-thomas-more-school-san-jose-ca",
    attribution:"R17 Excel Approved Geo Manifest row 180; official SSPX chapel and school share 1565 S White Road, San Jose CA 95127. SSPX https://sspx.org/en/list-sspx-chapels and https://map.fsspx.org/es/places/saint-thomas-more-chapel confirm chapel at address; US Dept of Education NCES PSS https://nces.ed.gov/surveys/pss/privateschoolsearch/school_detail.asp?HiGrade=-1&ID=A0740025&IncGrade=-1&LoGrade=-1&Miles=5&NumOfStudentsRange=more&SchoolPageNum=2&Search=1&Zip=95172 confirms school same address. Independent school/campus geocoding https://www.citysettings.com/privateschools/st-thomas-more-school-san-jose-ca supports 37.34851,-121.813227. OSM named chapel at campus is inconsistently titled Saint Athanasius: do NOT reinterpret it as independently verified St Thomas More chapel footprint. Only an illustrative SHARED SCHOOL/CHAPEL CAMPUS VICINITY, not church building, access entrance, certified GPS, or directions. Distinct from FSSP Chelsea Academy Front Royal R18. No Mass times/access/rite inferred.",
    reviewScope:"ILLUSTRATIVE_LOCALITY_POINT_NOT_WORSHIP_BUILDING_NOT_ENTRANCE",
    evidence:[
      "https://sspx.org/en/list-sspx-chapels",
      "https://map.fsspx.org/es/places/saint-thomas-more-chapel",
      "https://nces.ed.gov/surveys/pss/privateschoolsearch/school_detail.asp?HiGrade=-1&ID=A0740025&IncGrade=-1&LoGrade=-1&Miles=5&NumOfStudentsRange=more&SchoolPageNum=2&Search=1&Zip=95172",
      "https://www.citysettings.com/privateschools/st-thomas-more-school-san-jose-ca"
    ],
    localityName:"SSPX Saint Thomas More School campus vicinity, chapel footprint and entrance unverified",
    adminRegion:"San Jose, California, USA",
    searchAddress:"Saint Thomas More Chapel, 1565 S White Road, San Jose, CA 95127, USA",
    correctedAddress:"Saint Thomas More Chapel, 1565 S White Road, San Jose, CA 95127, USA"
  },
  "RG-61CD2A736B43": {
    sourceId:"AO-B42-FSSP-US-321",
    name:"St Thomas More Chapel — Chelsea Academy",
    country:"US",
    addressNeedle:"1190 Progress Drive",
    placeId:null,
    lat:38.93932,lng:-78.15762,
    precision:"locality",
    sourceRef:"independent:r18-illustrative-rg61cd2a736b43",
    sourceUrl:"https://mapcarta.com/W1120299028",
    attribution:"R18 Excel Approved Geo Manifest row 181. Official FSSP https://www.fssp.org/en/find-us/where-are-we/ lists St Thomas More Chapel, Our Lady of Victory Chaplaincy, Chelsea Academy at 1190 Progress Drive, Front Royal VA 22630; official Chelsea Academy https://www.chelseaacademy.org/about/contact-us.cfm independently confirms 1190 Progress Drive. OSM school BUILDING way 1120299028 https://mapcarta.com/W1120299028 identifies Chelsea Academy at 38.93932,-78.15762. This is a school-campus/building vicinity only, not surveyed chapel footprint, visitor door, precise GPS, Mass schedule/access or church GPS. Preserve frozen CL2 canonical title and both original FSSP source IDs; do not conflate with SSPX Saint Thomas More Chapel in San Jose R17. Google Maps search by actual chapel and full street address, not raw coordinates.",
    reviewScope:"ILLUSTRATIVE_LOCALITY_POINT_NOT_WORSHIP_BUILDING_NOT_ENTRANCE",
    evidence:[
      "https://www.fssp.org/en/find-us/where-are-we/",
      "https://www.chelseaacademy.org/about/contact-us.cfm",
      "https://mapcarta.com/W1120299028"
    ],
    localityName:"Chelsea Academy school campus vicinity; St Thomas More chapel entrance unverified",
    adminRegion:"Front Royal, Virginia, USA",
    searchAddress:"St Thomas More Chapel, Chelsea Academy, 1190 Progress Drive, Front Royal, VA 22630, USA",
    correctedAddress:"St Thomas More Chapel, Chelsea Academy, 1190 Progress Drive, Front Royal, VA 22630, USA"
  }
});
