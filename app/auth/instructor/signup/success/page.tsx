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
        <h1 className="font-bold text-2xl">
          Application Successfully Created!
        </h1>
      </div>
      <div className="mt-4 max-w-md w-full">
        <Card>
          <CardBody className="text-center">
            <p>
              Thank you for making the application! Please check your email
              inbox for further instructions and a verification link. If you
              don&apos;t see our email, kindly check your spam or junk folder to
              ensure you don&apos;t miss any important updates."
            </p>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
