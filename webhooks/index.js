const { updateQuota } = require("../helpers/updateQuota");

// Stripe requires the raw body to construct the event.
async function webhookHandler(event) {
  if (event.type === "checkout.session.completed") {
    const object = event.data.object;

    const params = {
      mode: object.mode,
      amount: object.amount_subtotal,
      email: object.customer_email,
    };

    console.log("PARAMS ARE", params);
    updateQuota(params);
  }
}

module.exports = { webhookHandler };
