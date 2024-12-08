"use client";

import axios from "axios";
import { Card, CardBody } from "@nextui-org/card";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Divider } from "@nextui-org/divider";
import { Input, Textarea } from "@nextui-org/input";
import { Checkbox } from "@nextui-org/checkbox";
import Link from "next/link";
import { Button } from "@nextui-org/button";

export default function CreateWallet() {
  const [walletData, setWalletData] = useState({
    fullName: "",
    phoneNumber: "",
    address: "",
    aggrement: false,
  });

  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (
      !walletData.fullName ||
      !walletData.phoneNumber ||
      !walletData.address
    ) {
      toast({
        title: "Create wallet failed",
        description: "Fill all fields",
      });
      return;
    }

    if (!walletData.aggrement) {
      toast({
        title: "Create wallet failed",
        description:
          "Please accept the Terms and Conditions and Privacy Policy.",
      });
      return;
    }

    try {
      const response = await axios.post(`/api/instructor/wallet`, {
        fullName: walletData.fullName,
        phoneNumber: walletData.phoneNumber,
        address: walletData.address,
      });

      toast({
        title: "Success create wallet",
        description: response.data.message,
      });

      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast({
          title: "Create wallet failed",
          description: error.response?.data.message || "An error occurred.",
        });
      } else {
        toast({
          title: "Create wallet failed",
          description: "Network error. Please try again.",
        });
      }
    }
  };

  return (
    <div className="w-full flex flex-col min-h-full items-center justify-center pad-x">
      <Card className="max-w-md w-full p-4 my-8">
        <CardBody>
          <h1 className="font-semibold text-xl">Create Wallet</h1>
          <h4 className="mt-2 text-sm text-foreground/75">
            Start Getting What You&apos;ve Created
          </h4>
          <Divider className="my-4" />
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <Input
              label="Full Name"
              placeholder="John Doe"
              variant="bordered"
              value={walletData.fullName}
              onChange={(e) =>
                setWalletData({ ...walletData, fullName: e.target.value })
              }
            />
            <Input
              label="Phone Number"
              placeholder="+62 8XX XXXX XXXXX"
              variant="bordered"
              value={walletData.phoneNumber}
              onChange={(e) =>
                setWalletData({ ...walletData, phoneNumber: e.target.value })
              }
            />
            <Textarea
              label="Address"
              placeholder="123 Main Street, Anytown, CA 12345"
              variant="bordered"
              value={walletData.address}
              onChange={(e) =>
                setWalletData({ ...walletData, address: e.target.value })
              }
            />
            <Checkbox
              size="sm"
              isSelected={walletData.aggrement}
              onValueChange={() =>
                setWalletData({
                  ...walletData,
                  aggrement: !walletData.aggrement,
                })
              }
              required
            >
              By checking this box, I agree to the{" "}
              <Link
                href="/terms-conditions"
                target="_blank"
                className="underline"
              >
                Terms and Conditions
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy-policy"
                target="_blank"
                className="underline"
              >
                Privacy Policy
              </Link>
            </Checkbox>
            <Button type="submit">Create Wallet</Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
