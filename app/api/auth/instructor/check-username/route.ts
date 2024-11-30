import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { validateUsername } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username");

  if (!username) {
    return NextResponse.json(
      { message: "Username is required." },
      { status: 400 }
    );
  }

  if (validateUsername(username).length > 0) {
    return NextResponse.json(
      { message: `Invalid username format` },
      { status: 400 }
    );
  }

  try {
    const user = await db.collection("instructors").findOne({ username });

    if (user) {
      return NextResponse.json(
        { message: "Username already exists." },
        { status: 409 }
      );
    } else {
      return NextResponse.json(
        { message: "Username is available." },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
