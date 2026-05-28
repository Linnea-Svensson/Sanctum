import { createRootRoute, Outlet } from "@tanstack/react-router";
import { Navbar } from "../components/Navbar";
/* import { TanStackRouterDevtools } from "@tanstack/react-router-devtools"; */

const RootLayout = () => (
  <>
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-100 focus:bg-primary focus:text-black focus:px-4 focus:py-2 focus:rounded"
    >
      Hoppa till huvudinnehåll
    </a>
    <Navbar />
    <main id="main-content">
      <Outlet />
    </main>
    {/*  <TanStackRouterDevtools /> */}
  </>
);

export const Route = createRootRoute({ component: RootLayout });
