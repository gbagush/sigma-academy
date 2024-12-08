"use client";

import { useToast } from "@/hooks/use-toast";
import { Button } from "@nextui-org/button";
import { Card, CardBody } from "@nextui-org/card";
import { Checkbox } from "@nextui-org/checkbox";
import axios from "axios";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";

export interface Quiz {
  _id: string;
  instructorId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  questions: Question[];
}

export interface Question {
  _id: string;
  question: string;
  answers: Answer[];
}

export interface Answer {
  _id: string;
  answer: string;
}

export default function Transaction({ params }: { params: { id: string } }) {
  const [quizData, setQuizData] = useState<Quiz>();
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<
    { questionId: string; answerId: string | null }[]
  >([]);

  const { toast } = useToast();

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await axios.get(`/api/quiz/${params.id}`);
        setQuizData(response.data.data);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          toast({
            title: "Failed to get quiz data",
            description: error.response?.data.message || "An error occurred.",
          });
        } else {
          toast({
            title: "Failed to get quiz data",
            description: "Network error. Please try again.",
          });
        }
      }
    };

    fetchQuiz();
  }, [params.id]);

  const handleAnswerSelect = (questionId: string, answerId: string) => {
    setAnswers((prev) => {
      const existingAnswerIndex = prev.findIndex(
        (a) => a.questionId === questionId
      );
      if (existingAnswerIndex > -1) {
        const updatedAnswers = [...prev];
        updatedAnswers[existingAnswerIndex].answerId = answerId;
        return updatedAnswers;
      }
      return [...prev, { questionId, answerId }];
    });
  };

  const getSelectedAnswerId = (questionId: string) => {
    const answer = answers.find((a) => a.questionId === questionId);
    return answer ? answer.answerId : null;
  };

  return (
    <div className="flex justify-center py-8 w-full">
      <div className="max-w-2xl w-full">
        {quizData ? (
          <>
            <h1 className="text-xl md:text-3xl font-bold mb-4">
              {quizData.title}
            </h1>
            <span className="font-semibold text-foreground/75">
              Question {questionIndex + 1} of {quizData.questions.length}
            </span>
            <p className="mt-4 text-lg md:text-xl">
              {quizData.questions[questionIndex].question}
            </p>
            <div className="flex flex-col gap-4 mt-8">
              {quizData.questions[questionIndex].answers.map((answer) => (
                <Card key={answer._id}>
                  <CardBody className="p-4">
                    <div className="flex gap-2 items-center">
                      <Checkbox
                        isSelected={
                          getSelectedAnswerId(
                            quizData.questions[questionIndex]._id
                          ) === answer._id
                        }
                        onChange={() =>
                          handleAnswerSelect(
                            quizData.questions[questionIndex]._id,
                            answer._id
                          )
                        }
                      />
                      <span>{answer.answer}</span>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
            <div className="flex justify-between mt-8">
              <Button
                color="primary"
                onClick={() => setQuestionIndex(questionIndex - 1)}
                isDisabled={questionIndex === 0}
              >
                <ArrowLeft size={16} /> Previous
              </Button>
              <Button
                color="primary"
                onClick={() => setQuestionIndex(questionIndex + 1)}
                isDisabled={questionIndex === quizData.questions.length - 1}
              >
                Next <ArrowRight size={16} />
              </Button>
            </div>
          </>
        ) : (
          <p>Loading...</p>
        )}
      </div>
    </div>
  );
}
