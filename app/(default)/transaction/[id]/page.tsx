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

// USED

interface Transaction {
  _id: string;
  userId: string;
  courseId: string;
  createdAt: string;
  dueDate: string;
  amount: number;
  tax: number;
  invoiceId: string;
  invoiceUrl: string;
  courseDetails: CourseDetail[];
  paidAt?: string;
  paymentMethod?: string;
}

interface CourseDetail {
  _id: string;
  title: string;
  thumbnail: string;
}

const formatCurrency = (amount: any) => {
  const number = parseFloat(amount);
  return `Rp${new Intl.NumberFormat("id-ID", {
    style: "decimal",
    minimumFractionDigits: 0,
  }).format(number)}`;
};

export default function Transaction({ params }: { params: { id: string } }) {
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { status } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const result = await axios.get(`/api/transaction/${params.id}`);
        setTransaction(result.data.data[0]);
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

  const handleCheckPayemnt = async () => {
    try {
      const result = await axios.get(`/api/transaction/${params.id}/check`);

      if (transaction && result.data.data) {
        setTransaction({
          ...transaction,
          paidAt: result.data.data.paidAt,
          paymentMethod: result.data.data.paymentMethod,
        });

        toast({
          title: "Transaction updated!",
          description: result.data.message,
        });

        return;
      }
      toast({
        title: "No changes",
        description: result.data.message,
      });
    } catch (err) {
      console.log(err);
      if (axios.isAxiosError(error)) {
        toast({
          title: "Failed update transaction",
          description: error.response?.data.message || "An error occurred.",
        });
      } else {
        toast({
          title: "Failed update transaction",
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

  if (!transaction) {
    return <div>No course found.</div>;
  }

  return (
    <section className="py-4">
      <Breadcrumbs>
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem>Transaction</BreadcrumbItem>
        <BreadcrumbItem>Details</BreadcrumbItem>
      </Breadcrumbs>

      <div className="flex flex-col items-center justify-center text-center mt-8">
        <div className="flex flex-col justify-center py-8 w-full">
          <div className="max-w-sm w-full mx-auto">
            <Card className="p-4 w-full">
              <CardBody>
                <h4 className="text-lg font-semibold">Transaction Details</h4>
                <Divider className="my-4" />
                <div>
                  <div className="flex items-center text-sm text-foreground/75">
                    <h3 className="w-24">Unique</h3>
                    <h3 className="">{transaction._id}</h3>
                  </div>
                  <div className="flex items-center text-sm text-foreground/75">
                    <h3 className="w-24">Created At</h3>
                    <h3 className="">
                      {new Date(transaction.createdAt).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                        hour12: false,
                      })}
                    </h3>
                  </div>
                  {transaction.paidAt != null && (
                    <div className="flex items-center text-sm text-foreground/75">
                      <h3 className="w-24">Paid At</h3>
                      <h3 className="">
                        {new Date(transaction.paidAt).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                          hour12: false,
                        })}
                      </h3>
                    </div>
                  )}

                  <div className="flex items-center text-sm text-foreground/75">
                    <h3 className="w-24">Due To</h3>
                    <h3 className="">
                      {new Date(transaction.dueDate).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                        hour12: false,
                      })}
                    </h3>
                  </div>

                  <div className="flex items-center text-sm text-foreground/75 mt-2">
                    <h3 className="w-24">Status</h3>
                    <h3 className="">
                      {transaction.paidAt ? (
                        <Chip size="sm" color="success">
                          Paid
                        </Chip>
                      ) : new Date() > new Date(transaction.dueDate) ? (
                        <Chip size="sm" color="danger">
                          Expired
                        </Chip>
                      ) : (
                        <Chip size="sm">Unpaid</Chip>
                      )}
                    </h3>
                  </div>
                  {transaction.paymentMethod != null && (
                    <div className="flex items-center text-sm text-foreground/75">
                      <h3 className="w-24">Method</h3>
                      <h3 className="">{transaction.paymentMethod}</h3>
                    </div>
                  )}

                  <div className="flex items-center text-sm text-foreground/75 mt-2">
                    <h3 className="w-[152px]">Course</h3>
                    <h3 className="">{transaction.courseDetails[0].title}</h3>
                  </div>

                  <div className="flex items-center gap-8 text-md mt-4 justify-between">
                    <h3 className="">Amount</h3>
                    <h3 className="">{formatCurrency(transaction.amount)}</h3>
                  </div>
                  <div className="flex items-center gap-8 text-sm text-foreground/75 justify-between">
                    <h3 className="">Tax</h3>
                    <h3 className="">
                      {formatCurrency(transaction.amount * transaction.tax)}
                    </h3>
                  </div>
                  <div className="flex items-center gap-8 justify-between mt-4">
                    <h3 className="text-lg font-semibold">Final Price</h3>
                    <h3 className="text-lg font-semibold">
                      {formatCurrency(
                        transaction.amount +
                          transaction.amount * transaction.tax
                      )}
                    </h3>
                  </div>

                  {!transaction.paidAt ? (
                    <>
                      <div className="mt-4 text-sm text-foreground/75">
                        <span>Click Check Payment button after payment.</span>
                      </div>
                      <Button
                        as={Link}
                        className="w-full mt-4"
                        color="primary"
                        href={transaction.invoiceUrl}
                        target="_blank"
                      >
                        Pay Now
                      </Button>
                      <Button
                        className="w-full mt-4"
                        color="secondary"
                        onPress={handleCheckPayemnt}
                      >
                        Check Payemnt
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        as={Link}
                        className="w-full mt-4"
                        color="primary"
                        href={`/course/${transaction.courseId}`}
                      >
                        Go to couse
                      </Button>
                    </>
                  )}
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
