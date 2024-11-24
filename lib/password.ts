import argon2 from "argon2";

export async function hashPassword(password: string): Promise<string> {
  const hashedPassword = await argon2.hash(password);
  return hashedPassword;
}

export async function matchPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  try {
    const isMatch = await argon2.verify(hashedPassword, password);
    return isMatch;
  } catch (err) {
    console.error("Error verifying password:", err);
    return false;
  }
}
