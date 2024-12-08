import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { verifyTokenFromRequest } from "@/lib/jwt";
import { ObjectId } from "mongodb";

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
    const quiz = await db
      .collection("quizzes")
      .aggregate([
        { $match: { _id: quizId } },
        {
          $project: {
            title: 1,
            instructorId: 1,
            questions: {
              $map: {
                input: "$questions",
                as: "question",
                in: {
                  _id: "$$question._id",
                  question: "$$question.question",
                  answers: {
                    $map: {
                      input: "$$question.answers",
                      as: "answer",
                      in: {
                        _id: "$$answer._id",
                        answer: "$$answer.answer",
                      },
                    },
                  },
                },
              },
            },
            createdAt: 1,
            updatedAt: 1,
          },
        },
      ])
      .toArray();

    if (quiz.length === 0) {
      return NextResponse.json({ message: "Quiz not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Success getting quiz data", data: quiz[0] },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(
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

  const data = await request.json();

  if (!data.answers || !data.courseId || !data.contentId) {
    return NextResponse.json({ message: "Invalid request" }, { status: 400 });
  }

  let courseId;
  let contentId;
  try {
    courseId = new ObjectId(data.courseId);
    contentId = new ObjectId(data.contentId);
  } catch (error) {
    return NextResponse.json({ message: "Invalid id format" }, { status: 400 });
  }

  try {
    const answers = data.answers;
    if (
      !Array.isArray(answers) ||
      !answers.every((answer) => answer.questionId && answer.answerId)
    ) {
      return NextResponse.json(
        { message: "Invalid answers format" },
        { status: 400 }
      );
    }

    const enrollment = await db.collection("enrollments").findOne({
      courseId: courseId,
      userId: new ObjectId(verificationResult.decoded.userId),
    });

    if (!enrollment) {
      return NextResponse.json(
        { message: "You are not enrolled in this course" },
        { status: 403 }
      );
    }

    const course = await db.collection("courses").findOne({
      _id: courseId,
      sections: {
        $elemMatch: {
          contents: {
            $elemMatch: {
              _id: contentId,
            },
          },
        },
      },
    });

    if (!course) {
      return NextResponse.json(
        { message: "Content not found in this course" },
        { status: 404 }
      );
    }

    const content = course.sections
      .flatMap((section: any) => section.contents)
      .find((content: any) => content._id.equals(contentId));

    const quiz = await db.collection("quizzes").findOne({ _id: quizId });

    if (!quiz) {
      return NextResponse.json({ message: "Quiz not found" }, { status: 404 });
    }

    let score = 0;
    const totalQuestions = quiz.questions.length;

    answers.forEach((answer) => {
      const question = quiz.questions.find((q: any) =>
        q._id.equals(answer.questionId)
      );

      if (question) {
        const correctAnswer = question.answers.find(
          (a: any) => a.isTrue && a._id.equals(answer.answerId)
        );
        if (correctAnswer) {
          score++;
        }
      }
    });

    const percentageScore = (score / totalQuestions) * 100;

    const isContentDone = enrollment.progress.some(
      (entry: any) => entry.contentId.toString() === contentId.toString()
    );

    if (percentageScore >= content.minimumGrade) {
      if (isContentDone) {
        return NextResponse.json(
          { message: `${content.title} has already been completed` },
          { status: 200 }
        );
      }

      const updateResult = await db.collection("enrollments").updateOne(
        { _id: enrollment._id },
        {
          $addToSet: {
            progress: {
              contentId: contentId,
              doneAt: new Date(),
            },
          },
        }
      );

      if (updateResult.modifiedCount === 0) {
        return NextResponse.json(
          { message: "Failed to update progress" },
          { status: 500 }
        );
      }

      return NextResponse.json(
        {
          message: "You have completed the quiz",
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        message: "You have failed to complete the quiz, try again another time",
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
