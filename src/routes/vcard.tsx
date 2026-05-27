import { createFileRoute } from "@tanstack/react-router";
import VCard from "../pages/VCard";

export const Route = createFileRoute("/vcard")({
  component: RouteComponent,
});

function RouteComponent() {
  return <VCard />;
}
