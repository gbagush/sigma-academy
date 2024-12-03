"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
} from "@nextui-org/table";
import { Eye, ShoppingCart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Chip } from "@nextui-org/chip";
import Image from "next/image";
import { Button } from "@nextui-org/button";
import Link from "next/link";
import { Logo } from "@/components/icons";

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
  paidAt?: string;
  courseDetails: CourseDetail[];
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

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await axios.get(`api/transaction`);
        setTransactions(response.data.data);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          toast({
            title: "Error fetching transactions",
            description: error.response?.data.message || "An error occurred.",
          });
        } else {
          toast({
            title: "Error fetching transactions",
            description: "Network error. Please try again.",
          });
        }
      }

      setLoading(false);
    };

    fetchTransactions();
  }, []);

  return (
    <>
      <section className="flex flex-col py-4 items-center gap-4">
        <div className="flex gap-2 w-full items-center justify-left">
          <ShoppingCart />
          <h2 className="text-xl">Your Transactions</h2>
        </div>

        <Table aria-label="Transactions Table" className="py-4">
          <TableHeader>
            <TableColumn>Date</TableColumn>
            <TableColumn>Course</TableColumn>
            <TableColumn>Status</TableColumn>
            <TableColumn>Action</TableColumn>
          </TableHeader>
          {transactions.length > 0 ? (
            <TableBody>
              {transactions?.map((transaction) => {
                return (
                  <TableRow key={transaction._id}>
                    <TableCell>
                      {new Date(transaction.createdAt).toLocaleString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                        hour12: false,
                      })}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-4">
                        <Image
                          src={transaction.courseDetails[0]?.thumbnail}
                          alt={transaction.courseDetails[0]?.title}
                          width={100}
                          height={100}
                          className="rounded-sm"
                        />
                        <div className="flex flex-col gap-2">
                          <h4 className="font-semibold">
                            {transaction.courseDetails[0]?.title}
                          </h4>
                          <span>
                            {formatCurrency(
                              transaction.amount +
                                transaction.amount * transaction.tax
                            )}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {transaction.paidAt ? (
                        <Chip color="success">Paid</Chip>
                      ) : new Date(transaction.dueDate) > new Date() ? (
                        <Chip>Unaid</Chip>
                      ) : (
                        <Chip color="danger">Expired</Chip>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        as={Link}
                        size="sm"
                        href={`/transaction/${transaction._id}`}
                        isIconOnly
                      >
                        <Eye size={16} />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          ) : loading ? (
            <TableBody
              emptyContent={
                <div className="flex justify-center animate-pulse">
                  <Logo />
                </div>
              }
            >
              {[]}
            </TableBody>
          ) : (
            <TableBody emptyContent={"You don't have any transactions yet."}>
              {[]}
            </TableBody>
          )}
        </Table>
      </section>
    </>
  );
}
