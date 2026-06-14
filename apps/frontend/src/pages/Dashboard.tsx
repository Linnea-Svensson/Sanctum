import { LogOut, ShieldCheck } from "lucide-react";
import { useAuth } from "../auth/AuthProvider";
import { links, MenuLink } from "../auth/AdminMenu";
import { useState } from "react";
import OpeningHoursEditor from "./OpeningHoursEditor";

const Dashboard = () => {
  const { status, isAdmin, user, signOut } = useAuth();
  const [signingOut, setSigningOut] = useState(false);

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
    <div className="flex h-screen">
      <aside
        role="dialog"
        aria-label="Adminmeny"
        className={` h-full w-72 max-w-[85vw] bg-neutral-900 border-l border-neutral-800 shadow-2xl flex flex-col transition-transform duration-300 `}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-600">
          <span className="flex items-center gap-2 text-primary font-semibold">
            <ShieldCheck className="w-5 h-5" />
            Admin
          </span>
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
      <OpeningHoursEditor />
    </div>
  );
};

export default Dashboard;
