Parse.Cloud.define("fetchVariateImage", async (req) => {
  const { customerId, limit, fields, sorted, page, fetchOnce } =
    req.params;

  const query = new Parse.Query("VariateImage");

  if (!customerId) return;

  query.equalTo("customerId", customerId);
  query.descending("createdAt");

  if (fetchOnce) {
    const query = new Parse.Query("VariateImage");
    query.descending("createdAt");
    const queryResult = await query.first({ useMasterKey: true });

    let index;

    if (queryResult) {
      index = queryResult.attributes.index;
    }

    const q = new Parse.Query("VariateImage");
    q.equalTo("index", index);
    const qResult = await q.find({ useMasterKey: true });

    return qResult.map((image) => image.attributes);
  }
  if (sorted) {
    query.descending("createdAt");
  }

  if (page) {
    query.limit(limit);
    query.skip(Number(limit * (page - 1)));
  }
  query.select(fields);
  const result = await query.find({ useMasterKey: true });
  
  return result.map((element) => element.attributes);
});
