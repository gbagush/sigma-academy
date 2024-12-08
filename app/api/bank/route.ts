import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { verifyTokenFromRequest } from "@/lib/jwt";
import { MongoError, ObjectId } from "mongodb";

export async function GET(request: NextRequest) {
  const verificationResult = await verifyTokenFromRequest(request);

  if (verificationResult instanceof NextResponse) {
    return verificationResult;
  }

  if (verificationResult.decoded.role == "user") {
    return NextResponse.json(
      {
        message: "You do not have permission to access this resource",
      },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  try {
    let result;
    if (code) {
      result = await db.collection("banks").findOne({ code: code });
    } else {
      result = await db.collection("banks").find().toArray();
    }

    if (!result) {
      return NextResponse.json(
        {
          message: "No banks found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: "Success getting banks list",
        data: result,
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
