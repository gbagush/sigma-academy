"use client";

import axios from "axios";
import { useState } from "react";
import useSWR from "swr";
import {
  Dribbble,
  Eye,
  Figma,
  Filter,
  Github,
  Linkedin,
  LinkIcon,
  ExternalLink,
} from "lucide-react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@nextui-org/table";
import { Pagination } from "@nextui-org/pagination";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@nextui-org/dropdown";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/modal";
import { Input, Textarea } from "@nextui-org/input";
import { Button } from "@nextui-org/button";
import { Chip } from "@nextui-org/chip";
import { Logo } from "@/components/icons";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  const json = await res.json();

  if (!res.ok) {
    const error = new Error(json.message || "An error occurred");
    throw error;
  }

  return json;
};

export default function InstructorApplications() {
  const filterModal = useDisclosure();
  const applicationModal = useDisclosure();

  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);

  const [filters, setFilters] = useState({
    id: "",
    status: "",
  });

  const [order, setOrder] = useState("newest");

  const [selectedApplication, setSelectedApplication] = useState<any>(null);

  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...filters,
    sort: order,
  }).toString();

  const { data, error, isLoading } = useSWR(
    `/api/mods/instructor/application?${queryParams}`,
    fetcher,
    {
      keepPreviousData: false,
      onError: (err) => {
        console.error("Error fetching data:", err);
      },
      shouldRetryOnError: false,
    }
  );

  return (
    <div>
      <h1 className="text-2xl my-4">Instructor Applications</h1>

      <div className="flex gap-2 justify-end">
        <Button onPress={filterModal.onOpen} color="secondary">
          <Filter size={16} /> Filter
        </Button>

        <Dropdown>
          <DropdownTrigger>
            <Button color="secondary">{limit} per page</Button>
          </DropdownTrigger>
          <DropdownMenu aria-label="Static Actions">
            {[5, 10, 15, 20, 25].map((num) => (
              <DropdownItem key={num} onClick={() => setLimit(num)}>
                {num}
              </DropdownItem>
            ))}
          </DropdownMenu>
        </Dropdown>

        <Dropdown>
          <DropdownTrigger>
            <Button color="secondary">
              {order === "newest" ? "Newest" : "Oldest"}
            </Button>
          </DropdownTrigger>
          <DropdownMenu aria-label="Sort Order">
            <DropdownItem onClick={() => setOrder("newest")}>
              Newest
            </DropdownItem>
            <DropdownItem onClick={() => setOrder("oldest")}>
              Oldest
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>

      <Table
        aria-label="Instructor applications table"
        className="mt-4"
        bottomContent={
          data?.totalCount ? (
            <div className="flex w-full justify-center">
              <Pagination
                isCompact
                showControls
                showShadow
                color="primary"
                page={page + 1}
                total={Math.ceil(data.totalCount / limit)}
                onChange={(newPage) => setPage(newPage - 1)}
              />
            </div>
          ) : null
        }
      >
        <TableHeader>
          <TableColumn>Timestamp</TableColumn>
          <TableColumn>First Name</TableColumn>
          <TableColumn>Last Name</TableColumn>
          <TableColumn>Email</TableColumn>
          <TableColumn>Status</TableColumn>
          <TableColumn>Action</TableColumn>
        </TableHeader>
        <TableBody
          emptyContent={
            error ? (
              error.message
            ) : isLoading ? (
              <div className="flex w-full justify-center animate-pulse">
                <Logo />
              </div>
            ) : (
              "No applications found"
            )
          }
          items={data?.data || []}
        >
          {(application: any) => (
            <TableRow key={application._id}>
              <TableCell>
                {new Date(application.createdAt).toLocaleString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                })}
              </TableCell>
              <TableCell>{application.firstName}</TableCell>
              <TableCell>{application.lastName}</TableCell>
              <TableCell>{application.email}</TableCell>
              <TableCell>
                {application.status ? (
                  <Chip color="primary">{application.status}</Chip>
                ) : (
                  <Chip color="default">Pending</Chip>
                )}
              </TableCell>
              <TableCell>
                <Button
                  isIconOnly
                  size="sm"
                  onPress={() => {
                    setSelectedApplication(application);
                    applicationModal.onOpen();
                  }}
                >
                  <Eye size={16} />
                </Button>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {data?.data && (
        <span className="text-foreground/75">
          Showing {data.data.length} out of {data.totalCount} applications
        </span>
      )}

      <FilterModal
        isOpen={filterModal.isOpen}
        onOpenChange={filterModal.onOpenChange}
        filters={filters}
        setFilters={setFilters}
      />

      <ApplicationModal
        isOpen={applicationModal.isOpen}
        onOpenChange={applicationModal.onOpenChange}
        application={selectedApplication}
      />
    </div>
  );
}

const FilterModal = ({
  isOpen,
  onOpenChange,
  filters,
  setFilters,
}: {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  filters: any;
  setFilters: (filters: any) => void;
}) => {
  const handleClearFilters = () => {
    setFilters({
      id: "",
      status: "",
      email: "",
    });
    onOpenChange(false);
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">Filter</ModalHeader>
            <ModalBody>
              <Input
                label="Application ID"
                value={filters.id}
                onChange={(e) => setFilters({ ...filters, id: e.target.value })}
              />

              <Input
                label="Email"
                value={filters.email}
                onChange={(e) =>
                  setFilters({ ...filters, email: e.target.value })
                }
              />

              <Dropdown aria-label="Select Status">
                <DropdownTrigger>
                  <Button
                    color="secondary"
                    className="text-left justify-start w-full"
                  >
                    {filters.status || "Select Status"}
                  </Button>
                </DropdownTrigger>
                <DropdownMenu aria-label="Status Options">
                  {["", "pending", "approved", "rejected"].map(
                    (statusOption) => (
                      <DropdownItem
                        key={statusOption}
                        onClick={() =>
                          setFilters({ ...filters, status: statusOption })
                        }
                      >
                        {statusOption.charAt(0).toUpperCase() +
                          statusOption.slice(1) || "All"}
                      </DropdownItem>
                    )
                  )}
                </DropdownMenu>
              </Dropdown>
            </ModalBody>
            <ModalFooter>
              <Button
                color="danger"
                variant="light"
                onPress={handleClearFilters}
              >
                Clear Filters
              </Button>

              <Button
                color="primary"
                onPress={() => {
                  onClose();
                }}
              >
                Close
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

const ApplicationModal = ({
  isOpen,
  onOpenChange,
  application,
}: {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  application: any;
}) => {
  const [actionData, setActionData] = useState({
    token: "",
    status: "",
    reason: "",
  });

  const { toast } = useToast();

  if (!application) return null;

  const getSocialIcon = (type: string) => {
    switch (type) {
      case "linkedin":
        return <Linkedin size={16} />;
      case "github":
        return <Github size={16} />;
      case "dribbble":
        return <Dribbble size={16} />;
      case "figma":
        return <Figma size={16} />;
      case "link":
        return <LinkIcon size={16} />;
      default:
        return null;
    }
  };

  const handleActionSubmit = async () => {
    try {
      setActionData({
        ...actionData,
        token: application._id,
      });
      const response = await axios.put(
        `/api/mods/instructor/application`,
        actionData
      );

      toast({
        title: "Action successful!",
        description: response.data.message,
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast({
          title: "Action failed",
          description: error.response?.data.message || "An error occurred.",
        });
      } else {
        toast({
          title: "Action failed",
          description: "Network error. Please try again.",
        });
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      scrollBehavior="outside"
      size="2xl"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Application Details
            </ModalHeader>
            <ModalBody className="gap-4">
              <div className="flex gap-4">
                <Input
                  label="First Name"
                  value={application.firstName}
                  isReadOnly
                />
                <Input
                  label="Last Name"
                  value={application.lastName}
                  isReadOnly
                />
              </div>

              <Input label="Email" value={application.email} isReadOnly />

              <Textarea
                label="Description"
                value={application.description}
                isReadOnly
              />

              {application.socials?.map((social: any, index: number) => (
                <Input
                  key={index}
                  value={social.link}
                  startContent={getSocialIcon(social.type)}
                  endContent={
                    <Button
                      as={Link}
                      href={social.link}
                      target="_blank"
                      size="sm"
                      variant="light"
                      isIconOnly
                    >
                      <ExternalLink size={16} />
                    </Button>
                  }
                  isReadOnly
                />
              ))}

              <Input
                label="Status"
                value={application.status || "Pending"}
                isReadOnly
              />
              <Input
                label="Application ID"
                value={application._id}
                isReadOnly
              />

              {application.status === "pending" && (
                <>
                  <span>Action</span>
                  <Dropdown aria-label="Select Status">
                    <DropdownTrigger>
                      <Button
                        color="secondary"
                        className="text-left justify-start w-full"
                      >
                        {actionData.status.charAt(0).toUpperCase() +
                          actionData.status.slice(1) || "Select Status"}
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu aria-label="Status Options">
                      {["approved", "rejected"].map((statusOption) => (
                        <DropdownItem
                          key={statusOption}
                          onClick={() =>
                            setActionData({
                              ...actionData,
                              status: statusOption,
                            })
                          }
                        >
                          {statusOption.charAt(0).toUpperCase() +
                            statusOption.slice(1)}
                        </DropdownItem>
                      ))}
                    </DropdownMenu>
                  </Dropdown>
                </>
              )}

              {actionData.status == "rejected" && (
                <Input
                  label="Reason"
                  value={actionData.reason}
                  onChange={(e) =>
                    setActionData({ ...actionData, reason: e.target.value })
                  }
                />
              )}
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                Close
              </Button>
              {application.status === "pending" && (
                <>
                  <Button color="primary" onClick={handleActionSubmit}>
                    Submit Action
                  </Button>
                </>
              )}
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
