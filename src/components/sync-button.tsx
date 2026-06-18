"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type SyncState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; count: number }
  | { status: "error"; message: string };

export function SyncButton() {
  const router = useRouter();
  const [state, setState] = useState<SyncState>({ status: "idle" });

  async function syncReservations() {
    setState({ status: "loading" });

    try {
      const response = await fetch("/api/sync-reservations", {
        method: "POST",
      });
      const body = await response.json();

      if (!response.ok) {
        throw new Error(body.error ?? "Sync failed.");
      }

      setState({ status: "success", count: body.syncedCount });
      router.refresh();
    } catch (error) {
      setState({
        status: "error",
        message: error instanceof Error ? error.message : "Sync failed.",
      });
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        className="rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
        disabled={state.status === "loading"}
        onClick={syncReservations}
        type="button"
      >
        {state.status === "loading" ? "Syncing..." : "Sync Reservations"}
      </button>
      {state.status === "success" ? (
        <p className="text-sm text-emerald-700">{state.count} reservations synced.</p>
      ) : null}
      {state.status === "error" ? (
        <p className="text-sm text-red-700">{state.message}</p>
      ) : null}
    </div>
  );
}
