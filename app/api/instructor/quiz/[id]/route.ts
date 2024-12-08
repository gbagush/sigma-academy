import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { verifyTokenFromRequest } from "@/lib/jwt";
import { ObjectId } from "mongodb";

export interface Question {
  _id: string;
  question: string;
  answers: Answer[];
}

export interface Answer {
  _id: string;
  answer: string;
  isTrue: boolean;
}

const isValidObjectId = (id: string) => {
  return ObjectId.isValid(id) && new ObjectId(id).toString() === id;
};

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const verificationResult = await verifyTokenFromRequest(request);

  if (verificationResult instanceof NextResponse) {
    return verificationResult;
  }

  let quizId;
  try {
    quizId = new ObjectId(params.id);
  } catch (error) {
    return NextResponse.json({ message: "Invalid id format" }, { status: 400 });
  }

  try {
    const quiz = await db.collection("quizzes").findOne({
      _id: quizId,
      instructorId: new ObjectId(verificationResult.decoded.userId),
    });

    if (!quiz) {
      return NextResponse.json({ message: "Quiz not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Success getting quiz data", data: quiz },
      { status: 200 }
    );
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

  if (verificationResult.decoded.role !== "instructor") {
    return NextResponse.json(
      { message: "Forbidden" },
      {
        status: 403,
      }
    );
  }

  let quizId;
  try {
    quizId = new ObjectId(params.id);
  } catch (error) {
    return NextResponse.json({ message: "Invalid id format" }, { status: 400 });
  }

  try {
    const data = await request.json();

    if (!data.title || !data.questions || !Array.isArray(data.questions)) {
      return NextResponse.json(
        { message: "Invalid requests" },
        { status: 400 }
      );
    }

    const questions = data.questions.map((question: Question) => ({
      _id: isValidObjectId(question._id)
        ? new ObjectId(question._id)
        : new ObjectId(),
      question: question.question,
      answers: question.answers.map((answer: Answer) => ({
        _id: isValidObjectId(answer._id)
          ? new ObjectId(answer._id)
          : new ObjectId(),
        answer: answer.answer,
        isTrue: answer.isTrue,
      })),
    }));

    const result = await db.collection("quizzes").updateOne(
      {
        instructorId: new ObjectId(verificationResult.decoded.userId),
        _id: quizId,
      },
      {
        $set: {
          title: data.title,
          questions,
          updatedAt: new Date(),
        },
      }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { message: "No changes or quiz not found" },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { message: "Success update quiz" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const verificationResult = await verifyTokenFromRequest(request);

  if (verificationResult instanceof NextResponse) {
    return verificationResult;
  }

  if (verificationResult.decoded.role !== "instructor") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  let quizId;
  try {
    quizId = new ObjectId(params.id);
  } catch (error) {
    return NextResponse.json({ message: "Invalid id format" }, { status: 400 });
  }

  try {
    const result = await db.collection("quizzes").deleteOne({
      _id: quizId,
      instructorId: new ObjectId(verificationResult.decoded.userId),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ message: "Quiz not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Success delete quiz" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
