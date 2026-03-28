import twilio from "twilio";
import "dotenv/config";
import { TWILIO_CONFIG } from "../config/constants.js";

const client = twilio(TWILIO_CONFIG.SID, TWILIO_CONFIG.AUTH_TOKEN);

export const sendSMSOtp = async (phone, otp) => {
    console.log("hello",client)
    await client.messages.create({
        body: `Your OTP is ${otp}`,
        from: TWILIO_CONFIG.PHONE_NUMBER,
        to: `+91${phone}`
    });
};

export const sendWhatsAppOtp = async (phone, otp) => {
    await client.messages.create({
        body: `Your OTP is ${otp}`,
        from: `whatsapp:+14155238886`,
        to: `whatsapp:+91${phone}`
    });
};