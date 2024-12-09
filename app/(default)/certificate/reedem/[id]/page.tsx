"use client";

import { Logo } from "@/components/icons";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@nextui-org/button";
import { Checkbox } from "@nextui-org/checkbox";
import { Input } from "@nextui-org/input";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CertificateReedem({
  params,
}: {
  params: { id: string };
}) {
  const [checked, setChecked] = useState(false);
  const [name, setName] = useState("");

  const { toast } = useToast();
  const router = useRouter();

  const handleReedemCertificate = async () => {
    try {
      const response = await axios.post("/api/certificate", {
        enrollmentId: params.id,
        certificateName: name,
      });

      toast({
        title: "Reedem successfuly",
        description: response.data.message,
      });

      setTimeout(() => {
        router.push(`/certificate/${response.data.data}`);
      }, 2000);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast({
          title: "Reedem failed",
          description: error.response?.data.message || "An error occurred.",
        });
      } else {
        toast({
          title: "Reedem failed",
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
        <h1 className="font-bold text-2xl">Reedem Certificate</h1>
      </div>
      <div className="mt-4 max-w-sm w-full">
        <Input
          label="Certificate Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Checkbox
          className="mt-2"
          isSelected={checked}
          onValueChange={() => setChecked(!checked)}
        >
          <span className="text-sm">
            Make sure you have written your name correctly, the name cannot be
            changed after this process is complete. Check this checkbox to
            confirm.
          </span>
        </Checkbox>
        <Button
          className="w-full mt-4"
          isDisabled={!checked || name === ""}
          onClick={handleReedemCertificate}
        >
          Reedem Cerificate
        </Button>
      </div>
    </div>
  );
}
