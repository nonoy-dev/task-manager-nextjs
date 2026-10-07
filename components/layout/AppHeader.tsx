import Link from "next/link";
import { cookies } from "next/headers";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { AppHeaderNav } from "@/components/layout/AppHeaderNav";
import { SESSION_COOKIE_NAME } from "@/lib/auth/sessionCookie";

export async function AppHeader() {
  const cookieStore = await cookies();
  const isLoggedIn = cookieStore.has(SESSION_COOKIE_NAME);

  return (
    <header className="border-b border-foreground/10 px-6 py-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-lg font-semibold">
            Task Manager
          </Link>
          {isLoggedIn ? <AppHeaderNav /> : null}
        </div>
        {isLoggedIn ? <LogoutButton /> : null}
      </div>
    </header>
  );
}
