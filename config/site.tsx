import { Book, User, LayoutGrid } from "lucide-react";

export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "Sigma Academy",
  description: "Make beautiful websites regardless of your design experience.",
  navItems: [
    {
      label: "Courses",
      icon: <Book size={16} className="mr-2" />,
      href: "/courses",
    },
    {
      label: "Instructors",
      icon: <User size={16} className="mr-2" />,
      href: "/instructors",
    },
    {
      label: "Categories",
      icon: <LayoutGrid size={16} className="mr-2" />,
      href: "/categories",
    },
  ],
  navMenuItems: [
    {
      label: "Profile",
      href: "/profile",
    },
    {
      label: "Dashboard",
      href: "/dashboard",
    },
    {
      label: "Projects",
      href: "/projects",
    },
    {
      label: "Team",
      href: "/team",
    },
    {
      label: "Calendar",
      href: "/calendar",
    },
    {
      label: "Settings",
      href: "/settings",
    },
    {
      label: "Help & Feedback",
      href: "/help-feedback",
    },
    {
      label: "Logout",
      href: "/logout",
    },
  ],
  links: {
    github: "https://github.com/nextui-org/nextui",
    twitter: "https://twitter.com/getnextui",
    docs: "https://nextui.org",
    discord: "https://discord.gg/9b6yyZKmH4",
    sponsor: "https://patreon.com/jrgarciadev",
  },
};
