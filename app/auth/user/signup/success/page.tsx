"use client";
import { Logo } from "@/components/icons";
import { Card, CardBody } from "@nextui-org/card";

export default function RegisterSuccess() {
  return (
    <div className="w-full flex flex-col min-h-full items-center justify-center pad-x">
      <div className="flex">
        <Logo />
        <p className="font-bold ml-2">Sigma</p>
      </div>
      <div className="mt-8">
        <h1 className="font-bold text-2xl">Sign Up Successfully!</h1>
      </div>
      <div className="mt-4 max-w-md w-full">
        <Card>
          <CardBody className="text-center">
            <p>
              Thank you for signing up! Please check your email inbox for a
              verification link. If you don't see it, please check your spam or
              junk folder.
            </p>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
