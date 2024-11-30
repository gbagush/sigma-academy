"use client";

import React, { useState } from "react";

import { Tabs, Tab } from "@nextui-org/tabs";
import { Pencil, Presentation } from "lucide-react";
import CourseDetailsTab from "./details";
import CourseContentTabs from "./contents";

export default function CourseManagerPage({
  params,
}: {
  params: { id: string };
}) {
  const [activeTab, setActiveTab] = useState<React.Key>("details");

  return (
    <>
      <div className="flex w-full justify-center">
        <Tabs
          aria-label="Options"
          color="primary"
          variant="bordered"
          size="sm"
          onSelectionChange={(key: React.Key) => setActiveTab(key)}
        >
          <Tab
            key="details"
            title={
              <div className="flex items-center space-x-2">
                <Pencil size={16} />
                <span>Details</span>
              </div>
            }
          />
          <Tab
            key="contents"
            title={
              <div className="flex items-center space-x-2">
                <Presentation size={16} />
                <span>Contents</span>
              </div>
            }
          />
        </Tabs>
      </div>
      {activeTab === "details" && <CourseDetailsTab id={params.id} />}

      {activeTab === "contents" && <CourseContentTabs id={params.id} />}
    </>
  );
}
