import { db } from "@/lib/db";
import { emailConfirm } from "@/lib/mail-templates/email-confirm";
import { sendEmail } from "@/lib/mailer";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { hashPassword } from "@/lib/password";

export async function GET(request: Request) {
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
    .findOne({ _id: objectId, type: "change-password" });

  if (!result) {
    return NextResponse.json({ message: "Token not found" }, { status: 404 });
  }

  return NextResponse.json(
    { message: "Success getting token data", data: result },
    { status: 200 }
  );
}

export async function POST(request: Request) {
  const data = await request.json();

  if (!data.email) {
    return NextResponse.json({ message: "Invalid request" }, { status: 400 });
  }

  const user = await db.collection("users").findOne({ email: data.email });

  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  const resetToken = await db.collection("tokens").insertOne({
    usertype: "user",
    userId: new ObjectId(user._id),
    type: "change-password",
    createdAt: new Date(),
  });

  sendEmail(
    data.email,
    "Sigma Academy Password Reset",
    emailConfirm({
      name: `${user.firstName} ${user.lastName}`,
      intro:
        "It seems you've requested to reset your password at Sigma Academy.",
      body: "To ensure your account's security, please confirm your password reset request.",
      action: "Click the button below to proceed:",
      button: "Reset Password",
      url: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/user/change-password/${resetToken.insertedId}`,
      outro:
        "If you didn't request a password reset, please ignore this email or contact our support team immediately. For your security, this link will expire shortly.",
    })
  );

  return NextResponse.json(
    {
      message: "A password reset email has been sent. Please check your inbox.",
    },
    { status: 200 }
  );
}

export async function PUT(request: Request) {
  const data = await request.json();

  if (!data.token || !data.password) {
    return NextResponse.json({ message: "Invalid request" }, { status: 400 });
  }

  let objectId;
  try {
    objectId = new ObjectId(data.token);
  } catch (error) {
    return NextResponse.json(
      { message: "Invalid token format" },
      { status: 400 }
    );
  }

  const result = await db
    .collection("tokens")
    .findOneAndDelete({ _id: objectId, type: "change-password" });

  if (!result) {
    return NextResponse.json({ message: "Token not found" }, { status: 404 });
  }

  const hashedPassword = await hashPassword(data.password);

  await db.collection("users").updateOne(
    { _id: new ObjectId(result.userId) },
    {
      $set: {
        password: hashedPassword,
      },
    }
  );

  return NextResponse.json(
    { message: "Password change successfuly" },
    { status: 200 }
  );
}
