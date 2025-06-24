"use client";

import { usePathname } from "next/navigation";
// import NavigationClient from '@/components/NavigationClient'
import FloatingHeader from "./FloatingHeader";

export default function ConditionalNavigation() {
  const pathname = usePathname();

  // Don't render navigation on admin routes
  if (pathname.startsWith("/admin") || pathname.startsWith("/auth") || pathname.startsWith("/terminos-condiciones") || pathname.startsWith("/politica-privacidad")) {
    return null;
  }

  return (
    <>
      <FloatingHeader />
    </>
  );
}
