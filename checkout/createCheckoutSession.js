const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

async function createCheckoutSession(req, res) {
  if (req.method === "POST") {
    try {
      const session = await stripe.checkout.sessions.create({
        mode: req.body.mode,
        payment_method_types: ["card"],
        line_items: req.body.items,
        success_url: `${req.headers.origin}/postpayment?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.origin}/pricing`,
        customer_email: req.body.email,
      });

      res.status(200).json(session);
    } catch (err) {
      res.status(500).json({ statusCode: 500, message: err.message });
    }
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
}

module.exports = { createCheckoutSession };
