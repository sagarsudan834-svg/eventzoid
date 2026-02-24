const express = require("express");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 5000;

// Razorpay instance
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Test Route
app.get("/", (req, res) => {
    res.send("Backend is running 🚀");
});

// Create Order
app.post("/create-order", async (req, res) => {
    const { name, email, mobile } = req.body;

    if (!name || !email || !mobile) {
        return res.status(400).json({ error: "Missing details" });
    }

    const options = {
        amount: 50000,
        currency: "INR",
        receipt: "receipt_" + Date.now(),
        notes: { name, email, mobile }
    };

       try {
        const order = await razorpay.orders.create(options);
        res.json(order);
    } catch (err) {
        res.status(500).send(err);
    }
});

// Verify Payment
app.post("/verify-payment", (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const generated_signature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(razorpay_order_id + "|" + razorpay_payment_id)
        .digest("hex");

    if (generated_signature === razorpay_signature) {
        res.json({ success: true });
    } else {
        res.status(400).json({ success: false });
    }
});

// Listen
app.listen(PORT, () => {
    console.log("Server running on port", PORT);
});