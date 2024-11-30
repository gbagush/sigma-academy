import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";
import { verifyTokenFromRequest } from "@/lib/jwt";
import { ObjectId } from "mongodb";

export async function POST(request: NextRequest) {
  const verificationResult = await verifyTokenFromRequest(request);

  if (verificationResult instanceof NextResponse) {
    return verificationResult;
  }

  const userId = verificationResult.decoded.userId;

  const data = await request.formData();

  const imageFile = data.get("image");

  if (!imageFile || !(imageFile instanceof File)) {
    return NextResponse.json(
      { message: "Image file is required." },
      { status: 400 }
    );
  }

  if (!["image/jpeg", "image/jpg", "image/png"].includes(imageFile.type)) {
    return NextResponse.json(
      { message: "Invalid image format. Only JPEG and PNG are allowed." },
      { status: 400 }
    );
  }

  if (imageFile.size > 1 * 1024 * 1024) {
    return NextResponse.json(
      { message: "Image file size must be less than 1MB." },
      { status: 400 }
    );
  }

  try {
    const fileBuffer = await imageFile.arrayBuffer();
    const base64Data = Buffer.from(fileBuffer).toString("base64");
    const mimeType = imageFile.type;
    const fileUri = `data:${mimeType};base64,${base64Data}`;

    const result = await cloudinary.uploader.upload(fileUri, {
      invalidate: true,
      public_id: `profile-picture`,
      folder: `instructor-data/${userId}/`,
    });

    db.collection("instructors").updateOne(
      { _id: new ObjectId(userId) },
      { $set: { profilePicture: result.secure_url } }
    );

    return NextResponse.json(
      {
        message: "Image uploaded successfully.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
