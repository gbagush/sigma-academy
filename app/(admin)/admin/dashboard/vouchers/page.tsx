"use client";

import { useToast } from "@/hooks/use-toast";
import { Button } from "@nextui-org/button";
import { DatePicker } from "@nextui-org/date-picker";
import { Input } from "@nextui-org/input";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/modal";
import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
} from "@nextui-org/table";
import axios from "axios";
import { Pencil, Percent, Plus, Search, Trash } from "lucide-react";
import { useEffect, useState } from "react";

interface Voucher {
  _id: string;
  type: string;
  creatorId: string;
  code: string;
  discount: number;
  createdAt: string;
  updatedAt: string;
  expirationDate: string;
}

export default function VoucherPage() {
  const addVoucherModal = useDisclosure();
  const editVoucherModal = useDisclosure();
  const deleteVoucherModal = useDisclosure();
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);

  const [searchQuery, setSearchQuery] = useState("");

  const { toast } = useToast();

  const fetchVouchers = async () => {
    try {
      const response = await axios.get("/api/mods/voucher");

      setVouchers(response.data.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast({
          title: "Failed get vouchers",
          description: error.response?.data.message || "An error occurred.",
        });
      } else {
        toast({
          title: "Failed get vouchers",
          description: "Network error. Please try again.",
        });
      }
    }
  };

  const handleEditClick = (voucher: Voucher) => {
    setSelectedVoucher(voucher);
    editVoucherModal.onOpen();
  };

  const handleDeleteClick = (voucher: Voucher) => {
    setSelectedVoucher(voucher);
    deleteVoucherModal.onOpen();
  };

  const filteredVouchers = vouchers.filter((voucher) =>
    voucher.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    fetchVouchers();
  }, []);

  return (
    <div>
      <h1 className="text-2xl my-4">Voucher Dashboard</h1>

      <div className="flex w-full justify-end gap-4">
        <Input
          className="max-w-sm"
          startContent={<Search className="text-foreground/75" size={16} />}
          placeholder="Search by code"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Button onClick={addVoucherModal.onOpen}>
          <Plus size={16} /> Create Voucher
        </Button>
      </div>

      <Table aria-label="Voucher Table" className="mt-4">
        <TableHeader>
          <TableColumn>Created At</TableColumn>
          <TableColumn>Code</TableColumn>
          <TableColumn>Discount</TableColumn>
          <TableColumn>Expired At</TableColumn>
          <TableColumn>Action</TableColumn>
        </TableHeader>
        <TableBody>
          {filteredVouchers.map((voucher) => (
            <TableRow key={voucher._id}>
              <TableCell>
                {new Date(voucher.createdAt).toLocaleString()}
              </TableCell>
              <TableCell>{voucher.code}</TableCell>
              <TableCell>{voucher.discount.toFixed(0)}%</TableCell>
              <TableCell>
                {new Date(voucher.expirationDate).toLocaleString()}
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    isIconOnly
                    size="sm"
                    onClick={() => handleEditClick(voucher)}
                  >
                    <Pencil size={16} />
                  </Button>
                  <Button
                    isIconOnly
                    size="sm"
                    onClick={() => handleDeleteClick(voucher)}
                  >
                    <Trash size={16} />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AddVoucherModal
        isOpen={addVoucherModal.isOpen}
        onOpenChange={addVoucherModal.onOpenChange}
        fetchVouchers={fetchVouchers}
      />

      {selectedVoucher && (
        <EditVoucherModal
          isOpen={editVoucherModal.isOpen}
          onOpenChange={editVoucherModal.onOpenChange}
          fetchVouchers={fetchVouchers}
          voucher={selectedVoucher}
          onClose={() => {
            setSelectedVoucher(null);
            editVoucherModal.onClose();
          }}
        />
      )}

      {selectedVoucher && (
        <DeleteVoucherModal
          isOpen={deleteVoucherModal.isOpen}
          onOpenChange={deleteVoucherModal.onOpenChange}
          fetchVouchers={fetchVouchers}
          voucher={selectedVoucher}
          onClose={() => {
            setSelectedVoucher(null);
            deleteVoucherModal.onClose();
          }}
        />
      )}
    </div>
  );
}

const AddVoucherModal = ({
  isOpen,
  onOpenChange,
  fetchVouchers,
}: {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  fetchVouchers: () => void;
}) => {
  const [voucherData, setVoucherData] = useState({
    code: "",
    discount: "",
    expirationDate: "",
  });

  const { toast } = useToast();

  const handleSubmit = async () => {
    if (
      !voucherData.code ||
      !voucherData.discount ||
      !voucherData.expirationDate
    ) {
      toast({
        title: "Failed create voucher",
        description: "Please fill in all fields",
      });
    }

    if (
      !(parseInt(voucherData.discount) > 0) ||
      !(parseInt(voucherData.discount) < 90)
    ) {
      toast({
        title: "Failed create voucher",
        description: "Discount must greather than 0 and less than 90",
      });
    }

    try {
      const result = await axios.post("/api/mods/voucher", {
        code: voucherData.code.toUpperCase(),
        discount: parseInt(voucherData.discount),
        expirationDate: voucherData.expirationDate,
      });

      toast({
        title: "Success create voucher",
        description: result.data.message,
      });

      onOpenChange(false);
      fetchVouchers();
      setVoucherData({ code: "", discount: "", expirationDate: "" });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast({
          title: "Failed create voucher",
          description: error.response?.data.message || "An error occurred.",
        });
      } else {
        toast({
          title: "Failed create voucher",
          description: "Network error. Please try again.",
        });
      }
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Create Voucher
            </ModalHeader>
            <ModalBody>
              <Input
                type="text"
                label="Code"
                value={voucherData.code}
                onChange={(e) =>
                  setVoucherData({ ...voucherData, code: e.target.value })
                }
              />
              <Input
                type="number"
                label="Discount"
                value={voucherData.discount}
                onChange={(e) =>
                  setVoucherData({ ...voucherData, discount: e.target.value })
                }
                endContent={<Percent size={16} />}
              />
              <Input
                type="date"
                label="Expiration Date"
                value={voucherData.expirationDate}
                onChange={(e) =>
                  setVoucherData({
                    ...voucherData,
                    expirationDate: e.target.value,
                  })
                }
              />
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                Close
              </Button>
              <Button color="primary" onPress={handleSubmit}>
                Create
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

const EditVoucherModal = ({
  isOpen,
  onOpenChange,
  fetchVouchers,
  voucher,
  onClose,
}: {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  fetchVouchers: () => void;
  voucher: Voucher;
  onClose: () => void;
}) => {
  const [voucherData, setVoucherData] = useState({
    code: voucher.code,
    discount: voucher.discount.toString(),
    expirationDate: voucher.expirationDate.split("T")[0],
  });

  const { toast } = useToast();

  const handleSubmit = async () => {
    if (
      !voucherData.code ||
      !voucherData.discount ||
      !voucherData.expirationDate
    ) {
      toast({
        title: "Failed to update voucher",
        description: "Please fill in all fields",
      });
      return;
    }

    if (
      !(parseInt(voucherData.discount) > 0) ||
      !(parseInt(voucherData.discount) < 90)
    ) {
      toast({
        title: "Failed to update voucher",
        description: "Discount must be greater than 0 and less than 90",
      });
      return;
    }

    try {
      await axios.put(`/api/mods/voucher/${voucher._id}`, {
        code: voucherData.code.toUpperCase(),
        discount: parseInt(voucherData.discount),
        expirationDate: voucherData.expirationDate,
      });

      toast({
        title: "Success update voucher",
        description: "The voucher has been successfully updated.",
      });

      onClose();
      fetchVouchers();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast({
          title: "Failed to update voucher",
          description: error.response?.data.message || "An error occurred.",
        });
      } else {
        toast({
          title: "Failed to update voucher",
          description: "Network error. Please try again.",
        });
      }
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Edit Voucher
            </ModalHeader>
            <ModalBody>
              <Input
                type="number"
                label="Discount"
                value={voucherData.discount}
                onChange={(e) =>
                  setVoucherData({ ...voucherData, discount: e.target.value })
                }
                endContent={<Percent size={16} />}
              />
              <Input
                type="date"
                label="Expiration Date"
                value={voucherData.expirationDate}
                onChange={(e) =>
                  setVoucherData({
                    ...voucherData,
                    expirationDate: e.target.value,
                  })
                }
              />
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                Close
              </Button>
              <Button color="primary" onPress={handleSubmit}>
                Update
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

const DeleteVoucherModal = ({
  isOpen,
  onOpenChange,
  fetchVouchers,
  voucher,
  onClose,
}: {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  fetchVouchers: () => void;
  voucher: Voucher;
  onClose: () => void;
}) => {
  const [inputCode, setInputCode] = useState("");

  const { toast } = useToast();

  const handleDelete = async () => {
    if (inputCode !== voucher.code) {
      toast({
        title: "Confirmation failed",
        description: "The voucher code does not match.",
      });
      return;
    }

    try {
      await axios.delete(`/api/mods/voucher/${voucher._id}`);
      toast({
        title: "Success",
        description: "The voucher has been successfully deleted.",
      });
      fetchVouchers();
      onClose();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast({
          title: "Failed to delete voucher",
          description: error.response?.data.message || "An error occurred.",
        });
      } else {
        toast({
          title: "Failed to delete voucher",
          description: "Network error. Please try again.",
        });
      }
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Delete Voucher
            </ModalHeader>
            <ModalBody>
              <p>
                Type the voucher <b>&quote;{voucher.code}&quote;</b> to confirm
                deletion:
              </p>
              <Input
                type="text"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
              />
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                Cancel
              </Button>
              <Button color="primary" onPress={handleDelete}>
                Confirm Delete
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
