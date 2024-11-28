"use client";
import { Link } from "@nextui-org/link";
import { button as buttonStyles } from "@nextui-org/theme";

import { siteConfig } from "@/config/site";
import { title, subtitle } from "@/components/primitives";
import { Rocket } from "lucide-react";
import { useAuth } from "@/context/authContext";

import Image from "next/image";

export default function Home() {
  const { user } = useAuth();

  return (
    <>
      <section className="flex flex-col-reverse md:flex-row items-center justify-center gap-4 pt-8">
        <div className="inline-block max-w-xl text-center md:text-left">
          <span className={title()}>Unlock Your&nbsp;</span>
          <span className={title({ color: "blue" })}>Potential&nbsp;</span>
          <br />
          <span className={title()}>One Course at a Time</span>
          <div className={subtitle({ class: "mt-4" })}>
            Discover New Skills, Achieve New Goals with Sigma Academy.
          </div>
          <div className="flex gap-3 mt-4 justify-center md:justify-start">
            <Link
              isExternal
              className={buttonStyles({ color: "primary" })}
              href={siteConfig.links.docs}
            >
              Join for Free
            </Link>
            <Link
              isExternal
              className={buttonStyles({ variant: "bordered" })}
              href={siteConfig.links.github}
            >
              <Rocket size={16} />
              Explore
            </Link>
          </div>
        </div>

        <div className="flex justify-center md:justify-end">
          <Image
            src="/landing-unregistered-hero.webp"
            alt="Hero Image"
            className=" h-auto"
            width={500}
            height={300}
          />
        </div>
      </section>
    </>
  );
}
