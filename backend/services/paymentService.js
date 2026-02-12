require("dotenv").config();
const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function processPayment(payload) {
  const { amount, currency = "usd" } = payload;

  if (!amount) {
    throw new Error("Payment amount missing");
  }

  await stripe.paymentIntents.create({
    amount,
    currency,

    // ✅ FORCE non-redirect card payments
    automatic_payment_methods: {
      enabled: true,
      allow_redirects: "never"
    },

    // ✅ Explicit test card
    payment_method: "pm_card_visa",

    confirm: true
  });
}

module.exports = { processPayment };



