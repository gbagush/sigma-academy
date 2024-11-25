export const mailConfig = {
  host: process.env.MAIL_HOST,
  port: parseInt(process.env.MAIL_PORT || "465", 10),
  secure: process.env.MAIL_SECURE === "true",
  auth: {
    user: process.env.MAIL_ADDRESS,
    pass: process.env.MAIL_PASS,
  },
  tls: {
    ciphers: "SSLv3",
  },
  logger: process.env.NODE_ENV !== "production",
  debug: process.env.NODE_ENV !== "production",
};
