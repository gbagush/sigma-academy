import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { verifyTokenFromRequest } from "@/lib/jwt";
import { ObjectId } from "mongodb";

export async function POST(request: NextRequest) {
  const verificationResult = await verifyTokenFromRequest(request);

  if (verificationResult instanceof NextResponse) {
    return verificationResult;
  }

  if (verificationResult.decoded.role != "instructor") {
    return NextResponse.json({ message: "Access denied" }, { status: 403 });
  }

  try {
    const result = await db.collection("courses").insertOne({
      instructorId: new ObjectId(verificationResult.decoded.userId),
      createdAt: new Date(),
    });

    return NextResponse.json(
      {
        message: "Course created successfully",
        data: result.insertedId,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const verificationResult = await verifyTokenFromRequest(request);

  if (verificationResult instanceof NextResponse) {
    return verificationResult;
  }

  if (verificationResult.decoded.role != "instructor") {
    return NextResponse.json({ message: "Access denied" }, { status: 403 });
  }

  try {
    const result = await db
      .collection("courses")
      .find({
        instructorId: new ObjectId(verificationResult.decoded.userId),
      })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(
      {
        message: "Courses retrieved successfully",
        data: result,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
