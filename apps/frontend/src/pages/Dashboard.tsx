import { LogOut, Menu, ShieldCheck, X } from "lucide-react";
import { useAuth } from "../auth/AuthProvider";
import { links, MenuLink } from "../auth/AdminMenu";
import { useState } from "react";
import DashboardHome from "./DashboardHome";

const Dashboard = () => {
  const { status, isAdmin, user, signOut } = useAuth();
  const [signingOut, setSigningOut] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  if (status !== "authenticated" || !isAdmin || !user) {
    return null;
  }

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-neutral-950">
      {/* Backdrop — only on mobile, when the drawer is open. */}
      <div
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
        className={`fixed inset-0 z-30 bg-black/60 transition-opacity lg:hidden ${
          menuOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* Sidebar: off-canvas drawer on mobile, docked on large screens. */}
      <aside
        role="dialog"
        aria-label="Adminmeny"
        className={`fixed inset-y-0 left-0 z-40 flex h-full w-72 max-w-[85vw] flex-col border-r border-neutral-800 bg-neutral-900 shadow-2xl transition-transform duration-300 lg:static lg:z-auto lg:translate-x-0 lg:shadow-none ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-neutral-600 px-5 py-4">
          <span className="flex items-center gap-2 font-semibold text-primary">
            <ShieldCheck className="h-5 w-5" />
            Admin
          </span>
          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            aria-label="Stäng meny"
            className="text-neutral-400 transition-colors hover:text-white lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 px-5 py-5">
          <p className="text-xs uppercase tracking-wide text-neutral-500">
            Inloggad som
          </p>
          <p className="mt-1 break-words text-white">{user.email}</p>
        </div>
        <div className="flex w-full flex-col border-t border-neutral-600">
          {links.map((link) => (
            <MenuLink
              href={link.href}
              title={link.title}
              key={link.title}
              icon={link.icon}
            />
          ))}
        </div>
        <div className="border-t border-neutral-800 px-5 py-5">
          <button
            type="button"
            onClick={handleSignOut}
            disabled={signingOut}
            className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-primary py-2.5 font-medium text-primary transition-colors hover:bg-primary hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            <LogOut className="h-4 w-4" />
            {signingOut ? "Loggar ut…" : "Logga ut"}
          </button>
        </div>
      </aside>

      {/* Main column. */}
      <div className="flex h-full min-w-0 flex-1 flex-col">
        {/* Mobile top bar with the menu toggle. */}
        <header className="flex items-center gap-3 border-b border-neutral-800 bg-neutral-900 px-4 py-3 lg:hidden">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Öppna meny"
            className="text-white transition-colors hover:text-primary"
          >
            <Menu className="h-6 w-6" />
          </button>
          <span className="flex items-center gap-2 font-semibold text-primary">
            <ShieldCheck className="h-5 w-5" />
            Admin
          </span>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto [scrollbar-gutter:stable]">
          <DashboardHome />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
