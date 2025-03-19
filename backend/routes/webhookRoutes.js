import express from "express";
import Stripe from "stripe";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import Transaction from "../models/Transaction.js";

dotenv.config();
const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

router.post(
  "/stripe",
  bodyParser.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];

    try {
      const event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );

      if (event.type === "payment_intent.succeeded") {
        const paymentIntent = event.data.object;

        await Transaction.findOneAndUpdate(
          { paymentId: paymentIntent.id },
          { status: "success" },
          { new: true }
        );

        console.log("✅ Payment Successful:", paymentIntent.id);
      } else if (event.type === "payment_intent.payment_failed") {
        const paymentIntent = event.data.object;

        await Transaction.findOneAndUpdate(
          { paymentId: paymentIntent.id },
          { status: "failed" },
          { new: true }
        );

        console.log("❌ Payment Failed:", paymentIntent.id);
      }

      res.json({ received: true });
    } catch (err) {
      console.error("Webhook Error:", err.message);
      res.status(400).send(`Webhook Error: ${err.message}`);
    }
  }
);

export default router;
