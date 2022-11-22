const Parse = require("parse/node");

async function checkIfPrivate(customerId) {
  const query = new Parse.Query("Customers");
  query.equalTo("customerId", customerId);
  const result = await query.first();

  const tier = result.attributes.customerTier;

  return tier > 0;
}

module.exports = { checkIfPrivate };
