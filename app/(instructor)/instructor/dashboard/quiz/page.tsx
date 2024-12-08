"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/modal";
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
import { Plus, Search, Settings, Trash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
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
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz>();

  const { toast } = useToast();
  const deleteQuizModal = useDisclosure();

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

  useEffect(() => {
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
        <Button as={Link} href="/instructor/dashboard/quiz/create">
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
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    as={Link}
                    href={`quiz/${quiz._id}`}
                    isIconOnly
                  >
                    <Settings size={16} />
                  </Button>
                  <Button
                    size="sm"
                    isIconOnly
                    onClick={() => {
                      setSelectedQuiz(quiz);
                      deleteQuizModal.onOpen();
                    }}
                  >
                    <Trash size={16} />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {selectedQuiz !== undefined && (
        <DeleteQuiz
          isOpen={deleteQuizModal.isOpen}
          onOpenChange={deleteQuizModal.onOpenChange}
          selectedQuiz={selectedQuiz}
          fetchQuizzes={fetchQuizzes}
        />
      )}
    </div>
  );
}

const DeleteQuiz = ({
  isOpen,
  onOpenChange,
  selectedQuiz,
  fetchQuizzes,
}: {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  selectedQuiz: Quiz;
  fetchQuizzes: () => void;
}) => {
  const [confirm, setConfirm] = useState("");
  const { toast } = useToast();

  const handleDeleteQuiz = async () => {
    try {
      const response = await axios.delete(
        `/api/instructor/quiz/${selectedQuiz._id}`
      );

      toast({
        title: "Success delete quiz",
        description: response.data.message,
      });

      fetchQuizzes();
      onOpenChange(false);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast({
          title: "Failed delete quiz",
          description: error.response?.data.message || "An error occurred.",
        });
      } else {
        toast({
          title: "Failed delete quiz",
          description: "Network error. Please try again.",
        });
      }
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Delete Quiz
            </ModalHeader>
            <ModalBody>
              <p>
                This action is irreversible. Please check that no courses are
                using this quiz, as it may block student access. To confirm,
                type <b>&quot;{selectedQuiz.title}&quot;</b> in the form below.
              </p>
              <Input
                label="Confirm"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                Close
              </Button>
              <Button
                color="danger"
                isDisabled={confirm !== selectedQuiz.title}
                onClick={handleDeleteQuiz}
              >
                Delete
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
