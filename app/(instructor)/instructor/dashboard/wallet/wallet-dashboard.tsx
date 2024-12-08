"use client";

import axios from "axios";
import { Card, CardBody, CardHeader } from "@nextui-org/card";
import {
  ArrowDown,
  ArrowUp,
  Banknote,
  CreditCard,
  HandCoins,
  Pencil,
  Trash,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Chip } from "@nextui-org/chip";
import { Pagination } from "@nextui-org/pagination";
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
import { Button } from "@nextui-org/button";
import { Input, Textarea } from "@nextui-org/input";
import { isEmptyArray } from "@nextui-org/shared-utils";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { platformFee } from "@/config/transaction";

export interface Wallet {
  _id: string;
  instructorId: string;
  fullName: string;
  phoneNumber: string;
  address: string;
  balance: number;
  createdAt: string;
  updatedAt: string;
}

export interface WalletTransaction {
  transactions: Transaction[];
  totalCount: number;
  totalIncome: number;
  totalOutcome: number;
  currentPage: number;
  limit: number;
  totalPages: number;
}

export interface Transaction {
  _id: string;
  walletId: string;
  type: string;
  amount: number;
  transactionId: string;
  description: string;
  status: "pending" | "success" | "failed";
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

export interface PaymentMethod {
  _id: string;
  walletId: string;
  bankCode: string;
  accountNumber: string;
  accountHolderName: string;
  createdAt: string;
  updatedAt: string;
}

const formatCurrency = (amount: string) => {
  const number = parseFloat(amount);
  return `Rp${new Intl.NumberFormat("id-ID", {
    style: "decimal",
    minimumFractionDigits: 0,
  }).format(number)}`;
};

const calculatePercentage = (amount: number, total: number): string => {
  if (total === 0) return "0%";
  return `${((amount / total) * 100).toFixed(1)}%`;
};

export default function WalletDashboard() {
  const { toast } = useToast();
  const [walletData, setWalletData] = useState<Wallet>();
  const [transactionsData, setTransactionsData] = useState<WalletTransaction>();
  const [transactionPage, setTransactionPage] = useState(1);

  const [banks, setBanks] = useState<Bank[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

  const walletAccountModal = useDisclosure();
  const paymentMethodModal = useDisclosure();
  const withdrawalModal = useDisclosure();

  useEffect(() => {
    const getWallet = async () => {
      try {
        const result = await axios.get("/api/instructor/wallet");

        setWalletData(result.data.data);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          toast({
            title: "Failed get wallet",
            description: error.response?.data.message,
          });
        } else {
          toast({
            title: "Failed get wallet",
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

    const getPaymentMethods = async () => {
      try {
        const response = await axios.get(
          "/api/instructor/wallet/payment-method"
        );

        setPaymentMethods(response.data.data);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          toast({
            title: "Failed getting payment methods",
            description: error.response?.data.message || "An error occurred.",
          });
        } else {
          toast({
            title: "Failed getting payment methods",
            description: "Network error. Please try again.",
          });
        }
      }
    };

    getWallet();
    getBanks();
    getPaymentMethods();
  }, []);

  useEffect(() => {
    const getTransactions = async () => {
      try {
        const result = await axios.get(
          `/api/instructor/wallet/transaction?page=${transactionPage - 1}`
        );

        setTransactionsData(result.data.data);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          toast({
            title: "Failed get wallet transactions",
            description: error.response?.data.message,
          });
        } else {
          toast({
            title: "Failed get wallet transactions",
            description: "Network error. Please try again.",
          });
        }
      }
    };

    getTransactions();
  }, [transactionPage]);

  return (
    <div>
      <h1 className="text-2xl my-4">Wallet Dashboard</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="p-4">
          <CardBody>
            <div className="flex items-center">
              <div className="flex items-center justify-center w-12 h-12 bg-foreground/25 rounded-md mr-4">
                <Banknote size={28} />
              </div>
              <h4>Balance</h4>
            </div>
            <h1 className="text-3xl font-semibold mt-4">
              {walletData?.balance !== undefined
                ? formatCurrency(walletData.balance.toString())
                : "Rp0.00"}
            </h1>
          </CardBody>
        </Card>
        <Card className="p-4">
          <CardBody>
            <div className="flex items-center">
              <div className="flex items-center justify-center w-12 h-12 text-green-600  bg-green-500/25  rounded-md mr-4">
                <ArrowDown size={28} />
              </div>
              <h4>Income</h4>
            </div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-semibold mt-4">
                +
                {transactionsData?.totalIncome !== undefined
                  ? formatCurrency(transactionsData.totalIncome.toString())
                  : "Rp0.00"}
              </h1>
              <Chip color="success" className="mt-4" radius="sm" variant="flat">
                {transactionsData
                  ? calculatePercentage(
                      transactionsData.totalIncome,
                      transactionsData.totalIncome +
                        transactionsData.totalOutcome
                    )
                  : "0%"}
              </Chip>
            </div>
          </CardBody>
        </Card>
        <Card className="p-4">
          <CardBody>
            <div className="flex items-center">
              <div className="flex items-center justify-center w-12 h-12 text-red-600 bg-red-500/15 rounded-md mr-4">
                <ArrowUp size={28} />
              </div>
              <h4>Outcome</h4>
            </div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-semibold mt-4">
                -
                {transactionsData?.totalOutcome !== undefined
                  ? formatCurrency(transactionsData.totalOutcome.toString())
                  : "Rp0.00"}
              </h1>
              <Chip color="danger" className="mt-4" radius="sm" variant="flat">
                {transactionsData
                  ? calculatePercentage(
                      transactionsData.totalOutcome,
                      transactionsData.totalIncome +
                        transactionsData.totalOutcome
                    )
                  : "0%"}
              </Chip>
            </div>
          </CardBody>
        </Card>
      </div>
      <div className="flex gap-4 mt-4">
        <Button onClick={walletAccountModal.onOpen}>
          <User />
          Account
        </Button>
        <Button onClick={paymentMethodModal.onOpen}>
          <CreditCard />
          Payment Method
        </Button>
        <Button
          onClick={() => {
            if (isEmptyArray(paymentMethods)) {
              toast({
                title: "Error",
                description: "Add payment method first",
              });
            } else {
              withdrawalModal.onOpen();
            }
          }}
        >
          <HandCoins />
          Withdrawal
        </Button>
      </div>
      <h4 className="mt-8 text-lg md:text-xl">Transaction History</h4>
      <div className="flex flex-col gap-2 mt-4 w-full">
        {transactionsData?.transactions !== undefined &&
          transactionsData.transactions.map((transaction) =>
            transaction.type == "income" ? (
              <div key={transaction._id}>
                <Card>
                  <CardBody>
                    <div className="flex items-center">
                      <div className="flex items-center justify-center w-8 h-8 text-green-600 bg-green-500/25 rounded-md mr-4">
                        <ArrowDown />
                      </div>
                      <span className="font-semibold">
                        {formatCurrency(transaction.amount.toString())}
                      </span>
                      <span className="w-full text-sm text-foreground/75 ml-2">
                        {transaction.description}
                      </span>
                      <div className="flex w-full items-center gap-2 justify-end">
                        {transaction.status == "success" && (
                          <Chip size="sm" color="success" variant="flat">
                            Success
                          </Chip>
                        )}
                        {transaction.status == "pending" && (
                          <Chip size="sm" color="default" variant="flat">
                            Pending
                          </Chip>
                        )}
                        {transaction.status == "failed" && (
                          <Chip size="sm" color="danger" variant="flat">
                            Failed
                          </Chip>
                        )}
                        <span className="text-sm text-foreground/75">
                          {new Date(transaction.createdAt).toLocaleString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                              hour: "numeric",
                              minute: "numeric",
                              hour12: false,
                            }
                          )}
                        </span>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </div>
            ) : (
              <div key={transaction._id}>
                <Card>
                  <CardBody>
                    <div className="flex items-center">
                      <div className="flex items-center justify-center w-8 h-8 text-red-600 bg-red-500/15 rounded-md mr-4">
                        <ArrowUp />
                      </div>
                      <span className="font-semibold">
                        {formatCurrency(transaction.amount.toString())}
                      </span>
                      <span className="w-full text-sm text-foreground/75 ml-2">
                        {transaction.description}
                      </span>
                      <div className="flex w-full items-center gap-2 justify-end">
                        {transaction.status == "success" && (
                          <Chip size="sm" color="success" variant="flat">
                            Success
                          </Chip>
                        )}
                        {transaction.status == "pending" && (
                          <Chip size="sm" color="default" variant="flat">
                            Pending
                          </Chip>
                        )}
                        {transaction.status == "failed" && (
                          <Chip size="sm" color="danger" variant="flat">
                            Failed
                          </Chip>
                        )}
                        <span className="text-sm text-foreground/75">
                          {new Date(transaction.createdAt).toLocaleString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                              hour: "numeric",
                              minute: "numeric",
                              hour12: false,
                            }
                          )}
                        </span>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </div>
            )
          )}
        {transactionsData !== undefined &&
          transactionsData.totalCount >= transactionsData.limit && (
            <div className="flex justify-center mt-4">
              <Pagination
                initialPage={1}
                total={transactionsData.totalPages}
                onChange={(value) => setTransactionPage(value)}
              />
            </div>
          )}
      </div>

      {walletData !== undefined && (
        <>
          <WalletAccountModal
            isOpen={walletAccountModal.isOpen}
            onOpenChange={walletAccountModal.onOpenChange}
            walletData={walletData}
          />
          <PaymentMethodModal
            isOpen={paymentMethodModal.isOpen}
            onOpenChange={paymentMethodModal.onOpenChange}
            walletData={walletData}
            banks={banks}
            paymentMethods={paymentMethods}
          />
          <WithdrawalModal
            isOpen={withdrawalModal.isOpen}
            onOpenChange={withdrawalModal.onOpenChange}
            walletData={walletData}
            banks={banks}
            paymentMethods={paymentMethods}
          />
        </>
      )}
    </div>
  );
}

const WalletAccountModal = ({
  isOpen,
  onOpenChange,
  walletData,
}: {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  walletData: Wallet;
}) => {
  const [editWalletData, setEditWalletData] = useState(walletData);
  const { toast } = useToast();

  const handleUpdateData = async () => {
    try {
      const result = await axios.put("/api/instructor/wallet", editWalletData);

      toast({
        title: "Wallet updated successfully",
        description: result.data.message,
      });

      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast({
          title: "Update failed",
          description: error.response?.data.message || "An error occurred.",
        });
      } else {
        toast({
          title: "Update failed",
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
              Wallet Account
            </ModalHeader>
            <ModalBody>
              <Input
                type="text"
                label="Full Name"
                value={editWalletData.fullName}
                onChange={(e) =>
                  setEditWalletData({
                    ...editWalletData,
                    fullName: e.target.value,
                  })
                }
              />
              <Input
                type="text"
                label="Phone Number"
                value={editWalletData.phoneNumber}
                onChange={(e) =>
                  setEditWalletData({
                    ...editWalletData,
                    phoneNumber: e.target.value,
                  })
                }
              />
              <Textarea
                type="text"
                label="Address"
                value={editWalletData.address}
                onChange={(e) =>
                  setEditWalletData({
                    ...editWalletData,
                    address: e.target.value,
                  })
                }
              />
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                Close
              </Button>
              <Button color="primary" onClick={handleUpdateData}>
                Update
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

const PaymentMethodModal = ({
  isOpen,
  onOpenChange,
  walletData,
  banks,
  paymentMethods,
}: {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  walletData: Wallet;
  banks: Bank[];
  paymentMethods: PaymentMethod[];
}) => {
  const [paymentMethodData, setPaymentMethodData] = useState({
    bankCode: "",
    accountNumber: "",
    accountHolderName: "",
  });

  const { toast } = useToast();

  const handleAddPaymentMethod = async () => {
    if (
      !paymentMethodData.accountHolderName ||
      !paymentMethodData.accountNumber ||
      !paymentMethodData.bankCode
    ) {
      toast({
        title: "Invalid payment method",
        description: "Please fill in all fields.",
      });

      return;
    }

    try {
      const response = await axios.post(
        "/api/instructor/wallet/payment-method",
        paymentMethodData
      );

      toast({
        title: "Success add payment method",
        description: response.data.message,
      });

      setTimeout(() => {
        window.location.reload();
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast({
          title: "Failed add payment method",
          description: error.response?.data.message || "An error occurred.",
        });
      } else {
        toast({
          title: "Failed add payment method",
          description: "Network error. Please try again.",
        });
      }
    }
  };

  const handleDeletePaymentMethod = async (_id: string) => {
    try {
      const deleteData = { paymentMethodId: _id };
      const response = await axios.delete(
        "/api/instructor/wallet/payment-method",
        { data: deleteData }
      );

      toast({
        title: "Success delete payment method",
        description: response.data.message,
      });

      setTimeout(() => {
        window.location.reload();
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast({
          title: "Failed delete payment method",
          description: error.response?.data.message || "An error occurred.",
        });
      } else {
        toast({
          title: "Failed delete payment method",
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
              Payment Method
            </ModalHeader>
            <ModalBody>
              <Card>
                <CardHeader>Add Payment Method</CardHeader>
                <CardBody className="flex flex-col gap-2">
                  <Autocomplete
                    label="Bank"
                    placeholder="Select your bank"
                    value={paymentMethodData.bankCode}
                    onSelectionChange={(value) => {
                      if (value) {
                        setPaymentMethodData({
                          ...paymentMethodData,
                          bankCode: value?.toString(),
                        });
                      }
                    }}
                  >
                    {banks.map((bank) => (
                      <AutocompleteItem key={bank.code}>
                        {bank.name}
                      </AutocompleteItem>
                    ))}
                  </Autocomplete>
                  <Input
                    type="text"
                    label="Account Number"
                    placeholder="1234567890"
                    value={paymentMethodData.accountNumber}
                    onChange={(e) =>
                      setPaymentMethodData({
                        ...paymentMethodData,
                        accountNumber: e.target.value,
                      })
                    }
                  />
                  <Input
                    type="text"
                    label="Account Holder Name"
                    placeholder="John Doe"
                    value={paymentMethodData.accountHolderName}
                    onChange={(e) =>
                      setPaymentMethodData({
                        ...paymentMethodData,
                        accountHolderName: e.target.value,
                      })
                    }
                  />
                  <Button onClick={handleAddPaymentMethod}>
                    Add Payment Method
                  </Button>
                </CardBody>
              </Card>
              <span>Payment Methods</span>
              {paymentMethods.map((paymentMethod) => (
                <Card key={paymentMethod._id}>
                  <CardBody>
                    <div className="flex justify-between items-center">
                      <div className="flex flex-col">
                        <span className="text-small">
                          {banks.find((b) => b.code === paymentMethod.bankCode)
                            ?.name || "Bank not found"}
                        </span>
                        <span className="text-small text-foreground/75">
                          {paymentMethod.accountNumber} -{" "}
                          {paymentMethod.accountHolderName}
                        </span>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          onClick={() =>
                            handleDeletePaymentMethod(paymentMethod._id)
                          }
                          isIconOnly
                        >
                          <Trash size={16} />
                        </Button>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                Close
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

const WithdrawalModal = ({
  isOpen,
  onOpenChange,
  walletData,
  banks,
  paymentMethods,
}: {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  walletData: Wallet;
  banks: Bank[];
  paymentMethods: PaymentMethod[];
}) => {
  const [otp, setOtp] = useState("");
  const [isOtpValid, setIsOtpValid] = useState(false);
  const [withdrawalData, setWithdrawalData] = useState({
    amount: "",
    paymentMethod: "",
  });

  const { toast } = useToast();

  const handleGetOTP = async () => {
    try {
      const response = await axios.get("/api/instructor/wallet/otp");

      toast({
        title: "Success sending OTP",
        description: response.data.message,
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast({
          title: "Failed sending OTP",
          description: error.response?.data.message || "An error occurred.",
        });
      } else {
        toast({
          title: "Failed sending OTP",
          description: "Network error. Please try again.",
        });
      }
    }
  };

  const handleConfirmOTP = async () => {
    try {
      const response = await axios.post("/api/instructor/wallet/otp", {
        otp: otp,
        walletId: walletData._id,
      });

      toast({
        title: "Success confirm OTP",
        description: response.data.message,
      });

      setIsOtpValid(true);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast({
          title: "Failed confirm OTP",
          description: error.response?.data.message || "An error occurred.",
        });
      } else {
        toast({
          title: "Failed confirm OTP",
          description: "Network error. Please try again.",
        });
      }
    }
  };

  const handleCreateWithdrawal = async () => {
    try {
      const response = await axios.post("/api/instructor/wallet/withdrawal", {
        otp: otp,
        walletId: walletData._id,
        paymentMethodId: withdrawalData.paymentMethod,
        amount: parseInt(withdrawalData.amount),
      });

      toast({
        title: "Success request withdrawal",
        description: response.data.message,
      });

      setIsOtpValid(true);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast({
          title: "Failed request withdrawal",
          description: error.response?.data.message || "An error occurred.",
        });
      } else {
        toast({
          title: "Failed request withdrawal",
          description: "Network error. Please try again.",
        });
      }
    }
  };

  useEffect(() => {
    if (parseInt(withdrawalData.amount) > walletData.balance) {
      setWithdrawalData({
        ...withdrawalData,
        amount: walletData.balance.toString(),
      });
    }
  });
  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Withdrawal
            </ModalHeader>
            <ModalBody>
              {!isOtpValid ? (
                <>
                  <span>Insert Your OTP</span>
                  <div className="flex max-w-full justify-center p-1 overflow-hidden">
                    <InputOTP maxLength={6} onChange={(value) => setOtp(value)}>
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                      </InputOTPGroup>
                      <InputOTPSeparator />
                      <InputOTPGroup>
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                  <span className="text-small">
                    Don&apos;t have OTP code yet?{" "}
                  </span>
                  <Button size="sm" className="w-32" onClick={handleGetOTP}>
                    Send me OTP
                  </Button>
                  <Button color="primary" onClick={handleConfirmOTP}>
                    Verify OTP
                  </Button>
                </>
              ) : (
                <>
                  <span>Request Withdrawal</span>
                  <Autocomplete
                    label="Payment Method"
                    onSelectionChange={(value) => {
                      if (value) {
                        setWithdrawalData({
                          ...withdrawalData,
                          paymentMethod: value?.toString(),
                        });
                      }
                    }}
                  >
                    {paymentMethods.map((paymentMethod) => (
                      <AutocompleteItem key={paymentMethod._id}>
                        {`${paymentMethod.bankCode} - ${paymentMethod.accountNumber} (${paymentMethod.accountHolderName})`}
                      </AutocompleteItem>
                    ))}
                  </Autocomplete>
                  <Input
                    label="Amount"
                    value={withdrawalData.amount}
                    onChange={(e) =>
                      setWithdrawalData({
                        ...withdrawalData,
                        amount: e.target.value,
                      })
                    }
                    description={`Maximum ${formatCurrency(walletData.balance.toString())}`}
                  />
                  {withdrawalData.amount !== "" && (
                    <span className="text-small text-foreground/75">
                      Platform fee {platformFee * 100}%, You will get{" "}
                      {formatCurrency(
                        (
                          parseInt(withdrawalData.amount) -
                          parseInt(withdrawalData.amount) * platformFee
                        ).toString()
                      )}
                    </span>
                  )}
                  <Button color="primary" onClick={handleCreateWithdrawal}>
                    Crate Withdrawal
                  </Button>
                </>
              )}
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                Close
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
