const stripe =  require("@stripe/stripe-js");

let stripePromise = null;

function getStripe() {
  if (!stripePromise) {
    stripePromise = stripe.loadStripe(process.env.STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise;
}

module.exports = { getStripe };