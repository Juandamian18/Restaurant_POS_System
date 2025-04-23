const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    customerDetails: {
        name: { type: String, default: 'Walk-in Customer' }, // Make optional, provide default
        phone: { type: String, default: 'N/A' }, // Make optional, provide default
        guests: { type: Number, required: true, default: 1 }, // Keep guests required, add default
    },
    orderStatus: {
        type: String,
        required: true
    },
    orderDate: {
        type: Date,
        default : Date.now()
    },
    bills: {
        total: { type: Number, required: true },
        tax: { type: Number, required: true },
        totalWithTax: { type: Number, required: true }
    },
    items: [],
    table: { type: mongoose.Schema.Types.ObjectId, ref: "Table" },
    paymentMethod: String,
    paymentData: {
        razorpay_order_id: String,
        razorpay_payment_id: String
    }
}, { timestamps : true } );

module.exports = mongoose.model("Order", orderSchema);
