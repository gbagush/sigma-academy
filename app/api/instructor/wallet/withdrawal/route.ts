import { ObjectId } from "mongodb";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { verifyTokenFromRequest } from "@/lib/jwt";
import { platformFee } from "@/config/transaction";

export async function POST(request: NextRequest) {
  const verificationResult = await verifyTokenFromRequest(request);

  if (verificationResult instanceof NextResponse) {
    return verificationResult;
  }

  if (verificationResult.decoded.role !== "instructor") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    const data = await request.json();

    if (!data.otp || !data.walletId || !data.paymentMethodId || !data.amount) {
      return NextResponse.json({ message: "Invalid request" }, { status: 400 });
    }

    let walletId;
    let paymentMethodId;
    try {
      walletId = new ObjectId(data.walletId);
      paymentMethodId = new ObjectId(data.paymentMethodId);
    } catch (error) {
      return NextResponse.json({ message: "Invalid id" }, { status: 400 });
    }

    const wallet = await db.collection("wallets").findOne({
      _id: walletId,
      instructorId: new ObjectId(verificationResult.decoded.userId),
    });

    if (!wallet) {
      return NextResponse.json(
        { message: "Wallet not found" },
        { status: 404 }
      );
    }

    if (!Number.isInteger(data.amount)) {
      return NextResponse.json(
        { message: "Amount must be an integer" },
        { status: 400 }
      );
    }

    if (data.amount > wallet.amount) {
      return NextResponse.json(
        { message: "Unable to fulfill transaction" },
        { status: 400 }
      );
    }

    const paymentMethod = await db.collection("paymentMethods").findOne({
      _id: paymentMethodId,
      walletId: wallet._id,
    });

    if (!paymentMethod) {
      return NextResponse.json(
        { message: "Payment method not found" },
        { status: 404 }
      );
    }

    const otp = await db.collection("tokens").findOneAndDelete({
      walletId: wallet._id,
      type: "wallet-otp",
      code: data.otp,
    });

    if (!otp) {
      return NextResponse.json({ message: "Invalid OTP" }, { status: 400 });
    }

    await db.collection("walletTransactions").insertOne({
      walletId: wallet._id,
      type: "outcome",
      amount: data.amount,
      platformFee: platformFee * 100,
      paymentMethod: paymentMethod._id,
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await db.collection("wallets").updateOne(
      { _id: wallet._id },
      {
        $inc: { balance: -data.amount },
        $set: { updatedAt: new Date() },
      }
    );

    return NextResponse.json(
      {
        message:
          "We need some time to confirm your transaction. Check your email for further updates",
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
