import "dotenv/config";
import nodemailer from "nodemailer";

const mailerEmail = process.env.MAILER_EMAIL;
const mailerPassword = process.env.MAILER_PASSWORD;

const transporter = nodemailer.createTransport({
  host: "smtp.hostinger.com",
  port: 465,
  secure: true,
  auth: {
    user: mailerEmail,
    pass: mailerPassword,
  },
  logger: process.env.NODE_ENV !== "production",
  debug: process.env.NODE_ENV !== "production",
});

interface SendMailParams {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

const sendMail = async ({ to, subject, text, html }: SendMailParams) => {
  const mailOptions = {
    from: mailerEmail,
    to,
    subject,
    text,
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to send email: ${error.message}`);
    }
    throw new Error("Failed to send email");
  }
};

export default sendMail;
