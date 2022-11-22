Parse.Cloud.define("validateUser", async ({ user }) => {
  const query = new Parse.Query("Customers");
  query.equalTo("objectId", user.objectId);
  const result = await query.first();

  if (!result) return false;

  const balance = result.attributes.balance;

  if (balance < 0.5) return false;

  return true;
});
