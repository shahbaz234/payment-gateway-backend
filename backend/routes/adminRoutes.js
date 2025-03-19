import express from "express";
import Transaction from "../models/Transaction.js";
import User from "../models/User.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

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
