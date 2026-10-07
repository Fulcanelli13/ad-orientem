export const APOSTOLATE_SOURCE_REGISTRY_VERSION="APOSTOLATE_SOURCE_REGISTRY_V1";

export const APOSTOLATE_SOURCES=Object.freeze({
  "TRENT-IV-SCRIPTURE-TRADITION":Object.freeze({
    id:"TRENT-IV-SCRIPTURE-TRADITION",
    authority:"ECUMENICAL_COUNCIL",
    work:"Council of Trent · Session IV",
    locator:"Decree Concerning the Canonical Scriptures · 8 April 1546",
    url:"https://www.ewtn.com/catholicism/library/decree-concerning-the-canonical-scriptures-1494",
    use:"Scripture and unwritten Apostolic traditions as received and preserved in the Church",
  }),
  "TRENT-XIII-EUCHARIST":Object.freeze({
    id:"TRENT-XIII-EUCHARIST",
    authority:"ECUMENICAL_COUNCIL",
    work:"Council of Trent · Session XIII",
    locator:"Decree and Canons on the Most Holy Sacrament of the Eucharist · especially canons 1–2",
    url:"https://www.ewtn.com/catholicism/library/thirteenth-session-of-the-council-of-trent-1479",
    use:"Real Presence and transubstantiation",
  }),
  "TRENT-XIV-PENANCE":Object.freeze({
    id:"TRENT-XIV-PENANCE",
    authority:"ECUMENICAL_COUNCIL",
    work:"Council of Trent · Session XIV",
    locator:"Doctrine on the Sacrament of Penance · chapters V–VI; canons VI, IX–X",
    url:"https://www.ewtn.com/catholicism/library/fourteenth-session-of-the-council-of-trent-1480",
    use:"Sacramental confession and priestly absolution",
  }),
  "TRENT-XXII-MASS":Object.freeze({
    id:"TRENT-XXII-MASS",
    authority:"ECUMENICAL_COUNCIL",
    work:"Council of Trent · Session XXII",
    locator:"Doctrine Concerning the Sacrifice of the Mass · chapter II",
    url:"https://www.ewtn.com/catholicism/library/twentysecond-session-of-the-council-of-trent-1489",
    use:"Identity of the sacrifice of the Mass and Calvary; distinct manner of offering",
  }),
  "TRENT-XXV-SAINTS-PURGATORY":Object.freeze({
    id:"TRENT-XXV-SAINTS-PURGATORY",
    authority:"ECUMENICAL_COUNCIL",
    work:"Council of Trent · Session XXV",
    locator:"Decree Concerning Purgatory; Invocation, Veneration and Relics of Saints and Sacred Images",
    url:"https://www.ewtn.com/catholicism/library/twentyfifth-session-of-the-council-of-trent-1492",
    use:"Intercession of saints, lawful invocation, Purgatory and suffrages for the dead",
  }),
  "VATICAN-I-PASTOR-AETERNUS":Object.freeze({
    id:"VATICAN-I-PASTOR-AETERNUS",
    authority:"ECUMENICAL_COUNCIL",
    work:"First Vatican Council · Pastor aeternus",
    locator:"Chapter IV · 18 July 1870",
    url:"https://www.vatican.va/archive/hist_councils/i-vatican-council/documents/vat-i_const_18700718_pastor-aeternus_la.html",
    use:"Scope and conditions of papal infallibility",
  }),
  "LEO-XIII-PROVIDENTISSIMUS":Object.freeze({
    id:"LEO-XIII-PROVIDENTISSIMUS",
    authority:"PAPAL_MAGISTERIUM",
    work:"Leo XIII · Providentissimus Deus",
    locator:"18 November 1893 · opening doctrinal exposition",
    url:"https://www.vatican.va/content/leo-xiii/en/encyclicals/documents/hf_l-xiii_enc_18111893_providentissimus-deus.html",
    urlFr:"https://www.vatican.va/content/leo-xiii/fr/encyclicals/documents/hf_l-xiii_enc_18111893_providentissimus-deus.html",
    use:"Inspiration of Scripture and its transmission in written books and unwritten Tradition",
  }),
  "PIUS-XII-MEDIATOR-DEI":Object.freeze({
    id:"PIUS-XII-MEDIATOR-DEI",
    authority:"PAPAL_MAGISTERIUM",
    work:"Pius XII · Mediator Dei",
    locator:"20 November 1947 · especially §§60–61",
    url:"https://www.vatican.va/content/pius-xii/en/encyclicals/documents/hf_p-xii_enc_20111947_mediator-dei.html",
    use:"Latin as a sign of unity and safeguard of doctrine; vernacular not intrinsically excluded",
  }),
  "ST-PIUS-X-CATECHISM-FR":Object.freeze({
    id:"ST-PIUS-X-CATECHISM-FR",
    authority:"CATECHETICAL_PRIMARY",
    work:"Catechism of St Pius X · French traditional witness",
    locator:"Doctrine, sacraments, Church and last things",
    url:"https://laportelatine.org/wp-content/uploads/2020/06/idx-catechisme-saint-pie-x.pdf",
    use:"Traditional catechetical explanation and French terminology",
  }),
  "PENNY-CATECHISM":Object.freeze({
    id:"PENNY-CATECHISM",
    authority:"PEDAGOGICAL_SECONDARY",
    work:"Penny Catechism",
    locator:"Doctrinal questions and apologetic appendices",
    url:"https://fsspx.ie/sites/default/files/documents/penny_catechism_-_fatima_centre.pdf",
    use:"Concise pedagogical donor; never sole doctrinal authority",
  }),
  "CAFFERATA-CATECHISM":Object.freeze({
    id:"CAFFERATA-CATECHISM",
    authority:"PEDAGOGICAL_SECONDARY",
    work:"Canon Cafferata · The Catechism Explained",
    locator:"Expanded catechetical explanations",
    url:"https://fsspx.ie/sites/default/files/documents/canon_cafferata_reprint_211117.pdf",
    use:"Explanatory donor; never sole doctrinal authority",
  }),
});

export function getApostolateSource(id){
  return APOSTOLATE_SOURCES[String(id??"").trim()]??null;
}

export function unresolvedApostolateSourceIds(ids=[]){
  return [...new Set(ids.filter(id=>!getApostolateSource(id)))];
}
