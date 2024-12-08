"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import useSWR from "swr";
import {
  Dribbble,
  Eye,
  Figma,
  Filter,
  Github,
  Linkedin,
  LinkIcon,
  ExternalLink,
  Wrench,
} from "lucide-react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@nextui-org/table";
import { Pagination } from "@nextui-org/pagination";
import { Accordion, AccordionItem } from "@nextui-org/accordion";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/modal";
import {
  Autocomplete,
  AutocompleteSection,
  AutocompleteItem,
} from "@nextui-org/autocomplete";
import { Input, Textarea } from "@nextui-org/input";
import { Button } from "@nextui-org/button";
import { Chip } from "@nextui-org/chip";
import { Logo } from "@/components/icons";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { socialsList } from "@/config/socials";

export interface WithdrawalData {
  totalCount: number;
  page: number;
  limit: number;
  withdrawals: Withdrawal[];
}

export interface Withdrawal {
  _id: string;
  walletId: string;
  type: string;
  amount: number;
  platformFee: number;
  paymentMethod: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface WithdrawalDetails {
  _id: string;
  walletId: string;
  type: string;
  amount: number;
  platformFee: number;
  paymentMethod: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  walletDetails: WalletDetails;
  paymentMethodDetails: PaymentMethodDetails;
}

export interface WalletDetails {
  _id: string;
  instructorId: string;
  fullName: string;
  phoneNumber: string;
  address: string;
  balance: number;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentMethodDetails {
  _id: string;
  walletId: string;
  bankCode: string;
  accountNumber: string;
  accountHolderName: string;
  createdAt: string;
  updatedAt: string;
}

export interface Bank {
  _id: string;
  bank_code: string;
  bank_name: string;
  swift_code: string;
  name: string;
  code: string;
}

const formatCurrency = (amount: string) => {
  const number = parseFloat(amount);
  return `Rp${new Intl.NumberFormat("id-ID", {
    style: "decimal",
    minimumFractionDigits: 0,
  }).format(number)}`;
};

export default function WithdrawalDashboard() {
  const [maxPerPage, setMaxPerPage] = useState(15);
  const [statusFilter, setStatusFilter] = useState<
    "all" | "pending" | "success" | "failed"
  >("all");
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<"newest" | "oldest">("newest");

  const [banks, setBanks] = useState<Bank[]>([]);
  const [withdrawalData, setWithdrawalData] = useState<WithdrawalData>();
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal>();

  const { toast } = useToast();

  const withdrawalDetailsModal = useDisclosure();

  useEffect(() => {
    const fetchWithdrawals = async () => {
      try {
        const response = await axios.get(
          `/api/mods/instructor/withdrawal?page=${page - 1}&limit=${maxPerPage}&status=${statusFilter}&sort=${sort}`
        );

        setWithdrawalData(response.data.data);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          toast({
            title: "Failed getting withdrawals",
            description: error.response?.data.message || "An error occurred.",
          });
        } else {
          toast({
            title: "Failed getting withdrawals",
            description: "Network error. Please try again.",
          });
        }
      }
    };

    const getBanks = async () => {
      try {
        const response = await axios.get("/api/bank");

        setBanks(response.data.data);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          toast({
            title: "Failed getting banks",
            description: error.response?.data.message || "An error occurred.",
          });
        } else {
          toast({
            title: "Failed getting banks",
            description: "Network error. Please try again.",
          });
        }
      }
    };

    fetchWithdrawals();
    getBanks();
  }, [maxPerPage, statusFilter, page, sort]);

  return (
    <div>
      <h1 className="text-2xl my-4">Withdrawal Dashboard</h1>
      <div className="flex w-full">
        <div className="flex gap-2 justify-end w-full">
          <div className="flex gap-2 max-w-md">
            <Autocomplete
              aria-label="Max Per Page Filter"
              defaultSelectedKey="15"
              value={maxPerPage}
              onSelectionChange={(value) => {
                if (value) {
                  setMaxPerPage(parseInt(value?.toString()));
                }
              }}
            >
              <AutocompleteItem key="10">10</AutocompleteItem>
              <AutocompleteItem key="15">15</AutocompleteItem>
              <AutocompleteItem key="20">20</AutocompleteItem>
              <AutocompleteItem key="30">30</AutocompleteItem>
            </Autocomplete>
            <Autocomplete
              aria-label="Status Filter"
              defaultSelectedKey="all"
              value={statusFilter}
              onSelectionChange={(value) => {
                if (value) {
                  setStatusFilter(
                    value?.toString() as
                      | "all"
                      | "pending"
                      | "success"
                      | "failed"
                  );
                }
              }}
            >
              <AutocompleteItem key="all">All</AutocompleteItem>
              <AutocompleteItem key="pending">Pending</AutocompleteItem>
              <AutocompleteItem key="success">Success</AutocompleteItem>
              <AutocompleteItem key="failed">Failed</AutocompleteItem>
            </Autocomplete>
            <Autocomplete
              aria-label="Sort Filter"
              defaultSelectedKey="newest"
              value={sort}
              onSelectionChange={(value) => {
                if (value) {
                  setSort(value?.toString() as "newest" | "oldest");
                }
              }}
            >
              <AutocompleteItem key="newest">Newest</AutocompleteItem>
              <AutocompleteItem key="oldest">Oldest</AutocompleteItem>
            </Autocomplete>
          </div>
        </div>
      </div>

      <Table
        aria-label="Withdrawal Table"
        className="mt-4"
        bottomContent={
          withdrawalData?.totalCount ? (
            <div className="flex w-full justify-center">
              <Pagination
                isCompact
                showControls
                showShadow
                color="primary"
                page={page}
                total={Math.ceil(
                  (withdrawalData.totalCount ?? 0) / (withdrawalData.limit ?? 1)
                )}
                onChange={(newPage) => setPage(newPage)}
              />
            </div>
          ) : null
        }
      >
        <TableHeader>
          <TableColumn>Created At</TableColumn>
          <TableColumn>Amount</TableColumn>
          <TableColumn>Status</TableColumn>
          <TableColumn>Action</TableColumn>
        </TableHeader>
        <TableBody emptyContent={"No rows to display."}>
          {Array.isArray(withdrawalData?.withdrawals) &&
          withdrawalData.withdrawals.length > 0
            ? withdrawalData.withdrawals.map((withdrawal) => (
                <TableRow key={withdrawal._id}>
                  <TableCell>
                    {new Date(withdrawal.createdAt).toLocaleString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    })}
                  </TableCell>
                  <TableCell>
                    {formatCurrency(withdrawal.amount.toString())}
                  </TableCell>
                  <TableCell>
                    {withdrawal.status == "success" && (
                      <Chip size="sm" color="success" variant="flat">
                        Success
                      </Chip>
                    )}
                    {withdrawal.status == "pending" && (
                      <Chip size="sm" color="default" variant="flat">
                        Pending
                      </Chip>
                    )}
                    {withdrawal.status == "failed" && (
                      <Chip size="sm" color="danger" variant="flat">
                        Failed
                      </Chip>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      isIconOnly
                      onClick={() => {
                        setSelectedWithdrawal(withdrawal);
                        withdrawalDetailsModal.onOpen();
                      }}
                    >
                      <Eye size={16} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            : []}
        </TableBody>
      </Table>

      {selectedWithdrawal !== undefined && (
        <WithdrawalDetailsModal
          isOpen={withdrawalDetailsModal.isOpen}
          onOpenChange={withdrawalDetailsModal.onOpenChange}
          selectedWithdrawal={selectedWithdrawal}
          banks={banks}
        />
      )}
    </div>
  );
}

const WithdrawalDetailsModal = ({
  isOpen,
  onOpenChange,
  selectedWithdrawal,
  banks,
}: {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  selectedWithdrawal: Withdrawal;
  banks: Bank[];
}) => {
  const [withdrawalDetails, setWithdrawalDetails] =
    useState<WithdrawalDetails>();
  const [status, setStatus] = useState<"success" | "failed" | "">("");

  const { toast } = useToast();

  useEffect(() => {
    const getWithdrawalDetails = async () => {
      try {
        const response = await axios.get(
          `/api/mods/instructor/withdrawal/${selectedWithdrawal._id}`
        );

        setWithdrawalDetails(response.data.data);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          toast({
            title: "Failed get withdrawal details",
            description: error.response?.data.message || "An error occurred.",
          });
        } else {
          toast({
            title: "Failed get withdrawal details",
            description: "Network error. Please try again.",
          });
        }
      }
    };

    getWithdrawalDetails();
  }, [selectedWithdrawal]);

  const handleUpdateStatus = async () => {
    try {
      const response = await axios.put(
        `/api/mods/instructor/withdrawal/${selectedWithdrawal._id}`,
        {
          status: status,
        }
      );

      toast({
        title: "Withdrawal status updated",
        description: response.data.message,
      });

      isOpen = false;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast({
          title: "Failed update withdrawal status",
          description: error.response?.data.message || "An error occurred.",
        });
      } else {
        toast({
          title: "Failed update withdrawal status",
          description: "Network error. Please try again.",
        });
      }
    }
  };
  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Withdrawal Details
            </ModalHeader>
            <ModalBody>
              {withdrawalDetails !== undefined && (
                <>
                  <span className="text-sm">
                    {new Date(withdrawalDetails.createdAt).toLocaleString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                      }
                    )}
                  </span>
                  <Input
                    label="Amount"
                    value={formatCurrency(withdrawalDetails.amount.toString())}
                    isReadOnly
                  />
                  <Input
                    label="Platform Fee"
                    value={`${withdrawalDetails.platformFee.toString()}%`}
                    isReadOnly
                  />
                  <Input
                    label="Final Amount"
                    value={`${formatCurrency((withdrawalDetails.amount - (withdrawalDetails.amount * withdrawalDetails.platformFee) / 100).toString())}`}
                    isReadOnly
                  />
                  <Accordion variant="shadow" isCompact>
                    <AccordionItem
                      key="wallet-details"
                      aria-label="Wallet Deatils"
                      title="Wallet Deatils"
                    >
                      <div className="flex flex-col gap-2">
                        <Input
                          label="Full Name"
                          value={withdrawalDetails.walletDetails.fullName}
                          isReadOnly
                        />
                        <Input
                          label="Phone Number"
                          value={withdrawalDetails.walletDetails.phoneNumber}
                          isReadOnly
                        />
                        <Textarea
                          label="Address"
                          value={withdrawalDetails.walletDetails.address}
                          isReadOnly
                        />
                      </div>
                    </AccordionItem>
                    <AccordionItem
                      key="payment-details"
                      aria-label="Payment Deatils"
                      title="Payment Deatils"
                    >
                      <div className="flex flex-col gap-2">
                        <Input
                          label="Bank"
                          value={
                            banks.find(
                              (b) =>
                                b.code ===
                                withdrawalDetails.paymentMethodDetails.bankCode
                            )?.name || "Bank not found"
                          }
                          isReadOnly
                        />
                        <Input
                          label="Account Number"
                          value={
                            withdrawalDetails.paymentMethodDetails.accountNumber
                          }
                          isReadOnly
                        />
                        <Input
                          label="Account Holder Name"
                          value={
                            withdrawalDetails.paymentMethodDetails
                              .accountHolderName
                          }
                          isReadOnly
                        />
                      </div>
                    </AccordionItem>
                  </Accordion>
                </>
              )}
              {withdrawalDetails?.status == "pending" && (
                <Autocomplete
                  label="Change Status"
                  value={status}
                  onSelectionChange={(value) => {
                    if (value) {
                      setStatus(value?.toString() as "success" | "failed");
                    }
                  }}
                >
                  <AutocompleteItem key="success">Success</AutocompleteItem>
                  <AutocompleteItem key="failed">Failed</AutocompleteItem>
                </Autocomplete>
              )}
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                Close
              </Button>
              {withdrawalDetails?.status == "pending" && (
                <Button onClick={handleUpdateStatus}>Update Withdrawal</Button>
              )}
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
