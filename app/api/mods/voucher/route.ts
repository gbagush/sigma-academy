import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { verifyTokenFromRequest } from "@/lib/jwt";
import { MongoError, ObjectId } from "mongodb";

export async function POST(request: NextRequest) {
  const verificationResult = await verifyTokenFromRequest(request);

  if (verificationResult instanceof NextResponse) {
    return verificationResult;
  }

  if (verificationResult.decoded.role !== "admin") {
    return NextResponse.json(
      { message: "Forbidden" },
      {
        status: 403,
      }
    );
  }

  try {
    const data = await request.json();

    if (!data.code || !data.discount || !data.expirationDate) {
      return NextResponse.json(
        { message: "Invalid requests" },
        { status: 400 }
      );
    }

    if (
      !(
        Number.isInteger(data.discount) &&
        data.discount > 0 &&
        data.discount < 100
      )
    ) {
      return NextResponse.json(
        { message: "Invalid requests" },
        { status: 400 }
      );
    }

    await db.collection("vouchers").insertOne({
      type: "admin",
      creatorId: new ObjectId(verificationResult.decoded.userId),
      code: data.code,
      discount: data.discount,
      createdAt: new Date(),
      updatedAt: new Date(),
      expirationDate: new Date(data.expirationDate),
    });

    return NextResponse.json(
      { message: "Voucher created successfully" },
      {
        status: 201,
      }
    );
  } catch (error) {
    if (error instanceof MongoError) {
      if (error.code === 11000) {
        return NextResponse.json(
          { message: "Code already exists" },
          { status: 409 }
        );
      }
    }
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

  if (verificationResult.decoded.role !== "admin") {
    return NextResponse.json(
      { message: "Forbidden" },
      {
        status: 403,
      }
    );
  }

  try {
    const vouchers = await db
      .collection("vouchers")
      .find({
        type: "admin",
        creatorId: new ObjectId(verificationResult.decoded.userId),
      })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(
      { message: "Success getting vouchers data", data: vouchers },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
