"use client";

import axios from "axios";
import { Card, CardBody } from "@nextui-org/card";
import { ArrowDown, ArrowUp, Banknote } from "lucide-react";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import CreateWallet from "./create-wallet";
import WalletDashboard from "./wallet-dashboard";

export default function WalletPage() {
  const [isWalletFound, setIsWalletFound] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [walletPin, setWalletPin] = useState("");

  const { toast } = useToast();

  useEffect(() => {
    const getWallet = async () => {
      try {
        const wallet = await axios.get("/api/instructor/wallet");

        setIsWalletFound(true);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          setIsWalletFound(false);
        } else {
          toast({
            title: "Failed get wallet",
            description: "Network error. Please try again.",
          });
        }
      }

      setIsLoading(false);
    };

    getWallet();
  }, []);

  useEffect(() => {
    console.log(isWalletFound);
  }, [isWalletFound]);

  if (isLoading) {
    return <h1>loading</h1>;
  }

  if (!isLoading && !isWalletFound) {
    return <CreateWallet />;
  }

  return <WalletDashboard />;
}
