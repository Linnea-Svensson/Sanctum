import type { ReactNode } from "react";
import { useAuth } from "./AuthProvider";
import { SignIn } from "./SignIn";

// Gates its children behind admin authentication.
// While loading: shows a placeholder. If not an authenticated admin: shows the sign-in screen.
export function RequireAdmin({ children }: { children: ReactNode }) {
  const { status, isAdmin } = useAuth();

  if (status === "loading") {
    return (
      <div className="min-h-[80vh] flex items-center justify-center text-neutral-400">
        Laddar…
      </div>
    );
  }

  if (status !== "authenticated" || !isAdmin) {
    return <SignIn notAdmin={status === "authenticated" && !isAdmin} />;
  }

  return <>{children}</>;
}
