"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import { Input, Textarea } from "@nextui-org/input";
import { Button } from "@nextui-org/button";
import { Plus, Save, Trash, X } from "lucide-react";
import { Checkbox } from "@nextui-org/checkbox";
import { Divider } from "@nextui-org/divider";
import { useToast } from "@/hooks/use-toast";

interface Answer {
  _id: string;
  answer: string;
  isTrue: boolean;
}

interface Question {
  _id: string;
  question: string;
  answers: Answer[];
}

export default function CreateQuizDashboard({
  params,
}: {
  params: { id: string };
}) {
  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState<Question[]>([
    {
      _id: "",
      question: "",
      answers: [{ _id: "", answer: "", isTrue: false }],
    },
  ]);

  const { toast } = useToast();

  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        const response = await axios.get(`/api/instructor/quiz/${params.id}`);

        setQuestions(response.data.data.questions);
        setTitle(response.data.data.title);
      } catch (error) {}
    };

    fetchQuizData();
  }, []);

  const handleSave = async () => {
    try {
      const response = await axios.put(`/api/instructor/quiz/${params.id}`, {
        title,
        questions,
      });

      toast({
        title: "Quiz Saved Successfully",
        description: response.data.message,
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast({
          title: "Quiz Saved Successfully",
          description: error.response?.data.message || "An error occurred.",
        });
      } else {
        toast({
          title: "Quiz Saved Successfully",
          description: "Network error. Please try again.",
        });
      }
    }
  };

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        _id: "",
        question: "",
        answers: [{ _id: "", answer: "", isTrue: false }],
      },
    ]);
  };

  const handleAddOption = (questionIndex: number) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].answers.push({
      _id: "",
      answer: "",
      isTrue: false,
    });
    setQuestions(newQuestions);
  };

  const handleQuestionChange = (index: number, value: string) => {
    const newQuestions = [...questions];
    newQuestions[index].question = value;
    setQuestions(newQuestions);
  };

  const handleAnswerChange = (
    questionIndex: number,
    answerIndex: number,
    value: string
  ) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].answers[answerIndex].answer = value;
    setQuestions(newQuestions);
  };

  const handleCheckboxChange = (questionIndex: number, answerIndex: number) => {
    const newQuestions = [...questions];

    newQuestions[questionIndex].answers.forEach((answer, index) => {
      answer.isTrue = index === answerIndex;
    });

    setQuestions(newQuestions);
  };

  const handleDeleteQuestion = (index: number) => {
    const newQuestions = questions.filter((_, i) => i !== index);
    setQuestions(newQuestions);
  };

  const handleDeleteOption = (questionIndex: number, answerIndex: number) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].answers.splice(answerIndex, 1);
    setQuestions(newQuestions);
  };

  return (
    <div>
      <h1 className="text-2xl my-4">Edit Quiz</h1>
      <div className="flex justify-between gap-4">
        <Input
          placeholder="Title"
          className="max-w-sm"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <Button color="primary" onClick={handleSave}>
          <Save size={16} />
          Save
        </Button>
      </div>
      <div className="flex flex-col mx-auto mt-8 items-center gap-4 w-full max-w-xl">
        {questions.map((question, questionIndex) => (
          <div key={questionIndex} className="w-full">
            <div className="flex gap-2">
              <Textarea
                variant="bordered"
                label={`Question ${questionIndex + 1}`}
                value={question.question}
                onChange={(e) =>
                  handleQuestionChange(questionIndex, e.target.value)
                }
              />
              <Button
                variant="light"
                isIconOnly
                onClick={() => handleDeleteQuestion(questionIndex)}
              >
                <Trash size={20} />
              </Button>
            </div>
            <div className="flex flex-col gap-2 mt-2">
              {question.answers.map((answer, answerIndex) => (
                <div key={answerIndex} className="flex gap-2">
                  <Checkbox
                    isSelected={answer.isTrue}
                    onChange={() =>
                      handleCheckboxChange(questionIndex, answerIndex)
                    }
                  />
                  <Input
                    variant="bordered"
                    placeholder={`Option ${answerIndex + 1}`}
                    value={answer.answer}
                    onChange={(e) =>
                      handleAnswerChange(
                        questionIndex,
                        answerIndex,
                        e.target.value
                      )
                    }
                  />
                  <Button
                    variant="bordered"
                    isIconOnly
                    onClick={() =>
                      handleDeleteOption(questionIndex, answerIndex)
                    }
                  >
                    <X size={20} />
                  </Button>
                </div>
              ))}
            </div>
            <div className="flex justify-end mt-2">
              <Button
                variant="bordered"
                isIconOnly
                onClick={() => handleAddOption(questionIndex)}
              >
                <Plus size={20} />
              </Button>
            </div>
            <Divider className="my-4" />
          </div>
        ))}
        <Button
          className="mt-4 w-full"
          color="primary"
          onClick={handleAddQuestion}
        >
          <Plus size={20} /> Add Question
        </Button>
      </div>
    </div>
  );
}
