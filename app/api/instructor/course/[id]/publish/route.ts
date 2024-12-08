import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { verifyTokenFromRequest } from "@/lib/jwt";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const verificationResult = await verifyTokenFromRequest(request);

  if (verificationResult instanceof NextResponse) {
    return verificationResult;
  }

  let courseId;
  try {
    courseId = new ObjectId(params.id);
  } catch (error) {
    return NextResponse.json({ message: "Invalid id format" }, { status: 400 });
  }

  try {
    const wallet = await db.collection("wallets").findOne({
      instructorId: new ObjectId(verificationResult.decoded.userId),
    });

    if (!wallet) {
      return NextResponse.json(
        { message: "Create wallet first" },
        { status: 400 }
      );
    }

    const course = await db.collection("courses").findOne({
      _id: courseId,
      instructorId: new ObjectId(verificationResult.decoded.userId),
      publishedAt: null,
    });

    if (!course) {
      return NextResponse.json(
        { message: "Course not found" },
        { status: 404 }
      );
    }

    const requiredFields = [
      course.category,
      course.description,
      course.language,
      course.thumbnail,
      course.title,
      course.sections,
    ];

    const allFieldsValid = requiredFields.every(
      (field) => field !== undefined && field !== null && field !== ""
    );

    if (!allFieldsValid) {
      return NextResponse.json(
        { message: "Course data is incomplete" },
        { status: 400 }
      );
    }

    const result = await db.collection("courses").updateOne(
      {
        _id: courseId,
        instructorId: new ObjectId(verificationResult.decoded.userId),
        publishedAt: null,
      },
      {
        $set: { publishedAt: new Date(), updatedAt: new Date() },
      }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        {
          message:
            "You don't have permission to publish this course or course not found",
        },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { message: "Course published successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
