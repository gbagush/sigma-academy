import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { verifyTokenFromRequest } from "@/lib/jwt";
import { ObjectId } from "mongodb";

export async function GET(request: NextRequest) {
  const verificationResult = await verifyTokenFromRequest(request);

  if (verificationResult instanceof NextResponse) {
    return verificationResult;
  }

  if (verificationResult.decoded.role != "user") {
    return NextResponse.json(
      { message: "Only user can have courses" },
      { status: 403 }
    );
  }

  try {
    const result = await db
      .collection("enrollments")
      .aggregate([
        {
          $match: {
            userId: new ObjectId(verificationResult.decoded.userId),
          },
        },
        {
          $lookup: {
            from: "courses",
            localField: "courseId",
            foreignField: "_id",
            as: "courseDetails",
          },
        },
        {
          $unwind: "$courseDetails",
        },
        {
          $lookup: {
            from: "instructors",
            localField: "courseDetails.instructorId",
            foreignField: "_id",
            as: "instructorDetails",
          },
        },
        {
          $unwind: "$instructorDetails",
        },
        {
          $project: {
            _id: 1,
            userId: 1,
            courseId: 1,
            transactionId: 1,
            enrolledAt: 1,
            courseDetails: {
              _id: 1,
              title: 1,
              thumbnail: 1,
            },
            instructorDetails: {
              _id: 1,
              firstName: 1,
              lastName: 1,
              username: 1,
              profilePicture: 1,
            },
          },
        },
      ])
      .sort({ enrolledAt: -1 })
      .toArray();

    return NextResponse.json(
      { message: "Success getting course data", data: result },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
