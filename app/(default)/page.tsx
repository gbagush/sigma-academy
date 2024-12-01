"use client";

import axios from "axios";
import { useState, useEffect } from "react";

import { Link } from "@nextui-org/link";
import { button as buttonStyles } from "@nextui-org/theme";

import { siteConfig } from "@/config/site";
import { title, subtitle } from "@/components/primitives";
import { Rocket } from "lucide-react";
import { useAuth } from "@/context/authContext";

import Image from "next/image";
import CourseCard, { Course } from "@/components/shared/course-card";

export default function Home() {
  const { status } = useAuth();

  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get(`api/course`);
        setCourses(response.data.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchCourses();
  }, []);
  return (
    <>
      <section className="flex flex-col-reverse md:flex-row items-center justify-center gap-4 pt-8">
        <div className="inline-block max-w-xl text-center md:text-left">
          <span className={title()}>Unlock Your&nbsp;</span>
          <span className={title({ color: "blue" })}>Potential&nbsp;</span>
          <br />
          <span className={title()}>One Course at a Time</span>
          <div className={subtitle({ class: "mt-4" })}>
            Discover New Skills, Achieve New Goals with Sigma Academy.
          </div>
          {status == "logout" && (
            <div className="flex gap-3 mt-4 justify-center md:justify-start">
              <Link
                className={buttonStyles({ variant: "bordered" })}
                href={"/auth/user/signup"}
              >
                <Rocket size={16} />
                Join for Free
              </Link>
            </div>
          )}
        </div>

        <div className="flex justify-center md:justify-end">
          <Image
            src="/landing-unregistered-hero.webp"
            alt="Hero Image"
            className=" h-auto"
            width={500}
            height={300}
          />
        </div>
      </section>
      <section className="flex flex-col mt-16 items-center gap-4">
        <div className="flex gap-2 w-full items-center justify-left">
          <Rocket />
          <h2 className="text-xl">Explore</h2>
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
