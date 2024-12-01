"use client";
import React from "react";
import axios from "axios";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@nextui-org/button";
import { Input } from "@nextui-org/input";
import { Divider } from "@nextui-org/divider";
import { Logo } from "@/components/icons";
import { Eye, EyeClosed } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/authContext";
import { useRouter, useSearchParams } from "next/navigation";

export default function UserLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const redirectUrl = searchParams.get("redirect");

  const [showPassword, setShowPassword] = useState(false);
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });
  const { toast } = useToast();
  const { setToken, setRole } = useAuth();

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({ ...prev, [name]: value }));
  };
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        `/api/auth/instructor/login`,
        loginData
      );
      const { token } = response.data;

      setToken(token);
      setRole("instructor");

      toast({ title: "Login successful!", description: "Welcome back!" });

      setTimeout(() => {
        if (redirectUrl) {
          const decodedUrl = decodeURIComponent(redirectUrl);
          router.push(decodedUrl);
        } else {
          router.push("/");
        }
      }, 2000);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.status === 403) {
          window.location.href = "confirm";
          return;
        }
        toast({
          title: "Login failed",
          description: error.response?.data.message || "An error occurred.",
        });
      } else {
        toast({
          title: "Login failed",
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
        <h1 className="font-bold text-2xl">Log In</h1>
      </div>
      <div>
        <h1 className="text-lg">Instructor</h1>
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
        <Input
          type={showPassword ? "text" : "password"}
          name="password"
          variant="bordered"
          label="Password"
          className="mt-4"
          placeholder="Enter your secret password"
          endContent={
            <button onClick={togglePasswordVisibility} type="button">
              {showPassword ? (
                <Eye size={24} className="text-foreground/75" />
              ) : (
                <EyeClosed size={24} className="text-foreground/75" />
              )}
            </button>
          }
          required
          onChange={handleInputChange}
        />
        <div className="flex justify-end mt-2">
          <Link
            href="change-password"
            className="text-foreground/75 text-sm underline"
          >
            Forgot password?
          </Link>
        </div>
        <Button type="submit" className="w-full mt-4">
          Log In
        </Button>
        <div className="flex w-full justify-center mt-2">
          <span className="text-sm">
            Don&apos;t have an account yet?{" "}
            <Link href="signup" className="underline">
              Sign Up here
            </Link>
          </span>
        </div>
      </form>
      <Divider className="mt-4 max-w-xs" />
      <div className="max-w-xs w-full mt-4">
        <Button as={Link} href="/auth/user/login" className="w-full mt -4">
          Log In as User
        </Button>
      </div>
    </div>
  );
}
