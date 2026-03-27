import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    phone: {
        type: String,
        required: true,
        unique: true
    },
    name: { type: String },
    email: { type: String, unique: true, sparse: true },
    gender: { type: String, enum: ["male", "female", "other"] },
    dob: { type: Date },
    addresses: [
        {
            label: { type: String }, // e.g. Home, Work
            addressLine1: { type: String, required: true },
            addressLine2: { type: String },
            city: { type: String, required: true },
            state: { type: String, required: true },
            postalCode: { type: String, required: true },
            country: { type: String, required: true },
            isDefault: { type: Boolean, default: false }
        }
    ],
    isVerified: {
        type: Boolean,
        default: false
    },
    otp: {
        type: String
    },
    otpExpires: {
        type: Date
    },
    refreshTokens: [String],
    cart: [
        {
            product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
            quantity: { type: Number, default: 1 }
        }
    ]
}, { timestamps: true });

const User = mongoose.model("User", userSchema);
export default User;