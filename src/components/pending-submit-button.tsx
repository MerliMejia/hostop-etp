"use client";

import { useFormStatus } from "react-dom";

type PendingSubmitButtonProps = {
  children: React.ReactNode;
  className: string;
  pendingChildren: React.ReactNode;
};

export function PendingSubmitButton({
  children,
  className,
  pendingChildren,
}: PendingSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button className={className} disabled={pending} type="submit">
      {pending ? pendingChildren : children}
    </button>
  );
}
