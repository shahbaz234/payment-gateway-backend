import { emitTransactionUpdate } from "../server.js";

router.post("/update-status/:paymentId", authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    const transaction = await Transaction.findOneAndUpdate(
      { paymentId: req.params.paymentId },
      { status },
      { new: true }
    );

    if (!transaction) return res.status(404).json({ msg: "Transaction not found" });

    emitTransactionUpdate(transaction);
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ msg: "Server error" });
  }
});
