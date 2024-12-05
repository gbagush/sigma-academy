import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { verifyTokenFromRequest } from "@/lib/jwt";
import { ObjectId } from "mongodb";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const verificationResult = await verifyTokenFromRequest(request);

  if (verificationResult instanceof NextResponse) {
    return verificationResult;
  }

  if (verificationResult.decoded.role != "user") {
    return NextResponse.json(
      { message: "Only user role allowed" },
      { status: 403 }
    );
  }

  let courseId;
  try {
    courseId = new ObjectId(params.id);
  } catch (error) {
    return NextResponse.json({ message: "Invalid id format" }, { status: 400 });
  }

  try {
    const enrollment = await db.collection("enrollments").findOne({
      userId: new ObjectId(verificationResult.decoded.userId),
      courseId: courseId,
    });

    if (!enrollment) {
      return NextResponse.json(
        {
          message: "Only enrollers can create reviews",
        },
        { status: 403 }
      );
    }

    const data = await request.formData();

    const ratingStr = data.get("rating");
    const review = data.get("review");

    const rating = Number(ratingStr);

    if (isNaN(rating) || rating < 1 || rating > 5) {
      return NextResponse.json(
        { message: "Rating must be a number between 1 and 5" },
        { status: 400 }
      );
    }

    const result = await db.collection("reviews").updateOne(
      {
        userId: new ObjectId(verificationResult.decoded.userId),
        courseId: courseId,
      },
      {
        $set: {
          rating,
          review,
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    );

    if (result.upsertedCount > 0) {
      return NextResponse.json(
        { message: "Review created successfully" },
        { status: 201 }
      );
    } else {
      return NextResponse.json(
        { message: "Review updated successfully" },
        { status: 200 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  let courseId;
  try {
    courseId = new ObjectId(params.id);
  } catch (error) {
    return NextResponse.json({ message: "Invalid id format" }, { status: 400 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "0", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);

  if (page < 0 || limit < 1) {
    return NextResponse.json(
      { message: "Page and max must be positive integers" },
      { status: 400 }
    );
  }

  if (limit > 50) {
    return NextResponse.json({ error: "Limit to big" }, { status: 400 });
  }

  try {
    const statsData = await db
      .collection("reviews")
      .aggregate([
        { $match: { courseId } },
        {
          $group: {
            _id: null,
            totalCount: { $sum: 1 },
            averageRating: { $avg: "$rating" },
          },
        },
        {
          $project: {
            _id: 0,
            totalCount: 1,
            averageRating: 1,
          },
        },
      ])
      .toArray();

    const stats = statsData[0] || {
      totalCount: 0,
      averageRating: null,
    };

    const reviews = await db
      .collection("reviews")
      .aggregate([
        { $match: { courseId } },
        {
          $sort: { updatedAt: -1 },
        },
        {
          $skip: page * limit,
        },
        {
          $limit: limit,
        },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "userDetails",
          },
        },
        {
          $unwind: {
            path: "$userDetails",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            _id: 1,
            userId: 1,
            courseId: 1,
            rating: 1,
            review: 1,
            updatedAt: 1,
            userDetails: {
              _id: "$userDetails._id",
              firstName: "$userDetails.firstName",
              lastName: "$userDetails.lastName",
              username: "$userDetails.username",
              profilePicture: "$userDetails.profilePicture",
            },
          },
        },
      ])
      .toArray();

    return NextResponse.json({
      message: "Success getting review data",
      data: {
        reviews,
        total: stats.totalCount,
        currentPage: page,
        limit: limit,
        average: stats.averageRating,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
