const { updateQuota } = require("../helpers/updateQuota");

// Stripe requires the raw body to construct the event.
async function webhookHandler(event) {
  if (event.type === "checkout.session.completed") {
    const object = event.data.object;

    const params = {
      mode: object.mode,
      amount: object.amount_subtotal,
      email: object.customer_email
    };

    updateQuota(params);
  }

  if (event.type === "customer.subscription.updated") {
    const object = event.data.object;
    console.log("ONE", object.cancel_at_period_end);
    console.log("TWO", event.data.cancel_at_period_end);
    console.log("THREE", event.cancel_at_period_end);

    console.log(event);
  }

}

module.exports = { webhookHandler };
