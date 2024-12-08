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
  const id = searchParams.get("id");
  const email = searchParams.get("email");
  const status = searchParams.get("status");
  const page = parseInt(searchParams.get("page") || "0", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const sortOrder = searchParams.get("sort") || "newest";

  try {
    const query: { [key: string]: any } = {};

    if (status) {
      query.status = status;
    }

    if (id) {
      try {
        query._id = new ObjectId(id);
      } catch (error) {
        return NextResponse.json(
          { message: "Invalid application ID format" },
          { status: 400 }
        );
      }
    }

    if (id) {
      query._id = new ObjectId(id);
    }

    if (email) {
      query.email = email;
    }

    const totalCount = await db
      .collection("applications")
      .countDocuments(query);

    const sort: { [key: string]: 1 | -1 } = {};
    if (sortOrder === "oldest") {
      sort.createdAt = 1;
    } else {
      sort.createdAt = -1;
    }

    const applications = await db
      .collection("applications")
      .find(query)
      .sort(sort)
      .skip(page * limit)
      .limit(limit)
      .toArray();

    return NextResponse.json({
      success: true,
      data: applications,
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

export async function PUT(request: NextRequest) {
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

  const data = await request.json();

  if (!data.token || !data.status) {
    return NextResponse.json({ message: "Invalid request" }, { status: 400 });
  }

  if (data.status == "rejected" && !data.reason) {
    return NextResponse.json({ message: "Invalid request" }, { status: 400 });
  }

  let tokenId;
  try {
    tokenId = new ObjectId(data.token);
  } catch (error) {
    return NextResponse.json(
      { message: "Invalid token format" },
      { status: 400 }
    );
  }

  const application = await db.collection("applications").findOne({
    _id: tokenId,
    status: "pending",
  });

  if (!application) {
    return NextResponse.json(
      { message: "Application not found" },
      { status: 404 }
    );
  }

  if (data.status == "approved") {
    await db.collection("instructors").insertOne({
      firstName: application.firstName,
      lastName: application.lastName,
      email: application.email,
      password: application.password,
      description: application.description,
      socials: application.socials,
      registerAt: new Date(),
    });

    await db.collection("applications").updateOne(
      {
        _id: tokenId,
      },
      {
        $set: {
          status: "approved",
          modifiedDetails: {
            admin: new ObjectId(verificationResult.decoded.userId),
            modifiedAt: new Date(),
          },
        },
      }
    );

    sendEmail(
      application.email,
      "Congratulations! Your Instructor Application Has Been Approved",
      emailConfirm({
        name: `${application.firstName} ${application.lastName}`,
        intro:
          "Welcome to Sigma Academy! We're thrilled to have you on board as an instructor.",
        body: "Your application has been approved, and you can now begin creating courses to inspire and educate students worldwide. As part of our team, you're encouraged to create meaningful courses that adhere to our community guidelines.",
        action: "Log in to your instructor dashboard to get started:",
        button: "Log In",
        url: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/instructor/login`,
        outro: `To ensure your courses meet our standards, please review our community guidelines here: ${process.env.NEXT_PUBLIC_BASE_URL}/comunity-guideline. If you have any questions or need assistance, feel free to reach out to us at support@sigmaacademy.my.id. We can't wait to see the amazing courses you create!`,
      })
    );

    return NextResponse.json(
      { message: "Instructor approved successfuly" },
      { status: 200 }
    );
  }

  await db.collection("applications").updateOne(
    {
      _id: tokenId,
    },
    {
      $set: {
        status: "rejected",
        modifiedDetails: {
          admin: new ObjectId(verificationResult.decoded.userId),
          reason: data.reason,
          modifiedAt: new Date(),
        },
      },
    }
  );

  sendEmail(
    application.email,
    "Sigma Academy: Instructor Application Update",
    emailNotification({
      name: `${application.firstName} ${application.lastName}`,
      intro:
        "Thank you for applying to join the Sigma Academy instructor team.",
      body: `After careful consideration, we regret to inform you that your application was <strong>Not Successfull</strong> at this time. The reason for this decision is: ${data.reason}.`,
      outro:
        "We truly appreciate your interest and effort in applying to Sigma Academy. We encourage you to apply again in the future as we value dedicated educators like you. If you have any questions, feel free to reach out to our support team at support@sigmaacademy.my.id.",
    })
  );

  return NextResponse.json(
    { message: "Instructor rejected successfuly" },
    { status: 200 }
  );
}
