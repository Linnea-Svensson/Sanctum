import { createFileRoute } from "@tanstack/react-router";
import { RequireAdmin } from "../auth/RequireAdmin";
import Dashboard from "../pages/Dashboard";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [{ name: "robots", content: "noindex, nofollow" }],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <RequireAdmin>
      <Dashboard />
    </RequireAdmin>
  );
}
