import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const result = await db
      .collection("courses")
      .aggregate([
        {
          $match: {
            publishedAt: { $exists: true },
          },
        },
        {
          $sample: { size: 10 },
        },

        {
          $lookup: {
            from: "instructors",
            localField: "instructorId",
            foreignField: "_id",
            as: "instructorDetails",
          },
        },
        {
          $lookup: {
            from: "categories",
            localField: "category",
            foreignField: "_id",
            as: "categoryDetails",
          },
        },
        {
          $project: {
            _id: 1,
            description: 1,
            language: 1,
            thumbnail: 1,
            title: 1,
            updatedAt: 1,
            discountedPrice: 1,
            price: 1,
            status: 1,
            publishedAt: 1,
            instructorDetails: {
              _id: { $arrayElemAt: ["$instructorDetails._id", 0] },
              firstName: {
                $arrayElemAt: ["$instructorDetails.firstName", 0],
              },
              lastName: { $arrayElemAt: ["$instructorDetails.lastName", 0] },
              profilePicture: {
                $arrayElemAt: ["$instructorDetails.profilePicture", 0],
              },
              username: { $arrayElemAt: ["$instructorDetails.username", 0] },
            },
            categoryDetails: {
              $arrayElemAt: ["$categoryDetails", 0],
            },
          },
        },
      ])
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
