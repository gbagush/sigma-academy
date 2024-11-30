"use client";

import axios from "axios";
import { Button } from "@nextui-org/button";
import { Input, Textarea } from "@nextui-org/input";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Autocomplete, AutocompleteItem } from "@nextui-org/autocomplete";
import { Language } from "@/config/lang";
import { Logo } from "@/components/icons";
import Image from "next/image";
import { Trash2, Save, Globe, Trash } from "lucide-react";
import { Card, CardHeader, CardBody, CardFooter } from "@nextui-org/card";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@nextui-org/modal";

interface Subcategory {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
  subcategories?: Subcategory[];
}

interface CourseData {
  title: string;
  description: string;
  category: string;
  language: string;
  thumbnail: File;
  status: string;
  price: number;
  discountedPrice: number;
  publishedAt: string;
}

export default function CourseDetailsTab({ id }: { id: string }) {
  const [courseData, setCourseData] = useState<CourseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [flattenedCategories, setFlattenedCategories] = useState<
    Array<{
      id: string;
      name: string;
      isSubcategory?: boolean;
      parentName?: string;
    }>
  >([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>("");

  const [languages, setLanguages] = useState<Language[]>([]);

  const { toast } = useToast();

  const deleteDraftModal = useDisclosure();
  const publishDraftModal = useDisclosure();

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        const response = await axios.get(`/api/instructor/course/${id}`);
        setCourseData(response.data.data);
        setImagePreviewUrl(
          response.data.data.thumbnail ? response.data.data.thumbnail : ""
        );
      } catch (error) {
        window.location.href = "../";
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await axios.get("/api/category");
        const categoriesData = response.data.data;

        const flattened = categoriesData.reduce(
          (acc: any[], category: Category) => {
            acc.push({
              id: category.id,
              name: category.name,
              isSubcategory: false,
            });

            if (category.subcategories) {
              category.subcategories.forEach((sub) => {
                acc.push({
                  id: sub.id,
                  name: sub.name,
                  isSubcategory: true,
                  parentName: category.name,
                });
              });
            }

            return acc;
          },
          []
        );

        setFlattenedCategories(flattened);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch categories",
        });
      }
    };

    const fetchLanguages = async () => {
      try {
        const response = await axios.get("/api/lang");
        setLanguages(response.data.data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch languages",
        });
      }
    };

    fetchCourseData();
    fetchCategories();
    fetchLanguages();

    setLoading(false);
  }, [id]);

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

  const handleSave = async () => {
    if (!courseData) return;

    toast({
      title: "Saving changes",
      description: "Try uploading course data",
    });

    try {
      const formData = new FormData();

      formData.append("title", courseData.title);
      formData.append("description", courseData.description);
      formData.append("category", courseData.category);
      formData.append("language", courseData.language);
      formData.append("status", courseData.status);
      formData.append("price", courseData.price.toString());
      formData.append("discountedPrice", courseData.discountedPrice.toString());

      if (imageFile) {
        formData.append("thumbnail", imageFile);
      }

      await axios.put(`/api/instructor/course/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast({
        title: "Success",
        description: "Course details updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update course details",
      });
    }
  };

  const handlePublishDraft = async () => {
    try {
      await axios.post(`/api/instructor/course/${id}/publish`);
      toast({
        title: "Success",
        description: "Draft published successfully",
      });

      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast({
          title: "Failed publish draft",
          description: error.response?.data.message || "An error occurred.",
        });
      } else {
        toast({
          title: "Failed publish draft",
          description: "Network error. Please try again.",
        });
      }
    }
  };

  const handleDeleteDraft = async () => {
    try {
      await axios.delete(`/api/instructor/course/${id}`);
      toast({
        title: "Success",
        description: "Draft deleted successfully",
      });

      setTimeout(() => {
        window.location.href = "/instructor/dashboard/courses";
      }, 2000);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast({
          title: "Failed delete draft",
          description: error.response?.data.message || "An error occurred.",
        });
      } else {
        toast({
          title: "Failed delete draft",
          description: "Network error. Please try again.",
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-full">
        <div className="animate-pulse">
          <Logo />
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl">Course Details</h1>
        <div className="flex items-center gap-4">
          {courseData?.publishedAt ? (
            <span className="text-success">Published</span>
          ) : (
            <span className="text-foreground/75 italic">Draft</span>
          )}
          <Button color="primary" size="sm" onClick={handleSave}>
            <Save size={16} /> Save Changes
          </Button>
        </div>
      </div>

      <div className="flex flex-col-reverse md:flex-row gap-8 mt-8">
        <div className="basis-full md:basis-3/5">
          <div className="flex flex-col gap-4">
            <span className="text-sm -mt-1">Information</span>
            <Input
              type="text"
              label="Title"
              value={courseData?.title}
              onChange={(e) =>
                setCourseData((prev) =>
                  prev ? { ...prev, title: e.target.value } : null
                )
              }
              className="-mt-2"
            />
            <Textarea
              type="text"
              label="Description"
              value={courseData?.description}
              onChange={(e) =>
                setCourseData((prev) =>
                  prev ? { ...prev, description: e.target.value } : null
                )
              }
            />
            <Autocomplete
              label="Categories"
              placeholder="Select a category"
              defaultItems={flattenedCategories}
              selectedKey={courseData?.category}
              onSelectionChange={(key) =>
                setCourseData((prev) =>
                  prev ? { ...prev, category: key as string } : null
                )
              }
            >
              {(item) => (
                <AutocompleteItem
                  key={item.id}
                  value={item.id}
                  className={item.isSubcategory ? "pl-6" : ""}
                >
                  {item.isSubcategory
                    ? `${item.parentName} > ${item.name}`
                    : item.name}
                </AutocompleteItem>
              )}
            </Autocomplete>

            <Autocomplete
              label="Language"
              placeholder="Select a language"
              defaultItems={languages}
              selectedKey={courseData?.language}
              onSelectionChange={(key) =>
                setCourseData((prev) =>
                  prev ? { ...prev, language: key as string } : null
                )
              }
            >
              {(item) => (
                <AutocompleteItem key={item.code} value={item.code}>
                  {item.name}
                </AutocompleteItem>
              )}
            </Autocomplete>

            <Autocomplete
              label="Status"
              selectedKey={courseData?.status}
              onSelectionChange={(key) =>
                setCourseData((prev) =>
                  prev ? { ...prev, status: key as string } : null
                )
              }
            >
              <AutocompleteItem key="ongoing">On Going</AutocompleteItem>
              <AutocompleteItem key="finish">Finish</AutocompleteItem>
            </Autocomplete>

            <Input
              type="number"
              label="Price"
              value={
                courseData?.price != null ? courseData.price.toString() : ""
              }
              onChange={(e) =>
                setCourseData((prev) =>
                  prev
                    ? {
                        ...prev,
                        price: e.target.value ? parseFloat(e.target.value) : 0,
                      }
                    : null
                )
              }
            />

            <Input
              type="number"
              label="Discounted Price"
              value={
                courseData?.discountedPrice != null
                  ? courseData.discountedPrice.toString()
                  : ""
              }
              onChange={(e) =>
                setCourseData((prev) =>
                  prev
                    ? {
                        ...prev,
                        discountedPrice: e.target.value
                          ? parseFloat(e.target.value)
                          : 0,
                      }
                    : null
                )
              }
            />
          </div>
        </div>

        <div className="basis-full md:basis-2/5">
          <span className="text-sm -mt-1">Thumbnail</span>
          {imagePreviewUrl ? (
            <div className="flex items-center justify-center">
              <div
                role="button"
                className="relative w-full h-0 pb-[56.25%] group"
                onClick={handleRemoveImage}
              >
                <Image
                  src={decodeURIComponent(imagePreviewUrl)}
                  alt="Profile Picture"
                  layout="fill"
                  objectFit="cover"
                  className="absolute top-0 left-0 transition-opacity duration-300 group-hover:opacity-75 rounded-md"
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <Trash2 size={32} />
                </div>
              </div>
            </div>
          ) : (
            <Input
              type="file"
              accept=".jpg, .jpeg, .png"
              onChange={handleImageChange}
            />
          )}
          {courseData?.publishedAt == null && (
            <Card className="mt-4">
              <CardBody>
                <p>Your course is still in draft</p>
                <Button
                  variant="solid"
                  color="primary"
                  className="mt-2"
                  onPress={() => {
                    publishDraftModal.onOpen();
                  }}
                >
                  <Globe size={16} /> Publish Now
                </Button>
                <Button
                  variant="light"
                  color="danger"
                  className="mt-2"
                  onPress={() => {
                    deleteDraftModal.onOpen();
                  }}
                >
                  <Trash size={16} /> Delete Draft
                </Button>
              </CardBody>
            </Card>
          )}
        </div>
      </div>

      <PublishDraftModal
        isOpen={publishDraftModal.isOpen}
        onOpenChange={publishDraftModal.onOpenChange}
        publishDraftTitle={courseData?.title}
        handleDraftPublish={handlePublishDraft}
      />

      <DeleteDraftModal
        isOpen={deleteDraftModal.isOpen}
        onOpenChange={deleteDraftModal.onOpenChange}
        deleteDraftTitle={courseData?.title}
        handleDraftDelete={handleDeleteDraft}
      />
    </div>
  );
}

const PublishDraftModal = ({
  isOpen,
  onOpenChange,
  publishDraftTitle,
  handleDraftPublish,
}: {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  publishDraftTitle?: string;
  handleDraftPublish: () => void;
}) => {
  const [confirm, setConfirm] = useState("");

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>Publish Draft</ModalHeader>
            <ModalBody>
              <p>
                This is an irreversible action. Once published, the course
                cannot be deleted, but you can still edit its content. Type{" "}
                <b>
                  &quot;{publishDraftTitle ? publishDraftTitle : "CONFIRM"}
                  &quot;
                </b>{" "}
                to confirm.
              </p>
              <Input
                label="Confirm"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </ModalBody>
            <ModalFooter>
              <Button
                color="primary"
                isDisabled={confirm !== (publishDraftTitle || "CONFIRM")}
                onPress={() => {
                  handleDraftPublish();
                  setConfirm("");
                  onClose();
                }}
              >
                Publish Draft
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

const DeleteDraftModal = ({
  isOpen,
  onOpenChange,
  deleteDraftTitle,
  handleDraftDelete,
}: {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  deleteDraftTitle?: string;
  handleDraftDelete: () => void;
}) => {
  const [confirm, setConfirm] = useState("");

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>Delete Draft</ModalHeader>
            <ModalBody>
              <p>
                This is an irreversible action. Delete course will delete all
                content within it. Type{" "}
                <b>
                  &quot;{deleteDraftTitle ? deleteDraftTitle : "CONFIRM"}&quot;
                </b>{" "}
                to confirm.
              </p>
              <Input
                label="Confirm"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </ModalBody>
            <ModalFooter>
              <Button
                color="danger"
                isDisabled={confirm !== (deleteDraftTitle || "CONFIRM")}
                onPress={() => {
                  handleDraftDelete();
                  setConfirm("");
                  onClose();
                }}
              >
                Delete Draft
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
