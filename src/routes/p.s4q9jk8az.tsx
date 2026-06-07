import { createFileRoute } from "@tanstack/react-router";
import QrGenerator from "../pages/QrGenerator";

export const Route = createFileRoute("/p/s4q9jk8az")({
  head: () => ({
    meta: [{ name: "robots", content: "noindex, nofollow" }],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  return <QrGenerator />;
}
