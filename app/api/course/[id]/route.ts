import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { verifyTokenFromRequest } from "@/lib/jwt";

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

  try {
    const verificationResult = await verifyTokenFromRequest(request);

    let enrollment;

    if (verificationResult instanceof NextResponse) {
    } else {
      enrollment = await db.collection("enrollments").findOne({
        courseId: courseId,
        userId: new ObjectId(verificationResult.decoded.userId),
      });
    }

    const result = await db
      .collection("courses")
      .aggregate([
        {
          $match: {
            _id: courseId,
            publishedAt: { $exists: true },
          },
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
            sections: 1,
            instructorDetails: {
              _id: { $arrayElemAt: ["$instructorDetails._id", 0] },
              firstName: { $arrayElemAt: ["$instructorDetails.firstName", 0] },
              lastName: { $arrayElemAt: ["$instructorDetails.lastName", 0] },
              profilePicture: {
                $arrayElemAt: ["$instructorDetails.profilePicture", 0],
              },
              username: { $arrayElemAt: ["$instructorDetails.username", 0] },
            },
            categoryDetails: { $arrayElemAt: ["$categoryDetails", 0] },
          },
        },
      ])
      .toArray();

    if (result.length === 0) {
      return NextResponse.json(
        { message: "Course not found" },
        { status: 404 }
      );
    }

    const course = result[0];

    let responseData;

    if (enrollment) {
      responseData = { ...course, enrollmentId: enrollment._id };
    } else if (
      !(verificationResult instanceof NextResponse) &&
      verificationResult.decoded.userId ===
        course.instructorDetails[0]._id.toString()
    ) {
      responseData = { ...course, isInstructor: true };
    } else if (
      !(verificationResult instanceof NextResponse) &&
      verificationResult.decoded.role === "admin"
    ) {
      responseData = { ...course, isAdmin: true };
    } else {
      const transformedSections =
        course.sections?.map((section: any) => ({
          ...section,
          contents: section.contents.map((content: any) => ({
            _id: content._id,
            title: content.title,
            url: content.preview ? content.url : undefined,
            description: content.preview ? content.description : undefined,
            preview: content.preview,
          })),
        })) || [];

      responseData = {
        ...course,
        sections: transformedSections,
      };
    }

    return NextResponse.json(
      { message: "Success getting course data", data: responseData },
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
