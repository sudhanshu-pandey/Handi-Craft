import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    phone: {
        type: String,
        required: true,
        unique: true
    },
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
    refreshTokens: [String]
}, { timestamps: true });

const User = mongoose.model("User", userSchema);
export default User;