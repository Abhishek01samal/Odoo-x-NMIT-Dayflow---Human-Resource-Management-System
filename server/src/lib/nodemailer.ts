import nodemailer from "nodemailer";
import { ENV } from "./env.js";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: ENV.EMAIL_USER,
    clientId: ENV.GOOGLE_CLIENT_ID,
    clientSecret: ENV.GOOGLE_CLIENT_SECRET,
    refreshToken: ENV.GMAIL_REFRESH_TOKEN,
  },
});

const connectToTransporter = async () => {
  try {
    await transporter.verify();
    console.log("Transporter connected successfully...");
  } catch (err) {
    console.error("Failed to connect to transporter:", err);
  }
};

export { transporter, connectToTransporter };
