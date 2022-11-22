Parse.Cloud.define("updateField", async (req) => {
  const { field, value, userId } = req.params;
  const User = Parse.Object.extend(Parse.User);
  const query = new Parse.Query(User);

  let result = await query.get(userId, { useMasterKey: true });
  if (!result) new Error("No user found!");

  result.set(field, value);

  if (field === "email") {
    result.set("username", value);
  }

  if (field === "password") {
    result.set("passwordLength", value.length);
  }

  try {
    await result.save(null, { useMasterKey: true });
    return result.attributes;
  } catch (err) {
    return err.message;
  }
});
