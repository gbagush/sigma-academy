"use client";

import { use, useState } from "react";
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
import { Avatar } from "@nextui-org/avatar";
import { Chip } from "@nextui-org/chip";
import Link from "next/link";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function InstructorDashboard() {
  const filterModal = useDisclosure();
  const userDetailsModal = useDisclosure();

  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);

  const [filters, setFilters] = useState({
    id: "",
    firstName: "",
    lastName: "",
    email: "",
    username: "",
  });

  const [order, setOrder] = useState("newest");

  const [selectedInstructor, setSelectedInstructor] = useState<any>(null);

  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...filters,
    sort: order,
  }).toString();

  const { data, error } = useSWR(
    `/api/mods/instructor?${queryParams}`,
    fetcher,
    {
      keepPreviousData: true,
    }
  );

  if (error) return <div>Error loading instructors</div>;

  return (
    <div>
      <h1 className="text-2xl my-4">Instructor Dashboard</h1>

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
            <DropdownItem key="newest" onClick={() => setOrder("newest")}>
              Newest
            </DropdownItem>
            <DropdownItem key="oldest" onClick={() => setOrder("oldest")}>
              Oldest
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>

      <Table
        aria-label="Instructor table"
        className="mt-4"
        bottomContent={
          data && (
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
          )
        }
      >
        <TableHeader>
          <TableColumn>Picture</TableColumn>
          <TableColumn>First Name</TableColumn>
          <TableColumn>Last Name</TableColumn>
          <TableColumn>Username</TableColumn>
          <TableColumn>Email</TableColumn>
          <TableColumn>Action</TableColumn>
        </TableHeader>
        <TableBody>
          {data?.data.map((instructor: any) => (
            <TableRow key={instructor._id}>
              <TableCell>
                <Avatar radius="sm" src={instructor.profilePicture} />
              </TableCell>
              <TableCell>{instructor.firstName}</TableCell>
              <TableCell>{instructor.lastName}</TableCell>
              <TableCell>
                {instructor.username ? `@${instructor.username}` : ""}
              </TableCell>
              <TableCell>{instructor.email}</TableCell>
              <TableCell>
                <Button
                  isIconOnly
                  size="sm"
                  onPress={() => {
                    setSelectedInstructor(instructor);
                    userDetailsModal.onOpen();
                  }}
                >
                  <Eye size={16} />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <span className="text-foreground/75">
        Showing {data?.data.length} out of {data?.totalCount} instructors
      </span>

      <FilterModal
        isOpen={filterModal.isOpen}
        onOpenChange={filterModal.onOpenChange}
        filters={filters}
        setFilters={setFilters}
      />

      <InstructorDetailsModal
        isOpen={userDetailsModal.isOpen}
        onOpenChange={userDetailsModal.onOpenChange}
        instructor={selectedInstructor}
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
      firstName: "",
      lastName: "",
      email: "",
      username: "",
    });
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">Filter</ModalHeader>
            <ModalBody>
              <Input
                label="User ID"
                value={filters.id}
                onChange={(e) => setFilters({ ...filters, id: e.target.value })}
              />
              <Input
                label="First Name"
                value={filters.firstName}
                onChange={(e) =>
                  setFilters({ ...filters, firstName: e.target.value })
                }
              />
              <Input
                label="Last Name"
                value={filters.lastName}
                onChange={(e) =>
                  setFilters({ ...filters, lastName: e.target.value })
                }
              />
              <Input
                label="Email"
                value={filters.email}
                onChange={(e) =>
                  setFilters({ ...filters, email: e.target.value })
                }
              />
              <Input
                label="Username"
                value={filters.username}
                onChange={(e) =>
                  setFilters({ ...filters, username: e.target.value })
                }
              />
            </ModalBody>
            <ModalFooter>
              <Button
                color="danger"
                variant="light"
                onPress={handleClearFilters}
              >
                Clear
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

const InstructorDetailsModal = ({
  isOpen,
  onOpenChange,
  instructor,
}: {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  instructor: any;
}) => {
  if (!instructor) return null;

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
              User Details
            </ModalHeader>
            <ModalBody className="gap-4">
              <Avatar radius="sm" src={instructor.profilePicture} />
              <div className="flex gap-4">
                <Input
                  label="First Name"
                  value={instructor.firstName}
                  isReadOnly
                />
                <Input
                  label="Last Name"
                  value={instructor.lastName}
                  isReadOnly
                />
              </div>
              <Input label="Email" value={instructor.email} isReadOnly />
              <Input label="Username" value={instructor.username} isReadOnly />
              <Input
                label="Registered At"
                value={new Date(instructor.registerAt).toLocaleString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                  hour12: false,
                })}
                isReadOnly
              />
              <Textarea
                label="Description"
                value={instructor.description}
                isReadOnly
              />

              {instructor.socials?.map((social: any, index: number) => (
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
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                Close
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
