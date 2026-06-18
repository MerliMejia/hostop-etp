import { redirect } from "next/navigation";
import { PendingSubmitButton } from "./pending-submit-button";
import { createClient } from "@/lib/supabase-server";

export function LogoutButton() {
  async function logout() {
    "use server";

    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/login");
  }

  return (
    <form action={logout}>
      <PendingSubmitButton
        className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
        pendingChildren="Logging out..."
      >
        Log out
      </PendingSubmitButton>
    </form>
  );
}
