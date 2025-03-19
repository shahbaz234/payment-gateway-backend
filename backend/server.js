import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import webhookRoutes from "./routes/webhookRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import rateLimit from "express-rate-limit";

const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 5, 
  message: "Too many payment attempts, please try again later.",
});

app.use("/api/payments", paymentLimiter);


app.use("/api/admin", adminRoutes);

// Webhooks must use raw body parser
app.use("/api/webhooks", webhookRoutes);

// Go to Stripe Dashboard → Developers → Webhooks
// Click "Add Endpoint" → Enter URL:
// http://your-backend-url/api/webhooks/stripe

import { Server } from "socket.io";
import http from "http";

// Create HTTP Server
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

// Handle WebSocket Connection
io.on("connection", (socket) => {
  console.log("Admin connected:", socket.id);
});

// Emit Transaction Updates
export const emitTransactionUpdate = (transaction) => {
  io.emit("transactionUpdate", transaction);
};



dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect Database
connectDB();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/payments", paymentRoutes);

// Server Listening
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
