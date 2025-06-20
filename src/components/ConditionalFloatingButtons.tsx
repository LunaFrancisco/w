"use client";

import { useSession } from "next-auth/react";
import FloatingCartButton from "./FloatingCartButton";
import AdminNavigation from "./AdminNavigation";
import FloatingUserButton from "./FloatingUserButton";

export default function ConditionalFloatingButtons() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return null;
  }

  if (!session?.user) {
    return null;
  }

  // Show FloatingCartButton for CLIENT users
  if (session.user.role === "CLIENT") {

    return (
      <>
      <FloatingUserButton/>
      <FloatingCartButton />
      </>
    );
  }
  if (session.user.role === "ADMIN") {
    return <AdminNavigation />
  }

  // Don't show any button for other roles or unauthenticated users
  return null;
}