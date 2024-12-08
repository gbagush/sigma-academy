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
import { taxRate } from "@/config/transaction";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@nextui-org/input";

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

interface Voucher {
  _id: string;
  type: string;
  creatorId: string;
  code: string;
  discount: number;
  createdAt: string;
  updatedAt: string;
  expirationDate: string;
}

const formatCurrency = (amount: string) => {
  const number = parseFloat(amount);
  return `Rp${new Intl.NumberFormat("id-ID", {
    style: "decimal",
    minimumFractionDigits: 0,
  }).format(number)}`;
};

export default function CourseEnroll({ params }: { params: { id: string } }) {
  const [course, setCourse] = useState<CourseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [voucherCode, setVoucherCode] = useState("");
  const [voucherData, setVoucherData] = useState<Voucher | null>();
  const [voucherStatus, setVoucherStatus] = useState({
    isLoaded: false,
    isValid: false,
    reason: "",
  });

  const { status } = useAuth();
  const { toast } = useToast();

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
    if (status == "logout") {
      window.location.href = "/auth/user/login";
    }
  }, [status]);

  useEffect(() => {
    const getVoucherData = async () => {
      if (!voucherCode) {
        setVoucherData(null);
        return;
      }
      try {
        const result = await axios.get(`/api/voucher?code=${voucherCode}`);

        setVoucherData(result.data.data);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          setVoucherStatus({
            isLoaded: true,
            isValid: false,
            reason: error.response?.data.message,
          });
          toast({
            title: "Error apply voucher",
            description: error.response?.data.message,
          });
        } else {
          toast({
            title: "Error apply voucher",
            description: "Network error. Please try again.",
          });
        }

        setVoucherData(null);
      }
    };

    getVoucherData();
  }, [voucherCode]);

  useEffect(() => {
    if (voucherData) {
      if (voucherData.type == "instructor") {
        if (voucherData.creatorId == course?.instructorDetails[0]._id) {
          setVoucherStatus({
            isValid: true,
            isLoaded: true,
            reason: "Voucher apllied",
          });
        } else {
          setVoucherStatus({
            isLoaded: true,
            isValid: false,
            reason: "You cant use this voucher for this course",
          });
        }
      } else {
        setVoucherStatus({
          reason: "Voucher apllied",
          isValid: true,
          isLoaded: true,
        });
      }
    } else {
      setVoucherStatus({
        isLoaded: false,
        isValid: false,
        reason: "",
      });
    }
  }, [voucherData]);

  useEffect(() => {
    console.log(voucherData);
  }, [voucherData]);

  const handleEnroll = async () => {
    try {
      let requestData;

      if (voucherData && voucherStatus.isLoaded && voucherStatus.isValid) {
        requestData = {
          courseId: params.id,
          voucherId: voucherData._id,
        };
      } else {
        requestData = {
          courseId: params.id,
        };
      }

      const result = await axios.post(`/api/transaction`, requestData);

      toast({
        title: "Success",
        description: result.data.message,
      });

      setTimeout(() => {
        window.location.href = `/transaction/${result.data.data._id}`;
      }, 2000);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.status === 403) {
          toast({
            title: "Failed create transaction",
            description: error.response?.data.message || "An error occurred.",
          });

          setTimeout(() => {
            window.location.href = `/transaction/${error.response?.data.data}`;
          }, 2000);
          return;
        }
        toast({
          title: "Failed create transaction",
          description: error.response?.data.message || "An error occurred.",
        });
      } else {
        toast({
          title: "Failed create transaction",
          description: "Network error. Please try again.",
        });
      }
    }
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

  return (
    <section className="py-4">
      <Breadcrumbs>
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem>Course</BreadcrumbItem>
        <BreadcrumbItem href="./">{course.title}</BreadcrumbItem>
        <BreadcrumbItem>Enroll</BreadcrumbItem>
      </Breadcrumbs>

      <div className="flex flex-col items-center justify-center text-center mt-8">
        <div className="min-w-xl max-w-2xl">
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
          <div className="mt-8">
            <User
              name={`${course.instructorDetails[0].firstName} ${course.instructorDetails[0].lastName}`}
              description={`@${course.instructorDetails[0].username}`}
              avatarProps={{
                src: course.instructorDetails[0].profilePicture,
              }}
            />
          </div>
        </div>

        <div className="flex flex-col justify-center py-8 w-full">
          <div className="max-w-sm w-full mx-auto">
            <Card className="p-4 w-full">
              <CardBody>
                <h4 className="text-lg font-semibold">Enroll Course</h4>
                <Divider className="my-4" />
                <div>
                  {course.price !== course.discountedPrice && (
                    <div className="flex items-center gap-8 text-sm text-foreground/75 justify-between">
                      <h3 className="">Normal Price</h3>
                      <h3 className=" line-through	">
                        {formatCurrency(course.price)}
                      </h3>
                    </div>
                  )}
                  <div className="flex items-center gap-8 text-md justify-between">
                    <h3 className="">
                      {course.price !== course.discountedPrice
                        ? "Discounted Price"
                        : "Price"}
                    </h3>
                    <h3 className="">
                      {formatCurrency(course.discountedPrice)}
                    </h3>
                  </div>
                  {voucherStatus.isLoaded &&
                    voucherStatus.isValid &&
                    voucherData && (
                      <div className="flex items-center gap-8 text-md justify-between">
                        <h3 className="">Voucher Disount</h3>
                        <h3 className="">
                          -
                          {formatCurrency(
                            (
                              (parseInt(course.discountedPrice) *
                                voucherData?.discount) /
                              100
                            ).toString()
                          )}
                        </h3>
                      </div>
                    )}
                  <div className="flex items-center gap-8 text-sm text-foreground/75 justify-between">
                    <h3 className="">Tax</h3>
                    <h3 className="">
                      {voucherStatus.isLoaded &&
                      voucherStatus.isValid &&
                      voucherData
                        ? formatCurrency(
                            (
                              (parseFloat(course.discountedPrice) -
                                (parseInt(course.discountedPrice) *
                                  voucherData?.discount) /
                                  100) *
                              taxRate
                            ).toString()
                          )
                        : formatCurrency(
                            (
                              parseFloat(course.discountedPrice) * taxRate
                            ).toString()
                          )}
                    </h3>
                  </div>
                  <div className="flex items-center gap-8 justify-between mt-4">
                    <h3 className="text-lg font-semibold">Final Price</h3>
                    <h3 className="text-lg font-semibold">
                      {voucherStatus.isLoaded &&
                      voucherStatus.isValid &&
                      voucherData
                        ? formatCurrency(
                            (
                              parseFloat(course.discountedPrice) -
                              (parseInt(course.discountedPrice) *
                                voucherData?.discount) /
                                100 +
                              (parseFloat(course.discountedPrice) -
                                (parseInt(course.discountedPrice) *
                                  voucherData?.discount) /
                                  100) *
                                taxRate
                            ).toString()
                          )
                        : formatCurrency(
                            (
                              parseFloat(course.discountedPrice) +
                              parseFloat(course.discountedPrice) * taxRate
                            ).toString()
                          )}
                    </h3>
                  </div>
                  <div className="mt-4">
                    <Input
                      type="text"
                      label="Voucher Code (optional)"
                      value={voucherCode}
                      isInvalid={
                        voucherStatus.isLoaded ? !voucherStatus.isValid : false
                      }
                      color={voucherStatus.isValid ? "success" : "default"}
                      errorMessage={
                        voucherStatus.isLoaded ? voucherStatus.reason : ""
                      }
                      onChange={(e) => setVoucherCode(e.target.value)}
                    />
                  </div>
                  <Button
                    className="w-full mt-4"
                    color="primary"
                    onClick={handleEnroll}
                  >
                    Enroll Now
                  </Button>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
