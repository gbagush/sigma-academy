"use client";
import React, { useState, useEffect } from "react";
import axios, { AxiosError } from "axios";
import { Button } from "@nextui-org/button";
import { Input, Textarea } from "@nextui-org/input";
import { Divider } from "@nextui-org/divider";
import { Logo } from "@/components/icons";
import { useToast } from "@/hooks/use-toast";
import { Card, CardBody } from "@nextui-org/card";
import { User } from "@nextui-org/user";
import { useAuth } from "@/context/authContext";
import { AtSign, Check, Plus, Trash2, X } from "lucide-react";
import { validateUsername } from "@/lib/utils";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/modal";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@nextui-org/dropdown";
import Image from "next/image";
import { socialsList } from "@/config/socials";

interface SocialLink {
  type: string;
  link: string;
}

export default function AdminProfile() {
  const { toast } = useToast();
  const { user, status, token } = useAuth();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const [updateData, setUpdateData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    description: "",
    socials: [] as SocialLink[],
  });

  const [usernameErrors, setUsernameErrors] = useState<string[]>([]);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>("");

  const [selectedSocial, setSelectedSocial] = useState<string | null>(null);
  const [socialLink, setSocialLink] = useState("");

  useEffect(() => {
    if (user) {
      setUpdateData({
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        description: user.description,
        socials: user.socials,
      });

      console.log(user);
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUpdateData((prev) => ({ ...prev, [name]: value }));

    if (name === "username") {
      setUsernameErrors([]);
      if (value === user.username) {
        return;
      }

      const validationErrors = validateUsername(value);
      if (validationErrors.length > 0) {
        setUsernameErrors(validationErrors);
      } else {
        checkUsernameExists(value);
      }
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreviewUrl("");
  };

  const checkUsernameExists = async (username: string) => {
    try {
      const response = await axios.get(
        `/api/auth/instructor/check-username?username=${username}`
      );
      if (response.status === 409) {
        setUsernameErrors((prev) => [...prev, response.data.message]);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setUsernameErrors((prev) => [
          ...prev,
          error.response?.data.message || "An error occurred.",
        ]);
      } else if (error instanceof Error) {
        setUsernameErrors((prev) => [...prev, error.message]);
      }
    }
  };

  const handleSubmit = async () => {
    try {
      const updateResult = await axios.put("/api/auth/instructor", updateData);
      toast({
        title: "Profile updated successfully!",
        description: updateResult.data.message,
      });
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Update error:", error.response?.data);
        toast({
          title: "Update failed",
          description:
            error.response?.data.message || "An unknown error occurred.",
        });
      } else if (error instanceof Error) {
        console.error("Update error:", error.message);
        toast({ title: "Update failed", description: error.message });
      }
    }
  };

  const handleProfilePictureSubmit = async () => {
    try {
      if (imageFile) {
        toast({
          title: "Uploading image file",
          description: "Your image is being uploaded. Please wait...",
        });

        const formData = new FormData();
        formData.append("image", imageFile);

        const result = await axios.post(
          "/api/auth/instructor/profile-picture",
          formData
        );
        toast({
          title: "Profile picture updated successfully!",
          description: result.data.message,
        });

        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        toast({
          title: "Failed update profile picture",
          description: "Select image file first!",
        });
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Update error:", error.response?.data);
        toast({
          title: "Failed update profile picture!",
          description:
            error.response?.data.message || "An unknown error occurred.",
        });
      } else if (error instanceof Error) {
        console.error("Update error:", error.message);
        toast({
          title: "Failed update profile picture!",
          description: error.message,
        });
      }
    }
  };

  if (status === "loading")
    return (
      <div className="w-full flex flex-col min-h-full items-center justify-center pad-x">
        <div className="animate-pulse">
          <Logo />
        </div>
      </div>
    );

  if (status === "login") {
    return (
      <div className="w-full flex flex-col min-h-full items-center justify-center pad-x">
        <Card className="max-w-md w-full p-4 my-8">
          <CardBody>
            <h1 className="font-semibold text-xl">Account Details</h1>
            <h4 className="mt-2 text-sm text-foreground/75">
              Manage your Sigma Academy account.
            </h4>
            <Divider className="mt-4" />
            <User
              name="Profile Picture"
              description="PNG, JPG max size of 1MB"
              avatarProps={{
                src: user.profilePicture
                  ? user.profilePicture
                  : `https://api.dicebear.com/9.x/initials/svg?seed=${user.firstName}`,
                radius: "sm",
              }}
              className="mt-8 justify-start"
              onClick={onOpen}
            />
            <div className="flex gap-4 mt-2">
              <Input
                type="text"
                name="firstName"
                variant="bordered"
                label="First Name"
                className="mt-4"
                placeholder="Enter your first name"
                value={updateData.firstName}
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
                value={updateData.lastName}
                required
                onChange={handleInputChange}
              />
            </div>
            <Input
              type="text"
              name="username"
              variant="bordered"
              label="Username"
              className={`mt-4 ${usernameErrors.length > 0 ? "border-red-500" : ""}`}
              placeholder="Enter your username"
              startContent={<AtSign size={19} className="text-foreground/75" />}
              endContent={
                usernameErrors.length > 0 ? (
                  <X size={19} className="text-red-500" />
                ) : (
                  <Check size={19} className="text-green-500" />
                )
              }
              value={updateData.username}
              required
              onChange={handleInputChange}
            />
            {usernameErrors.length > 0 && (
              <ul className="text-red-500 text-sm mt-2">
                {usernameErrors.map((error, index) => (
                  <li key={index} className="flex items-center">
                    <X size={16} />
                    <span className="ml-1">{error}</span>
                  </li>
                ))}
              </ul>
            )}

            <Input
              type="email"
              name="email"
              variant="bordered"
              label="Email"
              className="mt-4"
              placeholder="Enter your email"
              value={user.email}
              readOnly
            />

            <Textarea
              type="text"
              name="description"
              variant="bordered"
              label="Description"
              className="mt-4"
              value={updateData.description}
              onChange={handleInputChange}
              required
            />

            {updateData.socials.map((social, index) => (
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
                    setUpdateData((prev) => ({
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
                  onChange={(e) => setSocialLink(e.target.value)}
                  placeholder={`Enter your ${selectedSocial}`}
                  required
                />
                <Button
                  isIconOnly
                  type="button"
                  variant="bordered"
                  onClick={(e) => {
                    e.preventDefault();

                    setUpdateData((prev) => ({
                      ...prev,
                      socials: [
                        ...prev.socials,
                        { type: selectedSocial, link: socialLink },
                      ],
                    }));

                    setSocialLink("");
                    setSelectedSocial(null);
                  }}
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

            <Divider className="my-4" />
            <Button onClick={handleSubmit}>Update Profile</Button>
          </CardBody>
        </Card>

        <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  Change Profile Picture
                </ModalHeader>
                <ModalBody>
                  {imagePreviewUrl ? (
                    <div className="flex items-center justify-center">
                      <div
                        role="button"
                        className="relative w-80 h-80 group"
                        onClick={handleRemoveImage}
                      >
                        <Image
                          src={decodeURIComponent(imagePreviewUrl)}
                          alt="Profile Picture"
                          layout="fill"
                          objectFit="cover"
                          className="absolute top-0 left-0 transition-opacity duration-300 group-hover:opacity-75"
                        />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                          <Trash2 size={32} />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Input
                      type="file"
                      name="profile-picture"
                      label="Profile Picture"
                      variant="bordered"
                      accept=".jpg, .jpeg, .png"
                      onChange={handleImageChange}
                    />
                  )}
                </ModalBody>
                <ModalFooter>
                  <Button
                    color="danger"
                    variant="light"
                    onPress={() => {
                      onClose();
                      handleRemoveImage();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    color="primary"
                    onPress={onClose}
                    onClick={handleProfilePictureSubmit}
                  >
                    Change
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </div>
    );
  }

  if (status === "logout") {
    window.location.href = "/";
    return null;
  }

  return null;
}
