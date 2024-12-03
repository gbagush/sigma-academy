import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { hashPassword } from "@/lib/password";
import { MongoError } from "mongodb";
import { sendEmail } from "@/lib/mailer";
import { emailConfirm } from "@/lib/mail-templates/email-confirm";
import { randomUsername } from "@/lib/nanoid";

export async function POST(request: NextRequest) {
  const data = await request.json();

  if (!data.firstName || !data.lastName || !data.email || !data.password) {
    return NextResponse.json({ message: "Invalid request" }, { status: 400 });
  }

  try {
    const hashedPassword = await hashPassword(data.password);

    const user = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: hashedPassword,
      username: randomUsername(),
      registerAt: new Date(),
    };

    const result = await db.collection("users").insertOne(user);

    const verifToken = await db.collection("tokens").insertOne({
      usertype: "user",
      userId: result.insertedId,
      type: "confirmation",
      createdAt: new Date(),
    });

    sendEmail(
      data.email,
      "Sigma Academy Registration",
      emailConfirm({
        name: `${data.firstName} ${data.lastName}`,
        intro: "Thank you for registering with Sigma Academy.",
        body: "Before we get started, we need to confirm your email address to ensure we have the right details.",
        action: "Click the button below to confirm your email:",
        button: "Confirm Email",
        url: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/user/confirm/${verifToken.insertedId}`,
        outro:
          "Confirming your email helps us secure your account and provide the best service possible. If you didn't sign up for Sigma Academy, please disregard this email.",
      })
    );

    return NextResponse.json(
      { message: "User registered successfully" },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof MongoError) {
      if (error.code === 11000) {
        return NextResponse.json(
          { message: "Email already exists" },
          { status: 409 }
        );
      }
    }

    console.error("Error registering user:", error);

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
