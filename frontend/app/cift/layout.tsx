"use client";

import { ReactNode, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getRole, getToken } from "../lib/auth";

type Props = {
  children: ReactNode;
};

type Gate = "checking" | "in" | "out";

export default function CiftLayout({ children }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [gate, setGate] = useState<Gate>("checking");

  useEffect(() => {
    const token = getToken();
    const role = getRole();

    if (!token || !role) {
      setGate("out");
      router.replace("/");
      return;
    }

    if (role === "salon_owner" || role === "staff") {
      setGate("out");
      router.replace("/salon");
      return;
    }

    setGate("in");
  }, [pathname, router]);

  if (gate !== "in") {
    return <div className="min-h-screen w-full bg-background" aria-busy="true" />;
  }

  return <>{children}</>;
}
