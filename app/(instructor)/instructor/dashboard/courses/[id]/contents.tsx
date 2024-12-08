"use client";

import axios from "axios";
import React, { useEffect, useState } from "react";
import { Button, ButtonGroup } from "@nextui-org/button";
import {
  Plus,
  Save,
  ChevronUp,
  ChevronDown,
  Trash,
  Book,
  Video,
  SquarePlay,
  TvMinimalPlay,
  Edit,
  Delete,
  Eye,
  FileQuestion,
} from "lucide-react";
import { Accordion, AccordionItem } from "@nextui-org/accordion";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/modal";
import {
  Autocomplete,
  AutocompleteSection,
  AutocompleteItem,
} from "@nextui-org/autocomplete";
import { Card, CardHeader, CardBody, CardFooter } from "@nextui-org/card";
import { Input, Textarea } from "@nextui-org/input";
import { Checkbox } from "@nextui-org/checkbox";
import { toast } from "@/hooks/use-toast";

interface AddContentParams {
  sectionId: string;
  title: string;
  url?: string;
  description?: string;
  preview?: boolean;
  quizId?: string;
  minimumGrade?: number;
  type: "content" | "quiz";
}

interface Content {
  _id: string;
  title: string;
  url: string;
  description: string;
  preview: boolean;
  type: "content";
}

interface Quiz {
  _id: string;
  title: string;
  quizId: string;
  minimumGrade: number;
  type: "quiz";
}

type SectionContent = Content | Quiz;

interface Section {
  _id: string;
  title: string;
  contents: SectionContent[];
}

export default function CourseContentTabs({ id }: { id: string }) {
  const addSectionModal = useDisclosure();
  const [currentSectionId, setCurrentSectionId] = useState<string | null>(null);

  const [sections, setSections] = useState<Section[]>([]);

  const editSectionModal = useDisclosure();
  const [editSectionId, setEditSectionId] = useState<string | null>(null);
  const [editSectionTitle, setEditSectionTitle] = useState("");

  const deleteSectionModal = useDisclosure();
  const [deleteSectionId, setDeleteSectionId] = useState("");
  const [deleteSectionTitle, setDeleteSectionTitle] = useState("");

  const addContentModal = useDisclosure();

  const editContentModal = useDisclosure();

  const [editContentId, setEditContentId] = useState<string | null>(null);
  const [editContentType, setEditContentType] = useState<"content" | "quiz">(
    "content"
  );

  const [editContentTitle, setEditContentTitle] = useState("");

  const [editContentUrl, setEditContentUrl] = useState("");
  const [editContentDescription, setEditContentDescription] = useState("");
  const [editContentPreview, setEditContentPreview] = useState(false);

  const [editQuizTitle, setEditQuizTitle] = useState("");
  const [editQuizId, setEditQuizId] = useState("");
  const [editQuizMinimumGrade, setEditQuizMinimumGrade] = useState(0);

  const deleteContentModal = useDisclosure();
  const [deleteContentId, setDeleteContentId] = useState<string | null>(null);
  const [deleteContentTitle, setDeleteContentTitle] = useState<string>("");
  const [confirmContentTitle, setConfirmContentTitle] = useState<string>("");

  useEffect(() => {
    console.log(sections);
  }, [sections]);

  const handleAddSection = (title: string): void => {
    const newSection = {
      _id: Date.now().toString(),
      title,
      contents: [],
    };
    setSections((prevSections) => [...prevSections, newSection]);
  };

  const handleEditSection = (_id: string, title: string) => {
    setEditSectionId(_id);
    setEditSectionTitle(title);
    editSectionModal.onOpen();
  };

  const updateSectionTitle = () => {
    if (editSectionId && editSectionTitle.trim()) {
      setSections((prevSections) =>
        prevSections.map((section) =>
          section._id === editSectionId
            ? { ...section, title: editSectionTitle }
            : section
        )
      );
      editSectionModal.onClose();
      setEditSectionTitle("");
    }
  };

  const handleDeleteSection = (_id: string): void => {
    setSections((prevSections) =>
      prevSections.filter((section) => section._id !== _id)
    );

    setDeleteSectionId("");
    setDeleteSectionTitle("");
  };

  const handleMoveUp = (_id: string): void => {
    setSections((prevSections) => {
      const index = prevSections.findIndex((section) => section._id === _id);
      if (index > 0) {
        const updatedSections = [...prevSections];
        [updatedSections[index - 1], updatedSections[index]] = [
          updatedSections[index],
          updatedSections[index - 1],
        ];
        return updatedSections;
      }
      return prevSections;
    });
  };

  const handleMoveDown = (_id: string): void => {
    setSections((prevSections) => {
      const index = prevSections.findIndex((section) => section._id === _id);
      if (index < prevSections.length - 1) {
        const updatedSections = [...prevSections];
        [updatedSections[index + 1], updatedSections[index]] = [
          updatedSections[index],
          updatedSections[index + 1],
        ];
        return updatedSections;
      }
      return prevSections;
    });
  };

  const addContentToSection = ({
    sectionId,
    title,
    url,
    description,
    preview,
    quizId,
    minimumGrade,
    type,
  }: {
    sectionId: string;
    title: string;
    url?: string;
    description?: string;
    preview?: boolean;
    quizId?: string;
    minimumGrade?: number;
    type: "content" | "quiz";
  }) => {
    setSections((prevSections: any) => {
      const sectionIndex = prevSections.findIndex(
        (section: any) => section._id === sectionId
      );

      if (sectionIndex !== -1) {
        const newContent =
          type === "quiz"
            ? { _id: Date.now().toString(), title, quizId, minimumGrade, type }
            : {
                _id: Date.now().toString(),
                title,
                url,
                description,
                preview,
                type,
              };

        const updatedContents = [
          ...prevSections[sectionIndex].contents,
          newContent,
        ];

        const updatedSection = {
          ...prevSections[sectionIndex],
          contents: updatedContents,
        };

        return [
          ...prevSections.slice(0, sectionIndex),
          updatedSection,
          ...prevSections.slice(sectionIndex + 1),
        ];
      }

      return prevSections;
    });
  };
  const handleMoveContentUp = (sectionId: string, index: number) => {
    setSections((prevSections) => {
      const sectionIndex = prevSections.findIndex(
        (section) => section._id === sectionId
      );
      if (sectionIndex !== -1 && index > 0) {
        const updatedContents = [...prevSections[sectionIndex].contents];
        [updatedContents[index - 1], updatedContents[index]] = [
          updatedContents[index],
          updatedContents[index - 1],
        ];
        const updatedSection = {
          ...prevSections[sectionIndex],
          contents: updatedContents,
        };
        return [
          ...prevSections.slice(0, sectionIndex),
          updatedSection,
          ...prevSections.slice(sectionIndex + 1),
        ];
      }
      return prevSections;
    });
  };

  const handleMoveContentDown = (sectionId: string, index: number) => {
    setSections((prevSections) => {
      const sectionIndex = prevSections.findIndex(
        (section) => section._id === sectionId
      );
      if (
        sectionIndex !== -1 &&
        index < prevSections[sectionIndex].contents.length - 1
      ) {
        const updatedContents = [...prevSections[sectionIndex].contents];
        [updatedContents[index], updatedContents[index + 1]] = [
          updatedContents[index + 1],
          updatedContents[index],
        ];
        const updatedSection = {
          ...prevSections[sectionIndex],
          contents: updatedContents,
        };
        return [
          ...prevSections.slice(0, sectionIndex),
          updatedSection,
          ...prevSections.slice(sectionIndex + 1),
        ];
      }
      return prevSections;
    });
  };

  const handleEditContent = (
    contentId: string,
    title: string,
    url: string,
    description: string,
    preview: boolean
  ) => {
    console.log("Try edit data");
    console.log("Editing Content ID:", contentId);
    console.log("New Data:", { title, url, description, preview });
    console.log("Current Section ID:", currentSectionId);

    setSections((prevSections) => {
      console.log("Previous Sections:", prevSections);

      const sectionIndex = prevSections.findIndex(
        (section) => section._id === currentSectionId
      );

      if (sectionIndex !== -1) {
        const updatedContents = prevSections[sectionIndex].contents.map(
          (content) => {
            if (content._id === contentId) {
              console.log("Updating Content:", content);
              return { ...content, title, url, description, preview };
            }
            return content;
          }
        );

        const updatedSection = {
          ...prevSections[sectionIndex],
          contents: updatedContents,
        };

        const updatedSections = [
          ...prevSections.slice(0, sectionIndex),
          updatedSection,
          ...prevSections.slice(sectionIndex + 1),
        ];

        console.log("Updated Sections:", updatedSections);
        return updatedSections;
      }

      console.log("Section not found for ID:", currentSectionId);
      return prevSections;
    });
  };

  const handleDeleteContent = (contentId: string) => {
    setSections((prevSections) => {
      return prevSections.map((section) => {
        return {
          ...section,
          contents: section.contents.filter(
            (content) => content._id !== contentId
          ),
        };
      });
    });
  };

  const handleSaveChanges = async () => {
    try {
      const result = await axios.put(
        `/api/instructor/course/${id}/content`,
        sections
      );

      toast({
        title: "Changes Saved",
        description: result.data.message,
      });

      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast({
          title: "Failed save changes",
          description: error.response?.data.message || "An error occurred.",
        });
      } else {
        toast({
          title: "Failed save changes",
          description: "Network error. Please try again.",
        });
      }
    }
  };

  useEffect(() => {
    console.log(sections);
  }, [sections]);

  useEffect(() => {
    const getSectionData = async () => {
      try {
        const result = await axios.get(`/api/instructor/course/${id}/content`);
        console.log(result.data.data);
        setSections(result.data.data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load course content",
        });
      }
    };

    getSectionData();
  }, []);

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl">Course Contents</h1>
        <div className="flex gap-2">
          <Button color="primary" size="sm" onClick={handleSaveChanges}>
            <Save size={16} /> Save Changes
          </Button>
        </div>
      </div>

      <div className="mt-4">
        <Button size="sm" variant="faded" onPress={addSectionModal.onOpen}>
          <Plus size={16} />
          Add Section
        </Button>
      </div>

      <div className="mt-4">
        <Accordion variant="splitted" selectionMode="multiple">
          {sections.map((section) => (
            <AccordionItem
              key={section._id}
              aria-label={section.title}
              title={section.title}
              className="mt-2"
            >
              <div className="flex gap-2">
                <ButtonGroup>
                  <Button
                    size="sm"
                    variant="faded"
                    isIconOnly
                    onPress={() => handleMoveUp(section._id)}
                  >
                    <ChevronUp size={16} />
                  </Button>
                  <Button
                    size="sm"
                    variant="faded"
                    isIconOnly
                    onPress={() => handleMoveDown(section._id)}
                  >
                    <ChevronDown size={16} />
                  </Button>
                </ButtonGroup>
                <Button
                  size="sm"
                  variant="faded"
                  onPress={() => {
                    setCurrentSectionId(section._id);
                    addContentModal.onOpen();
                  }}
                >
                  <Plus size={16} /> Add Content
                </Button>
                <Button
                  size="sm"
                  variant="faded"
                  onPress={() => handleEditSection(section._id, section.title)}
                >
                  <Edit size={16} /> Edit Section
                </Button>
                <Button
                  size="sm"
                  variant="faded"
                  onPress={() => {
                    setDeleteSectionId(section._id);
                    setDeleteSectionTitle(section.title);
                    deleteSectionModal.onOpen();
                  }}
                >
                  <Trash size={16} /> Delete Section
                </Button>
              </div>

              <div className="mt-4">
                {section.contents.map((content, index) => (
                  <Card className="mt-2" key={content._id}>
                    <CardBody>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <div className="flex items-center justify-center w-8 h-8 bg-foreground/25 rounded-md mr-4">
                            {content.type === "quiz" ? (
                              <FileQuestion size={16} />
                            ) : (
                              <TvMinimalPlay size={16} />
                            )}
                          </div>
                          <h4 className="text-sm">{content.title}</h4>
                        </div>
                        <div>
                          <div className="flex gap-2 items-center">
                            {content.type === "content" && content.preview && (
                              <Eye size={20} className="text-foreground/75" />
                            )}
                            <ButtonGroup>
                              <Button
                                size="sm"
                                isIconOnly
                                onPress={() =>
                                  handleMoveContentUp(section._id, index)
                                }
                              >
                                <ChevronUp size={16} />
                              </Button>
                              <Button
                                size="sm"
                                isIconOnly
                                onPress={() =>
                                  handleMoveContentDown(section._id, index)
                                }
                              >
                                <ChevronDown size={16} />
                              </Button>
                            </ButtonGroup>
                            <Button
                              size="sm"
                              isIconOnly
                              onPress={() => {
                                setEditContentId(content._id);
                                setEditContentTitle(content.title);

                                if (content.type === "content") {
                                  setEditContentType("content");
                                  setEditContentUrl(content.url);
                                  setEditContentDescription(
                                    content.description
                                  );
                                  setEditContentPreview(content.preview);
                                } else {
                                  setEditContentType("quiz");
                                  setEditQuizId(content.quizId);
                                  setEditQuizTitle(content.title);
                                  setEditQuizMinimumGrade(content.minimumGrade);
                                }

                                setCurrentSectionId(section._id);
                                editContentModal.onOpen();
                              }}
                            >
                              <Edit size={16} />
                            </Button>
                            <Button
                              size="sm"
                              isIconOnly
                              onPress={() => {
                                setDeleteContentId(content._id);
                                setDeleteContentTitle(content.title);
                                deleteContentModal.onOpen();
                              }}
                            >
                              <Trash size={16} />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      <AddSectionModal
        isOpen={addSectionModal.isOpen}
        onOpenChange={addSectionModal.onOpenChange}
        onAddSection={handleAddSection}
      />

      <EditSectionModal
        isOpen={editSectionModal.isOpen}
        onOpenChange={editSectionModal.onOpenChange}
        editSectionTitle={editSectionTitle}
        setEditSectionTitle={setEditSectionTitle}
        updateSectionTitle={updateSectionTitle}
      />

      <DeleteSectionModal
        isOpen={deleteSectionModal.isOpen}
        onOpenChange={deleteSectionModal.onOpenChange}
        deleteSectionId={deleteSectionId}
        deleteSectionTitle={deleteSectionTitle}
        handleSectionDelete={handleDeleteSection}
      />

      <AddContentModal
        isOpen={addContentModal.isOpen}
        onOpenChange={addContentModal.onOpenChange}
        onAddContent={addContentToSection}
        sectionId={currentSectionId!}
      />

      <EditContentModal
        isOpen={editContentModal.isOpen}
        onOpenChange={editContentModal.onOpenChange}
        onEditContent={handleEditContent}
        contentId={editContentId!}
        contentType={editContentType}
        title={editContentTitle}
        url={editContentUrl}
        description={editContentDescription}
        preview={editContentPreview}
        quizId={editQuizId}
        quizMinimumGrade={editQuizMinimumGrade}
      />

      <DeleteContentModal
        isOpen={deleteContentModal.isOpen}
        onOpenChange={deleteContentModal.onOpenChange}
        deleteContentId={deleteContentId}
        deleteContentTitle={deleteContentTitle}
        handleContentDelete={handleDeleteContent}
      />
    </div>
  );
}

const AddSectionModal = ({
  isOpen,
  onOpenChange,
  onAddSection,
}: {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onAddSection: (title: string) => void;
}) => {
  const [sectionName, setSectionName] = useState("");

  const handleSubmit = () => {
    if (sectionName.trim()) {
      onAddSection(sectionName);
      setSectionName("");
      onOpenChange(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Add Section
            </ModalHeader>
            <ModalBody>
              <Input
                label="Section Name"
                value={sectionName}
                onChange={(e) => setSectionName(e.target.value)}
              />
            </ModalBody>
            <ModalFooter>
              <Button color="primary" onPress={handleSubmit}>
                Add Section
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

const EditSectionModal = ({
  isOpen,
  onOpenChange,
  editSectionTitle,
  setEditSectionTitle,
  updateSectionTitle,
}: {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  editSectionTitle: string;
  setEditSectionTitle: (title: string) => void;
  updateSectionTitle: () => void;
}) => {
  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        <ModalHeader>Edit Section Title</ModalHeader>
        <ModalBody>
          <Input
            label="New Section Title"
            value={editSectionTitle}
            onChange={(e) => setEditSectionTitle(e.target.value)}
          />
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onPress={updateSectionTitle}>
            Update Title
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

const DeleteSectionModal = ({
  isOpen,
  onOpenChange,
  deleteSectionId,
  deleteSectionTitle,
  handleSectionDelete,
}: {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  deleteSectionId: string;
  deleteSectionTitle: string;
  handleSectionDelete: (id: string) => void;
}) => {
  const [confirm, setConfirm] = useState("");

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>Delete Section</ModalHeader>
            <ModalBody>
              <p>
                This is an irreversible action. Delete section will delete all
                content within it. Type <b>&quot;{deleteSectionTitle}&quot;</b>{" "}
                to confirm.
              </p>
              <Input
                label="New Section Title"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </ModalBody>
            <ModalFooter>
              <Button
                color="danger"
                isDisabled={confirm != deleteSectionTitle}
                onPress={() => {
                  handleSectionDelete(deleteSectionId);
                  setConfirm("");
                  onClose();
                }}
              >
                Delete Section
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

const AddContentModal = ({
  isOpen,
  onOpenChange,
  onAddContent,
  sectionId,
}: {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onAddContent: (params: AddContentParams) => void;
  sectionId: string;
}) => {
  const [contentTitle, setContentTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [description, setDescription] = useState("");
  const [preview, setPreview] = useState(false);

  const [contentType, setContentType] = useState<"content" | "quiz">("content");

  const [quizId, setQuizId] = useState("");
  const [minimumGrade, setMinimumGrade] = useState(0);

  const handleSubmit = () => {
    if (contentType === "content") {
      if (contentTitle.trim() && videoUrl.trim()) {
        onAddContent({
          sectionId,
          title: contentTitle,
          url: videoUrl,
          description,
          preview,
          type: "content",
        });
      }
    } else if (contentType === "quiz") {
      if (
        contentTitle.trim() &&
        quizId.trim() &&
        minimumGrade >= 0 &&
        minimumGrade <= 100
      ) {
        onAddContent({
          sectionId,
          title: contentTitle,
          quizId,
          minimumGrade,
          type: "quiz",
        });
      }
    }
    resetFields();
    onOpenChange(false);
  };

  const resetFields = () => {
    setContentTitle("");
    setVideoUrl("");
    setDescription("");
    setPreview(false);
    setQuizId("");
    setMinimumGrade(0);
    setContentType("content");
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Add Content
            </ModalHeader>
            <ModalBody>
              <Autocomplete
                selectedKey={contentType}
                label="Content Type"
                onSelectionChange={(value) =>
                  setContentType(value as "content" | "quiz")
                }
              >
                <AutocompleteItem key="content">Content</AutocompleteItem>
                <AutocompleteItem key="quiz">Quiz</AutocompleteItem>
              </Autocomplete>

              {contentType === "content" ? (
                <>
                  <Input
                    label="Content Title"
                    value={contentTitle}
                    onChange={(e) => setContentTitle(e.target.value)}
                  />
                  <Input
                    label="Video URL"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                  />
                  <Textarea
                    label="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                  <Checkbox isSelected={preview} onValueChange={setPreview}>
                    {" "}
                    Preview content{" "}
                  </Checkbox>
                </>
              ) : (
                <>
                  <Input
                    label="Quiz Title"
                    value={contentTitle}
                    onChange={(e) => setContentTitle(e.target.value)}
                  />
                  <Input
                    label="Quiz ID"
                    value={quizId}
                    onChange={(e) => setQuizId(e.target.value)}
                  />
                  <Input
                    type="number"
                    label="Minimum Grade (0-100)"
                    value={minimumGrade.toString()}
                    onChange={(e) => setMinimumGrade(Number(e.target.value))}
                  />
                </>
              )}
            </ModalBody>
            <ModalFooter>
              <Button color="primary" onPress={handleSubmit}>
                {" "}
                Add {contentType === "quiz" ? "Quiz" : "Content"}{" "}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

const EditContentModal = ({
  isOpen,
  onOpenChange,
  onEditContent,
  contentId,
  contentType,
  title,
  url,
  description,
  preview,
  quizId,
  quizMinimumGrade,
}: {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onEditContent: (
    id: string,
    title: string,
    url: string,
    description: string,
    preview: boolean
  ) => void;
  contentId: string | null;
  contentType: "content" | "quiz";
  title: string;
  url: string;
  description: string;
  preview: boolean;
  quizId: string;
  quizMinimumGrade: number;
}) => {
  const [editTitle, setEditTitle] = useState(title);
  const [editUrl, setEditUrl] = useState(url);
  const [editDescription, setEditDescription] = useState(description);
  const [editPreview, setEditPreview] = useState(preview);

  const [editQuizId, setEditQuizId] = useState("");
  const [editQuizMinimumGrade, setEditQuizMinimumGrade] =
    useState(quizMinimumGrade);

  useEffect(() => {
    setEditTitle(title);
    setEditUrl(url);
    setEditDescription(description);
    setEditPreview(preview);

    if (contentType === "quiz") {
      setEditQuizId(quizId);
      setEditQuizMinimumGrade(quizMinimumGrade);
    }
  }, [title, url, description, preview, quizId, quizMinimumGrade, contentType]);

  const handleSubmit = () => {
    if (editTitle.trim() && editUrl.trim()) {
      onEditContent(
        contentId!,
        editTitle,
        editUrl,
        editDescription,
        editPreview
      );
      onOpenChange(false);
    }
  };

  useEffect(() => {
    console.log(preview);
  }, [preview]);

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>Edit Content</ModalHeader>
            <ModalBody>
              {contentType == "content" ? (
                <>
                  <Input
                    label="Content Title"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                  />
                  <Input
                    label="Video URL"
                    value={editUrl}
                    onChange={(e) => setEditUrl(e.target.value)}
                  />
                  <Textarea
                    label="Description"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                  />
                  <Checkbox
                    isSelected={editPreview}
                    onChange={(e) => setEditPreview(e.target.checked)}
                  >
                    Preview content
                  </Checkbox>
                </>
              ) : (
                <>
                  <Input
                    label="Quiz Title"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                  />
                  <Input
                    label="Quiz ID"
                    value={editQuizId}
                    onChange={(e) => setEditQuizId(e.target.value)}
                  />
                  <Input
                    type="number"
                    label="Minimum Grade (0-100)"
                    value={editQuizMinimumGrade.toString()}
                    onChange={(e) =>
                      setEditQuizMinimumGrade(parseInt(e.target.value))
                    }
                  />
                </>
              )}
            </ModalBody>
            <ModalFooter>
              <Button color="primary" onPress={handleSubmit}>
                Update Content
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

const DeleteContentModal = ({
  isOpen,
  onOpenChange,
  deleteContentId,
  deleteContentTitle,
  handleContentDelete,
}: {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  deleteContentId: string | null;
  deleteContentTitle: string;
  handleContentDelete: (id: string) => void;
}) => {
  const [confirm, setConfirm] = useState("");

  const handleSubmit = () => {
    if (confirm === deleteContentTitle) {
      handleContentDelete(deleteContentId!);
      setConfirm("");
      onOpenChange(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>Delete Content</ModalHeader>
            <ModalBody>
              <p>
                This action is irreversible. Type{" "}
                <b>&quot;{deleteContentTitle}&quot;</b> to confirm.
              </p>
              <Input
                label="Confirm Title"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </ModalBody>
            <ModalFooter>
              <Button
                color="danger"
                isDisabled={confirm !== deleteContentTitle}
                onPress={handleSubmit}
              >
                Delete Content
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
