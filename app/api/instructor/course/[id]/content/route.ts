import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { verifyTokenFromRequest } from "@/lib/jwt";

const isValidObjectId = (id: string) => {
  return ObjectId.isValid(id) && new ObjectId(id).toString() === id;
};

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const verificationResult = await verifyTokenFromRequest(request);

  if (verificationResult instanceof NextResponse) {
    return verificationResult;
  }

  let courseId;
  if (!isValidObjectId(params.id)) {
    return NextResponse.json(
      { message: "Invalid course ID format" },
      { status: 400 }
    );
  }

  courseId = new ObjectId(params.id);

  try {
    const sections = await db.collection("courses").findOne(
      {
        _id: courseId,
        instructorId: new ObjectId(verificationResult.decoded.userId),
      },
      {
        projection: { sections: 1 },
      }
    );

    return NextResponse.json(
      {
        message: "Success getting course sections",
        data: sections?.sections || [],
      },
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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const verificationResult = await verifyTokenFromRequest(request);

  if (verificationResult instanceof NextResponse) {
    return verificationResult;
  }

  let courseId;

  const body = await request.json();

  if (!Array.isArray(body)) {
    return NextResponse.json(
      { message: "Invalid data format" },
      { status: 400 }
    );
  }

  if (!isValidObjectId(params.id)) {
    return NextResponse.json(
      { message: "Invalid course ID format" },
      { status: 400 }
    );
  }

  courseId = new ObjectId(params.id);

  const sectionsToUpdate = body.map((section) => ({
    _id: isValidObjectId(section._id)
      ? new ObjectId(section._id)
      : new ObjectId(),
    title: section.title,
    createdAt: section.createdAt || new Date(),
    updatedAt: new Date(),
    contents: section.contents.map((content: any) => ({
      _id: isValidObjectId(content._id)
        ? new ObjectId(content._id)
        : new ObjectId(),
      title: content.title,
      url: content.url,
      description: content.description,
      preview: content.preview,
      createdAt: content.createdAt || new Date(),
    })),
  }));

  try {
    const result = await db.collection("courses").updateOne(
      {
        _id: courseId,
        instructorId: new ObjectId(verificationResult.decoded.userId),
      },
      {
        $set: {
          sections: sectionsToUpdate,
          updatedAt: new Date(),
        },
      }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { message: "No changes made or course not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Sections updated successfully" },
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
