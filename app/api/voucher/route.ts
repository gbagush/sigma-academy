import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { verifyTokenFromRequest } from "@/lib/jwt";
import { ObjectId } from "mongodb";

export async function GET(request: NextRequest) {
  const verificationResult = await verifyTokenFromRequest(request);

  if (verificationResult instanceof NextResponse) {
    return verificationResult;
  }

  if (verificationResult.decoded.role !== "user") {
    return NextResponse.json(
      { message: "User role needed" },
      {
        status: 401,
      }
    );
  }

  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.json({ message: "Code required" }, { status: 400 });
  }

  try {
    const voucher = await db.collection("vouchers").findOne({
      code: code,
      expirationDate: { $gte: new Date() },
    });

    if (!voucher) {
      return NextResponse.json(
        { message: "Voucher not found" },
        { status: 404 }
      );
    }

    const transactionUsing = await db.collection("transactions").findOne({
      voucherId: new ObjectId(voucher._id),
      userId: new ObjectId(verificationResult.decoded.userId),
      $or: [{ dueDate: { $gte: new Date() } }, { paidAt: { $exists: true } }],
    });

    if (transactionUsing) {
      return NextResponse.json(
        { message: "Voucher already used" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Success get voucher data", data: voucher },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
