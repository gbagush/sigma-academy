import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { verifyTokenFromRequest } from "@/lib/jwt";
import { randomCertificateCode } from "@/lib/nanoid";

export async function POST(request: NextRequest) {
  const verificationResult = await verifyTokenFromRequest(request);

  if (verificationResult instanceof NextResponse) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  if (verificationResult.decoded.role !== "user") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const data = await request.json();

  if (!data.enrollmentId || !data.certificateName) {
    return NextResponse.json({ message: "Invalid request" }, { status: 400 });
  }

  let enrollmentId;
  try {
    enrollmentId = new ObjectId(data.enrollmentId);
  } catch (error) {
    return NextResponse.json({ message: "Invalid id format" }, { status: 400 });
  }

  try {
    const enrollment = await db.collection("enrollments").findOne({
      _id: enrollmentId,
      userId: new ObjectId(verificationResult.decoded.userId),
    });

    if (!enrollment) {
      return NextResponse.json(
        { message: "Enrollment not found" },
        { status: 404 }
      );
    }

    const course = await db.collection("courses").findOne({
      _id: enrollment.courseId,
    });

    if (!course) {
      return NextResponse.json(
        { message: "Course not found" },
        { status: 404 }
      );
    }

    const allContentCompleted = course.sections.every((section: any) => {
      return section.contents.every((content: any) => {
        const contentIdToCheck =
          content._id instanceof ObjectId
            ? content._id
            : new ObjectId(content._id);

        const isCompleted = enrollment.progress?.some((progress: any) => {
          const progressContentId =
            progress.contentId instanceof ObjectId
              ? progress.contentId
              : new ObjectId(progress.contentId);
          return progressContentId.equals(contentIdToCheck);
        });

        return isCompleted;
      });
    });

    if (!allContentCompleted) {
      return NextResponse.json(
        { message: "You have not completed this course" },
        { status: 403 }
      );
    }

    const currentDate = new Date().toISOString().split("T")[0];
    const uniqueCode = randomCertificateCode();

    const certificate = await db.collection("certificates").insertOne({
      code: `SIGMA-${currentDate}-${uniqueCode}`,
      name: data.certificateName,
      reciepentId: enrollment.userId,
      courseId: enrollment.courseId,
      progressId: enrollment._id,
      createdAt: new Date(),
    });

    return NextResponse.json({
      message: "Success create certificate, Congratulations!",
      data: certificate.insertedId,
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
