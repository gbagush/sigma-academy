import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { verifyTokenFromRequest } from "@/lib/jwt";
import { ObjectId } from "mongodb";
import { CreateInvoiceRequest, Invoice } from "xendit-node/invoice/models";
import { taxRate } from "@/config/transaction";
import { xenditInvoiceClient } from "@/lib/xendit";

export async function POST(request: NextRequest) {
  const verificationResult = await verifyTokenFromRequest(request);

  if (verificationResult instanceof NextResponse) {
    return verificationResult;
  }

  if (verificationResult.decoded.role !== "user") {
    return NextResponse.json(
      { message: "You need a user account to purchase a course" },
      { status: 401 }
    );
  }

  const data = await request.json();

  if (!data.courseId) {
    return NextResponse.json({ message: "Invalid request" }, { status: 400 });
  }

  let courseId;
  try {
    courseId = new ObjectId(data.courseId);
  } catch (error) {
    return NextResponse.json({ message: "Invalid id format" }, { status: 400 });
  }

  let voucherId;

  if (data.voucherId) {
    try {
      voucherId = new ObjectId(data.voucherId);
    } catch (error) {
      return NextResponse.json(
        { message: "Invalid id format" },
        { status: 400 }
      );
    }
  }

  try {
    const course = await db
      .collection("courses")
      .findOne({ _id: courseId, publishedAt: { $exists: true } });

    if (!course) {
      return new NextResponse("Course not found", {
        status: 404,
      });
    }

    let voucher;

    if (data.voucherId) {
      voucher = await db.collection("vouchers").findOne({ _id: voucherId });

      if (!voucher) {
        return new NextResponse("Voucher not found", { status: 404 });
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

      if (voucher.type == "instructor") {
        if (voucher.creatorId !== course.instructorId) {
          return NextResponse.json(
            { message: "Cant use voucher for this transaction" },
            { status: 400 }
          );
        }
      }
    }

    const existEnrollment = await db.collection("enrollments").findOne({
      userId: new ObjectId(verificationResult.decoded.userId),
      courseId: courseId,
    });

    if (existEnrollment) {
      return NextResponse.json(
        { message: "You already enroll this course" },
        { status: 400 }
      );
    }

    const existTransaction = await db.collection("transactions").findOne({
      userId: new ObjectId(verificationResult.decoded.userId),
      courseId: courseId,
      status: { $exists: false },
      dueDate: { $gt: new Date() },
    });

    if (existTransaction) {
      return NextResponse.json(
        {
          message: "Complete the previous transaction",
          data: existTransaction._id,
        },
        { status: 403 }
      );
    }

    let transaction;

    if (data.voucherId && voucher) {
      transaction = await db.collection("transactions").insertOne({
        userId: new ObjectId(verificationResult.decoded.userId),
        courseId,
        createdAt: new Date(),
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        amount: parseFloat(course.discountedPrice),
        tax: taxRate,
        voucherId: new ObjectId(data.voucherId),
        voucherDiscount: voucher.discount,
      });
    } else {
      transaction = await db.collection("transactions").insertOne({
        userId: new ObjectId(verificationResult.decoded.userId),
        courseId,
        createdAt: new Date(),
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        amount: parseFloat(course.discountedPrice),
        tax: taxRate,
      });
    }

    let finalPrice;
    if (data.voucherId && voucher) {
      finalPrice =
        parseFloat(course.discountedPrice) -
        (parseFloat(course.discountedPrice) * voucher.discount) / 100 +
        ((parseFloat(course.discountedPrice) * voucher.discount) / 100) *
          taxRate;
    } else {
      finalPrice =
        parseFloat(course.discountedPrice) +
        parseFloat(course.discountedPrice) * taxRate;
    }

    const invoiceData: CreateInvoiceRequest = {
      externalId: transaction.insertedId.toString(),
      amount: finalPrice,
      currency: "IDR",
      invoiceDuration: "86400",
      payerEmail: verificationResult.decoded.email,
      shouldSendEmail: true,
    };

    const response: Invoice = await xenditInvoiceClient.createInvoice({
      data: invoiceData,
    });

    if (response) {
      await db.collection("transactions").updateOne(
        {
          _id: transaction.insertedId,
        },
        {
          $set: {
            invoiceId: response.id,
            invoiceUrl: response.invoiceUrl,
          },
        }
      );
    }

    return NextResponse.json(
      {
        message: "Transaction created successfully",
        data: {
          _id: transaction.insertedId.toString(),
          amount: finalPrice,
          invoiceId: response.id,
          invoiceUrl: response.invoiceUrl,
        },
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

  try {
    const result = await db
      .collection("transactions")
      .aggregate([
        {
          $match: {
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
            courseDetails: {
              _id: { $arrayElemAt: ["$courseDetails._id", 0] },
              title: { $arrayElemAt: ["$courseDetails.title", 0] },
              thumbnail: { $arrayElemAt: ["$courseDetails.thumbnail", 0] },
            },
          },
        },
      ])
      .sort({ createdAt: -1 })
      .toArray();

    if (!result) {
      return NextResponse.json(
        { message: "No transactions found" },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json(
      { message: "Success getting transactions data", data: result },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
