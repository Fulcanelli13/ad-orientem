// Derived read-model adapter for the single CL2 physical-site master.
// Exactly one Explore record per effective physical site; source aliases are
// preserved for search and provenance, never published as duplicate churches.
export const CL2_PHYSICAL_SITE_INDEX_URL=new URL("../../data/directory/generated/cl2-physical-site-index.v1.json",import.meta.url).href;
export const CL2_PHYSICAL_SITE_COUNT=2579;
export const CL2_EXPECTED_R49_GROUPS=1844;
export const CL2_EXPECTED_NEW_GROUPS=735;
const T=v=>String(v??"").trim();
const normal=s=>T(s).normalize("NFKD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
const validUrl=s=>/^https?:\/\/[^\s<>"']+$/i.test(s);
const https=s=>/^https:\/\/[^\s<>"']+$/i.test(s);
const unique=a=>[...new Set(a)];

// Explicit adjudications of divergent *existing* R49 site pins. Keep original
// source records immutable and preserve the selected venue's item/source ID.
// A church building is corroborated; a precise visitor entrance is NOT.
// Never infer a new coordinate from the postal address or another venue.
const REVIEWED_SITE_GEO_SOURCES=Object.freeze({
 "RG-956BB24E14EA":Object.freeze({
  sourceId:"LMD:maternal-heart-of-mary-church-lewisham-australia",
  evidence:Object.freeze([
   "https://mapcarta.com/W1072172027", // OSM exact FSSP church building
   "https://maternalheart.org/contact-us/", // parish address, Charles O'Neill Way
  ]),
 }),
 "RG-4279040C75AD":Object.freeze({
  sourceId:"LMD:crypt-chapel-of-our-lady-of-sorrows-geraldton-australia",
  evidence:Object.freeze([
   "https://towerbells.org/data/AUGRLNSF.HTM", // Cathedral Avenue, independent building location
   "https://www.geraldtondiocese.org.au/parishes/geraldton-parishes",
  ]),
 }),
 "RG-9DE31147B6ED":Object.freeze({
  sourceId:"ao-research-icksp-federated-v13-icksp-stg-125",
  evidence:Object.freeze([
   "https://www.galwaymusiccentre.ie/contact-1", // same college building: published main entrance + coordinates
   "https://galway.icksp.ie/", // ICKSP: St Mary's College Chapel, St Mary's Road
   "https://weekdaymasses.org.uk/en/area/galway/churches", // chapel left behind main college building
  ]),
 }),
});
// Only separately verified exact-building coordinates can promote an
// unlocated CL2 research listing to a provisional physical-site marker.
// Names, country, source ID and street must all match the frozen source row.
const REVIEWED_NEW_SITE_PINS=Object.freeze({
 "RG-A768309560A6":Object.freeze({
  sourceId:"AO-B39-LOC-SK-F3A4F0DCE391",
  name:"Kaplnka Svätého Leonarda",country:"SK",addressNeedle:"Doľany",placeId:null,
  lat:48.420389,lng:17.375139,
  sourceRef:"heritage:pamiatkynaslovensku:leonarda-dolany",
  sourceUrl:"https://www.pamiatkynaslovensku.sk/dolany-kaplnka-sv-leonarda-a-floriana",
  correctedAddress:"Kaplnka sv. Leonarda, Kalvária, Doľany, okres Pezinok, Slovakia",
  precision:"site",reviewScope:"PEZINOK_SAINT_LEONARD_NOT_LEVOCA_SAINT_LEONARD_OR_SEBASTIAN",
  evidence:Object.freeze([
    "https://apsida.sk/c/8281/dolany-kaplnka",
    "https://www.dokostola.sk/farnost/dolany",
    "https://www.latinmassdir.org/trends/2025/sk/"
  ]),
 }),
 "RG-1EDB76F4B57B":Object.freeze({
  sourceId:"AO-B38-LOC-ES-61C6D5A95E5",name:"Iglesia del Salvador",country:"ES",addressNeedle:"",placeId:null,
  lat:39.85656,lng:-4.02675,sourceRef:"osm:way:113958010",
  sourceUrl:"https://www.openstreetmap.org/way/113958010",
  correctedAddress:"Plaza del Salvador / Calle Santa Úrsula 5, 45002 Toledo, Spain",
  precision:"site",reviewScope:"TOLEDO_MOSQUE_CHURCH_NOT_TALAVERA_OR_MADRIDEJOS",
  evidence:Object.freeze(["https://mapcarta.com/es/W113958010","https://turismo.toledo.es/recursos/museos-y-monumentos/id619-iglesia-del-salvador.html","https://www.latinmassdir.org/country/es/page/2/?area=Pamplona&order=DESC&orderby=modified&view=list"]),
 }),
 "RG-B30F94A20F69":Object.freeze({
  sourceId:"AO-B38-LOC-BE-29F03868623",name:"Église Saint-Hubert",country:"BE",addressNeedle:"Verviers",placeId:null,
  lat:50.57716,lng:5.86643,sourceRef:"osm:way:175896158",sourceUrl:"https://www.openstreetmap.org/way/175896158",
  correctedAddress:"Place Hubert Delrez, 4802 Heusy, Verviers, Belgium",precision:"site",reviewScope:"HEUSY_SAINT_HUBERT_NOT_SAINT_ANTOINE_HUBERT",
  evidence:Object.freeze(["https://mapcarta.com/W175896158","https://mapcarta.com/W158419717"]),
 }),
 "RG-C3F8A4083DC9":Object.freeze({
  sourceId:"AO-B38-LOC-ES-6D3B4F8F243",name:"Capilla de San Roque",country:"ES",addressNeedle:"Santiago de Compostela",placeId:null,
  lat:42.88346,lng:-8.54177,sourceRef:"independent:sacristan-san-roque-santiago",sourceUrl:"https://sacristan.io/church/es/santiago-de-compostela/capela-de-san-roque",
  correctedAddress:"Rúa de San Roque 4, 15704 Santiago de Compostela, Spain",precision:"site",reviewScope:"SANTIAGO_CHAPEL_NOT_SAN_ROQUE_MELIDE_OR_PONTEVEDRA",
  evidence:Object.freeze(["https://sacristan.io/church/es/santiago-de-compostela/capela-de-san-roque"]),
 }),
 "RG-D1C52ADC007B":Object.freeze({
  sourceId:"AO-B39-LOC-IT-2275C33A8E1A",name:"Chiesa della Madonna del Popolo",country:"IT",addressNeedle:"Romagnano Sesia",placeId:null,
  lat:45.63336,lng:8.38364,sourceRef:"osm:way:256582212",sourceUrl:"https://www.openstreetmap.org/way/256582212",
  correctedAddress:"Piazza della Libertà / Via Novara, 28078 Romagnano Sesia (NO), Italy",precision:"site",
  evidence:Object.freeze(["https://mapcarta.com/es/W256582212","https://www.comune.romagnano-sesia.no.it/it-it/vivere-il-comune/cosa-vedere/chiesa-della-madonna-del-popolo-sec-xvii-2013-1-02d3a3be9fb7fe660a45147aae16fff6","https://catalogo.beniculturali.it/detail/ArchitecturalOrLandscapeHeritage/0100002461"]),
 }),
 "RG-04ED0DAE5D46":Object.freeze({
  sourceId:"AO-B39-LOC-PL-8AFC063B0397",name:"Kościół Wniebowzięcia NMP",
  country:"PL",addressNeedle:"Kościelna 1",placeId:null,
  lat:50.003877,lng:18.462301,sourceRef:"osm:way:93211460",
  sourceUrl:"https://www.openstreetmap.org/way/93211460",correctedAddress:"ul. Kościelna 1, 44-300 Wodzisław Śląski, Poland",
  precision:"site",
  evidence:Object.freeze(["https://www.archidiecezjakatowicka.pl/o-diecezji/parafie/37-wodzis%C5%82aw-slaski/313-wniebowziecia-najswietszej-maryi-panny-wodzislaw-slaski","https://commons.wikimedia.org/wiki/File:Ko%C5%9Bci%C3%B3%C5%82_WNMP_w_Wodzis%C5%82awiu_%C5%9Al%C4%85skim_a2.jpg"]),
 }),
 "RG-13C11CB31E3F":Object.freeze({
  sourceId:"AO-B39-LOC-IT-65724603C504",name:"Oratorio di San Francesco Poverino",
  country:"IT",addressNeedle:"Piazza Santissima Annunziata 2",placeId:null,
  lat:43.776661,lng:11.260311,sourceRef:"independent:firenze-loggiato-san-francesco-poverino",
  sourceUrl:"https://www.feelflorence.it/it/punti-di-interesse/oratorio-di-san-francesco-poverino",correctedAddress:"Piazza della Santissima Annunziata 2, 50122 Firenze, Italy",
  precision:"site",reviewScope:"ORATORY_WITHIN_LOGGIA_NOT_INDEPENDENT_DOOR",
  evidence:Object.freeze(["https://www.palazzospinelli.org/architetture/scheda.asp?ID=3207&ubicazione=annunziata","https://firenzeneidettagli.blogspot.com/2012/10/colonne-in-file-ortogonali.html","https://www.cittametropolitana.fi.it/wp-content/uploads/Elenco_Beni_FI.pdf"]),
 }),
 "RG-7E91D5FD0AC3":Object.freeze({
  sourceId:"AO-B39-LOC-SK-FA51618C8159",name:"Kaplnka Svätého Michala Archanjela",
  country:"SK",addressNeedle:"Nitra",placeId:null,
  lat:48.31315521174904,lng:18.084892176995208,sourceRef:"osm:way:58219944",
  sourceUrl:"https://www.openstreetmap.org/way/58219944",correctedAddress:"Kaplnka sv. Michala Archanjela, Na Vŕšku, Nitra 949 01, Slovakia",
  precision:"site",
  evidence:Object.freeze(["https://poi.oma.sk/w58219944","https://tripomatic.com/sk/poi/svateho-michala-archanjela-poi%3A156712"]),
 }),
 "RG-D2CECBA0C364":Object.freeze({
  sourceId:"AO-B39-LOC-SK-A8267BEFF673",name:"Kostol Navštívenia Panny Márie",
  country:"SK",addressNeedle:"Námestie SNP",placeId:null,
  lat:48.1460325461052,lng:17.11044759831011,sourceRef:"osm:way:77918570",
  sourceUrl:"https://www.openstreetmap.org/way/77918570",correctedAddress:"Námestie SNP 8, 811 06 Bratislava, Slovakia",
  precision:"site",reviewScope:"HOSPITALLER_BROTHERS_CHURCH_NOT_INDEPENDENT_DIOCESAN_PARISH",
  evidence:Object.freeze(["https://poi.oma.sk/w77918570","https://www.pamiatkynaslovensku.sk/bratislava-kostol-navstivenia-panny-marie-a-klastor-milosrdnych-bratov"]),
 }),
 "RG-F03B6AF4FA24":Object.freeze({
  sourceId:"AO-B38-LOC-NL-79F20E0188E",name:"Sint-Salviuskerk",
  country:"NL",addressNeedle:"Limbricht",placeId:null,
  lat:51.01252,lng:5.83907,sourceRef:"osm:way:282449190",
  sourceUrl:"https://www.openstreetmap.org/way/282449190",correctedAddress:"Nieuwe Sint-Salviuskerk, Burgemeester Coonenplein 2, Limbricht, Netherlands",
  precision:"site",reviewScope:"NEW_ACTIVE_PARISH_CHURCH_NOT_OLD_HISTORIC_SALVIUSKERK",
  evidence:Object.freeze(["https://mapcarta.com/W282449190","https://commons.wikimedia.org/wiki/Category:Salviuskerk_(Limbricht)"]),
 }),
 "RG-CC73C2CBD613":Object.freeze({
  sourceId:"AO-B39-LOC-PL-D8909F2A26BE",name:"Kościół Świętego Jakuba",
  country:"PL",addressNeedle:"plac Dominikański",placeId:null,
  lat:50.092367,lng:18.220611,sourceRef:"commons:object-location:raciborz-saint-james",
  sourceUrl:"https://commons.wikimedia.org/wiki/File:Ko%C5%9Bci%C3%B3%C5%82_%C5%9Bw._Jakuba_w_Raciborzu_%28wn%C4%99trze_4%29.JPG",correctedAddress:"Rynek 1 / plac Dominikański 1, 47-400 Racibórz, Poland",
  precision:"site",reviewScope:"FILIAL_SAINT_JAMES_NOT_ASSUMPTION_PARISH_CHURCH",
  evidence:Object.freeze(["https://farny-raciborz.pl/historia/kosciol-pw-sw-jakuba/","https://mapy.com/pl/?id=94266361&source=osm"]),
 }),
 "RG-783CD50DD217":Object.freeze({
  sourceId:"AO-B39-LOC-PL-EA168B0ACA4A",name:"Kościół Matki Bożej Śnieżnej",country:"PL",addressNeedle:"Mikołów",placeId:null,
  lat:50.1705,lng:18.90754,sourceRef:"osm:way:169044576",sourceUrl:"https://www.openstreetmap.org/way/169044576",
  correctedAddress:"ul. Świętego Wojciecha 11, 43-190 Mikołów, Poland",precision:"site",reviewScope:"HISTORIC_FILIAL_CHURCH_NOT_NEARBY_BASILICA",
  evidence:Object.freeze(["https://mapcarta.com/fr/W169044576","https://www.slaskie.travel/culturalheritage/15729/kosciol-matki-bozej-snieznej-w-mikolowie","https://mojmikolow.pl/o-miescie/koscioly-msze-swiete-parafie"]),
 }),
 "RG-0BB62E04774C":Object.freeze({
  sourceId:"AO-B39-LOC-PL-83A0BDB437C1",name:"Kościół Ducha Świętego",country:"PL",addressNeedle:"Krakowska 19",placeId:null,
  lat:50.3461,lng:18.9278,sourceRef:"commons:object-location:bytom-holy-spirit",sourceUrl:"https://commons.wikimedia.org/wiki/Category:Holy_Spirit_Church_in_Bytom",
  correctedAddress:"ul. Krakowska 19, 41-902 Bytom, Poland",precision:"site",reviewScope:"CHURCH_FILIAL_NOT_MAIN_PARISH_SITE",
  evidence:Object.freeze(["https://fotopolska.eu/Bytom/b34897,Kosciol_kaplica_Swietego_Ducha_.html","https://commons.wikimedia.org/wiki/Category:Holy_Spirit_Church_in_Bytom","https://tradycja.org/"]),
 }),
 "RG-BBB3789ADB9A":Object.freeze({
  sourceId:"AO-B39-LOC-IT-6FC8D0881AF4",name:"Chiesa dei Santi Simone e Giuda",country:"IT",addressNeedle:"Mantova",placeId:null,
  lat:45.1604,lng:10.79139,sourceRef:"osm:way:245105097",
  sourceUrl:"https://www.openstreetmap.org/way/245105097",correctedAddress:"Via Domenico Fernelli 17, Mantova, Italy",
  precision:"site",reviewScope:"DIOCESAN_CHURCH_HISTORIC_PARISH_SUPPRESSED_1805",evidence:Object.freeze(["https://mapcarta.com/de/W245105097","https://it.wikipedia.org/wiki/Chiesa_dei_Santi_Simone_e_Giuda_(Mantova)"]),
 }),
 "RG-8CB13769F987":Object.freeze({
  sourceId:"AO-B38-LOC-NL-9947B9DFA3B",name:"Onze Lieve Vrouw Onbevlekt Ontvangen",country:"NL",addressNeedle:"Oss",placeId:null,
  lat:51.769178,lng:5.522718,sourceRef:"rijksmonument:31870",
  sourceUrl:"https://commons.wikimedia.org/wiki/Category:Onze-Lieve-Vrouw_Onbevlekt_Ontvangenkerk_(Oss)",correctedAddress:"Kerkstraat 15, 5341 BK Oss, Netherlands",
  precision:"site",reviewScope:"CHURCH_OBJECT_POSITION_NOT_VERIFIED_DOOR",evidence:Object.freeze(["https://parochiewillibrordus.nl/index.php?ids=kerk_grotekerk&p=kerkpagina","https://erfgoedbrabantverhalen.nl/religieuze-gebouwen/onze-lieve-vrouw-onbevlekt-ontvangenkerk-4/","https://www.wikidata.org/wiki/Q17438831"]),
 }),
 "RG-A0933DE542C7":Object.freeze({
  sourceId:"AO-B38-LOC-ES-E7A90BC3DB7",name:"Iglesia Cripta del Santísimo Cristo",country:"ES",addressNeedle:"Santander",placeId:null,
  lat:43.46081,lng:-3.80701,sourceRef:"osm:node:7704619785",sourceUrl:"https://www.openstreetmap.org/node/7704619785",
  correctedAddress:"Parroquia del Santísimo Cristo, Calle de los Azogues, 39002 Santander, Spain",precision:"site",reviewScope:"CRYPT_CHURCH_SITE_NOT_CATHEDRAL_ENTRANCE",
  evidence:Object.freeze(["https://mapcarta.com/N7704619785","https://iglesiacercademi.com/santander/parroquia-del-santisimo-cristo/"]),
 }),
 "RG-938EAA84BA0A":Object.freeze({
  sourceId:"AO-B39-LOC-IT-A5B23CB1B0E5",name:"Chiesa dei SS Cirillo e Metodio",country:"IT",addressNeedle:"Via Osteria di Dragoncello 12",placeId:null,
  lat:41.789059,lng:12.344535,sourceRef:"turismoroma:158912",sourceUrl:"https://www.turismoroma.it/it/node/158912",
  correctedAddress:"Via Osteria di Dragoncello 12, Acilia Nord, Roma, Italy",precision:"site",reviewScope:"OFFICIAL_MUNICIPAL_SITE_POSITION_NOT_ENTRANCE",
  evidence:Object.freeze(["https://www.turismoroma.it/de/node/158912","https://www.santicirilloemetodio.it/"]),
 }),
 "RG-1EE1D2C9B3EB":Object.freeze({
  sourceId:"AO-B39-LOC-HU-C9750B2A6BCA",name:"Karolina-kápolna",country:"HU",addressNeedle:"Vác",placeId:null,
  lat:47.7752,lng:19.13221,sourceRef:"osm:way:297827179",
  sourceUrl:"https://www.openstreetmap.org/way/297827179",correctedAddress:"Karolina-kápolna, Vác, Hungary",
  precision:"site",evidence:Object.freeze(["https://mapcarta.com/W297827179","https://miserend.hu/collection/relation%3A1440602"]),
 }),
 "RG-DE5F8ED4E2F7":Object.freeze({
  sourceId:"AO-B39-LOC-PL-4B4A686B30D2",name:"Kościół Matki Bożej Bolesnej",country:"PL",addressNeedle:"Rybnickiego 2",placeId:null,
  lat:50.09753,lng:18.54209,sourceRef:"osm:way:236882053",
  sourceUrl:"https://www.openstreetmap.org/way/236882053",correctedAddress:"ul. Franciszka Rybnickiego 2, 44-200 Rybnik, Poland",
  precision:"site",evidence:Object.freeze(["https://mapcarta.com/fr/W236882053","https://archidiecezjakatowicka.pl/o-diecezji/parafie/31-rybnik","https://www.bolesna-rybnik.pl/kontakt,i10.html"]),
 }),
 "RG-322AA8195E65":Object.freeze({
  sourceId:"AO-B39-LOC-PL-A28D536BB19E",name:"Kościół Świętego Jerzego",country:"PL",addressNeedle:"Tumska",placeId:null,
  lat:52.53739,lng:17.5931,sourceRef:"osm:way:75000179",
  sourceUrl:"https://www.openstreetmap.org/way/75000179",correctedAddress:"Kościół św. Jerzego, ul. Tumska, Gniezno, Poland",
  precision:"site",evidence:Object.freeze(["https://mapcarta.com/W75000179","https://archidiecezja.pl/duszpasterstwo/msza-sw-trydencka-w-archidiecezji-gnieznienskiej/"]),
 }),
 "RG-C7F25752659D":Object.freeze({
  sourceId:"AO-B38-LOC-NL-19A47E978C1",name:"Sint Josephkerk",country:"NL",addressNeedle:"Haarlem",placeId:null,
  lat:52.38331,lng:4.63887,sourceRef:"osm:way:265313243",
  sourceUrl:"https://www.openstreetmap.org/way/265313243",correctedAddress:"Sint Josephkerk, Jansstraat 41, Haarlem, Netherlands",
  precision:"site",evidence:Object.freeze(["https://mapcarta.com/W265313243","https://www.geonames.org/6951288/sint-josephkerk.html"]),
 }),
 "RG-4D09923C6B74":Object.freeze({
  sourceId:"AO-B39-LOC-IT-76322D1DA1C9",name:"Chiesa del Gesù",country:"IT",addressNeedle:"Castellammare di Stabia",placeId:null,
  lat:40.69399,lng:14.47883,sourceRef:"osm:way:734893276",
  sourceUrl:"https://www.openstreetmap.org/way/734893276",correctedAddress:"Chiesa di Gesù e Maria, Strada Gesù 11, Castellammare di Stabia, Italy",
  precision:"site",evidence:Object.freeze(["https://mapcarta.com/W734893276","https://it.wikipedia.org/wiki/Chiesa_di_Ges%C3%B9_e_Maria_(Castellammare_di_Stabia)"]),
 }),
 "RG-8DC436A75526":Object.freeze({
  sourceId:"AO-B39-LOC-PL-CD2D71CC49A0",name:"Kościół Świętych Jana i Pawła Męczenników",country:"PL",addressNeedle:"Chorzowska 160",placeId:null,
  lat:50.270021,lng:18.996568,sourceRef:"odtur:12019",
  sourceUrl:"https://odtur.pl/atrakcje/katowice-kosciol-pw-ss-jana-i-pawla-meczennikow-w-katowicach-12019.html",correctedAddress:"ul. Chorzowska 160, 40-101 Katowice-Dąb, Poland",
  precision:"site",evidence:Object.freeze(["https://parafie.net/parafia-sw-jana-i-pawla-meczennikow-katowice/","https://www.dioblina.eu/Kosciol_sw_Jana_i_Pawla_Meczennikow"]),
 }),
 "RG-2CFE11950F95":Object.freeze({
  sourceId:"AO-B38-LOC-BE-68ECD274D85",name:"Église Saint-Sauveur",country:"BE",addressNeedle:"Grâce-Hollogne",placeId:null,
  lat:50.62438,lng:5.39712,sourceRef:"osm:way:369175503",sourceUrl:"https://www.openstreetmap.org/way/369175503",
  correctedAddress:"Place du Doyenné, Hozémont, Grâce-Hollogne, Belgium",precision:"site",
  evidence:Object.freeze(["https://mapcarta.com/W369175503","https://www.cirkwi.com/fr/point-interet/1168002-eglise-saint-sauveur"]),
 }),
 "RG-4E6E8B55676B":Object.freeze({
  sourceId:"AO-B39-LOC-PL-08241A64B37C",name:"Kościół Świętego Bartłomieja Stary",country:"PL",addressNeedle:"Toszecka 38",placeId:null,
  lat:50.31106,lng:18.66963,sourceRef:"osm:way:266470146",sourceUrl:"https://www.openstreetmap.org/way/266470146",
  correctedAddress:"Toszecka 38, Gliwice, Poland",precision:"site",
  evidence:Object.freeze(["https://mapcarta.com/de/W266470146","https://zabytek.pl/pl/obiekty/gliwice-kosciol-fil-pw-sw-bartlomieja"]),
 }),
 "RG-EE22A08568B9":Object.freeze({
  sourceId:"AO-B38-LOC-ES-539E5EDAC4B",name:"Sant Jordi de Vallcarca",country:"ES",addressNeedle:"",placeId:null,
  lat:41.41319,lng:2.1441,sourceRef:"osm:way:233311642",sourceUrl:"https://www.openstreetmap.org/way/233311642",
  correctedAddress:"Viaducte de Vallcarca 7-13, 08023 Barcelona, Spain",precision:"site",
  evidence:Object.freeze(["https://mapcarta.com/es/W233311642","https://sacristan.io/en/church/es/barcelona/parroquia-de-sant-jordi"]),
 }),
 "RG-48A5E9F09178":Object.freeze({
  sourceId:"AO-B39-LOC-PL-2622F5C3F4E5",name:"Kościół Opatrzności Bożej",country:"PL",addressNeedle:"Poznańska 332",placeId:null,
  lat:52.755082,lng:18.255326,sourceRef:"odtur:8550",sourceUrl:"https://odtur.pl/atrakcje/inowroclaw-kosciol-pw-opatrznosci-bozej-8550.html",
  correctedAddress:"ul. Poznańska 332, 88-100 Inowrocław, Poland",precision:"site",
  evidence:Object.freeze(["https://archidiecezja.pl/kuria_parafie/rejon-inowroclawski/dekanat-inowroclawski-i/inowroclaw-matwy-par-pw-opatrznosci-bozej/","https://odtur.pl/atrakcje/inowroclaw-kosciol-pw-opatrznosci-bozej-8550.html"]),
 }),
 "RG-14C05BCC015B":Object.freeze({
  sourceId:"AO-B38-LOC-ES-3F0F660D197",name:"Basílica de Santa Maria d'Alacant",country:"ES",addressNeedle:"Alicante",placeId:null,
  lat:38.3462,lng:-0.47922,sourceRef:"osm:way:22560738",
  sourceUrl:"https://www.openstreetmap.org/way/22560738",correctedAddress:"Plaza Santa María, Alicante, Spain",
  precision:"site",
  evidence:Object.freeze(["https://mapcarta.com/W22560738","https://pares.cultura.gob.es/ParesBusquedas20/catalogo/autoridad/134519"]),
 }),
 "RG-3B5F15EA02ED":Object.freeze({
  sourceId:"AO-B38-LOC-BE-97765C5D89C",name:"Heilig-Bloedbasiliek",country:"BE",addressNeedle:"Brugge",placeId:null,
  lat:51.20812,lng:3.22667,sourceRef:"osm:way:39262789",
  sourceUrl:"https://www.openstreetmap.org/way/39262789",correctedAddress:"Burg 13, 8000 Brugge, Belgium",
  precision:"site",
  evidence:Object.freeze(["https://mapcarta.com/W39262789"]),
 }),
 "RG-DF3BA1A9A39C":Object.freeze({
  sourceId:"AO-B38-LOC-ES-4FEB6B1C9A5",name:"Concatedral de Santa María de Cáceres",country:"ES",addressNeedle:"Cáceres",placeId:null,
  lat:39.47454,lng:-6.37002,sourceRef:"osm:way:385037723",
  sourceUrl:"https://www.openstreetmap.org/way/385037723",correctedAddress:"Concatedral de Santa María, Cáceres, Spain",
  precision:"site",
  evidence:Object.freeze(["https://mapcarta.com/es/W385037723"]),
 }),
 "RG-3EE76EFE0DC3":Object.freeze({
  sourceId:"AO-B38-LOC-NL-D7C692A1473",name:"St.-Andreaskerk",country:"NL",addressNeedle:"Steenwijkerwold",placeId:null,
  lat:52.80061,lng:6.05811,sourceRef:"osm:way:269912643",
  sourceUrl:"https://www.openstreetmap.org/way/269912643",correctedAddress:"St.-Andreaskerk, Steenwijkerwold, Netherlands",
  precision:"site",
  evidence:Object.freeze(["https://mapcarta.com/W269912643"]),
 }),
 "RG-270210292F78":Object.freeze({
  sourceId:"AO-B38-LOC-NL-B7C2C6728E5",name:"Onze Lieve Vrouw ter Nood Bedevaartkapel",country:"NL",addressNeedle:"Heiloo",placeId:null,
  lat:52.58319,lng:4.68817,sourceRef:"osm:way:44665187",
  sourceUrl:"https://www.openstreetmap.org/way/44665187",correctedAddress:"Kapellaan 144, 1851 PE Heiloo, Netherlands",
  precision:"site",reviewScope:"BEDEVAART_CHURCH_NOT_SEPARATE_GENADKAPEL",
  evidence:Object.freeze(["https://mapcarta.com/W44665187","https://olvternood.nl/contact/"]),
 }),
 "RG-AA00B3C74515":Object.freeze({
  sourceId:"AO-B38-LOC-NL-37690D7D21D",name:"Sint-Petrus'-Bandenkerk",country:"NL",addressNeedle:"Bladel",placeId:null,
  lat:51.36839,lng:5.22087,sourceRef:"osm:way:278352768",
  sourceUrl:"https://www.openstreetmap.org/way/278352768",correctedAddress:"Sint-Petrus'-Bandenkerk, Bladel, Netherlands",
  precision:"site",
  evidence:Object.freeze(["https://mapcarta.com/W278352768"]),
 }),
 "RG-77CC30491D1E":Object.freeze({
  sourceId:"AO-B38-LOC-NL-15C79B5490C",name:"Heilige Lodewijkkerk",country:"NL",addressNeedle:"Leiden",placeId:null,
  lat:52.156028,lng:4.491611,sourceRef:"rijksmonument:25593",
  sourceUrl:"https://commons.wikimedia.org/wiki/Category:Heilige_Lodewijkkerk_(Leiden)",correctedAddress:"Steenschuur 19, 2311 ES Leiden, Netherlands",
  precision:"site",
  evidence:Object.freeze(["https://www.lodewijkparochie.nl/homepage/contact/","https://www.wikidata.org/wiki/Q2520298"]),
 }),
 "RG-769233567FB2":Object.freeze({
  sourceId:"AO-B39-LOC-SK-E4BB98A95578",name:"Kaplnka Panny Márie Fatimskej",country:"SK",addressNeedle:"Hollého 10",placeId:null,
  lat:48.3789569,lng:17.5891077,sourceRef:"osm:node:7811161449",
  sourceUrl:"https://www.openstreetmap.org/node/7811161449",correctedAddress:"Jána Hollého 10, 917 01 Trnava, Slovakia",
  precision:"site",
  evidence:Object.freeze(["https://poi.oma.sk/n7811161449"]),
 }),
 "RG-A9687EEF16FC":Object.freeze({
  sourceId:"AO-B39-LOC-SK-393C9FE0F607",name:"Kostol Mena Panny Márie",country:"SK",addressNeedle:"Bratislava",placeId:null,
  lat:48.1472,lng:17.20745,sourceRef:"osm:way:64977390",
  sourceUrl:"https://www.openstreetmap.org/way/64977390",correctedAddress:"Poľnohospodárska 4, Vrakuňa, Bratislava, Slovakia",
  precision:"site",
  evidence:Object.freeze(["https://mapcarta.com/pt/W64977390"]),
 }),
 "RG-5A52F4C1379D":Object.freeze({
  sourceId:"AO-B39-LOC-HU-0EF092BCC855",name:"Szent István-Templom",country:"HU",addressNeedle:"Nagyvázsony",placeId:null,
  lat:46.98846,lng:17.70316,sourceRef:"miserend:1932",
  sourceUrl:"https://miserend.hu/templom/1932",correctedAddress:"Rákóczi u. 27, Nagyvázsony, Hungary",
  precision:"site",
  evidence:Object.freeze(["https://sematizmus.vefleveltar.hu/en/node/32465","https://nagyvazsony.hu/turizmus/latnivalok/szent-istvan-templom-2/"]),
 }),
 "RG-B68-086D5372D517":Object.freeze({
  sourceId:"AO-RSCH-B68-086D5372D517",name:"St. Laurentius — St Joseph altar",country:"DE",addressNeedle:"Jägerstrasse 16",placeId:null,
  lat:49.377453,lng:8.377311,sourceRef:"kirchbau:50267",
  sourceUrl:"https://www.kirchbau.de/300_datenblatt.php?id=50267&name=keiner",correctedAddress:"Jägerstraße 16, 67105 Schifferstadt, Germany",
  precision:"site",reviewScope:"CHURCH_SITE_NOT_SPECIFIC_SIDE_ALTAR",
  evidence:Object.freeze(["https://www.pfarrei-schifferstadt.de/glaube-seelsorge/gottesdienstvielfalt-bei-uns/heilige-messe/"]),
 }),
 "RG-A39E87B5A30C":Object.freeze({
  sourceId:"AO-EUR-GB-008",name:"Brompton Oratory (The London Oratory)",
  country:"GB",addressNeedle:"Brompton Road",placeId:null,
  lat:51.49714,lng:-0.16964,sourceRef:"osm:way:851727368",
  sourceUrl:"https://www.openstreetmap.org/way/851727368",
  evidence:Object.freeze([
   "https://mapcarta.com/W851727368",
   "https://www.bromptonoratory.co.uk/regular-mass-service-times",
  ]),
 }),
 "RG-DA2F4D212252":Object.freeze({
  sourceId:"ORD-GB-OXFORD-ORATORY-ST-ALOYSIUS",
  name:"Oxford Oratory — St Aloysius Gonzaga",
  country:"GB",addressNeedle:"25 Woodstock Road",placeId:null,
  lat:51.75935,lng:-1.26183,sourceRef:"osm:way:65699768",
  sourceUrl:"https://www.openstreetmap.org/way/65699768",
  evidence:Object.freeze([
   "https://mapcarta.com/W65699768",
   "https://www.oxfordoratory.org.uk/mass-times.php",
  ]),
 }),
 "RG-FC7B994D657F":Object.freeze({
  sourceId:"DIO-GB-WESTMINSTER-SPANISHPLACE-ST-JAMES",
  name:"St James's Church, Spanish Place",
  country:"GB",addressNeedle:"22 George Street",placeId:null,
  lat:51.51819,lng:-0.15256,sourceRef:"osm:way:160404637",
  sourceUrl:"https://www.openstreetmap.org/way/160404637",
  evidence:Object.freeze([
   "https://mapcarta.com/W160404637",
   "https://parish.rcdow.org.uk/spanishplace/contact/",
  ]),
 }),
 "RG-EC5A4BA48BF9":Object.freeze({
  sourceId:"ORD-GB-BIRMINGHAM-ORATORY-IMMACULATE-CONCEPTION",
  name:"Birmingham Oratory — Immaculate Conception",
  country:"GB",addressNeedle:"141 Hagley Road",placeId:null,
  lat:52.4723,lng:-1.9288,sourceRef:"historicengland:1076349",
  sourceUrl:"https://historicengland.org.uk/listing/the-list/list-entry/1076349",
  attribution:"Historic England list entry 1076349 · church and Oratory ensemble",
  reviewScope:"CHURCH_AND_ORATORY_COMPLEX_NOT_ENTRANCE",
  evidence:Object.freeze([
   "https://britishlistedbuildings.co.uk/101076349-the-church-of-the-immaculate-conception-the-oratory-the-oratory-priests-house-and-the-former-oratory-school-buildings-ward",
   "https://birminghamoratory.org.uk/contact/",
  ]),
 }),
 "RG-D40A53ED496A":Object.freeze({
  sourceId:"AO-EUR-GB-018",
  name:"Corpus Christi Catholic, Maiden Lane - Shrine of the Blessed Sacrament",
  country:"GB",addressNeedle:"Maiden Lane",placeId:null,
  lat:51.5109,lng:-0.1225,sourceRef:"historicengland:1238978",
  sourceUrl:"https://historicengland.org.uk/listing/the-list/list-entry/1238978",
  attribution:"Historic England list entry 1238978 · church and presbytery",
  reviewScope:"CHURCH_AND_PRESBYTERY_SITE_NOT_ENTRANCE",
  evidence:Object.freeze([
   "https://britishlistedbuildings.co.uk/101238978-corpus-christi-church-and-presbytery-st-jamess-ward",
   "https://corpuschristimaidenlane.org.uk/contact/",
  ]),
 }),
 "RG-EEE45B6A7403":Object.freeze({
  sourceId:"AO-B34-L-GB-9D55FB39FDF9",name:"Buckfast Abbey",
  country:"GB",addressNeedle:"Buckfastleigh",placeId:null,
  lat:50.493,lng:-3.7756,sourceRef:"historicengland:1209774",
  sourceUrl:"https://historicengland.org.uk/listing/the-list/list-entry/1209774",
  attribution:"Historic England list entry 1209774 · Abbey Church of St Mary",
  evidence:Object.freeze([
   "https://gb.britishlistedbuildings.co.uk/101209774-church-of-st-mary-buckfast-abbey-buckfastleigh/maps",
   "https://www.buckfast.org.uk/",
  ]),
 }),

 "RG-00D589BAB16C":Object.freeze({
  sourceId:"ao-fssp-church-of-st-mary-538-broadway-providence-ri-02909-usa",
  name:"Church of St Mary",country:"US",addressNeedle:"538 Broadway",
  placeId:null,lat:41.81761,lng:-71.4367,sourceRef:"osm:way:314290719",
  sourceUrl:"https://www.openstreetmap.org/way/314290719",
  evidence:Object.freeze([
   "https://mapcarta.com/W314290719",
   "https://stmarypvdri.org/contact/",
  ]),
 }),
 "RG-04C900D93BC2":Object.freeze({
  sourceId:"AO-EUR-GB-006",name:"Bournemouth Oratory",
  country:"GB",addressNeedle:"1 Albert Road",placeId:null,
  lat:50.72097,lng:-1.87861,sourceRef:"osm:way:128316070",
  sourceUrl:"https://www.openstreetmap.org/way/128316070",
  evidence:Object.freeze([
   "https://mapcarta.com/W128316070",
   "https://www.bournemouthoratory.org.uk/contact-us/",
  ]),
 }),
 "RG-4D711E72B9F0":Object.freeze({
  sourceId:"DIO-GB-EASTANGLIA-NORWICH-CATHEDRAL",
  name:"Cathedral of St John the Baptist, Norwich",
  country:"GB",addressNeedle:"Earlham Road",placeId:null,
  lat:52.62902,lng:1.28381,sourceRef:"osm:way:97370578",
  sourceUrl:"https://www.openstreetmap.org/way/97370578",
  evidence:Object.freeze([
   "https://mapcarta.com/es/W97370578",
   "https://historicengland.org.uk/listing/the-list/list-entry/1051299",
  ]),
 }),
 "RG-40584CA8DAE1":Object.freeze({
  sourceId:"AO-B33-L-US-D5047631A0B7",
  name:"Our Lady of Clear Creek Abbey",
  country:"US",addressNeedle:"5804 W Monastery Rd",placeId:null,
  lat:36.03363,lng:-95.19587,sourceRef:"osm:way:242465722",
  sourceUrl:"https://www.openstreetmap.org/way/242465722",
  precision:"site",reviewScope:"MONASTERY_COMPLEX_NOT_CHURCH_ENTRANCE",
  evidence:Object.freeze([
   "https://mapcarta.com/W242465722",
   "https://clearcreekmonks.org/contact/",
  ]),
 }),
 "RG-16C25083C6C7":Object.freeze({
  sourceId:"ao-icksp-st-mary-oratory-517-elm-st-rockford-il-61102-6",
  name:"St. Mary Oratory",country:"US",addressNeedle:"517 Elm St",
  placeId:null,lat:42.27224,lng:-89.09816,sourceRef:"geonames:4909682",
  sourceUrl:"https://mapcarta.com/22165042",
  correctedAddress:"126 S Winnebago St, Rockford, IL 61102",
  precision:"site",reviewScope:"CHURCH_SITE_NOT_VERIFIED_ENTRANCE",
  attribution:"GeoNames named church site · church location independently checked",
  evidence:Object.freeze([
   "https://www.rockforddiocese.org/parishes/parish-information/?parish=80",
   "https://mapcarta.com/22165042",
   "https://gcatholic.org/churches/usa-07/30865",
  ]),
 }),

 "RG-2E1FB8361143":Object.freeze({
  sourceId:"AO-B35-L-GB-BF86E1483C54",name:"St Mary's Church",
  country:"GB",addressNeedle:"Smith Street",placeId:null,
  lat:53.38963,lng:-2.5889,sourceRef:"osm:way:749035677",
  sourceUrl:"https://www.openstreetmap.org/way/749035677",
  evidence:Object.freeze([
   "https://mapcarta.com/W749035677",
   "https://fssp.org.uk/warrington/",
  ]),
 }),
 "RG-3E26F1928075":Object.freeze({
  sourceId:"AO-B36-L-GB-7FBD70FF3B8C",
  name:"Lanherne Convent Chapel",country:"GB",addressNeedle:"St Mawgan",
  placeId:null,lat:50.4544,lng:-4.9994,precision:"site",
  reviewScope:"CONVENT_SITE_NOT_CHAPEL_ENTRANCE",
  sourceRef:"historicengland:1144134",
  sourceUrl:"https://gb.britishlistedbuildings.co.uk/101144134-lanherne-carmelite-convent-mawgan-in-pydar/maps",
  attribution:"Historic England listed building 1144134 · convent campus",
  evidence:Object.freeze([
   "https://icksp.org.uk/cornwall/support-our-apostolates-in-devon-and-cornwall/",
   "https://historicengland.org.uk/listing/the-list/list-entry/1144134",
  ]),
 }),
 "RG-43C77660C303":Object.freeze({
  sourceId:"AO-B34-L-GB-43BCEF5411CB",name:"Douai Abbey",
  country:"GB",addressNeedle:"Reading",placeId:null,
  lat:51.41,lng:-1.1717,sourceRef:"historicengland:1156252",
  sourceUrl:"https://britishlistedbuildings.co.uk/101156252-douai-abbey-church-woolhampton/maps",
  attribution:"Historic England listed building 1156252 · church",
  evidence:Object.freeze([
   "https://historicengland.org.uk/listing/the-list/list-entry/1156252",
   "https://lms.org.uk/list-of-churches",
  ]),
 }),
 "RG-2E17819D4F3E":Object.freeze({
  sourceId:"AO-B51-FR-70ECC3A856F3",
  name:"Abbaye canoniale Sainte-Marie de Lagrasse",country:"FR",
  addressNeedle:"Lagrasse",placeId:null,
  lat:43.09034,lng:2.61682,sourceRef:"osm:way:422967480",
  sourceUrl:"https://www.openstreetmap.org/way/422967480",
  evidence:Object.freeze([
   "https://mapcarta.com/W422967480",
   "https://www.lagrasse.org/decouvrir-labbaye/horaires-des-offices/",
  ]),
 }),
 "RG-01F176BB1074":Object.freeze({
  sourceId:"AO-B35-L-GB-91CDCC69A421",name:"Westminster Cathedral",
  country:"GB",addressNeedle:"London",placeId:"place:GB:westminster-cathedral",
  lat:51.49582,lng:-0.13952,sourceRef:"osm:way:10810446",
  sourceUrl:"https://www.openstreetmap.org/way/10810446",
  evidence:Object.freeze([
   "https://mapcarta.com/36313110",
   "https://westminstercathedral.org.uk/",
  ]),
 }),
 "RG-02AEBA830666":Object.freeze({
  sourceId:"AO-B34-L-GB-D2A6AB6CE828",name:"Downside Abbey",
  country:"GB",addressNeedle:"Radstock",placeId:null,
  lat:51.2557,lng:-2.49561,sourceRef:"osm:way:208920439",
  sourceUrl:"https://www.openstreetmap.org/way/208920439",
  evidence:Object.freeze([
   "https://mapcarta.com/36304310",
   "https://downsideabbey.co.uk/",
  ]),
 }),
 "RG-126045360426":Object.freeze({
  sourceId:"AO-B34-L-GB-C9EB4357C73A",name:"Belmont Abbey",
  country:"GB",addressNeedle:"Hereford",placeId:null,
  lat:52.03933,lng:-2.75637,sourceRef:"osm:way:66739205",
  sourceUrl:"https://www.openstreetmap.org/way/66739205",
  evidence:Object.freeze([
   "https://mapcarta.com/W66739205",
   "https://www.belmontabbey.org.uk/",
  ]),
 }),
 "RG-233BF6946735":Object.freeze({
  sourceId:"AO-B35-L-GB-202B59F268FE",name:"St Michael's Abbey",
  country:"GB",addressNeedle:"Farnborough",placeId:null,
  lat:51.29716,lng:-0.74965,sourceRef:"osm:way:512065892",
  sourceUrl:"https://www.openstreetmap.org/way/512065892",
  evidence:Object.freeze([
   "https://mapcarta.com/W512065892",
   "https://farnboroughabbey.org/visiting",
  ]),
 }),
 "RG-119C7FEEF74A":Object.freeze({
  sourceId:"AO-B33-L-FR-F0AF6F2DC54B",name:"Abbaye Sainte-Madeleine du Barroux",
  country:"FR",addressNeedle:"1201 chemin des Rabassières",
  placeId:null,lat:44.15182,lng:5.09845,sourceRef:"osm:way:85350528",
  sourceUrl:"https://www.openstreetmap.org/way/85350528",
  evidence:Object.freeze([
   "https://mapcarta.com/fr/W85350528",
   "https://www.barroux.org/",
  ]),
 }),
 "RG-3991DD293F9C":Object.freeze({
  sourceId:"AO-B51-FR-92914B534B3A",
  name:"Abbaye Notre-Dame de l’Annonciation du Barroux",
  country:"FR",addressNeedle:"750 chemin des Ambrosis",
  placeId:null,lat:44.15639,lng:5.11822,sourceRef:"osm:way:337377568",
  sourceUrl:"https://www.openstreetmap.org/way/337377568",
  evidence:Object.freeze([
   "https://mapcarta.com/fr/W337377568",
   "https://annonciation.fr/",
  ]),
 }),
 "RG-03C2AD02BC81":Object.freeze({
  sourceId:"AO-B50-SSPV-US-FC03F5009C8",name:"Immaculate Heart of Mary Church",
  country:"US",addressNeedle:"2200 Smelter Ave",placeId:null,
  lat:47.5244,lng:-111.27331,sourceRef:"osm:node:9251507643",
  sourceUrl:"https://www.openstreetmap.org/node/9251507643",
  evidence:Object.freeze([
   "https://mapcarta.com/23662928",
   "https://stpiusvchapel.org/mass-locations/",
  ]),
 }),
 "RG-0611CE5E7367":Object.freeze({
  sourceId:"AO-B51-FR-782F8A2B2031",name:"Monastère Saint-Benoît",
  country:"FR",addressNeedle:"4763 route Théodore Linari",placeId:null,
  lat:43.41996,lng:6.12229,sourceRef:"osm:node:12702212301",
  sourceUrl:"https://www.openstreetmap.org/node/12702212301",
  evidence:Object.freeze([
   "https://mapcarta.com/fr/N12702212301",
   "https://www.monasterebrignoles.org/contact.html",
  ]),
 }),
 "RG-02EBA275AC72":Object.freeze({
  sourceId:"AO-B50-CMRI-US-C169C047AC2",name:"Most Holy Rosary Church",country:"US",
  addressNeedle:"314 E Main St",placeId:null,
  lat:42.71278,lng:-85.46250,precision:"site",
  sourceRef:"usgs:gnis:2572764",
  sourceUrl:"https://topoquest.com/map/usgs-24k/michigan/middleville/29132",
  attribution:"USGS Geographic Names Information System · named church site",
  evidence:Object.freeze([
   "https://www.mostholyrosarycmri.org/",
   "https://churcheslist.com/most-holy-rosary-church-2",
  ]),
 }),
 "RG-03AE4CE86D2B":Object.freeze({
  sourceId:"AO-B56-US-5EF870DC7969",name:"Blessed Sacrament Church — Martinez",
  country:"US",addressNeedle:"1150 Mellus St",placeId:null,
  lat:38.016898,lng:-122.130969,precision:"address",
  reviewScope:"ADDRESS_POINT_NOT_ENTRANCE",
  sourceRef:"churcheslist:blessed-sacrament-church-45",
  sourceUrl:"https://churcheslist.com/blessed-sacrament-church-45",
  attribution:"ChurchesList · approximate public street-address coordinate",
  evidence:Object.freeze([
   "https://martinezchamber.com/wp-content/uploads/RelocationGuideJune2015.pdf",
   "https://romancatholicinstitute.org/mass-centers/",
  ]),
 }),
 "RG-B65-C4264A1A8340":Object.freeze({
  sourceId:"AO-RSCH-B65-C4264A1A8340",name:"St Antonius",country:"CH",
  addressNeedle:"Kannenfeldstrasse 35",placeId:null,
  lat:47.5638664,lng:7.572879,sourceRef:"osm:way:266520642",
  sourceUrl:"https://www.openstreetmap.org/way/266520642",
  evidence:Object.freeze([
   "https://www.antoniuskirche.ch/kontakt",
   "https://www.antoniuskirche.ch/agenda?ShowStart=109&category=A1B328W5&instanceId=HC39P2DA&location=all&startDate=04.09.2026",
  ]),
 }),
 "RG-2447873BB8F5":Object.freeze({
  sourceId:"AO-B41-LOC-IT-8584201FAF73",
  name:"Seminario Internazionale San Filippo Neri",
  country:"IT",addressNeedle:"Via di Gricigliano 52",
  placeId:null,
  lat:43.8033638,lng:11.3799351,sourceRef:"osm:way:848071308",
  sourceUrl:"https://www.openstreetmap.org/way/848071308",
  evidence:Object.freeze([
   "https://mapcarta.com/W848071308",
   "https://www.icrsp.org/Publicationsbis/Publications-italiennes/Bollettino68.pdf",
  ]),
 }),
 "RG-54863B401267":Object.freeze({
  sourceId:"AO-B40-LOC-BE-7CC60D5F039A",
  name:"Chapelle Sainte-Rita",country:"BE",
  addressNeedle:"Rue de la Savatte 10",
  placeId:null,
  lat:50.5357494,lng:3.5450717,sourceRef:"osm:way:962673284",
  sourceUrl:"https://www.openstreetmap.org/way/962673284",
  evidence:Object.freeze([
   "https://icrspfrance.fr/?org=11499",
   "https://streets.openalfa.be/streets/rue-de-la-savatte-brasmenil-peruwelz",
  ]),
 }),
 "RG-B65-EF400B6F8E93":Object.freeze({
  sourceId:"AO-RSCH-B65-EF400B6F8E93",
  name:"Franziskanerkirche",country:"DE",
  addressNeedle:"An den Neißewiesen 91",
  placeId:null,
  lat:51.1252861,lng:14.9862707,sourceRef:"osm:way:139932554",
  sourceUrl:"https://www.openstreetmap.org/way/139932554",
  evidence:Object.freeze([
   "https://petrusbruderschaft.de/pages/wo-wir-sind/deutschland/messorte.php",
   "https://www.fssp.org/en/find-us/where-are-we/",
  ]),
 }),
 "RG-B65-AFB4955D79E8":Object.freeze({
  sourceId:"AO-RSCH-B65-AFB4955D79E8",name:"Kerzenkapelle",
  country:"DE",addressNeedle:"Kapellenplatz",placeId:"place:DE:kevelaer-kerzenkapelle",
  lat:51.58389,lng:6.24377,sourceRef:"osm:way:152838071",
  sourceUrl:"https://www.openstreetmap.org/way/152838071",
  evidence:Object.freeze([
   "https://mapcarta.com/de/W152838071",
   "https://www.wallfahrt-kevelaer.de/gottesdienste/sommer-und-winterordnung",
  ]),
 }),
 "RG-B69-3A43E996D0D9":Object.freeze({
  sourceId:"AO-RSCH-B69-3A43E996D0D9",name:"Wallfahrtskirche Maria Vesperbild",
  country:"DE",addressNeedle:"Schellenbacher Straße 4",
  placeId:"place:DE:maria-vesperbild",
  lat:48.2798,lng:10.54221,sourceRef:"osm:way:100214876",
  sourceUrl:"https://www.openstreetmap.org/way/100214876",
  evidence:Object.freeze([
   "https://mapcarta.com/de/W100214876",
   "https://bistum-augsburg-portal.de/pfarreien/maria-vesperbild-wallfahrtsdirektion-mariae-schmerzen",
  ]),
 }),
});
const family=(aff,mapAffiliation)=>{
 const group=mapAffiliation?.(aff,"UNKNOWN");
 return T(group)||"OTHER";
};
export function validateCL2PhysicalIndex(index){
 if(index?.schema!=="AO_CL2_PHYSICAL_SITE_RUNTIME_INDEX_V1"||
   !Array.isArray(index.records)||index.records.length!==CL2_PHYSICAL_SITE_COUNT||
   index.counts?.effective_physical_sites!==CL2_PHYSICAL_SITE_COUNT)
   throw new Error("Invalid CL2 effective-physical-site directory index");
 const seen=new Set(),sourceOwners=new Map();
 for(const row of index.records){
  if(!Array.isArray(row)||row.length!==7||!/^RG-[A-Z0-9-]+$/.test(T(row[0]))||
    seen.has(row[0])||!Array.isArray(row[1])||!row[1].length||
    !T(row[2])||!/^[A-Z]{2}$/.test(T(row[3]))||
    !Array.isArray(row[6])||row[6].some(u=>!validUrl(u)))
    throw new Error("Invalid CL2 source-owned physical-site row");
  seen.add(row[0]);
  for(const source of row[1]){
   if(!T(source))throw new Error("Empty physical-site source identity");
   if(sourceOwners.has(source)&&sourceOwners.get(source)!==row[0])
    throw new Error("One source ID maps to multiple physical sites: "+source);
   sourceOwners.set(source,row[0]);
  }
 }
 return index;
}
/**
 * Reuse the existing R49 map coordinates and exact-photo source identifiers.
 * Admit missing CL2 groups as list-only research candidates. Do not geocode,
 * synthesize a schedule, or infer an institute's liturgy or ecclesial position.
 * The three separately approved additions remain distinct pending CL2 matching.
 */
export function projectCL2PhysicalDirectory(baseItems,index,{mapAffiliation}={}){
 validateCL2PhysicalIndex(index);
 const base=Array.isArray(baseItems)?baseItems:[];
 const sourceToItem=new Map();
 for(const item of base)if(item?.source_id)sourceToItem.set(item.source_id,item);
 const claimed=new Set(),result=[];let matched=0,unmapped=0,absorbedAliasRows=0;
 const list=Array.isArray(index.records)?index.records:[];
 for(const row of list){
  const [anchor,sourceIds,name,country,description,affiliation,sourceUrls]=row;
  const exact=unique(sourceIds.map(id=>sourceToItem.get(id)).filter(Boolean));
  const linked=exact.sort((a,b)=>
   Number(Boolean(b.geo?.precision==="building"))-Number(Boolean(a.geo?.precision==="building")));
  const selected=linked[0]??null;
  const review=REVIEWED_SITE_GEO_SOURCES[anchor]??null;
  const newPin=REVIEWED_NEW_SITE_PINS[anchor]??null;
  const siteGeoSource=review?linked.find(x=>x.source_id===review.sourceId):null;
  if(review&&(!selected||!sourceIds.includes(review.sourceId)||
     !siteGeoSource?.geo||!Number.isFinite(siteGeoSource.geo.lat)||
     !Number.isFinite(siteGeoSource.geo.lng)||review.evidence.some(x=>!https(x))))
    throw new Error("Unverifiable CL2 site coordinate adjudication: "+anchor);
  // A reviewed source-site marker can refine an existing R49 point as well as
  // add geometry for a previously list-only CL2 physical site. Validate its
  // exact source row before either operation.
  if(newPin&&(!sourceIds.includes(newPin.sourceId)||T(name)!==newPin.name||
     country!==newPin.country||!T(description).includes(newPin.addressNeedle)||
     (newPin.placeId&&!newPin.placeId.startsWith("place:"+country+":"))||
     !Number.isFinite(newPin.lat)||Math.abs(newPin.lat)>90||
     !Number.isFinite(newPin.lng)||Math.abs(newPin.lng)>180||
     !/^(?:osm:(?:way|node):\d+|usgs:gnis:\d+|geonames:\d+|rijksmonument:\d+|miserend:\d+|kirchbau:\d+|odtur:\d+|turismoroma:\d+|independent:firenze-loggiato-san-francesco-poverino|heritage:pamiatkynaslovensku:leonarda-dolany|independent:sacristan-san-roque-santiago|commons:object-location:[a-z0-9-]+|churcheslist:[a-z0-9-]+|historicengland:\d+)$/.test(newPin.sourceRef)||
     !https(newPin.sourceUrl)||newPin.evidence.some(url=>!https(url))))
    throw new Error("CL2 reviewed pin no longer matches source identity: "+anchor);
  const source_links=unique([...(review?.evidence??[]),
    ...(linked.flatMap(item=>(item.source_links??[]).map(s=>s.url))),
    ...sourceUrls,...(newPin?.evidence??[]),...(newPin?[newPin.sourceUrl]:[])].filter(url=>https(url))).slice(0,12).map((url,i)=>Object.freeze({
     id:anchor+"-source-"+i,title:i===0?"Original listing":"Additional research source",
     issuer:"CL2 physical-site sources",url
    }));
  const search_text=normal([name,country,description,affiliation,...sourceIds,
    ...linked.flatMap(item=>[item.title,item.subtitle,item.eyebrow,item.search_text])].join(" "));
  if(selected){
   for(const a of linked)claimed.add(a.item_id);
   absorbedAliasRows+=Math.max(0,linked.length-1);
   matched++;
   // Transfer the independently corroborated *existing source point* only,
   // never the source's venue identity, timetable or implied entrance accuracy.
   const siteGeo=review?Object.freeze({...selected.geo,
    lat:siteGeoSource.geo.lat,lng:siteGeoSource.geo.lng,
    precision:"source_marker_unassessed",approximate:true,
    source_ref:review.sourceId,source_url:review.evidence[0],
    review_scope:"PHYSICAL_CHURCH_NOT_ENTRANCE",
   }):newPin?Object.freeze({...selected.geo,
    lat:newPin.lat,lng:newPin.lng,precision:newPin.precision||"site",
    approximate:true,source_ref:newPin.sourceRef,source_url:newPin.sourceUrl,
    attribution:newPin.attribution||"© OpenStreetMap contributors · ODbL 1.0",
    review_scope:newPin.reviewScope||"PHYSICAL_CHURCH_NOT_ENTRANCE",
   }):selected.geo;
   result.push(Object.freeze({...selected,
    ...(review||newPin?{
     geo:siteGeo,
     address:Object.freeze({formatted:newPin?.correctedAddress||T(description)}),
     note:T(selected.note)+" Site marker cross-checked against the physical church site, not a verified entrance."+
      (newPin?.correctedAddress?" Source-master address was a mailing address; corrected visitor church address used.":""),
    }:{}),
    physical_group_id:anchor,source_ids:Object.freeze([...sourceIds]),
    physical_site_source:"CL2_MASTER",source_links:Object.freeze(source_links),
    search_text,affiliation_scope:"SOURCE_LABEL_ONLY",
   }));
  }else{
   unmapped++;
   const affiliationName=T(affiliation)||"Source affiliation not established";
   const community_id=family(affiliationName,mapAffiliation);
   result.push(Object.freeze({
    item_id:"tlm:cl2:"+anchor,source_id:sourceIds[0],
    physical_group_id:anchor,source_ids:Object.freeze([...sourceIds]),
    physical_site_source:"CL2_MASTER",lens:"tlm",kind:"TLM_VENUE",
    community_id,preliminary_group:"UNKNOWN",affiliation_scope:"SOURCE_LABEL_ONLY",
    eyebrow:affiliationName,status:"RESEARCH-LISTED · MASS UNVERIFIED",
    title:T(name),subtitle:[newPin?.correctedAddress||T(description),country].filter(Boolean).join(" · "),
    summary:"Physical site recorded in the research master. Current traditional Mass use, the minister, liturgical books and timetable have not been independently verified.",
    address:{formatted:newPin?.correctedAddress||T(description)||country},
    geo:newPin?Object.freeze({
     lat:newPin.lat,lng:newPin.lng,precision:newPin.precision||"site",approximate:true,
     attribution:newPin.attribution||"© OpenStreetMap contributors · ODbL 1.0",
     source_ref:newPin.sourceRef,source_url:newPin.sourceUrl,
     review_scope:newPin.reviewScope||"PHYSICAL_CHURCH_NOT_ENTRANCE",
    }):null,
    map_publishable:Boolean(newPin),
    map_state:newPin?"PROVISIONAL":"ADDRESS_ONLY",facts:Object.freeze([
     {label:"Source identity",value:"CL2 physical-site master · "+anchor},
     ...(newPin?[{label:"Map position",value:newPin.reviewScope==="MONASTERY_COMPLEX_NOT_CHURCH_ENTRANCE"?
       "Reviewed monastery complex · church entrance not independently verified":
       "Reviewed church site · entrance not independently verified"}]:[]),
     {label:"Affiliation",value:affiliationName+" (source label only)"},
     {label:"Mass times",value:"Unverified · no timetable published"},
    ]),sections:Object.freeze([]),actions:Object.freeze([]),
    source_links:Object.freeze(source_links),
    note:"Research-listed site, not a confirmed current Mass venue. Source affiliation does not establish the celebrant, Una Cum, missal, rite, or official ministry. Verify locally before travelling."+
     (newPin?" Physical site geometry sourced from "+(newPin.placeId||newPin.sourceRef)+"; entrance and Mass use are unverified.":"")+
     (newPin?.correctedAddress?(anchor==="RG-16C25083C6C7"?" The research-master address is a mailing address; church location follows the independently verified church street address.":" The incomplete research-master address is supplemented by independently corroborated building-location evidence."):""),
    search_text,
   }));
  }
 }
 const extra=base.filter(item=>!claimed.has(item.item_id));
 // Only the three approved, non-CL2 additions may survive outside this master.
 if(matched!==CL2_EXPECTED_R49_GROUPS||unmapped!==CL2_EXPECTED_NEW_GROUPS||
   absorbedAliasRows!==35||extra.length!==3||
   extra.some(item=>!T(item.item_id).startsWith("tlm:published-provisional:")))
  throw new Error("CL2/Explore physical-site reconciliation changed: "+
   JSON.stringify({matched,unmapped,absorbedAliasRows,extra:extra.length}));
 return Object.freeze([...result,...extra]);
}
