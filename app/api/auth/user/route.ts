import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";
import { ObjectId } from "mongodb";

export async function GET(request: Request) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader) {
    return NextResponse.json(
      { message: "Authorization header is missing." },
      { status: 401 }
    );
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return NextResponse.json({ message: "Token is missing." }, { status: 401 });
  }

  const { decoded, expired } = verifyToken(token);

  if (expired) {
    return NextResponse.json(
      { message: "Token has expired. Please log in again." },
      { status: 401 }
    );
  }
  if (!decoded) {
    return NextResponse.json({ message: "Invalid token." }, { status: 401 });
  }

  const userId = decoded.userId;

  try {
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(userId) });
    if (!user) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    const { password, ...userData } = user;
    return NextResponse.json(
      {
        message: "Success get user data",
        data: { ...userData, iat: decoded.iat, exp: decoded.exp },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
