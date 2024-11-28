"use client";
import React, { useState } from "react";
import axios from "axios";
import { Button } from "@nextui-org/button";
import { Input } from "@nextui-org/input";
import { Logo } from "@/components/icons";
import { useToast } from "@/hooks/use-toast";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await axios.post(`/api/auth/admin/login`, {
        email,
      });
      toast({
        title: "Email Sent",
        description:
          response.data.message || "Please check your inbox for instructions.",
      });

      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast({
          title: "Request failed",
          description: error.response?.data.message || "An error occurred.",
        });
      } else {
        toast({
          title: "Request failed",
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
        <h1 className="font-bold text-2xl">Admin Log In</h1>
      </div>

      <form className="mt-4 max-w-xs w-full" onSubmit={handleSubmit}>
        <Input
          type="email"
          name="email"
          variant="bordered"
          label="Email"
          placeholder="Enter your email"
          required
          onChange={handleInputChange}
        />
        <Button type="submit" className="w-full mt-4">
          Send Magic Link
        </Button>
      </form>
    </div>
  );
}
