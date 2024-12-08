import { ObjectId } from "mongodb";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { verifyTokenFromRequest } from "@/lib/jwt";

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

    if (!data.bankCode || !data.accountNumber || !data.accountHolderName) {
      return NextResponse.json(
        { message: "Invalid requests" },
        { status: 400 }
      );
    }

    const bank = await db.collection("banks").findOne({ code: data.bankCode });

    if (!bank) {
      return NextResponse.json({ message: "Bank not found" }, { status: 404 });
    }

    const wallet = await db.collection("wallets").findOne({
      instructorId: new ObjectId(verificationResult.decoded.userId),
    });

    if (!wallet) {
      return NextResponse.json(
        { message: "Wallet not found" },
        { status: 404 }
      );
    }

    await db.collection("paymentMethods").insertOne({
      walletId: wallet._id,
      bankCode: data.bankCode,
      accountNumber: data.accountNumber,
      accountHolderName: data.accountHolderName,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json(
      { message: "Payment method added successfully" },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const verificationResult = await verifyTokenFromRequest(request);

  if (verificationResult instanceof NextResponse) {
    return verificationResult;
  }

  if (verificationResult.decoded.role !== "instructor") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    const wallet = await db.collection("wallets").findOne({
      instructorId: new ObjectId(verificationResult.decoded.userId),
    });

    if (!wallet) {
      return NextResponse.json(
        { message: "Wallet not found" },
        { status: 404 }
      );
    }

    const paymentMethods = await db
      .collection("paymentMethods")
      .find({ walletId: wallet._id })
      .toArray();

    return NextResponse.json(
      {
        message: "Success getting payment methods",
        data: paymentMethods,
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

export async function PUT(request: NextRequest) {
  const verificationResult = await verifyTokenFromRequest(request);

  if (verificationResult instanceof NextResponse) {
    return verificationResult;
  }

  if (verificationResult.decoded.role !== "instructor") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    const data = await request.json();

    if (
      !data.paymentMethodId ||
      !data.bankId ||
      !data.accountNumber ||
      !data.accountHolderName
    ) {
      return NextResponse.json(
        { message: "Invalid requests" },
        { status: 400 }
      );
    }

    let paymentMethodId;

    try {
      paymentMethodId = new ObjectId(data.paymentMethodId);
    } catch (error) {
      return NextResponse.json(
        { message: "Invalid payment method id format" },
        { status: 400 }
      );
    }

    const wallet = await db.collection("wallets").findOne({
      instructorId: new ObjectId(verificationResult.decoded.userId),
    });

    if (!wallet) {
      return NextResponse.json(
        { message: "Wallet not found" },
        { status: 404 }
      );
    }

    const result = await db.collection("paymentMethods").updateOne(
      {
        _id: paymentMethodId,
        walletId: wallet._id,
      },
      {
        $set: {
          bankId: data.bankId,
          accountNumber: data.accountNumber,
          cardHolderName: data.cardHolderName,
          updatedAt: new Date(),
        },
      }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { message: "No updates made or payment method not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Payment method updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const verificationResult = await verifyTokenFromRequest(request);

  if (verificationResult instanceof NextResponse) {
    return verificationResult;
  }

  if (verificationResult.decoded.role !== "instructor") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    const data = await request.json();

    if (!data.paymentMethodId) {
      return NextResponse.json(
        { message: "Invalid requests" },
        { status: 400 }
      );
    }

    const wallet = await db.collection("wallets").findOne({
      instructorId: new ObjectId(verificationResult.decoded.userId),
    });

    if (!wallet) {
      return NextResponse.json(
        { message: "Wallet not found" },
        { status: 404 }
      );
    }

    const result = await db.collection("paymentMethods").deleteOne({
      _id: new ObjectId(data.paymentMethodId),
      walletId: wallet._id,
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { message: "Payment method not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Payment method deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
