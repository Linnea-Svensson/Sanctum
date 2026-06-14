import { useState, type ReactElement } from "react";
import { ShieldCheck, LogOut, X, Home, QrCode } from "lucide-react";
import { useAuth } from "./AuthProvider";

// A slide-out side menu shown only to a signed-in admin.
// Displays the current account and a sign-out action.
const iconClassname = "w-8 h-8 p-1 bg-primary rounded-full";

export const links = [
  {
    href: "/dashboard",
    title: "Dashboard",
    icon: <Home className={iconClassname} />,
  },
  {
    href: "/p/s4q9jk8az",
    title: "Qr Generator",
    icon: <QrCode className={iconClassname} />,
  },
];

export function AdminMenu() {
  const { status, isAdmin, user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  // Hooks must run on every render (before any early return), or React throws
  // "Rendered more hooks than during the previous render".

  if (status !== "authenticated" || !isAdmin || !user) {
    return null;
  }

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
      setOpen(false);
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <>
      {/* Floating toggle */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Öppna adminmeny"
        className="fixed bottom-5 right-5 z-50 flex items-center justify-center w-12 h-12 rounded-full bg-primary text-white shadow-lg hover:bg-primary/80 transition-colors"
      >
        <ShieldCheck className="w-5 h-5" />
      </button>

      {/* Backdrop */}
      <div
        onClick={() => setOpen(false)}
        aria-hidden="true"
        className={`fixed inset-0 z-50 bg-black/60 transition-opacity ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Side panel */}
      <aside
        role="dialog"
        aria-label="Adminmeny"
        className={`fixed top-0 right-0 z-50 h-full w-72 max-w-[85vw] bg-neutral-900 border-l border-neutral-800 shadow-2xl flex flex-col transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-600">
          <span className="flex items-center gap-2 text-primary font-semibold">
            <ShieldCheck className="w-5 h-5" />
            Admin
          </span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Stäng adminmeny"
            className="text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 py-5 flex-1">
          <p className="text-xs uppercase tracking-wide text-neutral-500">
            Inloggad som
          </p>
          <p className="mt-1 text-white break-words">{user.email}</p>
        </div>
        <div className="w-full h-full border-t border-neutral-600 flex flex-col">
          {links.map((link) => (
            <MenuLink
              href={link.href}
              title={link.title}
              key={link.title}
              icon={link.icon}
            />
          ))}
        </div>
        <div className="px-5 py-5 border-t border-neutral-800">
          <button
            type="button"
            onClick={handleSignOut}
            disabled={signingOut}
            className="w-full flex items-center justify-center gap-2 rounded-full border-2 border-primary text-primary py-2.5 font-medium hover:bg-primary hover:text-white disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            <LogOut className="w-4 h-4" />
            {signingOut ? "Loggar ut…" : "Logga ut"}
          </button>
        </div>
      </aside>
    </>
  );
}

export const MenuLink = ({
  href,
  title,
  icon,
}: {
  href: string;
  title: string;
  icon: ReactElement;
}) => {
  return (
    <a
      href={href}
      className="w-full h-fit px-5 py-5 bg-neutral-800 border-b border-neutral-600 flex gap-2 items-center justify-start hover:bg-primary"
    >
      {icon}
      {title}
    </a>
  );
};
