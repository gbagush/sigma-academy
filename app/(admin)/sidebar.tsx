"use client";

import * as React from "react";
import {
  AudioWaveform,
  Command,
  GalleryVerticalEnd,
  Presentation,
  User,
  LibraryBig,
  ArrowLeftRight,
  Home,
  TicketPercent,
  MessageSquareWarning,
} from "lucide-react";

import { NavUser } from "@/components/navigations/sidebar/sidebar-user";
import { TeamSwitcher } from "@/components/shared/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarRail,
} from "@/components/ui/sidebar";
import { SidebarItemGroup } from "@/components/navigations/sidebar/item-group";
import { SidebarItemSingle } from "@/components/navigations/sidebar/item-single";
import { useAuth } from "@/context/authContext";
import { SidebarBrand } from "@/components/navigations/sidebar/sidebar-brand";

const baseUrl = "/admin/dashboard";

const sidebarItems = [
  {
    title: "Users",
    url: `${baseUrl}/users`,
    icon: User,
  },
  {
    title: "Instructors",
    url: "#",
    icon: Presentation,
    items: [
      {
        title: "Applications",
        url: `${baseUrl}/instructors/applications`,
      },
      {
        title: "Instructors",
        url: `${baseUrl}/instructors`,
      },
      {
        title: "Withdrawal",
        url: `${baseUrl}/instructors/withdrawal`,
      },
    ],
  },
  {
    title: "Vouchers",
    url: `${baseUrl}/vouchers`,
    icon: TicketPercent,
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, logout } = useAuth();

  const [userData, setUserData] = React.useState(() => ({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    profilePicture: "",
  }));

  React.useEffect(() => {
    if (user) {
      setUserData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        username: user.username || "",
        email: user.email || "",
        profilePicture: user.profilePicture || "",
      });
    }
  }, [user]);

  const onLogout = () => {
    logout();
    window.location.reload;
  };

  const onProfile = () => {
    window.location.href = `${baseUrl}/profile`;
  };

  return (
    <Sidebar collapsible="icon" {...props} className="z-50">
      <SidebarHeader>
        <SidebarBrand subtitle="Admin" />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Platform</SidebarGroupLabel>
          <SidebarMenu>
            {sidebarItems.map((item, index) =>
              item.items && item.items.length > 0 ? (
                <SidebarItemGroup key={index} item={item} />
              ) : (
                <SidebarItemSingle key={index} item={item} />
              )
            )}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        {user ? (
          <NavUser
            user={{
              name: `${userData.firstName} ${userData.lastName}`,
              email: userData.username
                ? `@${userData.username}`
                : userData.email,
              avatar: userData.profilePicture
                ? userData.profilePicture
                : `https://api.dicebear.com/9.x/initials/svg?seed=${user.firstName}`,
            }}
            onProfile={onProfile}
            onLogout={onLogout}
          />
        ) : (
          <NavUser
            user={{
              name: "Loading",
              email: "loading user data",
              avatar: `https://api.dicebear.com/9.x/initials/svg?seed=admin`,
            }}
            onProfile={onProfile}
            onLogout={onLogout}
          />
        )}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
