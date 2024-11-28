"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@nextui-org/button";
import { Input } from "@nextui-org/input";
import { Divider } from "@nextui-org/divider";
import { Logo } from "@/components/icons";
import { Eye, EyeClosed } from "lucide-react";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@nextui-org/checkbox";

export default function UserRegister() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registerData, setRegisterData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isChecked, setIsChecked] = useState(false);

  const { toast } = useToast();

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword((prev) => !prev);
  };

  const handleCheckboxChange = (checked: boolean) => {
    setIsChecked(checked);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRegisterData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!isChecked) {
      toast({
        title: "Sign Up failed",
        description:
          "Please accept the Terms and Conditions and Privacy Policy.",
      });
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      toast({
        title: "Sign Up failed",
        description: "Passwords do not match.",
      });
      return;
    }

    try {
      const response = await axios.post(`/api/auth/user/signup`, {
        firstName: registerData.firstName,
        lastName: registerData.lastName,
        email: registerData.email,
        password: registerData.password,
      });

      toast({
        title: "Sign Up successful!",
        description: response.data.message || "You can now log in.",
      });

      setTimeout(() => {
        window.location.href = "/auth/user/signup/success";
      }, 2000);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast({
          title: "Sign Up failed",
          description: error.response?.data.message || "An error occurred.",
        });
      } else {
        toast({
          title: "Sign Up failed",
          description: "Network error. Please try again.",
        });
      }
    }
  };

  return (
    <div className="w-full flex flex-col min-h-full items-center justify-center pad-x py-8">
      <div className="flex">
        <Logo />
        <p className="font-bold ml-2">Sigma</p>
      </div>
      <div className="mt-8">
        <h1 className="font-bold text-2xl">Sign Up</h1>
      </div>
      <div>
        <h1 className="text-lg">User </h1>
      </div>

      <form className="mt-4 max-w-xs w-full" onSubmit={handleSubmit}>
        <div className="flex gap-4">
          <Input
            type="text"
            name="firstName"
            variant="bordered"
            label="First Name"
            className="mt-4"
            placeholder="Enter your first name"
            required
            onChange={handleInputChange}
          />
          <Input
            type="text"
            name="lastName"
            variant="bordered"
            label="Last Name"
            className="mt-4"
            placeholder="Enter your last name"
            required
            onChange={handleInputChange}
          />
        </div>
        <Input
          type="email"
          name="email"
          variant="bordered"
          label="Email"
          className="mt-4"
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
        <Input
          type={showConfirmPassword ? "text" : "password"}
          name="confirmPassword"
          variant="bordered"
          label="Confirm Password"
          className="mt-4"
          placeholder="Confirm your secret password"
          endContent={
            <button onClick={toggleConfirmPasswordVisibility} type="button">
              {showConfirmPassword ? (
                <Eye size={24} className="text-foreground/75" />
              ) : (
                <EyeClosed size={24} className="text-foreground/75" />
              )}
            </button>
          }
          required
          onChange={handleInputChange}
        />

        <Checkbox
          size="sm"
          className="mt-2"
          isSelected={isChecked}
          onValueChange={handleCheckboxChange}
          required
        >
          By checking this box, I agree to the{" "}
          <Link href="/terms-conditions" target="_blank" className="underline">
            Terms and Conditions
          </Link>{" "}
          and{" "}
          <Link href="/privacy-policy" target="_blank" className="underline">
            Privacy Policy
          </Link>
        </Checkbox>

        <Button type="submit" className="w-full mt-4">
          Sign Up
        </Button>
        <div className="flex w-full justify-center mt-2">
          <span className="text-sm">
            Already have an account yet?{" "}
            <Link href="login" className="underline">
              Log In here
            </Link>
          </span>
        </div>
      </form>
      <Divider className="mt-4 max-w-xs" />
      <div className="max-w-xs w-full">
        <Button
          as={Link}
          href="/auth/instructor/signup"
          className="w-full mt-4"
        >
          Sign Up as Instructor
        </Button>
      </div>
    </div>
  );
}
