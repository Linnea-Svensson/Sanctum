import { createRootRoute, Outlet } from "@tanstack/react-router";
import { Navbar } from "../components/Navbar";
/* import { TanStackRouterDevtools } from "@tanstack/react-router-devtools"; */

const RootLayout = () => (
  <>
    <Navbar />
    <Outlet />
    {/*  <TanStackRouterDevtools /> */}
  </>
);

export const Route = createRootRoute({ component: RootLayout });
