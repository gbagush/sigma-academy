import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { matchPassword } from "@/lib/password";
import { generateToken } from "@/lib/jwt";

export async function POST(request: Request) {
  const data = await request.json();

  if (!data.email || !data.password) {
    return NextResponse.json({ message: "Invalid request" }, { status: 400 });
  }

  const user = await db.collection("users").findOne({ email: data.email });

  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  const isPasswordMatch = await matchPassword(data.password, user.password);

  if (!isPasswordMatch) {
    return NextResponse.json({ message: "Invalid password" }, { status: 401 });
  }

  if (!user.verifiedAt) {
    return NextResponse.json(
      { message: "User  is not verified" },
      { status: 403 }
    );
  }

  return NextResponse.json(
    {
      message: "Login successful",
      token: generateToken({
        userId: user._id,
        email: user.email,
        role: "user",
      }),
    },
    { status: 200 }
  );
}
