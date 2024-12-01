import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { verifyTokenFromRequest } from "@/lib/jwt";
import { xenditInvoiceClient } from "@/lib/xendit";

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

    if (transactionDetails.status != "PENDING") {
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
        enrolledAt: new Date(),
      });

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
