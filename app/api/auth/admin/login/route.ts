import { db } from "@/lib/db";
import { emailConfirm } from "@/lib/mail-templates/email-confirm";
import { sendEmail } from "@/lib/mailer";
import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";
import { generateToken } from "@/lib/jwt";

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
    .findOneAndDelete({ _id: objectId, type: "magic-token" });

  if (result === null) {
    console.log("Its Not Found Bro");
    return NextResponse.json({ message: "Token not found" }, { status: 404 });
  }

  const admin = await db
    .collection("admins")
    .findOne({ _id: new ObjectId(result.userId) });

  if (!admin) {
    return NextResponse.json({ message: "Admin not found" }, { status: 404 });
  }

  return NextResponse.json(
    {
      message: "Success getting token data",
      token: generateToken({
        userId: admin._id,
        email: admin.email,
        role: "admin",
      }),
    },
    { status: 200 }
  );
}

export async function POST(request: NextRequest) {
  const data = await request.json();

  if (!data.email) {
    return NextResponse.json({ message: "Invalid request" }, { status: 400 });
  }

  const mailDomain = process.env.MAIL_DOMAIN;
  const emailRegex = new RegExp(`^[a-zA-Z0-9._%+-]+@${mailDomain}$`);

  if (!emailRegex.test(data.email)) {
    return NextResponse.json(
      {
        message: `Unauthorized email`,
      },
      { status: 403 }
    );
  }

  const admin = await db.collection("admins").findOneAndUpdate(
    {
      email: data.email,
    },
    {
      $setOnInsert: {
        email: data.email,
      },
    },
    { upsert: true, returnDocument: "after" }
  );

  const loginToken = await db.collection("tokens").insertOne({
    usertype: "admin",
    userId: new ObjectId(admin?._id),
    type: "magic-token",
    createdAt: new Date(),
  });

  sendEmail(
    data.email,
    "Sigma Academy Magic Link Login",
    emailConfirm({
      name: data.email,
      intro:
        "You've requested a magic link to log in to your Sigma Academy account.",
      body: "For your convenience and security, use the link below to access your account without entering a password.",
      action: "Click the button below to log in instantly:",
      button: "Log in with Magic Link",
      url: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/admin/login/${loginToken.insertedId}`,
      outro:
        "Keep this link private and do not share it with anyone. If you didn't request this login link, please ignore this email or contact our support team immediately. For security reasons, this link will expire shortly.",
    })
  );

  return NextResponse.json(
    {
      message: `Magic link has been sent. Please check your inbox.`,
    },
    { status: 200 }
  );
}
