import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { verifyTokenFromRequest } from "@/lib/jwt";
import { sendEmail } from "@/lib/mailer";
import { emailNotification } from "@/lib/mail-templates/email-notification";
import { emailConfirm } from "@/lib/mail-templates/email-confirm";

import { ObjectId } from "mongodb";

export async function GET(
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

  let withdrawalId;
  try {
    withdrawalId = new ObjectId(params.id);
  } catch (error) {
    return NextResponse.json({ message: "Invalid id format" }, { status: 400 });
  }

  try {
    const withdrawals = await db
      .collection("walletTransactions")
      .aggregate([
        {
          $match: { _id: withdrawalId },
        },
        {
          $lookup: {
            from: "wallets",
            localField: "walletId",
            foreignField: "_id",
            as: "walletDetails",
          },
        },
        {
          $unwind: "$walletDetails",
        },
        {
          $lookup: {
            from: "paymentMethods",
            localField: "paymentMethod",
            foreignField: "_id",
            as: "paymentMethodDetails",
          },
        },
        {
          $unwind: "$paymentMethodDetails",
        },
      ])
      .toArray();

    if (withdrawals.length === 0) {
      return NextResponse.json(
        { message: "Withdrawal not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Success getting withdrawals",
      data: withdrawals[0],
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

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

  let withdrawalId;
  try {
    withdrawalId = new ObjectId(params.id);
  } catch (error) {
    return NextResponse.json({ message: "Invalid id format" }, { status: 400 });
  }

  try {
    const body = await request.json();

    if (!body.status) {
      return NextResponse.json(
        {
          message: "Invalid request",
        },
        {
          status: 400,
        }
      );
    }

    if (!(body.status == "success" || body.status == "failed")) {
      return NextResponse.json(
        {
          message: "Invalid status",
        },
        {
          status: 400,
        }
      );
    }

    const walletTransaction = await db
      .collection("walletTransactions")
      .findOne({
        _id: withdrawalId,
        status: "pending",
      });

    if (!walletTransaction) {
      return NextResponse.json(
        { message: "Withdrawal not found" },
        { status: 404 }
      );
    }

    const result = await db.collection("walletTransactions").updateOne(
      {
        _id: withdrawalId,
        status: "pending",
      },
      {
        $set: {
          status: body.status,
          updatedAt: new Date(),
          adminId: new ObjectId(verificationResult.decoded.userId),
        },
      }
    );

    if (result.modifiedCount == 0) {
      return NextResponse.json(
        { message: "Failed update transaction or transaction not found" },
        { status: 400 }
      );
    }

    if (body.status == "failed") {
      await db.collection("walletTransactions").insertOne({
        walletId: walletTransaction.walletId,
        type: "income",
        amount: walletTransaction.amount,
        description: "Refund",
        status: "success",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await db.collection("wallets").updateOne(
        { _id: walletTransaction.walletId },
        {
          $inc: { balance: walletTransaction.amount },
          $set: { updatedAt: new Date() },
        }
      );
    }

    return NextResponse.json(
      { message: "Transaction updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
