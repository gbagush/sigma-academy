"use client";
import Link from "next/link";
import { Button } from "@nextui-org/button";

export default function Forbidden() {
  return (
    <div className="w-full flex flex-col min-h-full items-center justify-center pad-x">
      <h1 className="text-9xl font-extrabold text-foreground/20">403</h1>
      <p className="text-center font-medium pt-2 pb-5">
        You don&apos;t have permission to access this page.
      </p>
      <Button as={Link} href="/" variant="flat">
        Go to Home
      </Button>
    </div>
  );
}
