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
  title?: string;
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

export default function CourseEnroll({
  params,
}: {
  params: { id: string; postid: string };
}) {
  const [course, setCourse] = useState<CourseData | null>(null);
  const [forumPost, setForumPost] = useState<ForumPost>();
  const [forumReplies, setForumReplies] = useState<ForumPost[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [replyContent, setReplyContent] = useState("");

  const { status } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const result = await axios.get(`/api/course/${params.id}`);
        setCourse(result.data.data);
      } catch (err) {
        setError("Failed to fetch course data.");
      }
    };

    const fetchForumPosts = async () => {
      try {
        const result = await axios.get(
          `/api/forum/${params.id}?id=${params.postid}`
        );

        setForumPost(result.data.data[0]);
      } catch (err) {
        setError("Failed to fetch forum posts.");
      }
    };

    const fetchForumReplies = async () => {
      try {
        const result = await axios.get(
          `/api/forum/${params.id}/${params.postid}`
        );

        setForumReplies(result.data.data);
      } catch (err) {
        setError("Failed to fetch forum posts.");
      }
    };

    fetchForumReplies();
    fetchCourse();
    fetchForumPosts();
    setLoading(false);
  }, [params.id]);

  const handleSubmitReply = async () => {
    try {
      const formData = new FormData();
      formData.append("content", replyContent);

      const result = await axios.post(
        `/api/forum/${course?._id}/${params.postid}`,
        formData
      );

      toast({
        title: "Success reply post",
        description: result.data.message,
      });

      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast({
          title: "Failed reply post",
          description: error.response?.data.message || "An error occurred.",
        });
      } else {
        toast({
          title: "Failed reply post",
          description: "Network error. Please try again.",
        });
      }
    }
  };

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

  if (!course || !forumPost) {
    return <div>No forum found.</div>;
  }

  return (
    <section className="py-4">
      <Breadcrumbs>
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem>Course</BreadcrumbItem>
        <BreadcrumbItem href="../">{course.title}</BreadcrumbItem>
        <BreadcrumbItem href="./">Forum</BreadcrumbItem>
        <BreadcrumbItem>{forumPost.title}</BreadcrumbItem>
      </Breadcrumbs>

      <div className="flex flex-col items-center justify-center mt-8">
        <div className="min-w-xl max-w-2xl w-full">
          <User
            name={`${forumPost.creatorDetails.firstName} ${forumPost.creatorDetails.lastName}`}
            description={new Date(forumPost.createdAt).toLocaleString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
              hour: "numeric",
              minute: "numeric",
              hour12: false,
            })}
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
          <h1 className="text-lg md:text-2xl font-semibold mt-2">
            {forumPost.title}
          </h1>
          <p className="mt-4 text-md text-foreground/75">
            {forumPost.content.split("\n").map((line, index) => (
              <React.Fragment key={index}>
                {line}
                <br />
              </React.Fragment>
            ))}
          </p>
          <div className="flex flex-col gap-4 mt-8">
            <Textarea
              label="Reply Post"
              max={500}
              variant="bordered"
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
            />
            <div className="flex justify-end">
              <Button className="w-[150]" onClick={handleSubmitReply}>
                <Pencil size={16} />
                Create Post
              </Button>
            </div>

            <div className="py-4">
              {Array.isArray(forumReplies) &&
                forumReplies.map((reply) => (
                  <div key={reply._id} className="justify-start">
                    <User
                      name={`${reply.creatorDetails.firstName} ${reply.creatorDetails.lastName}`}
                      description={new Date(reply.createdAt).toLocaleString(
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
                        src: reply.creatorDetails.profilePicture,
                        alt: reply.creatorDetails.firstName,
                        isBordered:
                          reply.creatorDetails.role === "instructor" ||
                          reply.creatorDetails.role === "admin",
                        color:
                          reply.creatorDetails.role === "instructor"
                            ? "warning"
                            : "default",
                      }}
                    />
                    <p className="mt-2 text-foreground/75">{reply.content}</p>
                    <Divider className="my-4" />
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
