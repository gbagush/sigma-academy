"use client";

import { Certificate } from "@/components/certificate";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@nextui-org/button";
import axios from "axios";
import { useEffect, useState } from "react";

export interface CertificateData {
  _id: string;
  code: string;
  createdAt: string;
  name: string;
  reciepentDetails: ReciepentDetails;
  courseDetails: CourseDetails;
  instructorDetails: InstructorDetails;
}

export interface ReciepentDetails {
  _id: string;
  firstName: string;
  lastName: string;
}

export interface CourseDetails {
  _id: string;
  title: string;
}

export interface InstructorDetails {
  _id: string;
  firstName: string;
  lastName: string;
}

export default function CertificatePage({
  params,
}: {
  params: { id: string };
}) {
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [certificateData, setCertificateData] = useState<CertificateData>();

  const { toast } = useToast();

  useEffect(() => {
    const fetchCertificate = async () => {
      try {
        const response = await axios.get(`/api/certificate/${params.id}`);
        setCertificateData(response.data.data);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          toast({
            title: "Failed getting certificate",
            description: error.response?.data.message || "An error occurred.",
          });
        } else {
          toast({
            title: "Failed getting certificate",
            description: "Network error. Please try again.",
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCertificate();
  }, [params.id]);

  const handleGenerateCertificate = async () => {
    if (certificateData) {
      setIsGenerating(true);
      const element = document.getElementById("certificate-container");
      if (element) {
        try {
          const html2PDF = (await import("jspdf-html2canvas")).default;
          await html2PDF(element, {
            jsPDF: {
              format: "a4",
              orientation: "landscape",
            },
            imageType: "image/jpeg",
            output: `certificate-${certificateData.code}.pdf`,
          });
        } catch (error) {
          console.error("Error generating PDF:", error);
        } finally {
          setIsGenerating(false);
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div
        id="certificate-container"
        className="w-[1122.5px] h-[793.7px] bg-black rounded-none shadow-xl overflow-hidden"
        style={{
          aspectRatio: "1122.5/793.7",
        }}
      >
        <div className="w-full h-full flex items-center justify-center border-8 border-white p-2">
          <div className="w-full h-full bg-dark border-2 border-white rounded-none flex items-center justify-center p-16">
            {certificateData && (
              <Certificate
                certificateData={{
                  id: certificateData.code,
                  recipient: certificateData.name,
                  title: certificateData.courseDetails.title,
                  date: `${new Date(certificateData.createdAt).toLocaleString(
                    "en-US",
                    {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    }
                  )}`,
                  instructor: `${certificateData.instructorDetails.firstName} ${certificateData.instructorDetails.lastName}`,
                }}
              />
            )}
          </div>
        </div>
      </div>

      <Button
        className="mt-6 bg-gradient-to-r from-blue-500 to-purple-500 text-white"
        onClick={handleGenerateCertificate}
        disabled={isGenerating}
      >
        {isGenerating ? "Generating..." : "Download Certificate"}
      </Button>
    </div>
  );
}
