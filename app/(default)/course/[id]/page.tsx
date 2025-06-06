"use client";

import axios from "axios";
import Image from "next/image";

import React, { useState, useEffect } from "react";
import ReactPlayer from "react-player";

import { Breadcrumbs, BreadcrumbItem } from "@nextui-org/breadcrumbs";
import { Accordion, AccordionItem } from "@nextui-org/accordion";
import { Pagination } from "@nextui-org/pagination";
import {
  Check,
  Dot,
  Eye,
  FileCheck,
  FileQuestion,
  Globe,
  MessageSquare,
  RefreshCcw,
  Send,
  Settings,
  Star,
  TvMinimalPlay,
} from "lucide-react";
import { Chip } from "@nextui-org/chip";
import { User } from "@nextui-org/user";
import { Card, CardBody } from "@nextui-org/card";
import { Divider } from "@nextui-org/divider";
import { Button } from "@nextui-org/button";
import { useAuth } from "@/context/authContext";
import Link from "next/link";
import { Textarea } from "@nextui-org/input";
import { useToast } from "@/hooks/use-toast";

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
  isInstructor?: boolean;
  isAdmin?: boolean;
  certificateId?: string;
}

interface Section {
  _id: string;
  title: string;
  contents: Content[];
}
interface Content {
  _id: string;
  title: string;
  type: "content" | "quiz";
  url?: string;
  description?: string;
  preview?: boolean;
  quizId?: string;
  minimumGrade?: number;
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

export interface ReviewStats {
  reviews: Review[];
  total: number;
  currentPage: number;
  limit: number;
  average?: number;
}

export interface Review {
  _id: string;
  userId: string;
  courseId: string;
  rating: number;
  review: string;
  userDetails: UserDetails;
  updatedAt: string;
}

export interface UserDetails {
  _id: string;
  firstName: string;
  lastName: string;
  username: string;
  profilePicture: string;
}

export interface Enrollment {
  _id: string;
  userId: string;
  courseId: string;
  transactionId: string;
  enrolledAt: string;
  progress?: Progress[];
}

export interface Progress {
  contentId: string;
  doneAt: string;
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
  const [enrollment, setEnrollment] = useState<Enrollment>();

  const { role, status } = useAuth();

  const { toast } = useToast();

  const fetchEnrollment = async () => {
    if (course?.enrollmentId) {
      try {
        const response = await axios.get(
          `/api/enrollment/${course.enrollmentId}`
        );

        setEnrollment(response.data.data);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          toast({
            title: "Failed getting enrollment data",
            description: error.response?.data.message || "An error occurred.",
          });
        } else {
          toast({
            title: "Failed getting enrollment data",
            description: "Network error. Please try again.",
          });
        }
      }
    }
  };

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

  useEffect(() => {
    fetchEnrollment();
  }, [course]);

  const handleComplete = async (contentId: string) => {
    try {
      const result = await axios.post(`/api/course/${params.id}/${contentId}`);

      toast({
        title: "Progress saved successfully",
        description: result.data.message,
      });

      fetchEnrollment();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast({
          title: "Failed save progress",
          description: error.response?.data.message || "An error occurred.",
        });
      } else {
        toast({
          title: "Failed save progress",
          description: "Network error. Please try again.",
        });
      }
    }
  };

  const isContentCompleted = (contentId: string) => {
    return enrollment?.progress?.some(
      (progress) => progress.contentId === contentId
    );
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!course) {
    return <div>No course found.</div>;
  }

  const allContentCompleted = () => {
    if (!enrollment || !course) return false;

    const progress = enrollment.progress || [];

    return course.sections.every((section) =>
      section.contents.every((content) =>
        progress.some((item) => item.contentId === content._id)
      )
    );
  };

  return (
    <section className="py-4">
      <Breadcrumbs>
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem>Course</BreadcrumbItem>
        <BreadcrumbItem>{course.title}</BreadcrumbItem>
      </Breadcrumbs>

      <div className="flex flex-col items-center justify-center text-center mt-8">
        <div className="min-w-xl max-w-2xl">
          <Chip className="mb-2" color="primary">
            {course.categoryDetails.name}
          </Chip>
          <h1 className="text-xl md:text-3xl font-semibold">{course.title}</h1>
        </div>
        <div className="min-w-2xl max-w-xl w-full">
          <div className="flex flex-col gap-4 md:flex-row mt-4 w-full items-center justify-center">
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
          <div className="mt-4">
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
        <div className="flex w-full justify-end gap-2  mt-12">
          {course.certificateId && (
            <Button
              color="primary"
              as={Link}
              href={`/certificate/${course.certificateId}`}
              target="_blank"
            >
              <FileCheck size={16} />
              Show Certificate
            </Button>
          )}
          {allContentCompleted() && course.certificateId === undefined && (
            <Button
              color="primary"
              as={Link}
              href={`/certificate/reedem/${enrollment?._id}`}
            >
              <FileCheck size={16} /> Get Certificate
            </Button>
          )}
          {(course.enrollmentId || course.isInstructor || course.isAdmin) && (
            <Button
              as={Link}
              href={`/course/${params.id}/forum`}
              color="primary"
            >
              <MessageSquare size={16} /> Forum
            </Button>
          )}
          {course.isInstructor && (
            <Button
              as={Link}
              href={`/instructor/dashboard/courses/${params.id}`}
              color="primary"
            >
              <Settings size={16} /> Manage
            </Button>
          )}
        </div>
        <div className="flex flex-col md:flex-row w-full">
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
              <ReactPlayer
                url={selectedContent.url}
                width="100%"
                controls
                onEnded={async () => handleComplete(selectedContent._id)}
              />
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
                    {section.contents.map((content, index) =>
                      content.type === "quiz" ? (
                        <Link
                          className={`w-full flex justify-between items-center ${
                            content.quizId
                              ? "cursor-pointer"
                              : "cursor-not-allowed text-foreground/50"
                          }`}
                          key={index}
                          href={
                            content.quizId
                              ? `/course/${params.id}/quiz/${content._id}`
                              : "#"
                          }
                          type="button"
                        >
                          <div className="flex gap-2 items-center overflow-hidden whitespace-nowrap">
                            <FileQuestion size={16} />
                            <span className="truncate">{content.title}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {isContentCompleted(content._id) && (
                              <Check size={16} />
                            )}
                            {content.preview && <Eye size={16} />}
                          </div>
                        </Link>
                      ) : (
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
                          <div className="flex items-center gap-2">
                            {isContentCompleted(content._id) && (
                              <Check size={16} />
                            )}
                            {content.preview && <Eye size={16} />}
                          </div>
                        </button>
                      )
                    )}
                  </div>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
        {selectedContent !== undefined && (
          <div className="flex flex-col gap-8 justify-start items-start w-full py-4">
            <div className="flex flex-col gap-4 max-w-2xl text-start">
              <h4 className="text-lg md:text-2xl font-semibold">
                {selectedContent?.title}
              </h4>
              <p className="text-sm text-foreground/75">
                {selectedContent?.description}
              </p>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-8 justify-start items-start w-full py-4">
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
          <div className="flex flex-col gap-4 max-w-2xl text-start">
            <h4 className="text-md md:text-lg font-semibold">
              Course Description
            </h4>
            <p className="text-sm text-foreground/75">{course.description}</p>
          </div>
        </div>
        {course.enrollmentId == null && role == "user" && (
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

        <RatingSection course={course} />
      </div>
    </section>
  );
}

const RatingSection = ({ course }: { course: CourseData }) => {
  const [reviewData, setReviewData] = useState({
    rating: 0,
    review: "",
  });

  const [reviews, setReviews] = useState<ReviewStats>();
  const [page, setPage] = useState(1);

  const { role, user } = useAuth();
  const { toast } = useToast();

  const handleRating = (value: number) => {
    setReviewData({ ...reviewData, rating: value });
  };

  useEffect(() => {
    const fetchReview = async () => {
      if (role == "user") {
        try {
          const result = await axios.get(`/api/review/${course._id}/my`);

          if (
            result.data.data &&
            result.data.data.rating &&
            result.data.data.review
          ) {
            setReviewData({
              rating: result.data.data.rating,
              review: result.data.data.review,
            });
          }
        } catch (error) {
          if (axios.isAxiosError(error)) {
            if (error.status == 404) {
              return;
            }
            toast({
              title: "Failed get review",
              description: error.response?.data.message || "An error occurred.",
            });
          } else {
            toast({
              title: "Failed get review",
              description: "Network error. Please try again.",
            });
          }
        }
      }
    };

    fetchReview();
  }, []);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const result = await axios.get(
          `/api/review/${course._id}?page=${page - 1}`
        );
        setReviews(result.data.data);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          toast({
            title: "Failed get reviews",
            description: error.response?.data.message || "An error occurred.",
          });
        } else {
          toast({
            title: "Failed get reviews",
            description: "Network error. Please try again.",
          });
        }
      }
    };

    fetchReviews();
  }, [page]);

  const handleSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append("rating", reviewData.rating.toString());
      formData.append("review", reviewData.review);

      await axios.post(`/api/review/${course._id}`, formData);

      toast({
        title: "Review submitted successfully",
        description: "Thank you for your review!",
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast({
          title: "Failed submit review",
          description: error.response?.data.message || "An error occurred.",
        });
      } else {
        toast({
          title: "Failed submit review",
          description: "Network error. Please try again.",
        });
      }
    }
  };

  return (
    <div className="flex flex-col gap-8 justify-start items-start w-full py-4">
      <div className="flex flex-col gap-4 max-w-2xl w-full text-start">
        {course.enrollmentId != null && role == "user" && user && (
          <>
            <User
              name={`${user.firstName} ${user.lastName}`}
              description="Review"
              className="justify-start"
              avatarProps={{
                src: user.profilePicture
                  ? user.profilePicture
                  : `https://api.dicebear.com/9.x/initials/svg?seed=${user.firstName}`,
              }}
            />
            <div className="flex">
              {[1, 2, 3, 4, 5].map((value: number) => (
                <Button
                  key={value}
                  isIconOnly
                  size="sm"
                  variant="light"
                  onClick={() => handleRating(value)}
                >
                  <Star
                    fill={value <= reviewData.rating ? "orange" : "none"}
                    strokeWidth={value <= reviewData.rating ? 0 : 1}
                  />
                </Button>
              ))}
            </div>
            <div className="w-full">
              <Textarea
                label="Review"
                variant="bordered"
                className="min-w-sm max-w-sm w-full"
                max={250}
                value={reviewData.review}
                onChange={(e) =>
                  setReviewData({ ...reviewData, review: e.target.value })
                }
              />
            </div>
            <div className="flex max-w-sm justify-end">
              <Button onClick={handleSubmit}>
                <Send size={16} /> Send
              </Button>
            </div>
          </>
        )}
        <h4 className="text-md md:text-lg font-semibold">Reviews</h4>
        {reviews != null && (
          <div className="flex flex-col gap-2 max-w-2xl w-full text-start">
            <div className="flex items-center">
              <Star className="mr-2" fill="orange" strokeWidth={0} />
              {reviews.average}
              <Dot />
              {reviews.total}&#160;&#160;Reviews
            </div>
          </div>
        )}
        {reviews &&
          reviews.reviews.map((review) => (
            <div className="flex flex-col" key={review._id}>
              <>
                <User
                  name={`${review.userDetails.firstName} ${review.userDetails.lastName}`}
                  description={new Date(review.updatedAt).toLocaleString(
                    "en-US",
                    {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    }
                  )}
                  avatarProps={{
                    src: review.userDetails.profilePicture,
                  }}
                  className="justify-start"
                />
                <div className="flex mt-2" key={review._id}>
                  {[1, 2, 3, 4, 5].map((value: number) => (
                    <Button key={value} isIconOnly size="sm" variant="light">
                      <Star
                        fill={value <= review.rating ? "orange" : "none"}
                        strokeWidth={value <= review.rating ? 0 : 1}
                      />
                    </Button>
                  ))}
                </div>
                <p className="text-sm text-foreground/75 mt-1">
                  {review.review.split("\n").map((line, index) => (
                    <React.Fragment key={index}>
                      {line}
                      <br />
                    </React.Fragment>
                  ))}
                </p>
              </>
            </div>
          ))}

        {reviews && reviews.total > 10 && (
          <div className="mt-2">
            <Pagination
              total={Math.ceil(reviews?.total / 10)}
              initialPage={page}
              onChange={setPage}
            />
          </div>
        )}
      </div>
    </div>
  );
};
