"use client";

import axios from "axios";

import React, { useState, useEffect } from "react";

import { Breadcrumbs, BreadcrumbItem } from "@nextui-org/breadcrumbs";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/modal";
import { Pencil } from "lucide-react";
import { Button } from "@nextui-org/button";
import { useAuth } from "@/context/authContext";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { Input, Textarea } from "@nextui-org/input";
import { Checkbox } from "@nextui-org/checkbox";
import { User } from "@nextui-org/user";
import { Divider } from "@nextui-org/divider";

interface CourseData {
  _id: string;
  instructorId: string;
  createdAt: string;
  category: string;
  description: string;
  language: string;
  thumbnail: string;
  title: string;
  updatedAt: string;
  discountedPrice: string;
  price: string;
  status: string;
  publishedAt: string;
}

interface ForumPost {
  _id: string;
  title: string;
  createdAt: string;
  content: string;
  creatorDetails: CreatorDetails;
}

interface CreatorDetails {
  _id: string;
  firstName: string;
  lastName: string;
  username: string;
  profilePicture: string;
  role: string;
}

export default function CourseEnroll({ params }: { params: { id: string } }) {
  const [course, setCourse] = useState<CourseData | null>(null);
  const [forumPosts, setForumPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { status } = useAuth();
  const { toast } = useToast();

  const createPostModal = useDisclosure();

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const result = await axios.get(`/api/course/${params.id}`);
        setCourse(result.data.data);
      } catch (err) {
        setError("Failed to fetch course data.");
      } finally {
        setLoading(false);
      }
    };

    const fetchForumPosts = async () => {
      try {
        const result = await axios.get(`/api/forum/${params.id}`);
        setForumPosts(result.data.data);
      } catch (err) {
        setError("Failed to fetch forum posts.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
    fetchForumPosts();
  }, [params.id]);

  useEffect(() => {
    if (status == "logout") {
      window.location.href = "/auth/user/login";
    }
  }, [status]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!course) {
    return <div>No course found.</div>;
  }

  return (
    <section className="py-4">
      <Breadcrumbs>
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem>Course</BreadcrumbItem>
        <BreadcrumbItem href="./">{course.title}</BreadcrumbItem>
        <BreadcrumbItem>Forum</BreadcrumbItem>
      </Breadcrumbs>

      <div className="flex flex-col items-center justify-center mt-8">
        <div className="min-w-xl max-w-2xl w-full">
          <h1 className="w-full text-xl md:text-3xl font-semibold">
            {course.title} Forum
          </h1>
          <div className="flex flex-col gap-4 mt-8">
            <Button className="w-[150]" onClick={createPostModal.onOpen}>
              <Pencil size={16} />
              Create Post
            </Button>

            <div className="py-4">
              {forumPosts.map((forumPost) => (
                <div className="justify-start" key={forumPost._id}>
                  <User
                    name={`${forumPost.creatorDetails.firstName} ${forumPost.creatorDetails.lastName}`}
                    description={new Date(forumPost.createdAt).toLocaleString(
                      "en-US",
                      {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                        hour: "numeric",
                        minute: "numeric",
                        hour12: false,
                      }
                    )}
                    avatarProps={{
                      src: forumPost.creatorDetails.profilePicture
                        ? forumPost.creatorDetails.profilePicture
                        : `https://api.dicebear.com/9.x/initials/svg?seed=${forumPost.creatorDetails.firstName}`,
                      alt: forumPost.creatorDetails.firstName,
                      isBordered:
                        forumPost.creatorDetails.role == "instructor" ||
                        forumPost.creatorDetails.role == "admin",
                      color:
                        forumPost.creatorDetails.role == "instructor"
                          ? "warning"
                          : "default",
                    }}
                  />
                  <h4 className="font-semibold">{forumPost.title}</h4>
                  <p className="text-sm text-foreground/75 overflow-hidden whitespace-nowrap text-ellipsis">
                    {forumPost.content}
                  </p>
                  <Link
                    href={`/course/${course._id}/forum/${forumPost._id}`}
                    className="text-sm text-blue-500"
                  >
                    See more ...
                  </Link>
                  <Divider className="my-4" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <CreatePost
        isOpen={createPostModal.isOpen}
        onOpenChange={createPostModal.onOpenChange}
        course={course}
      />
    </section>
  );
}

const CreatePost = ({
  isOpen,
  onOpenChange,
  course,
}: {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  course: CourseData;
}) => {
  const [postData, setPostData] = useState({
    title: "",
    content: "",
    verify: false,
  });

  const { toast } = useToast();

  const handleSubmit = async () => {
    if (postData.verify == false) {
      toast({
        title: "Failed create post",
        description:
          "Make sure you have checked whether there has been a same discussion",
      });
    }

    if (!postData.content || !postData.title) {
      toast({
        title: "Failed create post",
        description: "Please fill all form first",
      });
    }
    try {
      const formData = new FormData();
      formData.append("title", postData.title);
      formData.append("content", postData.content);

      const result = await axios.post(`/api/forum/${course._id}`, formData);

      toast({
        title: "Success create post",
        description: result.data.message,
      });

      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast({
          title: "Failed create post",
          description: error.response?.data.message || "An error occurred.",
        });
      } else {
        toast({
          title: "Failed create post",
          description: "Network error. Please try again.",
        });
      }
    }
  };

  useEffect(() => {
    console.log(postData);
  }, [postData]);

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Create Post
            </ModalHeader>
            <ModalBody>
              <Input
                type="text"
                label="Title"
                value={postData.title}
                onChange={(e) =>
                  setPostData({ ...postData, title: e.target.value })
                }
              />
              <Textarea
                type="text"
                label="Content"
                max={512}
                value={postData.content}
                onChange={(e) =>
                  setPostData({ ...postData, content: e.target.value })
                }
                classNames={{
                  input: "resize-y min-h-[40px]",
                }}
              />
              <span className="text-sm text-foreground/75">
                Check whether there are forums that have the same discussion
                before creating a new discussion
              </span>
              <Checkbox
                isSelected={postData.verify}
                onValueChange={() =>
                  setPostData({ ...postData, verify: !postData.verify })
                }
              >
                There is no same discussion
              </Checkbox>
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                Close
              </Button>
              <Button color="primary" onClick={handleSubmit}>
                Create Post
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
