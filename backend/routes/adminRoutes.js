import express from "express";
import Transaction from "../models/Transaction.js";
import User from "../models/User.js";
import authMiddleware from "../middleware/authMiddleware.js";
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Refund Payment
router.post("/refund/:paymentId", authMiddleware, async (req, res) => {
  try {
    const adminUser = await User.findById(req.user.id);
    if (adminUser.role !== "admin") {
      return res.status(403).json({ msg: "Access Denied" });
    }

    const { paymentId } = req.params;
    const refund = await stripe.refunds.create({ payment_intent: paymentId });

    await Transaction.findOneAndUpdate({ paymentId }, { status: "refunded" });
    res.json({ msg: "Refund issued successfully", refund });
  } catch (error) {
    res.status(500).json({ msg: "Error processing refund", error });
  }
});

const router = express.Router();

const handleRefund = async (paymentId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(`http://localhost:5000/api/admin/refund/${paymentId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Refund Issued!");
      fetchTransactions(); // Refresh data
    } catch (error) {
      alert("Refund Failed!");
    }
  };
  

// Get all transactions (Admin only)
router.get("/revenue", authMiddleware, async (req, res) => {
    try {
      const adminUser = await User.findById(req.user.id);
      if (adminUser.role !== "admin") {
        return res.status(403).json({ msg: "Access Denied" });
      }
  
      const transactions = await Transaction.find({ status: "success" });
      const dailyRevenue = {};
  
      transactions.forEach((tx) => {
        const date = new Date(tx.createdAt).toLocaleDateString();
        dailyRevenue[date] = (dailyRevenue[date] || 0) + tx.amount / 100;
      });
  
      res.json({ labels: Object.keys(dailyRevenue), revenue: Object.values(dailyRevenue) });
    } catch (error) {
      res.status(500).json({ msg: "Server Error" });
    }
  });
  

export default router;
