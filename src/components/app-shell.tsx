import { AppNav } from "./app-nav";
import { LogoutButton } from "./logout-button";

type AppShellProps = {
  email: string;
  children: React.ReactNode;
};

export function AppShell({ email, children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-lg font-semibold text-slate-950">HostOp Trial</p>
            <p className="text-sm text-slate-500">{email}</p>
          </div>
          <div className="flex items-center gap-3">
            <AppNav />
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
    </div>
  );
}
