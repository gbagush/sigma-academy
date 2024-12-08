import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { verifyTokenFromRequest } from "@/lib/jwt";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; content: string } }
) {
  const verificationResult = await verifyTokenFromRequest(request);

  if (verificationResult instanceof NextResponse) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  if (verificationResult.decoded.role !== "user") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  let courseId;
  let contentId;
  try {
    courseId = new ObjectId(params.id);
    contentId = new ObjectId(params.content);
  } catch (error) {
    return NextResponse.json({ message: "Invalid id format" }, { status: 400 });
  }

  try {
    const enrollment = await db.collection("enrollments").findOne({
      courseId: courseId,
      userId: new ObjectId(verificationResult.decoded.userId),
    });

    if (!enrollment) {
      return NextResponse.json(
        { message: "You are not enrolled in this course" },
        { status: 403 }
      );
    }

    const course = await db.collection("courses").findOne({
      _id: courseId,
      sections: {
        $elemMatch: {
          contents: {
            $elemMatch: {
              _id: contentId,
            },
          },
        },
      },
    });

    if (!course) {
      return NextResponse.json(
        { message: "Content not found in this course" },
        { status: 404 }
      );
    }

    const content = course.sections
      .flatMap((section: any) => section.contents)
      .find((content: any) => content._id.equals(contentId));

    if (!content) {
      return NextResponse.json(
        { message: "Content not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Success getting content data",
      data: content,
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; content: string } }
) {
  const verificationResult = await verifyTokenFromRequest(request);

  if (verificationResult instanceof NextResponse) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  if (verificationResult.decoded.role !== "user") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  let courseId;
  let contentId;
  try {
    courseId = new ObjectId(params.id);
    contentId = new ObjectId(params.content);
  } catch (error) {
    return NextResponse.json({ message: "Invalid id format" }, { status: 400 });
  }

  try {
    const enrollment = await db.collection("enrollments").findOne({
      courseId: courseId,
      userId: new ObjectId(verificationResult.decoded.userId),
    });

    if (!enrollment) {
      return NextResponse.json(
        { message: "You are not enrolled in this course" },
        { status: 403 }
      );
    }

    const content = await db.collection("courses").findOne({
      _id: courseId,
      sections: {
        $elemMatch: {
          contents: {
            $elemMatch: {
              _id: contentId,
            },
          },
        },
      },
    });

    if (!content) {
      return NextResponse.json(
        { message: "Content not found in this course" },
        { status: 404 }
      );
    }

    const isContentDone = enrollment.progress.some((entry: any) =>
      entry.contentId.equals(contentId)
    );

    if (isContentDone) {
      return NextResponse.json(
        { message: `${content.title} has already been completed` },
        { status: 200 }
      );
    }

    const updateResult = await db.collection("enrollments").updateOne(
      { _id: enrollment._id },
      {
        $addToSet: {
          progress: {
            contentId: contentId,
            doneAt: new Date(),
          },
        },
      }
    );

    if (updateResult.modifiedCount === 0) {
      return NextResponse.json(
        { message: "Failed to update progress" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: `${content.title} have been completed`,
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
