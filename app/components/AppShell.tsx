"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Toaster } from "sonner";

const navItems = [
  { href: "/", label: "Today" },
  { href: "/habits", label: "Habits" },
  { href: "/log", label: "Log" },
  { href: "/buddy", label: "Buddy" },
  { href: "/summaries", label: "Summaries" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { signOut } = useAuthActions();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-full flex flex-col">
      <Toaster theme="dark" richColors position="bottom-right" />
      <header className="border-b border-border">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4 px-6 h-14">
          <span className="font-mono font-semibold text-fg">streaks</span>

          <nav className="hidden md:flex items-center gap-1 overflow-x-auto">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-1.5 rounded-md text-sm transition-colors whitespace-nowrap ${
                    active ? "bg-surface text-fg" : "text-fg-muted hover:text-fg"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <button
            onClick={() => signOut()}
            className="hidden md:block text-sm text-fg-muted hover:text-fg transition-colors whitespace-nowrap"
          >
            Sign out
          </button>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMenuOpen(true)}
          >
            <Menu className="size-5" />
          </Button>
        </div>
      </header>

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle className="font-mono">streaks</SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col gap-1 px-4">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={`px-3 py-2 rounded-md text-sm transition-colors ${
                    active ? "bg-surface text-fg" : "text-fg-muted hover:text-fg"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <button
            onClick={() => {
              setMenuOpen(false);
              signOut();
            }}
            className="mt-auto px-4 py-4 text-left text-sm text-fg-muted hover:text-fg transition-colors border-t border-border"
          >
            Sign out
          </button>
        </SheetContent>
      </Sheet>

      <main className="max-w-4xl mx-auto p-6 w-full">{children}</main>
    </div>
  );
}
