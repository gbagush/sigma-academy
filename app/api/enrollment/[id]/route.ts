import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { verifyTokenFromRequest } from "@/lib/jwt";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const verificationResult = await verifyTokenFromRequest(request);

  if (verificationResult instanceof NextResponse) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  if (verificationResult.decoded.role !== "user") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  let enrollmentId;
  try {
    enrollmentId = new ObjectId(params.id);
  } catch (error) {
    return NextResponse.json({ message: "Invalid id format" }, { status: 400 });
  }

  try {
    const enrollment = await db.collection("enrollments").findOne({
      _id: enrollmentId,
    });

    if (!enrollment) {
      return NextResponse.json(
        { message: "Enrollment not found" },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        message: "Success getting enrollment data",
        data: enrollment,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
