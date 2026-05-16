import { links } from "../App";
import Button from "./Button";
import NavItem from "./NavItem";

export const Navbar = () => {
  return (
    <nav className="border-b z-50 bg-white/10 backdrop-blur-sm border-primary flex items-center justify-between px-20 py-6 sticky top-0">
      <a href="/">
        <img src="/sanctum.png" alt="Sanctum Logo" className="h-7 w-auto" />
      </a>
      <ul className="flex gap-4">
        <NavItem name="Start" link="/" />
        {/*       <NavItem name="Övningar" link="" /> */}
        <NavItem name="Behandlingar" link="#services" />
        <NavItem name="Omdömen" link="#reviews" />
        <NavItem name="Kontakta oss" link="#contact" />
      </ul>
      <div>
        <Button title="Boka tid" primary href={links.bokadirekt} />
      </div>
    </nav>
  );
};
