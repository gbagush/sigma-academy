import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { verifyTokenFromRequest } from "@/lib/jwt";
import { MongoError, ObjectId } from "mongodb";

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

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "0", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);

  if (page < 0 || limit < 1) {
    return NextResponse.json(
      { message: "Page and max must be positive integers" },
      { status: 400 }
    );
  }

  if (limit > 100) {
    return NextResponse.json({ error: "Limit to big" }, { status: 400 });
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

    const walletStats = await db
      .collection("walletTransactions")
      .aggregate([
        {
          $match: {
            walletId: wallet._id,
            createdAt: {
              $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            },
          },
        },
        {
          $facet: {
            totalCount: [{ $count: "count" }],
            totalIncome: [
              { $match: { type: "income" } },
              {
                $group: {
                  _id: null,
                  total: { $sum: "$amount" },
                },
              },
            ],
            totalOutcome: [
              { $match: { type: "outcome" } },
              {
                $group: {
                  _id: null,
                  total: { $sum: "$amount" },
                },
              },
            ],
          },
        },
      ])
      .toArray();

    const result = await db
      .collection("walletTransactions")
      .find({
        walletId: wallet._id,
      })
      .skip(page * limit)
      .limit(limit)
      .sort({ createdAt: -1 })
      .toArray();

    const stats = walletStats[0];

    return NextResponse.json(
      {
        message: "Success getting transactions data",
        data: {
          transactions: result,
          totalCount: stats.totalCount[0]?.count || 0,
          totalIncome: stats.totalIncome[0]?.total || 0,
          totalOutcome: stats.totalOutcome[0]?.total || 0,
          currentPage: page,
          limit: limit,
          totalPages: Math.ceil((stats.totalCount[0]?.count || 0) / limit),
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
