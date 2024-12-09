"use client";

import { Logo } from "@/components/icons";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@nextui-org/button";
import { Checkbox } from "@nextui-org/checkbox";
import { Input } from "@nextui-org/input";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CertificateReedem() {
  const [code, setCode] = useState("");

  const { toast } = useToast();
  const router = useRouter();

  const handleVerifyCertificate = async () => {
    try {
      const response = await axios.get(`/api/certificate/verify?code=${code}`);

      router.push(`/certificate/${response.data.data._id}`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast({
          title: "Failed getting certificate",
          description: error.response?.data.message || "An error occurred.",
        });
      } else {
        toast({
          title: "Failed getting certificate",
          description: "Network error. Please try again.",
        });
      }
    }
  };

  return (
    <div className="w-full flex flex-col min-h-full items-center justify-center pad-x">
      <div className="flex">
        <Logo />
        <p className="font-bold ml-2">Sigma</p>
      </div>
      <div className="mt-8">
        <h1 className="font-bold text-2xl">Verify Certificate</h1>
      </div>
      <div className="mt-4 max-w-sm w-full">
        <Input
          label="Certificate Code"
          value={code}
          placeholder="SIGMA-XXXX-XX-XX-XXXXX"
          onChange={(e) => setCode(e.target.value)}
        />

        <Button
          className="w-full mt-4"
          isDisabled={code === ""}
          onClick={handleVerifyCertificate}
        >
          Verify Cerificate
        </Button>
      </div>
    </div>
  );
}
