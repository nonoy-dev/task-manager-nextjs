"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { readApiClientError } from "@/lib/api/errors";
import { logout } from "@/lib/api/sessions";

export function LogoutButton() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogout() {
    setIsLoggingOut(true);
    setError(null);

    try {
      await logout();
      router.push("/login");
      router.refresh();
    } catch (logoutError) {
      setError(
        readApiClientError(logoutError, "ログアウトに失敗しました"),
      );
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleLogout}
        disabled={isLoggingOut}
        className="rounded-md border border-foreground/20 px-3 py-1.5 text-sm hover:bg-foreground/5 disabled:opacity-50"
      >
        {isLoggingOut ? "ログアウト中..." : "ログアウト"}
      </button>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
