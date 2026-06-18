import { redirect } from "next/navigation";
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
      <button className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
        Log out
      </button>
    </form>
  );
}
