import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { verifyTokenFromRequest } from "@/lib/jwt";
import { MongoError, ObjectId } from "mongodb";

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

    if (!data.fullName || !data.phoneNumber || !data.address) {
      return NextResponse.json(
        { message: "Invalid requests" },
        { status: 400 }
      );
    }

    await db.collection("wallets").insertOne({
      instructorId: new ObjectId(verificationResult.decoded.userId),
      fullName: data.fullName,
      phoneNumber: data.phoneNumber,
      address: data.address,
      balance: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json(
      { message: "Wallet created successfully" },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof MongoError) {
      if (error.code === 11000) {
        return NextResponse.json(
          { message: "Wallet already exists" },
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

  if (verificationResult.decoded.role !== "instructor") {
    return NextResponse.json(
      { message: "Forbidden" },
      {
        status: 403,
      }
    );
  }

  try {
    const wallet = await db.collection("wallets").findOne({
      instructorId: new ObjectId(verificationResult.decoded.userId),
    });

    if (!wallet) {
      return NextResponse.json(
        { message: "You dont have any wallet yet" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Success getting wallet data", data: wallet },
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

    if (!data.fullName && !data.phoneNumber && !data.address) {
      return NextResponse.json(
        { message: "At least one field must be provided for update" },
        { status: 400 }
      );
    }

    let updateFields = {};
    if (data.fullName) {
      updateFields = { ...updateFields, fullName: data.fullName };
    }
    if (data.phoneNumber) {
      updateFields = { ...updateFields, phoneNumber: data.phoneNumber };
    }
    if (data.address) {
      updateFields = { ...updateFields, address: data.address };
    }
    updateFields = { ...updateFields, updatedAt: new Date() };

    const result = await db.collection("wallets").updateOne(
      {
        instructorId: new ObjectId(verificationResult.decoded.userId),
      },
      { $set: updateFields }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { message: "No updates made or wallet not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Wallet updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
