import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { verifyTokenFromRequest } from "@/lib/jwt";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const verificationResult = await verifyTokenFromRequest(request);

  if (verificationResult instanceof NextResponse) {
    return verificationResult;
  }

  if (verificationResult.decoded.role !== "user") {
    return new NextResponse("You need a user account to purchase a course", {
      status: 401,
    });
  }

  let transactionId;
  try {
    transactionId = new ObjectId(params.id);
  } catch (error) {
    return NextResponse.json({ message: "Invalid id format" }, { status: 400 });
  }

  try {
    const result = await db
      .collection("transactions")
      .aggregate([
        {
          $match: {
            _id: transactionId,
            userId: new ObjectId(verificationResult.decoded.userId),
          },
        },
        {
          $lookup: {
            from: "courses",
            localField: "courseId",
            foreignField: "_id",
            as: "courseDetails",
          },
        },
        {
          $project: {
            _id: 1,
            courseId: 1,
            userId: 1,
            createdAt: 1,
            dueDate: 1,
            amount: 1,
            tax: 1,
            invoiceId: 1,
            invoiceUrl: 1,
            paidAt: 1,
            paymentMethod: 1,
            voucherId: 1,
            voucherDiscount: 1,
            courseDetails: {
              _id: { $arrayElemAt: ["$courseDetails._id", 0] },
              title: { $arrayElemAt: ["$courseDetails.title", 0] },
              thumbnail: { $arrayElemAt: ["$courseDetails.thumbnail", 0] },
            },
          },
        },
      ])
      .toArray();

    if (result.length === 0) {
      return NextResponse.json(
        { message: "Transaction not found" },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json(
      { message: "Success getting transaction data", data: result },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
