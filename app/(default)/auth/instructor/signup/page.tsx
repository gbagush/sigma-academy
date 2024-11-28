"use client";
import React, { useState } from "react";
import axios from "axios";
import Link from "next/link";
import { Button } from "@nextui-org/button";
import { Input } from "@nextui-org/input";
import { Divider } from "@nextui-org/divider";
import { Logo } from "@/components/icons";
import { useToast } from "@/hooks/use-toast";

export default function InstructorSignup() {
  const [email, setEmail] = useState("");
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await axios.post(`/api/auth/instructor/signup`, {
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
        console.log(error.response?.data);
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
        <h1 className="font-bold text-2xl">Sign Up</h1>
      </div>
      <div>
        <h1 className="mt-2">Instructor</h1>
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
          Send Sign Up Link
        </Button>
        <div className="flex w-full justify-center mt-2">
          <span className="text-sm">
            Already have an account yet?{" "}
            <Link href="login" className="underline">
              Log In here
            </Link>
          </span>
        </div>
        <Divider className="mt-4 max-w-xs" />
        <div className="max-w-xs w-full">
          <Button as={Link} href="/auth/user/signup" className="w-full mt-4">
            Sign Up as User
          </Button>
        </div>
      </form>
    </div>
  );
}
