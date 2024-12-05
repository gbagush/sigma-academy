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

interface Course {
  _id: string;
  title?: string;
  thumbnail?: string;
  createdAt: string;
  publishedAt?: string;
}

export default function CoursesDashboard() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const { toast } = useToast();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await axios.get("/api/instructor/course");
      setCourses(response.data.data);
      setLoading(false);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast({
          title: "Failed to fetch courses",
          description:
            error.response?.data.message || "An unknown error occurred.",
        });
      }
      setLoading(false);
    }
  };

  const handleCreateCourse = async () => {
    try {
      const response = await axios.post("/api/instructor/course");

      toast({
        title: "Course created successfully!",
        description: response.data.message,
      });

      setTimeout(() => {
        window.location.href = `courses/${response.data.data}`;
      }, 2000);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast({
          title: "Failed create course",
          description:
            error.response?.data.message || "An unknown error occurred.",
        });
      } else if (error instanceof Error) {
        toast({ title: "Failed create course", description: error.message });
      }
    }
  };

  const filteredCourses = courses.filter((course) =>
    (course.title || "Untitled Course")
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <h1 className="text-2xl my-4">Courses Dashboard</h1>
      <div className="flex justify-end gap-4">
        <Input
          className="max-w-sm"
          startContent={<Search className="text-foreground/75" size={16} />}
          placeholder="Search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Button onPress={handleCreateCourse}>
          <Plus size={16} />
          Create New Course
        </Button>
      </div>

      <Table aria-label="Course Table" className="mt-4">
        <TableHeader>
          <TableColumn>Created At</TableColumn>
          <TableColumn>Thumbnail</TableColumn>
          <TableColumn>Title</TableColumn>
          <TableColumn>Status</TableColumn>
          <TableColumn>Action</TableColumn>
        </TableHeader>
        <TableBody>
          {filteredCourses.map((course) => (
            <TableRow key={course._id}>
              <TableCell>
                {new Date(course.createdAt).toLocaleString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                })}
              </TableCell>
              <TableCell>
                {course.thumbnail ? (
                  <Image
                    src={course.thumbnail}
                    alt={course.title || "Course thumbnail"}
                    width={100}
                    height={56}
                    className="rounded-md"
                  />
                ) : (
                  <Image
                    src="https://res.cloudinary.com/dbisfygbm/image/upload/v1732782730/public/default-thumbnail.png"
                    alt="Course thumbnail"
                    width={100}
                    height={56}
                    className="rounded-md"
                  />
                )}
              </TableCell>
              <TableCell>{course.title || "Untitled Course"}</TableCell>
              <TableCell>
                {course.publishedAt ? (
                  <span className="text-success">Published</span>
                ) : (
                  <i className="text-foreground/75">Draft</i>
                )}
              </TableCell>
              <TableCell>
                <Button
                  size="sm"
                  as={Link}
                  href={`courses/${course._id}`}
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
