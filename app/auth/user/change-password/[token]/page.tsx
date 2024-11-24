"use client";
import axios from "axios";
import { Logo } from "@/components/icons";
import { Button } from "@nextui-org/button";
import { Input } from "@nextui-org/input";
import { useState, useEffect } from "react";
import { Eye, EyeClosed } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function UserMailVerification({
  params,
}: {
  params: { token: string };
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [changePasswordData, setChangePasswordData] = useState({
    password: "",
    confirmPassword: "",
  });
  const { token } = params;
  const { toast } = useToast();

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const response = await axios.get(
          `/api/auth/user/change-password?token=${token}`
        );
        if (response.status !== 200) {
          window.location.href = "not-found";
        }
      } catch (error) {
        window.location.href = "not-found";
      }
    };

    verifyToken();
  }, [token]);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword((prev) => !prev);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setChangePasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (changePasswordData.password !== changePasswordData.confirmPassword) {
      toast({
        title: "Change Password failed",
        description: "Passwords do not match.",
      });
      return;
    }

    try {
      const response = await axios.put(`/api/auth/user/change-password`, {
        token,
        password: changePasswordData.password,
      });

      if (response.status === 200) {
        toast({
          title: "Change Password successfuly!",
          description: "Please login to access your account",
        });

        setTimeout(() => {
          window.location.href = "../login";
        }, 2000);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast({
          title: "Change Password failed",
          description: error.response?.data.message || "An error occurred.",
        });
      } else {
        toast({
          title: "Change Password failed",
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
        <h1 className="font-bold text-2xl">Set New Password</h1>
      </div>
      <form className="mt-4 max-w-sm w-full" onSubmit={handleSubmit}>
        <Input
          type={showPassword ? "text" : "password"}
          name="password"
          variant="bordered"
          label="Password"
          className="mt-4"
          placeholder="Enter your new password"
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
          placeholder="Confirm your new password"
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
        <Button type="submit" className="w-full mt-4">
          Change Password
        </Button>
      </form>
    </div>
  );
}
