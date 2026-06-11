const NavItem = ({
  name,
  link,
  onClick,
}: {
  name: string;
  link: string;
  onClick?: () => void;
}) => {
  return (
    <li>
      <a href={link} onClick={onClick} className="hover:text-primary">
        {name}
      </a>
    </li>
  );
};

export default NavItem;
