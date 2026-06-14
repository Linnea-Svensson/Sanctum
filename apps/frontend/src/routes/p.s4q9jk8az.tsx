import { createFileRoute } from "@tanstack/react-router";
import QrGenerator from "../pages/qrGenerator";
import { RequireAdmin } from "../auth/RequireAdmin";

export const Route = createFileRoute("/p/s4q9jk8az")({
  head: () => ({
    meta: [{ name: "robots", content: "noindex, nofollow" }],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <RequireAdmin>
      <QrGenerator />
    </RequireAdmin>
  );
}
