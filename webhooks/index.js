const Parse = require("parse/node");
require("dotenv").config();
const { updateQuota } = require("../helpers/updateQuota");

// Stripe requires the raw body to construct the event.
async function webhookHandler(event) {
  if (event.type === "checkout.session.completed") {
    const object = event.data.object;

    const params = {
      mode: object.mode,
      amount: object.amount_subtotal,
      email: object.customer_email,
      customer: object.customer,
    };

    updateQuota(params);
  }

  if (event.type === "customer.subscription.updated") {
    Parse.initialize(process.env.APP_ID, undefined, process.env.MASTER_KEY);

    const object = event.data.object;

    const User = Parse.Object.extend(Parse.User);
    const query = new Parse.Query(User);
    query.equalTo("stripeCustId", object.customer);
    const result = await query.first();

    console.log(result);

    if (!result.attributes.cancelledPlan) {
      result.set("cancelledPlan", result.attributes.customerPlan);
      result.set("customerPlan", 0);
      await result.save(null, { useMasterKey: true });
    } else {
      result.set("customerPlan", result.attributes.cancelledPlan);
      result.set("cancelledPlan", null);
      await result.save(null, { useMasterKey: true });
    }
  }
}

module.exports = { webhookHandler };
