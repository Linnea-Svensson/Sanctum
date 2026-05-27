import { createFileRoute } from "@tanstack/react-router";
import VCard from "../pages/VCard";

export const Route = createFileRoute("/p/q7kf9m2dxz")({
  component: RouteComponent,
});

function RouteComponent() {
  return <VCard />;
}
