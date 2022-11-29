const { updateQuota } = require("../helpers/updateQuota");

// Stripe requires the raw body to construct the event.
export default async function webhookHandler(event) {
  if (req.method === "POST") {
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

    // Return a response to acknowledge receipt of the event.
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
}
