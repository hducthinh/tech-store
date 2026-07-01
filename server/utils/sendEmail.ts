// server/utils/sendEmail.js
import nodemailer from "nodemailer";

/**
 * Gửi email qua SMTP (Gmail App Password hoặc bất kỳ SMTP nào).
 * Cấu hình qua biến môi trường: EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS
 */
export const sendEmail = async ({ to, subject, html }) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: parseInt(process.env.EMAIL_PORT || "587"),
    secure: false, // TLS
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"TechStore" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};

