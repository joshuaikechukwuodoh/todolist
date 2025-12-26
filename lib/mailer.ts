import nodemailer from "nodemailer";

const mailerEmail = process.env.MAILER_EMAIL;
const mailerPassword = process.env.MAILER_PASSWORD;

if (!mailerEmail || !mailerPassword) {
  console.warn(
    "⚠️ MAILER_EMAIL or MAILER_PASSWORD is not defined in environment variables."
  );
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: mailerEmail,
    pass: mailerPassword,
  },
  logger: true,
  debug: true,
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
