import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/mailer";
import { emailConfirm } from "@/lib/mail-templates/email-confirm";
import { ObjectId } from "mongodb";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ message: "Invalid request" }, { status: 400 });
  }

  let objectId;
  try {
    objectId = new ObjectId(token);
  } catch (error) {
    return NextResponse.json(
      { message: "Invalid token format" },
      { status: 400 }
    );
  }

  const result = await db
    .collection("tokens")
    .findOne({ _id: objectId, type: "signup" });

  if (!result) {
    return NextResponse.json({ message: "Token not found" }, { status: 404 });
  }

  return NextResponse.json(
    { message: "Token valid", data: result },
    { status: 200 }
  );
}

export async function POST(request: NextRequest) {
  const data = await request.json();

  if (!data.email) {
    return NextResponse.json({ message: "Invalid request" }, { status: 400 });
  }

  try {
    const existAccount = await db.collection("instructors").findOne({
      email: data.email,
    });

    if (existAccount) {
      return NextResponse.json(
        { message: "Email already registered." },
        { status: 400 }
      );
    }

    const existApplication = await db.collection("applications").findOne({
      email: data.email,
      status: "pending",
    });

    if (existApplication) {
      return NextResponse.json(
        {
          message:
            "Application has been made before, please wait for our response.",
        },
        { status: 400 }
      );
    }

    const verifToken = await db.collection("tokens").insertOne({
      usertype: "instructor",
      email: data.email,
      type: "signup",
      createdAt: new Date(),
    });

    sendEmail(
      data.email,
      "Sigma Academy Instructor Registration",
      emailConfirm({
        name: `${data.firstName} ${data.lastName}`,
        intro:
          "Thank you for your interest in becoming a Sigma Academy instructor.",
        body: "To finalize your instructor application and showcase your expertise, please complete your profile.",
        action: "Click the button below to complete your profile:",
        button: "Complete Instructor Profile",
        url: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/instructor/signup/${verifToken.insertedId}`,
        outro:
          "Completing your profile allows us to evaluate your qualifications and connect you with potential teaching opportunities. If you didn't apply to be a Sigma Academy instructor, please disregard this email.",
      })
    );

    return NextResponse.json(
      {
        message:
          "Your instructor registration request has been submitted. Please check your email to complete your profile.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error registering instructor:", error);

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
