const SectionHeader = ({
  title,
  boldPart,
}: {
  title: string;
  boldPart: string;
}) => {
  return (
    <div className="flex w-full items-center justify-center flex-col mb-6 px-4 text-center">
      <h2 className="text-3xl sm:text-4xl lg:text-[2.8rem]">
        {title} <span className="font-bold text-primary">{boldPart}</span>
      </h2>
      <div className="h-1 bg-primary mt-4 mb-2 min-w-[35vw]"></div>
    </div>
  );
};

export default SectionHeader;
