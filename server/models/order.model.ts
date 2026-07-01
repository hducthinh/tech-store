// server/models/order.model.js
import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
    },
    name: { type: String, required: true },
    image: { type: String },
    price: { type: Number, required: true }, // Chụp lại giá tại thời điểm mua
    quantity: { type: Number, required: true, min: 1 },
    selectedSpecs: { type: Map, of: String, default: {} },
});

const orderSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        items: [orderItemSchema],
        shippingAddress: {
            fullName: { type: String, required: true },
            phone: { type: String, required: true },
            address: { type: String, required: true },
        },
        paymentMethod: {
            type: String,
            required: true,
            enum: ["COD", "BANK_TRANSFER", "CREDIT_CARD"],
            default: "COD",
        },
        totalAmount: {
            type: Number,
            required: true,
            min: 0,
        },
        isPaid: {
            type: Boolean,
            default: false,
        },
        paidAt: { type: Date },
        status: {
            type: String,
            enum: ["PENDING_PAYMENT", "PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "COMPLETED", "CANCELLED"],
            default: "PENDING",
        },
        isDelivered: {
            type: Boolean,
            default: false,
        },
        deliveredAt: { type: Date },
        statusHistory: [
            {
                status: { type: String, required: true },
                updatedAt: { type: Date, default: Date.now },
                note: { type: String },
            },
        ],
    },
    {
        timestamps: true,
    }
);

// Index để load lịch sử đơn hàng của user nhanh hơn
orderSchema.index({ userId: 1, createdAt: -1 });

const Order = mongoose.model("Order", orderSchema, "orders");
export default Order;

