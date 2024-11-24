"use client";
import Link from "next/link";
import { Button } from "@nextui-org/button";

export default function NotFound() {
  return (
    <div className="w-full flex flex-col min-h-full items-center justify-center pad-x">
      <h1 className="text-9xl font-extrabold text-foreground/20">404</h1>
      <p className="text-center font-medium pt-2 pb-5">
        Sorry, you can&apos;t find the page you&apos;re looking for.
      </p>
      <Button as={Link} href="/" variant="flat">
        Try Again!
      </Button>
    </div>
  );
}
