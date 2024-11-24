import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET as string;

export interface Decoded {
  userId: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

export function generateToken(
  payload: object,
  expiresIn: string = "3d"
): string {
  return jwt.sign(payload, SECRET_KEY, { expiresIn });
}

export function verifyToken(token: string): {
  decoded: Decoded | null;
  expired: boolean;
} {
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    return { decoded, expired: false };
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return { decoded: null, expired: true };
    }
    console.error("Token verification failed:", error);
    return { decoded: null, expired: false };
  }
}
