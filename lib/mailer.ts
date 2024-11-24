import nodemailer from "nodemailer";
import { mailConfig } from "@/config/mail";

const transporter = nodemailer.createTransport({
  ...mailConfig,
});

export const sendEmail = async (to: string, subject: string, body: string) => {
  try {
    await transporter.sendMail({
      from: `${process.env.MAIL_NAME} <${process.env.MAIL_ADDRESS}>`,
      to,
      subject,
      html: body,
    });
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email");
  }
};
