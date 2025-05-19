import jwt, { SignOptions } from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

const SECRET_KEY: string = process.env.JWT_SECRET || "D3f4ul7-53Cr37-k3y";

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

export function generateToken(
  payload: string | object | Buffer,
  expiresIn: SignOptions["expiresIn"] = "3d"
): string {
  const options: SignOptions = { expiresIn };
  return jwt.sign(payload, SECRET_KEY, options);
}

export function verifyToken(token: string): {
  decoded: JWTPayload | null;
  expired: boolean;
} {
  try {
    const decoded = jwt.verify(token, SECRET_KEY) as JWTPayload;
    return { decoded, expired: false };
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return { decoded: null, expired: true };
    }
    console.error("Token verification failed:", error);
    return { decoded: null, expired: false };
  }
}

export async function verifyTokenFromRequest(
  request: NextRequest
): Promise<{ decoded: JWTPayload } | NextResponse> {
  const token = request.cookies.get("session_token");

  if (!token) {
    return NextResponse.json(
      { message: "Session token is missing." },
      { status: 401 }
    );
  }

  const { decoded, expired } = verifyToken(token.value);

  if (expired) {
    return NextResponse.json(
      { message: "Token has expired. Please log in again." },
      { status: 401 }
    );
  }

  if (!decoded) {
    return NextResponse.json({ message: "Invalid token." }, { status: 401 });
  }

  return { decoded };
}
