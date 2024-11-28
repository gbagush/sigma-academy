import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { matchPassword } from "@/lib/password";
import { generateToken } from "@/lib/jwt";

export async function POST(request: NextRequest) {
  const data = await request.json();

  if (!data.email || !data.password) {
    return NextResponse.json({ message: "Invalid request" }, { status: 400 });
  }

  const user = await db
    .collection("instructors")
    .findOne({ email: data.email });

  if (!user) {
    return NextResponse.json(
      { message: "Instructor not found" },
      { status: 404 }
    );
  }

  const isPasswordMatch = await matchPassword(data.password, user.password);

  if (!isPasswordMatch) {
    return NextResponse.json({ message: "Invalid password" }, { status: 401 });
  }

  return NextResponse.json(
    {
      message: "Login successful",
      token: generateToken({
        userId: user._id,
        email: user.email,
        role: "instructor",
      }),
    },
    { status: 200 }
  );
}
