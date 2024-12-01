"use client";

import axios from "axios";
import Image from "next/image";

import React, { useState, useEffect } from "react";
import ReactPlayer from "react-player";

import { Breadcrumbs, BreadcrumbItem } from "@nextui-org/breadcrumbs";
import { Accordion, AccordionItem } from "@nextui-org/accordion";
import { Check, Eye, Globe, RefreshCcw, TvMinimalPlay } from "lucide-react";
import { Chip } from "@nextui-org/chip";
import { User } from "@nextui-org/user";
import { Card, CardBody } from "@nextui-org/card";
import { Divider } from "@nextui-org/divider";
import { Button } from "@nextui-org/button";
import { useAuth } from "@/context/authContext";
import Link from "next/link";

interface CourseData {
  _id: string;
  instructorId: string;
  createdAt: string;
  category: string;
  description: string;
  language: string;
  thumbnail: string;
  title: string;
  updatedAt: string;
  sections: Section[];
  discountedPrice: string;
  price: string;
  status: string;
  publishedAt: string;
  instructorDetails: InstructorDetail[];
  categoryDetails: CategoryDetails;
  enrollmentId?: string;
}
interface Section {
  _id: string;
  title: string;
  contents: Content[];
}
interface Content {
  _id: string;
  title: string;
  url?: string;
  description?: string;
  preview: boolean;
}

interface CategoryDetails {
  _id: string;
  name: string;
  parent: string;
}

interface InstructorDetail {
  _id: string;
  firstName: string;
  lastName: string;
  profilePicture: string;
  username: string;
}

const formatCurrency = (amount: string) => {
  const number = parseFloat(amount);
  return `Rp${new Intl.NumberFormat("id-ID", {
    style: "decimal",
    minimumFractionDigits: 0,
  }).format(number)}`;
};

export default function CourseDetails({ params }: { params: { id: string } }) {
  const [course, setCourse] = useState<CourseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedContent, setSelectedContent] = useState<Content>();

  const { status } = useAuth();

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const result = await axios.get(`/api/course/${params.id}`);
        setCourse(result.data.data);
      } catch (err) {
        setError("Failed to fetch course data.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [params.id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!course) {
    return <div>No course found.</div>;
  }

  return (
    <section className="py-4">
      <Breadcrumbs>
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem>Course</BreadcrumbItem>
        <BreadcrumbItem>{course.title}</BreadcrumbItem>
      </Breadcrumbs>

      <div className="flex flex-col items-center justify-center text-center mt-8">
        <div className="min-w-xl max-w-2xl">
          {course.enrollmentId && (
            <Chip className="mb-2" color="primary">
              Enrolled
            </Chip>
          )}
          <h1 className="text-xl md:text-3xl font-semibold">{course.title}</h1>
        </div>

        <div className="min-w-2xl max-w-xl w-full">
          <div className="flex flex-col gap-4 md:flex-row mt-8 w-full items-center justify-center">
            <div className="w-full md:w-1/2 flex gap-4 items-center justify-center text-foreground/75">
              <Globe size={20} />
              <span className="text-sm">
                Released at{" "}
                {new Date(course.publishedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>

            <div className="w-full md:w-1/2 flex gap-4 items-center justify-center text-foreground/75">
              <RefreshCcw size={20} />
              <span className="text-sm">
                Last updated at{" "}
                {new Date(course.updatedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>
          <div className="mt-8">
            {course.status == "ongoing" ? (
              <Chip variant="flat" color="default">
                On Going
              </Chip>
            ) : (
              <Chip variant="flat" color="success">
                Finished
              </Chip>
            )}
          </div>
        </div>

        <div className="flex flex-col md:flex-row w-full mt-12">
          <div className="w-full md:w-3/5 md:p-4">
            {selectedContent == null ? (
              <Image
                src={course.thumbnail}
                alt={course.title}
                height={500}
                width={500}
                className="w-full rounded-md"
              />
            ) : (
              <ReactPlayer url={selectedContent.url} width="100%" controls />
            )}
          </div>
          <div className="py-4 w-full md:w-2/5 md:p-4 ">
            <Accordion variant="bordered" isCompact>
              {course.sections.map((section) => (
                <AccordionItem
                  key={section._id}
                  aria-label={section.title}
                  title={section.title}
                  className="mb-2"
                >
                  <div className="flex flex-col gap-2">
                    {section.contents.map((content, index) => (
                      <button
                        className={`w-full flex justify-between items-center ${
                          content.url
                            ? "cursor-pointer"
                            : "cursor-not-allowed text-foreground/50"
                        }`}
                        key={index}
                        onClick={() => {
                          if (content.url) {
                            setSelectedContent(content);
                          }
                        }}
                        disabled={!content.url}
                        type="button"
                      >
                        <div className="flex gap-2 items-center overflow-hidden whitespace-nowrap">
                          <TvMinimalPlay size={16} />
                          <span className="truncate">{content.title}</span>
                        </div>
                        <div className="flex items-center">
                          {content.preview && <Eye size={16} />}
                        </div>
                      </button>
                    ))}
                  </div>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>

        <div className="flex flex-col gap-8 justify-start items-start w-full py-4">
          <div className="flex flex-col gap-4 max-w-2xl text-start">
            <h4 className="text-md md:text-lg font-semibold">Description</h4>
            <p className="text-sm text-foreground/75">{course.description}</p>
          </div>
          <div className="flex flex-col gap-4 max-w-2xl text-start">
            <h4 className="text-md md:text-lg font-semibold">
              Learn with Expert
            </h4>
            <User
              name={`${course.instructorDetails[0].firstName} ${course.instructorDetails[0].lastName}`}
              description={`@${course.instructorDetails[0].username}`}
              avatarProps={{
                src: course.instructorDetails[0].profilePicture,
              }}
            />
          </div>
        </div>

        {course.enrollmentId == null && (
          <div className="flex flex-col gap-4 w-full justify-center items-center py-8">
            <h2 className="text-2xl font-semibold">Enroll Now</h2>
            <Card className="max-w-xs p-4">
              <CardBody>
                <div className="flex flex-col">
                  <h4 className="text-sm">Lifetime</h4>
                  <div className="mt-4">
                    {course.price !== course.discountedPrice && (
                      <h4 className="text-lg line-through text-foreground/75">
                        {formatCurrency(course.price)}
                      </h4>
                    )}
                    <h3 className="text-4xl font-semibold">
                      {formatCurrency(course.discountedPrice)}
                    </h3>
                  </div>

                  <p className="mt-4 text-sm">
                    Have a Premium class permanently and build a real project
                  </p>
                  <Divider className="my-4" />
                  <div className="flex flex-col gap-4">
                    <div className="flex gap-2">
                      <Check /> Lifetime Access
                    </div>
                    <div className="flex gap-2">
                      <Check /> Self-Paced Learning
                    </div>
                    <div className="flex gap-2">
                      <Check /> Community Forums
                    </div>
                    <div className="flex gap-2">
                      <Check /> Networking Opportunities
                    </div>
                    <div className="flex gap-2">
                      <Check /> Certificate
                    </div>
                  </div>
                  {status == "logout" ? (
                    <Button
                      as={Link}
                      href={`/auth/user/login?redirect=${encodeURIComponent(window.location.href)}`}
                      className="mt-8 font-semibold"
                      color="primary"
                    >
                      Enroll Now
                    </Button>
                  ) : (
                    <Button
                      as={Link}
                      href={`${course._id}/enroll`}
                      className="mt-8 font-semibold"
                      color="primary"
                    >
                      Enroll Now
                    </Button>
                  )}
                </div>
              </CardBody>
            </Card>
          </div>
        )}
      </div>
    </section>
  );
}
