import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/LoginForm";
import { fetchSessionUser } from "@/lib/api/sessions.server";

export default async function LoginPage() {
  let isAuthenticated = false;

  try {
    await fetchSessionUser();
    isAuthenticated = true;
  } catch {
    isAuthenticated = false;
  }

  if (isAuthenticated) {
    redirect("/");
  }

  return (
    <main className="mx-auto w-full max-w-md p-8">
      <LoginForm />
    </main>
  );
}
