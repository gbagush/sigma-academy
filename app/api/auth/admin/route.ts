import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { verifyTokenFromRequest } from "@/lib/jwt";
import { MongoError, ObjectId } from "mongodb";
import { validateUsername } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const verificationResult = await verifyTokenFromRequest(request);

  if (verificationResult instanceof NextResponse) {
    return verificationResult;
  }

  const userId = verificationResult.decoded.userId;

  try {
    const user = await db
      .collection("admins")
      .findOne({ _id: new ObjectId(userId) });
    if (!user) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    const { password, ...userData } = user;
    return NextResponse.json(
      {
        message: "Success get user data",
        data: {
          ...userData,
          iat: verificationResult.decoded.iat,
          exp: verificationResult.decoded.exp,
        },
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

export async function PUT(request: NextRequest) {
  const verificationResult = await verifyTokenFromRequest(request);

  if (verificationResult instanceof NextResponse) {
    return verificationResult;
  }

  const { userId } = verificationResult.decoded;
  const data = await request.json();

  const allowedFields = ["firstName", "lastName", "username"];

  const invalidFields = Object.keys(data).filter(
    (field) => !allowedFields.includes(field)
  );

  if (invalidFields.length > 0) {
    return NextResponse.json(
      { message: `Invalid fields: ${invalidFields.join(", ")}` },
      { status: 400 }
    );
  }

  if (data.firstName === "" || data.lastName === "") {
    return NextResponse.json(
      { message: "First name and last name cannot be empty." },
      { status: 400 }
    );
  }

  if (data.username) {
    if (validateUsername(data.username).length > 0) {
      return NextResponse.json(
        { message: `Invalid username format` },
        { status: 400 }
      );
    }
  }

  try {
    const updateResult = await db
      .collection("admins")
      .updateOne(
        { _id: new ObjectId(userId) },
        { $set: data },
        { upsert: false }
      );

    if (updateResult.modifiedCount === 0) {
      return NextResponse.json({ message: "No changes made" }, { status: 200 });
    }

    return NextResponse.json(
      { message: "Admin updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof MongoError) {
      if (error.code === 11000) {
        return NextResponse.json(
          { message: "Username already exists" },
          { status: 409 }
        );
      }
    }

    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
