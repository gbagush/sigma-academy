"use client";

import axios from "axios";
import { useState, useEffect } from "react";

import { Frown, Presentation, Rocket } from "lucide-react";

import EnrolledCourseCard, {
  CourseDetails,
  InstructorDetails,
} from "@/components/shared/enrolled-course-card";
import { Button } from "@nextui-org/button";
import Link from "next/link";

interface Course {
  _id: string;
  userId: string;
  courseId: string;
  transactionId: string;
  enrolledAt: string;
  courseDetails: CourseDetails;
  instructorDetails: InstructorDetails;
}

export default function SearchPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get(`/api/course/my`);
        setCourses(response.data.data);
      } catch (error) {
        console.error(error);
      }

      setLoading(false);
    };

    fetchCourses();
  }, []);

  return (
    <>
      <section className="flex flex-col py-4 items-center gap-4">
        <div className="flex gap-2 w-full items-center justify-left">
          <Presentation />
          <h2 className="text-xl">My Courses</h2>
        </div>

        {courses.length == 0 && loading == false && (
          <div className="flex flex-col gap-4 h-screen items-center justify-center">
            <p className="flex gap-2">You don&apos;t have a course yet</p>
            <Button as={Link} href="/">
              Explore Now <Rocket size={16} />
            </Button>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {courses.map((course) => (
            <EnrolledCourseCard
              key={course._id}
              course={course.courseDetails}
              instructor={course.instructorDetails}
            />
          ))}
        </div>
      </section>
    </>
  );
}
