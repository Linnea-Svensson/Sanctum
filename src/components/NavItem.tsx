const NavItem = ({ name, link }: { name: string; link: string }) => {
  return (
    <li>
      <a href={link} className="hover:text-primary">
        {name}
      </a>
    </li>
  );
};

export default NavItem;
