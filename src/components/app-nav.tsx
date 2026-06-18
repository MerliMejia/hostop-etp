"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export function AppNav() {
  const searchParams = useSearchParams();
  const query = searchParams.toString() ? `?${searchParams.toString()}` : "";

  return (
    <nav className="flex items-center gap-2">
      <Link
        className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
        href={`/dashboard${query}`}
      >
        Dashboard
      </Link>
      <Link
        className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
        href={`/reservations${query}`}
      >
        Reservations
      </Link>
    </nav>
  );
}
