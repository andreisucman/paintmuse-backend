Parse.Cloud.define("fetchTextToImage", async (req) => {
  const { customerId, limit, fields, page, style, medium, fetchOnce } =
    req.params;

  const query = new Parse.Query("TextToImage");

  if (customerId) {
    query.equalTo("customerId", customerId);
  }

  query.equalTo("isPrivate", false);
  query.descending("createdAt");

  if (fetchOnce) {
    const query = new Parse.Query("TextToImage");
    query.descending("createdAt");
    const queryResult = await query.first();
    
    let index;

    if (queryResult) {
      index = queryResult.attributes.index;
    }

    const q = new Parse.Query("TextToImage");
    q.equalTo("index", index);
    const qResult = await q.find();

    return qResult.map((image) => image.attributes);
  }

  // if (style) {
  //   query.equalTo("style", style);
  // }

  // if (medium) {
  //   query.equalTo("medium", medium);
  // }

  if (page) {
    query.limit(limit);
    query.skip(Number(limit * (page - 1)));
  }
  query.select(fields);
  const result = await query.find();
  return result.map((element) => element.attributes);
});
