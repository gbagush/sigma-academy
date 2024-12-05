import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { verifyTokenFromRequest } from "@/lib/jwt";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; postid: string } }
) {
  const verificationResult = await verifyTokenFromRequest(request);

  if (verificationResult instanceof NextResponse) {
    return verificationResult;
  }

  let courseId, postId;
  try {
    courseId = new ObjectId(params.id);
    postId = new ObjectId(params.postid);
  } catch (error) {
    return NextResponse.json({ message: "Invalid id format" }, { status: 400 });
  }

  try {
    if (verificationResult.decoded.role == "user") {
      const enrollment = await db.collection("enrollments").findOne({
        userId: new ObjectId(verificationResult.decoded.userId),
        courseId: courseId,
      });

      if (!enrollment) {
        return NextResponse.json(
          {
            message: "Only enrollers can create forum post",
          },
          { status: 403 }
        );
      }
    }

    if (verificationResult.decoded.role == "instructor") {
      const course = await db.collection("courses").findOne({
        _id: courseId,
        instructorId: new ObjectId(verificationResult.decoded.userId),
      });

      if (!course) {
        return NextResponse.json(
          {
            message: "Only instructors can create forum or course not found",
          },
          { status: 403 }
        );
      }
    }

    const data = await request.formData();

    const content = data.get("content");

    if (!content) {
      return NextResponse.json({ message: "Invalid request" }, { status: 400 });
    }

    const result = await db.collection("forumPosts").insertOne({
      creatorType: verificationResult.decoded.role,
      creatorId: new ObjectId(verificationResult.decoded.userId),
      courseId: courseId,
      parent: postId,
      content: content,
      createdAt: new Date(),
    });

    return NextResponse.json(
      { message: "Forum post created successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; postid: string } }
) {
  const verificationResult = await verifyTokenFromRequest(request);

  if (verificationResult instanceof NextResponse) {
    return verificationResult;
  }

  let courseId, forumPostId;
  try {
    courseId = new ObjectId(params.id);
    forumPostId = new ObjectId(params.postid);
  } catch (error) {
    return NextResponse.json({ message: "Invalid id format" }, { status: 400 });
  }

  try {
    if (verificationResult.decoded.role == "user") {
      const enrollment = await db.collection("enrollments").findOne({
        userId: new ObjectId(verificationResult.decoded.userId),
        courseId: courseId,
      });

      if (!enrollment) {
        return NextResponse.json(
          {
            message: "Only enrollers can view forum",
          },
          { status: 403 }
        );
      }
    }

    if (verificationResult.decoded.role == "instructor") {
      const course = await db.collection("courses").findOne({
        _id: courseId,
        instructorId: new ObjectId(verificationResult.decoded.userId),
      });

      if (!course) {
        return NextResponse.json(
          {
            message: "Only instructors can view forum or course not found",
          },
          { status: 403 }
        );
      }
    }

    const result = await db
      .collection("forumPosts")
      .aggregate([
        {
          $match: {
            courseId: courseId,
            parent: forumPostId,
          },
        },
        {
          $facet: {
            userPosts: [
              { $match: { creatorType: "user" } },
              {
                $lookup: {
                  from: "users",
                  localField: "creatorId",
                  foreignField: "_id",
                  as: "creatorDetails",
                },
              },
              {
                $unwind: "$creatorDetails",
              },
              {
                $project: {
                  _id: 1,
                  title: 1,
                  createdAt: 1,
                  content: 1,
                  creatorDetails: {
                    _id: "$creatorDetails._id",
                    firstName: "$creatorDetails.firstName",
                    lastName: "$creatorDetails.lastName",
                    username: "$creatorDetails.username",
                    profilePicture: "$creatorDetails.profilePicture",
                    role: "user",
                  },
                },
              },
            ],
            instructorPosts: [
              { $match: { creatorType: "instructor" } },
              {
                $lookup: {
                  from: "instructors",
                  localField: "creatorId",
                  foreignField: "_id",
                  as: "creatorDetails",
                },
              },
              {
                $unwind: "$creatorDetails",
              },
              {
                $project: {
                  _id: 1,
                  title: 1,
                  createdAt: 1,
                  content: 1,
                  creatorDetails: {
                    _id: "$creatorDetails._id",
                    firstName: "$creatorDetails.firstName",
                    lastName: "$creatorDetails.lastName",
                    username: "$creatorDetails.username",
                    profilePicture: "$creatorDetails.profilePicture",
                    role: "instructor",
                  },
                },
              },
            ],
            adminPosts: [
              { $match: { creatorType: "admin" } },
              {
                $lookup: {
                  from: "admins",
                  localField: "creatorId",
                  foreignField: "_id",
                  as: "creatorDetails",
                },
              },
              {
                $unwind: "$creatorDetails",
              },
              {
                $project: {
                  _id: 1,
                  title: 1,
                  createdAt: 1,
                  content: 1,
                  creatorDetails: {
                    _id: "$creatorDetails._id",
                    firstName: "$creatorDetails.firstName",
                    lastName: "$creatorDetails.lastName",
                    username: "$creatorDetails.username",
                    profilePicture: "$creatorDetails.profilePicture",
                    role: "admin",
                  },
                },
              },
            ],
          },
        },
        {
          $project: {
            allPosts: {
              $concatArrays: ["$userPosts", "$instructorPosts", "$adminPosts"],
            },
          },
        },
        {
          $unwind: "$allPosts",
        },
        {
          $replaceRoot: { newRoot: "$allPosts" },
        },
      ])
      .sort({ createdAt: 1 })
      .toArray();

    return NextResponse.json(
      {
        message: "Success getting forum posts",
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
