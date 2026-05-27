import { getIcon, type IconType } from "./TrustIndicator";

const ServiceCardNew = ({
  title,
  text,
  icon,
  color = "text-primary bg-primary/15",
}: {
  title: string;
  text: string;
  icon: IconType;
  color?: string;
}) => {
  return (
    <div className="flex flex-col bg-[#1C1C1C] rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-white/10 hover:border-[#B8956A]/50 hover:-translate-y-1">
      <div
        className={`w-14 h-14 rounded-2xl  flex items-center justify-center mb-6 hover:scale-110 transition-transform`}
      >
        {getIcon(icon, "p-2 h-12 w-12 rounded-lg " + color)}
      </div>
      <h3 className="text-xl font-medium text-white mb-3">{title}</h3>

      <p className="text-gray-400 leading-relaxed text-sm">{text}</p>
    </div>
  );
};

export default ServiceCardNew;
