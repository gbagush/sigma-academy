"use client";
import axios from "axios";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@nextui-org/button";
import { Input, Textarea } from "@nextui-org/input";
import { Logo } from "@/components/icons";
import { Eye, EyeClosed, Plus, X } from "lucide-react";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@nextui-org/dropdown";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@nextui-org/checkbox";
import { socialsList } from "@/config/socials";

interface SocialLink {
  type: string;
  link: string;
}

export default function InstructorRegister({
  params,
}: {
  params: { token: string };
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registerData, setRegisterData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    description: "",
    socials: [] as SocialLink[],
  });
  const [isChecked, setIsChecked] = useState(false);
  const [selectedSocial, setSelectedSocial] = useState<string | null>(null);
  const [socialLink, setSocialLink] = useState("");

  const { token } = params;
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
    console.log(name, value);
    setRegisterData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSocialLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSocialLink(e.target.value);
  };

  const handleAddSocial = () => {
    if (selectedSocial && socialLink) {
      if (
        selectedSocial !== "link" &&
        registerData.socials.some((s) => s.type === selectedSocial)
      ) {
        toast({
          title: "Social link already added",
          description: `You can only add one ${selectedSocial} link.`,
        });
        return;
      }

      setRegisterData((prev) => ({
        ...prev,
        socials: [...prev.socials, { type: selectedSocial, link: socialLink }],
      }));

      setSocialLink("");
      setSelectedSocial(null);
    }
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

    if (registerData.socials.length < 1) {
      toast({
        title: "Sign Up failed",
        description: "Please add at least one social link.",
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
      const response = await axios.post(
        `/api/auth/instructor/signup/${token}`,
        {
          ...registerData,
        }
      );

      toast({
        title: "Sign Up successful!",
        description: response.data.message,
      });

      setTimeout(() => {
        window.location.href = "/auth/instructor/signup/success";
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

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const response = await axios.get(
          `/api/auth/instructor/signup?token=${token}`
        );
        if (response.status !== 200) {
          window.location.href = "not-found";
        }

        setRegisterData((prev) => ({
          ...prev,
          email: response.data.data.email,
        }));
      } catch (error) {
        window.location.href = "not-found";
      }
    };

    verifyToken();
  }, [token]);

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
        <h1 className="text-lg">Instructor</h1>
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
          value={registerData["email"]}
          readOnly
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

        <Textarea
          name="description"
          className="mt-4"
          variant="bordered"
          label="Description"
          placeholder="Write a description about yourself"
          minRows={3}
          maxRows={8}
          maxLength={350}
          onChange={handleInputChange}
          disableAutosize
          required
          classNames={{
            input: "resize-y",
          }}
        />

        {registerData.socials.map((social, index) => (
          <div key={index} className="flex gap-2 mt-4">
            <Input
              type="text"
              value={social.link}
              variant="bordered"
              readOnly
              placeholder={`Your ${social.type} link`}
              startContent={
                socialsList.find((item) => item.type === social.type)?.icon
              }
            />
            <Button
              isIconOnly
              type="button"
              variant="bordered"
              onClick={() => {
                setRegisterData((prev) => ({
                  ...prev,
                  socials: prev.socials.filter((_, i) => i !== index),
                }));
              }}
            >
              <X size={16} />
            </Button>
          </div>
        ))}

        {selectedSocial && (
          <div className="flex gap-2 mt-4">
            <Input
              type="text"
              value={socialLink}
              variant="bordered"
              onChange={handleSocialLinkChange}
              placeholder={`Enter your ${selectedSocial}`}
              required
            />
            <Button
              isIconOnly
              type="button"
              variant="bordered"
              onClick={handleAddSocial}
            >
              <Plus size={16} />
            </Button>
          </div>
        )}

        <Dropdown>
          <DropdownTrigger>
            <Button
              variant="bordered"
              className="mt-4"
              startContent={<Plus size={16} />}
            >
              Add Socials
            </Button>
          </DropdownTrigger>
          <DropdownMenu aria-label="Static Actions">
            {socialsList.map((social) => (
              <DropdownItem
                key={social.type}
                startContent={social.icon}
                onClick={() => setSelectedSocial(social.type)}
              >
                {social.name}
              </DropdownItem>
            ))}
          </DropdownMenu>
        </Dropdown>

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
      </form>
    </div>
  );
}
