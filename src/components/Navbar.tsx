import { useState } from "react";
import { Menu, X } from "lucide-react";
import { links } from "../App";
import Button from "./Button";
import NavItem from "./NavItem";

export const Navbar = () => {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <nav className="border-b z-50 bg-white/10 backdrop-blur-sm border-primary px-6 md:px-20 py-4 md:py-6 sticky top-0 left-0">
      <div className="flex items-center justify-between">
        <a href="/" onClick={close}>
          <img src="/sanctum.png" alt="Sanctum Logo" className="h-7 w-auto" />
        </a>

        {/* Desktop links */}
        <ul className="hidden md:flex gap-4">
          <NavItem name="Start" link="/" />
          <NavItem name="Behandlingar" link="#services" />
          <NavItem name="Omdömen" link="#reviews" />
          <NavItem name="Kontakta oss" link="#contact" />
        </ul>
        <div className="hidden md:block">
          <Button title="Boka tid" primary href={links.bokadirekt} />
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Stäng meny" : "Öppna meny"}
          aria-expanded={open}
          className="md:hidden p-2 -mr-2"
        >
          {open ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden flex flex-col gap-5 pt-6 pb-2">
          <ul className="flex flex-col gap-5 text-lg">
            <NavItem name="Start" link="/" onClick={close} />
            <NavItem name="Behandlingar" link="#services" onClick={close} />
            <NavItem name="Omdömen" link="#reviews" onClick={close} />
            <NavItem name="Kontakta oss" link="#contact" onClick={close} />
          </ul>
          <div onClick={close}>
            <Button title="Boka tid" primary href={links.bokadirekt} />
          </div>
        </div>
      )}
    </nav>
  );
};
