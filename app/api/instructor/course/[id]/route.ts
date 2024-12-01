import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { verifyTokenFromRequest } from "@/lib/jwt";
import cloudinary from "@/lib/cloudinary";

export async function GET(
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
    const result = await db.collection("courses").findOne(
      {
        _id: courseId,
        instructorId: new ObjectId(verificationResult.decoded.userId),
      },
      {
        projection: { sections: 0 },
      }
    );

    if (!result) {
      return NextResponse.json(
        { message: "Course not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Success getting course data", data: result },
      { status: 200 }
    );
  } catch (error) {
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
  try {
    courseId = new ObjectId(params.id);
  } catch (error) {
    return NextResponse.json(
      { message: "Invalid course ID format" },
      { status: 400 }
    );
  }

  try {
    const data = await request.formData();

    const title = data.get("title") as string;
    const description = data.get("description") as string;
    const category = data.get("category") as string;
    const language = data.get("language") as string;
    const thumbnailFile = data.get("thumbnail") as File;
    const status = data.get("status") as string;
    const price = data.get("price") as number | null;
    const discountedPrice = data.get("discountedPrice") as number | null;

    if (!title || !description || !category || !language || !status) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const categoryId = new ObjectId(category);

    const updateData: any = {
      title,
      description,
      category: categoryId,
      language,
      status,
      price,
      discountedPrice,
      updatedAt: new Date(),
    };

    if (thumbnailFile && thumbnailFile instanceof File) {
      if (
        !["image/jpeg", "image/jpg", "image/png"].includes(thumbnailFile.type)
      ) {
        return NextResponse.json(
          { message: "Invalid image format. Only JPEG and PNG are allowed." },
          { status: 400 }
        );
      }

      if (thumbnailFile.size > 1 * 1024 * 1024) {
        return NextResponse.json(
          { message: "Image file size must be less than 1MB." },
          { status: 400 }
        );
      }

      const fileBuffer = await thumbnailFile.arrayBuffer();
      const base64Data = Buffer.from(fileBuffer).toString("base64");
      const mimeType = thumbnailFile.type;
      const fileUri = `data:${mimeType};base64,${base64Data}`;

      const result = await cloudinary.uploader.upload(fileUri, {
        invalidate: true,
        public_id: `thumbnail`,
        folder: `course-data/${courseId}/`,
      });

      updateData.thumbnail = result.secure_url;
    }

    const updateResult = await db
      .collection("courses")
      .updateOne({ _id: courseId }, { $set: updateData });

    if (updateResult.matchedCount === 0) {
      return NextResponse.json(
        { message: "Course not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: "Course updated successfully",
        data: updateData,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Course update error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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
    return NextResponse.json(
      { message: "Invalid course ID format" },
      { status: 400 }
    );
  }

  try {
    const result = await db.collection("courses").deleteOne({
      _id: courseId,
      instructorId: new ObjectId(verificationResult.decoded.userId),
      publishAt: null,
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { message: "Course not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Course deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
