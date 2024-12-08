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

export async function POST(request: NextRequest) {
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

    const result = await db.collection("quizzes").insertOne({
      instructorId: new ObjectId(verificationResult.decoded.userId),
      questions,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json(
      { message: "Success create quiz", data: result.insertedId },
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

  if (verificationResult.decoded.role !== "instructor") {
    return NextResponse.json(
      { message: "Forbidden" },
      {
        status: 403,
      }
    );
  }

  try {
    const quizzes = await db
      .collection("quizzes")
      .find({ instructorId: new ObjectId(verificationResult.decoded.userId) })
      .project({ questions: 0 })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(
      { message: "Quizzes retrieved successfully", data: quizzes },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
