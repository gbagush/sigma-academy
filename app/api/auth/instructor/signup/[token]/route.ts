import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/mailer";
import { emailNotification } from "@/lib/mail-templates/email-notification";
import { ObjectId } from "mongodb";
import { hashPassword } from "@/lib/password";
import { verifyTokenFromRequest } from "@/lib/jwt";
import { randomUsername } from "@/lib/nanoid";

export async function POST(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  const data = await request.json();

  let tokenId;
  try {
    tokenId = new ObjectId(params.token);
  } catch (error) {
    return NextResponse.json(
      { message: "Invalid token format" },
      { status: 400 }
    );
  }

  const token = await db.collection("tokens").findOne({
    _id: new ObjectId(tokenId),
    type: "signup",
  });

  if (!token) {
    return new Response("Token not found", { status: 404 });
  }

  if (
    !data.firstName ||
    !data.lastName ||
    !data.email ||
    !data.password ||
    !data.description ||
    !data.socials
  ) {
    return NextResponse.json({ message: "Invalid request" }, { status: 400 });
  }

  if (!Array.isArray(data.socials) || data.socials.length === 0) {
    return NextResponse.json(
      { message: "At least one social link is required" },
      { status: 400 }
    );
  }

  if (data.description.length > 500) {
    return NextResponse.json(
      { message: "Description must be 500 characters or less" },
      { status: 400 }
    );
  }

  const hashedPassword = await hashPassword(data.password);

  await db.collection("applications").insertOne({
    firstName: data.firstName,
    lastName: data.lastName,
    email: token.email,
    password: hashedPassword,
    description: data.description,
    socials: data.socials,
    username: randomUsername(),
    status: "pending",
    createdAt: new Date(),
  });

  sendEmail(
    token.email,
    "Welcome to Sigma Academy: Your Instructor Application",
    emailNotification({
      name: `${data.firstName} ${data.lastName}`,
      intro:
        "We're thrilled to receive your application to join the Sigma Academy instructor team!",
      body: "Our dedicated committee will carefully evaluate your application. You can expect an update within 1-3 business days.",
      outro:
        "Thank you for your interest in inspiring future generations. We look forward to connecting soon! In the meantime, feel free to reach out to our support team at support@sigmaacademy.my.id if you have any questions.",
    })
  );

  await db.collection("tokens").deleteOne({
    _id: new ObjectId(tokenId),
    type: "signup",
  });

  return NextResponse.json(
    { message: "Application has been successfully created" },
    { status: 200 }
  );
}
