import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { verifyTokenFromRequest } from "@/lib/jwt";
import { sendEmail } from "@/lib/mailer";
import { emailOTP } from "@/lib/mail-templates/email-otp";
import { ObjectId } from "mongodb";
import { randomOTP } from "@/lib/nanoid";

export async function GET(request: NextRequest) {
  const verificationResult = await verifyTokenFromRequest(request);

  if (verificationResult instanceof NextResponse) {
    return verificationResult;
  }

  if (verificationResult.decoded.role !== "instructor") {
    return NextResponse.json(
      { message: "Forbidden" },
      {
        status: 403,
      }
    );
  }

  try {
    const instructor = await db.collection("instructors").findOne({
      _id: new ObjectId(verificationResult.decoded.userId),
    });

    if (!instructor) {
      return NextResponse.json(
        { message: "Instructor not found" },
        { status: 404 }
      );
    }

    const wallet = await db.collection("wallets").findOne({
      instructorId: instructor._id,
    });

    if (!wallet) {
      return NextResponse.json(
        { message: "Wallet not found" },
        { status: 404 }
      );
    }

    const otpCode = randomOTP();

    await db.collection("tokens").insertOne({
      type: "otp",
      code: otpCode,
      walletId: wallet._id,
      createdAt: new Date(),
    });

    sendEmail(
      verificationResult.decoded.email,
      "Sigma Academy Withdrawal Verification",
      emailOTP({
        name: `${instructor.firstName} ${instructor.lastName}`,
        intro:
          "You have requested to withdraw funds from your Sigma Academy account.",
        body: "To proceed with your withdrawal, please use the verification code provided below. This code can only be used for this transaction and is valid for 15 minutes.",
        otp: otpCode,
        outro:
          "If you didn't request this withdrawal, please contact our support team immediately to secure your account.",
      })
    );

    return NextResponse.json(
      {
        message:
          "OTP sended successfully, please check your inbox or spam folder",
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

export async function POST(request: NextRequest) {
  const verificationResult = await verifyTokenFromRequest(request);

  if (verificationResult instanceof NextResponse) {
    return verificationResult;
  }

  if (verificationResult.decoded.role !== "instructor") {
    return NextResponse.json(
      { message: "Forbidden" },
      {
        status: 403,
      }
    );
  }

  const data = await request.json();

  if (!data.otp || !data.walletId) {
    return NextResponse.json({ message: "Invalid Request" }, { status: 400 });
  }

  let walletId;
  try {
    walletId = new ObjectId(data.walletId);
  } catch (error) {
    return NextResponse.json({ message: "Invalid walletId" }, { status: 400 });
  }

  try {
    const result = await db.collection("tokens").findOne({
      walletId: walletId,
      type: "wallet-otp",
      code: data.otp,
    });

    if (!result) {
      return NextResponse.json({ message: "OTP not valid" }, { status: 400 });
    }

    return NextResponse.json({ message: "OTP is valid" }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
