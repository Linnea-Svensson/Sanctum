import { createRootRoute, HeadContent, Outlet } from "@tanstack/react-router";
import { Navbar } from "../components/Navbar";
import { AdminMenu } from "../auth/AdminMenu";
/* import { TanStackRouterDevtools } from "@tanstack/react-router-devtools"; */

const RootLayout = () => (
  <>
    <HeadContent />
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
    <AdminMenu />
    {/*  <TanStackRouterDevtools /> */}
  </>
);

export const Route = createRootRoute({ component: RootLayout });
