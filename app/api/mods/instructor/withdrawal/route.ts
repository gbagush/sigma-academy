import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { verifyTokenFromRequest } from "@/lib/jwt";
import { sendEmail } from "@/lib/mailer";
import { emailNotification } from "@/lib/mail-templates/email-notification";
import { emailConfirm } from "@/lib/mail-templates/email-confirm";

import { ObjectId } from "mongodb";

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

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const page = parseInt(searchParams.get("page") || "0", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const sortOrder = searchParams.get("sort") || "newest";

  try {
    const query: { [key: string]: any } = {};

    if (status == "pending") {
      query.status = "pending";
    } else if (status == "success") {
      query.status = "success";
    } else if (status == "failed") {
      query.status = "failed";
    }

    const sort: { [key: string]: 1 | -1 } = {};
    if (sortOrder === "oldest") {
      sort.createdAt = 1;
    } else {
      sort.createdAt = -1;
    }

    query.type = "outcome";

    const totalCount = await db
      .collection("walletTransactions")
      .countDocuments(query);

    const withdrawals = await db
      .collection("walletTransactions")
      .find(query)
      .sort(sort)
      .skip(page * limit)
      .limit(limit)
      .toArray();

    return NextResponse.json({
      message: "Success getting withdrawals",
      data: {
        totalCount,
        page,
        limit,
        withdrawals: withdrawals,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
