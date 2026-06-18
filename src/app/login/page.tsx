import Link from "next/link";
import { PendingSubmitButton } from "@/components/pending-submit-button";
import { login } from "./actions";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
    next?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <form
        action={login}
        className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-8 shadow-sm"
      >
        <div className="mb-8">
          <p className="text-sm font-medium text-slate-500">HostOp Trial</p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-950">Log in</h1>
        </div>
        <input type="hidden" name="next" value={params.next ?? "/dashboard"} />
        <label className="block text-sm font-medium text-slate-700" htmlFor="email">
          Email
        </label>
        <input
          className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-950 outline-none focus:border-slate-950"
          id="email"
          name="email"
          type="email"
          required
        />
        <label
          className="mt-4 block text-sm font-medium text-slate-700"
          htmlFor="password"
        >
          Password
        </label>
        <input
          className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-950 outline-none focus:border-slate-950"
          id="password"
          name="password"
          type="password"
          required
          minLength={6}
        />
        {params.error ? (
          <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {params.error}
          </p>
        ) : null}
        <PendingSubmitButton
          className="mt-6 w-full rounded-md bg-slate-950 px-4 py-2 font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          pendingChildren="Logging in..."
        >
          Log in
        </PendingSubmitButton>
        <p className="mt-6 text-center text-sm text-slate-600">
          Need an account?{" "}
          <Link className="font-medium text-slate-950 underline" href="/signup">
            Sign up
          </Link>
        </p>
      </form>
    </main>
  );
}
