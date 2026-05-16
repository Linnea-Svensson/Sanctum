const Button = ({
  title,
  primary,
  href,
  externalLink = false,
}: {
  title: string;
  primary?: boolean;
  href: string;
  externalLink?: boolean;
}) => {
  return (
    <a
      href={href}
      target={externalLink ? "_blank" : ""}
      className={`${primary ? "bg-primary border-2 border-transparent hover:bg-primary/70" : "border-2 border-primary text-primary hover:bg-primary"}  py-3 px-8 rounded-full hover:text-white hover:border-transparent transition-all`}
    >
      {title}
    </a>
  );
};

export default Button;
