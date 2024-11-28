"use client";

import { type LucideIcon } from "lucide-react";

import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import Link from "next/link";

export function SidebarItemSingle({
  item,
}: {
  item: {
    title: string;
    url: string;
    icon: LucideIcon;
  };
}) {
  return (
    <SidebarMenuItem key={item.title}>
      <SidebarMenuButton asChild>
        <Link href={item.url}>
          <item.icon />
          <span>{item.title}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
