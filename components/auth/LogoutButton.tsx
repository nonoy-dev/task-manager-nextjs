"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { logout } from "@/lib/api/sessions";

export function LogoutButton() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);

    try {
      await logout();
    } catch {
      // Session may already be gone; still leave the app shell.
    } finally {
      router.push("/login");
      router.refresh();
      setIsLoggingOut(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isLoggingOut}
      className="rounded-md border border-foreground/20 px-3 py-1.5 text-sm hover:bg-foreground/5 disabled:opacity-50"
    >
      {isLoggingOut ? "ログアウト中..." : "ログアウト"}
    </button>
  );
}
