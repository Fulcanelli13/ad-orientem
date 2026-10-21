// The Customs Atlas is authoritative for publication and canonical IDs.
// A Network or Calendar link never creates or renames a custom record.
export function publishedCustomFolioId(projection,customId){
 if(typeof customId!=="string"||!customId||customId!==customId.trim())return null;
 const published=projection?.byLens?.traditions?.some(row=>
   row?.raw?.custom?.custom_id===customId&&
   row.raw.custom.publication_state==="PUBLISHED");
 return published?"tradition:custom:"+customId:null;
}
