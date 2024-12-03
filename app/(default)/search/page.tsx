"use client";

import axios from "axios";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Frown, Search } from "lucide-react";

import CourseCard, { Course } from "@/components/shared/course-card";
import { useToast } from "@/hooks/use-toast";

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
  const [loading, setLoading] = useState(true);

  const { toast } = useToast();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get(
          `api/course/search?keyword=${keyword}`
        );
        setCourses(response.data.data);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          toast({
            title: "Error getting search data",
            description: error.response?.data.message || "An error occurred.",
          });
        } else {
          toast({
            title: "Error getting search data",
            description: "Network error. Please try again.",
          });
        }
      }

      setLoading(false);
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

        {courses.length == 0 && loading == false && (
          <div className="flex h-screen items-center justify-center">
            <p className="flex gap-2">
              Sorry, we can&apos;t find what u lookin for <Frown />
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {courses.map((course) => (
            <CourseCard key={course._id} course={course} />
          ))}
        </div>
      </section>
    </>
  );
}
