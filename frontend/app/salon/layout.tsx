"use client";

import { ReactNode, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getRole, getToken } from "../lib/auth";

type Props = {
  children: ReactNode;
};

export default function SalonLayout({ children }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const token = getToken();
  const role = getRole();
  const isAuthorized = Boolean(token && role && (role === "salon_owner" || role === "staff"));

  useEffect(() => {
    if (!token || !role) {
      router.replace("/");
      return;
    }

    if (role !== "salon_owner" && role !== "staff") {
      router.replace("/cift");
    }
  }, [pathname, role, router, token]);

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}
