import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type PageShellProps = {
  children: ReactNode;
  className?: string;
};

export function PageShell({ children, className }: PageShellProps) {
  return (
    <main
      className={cn("mx-auto min-h-screen w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8", className)}
      id="main-content"
    >
      {children}
    </main>
  );
}
