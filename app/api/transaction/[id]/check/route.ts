import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { verifyTokenFromRequest } from "@/lib/jwt";
import { xenditInvoiceClient } from "@/lib/xendit";
import { Balance } from "xendit-node";

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
    const transaction = await db.collection("transactions").findOne({
      _id: transactionId,
      userId: new ObjectId(verificationResult.decoded.userId),
    });

    if (!transaction) {
      return NextResponse.json(
        { message: "Transaction not found" },
        { status: 404 }
      );
    }

    if (transaction.paidAt) {
      return NextResponse.json(
        { message: "Transaction already paid" },
        { status: 200 }
      );
    }

    const transactionDetails = await xenditInvoiceClient.getInvoiceById({
      invoiceId: transaction.invoiceId,
    });

    if (transactionDetails.status == "PAID") {
      await db.collection("transactions").updateOne(
        {
          _id: transactionId,
        },
        {
          $set: {
            paymentMethod: transactionDetails.paymentMethod,
            paidAt: transactionDetails.updated,
          },
        }
      );

      await db.collection("enrollments").insertOne({
        userId: new ObjectId(verificationResult.decoded.userId),
        courseId: new ObjectId(transaction.courseId),
        transactionId: new ObjectId(transactionId),
        progress: [],
        enrolledAt: new Date(),
      });

      const instructorWallet = await db
        .collection("courses")
        .aggregate([
          {
            $match: {
              _id: new ObjectId(transaction.courseId),
            },
          },
          {
            $lookup: {
              from: "wallets",
              localField: "instructorId",
              foreignField: "instructorId",
              as: "wallet",
            },
          },
          {
            $unwind: "$wallet",
          },
        ])
        .toArray();

      let amount;

      if (
        transaction.voucherId &&
        transaction.voucherType &&
        transaction.voucherDiscount
      ) {
        if (transaction.voucherType == "instructor") {
          amount =
            transaction.amount -
            (transaction.amount * transaction.voucherDiscount) / 100;
        } else {
          amount = transaction.amount;
        }
      } else {
        amount = transaction.amount;
      }

      await db.collection("walletTransactions").insertOne({
        walletId: instructorWallet[0].wallet._id,
        type: "income",
        amount: amount,
        transactionId: transaction._id,
        description: "Course Sales",
        status: "success",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await db.collection("wallets").updateOne(
        { _id: instructorWallet[0].wallet._id },
        {
          $inc: { balance: amount },
          $set: { updatedAt: new Date() },
        }
      );

      return NextResponse.json(
        {
          message: "Transaction paid successfully",
          data: {
            paymentMethod: transactionDetails.paymentMethod,
            paidAt: transactionDetails.updated,
          },
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { message: "Transaction unchanged" },
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
