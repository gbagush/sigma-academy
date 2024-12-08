"use client";

import axios from "axios";
import { useEffect, useState } from "react";

import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@nextui-org/table";
import { Input } from "@nextui-org/input";

import { Button } from "@nextui-org/button";
import { Plus, Search, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import Link from "next/link";

export interface Quiz {
  _id: string;
  instructorId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export default function QuizDashboard() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const { toast } = useToast();

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const response = await axios.get("/api/instructor/quiz");
        setQuizzes(response.data.data);
        setLoading(false);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          toast({
            title: "Failed to fetch quiz",
            description:
              error.response?.data.message || "An unknown error occurred.",
          });
        } else {
          toast({
            title: "Failed to fetch quiz",
            description: "Network error, please try again later",
          });
        }
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  const filteredQuizzes = quizzes.filter((quiz) =>
    quiz.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <h1 className="text-2xl my-4">Quiz Dashboard</h1>
      <div className="flex justify-end gap-4">
        <Input
          className="max-w-sm"
          startContent={<Search className="text-foreground/75" size={16} />}
          placeholder="Search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Button as={Link} href="/instructor/dashboard/quiz/new">
          <Plus size={16} />
          Create New Quiz
        </Button>
      </div>

      <Table aria-label="Course Table" className="mt-4">
        <TableHeader>
          <TableColumn>Created At</TableColumn>
          <TableColumn>Title</TableColumn>
          <TableColumn>Action</TableColumn>
        </TableHeader>
        <TableBody>
          {filteredQuizzes.map((quiz) => (
            <TableRow key={quiz._id}>
              <TableCell>
                {new Date(quiz.createdAt).toLocaleString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                })}
              </TableCell>

              <TableCell>{quiz.title}</TableCell>

              <TableCell>
                <Button
                  size="sm"
                  as={Link}
                  href={`quiz/${quiz._id}`}
                  isIconOnly
                >
                  <Settings size={16} />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
