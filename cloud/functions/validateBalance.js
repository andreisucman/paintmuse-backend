Parse.Cloud.define("validateBalance", async (req, res) => {
  const { customerId, count } = req.params;

  const User = Parse.Object.extend(Parse.User);
  const q = new Parse.Query(User);
  q.equalTo("customerId", customerId);
  const result = await q.first({ useMasterKey: true });

  if (result.attributes.prepQuotaImg < count) {
    if (result.attributes.subQuotaImg < count) {
      return false;
    }
  } else {
    return true;
  }
});
