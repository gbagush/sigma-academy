"use client";

import { Logo } from "@/components/icons";
import { Card, CardBody } from "@nextui-org/card";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/authContext";
import axios from "axios";

export default function AdminLoginVerification({
  params,
}: {
  params: { token: string };
}) {
  const { token } = params;
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const { setToken, setRole } = useAuth();

  useEffect(() => {
    const verifyToken = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(
          `/api/auth/admin/login?token=${token}`
        );
        console.log("Response:", response);

        if (response.status === 200 && response.data.token) {
          setToken(response.data.token);
          setRole("admin");
          setIsVerified(true);
          setTimeout(() => {
            window.location.href = "/";
          }, 1000);
        }
      } catch (error) {
        console.error("Error during token verification:", error);
        setTimeout(() => {
          window.location.href = "not-found";
        }, 2000);
      } finally {
        setIsLoading(false);
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
                <h1 className="font-bold text-2xl">Login Successfully!</h1>
              </div>
              <div className="mt-4 max-w-md w-full">
                <Card>
                  <CardBody className="text-center">
                    <p className="font-semibold">Welcome aboard!</p>
                    <p>
                      Your login was successful! You&apos;ll be redirected to
                      your dashboard in just a moment.
                    </p>
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
