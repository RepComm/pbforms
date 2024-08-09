//enables collection view for non-admins
//to enable forms field rendering

//hacky and insecure
//create a view collection instead:
//select id, schema from `_collections`

// routerAdd("GET", "/api/schema/:collectionname", (c) => {
//   const collectionName = c.pathParam("collectionname");

//   const collection = $app.dao().findCollectionByNameOrId(collectionName);

//   return c.json(200, {
//     collection,
//   });
// });
