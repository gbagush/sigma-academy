import { customAlphabet } from "nanoid";

export const randomUsername = () => {
  const nanoid = customAlphabet(
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890",
    7
  );

  return nanoid();
};

export const randomOTP = () => {
  const nanoid = customAlphabet("123456789", 6);

  return nanoid();
};

export const randomCertificateCode = () => {
  const nanoid = customAlphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890", 5);

  return nanoid();
};
