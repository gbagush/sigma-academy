import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { verifyTokenFromRequest } from "@/lib/jwt";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  let certificateId;
  try {
    certificateId = new ObjectId(params.id);
  } catch (error) {
    return NextResponse.json({ message: "Invalid id format" }, { status: 400 });
  }

  try {
    const certificate = await db
      .collection("certificates")
      .aggregate([
        {
          $match: {
            _id: certificateId,
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "reciepentId",
            foreignField: "_id",
            as: "reciepentDetails",
          },
        },
        {
          $unwind: {
            path: "$reciepentDetails",
            preserveNullAndEmptyArrays: true,
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
          $unwind: {
            path: "$courseDetails",
            preserveNullAndEmptyArrays: true,
          },
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
          $unwind: {
            path: "$instructorDetails",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            _id: 1,
            code: 1,
            createdAt: 1,
            name: 1,
            reciepentDetails: {
              _id: "$reciepentDetails._id",
              firstName: "$reciepentDetails.firstName",
              lastName: "$reciepentDetails.lastName",
            },
            courseDetails: {
              _id: "$courseDetails._id",
              title: "$courseDetails.title",
            },
            instructorDetails: {
              _id: "$instructorDetails._id",
              firstName: "$instructorDetails.firstName",
              lastName: "$instructorDetails.lastName",
            },
          },
        },
      ])
      .toArray();

    if (certificate.length == 0) {
      return NextResponse.json(
        { message: "Certificate not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: "Success getting certificate",
        data: certificate[0],
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
