const Parse = require("parse/node");

async function checkIfPrivate(customerId) {
  const User = Parse.Object.extend(Parse.User);
  const query = new Parse.Query(User);
  query.equalTo("customerId", customerId);
  const result = await query.first();

  const tier = result.attributes.customerTier;

  return tier > 0;
}

module.exports = { checkIfPrivate };
