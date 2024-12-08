import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { verifyTokenFromRequest } from "@/lib/jwt";
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
  const id = searchParams.get("id");
  const email = searchParams.get("email");
  const firstName = searchParams.get("firstName");
  const lastName = searchParams.get("lastName");
  const username = searchParams.get("username");

  const page = parseInt(searchParams.get("page") || "0", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const sortOrder = searchParams.get("sort") || "newest";

  if (limit > 100) {
    return NextResponse.json({ error: "Limit to big" }, { status: 400 });
  }

  try {
    const query: { [key: string]: any } = {};

    if (id) {
      query._id = new ObjectId(id);
    }

    if (email) {
      query.email = email.toLowerCase();
    }

    if (firstName && lastName) {
      query.firstName = firstName;
      query.lastName = lastName;
    } else {
      if (firstName) {
        query.firstName = firstName;
      }
      if (lastName) {
        query.lastName = lastName;
      }
    }

    if (username) {
      query.username = username;
    }

    const sort: { [key: string]: 1 | -1 } = {};
    if (sortOrder === "oldest") {
      sort.createdAt = 1;
    } else {
      sort.createdAt = -1;
    }

    const totalCount = await db.collection("instructors").countDocuments(query);

    const instructors = await db
      .collection("instructors")
      .find(query)
      .sort(sort)
      .skip(page * limit)
      .limit(limit)
      .toArray();

    return NextResponse.json({
      success: true,
      data: instructors,
      totalCount,
      page,
      limit,
    });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
