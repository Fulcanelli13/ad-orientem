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
 // Batch 5 (Nov 2026): individually named Catholic church/monastic site coordinates,
 // never an entrance-level, current-Mass, rite or photograph-rights assertion.
 "RG-2ED9EF0BE3AB":Object.freeze( {sourceId:"AO-B37-L-DE-A2672DD83BA3",name:"Klosterkirche Maria Königin der Engel",country:"DE",addressNeedle:"Klosterhof 1",placeId:null,
  lat:48.003687,lng:10.594695,precision:"site",sourceRef:"independent:outdooractive-bad-woerishofen-klosterkirche",sourceUrl:"https://www.outdooractive.com/de/poi/allgaeu/klosterkirche-maria-koenigin-der-engel-in-bad-woerishofen/9421356/",
  correctedAddress:"Klosterkirche Maria Königin der Engel, Klosterhof 1, 86825 Bad Wörishofen, Germany",reviewScope:"BAD_WOERISHOFEN_NAMED_MONASTERY_CHURCH_KLOSTERHOF_NOT_NEARBY_HAUPTSTRASSE_CHURCH",
  evidence:Object.freeze(["https://mapcarta.com/de/W196830533","https://petrusbruderschaft.de/pages/wo-wir-sind/deutschland/messorte.php"])}),
 "RG-480FA8AC1FF9":Object.freeze( {sourceId:"AO-B37-L-AT-5391593B2CFE",name:"St. Radegundis",country:"AT",addressNeedle:"Katzelsdorf",placeId:null,
  lat:47.76921,lng:16.27334,precision:"site",sourceRef:"independent:commons-katzelsdorf-radegundiskirche-object",sourceUrl:"https://commons.wikimedia.org/wiki/File:Katzelsdorf_-_Pfarrkirche_(04).JPG",
  correctedAddress:"Pfarrkirche St. Radegundis, Eichbüchler Straße 97, 2801 Katzelsdorf, Austria",reviewScope:"KATZELSDORF_KATHOLISCHE_RADEGUNDISKIRCHE_PHOTOGRAPHED_OBJECT_NOT_REDDEMPTORISTENKLOSTER_OR_ANNAKAPELLE",
  evidence:Object.freeze(["https://www.wieneralpen.at/en/excursions/pfarrkirche-katzelsdorf","https://commons.wikimedia.org/wiki/Category:Radegundiskirche_(Katzelsdorf)"])}),
 "RG-5B9D15810FF7":Object.freeze( {sourceId:"AO-B33-L-FR-6CE8D8950597",name:"Abbaye Notre-Dame de Randol",country:"FR",addressNeedle:"Randol",placeId:null,
  lat:45.643333,lng:3.073056,precision:"site",sourceRef:"independent:commons-randol-abbey-object",sourceUrl:"https://commons.wikimedia.org/wiki/Category:Abbaye_Notre-Dame_de_Randol",
  correctedAddress:"Abbaye Notre-Dame de Randol, 285 route de Randol, 63450 Cournols, France",reviewScope:"COURNOLS_RANDOL_NAMED_BENEDICTINE_ABBEY_CAMPUS_NOT_VILLAGE_CENTER_OR_UNVERIFIED_DOOR",
  evidence:Object.freeze(["https://randol.org/","https://www.cirkwi.com/en/point-interet/2146400-notre-dame-de-randol-abbey","https://fr.wikipedia.org/wiki/Abbaye_Notre-Dame_de_Randol"])}),
 "RG-3A09AD57156D":Object.freeze( {sourceId:"AO-B51-FR-F2BCE7B9D444",name:"Abbaye Notre-Dame du Pesquié",country:"FR",addressNeedle:"Pesquié",placeId:null,
  lat:42.9761,lng:1.53628,precision:"site",sourceRef:"independent:foix-tourisme-abbaye-pesquie",sourceUrl:"https://www.cirkwi.com/fr/point-interet/4100396-abbaye-du-pesquie",
  correctedAddress:"Abbaye Notre-Dame du Pesquié, Le Pesquié, 09000 Serres-sur-Arget, France",reviewScope:"SERRES_SUR_ARGet_NAMED_BENEDICTINE_ABBEY_SITE_NOT_ARIEGE_TOWN_CENTER_OR_ENTRANCE",
  evidence:Object.freeze(["https://abbaye-pesquie.org/nous-conctacter/","https://www.wikidata.org/wiki/Q2820338"])}),
 "RG-1E9390D57492":Object.freeze( {sourceId:"AO-B51-FR-A37A06B3C2B2",name:"Abbaye Notre-Dame de Miséricorde",country:"FR",addressNeedle:"1388 chemin de Baudon",placeId:null,
  lat:44.392858,lng:5.471053,precision:"site",sourceRef:"independent:hautes-alpes-abbaye-rosans-object",sourceUrl:"https://fr.wikipedia.org/wiki/Liste_des_%C3%A9glises_des_Hautes-Alpes",
  correctedAddress:"Abbaye Notre-Dame de Miséricorde, 1388 chemin de Baudon, 05150 Rosans, France",reviewScope:"ROSANS_BAUDON_NAMED_BENEDICTINE_ABBEY_NOT_PARISH_SAINT_JACQUES_OR_TOWN_CENTROID",
  evidence:Object.freeze(["https://www.abbayederosans.fr/contact-acces/","https://dossiersinventaire.maregionsud.fr/dossier/IA05001650"])}),
 "RG-5E659B85328D":Object.freeze( {sourceId:"AO-B52-FR-4D883BA8C7B5",name:"Couvent de la Haye-aux-Bonshommes — Dominican Mass chapel",country:"FR",addressNeedle:"6 allée Saint-Dominique",placeId:null,
  lat:47.48976,lng:-0.59764,precision:"site",sourceRef:"osm:way:800361611",sourceUrl:"https://www.openstreetmap.org/way/800361611",
  correctedAddress:"Couvent de la Haye-aux-Bonshommes, 6 allée Saint-Dominique, 49240 Avrillé, France",reviewScope:"AVRILLE_HAYE_AUX_BONSHOMMES_NAMED_DOMINICAN_MONASTERY_CAMPUS_NOT_ADJACENT_SAINT_JOSEPH",
  evidence:Object.freeze(["https://mapcarta.com/fr/W800361611","https://www.dominicainsavrille.fr/contact-2/"])}),
 "RG-61EFC50EC7F8":Object.freeze( {sourceId:"AO-B51-FR-E576152D5DEE",name:"Couvent Saint-Thomas-d’Aquin — Fraternité Saint-Vincent-Ferrier",country:"FR",addressNeedle:"2 route de Ballée",placeId:null,
  lat:47.97612,lng:-0.44119,precision:"site",sourceRef:"osm:way:320706860",sourceUrl:"https://www.openstreetmap.org/way/320706860",
  correctedAddress:"Couvent Saint-Thomas-d'Aquin, 2 route de Ballée, 53340 Chémeré-le-Roi, France",reviewScope:"CHEMERE_LE_ROI_COuVENT_SAINT_THOMAS_NAMED_MONASTERY_NOT_SAINT_VINCENT_FERRIER_POSTAL_CENTER",
  evidence:Object.freeze(["https://mapcarta.com/es/W320706860","https://annuaire-entreprises.data.gouv.fr/etablissement/39837844800011"])}),
 "RG-035CA16C89AF":Object.freeze( {sourceId:"AO-B39-LOC-IT-63FB0E8563C4",name:"Chiesa di Cristo Re",country:"IT",addressNeedle:"Timau",placeId:null,
  lat:46.58318073226,lng:13.00372357097,precision:"site",sourceRef:"independent:hike-uno-chiesa-cristo-re-timau",sourceUrl:"https://www.hike.uno/point/church/chiesa_di_cristo_re/68487",
  correctedAddress:"Chiesa di Cristo Re, Via San Pio X 4, Timau, 33026 Paluzza (UD), Italy",reviewScope:"TIMAU_CHIESA_CRISTO_RE_NOT_SANTISSIMO_CROCIFISSO_OSSARIO_OR_SANTA_GERTRUDE",
  evidence:Object.freeze(["https://www.scoprifvg.it/site/chiesa-del-cristo-re/","https://www.comune.paluzza.ud.it/it/novita-207819/notizie-207820/luoghi-di-culto-3747"])}),
 "RG-2D593D4D9BB5":Object.freeze( {sourceId:"AO-B39-LOC-IT-363FD3500B82",name:"Santuario del Santissimo Crocifisso Ossario",country:"IT",addressNeedle:"Timau",placeId:null,
  lat:46.584925,lng:12.991861,precision:"site",sourceRef:"independent:italian-encyclopedia-tempio-ossario-timau",sourceUrl:"https://it.wikipedia.org/wiki/Chiesa_del_Santissimo_Crocifisso_(Timau)",
  correctedAddress:"Tempio Ossario del Santissimo Crocifisso, Via Don Titta Bulfon, Timau, 33026 Paluzza (UD), Italy",reviewScope:"TIMAU_DISTINCT_SANTISSIMO_CROCIFISSO_OSSARIO_NOT_CRISTO_RE_NEW_CHURCH",
  evidence:Object.freeze(["https://www.turismofvg.it/code/109475/Ossario-di-Timau","https://www.diocesiudine.it/wd-annuario-enti/arcidiocesi-di-udine-200/forania-della-montagna-1672/cp-di-paluzza-1712/timau-393/"])}),
 "RG-4409970DC6EA":Object.freeze( {sourceId:"AO-B39-LOC-IT-0A843181A7C2",name:"Duomo di Santa Maria Annunziata",country:"IT",addressNeedle:"Paluzza",placeId:null,
  lat:46.530722,lng:13.017875,precision:"site",sourceRef:"independent:italian-encyclopedia-chiesa-santa-maria-paluzza",sourceUrl:"https://it.wikipedia.org/wiki/Chiesa_di_Santa_Maria_(Paluzza)",
  correctedAddress:"Duomo di Santa Maria Annunziata, 33026 Paluzza (UD), Italy",reviewScope:"PALUZZA_DUOMO_SANTA_MARIA_ANNUNZIATA_NOT_UDINE_CATHEDRAL_OR_SAN_DANIELE",
  evidence:Object.freeze(["https://www.unavoceitalia.org/wordpress/messe/4925-2/","https://en.carniarmonie.it/places/"])}),
 "RG-15277DF09583":Object.freeze( {sourceId:"AO-B39-LOC-IT-781F1BB12042",name:"Chiesa di San Floriano",country:"IT",addressNeedle:"Cella",placeId:null,
  lat:46.4182889,lng:12.5815778,precision:"site",sourceRef:"independent:commons-san-floriano-cella-object",sourceUrl:"https://commons.wikimedia.org/wiki/Category:San_Floriano_(Cella,_Forni_di_Sopra)",
  correctedAddress:"Chiesa di San Floriano, via Nazionale, Cella, 33024 Forni di Sopra (UD), Italy",reviewScope:"CELLA_FORNI_DI_SOPRA_SAN_FLORIANO_CHURCH_NOT_CELLA_IN_PALUZZA",
  evidence:Object.freeze(["https://it.wikipedia.org/wiki/Chiesa_di_San_Floriano_(Cella,_Forni_di_Sopra)","https://www.outdooractive.com/it/poi/carnia/chiesa-di-san-floriano/807838357/"])}),
 "RG-6EB2E73F3DCD":Object.freeze( {sourceId:"AO-B39-LOC-IT-33D0E1BE9B14",name:"Santuario della Madonna della Salute",country:"IT",addressNeedle:"Forni di Sopra",placeId:null,
  lat:46.4220917,lng:12.5819056,precision:"site",sourceRef:"independent:commons-madonna-salute-vico-object",sourceUrl:"https://commons.wikimedia.org/wiki/Category:Madonna_della_Salute_(Vico,_Forni_di_Sopra)",
  correctedAddress:"Santuario della Madonna della Salute, Via Madonna della Salute, Vico, 33024 Forni di Sopra (UD), Italy",reviewScope:"VICO_FORNI_DI_SOPRA_MADONNA_DELLA_SALUTE_SHRINE_NOT_SAN_FLORIANO_CELLA",
  evidence:Object.freeze(["https://fornidisopra.it/scopri/musei/chiese-forni-di-sopra","https://www.unavoceitalia.org/wordpress/messe/4925-2/"])}),
 "RG-F349033BCAB4":Object.freeze( {sourceId:"AO-B39-LOC-IT-35CBFA669B98",name:"Chiesa di San Vito",country:"IT",addressNeedle:"Andrazza",placeId:null,
  lat:46.4111972,lng:12.5886056,precision:"site",sourceRef:"independent:commons-san-vito-andrazza-object",sourceUrl:"https://commons.wikimedia.org/wiki/Category:San_Vito_(Andrazza,_Forni_di_Sopra)",
  correctedAddress:"Chiesa dei Santi Vito, Modesto e Crescenzia, Via Venezia, Andrazza, 33024 Forni di Sopra (UD), Italy",reviewScope:"ANDRAZZA_SAN_VITO_MODESTO_CRESCENZIA_CHURCH_NOT_FORNI_DI_SOPRA_MAIN_PARISH",
  evidence:Object.freeze(["https://it.wikipedia.org/wiki/Chiesa_dei_Santi_Vito,_Modesto_e_Crescenzia_(Andrazza)","https://www.unavoceitalia.org/wordpress/messe/4925-2/"])}),
 // Batch 4 · independently located physical Catholic places (AT/BE/CH/FR/PL/US).
 // Building/site geometry only: not evidence of a particular traditional Mass.
 "RG-528AB7046C4C":Object.freeze({sourceId:"AO-B37-L-AT-10514C7E9020",name:"Minoritenkirche",country:"AT",addressNeedle:"Klosterstraße",placeId:null,
  lat:48.30428,lng:14.28567,precision:"site",sourceRef:"osm:way:88454087",sourceUrl:"https://www.openstreetmap.org/way/88454087",
  correctedAddress:"Minoritenkirche (Landhauskirche), Klosterstraße, 4020 Linz, Austria",
  reviewScope:"LINZ_MINORITENKIRCHE_CHURCH_FOOTPRINT_NOT_NEARBY_ALTER_DOM",
  evidence:Object.freeze(["https://mapcarta.com/de/W88454087","https://www.linzwiki.at/wiki/Minoriten/"])}),
 "RG-72DF6B4BE3ED":Object.freeze({sourceId:"AO-B37-L-AT-960FC36DA592",name:"Paulanerkirche Schutzengelkirche",country:"AT",addressNeedle:"Wiedner Hauptstr.",placeId:null,
  lat:48.19607,lng:16.36744,precision:"site",sourceRef:"osm:way:29490756",sourceUrl:"https://www.openstreetmap.org/way/29490756",
  correctedAddress:"Paulanerkirche (Pfarrkirche zu den Hl. Schutzengeln), Wiedner Hauptstraße 21, 1040 Wien, Austria",
  reviewScope:"VIENNA_PAULANERKIRCHE_ACTUAL_CHURCH_NOT_NEARBY_PROTESTANT_OR_ST_ELISABETH",
  evidence:Object.freeze(["https://mapcarta.com/de/W29490756","https://petrusbruderschaft.de/pages/wo-wir-sind/oesterreich/messorte.php"])}),
 "RG-0D6D16EEC8DA":Object.freeze({sourceId:"AO-B37-L-CH-9D490E3D76A3",name:"Pfarr- und Wallfahrtskirche",country:"CH",addressNeedle:"St. Pelagiberg",placeId:null,
  lat:47.48797,lng:9.29882,precision:"site",sourceRef:"osm:way:435800580",sourceUrl:"https://www.openstreetmap.org/way/435800580",
  correctedAddress:"Katholische Pfarr- und Wallfahrtskirche St. Pelagiberg, St. Pelagibergstrasse 15, 9225 Hauptwil-Gottshaus, Switzerland",
  reviewScope:"ST_PELAGIBERG_EXACT_CATHOLIC_PILGRIMAGE_CHURCH_FOOTPRINT_NOT_HAMLET_OR_BUS_STOP",
  evidence:Object.freeze(["https://mapcarta.com/de/W435800580","https://commons.wikimedia.org/wiki/Commons:Wiki_Loves_Monuments_in_Switzerland/Thurgau/F-K"])}),
 "RG-2618E5D29428":Object.freeze({sourceId:"AO-B42-FSSP-FR-176",name:"Eglise paroissiale de Duingt",country:"FR",addressNeedle:"Duingt",placeId:null,
  lat:45.82735,lng:6.20255,precision:"site",sourceRef:"osm:way:70557072",sourceUrl:"https://www.openstreetmap.org/way/70557072",
  correctedAddress:"Église Saint-Germain (Sainte-Germaine), 74410 Duingt, Haute-Savoie, France",
  reviewScope:"DUINGT_SAINT_GERMAIN_ROMAN_CATHOLIC_CHURCH_NOT_PARKING_OR_WAYSIDE_SHRINES",
  evidence:Object.freeze(["https://mapcarta.com/fr/W70557072","https://www.fssp.org/en/find-us/where-are-we/"])}),
 "RG-7FF3FB47A74A":Object.freeze({sourceId:"AO-B51-FR-5779188C321D",name:"Abbaye Notre-Dame de Triors",country:"FR",addressNeedle:"205 chemin des Carnets",placeId:null,
  lat:45.09447,lng:5.11324,precision:"site",sourceRef:"osm:way:61073576",sourceUrl:"https://www.openstreetmap.org/way/61073576",
  correctedAddress:"Église abbatiale, Abbaye Notre-Dame de Triors, 205 chemin des Carnets, 26750 Triors, France",
  reviewScope:"TRIORS_NAMED_BENEDICTINE_ABBEY_CHURCH_NOT_NEARBY_EGLISE_SAINT_SEBASTIEN",
  evidence:Object.freeze(["https://mapcarta.com/fr/W61073576","https://francoisdestors.com/contact/","https://valence.cef.fr/vie-consacree/abbaye-notre-dame-de-triors/"])}),
 "RG-74A4FF39E697":Object.freeze({sourceId:"AO-B40-LOC-FR-28B51432B416",name:"Église Saint-Vincent",country:"FR",addressNeedle:"Chapelles-Bourbon",placeId:null,
  lat:48.74111,lng:2.84098,precision:"site",sourceRef:"osm:way:177044978",sourceUrl:"https://www.openstreetmap.org/way/177044978",
  correctedAddress:"Église Saint-Vincent, Place de l'Église, 77610 Les Chapelles-Bourbon, France",
  reviewScope:"LES_CHAPELLES_BOURBON_SAINT_VINCENT_CHURCH_NOT_NEARBY_SAINT_NICOLAS",
  evidence:Object.freeze(["https://mapcarta.com/fr/W177044978","https://www.instituteofthegoodshepherd.org/locations-around-the-world"])}),
 "RG-728E287267C4":Object.freeze({sourceId:"AO-B33-L-FR-BBD003615B0F",name:"Abbaye Saint-Paul de Wisques",country:"FR",addressNeedle:"50 rue de l'École",placeId:null,
  lat:50.727438,lng:2.186389,precision:"site",sourceRef:"independent:france-heritage-pa62000145",sourceUrl:"https://pop.culture.gouv.fr/notice/merimee/PA62000145",
  correctedAddress:"Abbaye Saint-Paul de Wisques (monastère bénédictin), 50 rue de l'École, 62219 Wisques, France",
  reviewScope:"WISQUES_SAINT_PAUL_MENS_ABBEY_HERITAGE_BUILDINGS_NOT_NOTRE_DAME_WOMENS_ABBEY",
  evidence:Object.freeze(["https://www.plan-du-patrimoine.fr/monument-historique/62/wisques/abbaye-saint-paul-de-wisques/PA62000145/","https://www.solesmes.com/congregation"])}),
 "RG-7974C6D19288":Object.freeze({sourceId:"AO-B40-LOC-BE-AE1E5D3A7D63",name:"Église Saint-Géry",country:"BE",addressNeedle:"Brasménil",placeId:null,
  lat:50.54146,lng:3.54689,precision:"site",sourceRef:"osm:way:515666086",sourceUrl:"https://www.openstreetmap.org/way/515666086",
  correctedAddress:"Église Saint-Géry, Place de Brasménil, 7604 Brasménil (Péruwelz), Belgium",
  reviewScope:"BRASMENIL_SAINT_GERY_CHURCH_FOOTPRINT_HOUSE_NUMBER_CONFLICT_1_VS_22_HELD",
  evidence:Object.freeze(["https://mapcarta.com/fr/W515666086","https://icrspfrance.fr/?org=11499","https://www.egliseinfo.be/lieu/76/brasmenil/saint-gery"])}),
 "RG-3F4A95E75DE4":Object.freeze({sourceId:"AO-B42-FSSP-BE-023",name:"Eglise Saint-Médard",country:"BE",addressNeedle:"Saint-Mard",placeId:null,
  lat:49.55459,lng:5.53137,precision:"site",sourceRef:"osm:way:90215068",sourceUrl:"https://www.openstreetmap.org/way/90215068",
  correctedAddress:"Église Saint-Médard, rue Léon Colleaux, 6762 Saint-Mard (Virton), Belgium",
  reviewScope:"SAINT_MARD_SAINT_MEDARD_ROMAN_CATHOLIC_CHURCH_NOT_PROTESTANT_CHURCH_NEARBY",
  evidence:Object.freeze(["https://mapcarta.com/fr/W90215068","https://www.fssp.org/en/find-us/where-are-we/"])}),
 "RG-62828B925646":Object.freeze({sourceId:"AO-B42-FSSP-US-320",name:"St John the Baptist Historic Chapel — Front Royal",country:"US",addressNeedle:"120 W Main Street",placeId:null,
  lat:38.91808,lng:-78.19528,precision:"site",sourceRef:"osm:way:399533140",sourceUrl:"https://www.openstreetmap.org/way/399533140",
  correctedAddress:"Saint John the Baptist Catholic Church, 120 West Main Street, Front Royal, VA 22630, USA",
  reviewScope:"FRONT_ROYAL_ST_JOHN_CATHOLIC_HISTORIC_CHURCH_FOOTPRINT_NOT_CHAPLAINCY_SITE_ELSEWHERE",
  evidence:Object.freeze(["https://mapcarta.com/W399533140","https://sjtb.org/"])}),
 "RG-7736D193DB0F":Object.freeze({sourceId:"AO-B50-CMRI-US-AE55AE75ADC",name:"Our Lady of Fatima Chapel",country:"US",addressNeedle:"Chelsea OK",placeId:null,
  lat:36.142060,lng:-95.988855,precision:"site",sourceRef:"independent:4states-fatima-official-property-gps",sourceUrl:"https://4statesfatimachapel.org/home/",
  correctedAddress:"Our Lady of Fatima Mission Chapel, 20730 E Hwy 28A, Chelsea, OK 74016, USA",
  reviewScope:"CHELSEA_OK_OUR_LADY_FATIMA_OWNER_PUBLISHED_RURAL_CHAPEL_PROPERTY_COORDINATE_NOT_ENTRANCE",
  evidence:Object.freeze(["https://4statesfatimachapel.org/home-2/","https://cmri.org/cmri-directory-of-traditional-latin-masses/"])}),
 "RG-24DE8FCA3A1E":Object.freeze({sourceId:"AO-B41-LOC-PL-2F5EBDF4C2EB",name:"Kościół Matki Bożej Różańcowej",country:"PL",addressNeedle:"Żniwna 7",placeId:null,
  lat:53.76637,lng:20.42309,precision:"site",sourceRef:"osm:way:144447258",sourceUrl:"https://www.openstreetmap.org/way/144447258",
  correctedAddress:"Kościół Matki Bożej Różańcowej, ul. Żniwna 7, 10-823 Olsztyn (Dajtki), Poland",
  reviewScope:"OLSZTYN_DAJTKI_OUR_LADY_OF_ROSARY_CATHOLIC_CHURCH_NOT_NEARBY_SAINT_JOHN_NEPOMUCENE_CHAPEL",
  evidence:Object.freeze(["https://mapcarta.com/W144447258","https://olsztyn.twoje-miasto.pl/zabytki/398186-kosciol-parafialny-pw-matki-bozej-rozancowej/"])}),
  // 2026-11-03 batch 3: source-identified physical worship sites only.
  // Indicative church-building/monastery points, never certifying an entrance,
  // current traditional Mass, its books, a celebrant or photograph rights.
  "RG-FAC20FA70D51":Object.freeze({sourceId:"AO-B36-L-GB-DEDA53FBF2A4",name:"St Andrew’s Church, Ravelston",country:"GB",addressNeedle:"77 Belford Road",placeId:null,
    lat:55.952898,lng:-3.226376,precision:"site",sourceRef:"independent:historic-scotland-lb50186",sourceUrl:"https://portal.historicenvironment.scot/apex/f?p=1505:300:::::VIEWTYPE,VIEWREF:designation,LB50186",
    correctedAddress:"St Andrew’s Roman Catholic Church, 77 Belford Road, Edinburgh EH4 3DS, Scotland",
    reviewScope:"RAVELSTON_ST_ANDREW_CHURCH_BUILDING_NOT_CATHEDRAL_HOUSE_ON_YORK_PLACE",
    evidence:Object.freeze(["https://www.stmaryscathedral.co.uk/st-andrews-church","https://archedinburgh.org/parish/ravelston-st-andrew/","https://britishlistedbuildings.co.uk/200398144-roman-catholic-and-including-boundary-walls-st-andrews-church-77-belford-road-edinburgh-edinburgh/maps"])}),
  "RG-966121990E29":Object.freeze({sourceId:"AO-B36-L-GB-7F0BF55868F8",name:"St Michael’s Church",country:"GB",addressNeedle:"Eriskay",placeId:null,
    lat:57.08685,lng:-7.30679,precision:"site",sourceRef:"osm:way:208110102",sourceUrl:"https://www.openstreetmap.org/way/208110102",
    correctedAddress:"St Michael's Roman Catholic Church, Eriskay, Isle of South Uist HS8 5JJ, Scotland",
    reviewScope:"ERISKAY_ST_MICHAEL_CHURCH_FOOTPRINT_NOT_ADJOINING_PRESBYTERY",
    evidence:Object.freeze(["https://mapcarta.com/W208110102","https://portal.historicenvironment.scot/apex/f?p=1505:300:::::VIEWTYPE,VIEWREF:designation,LB18770"])}),
  "RG-76E004302185":Object.freeze({sourceId:"AO-B36-L-GB-38AA0B628267",name:"St James’s Church",country:"GB",addressNeedle:"232 Woodhall Avenue",placeId:null,
    lat:55.84649,lng:-4.03811,precision:"site",sourceRef:"osm:way:293964480",sourceUrl:"https://www.openstreetmap.org/way/293964480",
    correctedAddress:"St James the Greater Catholic Church, 232 Woodhall Avenue, Coatbridge ML5 5DF, Scotland",
    reviewScope:"COATBRIDGE_ST_JAMES_CATHOLIC_CHURCH_NOT_PARISH_HALL_OR_NEIGHBORING_BUILDINGS",
    evidence:Object.freeze(["https://mapcarta.com/W293964480","https://www.rcdom.org.uk/st-james-coatbridge","https://stjamescoatbridge.co.uk/contact/"])}),
  "RG-66F1670E4623":Object.freeze({sourceId:"AO-B36-L-GB-AA569700281C",name:"Our Lady of the Garioch and St John the Evangelist",country:"GB",addressNeedle:"Fetternear",placeId:null,
    lat:57.2494,lng:-2.4667,precision:"site",sourceRef:"independent:historic-scotland-lb2834-church",sourceUrl:"https://britishlistedbuildings.co.uk/200333806-the-roman-catholic-church-of-our-lady-of-the-garioch-and-st-john-the-evangelist-fetternear-chapel-of-garioch/maps",
    correctedAddress:"Our Lady of the Garioch and St John the Evangelist Catholic Church, Fetternear, Inverurie AB51 5JU, Scotland",
    reviewScope:"FETTERNEAR_GARIOCH_CATHOLIC_CHURCH_BUILDING_NOT_PRESBYTERY_LISTED_SEPARATELY",
    evidence:Object.freeze(["https://britishlistedbuildings.co.uk/200333807-presbytery-the-roman-catholic-church-of-our-lady-of-the-garioch-and-st-john-the-evangelist-fetternear-chapel-of-garioch/maps","https://unavocescotland.org/find-a-latin-mass/"])}),
  "RG-ACE21207D458":Object.freeze({sourceId:"AO-B42-FSSP-GB-216",name:"Our Lady of Perpetual Succour Catholic Church",country:"GB",addressNeedle:"30 Amersham Road",placeId:null,
    lat:51.68984733,lng:-0.61346733,precision:"site",sourceRef:"independent:buckinghamshire-heritage-mbc34021",sourceUrl:"https://heritageportal.buckinghamshire.gov.uk/Monument/MBC34021",
    correctedAddress:"Our Lady of Perpetual Succour Catholic Church, 30 Amersham Road, Chesham Bois HP6 5PE, England",
    reviewScope:"CHESHAM_BOIS_HERITAGE_GRID_SU9594_9992_CHURCH_NOT_NEIGHBORING_CATHOLIC_PRIMARY_SCHOOL",
    evidence:Object.freeze(["https://ourladyschurch-cheshambois.org/","https://northamptondiocese.org/olop-chesham-bois/","https://fssp.org.uk/chesham"])}),
  "RG-48ADDCE5B66F":Object.freeze({sourceId:"AO-B52-FR-629DBA7EA0BE",name:"Abbaye Notre-Dame de Bellaigue — abbatial church",country:"FR",addressNeedle:"Virlet",placeId:null,
    lat:46.15988,lng:2.70388,precision:"site",sourceRef:"osm:way:143600998",sourceUrl:"https://www.openstreetmap.org/way/143600998",
    correctedAddress:"Église abbatiale Notre-Dame de Bellaigue, Abbaye de Bellaigue, 63330 Virlet, France",
    reviewScope:"BELLAIGUE_EXACT_ABBEY_CHURCH_NOT_MONASTERY_DORMITORY_OR_NEIGHBORING_NUNNERY",
    evidence:Object.freeze(["https://mapcarta.com/fr/W143600998","https://www.combrailles-auvergne-tourisme.fr/patrimoine-culturel/abbaye-de-bellaigue-virlet/"])}),
  "RG-18D90713A799":Object.freeze({sourceId:"AO-B40-LOC-FR-9DDBC8EC9884",name:"Église du Sacré-Cœur",country:"FR",addressNeedle:"15 avenue Tarayre",placeId:null,
    lat:44.35648,lng:2.57783,precision:"site",sourceRef:"osm:way:45425385",sourceUrl:"https://www.openstreetmap.org/way/45425385",
    correctedAddress:"Église du Sacré-Cœur, 15 avenue Tarayre, 12000 Rodez, France",
    reviewScope:"RODEZ_SACRE_COEUR_PARISH_CHURCH_FOOTPRINT_NOT_PARKING_OR_NEARBY_CATHEDRAL",
    evidence:Object.freeze(["https://mapcarta.com/fr/W45425385","https://pop.culture.gouv.fr/notice/merimee/IA12112026","https://www.messes.info/annuaire/44.3566799:2.5785396"])}),
  "RG-5982F41E1BEF":Object.freeze({sourceId:"LMD:blessed-sacrament-church-birmingham-united-states",name:"Blessed Sacrament Catholic Church",country:"US",addressNeedle:"1460 Pearson Avenue",placeId:null,
    lat:33.48892,lng:-86.85563,precision:"site",sourceRef:"osm:way:1337597428",sourceUrl:"https://www.openstreetmap.org/way/1337597428",
    correctedAddress:"Blessed Sacrament Catholic Church, 1460 Pearson Avenue SW, Birmingham, AL 35211, USA",
    reviewScope:"BIRMINGHAM_AL_BLESSED_SACRAMENT_CATHOLIC_CHURCH_FOOTPRINT_NOT_OTHER_CHURCHES",
    evidence:Object.freeze(["https://mapcarta.com/W1337597428","https://myblessedsacrament.org/","https://churcheslist.com/blessed-sacrament-church-21"])}),
  "RG-2323CFCF49FD":Object.freeze({sourceId:"AO-B39-LOC-IT-981400079976",name:"Chiesa dei SS Domenico e Sisto",country:"IT",addressNeedle:"Largo Angelicum",placeId:null,
    lat:41.89593,lng:12.48773,precision:"site",sourceRef:"independent:commons-santi-domenico-object-location",sourceUrl:"https://commons.wikimedia.org/wiki/File:Santi_Domenico_e_Sisto.jpg",
    correctedAddress:"Chiesa dei Santi Domenico e Sisto, Largo Angelicum 1, 00184 Roma, Italy",
    reviewScope:"ROME_SANTI_DOMENICO_SISTO_EXACT_PHOTOGRAPHED_CHURCH_SITE_NOT_ANGELICUM_CLASSROOMS",
    evidence:Object.freeze(["https://mapcarta.com/34600358","https://commons.wikimedia.org/wiki/File:Santi_Domenico_e_Sisto_-_entrance.jpg"])}),
  "RG-5971A223ED2C":Object.freeze({sourceId:"AO-B33-L-FR-6AB07860E97F",name:"Abbaye Saint-Joseph de Clairval",country:"FR",addressNeedle:"Flavigny-sur-Ozerain",placeId:null,
    lat:47.51056,lng:4.53102,precision:"site",sourceRef:"geonames:11962645",sourceUrl:"https://mapcarta.com/36270968",
    correctedAddress:"Abbaye Saint-Joseph de Clairval, Grande Rue, 21150 Flavigny-sur-Ozerain, France",
    reviewScope:"FLAVIGNY_NAMED_CLAIRVAL_ABBEY_SITE_NOT_EGLISE_SAINT_GENEST_NEARBY_OR_OLD_FLAVIGNY_ABBEY",
    evidence:Object.freeze(["https://www.clairval.com/venir-a-labbaye/acces/","https://commons.wikimedia.org/wiki/File:Abbaye_Saint_Joseph_de_Clairval_-_Grand_Rue,_Flavigny-sur-Ozerain_(35724756792).jpg"])}),
 // Batch 2 · exact site-level church or monastery building, not door or programme proof.
 "RG-02BA9EEBB29C":Object.freeze({sourceId:"AO-B34-L-GB-2C52DE470558",name:"Holy Rood",country:"GB",addressNeedle:"North Hinksey",placeId:null,
  lat:51.7448,lng:-1.2554,precision:"site",sourceRef:"historicengland:1466650",sourceUrl:"https://historicengland.org.uk/listing/the-list/list-entry/1466650",
  correctedAddress:"Holy Rood Roman Catholic Church, Abingdon Road, Oxford OX1 4LD, England",
  reviewScope:"OXFORD_HOLY_ROOD_CATHOLIC_CHURCH_NOT_WOODEATON_HOLY_ROOD_OR_GRANDPONT_HOUSE",
  evidence:Object.freeze(["https://hinkseyparish.org/our-churches/holy-rood/","https://britishlistedbuildings.co.uk/101466650-holy-rood-church-abingdon-road-oxford-oxford-hinksey-park-ward/maps"])}),
 "RG-07524D929C5D":Object.freeze({sourceId:"AO-B35-L-GB-BF9A4860B481",name:"St George’s",country:"GB",addressNeedle:"Warminster",placeId:null,
  lat:51.2018,lng:-2.17244,precision:"site",sourceRef:"osm:way:979429131",sourceUrl:"https://www.openstreetmap.org/way/979429131",
  correctedAddress:"St George's Catholic Church, 31 Boreham Road, Warminster BA12 9JP, England",
  reviewScope:"WARMINSTER_ST_GEORGES_CATHOLIC_CHURCH_NOT_ANGLICAN_ST_JOHNS",
  evidence:Object.freeze(["https://mapcarta.com/W979429131","https://www.stgeorgeswarminster.co.uk/"])}),
 "RG-0940B7AED4FC":Object.freeze({sourceId:"AO-B34-L-GB-780A2E117C3F",name:"Carmelite Monastery of the Annunciation",country:"GB",addressNeedle:"Birkenhead",placeId:null,
  lat:53.38846,lng:-3.04912,precision:"site",sourceRef:"osm:way:233136009",sourceUrl:"https://www.openstreetmap.org/way/233136009",
  correctedAddress:"Carmelite Monastery of the Annunciation, 12 Grosvenor Place, Prenton, Birkenhead CH43 1UA, England",
  reviewScope:"BIRKENHEAD_CARMELITE_MONASTERY_COMPOUND_NOT_NEARBY_ST_ANSELMS_COLLEGE_CHAPEL_ENTRANCE_UNCONFIRMED",
  evidence:Object.freeze(["https://mapcarta.com/W233136009","https://icksp.org.uk/newbrighton/all-saints-and-all-souls/","https://www.latinmassdir.org/venue/carmelite-monastery-of-the-annunciation-prenton-united-kingdom/"])}),
 "RG-10BAB9521232":Object.freeze({sourceId:"AO-B34-L-GB-D7DA8CC0BE16",name:"English Martyrs",country:"GB",addressNeedle:"Strood",placeId:null,
  lat:51.40088,lng:0.49943,precision:"site",sourceRef:"osm:way:118090379",sourceUrl:"https://www.openstreetmap.org/way/118090379",
  correctedAddress:"English Martyrs Roman Catholic Church, 37 Frindsbury Road, Strood, Rochester ME2 4JA, England",
  reviewScope:"STROOD_ENGLISH_MARTYRS_CHURCH_NOT_ADJACENT_CATHOLIC_PRIMARY_SCHOOL",
  evidence:Object.freeze(["https://mapcarta.com/W118090379","https://www.englishmartyrsrccstrood.org/contact-us/","https://www.englishmartyrsrccstrood.org/our-church/"])}),
 "RG-10C584FEFB23":Object.freeze({sourceId:"AO-B35-L-GB-B7094F409C01",name:"St Cuthbert's",country:"GB",addressNeedle:"Durham",placeId:null,
  lat:54.7746,lng:-1.56948,precision:"site",sourceRef:"osm:way:221993813",sourceUrl:"https://www.openstreetmap.org/way/221993813",
  correctedAddress:"St Cuthbert's Roman Catholic Church, Old Elvet, Durham DH1 3HL, England",
  reviewScope:"DURHAM_CATHOLIC_ST_CUTHBERT_OLD_ELVET_NOT_ANGLICAN_ST_CUTHBERT_WESTERN_HILL_OR_PRESBYTERY",
  evidence:Object.freeze(["https://mapcarta.com/W221993813","https://diocesehn.org.uk/church/st-cuthbert-6/","https://historicengland.org.uk/listing/the-list/list-entry/1160512"])}),
 "RG-136CD7964432":Object.freeze({sourceId:"AO-B34-L-GB-06C183FA5381",name:"Holy Trinity & St Augustine",country:"GB",addressNeedle:"Baldock",placeId:null,
  lat:51.98404,lng:-0.18345,precision:"site",sourceRef:"osm:way:148606792",sourceUrl:"https://www.openstreetmap.org/way/148606792",
  correctedAddress:"Holy Trinity and St Augustine of Canterbury Roman Catholic Church, London Road, Baldock SG7 6LQ, England",
  reviewScope:"BALDOCK_HOLY_TRINITY_ST_AUGUSTINE_CATHOLIC_CHURCH_NOT_ADJACENT_SCHOOL",
  evidence:Object.freeze(["https://mapcarta.com/W148606792","https://parish.rcdow.org.uk/baldock/contact/"])}),
  "RG-0A7D6FB130D8":Object.freeze({sourceId:"AO-B34-L-GB-5FF0510590CE",name:"Our Lady of Compassion",country:"GB",addressNeedle:"London",placeId:null,
    lat:51.5311,lng:0.03808,precision:"site",sourceRef:"osm:way:351187849",sourceUrl:"https://www.openstreetmap.org/way/351187849",
    correctedAddress:"Our Lady of Compassion Catholic Church, Green Street, Upton Park, London E13 9AX, United Kingdom",
    reviewScope:"UPTON_PARK_OUR_LADY_OF_COMPASSION_CATHOLIC_CHURCH_BUILDING_NOT_PRIMARY_SCHOOL",
    evidence:Object.freeze(["https://mapcarta.com/W351187849","https://www.dioceseofbrentwood.net/parish/upton-park/church/our-lady-of-compassion/","https://uptonparkparish.org/"])}),
  "RG-09724CA01972":Object.freeze({sourceId:"AO-B35-L-GB-9311BCBCBE20",name:"St Barnabas",country:"GB",addressNeedle:"Molesey",placeId:null,
    lat:51.403138,lng:-0.356546,precision:"site",sourceRef:"independent:elmbridge-st-barnabas-church",sourceUrl:"https://en.wikipedia.org/wiki/List_of_places_of_worship_in_Elmbridge",
    correctedAddress:"St Barnabas Roman Catholic Church, 28 Vine Road, East Molesey, Surrey KT8 9LF, United Kingdom",
    reviewScope:"MOLESEY_ST_BARNABAS_1931_CATHOLIC_CHURCH_NOT_NEIGHBORING_HOUSES_OR_OTHER_PARISHES",
    evidence:Object.freeze(["https://taking-stock.org.uk/building/molesey-st-barnabas/","https://www.stbarnabasmolesey.org/","https://gcatholic.org/churches/british-isles/92182"])}),
  "RG-2680C1DA8953":Object.freeze({sourceId:"AO-B34-L-GB-D81DD5E3D3A4",name:"Our Lady of Ransom",country:"GB",addressNeedle:"Eastbourne",placeId:null,
    lat:50.76611,lng:0.27773,precision:"site",sourceRef:"osm:way:487068951",sourceUrl:"https://www.openstreetmap.org/way/487068951",
    correctedAddress:"Our Lady of Ransom Catholic Church, 2-4 Grange Road, Eastbourne BN21 4EU, United Kingdom",
    reviewScope:"EASTBOURNE_OUR_LADY_OF_RANSOM_CHURCH_NOT_PRESBYTERY_OR_OTHER_PARISH_CHURCHES",
    evidence:Object.freeze(["https://mapcarta.com/W487068951","https://historicengland.org.uk/listing/the-list/list-entry/1385905","https://ourladyofransom.org.uk/contacts/"])}),
  "RG-223CDB93F8BD":Object.freeze({sourceId:"AO-B34-L-GB-2C828CAB9C43",name:"Our Lady Queen of Martyrs and St Ignatius",country:"GB",addressNeedle:"Chideock",placeId:null,
    lat:50.73777,lng:-2.82292,precision:"site",sourceRef:"osm:way:258582025",sourceUrl:"https://www.openstreetmap.org/way/258582025",
    correctedAddress:"Our Lady Queen of Martyrs and St Ignatius, North Road, Chideock, Dorset DT6 6LF, United Kingdom",
    reviewScope:"CHIDEOCK_CATHOLIC_MARTYRS_CHURCH_NOT_ANGLICAN_ST_GILES_OR_CHIDEOCK_MANOR",
    evidence:Object.freeze(["https://mapcarta.com/W258582025","https://www.plymouth-diocese.org.uk/church/chideock-lady-queen-martyrs-st-ignatius/","https://chideockmartyrschurch.org.uk/about-us/"])}),
  // Final site-geography backlog, batch 1 (2026-11-03).
  // OSM objects identify the physical church only; LMS/FSSP listing status
  // still does not establish a current traditional Mass or its celebrant.
  "RG-3315DA94EE1D":Object.freeze({sourceId:"AO-B34-L-GB-29141826F311",name:"Our Lady of the Assumption & English Martyrs",country:"GB",addressNeedle:"Cambridge",placeId:null,
    lat:52.19876,lng:0.12739,precision:"site",sourceRef:"osm:way:33167535",sourceUrl:"https://www.openstreetmap.org/way/33167535",
    correctedAddress:"Our Lady and the English Martyrs, Hills Road and Lensfield Road, Cambridge CB2 1JR, United Kingdom",
    reviewScope:"CAMBRIDGE_OUR_LADY_ENGLISH_MARTYRS_CHURCH_NOT_RECTORY_OR_PARKING",
    evidence:Object.freeze(["https://mapcarta.com/W33167535","https://historicengland.org.uk/listing/the-list/list-entry/1349061","https://olem.org.uk/where-to-find-us/"])}),
  "RG-142C68DBCDC0":Object.freeze({sourceId:"AO-B34-L-GB-A216E1128479",name:"Cathedral Church of Our Lady of Sorrows",country:"GB",addressNeedle:"Wrexham",placeId:null,
    lat:53.04729,lng:-2.99858,precision:"site",sourceRef:"osm:way:399333482",sourceUrl:"https://www.openstreetmap.org/way/399333482",
    correctedAddress:"Cathedral Church of Our Lady of Sorrows, Regent Street, Wrexham LL11 1RB, Wales",
    reviewScope:"WREXHAM_CATHEDRAL_CHURCH_NOT_GATEWAY_OR_PRESBYTERY",
    evidence:Object.freeze(["https://mapcarta.com/W399333482","https://www.rcdwxm.org.uk/st-marys-cathedral-wrexham","https://www.wrexham.gov.uk/service/links-moving-home/places-worship-wrexham-county-borough"])}),
  "RG-02499F036F1D":Object.freeze({sourceId:"ao-fssp-herz-jesu-kirche-schwamendingenstr-55-ch-8050-zurich-oerlikon-suisse",name:"Herz Jesu Kirche",country:"CH",addressNeedle:"Schwamendingenstrasse 55",placeId:null,
    lat:47.4068,lng:8.55191,precision:"site",sourceRef:"osm:way:60796258",sourceUrl:"https://www.openstreetmap.org/way/60796258",
    correctedAddress:"Herz Jesu Kirche, Schwamendingenstrasse 55, 8050 Zürich-Oerlikon, Switzerland",
    reviewScope:"ZURICH_OERLIKON_HERZ_JESU_CHURCH_NOT_ADJACENT_CHAPEL_OR_CEMETERY",
    evidence:Object.freeze(["https://mapcarta.com/de/W60796258","https://herz-jesu.ch/","https://www.personalpfarrei.ch/Pfarrei/messorte.php"])}),
  "RG-028C2D07EF1C":Object.freeze({sourceId:"AO-AMER-R28-US-30-19",name:"St Mary",country:"US",addressNeedle:"Hagerstown",placeId:null,
    lat:39.6446277,lng:-77.7249439,precision:"site",sourceRef:"osm:way:956997178",sourceUrl:"https://www.openstreetmap.org/way/956997178",correctedAddress:"St Mary Catholic Church, 224 West Washington Street, Hagerstown, MD 21740, USA",
    reviewScope:"HAGERSTOWN_SAINT_MARY_CHURCH_BUILDING_NOT_PARISH_OFFICE",evidence:Object.freeze(["https://saintmarysonline.org/contact/","https://archbaltcopy.diocesanweb.org/parishes/all-parishes/st-mary-hagerstown/"])}),
  "RG-0320E86C5E56":Object.freeze({sourceId:"AO-AMER-R28-US-19-03",name:"Sacred Heart",country:"US",addressNeedle:"43775 Deep Canyon",placeId:null,
    lat:33.7303742,lng:-116.3656147,precision:"site",sourceRef:"osm:way:105811081",sourceUrl:"https://www.openstreetmap.org/way/105811081",correctedAddress:"Sacred Heart Catholic Church, 43775 Deep Canyon Road, Palm Desert, CA 92260, USA",
    reviewScope:"PALM_DESERT_SACRED_HEART_CHURCH_BUILDING_NOT_SCHOOL_CAMPUS_OR_RELATION",evidence:Object.freeze(["https://www.sbdcatholics.org/sbd-parishes/1347/","https://church.sacredheartpalmdesert.com/history"])}),
  "RG-03A3AE24D334":Object.freeze({sourceId:"AO-AMER-R28-US-19-07",name:"Sacred Heart Catholic",country:"US",addressNeedle:"Savannah",placeId:null,
    lat:32.0603972,lng:-81.0993736,precision:"site",sourceRef:"osm:way:950223950",sourceUrl:"https://www.openstreetmap.org/way/950223950",correctedAddress:"Sacred Heart Catholic Church, 1707 Bull Street, Savannah, GA 31401, USA",
    reviewScope:"SAVANNAH_SACRED_HEART_CHURCH_FOOTPRINT_ADJACENT_TO_NAMED_OSM_NODE",evidence:Object.freeze(["https://www.sacredheartsavannah.org/","https://www.diosav.org/en/parishes-directory/item/sacred-heart-of-jesus"])}),
  "RG-0A22291A4428":Object.freeze({sourceId:"AO-AMER-R28-US-26-06",name:"St Frances Cabrini",country:"US",addressNeedle:"Alexandria",placeId:null,
    lat:31.282011,lng:-92.455895,precision:"site",sourceRef:"osm:way:1062235053",sourceUrl:"https://www.openstreetmap.org/way/1062235053",correctedAddress:"St Frances Cabrini Catholic Church, 2211 East Texas Avenue, Alexandria, LA 71301, USA",
    reviewScope:"ALEXANDRIA_FRANCES_CABRINI_CHURCH_BUILDING_NOT_SCHOOL_2215_TEXAS_AVENUE",evidence:Object.freeze(["https://www.diocesealex.org/church/st-frances-cabrini-church/","https://www.cabrinichurch.com/"])}),
  "RG-0AFAF04ADE71":Object.freeze({sourceId:"AO-EUR-DE-136",name:"St Mariä Himmelfahrt",country:"DE",addressNeedle:"Herzogenrath",placeId:null,
    lat:50.8679565,lng:6.0912411,precision:"site",sourceRef:"osm:way:243988946",sourceUrl:"https://www.openstreetmap.org/way/243988946",correctedAddress:"Katholische Pfarrkirche Mariä Himmelfahrt, Eygelshovener Straße, 52134 Herzogenrath, Germany",
    reviewScope:"HERZOGENRATH_MARIA_HIMMELFAHRT_PARISH_CHURCH_NOT_RECTORY",evidence:Object.freeze(["https://www.kuladig.de/Objektansicht/KLD-266557","https://www.openstreetmap.org/way/243988946"])}),
  "RG-0B8749A10D66":Object.freeze({sourceId:"AO-AMER-R28-US-27-09",name:"St John Baptist Catholic",country:"US",addressNeedle:"Montgomery",placeId:null,
    lat:32.3710127,lng:-86.2993657,precision:"site",sourceRef:"osm:way:692352694",sourceUrl:"https://www.openstreetmap.org/way/692352694",correctedAddress:"St John the Baptist Catholic Church, 543 South Union Street, Montgomery, AL 36104, USA",
    reviewScope:"MONTGOMERY_ST_JOHN_BAPTIST_CHURCH_NOT_533_UNION_CONVENT",evidence:Object.freeze(["https://www.mobarch.org/parishfinder","https://ahc.alabama.gov/PDF/CivilRightsMPDF/PaleoWest_CityofMontgomery.pdf"])}),
  "RG-0712DCD78856":Object.freeze({sourceId:"AO-WORLD-R35-BR-05-19",name:"Igreja Nossa Senhora do Rosário dos Homens Pretos",country:"BR",addressNeedle:"Campina",placeId:null,
    lat:-1.4526174,lng:-48.497261,precision:"site",sourceRef:"osm:way:1267548521",sourceUrl:"https://www.openstreetmap.org/way/1267548521",correctedAddress:"Igreja Nossa Senhora do Rosário dos Homens Pretos, Rua Padre Prudêncio 291, Campina, Belém, Pará, Brazil",
    reviewScope:"BELEM_NOSSA_SENHORA_ROSARIO_DOS_HOMENS_PRETOS_HERITAGE_CHURCH",evidence:Object.freeze(["https://sicg.iphan.gov.br/sicg/bem/visualizar/796","https://www.openstreetmap.org/way/1267548521"])}),
  "RG-0CF7DF0C68AC":Object.freeze({sourceId:"LMD:saint-patricks-church-albury-australia",name:"Saint Patrick's Church Albury, Australia",country:"AU",addressNeedle:"Albury",placeId:null,
    lat:-36.083298,lng:146.9171806,precision:"site",sourceRef:"osm:way:460667287",sourceUrl:"https://www.openstreetmap.org/way/460667287",correctedAddress:"St Patrick's Catholic Church, 515 Smollett Street, Albury, NSW 2640, Australia",
    reviewScope:"ALBURY_ST_PATRICK_CHURCH_NOT_ADJACENT_SCHOOL_OR_CHAPEL",evidence:Object.freeze(["https://wagga.catholic.org.au/parish-directory/","https://wagga.catholic.org.au/directory/listing/albury-parish/"])}),
  "RG-E3F4A8F02E37":Object.freeze({
    sourceId:"AO-AMER-R27-US-10-14",name:"Most Holy Trinity",country:"US",addressNeedle:"720 Telfair",placeId:null,
    lat:33.47143,lng:-81.96676,precision:"site",sourceRef:"osm:way:385944485",sourceUrl:"https://www.openstreetmap.org/way/385944485",
    correctedAddress:"Most Holy Trinity Catholic Church, 720 Telfair Street, Augusta, GA 30901, USA",reviewScope:"MOST_HOLY_TRINITY_CATHOLIC_CHURCH_BUILDING_NOT_CEMETERY_OR_BELL_AUDITORIUM",
    evidence:Object.freeze(["https://mapcarta.com/W385944485","https://themostholytrinity.org/about-us","https://diosav.org/en/resources/life-is-sacred"]),
  }),
  "RG-84D250B1CFB3":Object.freeze({
    sourceId:"AO-AMER-R28-US-22-01",name:"Saint Paul the Apostle Catholic Church",country:"US",addressNeedle:"602 McLean",placeId:null,
    lat:40.90982,lng:-73.87986,precision:"site",sourceRef:"osm:way:222072165",sourceUrl:"https://www.openstreetmap.org/way/222072165",
    correctedAddress:"St Paul the Apostle Catholic Church, 602 McLean Avenue, Yonkers, NY, USA",reviewScope:"SAINT_PAUL_YONKERS_CATHOLIC_CHURCH_BUILDING_NOT_ADJACENT_SCHOOL",
    evidence:Object.freeze(["https://mapcarta.com/22617372","https://www.archny.org/places/st-paul-the-apostle-yonkers"]),
  }),
  "RG-ABD010C7A5D7":Object.freeze({
    sourceId:"AO-AMER-R26-US-02-05",name:"Basilica of St Mary",country:"US",addressNeedle:"412 Ann",placeId:null,
    lat:34.232194,lng:-77.943306,precision:"site",sourceRef:"independent:basilica-shrine-wilmington-building",sourceUrl:"https://en.wikipedia.org/wiki/Basilica_Shrine_of_St._Mary_(Wilmington,_North_Carolina)",
    correctedAddress:"Basilica Shrine of St Mary, 412 Ann Street, Wilmington, NC 28401, USA",reviewScope:"BASILICA_SHRINE_WILMINGTON_HISTORIC_CHURCH_NOT_ADJACENT_SCHOOL",
    evidence:Object.freeze(["https://en.wikipedia.org/wiki/Basilica_Shrine_of_St._Mary_(Wilmington,_North_Carolina)","https://www.basilicashrine.org/","https://dioceseofraleigh.org/"]),
  }),
  "RG-3935C183A2BA":Object.freeze({sourceId:"AO-AMER-R26-US-05-16",name:"Holy Family",country:"US",addressNeedle:"1200 Ligonier",placeId:null,
   lat:40.31467,lng:-79.3817,precision:"site",sourceRef:"osm:way:432365179",sourceUrl:"https://www.openstreetmap.org/way/432365179",correctedAddress:"Holy Family Catholic Church, 1200 Ligonier St, Latrobe, PA 15650, USA",
   reviewScope:"HOLY_FAMILY_LATROBE_CHURCH_BUILDING_NOT_NEIGHBORING_PARISH",evidence:Object.freeze(["https://mapcarta.com/W432365179","https://www.holyfamilylatrobe.org/contact-us"])}),
  "RG-7A75E8D68125":Object.freeze({sourceId:"AO-AMER-R26-US-04-07",name:"Church of the Nativity",country:"US",addressNeedle:"210 Oak Grove",placeId:null,
   lat:37.46075,lng:-122.18033,precision:"site",sourceRef:"osm:way:114158255",sourceUrl:"https://www.openstreetmap.org/way/114158255",correctedAddress:"Church of the Nativity, 210 Oak Grove Ave, Menlo Park, CA 94025, USA",
   reviewScope:"NATIVITY_MENLO_PARK_HISTORIC_CHURCH_NOT_RECTORY",evidence:Object.freeze(["https://mapcarta.com/23020332","https://www.nativitymenlo.org/directions"])}),
  "RG-DB7556C0C980":Object.freeze({sourceId:"AO-AMER-R26-US-04-05",name:"Church of the Assumption",country:"US",addressNeedle:"1227 7th Ave",placeId:null,
   lat:36.17539,lng:-86.79166,precision:"site",sourceRef:"osm:way:893977074",sourceUrl:"https://www.openstreetmap.org/way/893977074",correctedAddress:"Church of the Assumption, 1227 7th Ave N, Nashville, TN 37208, USA",
   reviewScope:"ASSUMPTION_NASHVILLE_CHURCH_BUILDING_NOT_OFFICE",evidence:Object.freeze(["https://mapcarta.com/21572926","https://www.assumptionnashville.org/about"])}),
  "RG-9CF80257612A":Object.freeze({sourceId:"AO-AMER-R28-US-37-11",name:"St. Mary of Perpetual Help",country:"US",addressNeedle:"1039 W 32nd",placeId:null,
   lat:41.83575,lng:-87.65242,precision:"site",sourceRef:"osm:way:210167509",sourceUrl:"https://www.openstreetmap.org/way/210167509",correctedAddress:"St. Mary of Perpetual Help Church, 1039 W 32nd St, Chicago, IL 60608, USA",
   reviewScope:"PERPETUAL_HELP_CHICAGO_PARISH_CHURCH_NOT_SCHOOL",evidence:Object.freeze(["https://mapcarta.com/W210167509","https://stmaryofperpetualhelp.com/about/"])}),
  "RG-BE23723D6B4A":Object.freeze({sourceId:"AO-EUR-IT-032",name:"Chiesa di San Giovanni in Foro",country:"IT",addressNeedle:"Corso Porta Borsari",placeId:null,
   lat:45.44299,lng:10.9953,precision:"site",sourceRef:"osm:way:138811441",sourceUrl:"https://www.openstreetmap.org/way/138811441",correctedAddress:"San Giovanni in Foro, Corso Porta Borsari 20, 37121 Verona, Italy",
   reviewScope:"VERONA_SAN_GIOVANNI_IN_FORO_CHURCH_NOT_ANOTHER_PARISH",evidence:Object.freeze(["https://mapcarta.com/W138811441","https://www.chiesadiverona.it/wd-annuario-enti/vicariato-verona-centro-1711/","https://www.sanremigioverona.org/"])}),
  "RG-63BC2CF66C4B":Object.freeze({sourceId:"AO-EUR-IT-038",name:"Chiesa di San Zeno al Foro",country:"IT",addressNeedle:"Piazza del Foro",placeId:null,
   lat:45.539346,lng:10.226049,precision:"site",sourceRef:"independent:outdooractive-san-zeno-brescia",sourceUrl:"https://www.outdooractive.com/en/poi/brescia/chiesa-di-san-zeno-al-foro/807827253/",correctedAddress:"San Zeno al Foro, Piazza del Foro, 25121 Brescia, Italy",
   reviewScope:"BRESCIA_SAN_ZENO_AL_FORO_CHURCH_NOT_ROMAN_FORUM",evidence:Object.freeze(["https://www.outdooractive.com/en/poi/brescia/chiesa-di-san-zeno-al-foro/807827253/","https://www.comune.brescia.it/it/vivere/chiesa-di-san-zeno-al-foro"])}),
  "RG-0AD2B2092E4E":Object.freeze({sourceId:"AO-AMER-R28-US-35-18",name:"St Thomas the Apostle, Ann Arbor",country:"US",addressNeedle:"530 Elizabeth",placeId:null,
   lat:42.285056,lng:-83.741389,precision:"site",sourceRef:"independent:st-thomas-ann-arbor-building",sourceUrl:"https://en.wikipedia.org/wiki/St._Thomas_the_Apostle_Catholic_Church_(Ann_Arbor,_Michigan)",correctedAddress:"St Thomas the Apostle Church, 530 Elizabeth St, Ann Arbor, MI 48104, USA",
   reviewScope:"ANN_ARBOR_HISTORIC_PARISH_CHURCH_NOT_SCHOOL_OR_OFFICE",evidence:Object.freeze(["https://en.wikipedia.org/wiki/St._Thomas_the_Apostle_Catholic_Church_(Ann_Arbor,_Michigan)","https://sta2.org/church/contact-us/","https://www.dioceseoflansing.org/parish/st-thomas-apostle-ann-arbor"])}),
  "RG-3235F2E6494F":Object.freeze({
   sourceId:"AO-AMER-R28-US-38-01",name:"St. Monica",country:"US",
   addressNeedle:"1700 Buford Hwy",placeId:null,
   lat:34.02459,lng:-84.10151,precision:"site",
   sourceRef:"osm:way:392483318",
   sourceUrl:"https://www.openstreetmap.org/way/392483318",
   correctedAddress:"St. Monica Catholic Church, 1700 Buford Highway, Duluth, GA 30097, USA",
   reviewScope:"CATHOLIC_PARISH_CHURCH_BUILDING_NOT_ENTRANCE",
   evidence:Object.freeze([
    "https://poiexplorer.com/north-america/united-states/georgia/gwinnett-county/johns-creek/religion/saint-monica-catholic-church-w392483318",
    "https://saintmonicas.com/archdiocese-of-atlanta/"
   ]),
  }),
  "RG-18B421A46625":Object.freeze({
   sourceId:"AO-EUR-DE-082",name:"Paderborn Cathedral",country:"DE",
   addressNeedle:"Paderborn",placeId:null,
   lat:51.71896,lng:8.75581,precision:"site",
   sourceRef:"osm:way:255378538",
   sourceUrl:"https://www.openstreetmap.org/way/255378538",
   correctedAddress:"Paderborn Cathedral, Domplatz, 33098 Paderborn, Germany",
   reviewScope:"CATHEDRAL_CHURCH_BUILDING_NOT_ENTRANCE",
   evidence:Object.freeze(["https://mapcarta.com/W255378538","https://www.kirchbau.de/300_datenblatt.php?id=893&name=keiner"]),
  }),
  "RG-2ACA16F334CA":Object.freeze({
   sourceId:"AO-AMER-R28-US-37-03",name:"St. Joseph Oratory",country:"US",
   addressNeedle:"673 Stevens",placeId:null,
   lat:43.68169,lng:-70.29347,precision:"site",
   sourceRef:"osm:node:7170760600",
   sourceUrl:"https://www.openstreetmap.org/node/7170760600",
   correctedAddress:"St. Joseph Oratory, 673 Stevens Avenue, Portland, ME 04103, USA",
   reviewScope:"DIOCESAN_ORATORY_CHURCH_BUILDING_NOT_ENTRANCE",
   evidence:Object.freeze([
    "https://mapcarta.com/N7170760600",
    "https://www.stjosephoratoryme.org/about",
    "https://www.portlanddiocese.org/news/first-christmas-celebrations-held-at-diocese-of-portlands-st-joseph-oratory"
   ]),
  }),
 "RG-130C766CB4B6":Object.freeze({
  sourceId:"AO-EUR-GB-011",name:"Cathedral Church of St Barnabas",country:"GB",addressNeedle:"Nottingham",placeId:null,
  lat:52.954638,lng:-1.1571735,sourceRef:"historicengland:1247533",sourceUrl:"https://historicengland.org.uk/listing/the-list/list-entry/1247533",
  correctedAddress:"Cathedral Church of St Barnabas, Derby Road, Nottingham NG1 5AE, United Kingdom",precision:"site",reviewScope:"GRADE_II_LISTED_CATHEDRAL_CHURCH_NOT_OTHER_NOTTINGHAM_SITE",
  evidence:Object.freeze(["https://casework.jcnas.org.uk/case/98112","https://www.thewrennreport.co.uk/building/E60000075-f78abd5d-9661-4787-a8b3-7164e04d262f/cathedral-church-of-st-barnabas-and-attached-boundary-wall"]),
 }),
 "RG-1484AB15A7A1":Object.freeze({
  sourceId:"AO-AMER-R27-US-06-18",name:"Holy Name of Jesus Cathedral",country:"US",addressNeedle:"Raleigh",placeId:null,
  lat:35.7775,lng:-78.67016,sourceRef:"osm:way:553750193",sourceUrl:"https://www.openstreetmap.org/way/553750193",
  correctedAddress:"Holy Name of Jesus Cathedral, 715 Nazareth Street, Raleigh, NC 27606, USA",precision:"site",reviewScope:"CATHEDRAL_BUILDING_NOT_ADJACENT_PARISH_CENTER",
  evidence:Object.freeze(["https://mapcarta.com/W553750193","https://en.wikipedia.org/wiki/Holy_Name_of_Jesus_Cathedral_(Raleigh,_North_Carolina)"]),
 }),
 "RG-368B7B3B5FA3":Object.freeze({
  sourceId:"V19:DIO-US-MN-ST-PAUL-SAINT-AGNES",name:"Church of Saint Agnes",country:"US",addressNeedle:"535 Thomas Ave",placeId:null,
  lat:44.95972,lng:-93.12333,sourceRef:"nrhp:80002125",sourceUrl:"https://en.wikipedia.org/wiki/Church_of_St._Agnes_(Saint_Paul,_Minnesota)",
  correctedAddress:"Church of Saint Agnes, 535 Thomas Avenue West, Saint Paul, MN 55103, USA",precision:"site",reviewScope:"HISTORIC_CHURCH_SITE_NOT_PARKING_OR_SCHOOL",
  evidence:Object.freeze(["https://www.archspm.org/location/st-agnes-catholic-church/","https://en.wikipedia.org/wiki/Church_of_St._Agnes_(Saint_Paul,_Minnesota)"]),
 }),
 "RG-46B891B2CE6E":Object.freeze({
  sourceId:"AO-AMER-R26-US-03-08",name:"Cathedral of the Immaculate Conception",country:"US",addressNeedle:"Lake Charles",placeId:null,
  lat:30.22659,lng:-93.21666,sourceRef:"nrhp:94001201",sourceUrl:"https://en.wikipedia.org/wiki/Cathedral_of_the_Immaculate_Conception_(Lake_Charles,_Louisiana)",
  correctedAddress:"Cathedral of the Immaculate Conception, 935 Bilbo Street, Lake Charles, LA 70601, USA",precision:"site",reviewScope:"CATHEDRAL_CHURCH_NOT_SEPARATE_SAINT_BERNADETTE_ORATORY",
  evidence:Object.freeze(["https://www.lcdiocese.org/images/pdfs/2024-DOLC-Directory.pdf","https://en.wikipedia.org/wiki/Cathedral_of_the_Immaculate_Conception_(Lake_Charles,_Louisiana)"]),
 }),
 "RG-48A5CF9C3C73":Object.freeze({
  sourceId:"AO-AMER-R26-US-03-06",name:"Cathedral of the Epiphany",country:"US",addressNeedle:"Sioux City",placeId:null,
  lat:42.50094,lng:-96.4069,sourceRef:"osm:node:354389830",sourceUrl:"https://www.openstreetmap.org/node/354389830",
  correctedAddress:"Cathedral of the Epiphany church, 1003 Douglas Street, Sioux City, IA 51105, USA",precision:"site",reviewScope:"CATHEDRAL_CHURCH_AT_1003_DOUGLAS_NOT_1000_OFFICE_NOT_SAINT_BONIFACE",
  evidence:Object.freeze(["https://mapcarta.com/22046960","https://www.sccathedral.org/","https://www.scdiocese.org/parishfinder"]),
 }),
 "RG-014B017E0591":Object.freeze({
  sourceId:"DIO-GB-ARUNDEL-CATERHAM-SACRED-HEART",name:"Sacred Heart of Jesus, Caterham",country:"GB",addressNeedle:"Caterham",placeId:null,
  lat:51.287381,lng:-0.08646362,sourceRef:"historicengland:1294941",sourceUrl:"https://historicengland.org.uk/listing/the-list/list-entry/1294941",
  correctedAddress:"Church of the Sacred Heart of Jesus, Essendene Road, Caterham, CR3 5PA, United Kingdom",precision:"site",reviewScope:"CHURCH_BUILDING_NOT_37_WHYTELEAFE_PRESBYTERY",
  evidence:Object.freeze(["https://caterhamcatholic.co.uk/index.html","https://www.thewrennreport.co.uk/building/E60000278-16b67ed8-6a04-402c-b5fa-602b34d42018/church-of-the-sacred-heart-of-jesus"]),
 }),
 "RG-1A015C23D5BA":Object.freeze({
  sourceId:"AO-AMER-R28-US-25-03",name:"St Boniface Catholic Church",country:"US",addressNeedle:"Sioux City",placeId:null,
  lat:42.50055,lng:-96.41809,sourceRef:"osm:node:354389668",sourceUrl:"https://www.openstreetmap.org/node/354389668",
  correctedAddress:"St. Boniface Church, 703 West 5th Street, Sioux City, IA 51103, USA",precision:"site",reviewScope:"ST_BONIFACE_WORSHIP_SITE_NOT_CATHEDRAL_OF_EPIPHANY_BUILDING",
  evidence:Object.freeze(["https://www.openstreetmap.org/node/354389668"]),
 }),
 "RG-261733295B4C":Object.freeze({
  sourceId:"AO-B39-LOC-IT-B7E3416FBF04",
  name:"Cappella della Madonna di Pompignano",country:"IT",addressNeedle:"Acquarica del Capo LE",placeId:null,
  lat:39.8976619,lng:18.2139344,sourceRef:"unavoce:google-place:ae1bcf27ad68348",
  sourceUrl:"https://www.google.com/maps/place/Cappella+della+Madonna+di+Pompignano/@39.8976619,18.2117457,17z/data=!3m1!4b1!4m5!3m4!1s0x0:0xae1bcf27ad68348!8m2!3d39.8976619!4d18.2139344",precision:"site",
  correctedAddress:"Cappella della Madonna di Pompignano, campagna di Acquarica del Capo, Presicce-Acquarica (LE), Italy",
  reviewScope:"UNAVOCE_LINKED_CHAPEL_PLACE_NOT_DESTROYED_SPECCHIA_SITE",
  evidence:Object.freeze([
    "https://www.unavoceitalia.org/wordpress/messe/lecce/",
    "https://prolocoacquarica.wixsite.com/prolocoacquarica/post/cappella-della-madonna-di-pompignano"
  ]),
 }),
 "RG-2181DD7D9F32":Object.freeze({
  sourceId:"AO-B38-LOC-ES-370B93FA6BC",name:"Capilla de la Adoración Permanente",country:"ES",addressNeedle:"Albacete",placeId:null,
  lat:38.992969,lng:-1.851937,sourceRef:"independent:iglesiacercademi:oratorio-carmen-albacete",sourceUrl:"https://www.iglesiacercademi.com/albacete/oratorio-virgen-del-carmen/",
  correctedAddress:"Oratorio de la Virgen del Carmen, Plaza Mateo Villora 2, 02001 Albacete, Spain",precision:"site",reviewScope:"CARMELITE_THIRD_ORDER_ORATORY_DIOCESAN_ADORATION_NOT_OLD_OCTAVIO_CUARTERO",
  evidence:Object.freeze(["https://www.cofradiasyhermandades.es/fichadiocesis.php?dd=3","https://www.catholicchurchtimes.com/church/oratorio-de-la-virgen-del-carmen-albacete-1d558f9b-08c0-438a-a5b4-82410db44de5"]),
 }),
 "RG-97D731A26655":Object.freeze({
  sourceId:"AO-B39-LOC-PL-8AB74ADAA7D6",name:"Kaplica Najświętszego Serca Jezusowego w Szpitalu Powiatowym",country:"PL",addressNeedle:"Słowackiego 2",placeId:null,
  lat:52.3251,lng:17.5734,sourceRef:"address:sprawdzadres:wrzesnia-slowackiego-2",sourceUrl:"https://sprawdzadres.pl/wielkopolskie/wrzesnia/slowackiego/2",
  correctedAddress:"Szpital Powiatowy, ul. Słowackiego 2, 62-300 Września, Poland; chapel on ground floor, left of main hall",precision:"address",reviewScope:"HOSPITAL_BUILDING_NOT_INTERIOR_CHAPEL_POSITION",
  evidence:Object.freeze(["https://szpitalwrzesnia.pl/strona/index.php/szpital/opieka-duszpasterska","https://gniezno.franciszkanie.pl/kancelaria-gn/srodowisko-tradycji-katolickiej/"]),
 }),
 "RG-19BD1D3D4E73":Object.freeze({
  sourceId:"AO-B39-LOC-HU-CEAC77F2EE49",name:"Árpád-házi Szent Erzsébet Ferences-Templom",country:"HU",addressNeedle:"Szombathely",placeId:null,
  lat:47.23139,lng:16.62503,sourceRef:"miserend:1328",sourceUrl:"https://miserend.hu/templom/1328",
  correctedAddress:"Szent Erzsébet tér 1, 9700 Szombathely, Hungary",precision:"site",reviewScope:"FRANCISCAN_ORDER_OPERATED_NOT_DIOCESAN_PHOTO_QUEUE",
  evidence:Object.freeze(["https://szombathelyiferencesek.hu/","https://www.latinmassdir.org/country/hu/?view=list"]),
 }),
 "RG-2577094CF7E4":Object.freeze({
  sourceId:"AO-B39-LOC-PL-AD5AB9333B4F",name:"Kościół Trójcy Świętej Ormiański",country:"PL",addressNeedle:"Mikołowska 6",placeId:null,
  lat:50.29152,lng:18.66781,sourceRef:"osm:way:187038655",sourceUrl:"https://www.openstreetmap.org/way/187038655",
  correctedAddress:"ul. Mikołowska 6, 44-100 Gliwice, Poland",precision:"site",reviewScope:"ARMENIAN_CATHOLIC_ORDINARIATE_NOT_LATIN_DIOCESAN_PHOTO_QUEUE",
  evidence:Object.freeze(["https://mapcarta.com/W187038655","https://ordynariat.ormianie.pl/"]),
 }),
 "RG-3E135A9E5C09":Object.freeze({
  sourceId:"AO-B38-LOC-ES-43049BF2ACE",name:"Monasterio de Santa María de la Rábida",country:"ES",addressNeedle:"",placeId:null,
  lat:37.20756,lng:-6.92614,sourceRef:"osm:way:205028699",sourceUrl:"https://www.openstreetmap.org/way/205028699",
  correctedAddress:"Monasterio de La Rábida, Palos de la Frontera, Huelva, Spain",precision:"site",reviewScope:"FRANCISCAN_FRIARY_NOT_DIOCESAN_PHOTO_QUEUE",
  evidence:Object.freeze(["https://mapcarta.com/W205028699","https://www.franciscanos.org/monasterio-de-la-rabida/"]),
 }),
 "RG-AE6B9D48B695":Object.freeze({
  sourceId:"AO-B39-LOC-HU-F6266E99F5B3",name:"Szent József Jezsuita Templom",country:"HU",addressNeedle:"Szeged",placeId:null,
  lat:46.25193,lng:20.14357,sourceRef:"osm:way:1418288454",sourceUrl:"https://www.openstreetmap.org/way/1418288454",
  correctedAddress:"Szent József jezsuita templom, Szeged, Hungary",precision:"site",reviewScope:"JESUIT_ORDER_OPERATED_NOT_DIOCESAN_PHOTO_QUEUE",
  evidence:Object.freeze(["https://mapcarta.com/W1418288454","https://jezsuita.hu/"]),
 }),
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
     !/^(?:osm:(?:way|node):\d+|usgs:gnis:\d+|geonames:\d+|rijksmonument:\d+|miserend:\d+|kirchbau:\d+|odtur:\d+|turismoroma:\d+|independent:[a-z0-9-]+|heritage:pamiatkynaslovensku:leonarda-dolany|independent:iglesiacercademi:oratorio-carmen-albacete|address:sprawdzadres:wrzesnia-slowackiego-2|unavoce:google-place:[a-z0-9]+|independent:sacristan-san-roque-santiago|commons:object-location:[a-z0-9-]+|churcheslist:[a-z0-9-]+|nrhp:\d+|historicengland:\d+)$/.test(newPin.sourceRef)||
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
  // Correct the R49 display typo for this exact source-backed La Crosse
  // shrine only. Do not rewrite the frozen source, pin or any other site.
  const correctedLaCrosse=anchor==="RG-ACCD4654B950"&&
    sourceIds.length===1&&sourceIds[0]==="AO-AMER-R28-US-23-05"&&
    T(name)==="Shrine of Our Lady of Guadalupe"&&country==="US"&&
    T(description)==="5250 Justin Road, La Crosse, WI 54601"&&
    sourceUrls.includes("https://guadalupeshrine.org/hours-locations/");
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
    ...(correctedLaCrosse?{
     subtitle:"La Crosse, WI · US",
     address:Object.freeze({formatted:T(description)}),
     note:T(selected.note)+" Verified exact shrine address; frozen R49 locality contains a display typo.",
    }:{}),
    ...(review||newPin?{
     geo:siteGeo,
     address:Object.freeze({formatted:newPin?.correctedAddress||T(description)}),
     note:T(selected.note)+" Site marker cross-checked against the physical church site, not a verified entrance."+
      (newPin?.correctedAddress?" Source-master address was a mailing address; corrected visitor church address used.":""),
    }:{}),
    physical_group_id:anchor,country_code:country,source_location_description:T(description),source_ids:Object.freeze([...sourceIds]),
    physical_site_source:"CL2_MASTER",source_links:Object.freeze(source_links),
    search_text,affiliation_scope:"SOURCE_LABEL_ONLY",
   }));
  }else{
   unmapped++;
   const affiliationName=T(affiliation)||"Source affiliation not established";
   const community_id=family(affiliationName,mapAffiliation);
   result.push(Object.freeze({
    item_id:"tlm:cl2:"+anchor,source_id:sourceIds[0],
    physical_group_id:anchor,country_code:country,source_location_description:T(description),source_ids:Object.freeze([...sourceIds]),
    physical_site_source:"CL2_MASTER",lens:"tlm",kind:"TLM_VENUE",
    community_id,preliminary_group:"UNKNOWN",affiliation_scope:"SOURCE_LABEL_ONLY",
    eyebrow:affiliationName,status:"RESEARCH-LISTED · MASS UNVERIFIED",
    title:T(name),subtitle:[newPin?.correctedAddress||T(description),country].filter(Boolean).join(" · "),
    summary:"Physical site recorded in the research master. Current traditional Mass use, the minister, liturgical books and timetable have not been independently verified.",
    summary_fr:"Lieu physique répertorié dans la base de recherche. La célébration actuelle de la messe traditionnelle, son célébrant, les livres liturgiques et les horaires n’ont pas été vérifiés indépendamment.",
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
