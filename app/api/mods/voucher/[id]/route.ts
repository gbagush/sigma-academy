import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { verifyTokenFromRequest } from "@/lib/jwt";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

  let voucherId;
  try {
    voucherId = new ObjectId(params.id);
  } catch (error) {
    return NextResponse.json({ message: "Invalid id format" }, { status: 400 });
  }

  try {
    let updateData = {};
    const data = await request.json();

    if (data.expirationDate) {
      updateData = {
        ...updateData,
        expirationDate: new Date(data.expirationDate),
      };
    }

    if (
      data.discount &&
      Number.isInteger(data.discount) &&
      data.discount > 0 &&
      data.discount < 100
    ) {
      updateData = {
        ...updateData,
        discount: data.discount,
      };
    }

    const result = await db.collection("vouchers").updateOne(
      {
        _id: voucherId,
        type: "admin",
        creatorId: new ObjectId(verificationResult.decoded.userId),
      },
      {
        $set: updateData,
      }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { message: "Voucher not found or no changes made" },
        { status: 400 }
      );
    }

    return NextResponse.json({ message: "Voucher updated" }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

  let voucherId;
  try {
    voucherId = new ObjectId(params.id);
  } catch (error) {
    return NextResponse.json({ message: "Invalid id format" }, { status: 400 });
  }

  try {
    const result = await db.collection("vouchers").deleteOne({
      _id: voucherId,
      type: "admin",
      creatorId: new ObjectId(verificationResult.decoded.userId),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { message: "Voucher not found or not authorized to delete" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Voucher deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
