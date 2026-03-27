import twilio from "twilio";
import "dotenv/config";

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

export const sendSMSOtp = async (phone, otp) => {
    console.log("hello",client)
    await client.messages.create({
        body: `Your OTP is ${otp}`,
        from: process.env.TWILIO_PHONE_NUMBER,
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