import { FaArrowRight } from "react-icons/fa6";

const ServiceCard = ({
  title,
  text,
  img,
}: {
  title: string;
  text: string;
  img: string;
}) => {
  return (
    <div className="rounded-lg relative overflow-hidden h-full w-full ">
      <img
        src={img}
        alt={title + " behandling"}
        className="absolute top-0 left-0 h-full w-full object-cover opacity-70"
      />
      <div className="flex flex-col gap-4 items-start justify-start min-h-[60%] w-full p-6 bg-black/60 z-10 absolute bottom-0 left-0">
        <p className="font-bold">{title}</p>
        <p className="w-full ">{text}</p>
        <a className="flex gap-2 items-center hover:text-primary mt-auto">
          <p>Läs mer</p>
          <FaArrowRight />
        </a>
      </div>
    </div>
  );
};

export default ServiceCard;
