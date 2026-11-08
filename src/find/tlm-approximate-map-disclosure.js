// Shared user-facing warning for owner-approved *illustrative* R28 geography.
// Not an invitation to navigate to a coordinate or an assertion of present Mass.
const T=v=>String(v??"");
const L=(language,en,fr)=>language==="fr"?fr:en;
export const isR28ApproximateMarker=item=>T(item?.geo?.source_ref).startsWith("independent:r28-owner-approx-")&&
  item?.geo?.precision==="locality"&&item?.geo?.approximate===true;
const kind=item=>{
 const scope=T(item?.geo?.review_scope);
 if(scope.startsWith("SCHEMATIC_MATECK_MAVI_"))return "schematic";
 if(scope.startsWith("TENTATIVE_PONGARA_BISSOBINAM_"))return "tentativeVillage";
 if(scope.startsWith("SOURCE_REPORTED_POPRAD_TOWN_"))return "disputedTown";
 if(scope.startsWith("BOOTLE_TOWN_ONLY_"))return "historicalTown";
 return "city";
};
export const isIllustrativeLocalityMarker=item=>item?.geo?.precision==="locality"&&item?.geo?.approximate===true;
export const tlmApproximateMapSource=item=>isR28ApproximateMarker(item)?"r28":
 isIllustrativeLocalityMarker(item)?"locality":null;
export function tlmApproximateMapLabel(item,language="en"){
 // R28 keeps its more precise editorial warnings. Older locality overlays
 // must also be labelled in the map rail and cards, not silently treated as
 // navigation-grade church locations or conflated with an unverified Mass.
 if(!isR28ApproximateMarker(item))return isIllustrativeLocalityMarker(item)?
   L(language,"Illustrative locality · entrance unverified","Localité indicative · entrée non vérifiée"):null;
 switch(kind(item)){
  case "schematic":return L(language,"Schematic area · Mass unverified","Zone schématique · messe non vérifiée");
  case "tentativeVillage":return L(language,"Tentative village · Mass unverified","Village incertain · messe non vérifiée");
  case "disputedTown":return L(language,"Disputed source town · Mass unverified","Ville source contestée · messe non vérifiée");
  case "historicalTown":return L(language,"Historical town marker · Mass unverified","Repère historique · messe non vérifiée");
  default:return L(language,"Approximate city · Mass unverified","Ville approximative · messe non vérifiée");
 }
}
export function tlmApproximateMapNotice(item,language="en"){
 if(!isR28ApproximateMarker(item))return null;
 switch(kind(item)){
  case "schematic":return L(language,
   "Schematic position near Mateck-Mavi inferred from a relative village description, NOT measured village coordinates or a chapel location. Do not navigate to this pin; search the named mission and confirm before visiting.",
   "Position schématique près de Mateck-Mavi, estimée d'après une description relative, et NON coordonnées mesurées du village ni position de la chapelle. Ne suivez pas ce repère comme itinéraire ; recherchez la mission par son nom et vérifiez avant de vous déplacer.");
  case "tentativeVillage":return L(language,
   "Approximate Pongara village marker: the Bissobilam–Bissobinam name match is uncertain. This does not identify the chapel or verify a current Mass. Search the mission name rather than navigate to the point.",
   "Repère villageois approximatif au Pongara : l'identification Bissobilam–Bissobinam est incertaine. Cela ne localise pas la chapelle et ne confirme aucune messe actuelle. Recherchez la mission par son nom plutôt que de suivre le point.");
  case "disputedTown":return L(language,
   "The original directory says Poprad, but other evidence points to a similarly named chapel in Kálnica. This marker shows only the source-reported town, not a verified church. Do not transfer a Mass time or navigate to the point.",
   "L'annuaire d'origine indique Poprad, mais d'autres sources situent une chapelle du même nom à Kálnica. Ce repère indique seulement la ville citée, non une église vérifiée. N'y associez aucun horaire de messe et ne suivez pas le point comme itinéraire.");
  case "historicalTown":return L(language,
   "Historical source-town marker for Bootle. The possible Holy Spirit church at Ford reportedly closed in 2021; its identity with this directory record is not confirmed. This pin does not establish current Mass or an entrance.",
   "Repère de la ville citée par une source historique, Bootle. L'église possible du Saint-Esprit à Ford aurait fermé en 2021, sans identification certaine avec cette fiche. Ce point ne confirme ni messe actuelle ni entrée.");
  default:return L(language,
   "Illustrative city-centre marker only, NOT the church building or entrance. The directory identity or exact place is not established by this point, and current Mass times are unverified. Search by documented name/address, not GPS coordinates.",
   "Repère indicatif du centre-ville UNIQUEMENT, et NON position du bâtiment ou de l'entrée de l'église. Ce point ne confirme ni l'identité exacte du lieu ni les horaires actuels des messes. Recherchez le nom et l'adresse documentés, pas les coordonnées GPS.");
 }
}
