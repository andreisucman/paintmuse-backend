Parse.Cloud.define("fetchEditImage", async (req) => {
  const { customerId, limit, fields, page, fetchOnce } =
    req.params;

  const query = new Parse.Query("EditImage");
  
  if (!customerId) return;
  
  query.equalTo("customerId", customerId);
  query.descending("createdAt");
  

  if (fetchOnce) {
    const query = new Parse.Query("EditImage");
    query.descending("createdAt");
    const queryResult = await query.first();
    
    let index;

    if (queryResult) {
      index = queryResult.attributes.index;
    }

    const q = new Parse.Query("EditImage");
    q.equalTo("index", index);
    const qResult = await q.find();

    return qResult.map((image) => image.attributes);
  }

  if (page) {
    query.limit(limit);
    query.skip(Number(limit * (page - 1)));
  }
  query.select(fields);
  const result = await query.find();
  return result.map((element) => element.attributes);
});
