const express = require("express");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const razorpay = new Razorpay({
    key_id: "rzp_test_SJrDigvMJrnB2o",
    key_secret: "x91skZ35T5j03eES15TWiWQ7"
});

// Create Order
app.post("/create-order", async (req, res) => {
    const options = {
        amount: 500,
        currency: "INR",
        receipt: "receipt_" + Date.now()
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
        .createHmac("sha256", "YOUR_SECRET_KEY")
        .update(razorpay_order_id + "|" + razorpay_payment_id)
        .digest("hex");

    if (generated_signature === razorpay_signature) {
        res.json({ success: true });
    } else {
        res.status(400).json({ success: false });
    }
});

app.listen(5000, () => console.log("Server running on port 5000"));