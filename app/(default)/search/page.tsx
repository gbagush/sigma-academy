"use client";

import axios from "axios";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Search } from "lucide-react";
import { useAuth } from "@/context/authContext";

import CourseCard, { Course } from "@/components/shared/course-card";

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const keyword = searchParams.get("keyword");

  useEffect(() => {
    if (!keyword) {
      router.push("/");
    }
  }, [keyword, router]);

  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get(
          `api/course/search?keyword=${keyword}`
        );
        setCourses(response.data.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchCourses();
  }, [keyword]);
  return (
    <>
      <section className="flex flex-col py-4 items-center gap-4">
        <div className="flex gap-2 w-full items-center justify-left">
          <Search />
          <h2 className="text-xl">Search result for &quot;{keyword}&quot;</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {courses.map((course) => (
            <CourseCard key={course._id} course={course} />
          ))}
        </div>
      </section>
    </>
  );
}
