import { db } from "@/lib/db";
import { emailConfirm } from "@/lib/mail-templates/email-confirm";
import { sendEmail } from "@/lib/mailer";
import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");

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
    .findOneAndDelete({ _id: objectId, type: "confirmation" });

  if (!result) {
    return NextResponse.json({ message: "Token not found" }, { status: 404 });
  }

  await db
    .collection("users")
    .updateOne({ _id: result.userId }, { $set: { verifiedAt: new Date() } });

  return NextResponse.json(
    { message: "Success activating user" },
    { status: 200 }
  );
}

export async function POST(request: NextRequest) {
  const data = await request.json();

  if (!data.email) {
    return NextResponse.json({ message: "Invalid request" }, { status: 400 });
  }

  const user = await db.collection("users").findOne({ email: data.email });

  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  if (user.verifiedAt) {
    return NextResponse.json(
      { message: "User already confirmed" },
      { status: 400 }
    );
  }

  const verifToken = await db.collection("tokens").insertOne({
    usertype: "user",
    userId: new ObjectId(user._id),
    type: "confirmation",
    createdAt: new Date(),
  });

  sendEmail(
    data.email,
    "Sigma Academy Verification",
    emailConfirm({
      name: `${user.firstName} ${user.lastName}`,
      intro:
        "Complete your registration by activating your Sigma Academy account.",
      body: "Before we get started, we need to confirm your email address to ensure we have the right details.",
      action: "Click the button below to confirm your email:",
      button: "Confirm Email",
      url: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/user/confirm/${verifToken.insertedId}`,
      outro:
        "Confirming your email helps us secure your account and provide the best service possible. If you didn't sign up for Sigma Academy, please disregard this email.",
    })
  );

  return NextResponse.json(
    { message: "Confirmation email sent successfully" },
    { status: 200 }
  );
}
