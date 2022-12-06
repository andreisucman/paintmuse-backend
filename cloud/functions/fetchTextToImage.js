Parse.Cloud.define("fetchTextToImage", async (req) => {
  const { customerId, limit, fields, page, fetchOnce } = req.params;

  if (customerId) {
    const public = new Parse.Query("TextToImage");
    public.equalTo("isPrivate", false);

    const owner = new Parse.Query("TextToImage");
    owner.equalTo("customerId", customerId);
    owner.equalTo("isPrivate", true);

    if (fetchOnce) {
      let index;
      const q = Parse.Query.or(public, owner);
      q.descending("createdAt");
      const r = await q.first();

      if (r) {
        index = r.attributes.index;
      }

      const newQ = Parse.Query.or(public, owner);
      newQ.equalTo("index", index);
      newQ.select(fields);

      const qResult = await newQ.find({ useMasterKey: true });
      return qResult.map((image) => image.attributes);
    } else {
      const q = Parse.Query.or(public, owner);
      q.descending("createdAt");
      q.select(fields);

      if (page) {
        q.limit(limit);
        q.skip(Number(limit * (page - 1)));
      }

      const result = await q.find({ useMasterKey: true });
      return result.map((element) => element.attributes);
    }
  } else {
    if (fetchOnce) {
      let index;
      const q = new Parse.Query("TextToImage");
      q.descending("createdAt");
      query.equalTo("isPrivate", false);
      const r = await q.first();

      if (r) {
        index = r.attributes.index;
      }

      const newQ = new Parse.Query("TextToImage");;
      newQ.equalTo("index", index);
      newQ.select(fields);

      const qResult = await newQ.find({ useMasterKey: true });
      return qResult.map((image) => image.attributes);
    } else {
      const query = new Parse.Query("TextToImage");
      query.equalTo("isPrivate", false);
      query.descending("createdAt");

      if (page) {
        query.limit(limit);
        query.skip(Number(limit * (page - 1)));
      }

      query.select(fields);
      const result = await query.find({ useMasterKey: true });
      return result.map((element) => element.attributes);
    }
  }
});
