"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

type PaginationControlsProps = {
  previousHref: string;
  nextHref: string;
  previousDisabled: boolean;
  nextDisabled: boolean;
};

export function PaginationControls({
  previousHref,
  nextHref,
  previousDisabled,
  nextDisabled,
}: PaginationControlsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pendingTarget, setPendingTarget] = useState<{
    direction: "previous" | "next";
    href: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();
  const query = searchParams.toString();
  const currentHref = query ? `${pathname}?${query}` : pathname;
  const pendingDirection =
    pendingTarget && currentHref !== pendingTarget.href
      ? pendingTarget.direction
      : null;
  const isNavigating = isPending || pendingDirection !== null;

  function navigate(
    event: React.MouseEvent<HTMLAnchorElement>,
    href: string,
    direction: "previous" | "next",
    disabled: boolean,
  ) {
    if (disabled || isNavigating) {
      event.preventDefault();
      return;
    }

    event.preventDefault();
    setPendingTarget({ direction, href });
    startTransition(() => {
      router.push(href);
    });
  }

  return (
    <div className="flex items-center gap-2" aria-live="polite">
      <Link
        aria-disabled={previousDisabled || isNavigating}
        className="rounded-md border border-slate-300 px-3 py-2 font-medium text-slate-700 aria-disabled:pointer-events-none aria-disabled:opacity-40"
        href={previousHref}
        onClick={(event) =>
          navigate(event, previousHref, "previous", previousDisabled)
        }
      >
        {pendingDirection === "previous" ? "Loading previous..." : "Previous"}
      </Link>
      <Link
        aria-disabled={nextDisabled || isNavigating}
        className="rounded-md border border-slate-300 px-3 py-2 font-medium text-slate-700 aria-disabled:pointer-events-none aria-disabled:opacity-40"
        href={nextHref}
        onClick={(event) => navigate(event, nextHref, "next", nextDisabled)}
      >
        {pendingDirection === "next" ? "Loading next..." : "Next"}
      </Link>
    </div>
  );
}
