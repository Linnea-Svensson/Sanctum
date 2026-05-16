import { Star, Quote } from "lucide-react";

export const Review = ({
  name,
  text,
  rating,
  treatment,
}: {
  name: string;
  text: string;
  rating: number;
  treatment: string;
}) => {
  /*   const imgName =
    name.split(" ")[0].split("")[0] + name.split(" ")[1].split("")[0]; */
  return (
    /*  <div className="bg-black rounded-xl flex flex-col p-6 items-start justify-between relative"> */
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/10 relative">
      <div className="flex gap-2">
        {Array.from({ length: rating }, (_, i) => (
          <Star key={i} className="fill-star text-star w-4 h-4" />
        ))}
      </div>
      <p className="my-6">"{text}"</p>
      <div className="flex items-center gap-4 justify-between w-full">
        {/*    <div className="bg-white min-h-14 min-w-14 rounded-full flex items-center justify-center text-black font-bold">
          {imgName}
        </div> */}

        <div className="flex flex-col w-full border-t-[0.5px] border-primary/50 pt-4 mt-auto">
          <p className="font-bold">{name}</p>
          <p className="text-white/50">{treatment}</p>
        </div>
        <Quote className="absolute top-4 right-4 w-8 h-8 text-primary/40" />
      </div>
    </div>
  );
};
