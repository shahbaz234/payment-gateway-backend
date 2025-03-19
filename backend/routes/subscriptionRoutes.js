import express from "express";
import Stripe from "stripe";
import authMiddleware from "../middleware/authMiddleware.js";
import User from "../models/User.js";

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

router.post("/subscribe", authMiddleware, async (req, res) => {
  try {
    const { planId, paymentMethodId } = req.body;
    const user = await User.findById(req.user.id);

    const customer = await stripe.customers.create({
      email: user.email,
      payment_method: paymentMethodId,
      invoice_settings: { default_payment_method: paymentMethodId },
    });

    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ plan: planId }],
      expand: ["latest_invoice.payment_intent"],
    });

    user.subscriptionId = subscription.id;
    await user.save();

    res.json({ msg: "Subscription successful", subscription });
  } catch (error) {
    res.status(500).json({ msg: "Subscription failed", error });
  }
});
