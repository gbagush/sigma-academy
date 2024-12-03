"use client";

import { useState } from "react";

import {
  Navbar as NextUINavbar,
  NavbarContent,
  NavbarMenu,
  NavbarMenuToggle,
  NavbarBrand,
  NavbarItem,
  NavbarMenuItem,
} from "@nextui-org/navbar";
import { Button } from "@nextui-org/button";
import { Link } from "@nextui-org/link";
import { Input } from "@nextui-org/input";
import { link as linkStyles } from "@nextui-org/theme";
import NextLink from "next/link";
import clsx from "clsx";

import { siteConfig } from "@/config/site";
import { ThemeSwitch } from "@/components/theme-switch";
import { SearchIcon, Logo } from "@/components/icons";
import { useAuth } from "@/context/authContext";
import { User } from "@nextui-org/user";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownSection,
  DropdownItem,
} from "@nextui-org/dropdown";
import { Skeleton } from "@nextui-org/skeleton";
import { Avatar } from "@nextui-org/avatar";
import { charLimit, wordLimit } from "@/lib/utils";
import { useRouter } from "next/navigation";

export const Navbar = () => {
  const { user, role, status, logout } = useAuth();

  const [keyword, setKeyword] = useState("");
  const router = useRouter();

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (keyword.trim()) {
      router.push(`/search?keyword=${encodeURIComponent(keyword)}`);
    }
  };

  const searchInput = (
    <form className="w-full" onSubmit={handleSearchSubmit}>
      <div className="flex w-full items-center gap-2">
        <Input
          aria-label="Search"
          classNames={{
            inputWrapper: "bg-default-100",
            input: "text-sm",
          }}
          labelPlacement="outside"
          placeholder="What do you want to learn?"
          startContent={
            <SearchIcon className="text-base text-default-400 pointer-events-none flex-shrink-0" />
          }
          type="search"
          onChange={(e) => setKeyword(e.target.value)}
        />
        <Button
          type="submit"
          variant="faded"
          className="border-none text-foreground/75"
        >
          Search
        </Button>
      </div>
    </form>
  );

  return (
    <NextUINavbar maxWidth="xl" position="sticky">
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarBrand as="li" className="gap-3 max-w-fit">
          <NextLink className="flex justify-start items-center gap-1" href="/">
            <Logo />
            <p className="font-bold text-inherit">Sigma</p>
          </NextLink>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent
        className="hidden sm:flex basis-1/3 sm:basis-full"
        justify="center"
      >
        <NavbarItem className="hidden lg:flex max-w-md w-full">
          {searchInput}
        </NavbarItem>
      </NavbarContent>

      <NavbarContent
        className="hidden sm:flex basis-1/5 sm:basis-full"
        justify="end"
      >
        <NavbarItem className="hidden sm:flex gap-2">
          <ThemeSwitch />
        </NavbarItem>
        <NavbarItem className="hidden md:flex">
          {status === "loading" ? (
            <Skeleton className="flex rounded-full w-10 h-10" />
          ) : status === "login" && user ? (
            <Dropdown placement="bottom-start">
              <DropdownTrigger>
                <Avatar
                  src={
                    user.profilePicture
                      ? user.profilePicture
                      : `https://api.dicebear.com/9.x/initials/svg?seed=${user.firstName}`
                  }
                />
              </DropdownTrigger>
              <DropdownMenu aria-label="User Actions" className="p-3">
                <DropdownSection aria-label="personal" showDivider>
                  <DropdownItem isReadOnly>
                    <User
                      name={wordLimit(`${user.firstName} ${user.lastName}`, 3)}
                      description={
                        user.username
                          ? `@${user.username}`
                          : charLimit(user.email, 15)
                      }
                      avatarProps={{
                        src: user.profilePicture
                          ? user.profilePicture
                          : `https://api.dicebear.com/9.x/initials/svg?seed=${user.firstName}`,
                      }}
                    />
                  </DropdownItem>
                  <DropdownItem
                    as={Link}
                    key="settings"
                    href={
                      role == "user"
                        ? "/auth/user/profile"
                        : `/${role}/dashboard/profile`
                    }
                  >
                    Profile
                  </DropdownItem>

                  {role == "user" ? (
                    <DropdownItem as={Link} key="my-courses" href="/course/my">
                      My Courses
                    </DropdownItem>
                  ) : (
                    <DropdownItem className="hidden"></DropdownItem>
                  )}

                  {role == "user" ? (
                    <DropdownItem
                      as={Link}
                      key="transaction"
                      href="/transaction"
                    >
                      Transaction
                    </DropdownItem>
                  ) : role == "admin" ? (
                    <DropdownItem
                      as={Link}
                      key="dashboard"
                      href={`/admin/dashboard/`}
                    >
                      Dashboard
                    </DropdownItem>
                  ) : (
                    <DropdownItem
                      as={Link}
                      key="dashboard"
                      href={`/instructor/dashboard/courses`}
                    >
                      Dashboard
                    </DropdownItem>
                  )}
                </DropdownSection>

                <DropdownItem
                  key="logout"
                  color="danger"
                  onClick={() => {
                    logout();
                  }}
                >
                  Log Out
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          ) : (
            <Button
              as={Link}
              className="text-sm font-normal text-default-600 bg-default-100"
              href="/auth/user/login"
              variant="flat"
            >
              Login
            </Button>
          )}
        </NavbarItem>
      </NavbarContent>

      <NavbarContent className="sm:hidden basis-1 pl-4" justify="end">
        <ThemeSwitch />
        <NavbarMenuToggle />
      </NavbarContent>

      <NavbarMenu>
        {searchInput}
        <div className="mx-4 mt-2 flex flex-col gap-2">
          {status === "logout" ? (
            <NavbarMenuItem>
              <Link color="primary" href="/auth/user/login" size="lg">
                Login
              </Link>
            </NavbarMenuItem>
          ) : (
            <>
              <NavbarMenuItem>
                <Link
                  color="foreground"
                  href={
                    role === "user"
                      ? "/auth/user/profile"
                      : `/${role}/dashboard/profile`
                  }
                  size="lg"
                >
                  Profile
                </Link>
              </NavbarMenuItem>
              {role === "user" ? (
                <NavbarMenuItem>
                  <Link color="foreground" href="/course/my" size="lg">
                    My Courses
                  </Link>
                </NavbarMenuItem>
              ) : (
                <></>
              )}

              {role === "user" ? (
                <NavbarMenuItem>
                  <Link color="foreground" href="/transaction" size="lg">
                    Transaction
                  </Link>
                </NavbarMenuItem>
              ) : (
                <NavbarMenuItem>
                  <Link
                    color="foreground"
                    href={`/${role}/dashboard`}
                    size="lg"
                  >
                    Dashboard
                  </Link>
                </NavbarMenuItem>
              )}
              <NavbarMenuItem>
                <Link color="danger" onClick={logout} size="lg">
                  Log Out
                </Link>
              </NavbarMenuItem>
            </>
          )}
        </div>
      </NavbarMenu>
    </NextUINavbar>
  );
};
