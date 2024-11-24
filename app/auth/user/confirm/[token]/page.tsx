"use client";

import { Logo } from "@/components/icons";
import { Card, CardBody } from "@nextui-org/card";
import { Button } from "@nextui-org/button";
import Link from "next/link";
import axios from "axios";
import { useEffect, useState } from "react";

export default function UserMailVerification({
  params,
}: {
  params: { token: string };
}) {
  const { token } = params;
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    const verifyToken = async () => {
      if (!isLoading) {
        setIsLoading(true);
        try {
          const response = await axios.get(
            `/api/auth/user/confirm?token=${token}`
          );
          if (response.status === 200) {
            setIsLoading(false);
            setIsVerified(true);
          }
        } catch (error) {
          setTimeout(() => {
            window.location.href = "not-found";
          }, 2000);
        }
      }
    };

    verifyToken();
  }, [token]);

  return (
    <div className="w-full flex flex-col min-h-full items-center justify-center pad-x">
      {isLoading ? (
        <div className="animate-pulse">
          <Logo />
        </div>
      ) : (
        <>
          {isVerified ? (
            <>
              <div className="flex">
                <Logo />
                <p className="font-bold ml-2">Sigma</p>
              </div>
              <div className="mt-8">
                <h1 className="font-bold text-2xl">
                  Your Account Has Been Verified!
                </h1>
              </div>
              <div className="mt-4 max-w-md w-full">
                <Card>
                  <CardBody className="text-center">
                    <p className="font-semibold">Welcome aboard!</p>
                    <p>
                      Your email has been successfully verified. Now you can
                      enjoy all the features we offer and start creating amazing
                      experiences.
                    </p>
                    <Link href="../login" passHref>
                      <Button className="mt-4 w-full">Login Now!</Button>
                    </Link>
                  </CardBody>
                </Card>
              </div>
            </>
          ) : null}
        </>
      )}
    </div>
  );
}
