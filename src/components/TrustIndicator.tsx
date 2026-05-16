import {
  Check,
  Award,
  CreditCard,
  Star,
  Activity,
  Dumbbell,
  Heart,
  Sparkles,
  Stethoscope,
  Zap,
  Baby,
  Move,
  Phone,
  Mail,
  Clock,
  MapPin,
  Hand,
  HeartPlus,
} from "lucide-react";
import { FaInstagram } from "react-icons/fa";
import { RiTiktokLine } from "react-icons/ri";

export type IconType =
  | "check"
  | "award"
  | "creditcard"
  | "star"
  | "activity"
  | "dumbbell"
  | "heart"
  | "sparkles"
  | "stethoscope"
  | "zap"
  | "baby"
  | "move"
  | "phone"
  | "mail"
  | "clock"
  | "location"
  | "hand"
  | "heartPlus"
  | "instagram"
  | "tiktok";

export const getIcon = (type: IconType, color?: string) => {
  switch (type) {
    case "check":
      return <Check className={`w-5 h-5 ${color || "text-secondary"}`} />;
    case "award":
      return <Award className={`w-5 h-5 ${color || "text-secondary"}`} />;
    case "creditcard":
      return <CreditCard className={`w-5 h-5 ${color || "text-secondary"}`} />;
    case "star":
      return <Star className={`w-5 h-5 ${color || "text-star fill-star"}`} />;
    case "activity":
      return <Activity className={`w-5 h-5 ${color || "text-secondary"}`} />;
    case "dumbbell":
      return <Dumbbell className={`w-5 h-5 ${color || "text-secondary"}`} />;
    case "heart":
      return <Heart className={`w-5 h-5 ${color || "text-secondary"}`} />;
    case "sparkles":
      return <Sparkles className={`w-5 h-5 ${color || "text-secondary"}`} />;
    case "stethoscope":
      return <Stethoscope className={`w-5 h-5 ${color || "text-secondary"}`} />;
    case "zap":
      return <Zap className={`w-5 h-5 ${color || "text-secondary"}`} />;
    case "baby":
      return <Baby className={`w-5 h-5 ${color || "text-secondary"}`} />;
    case "move":
      return <Move className={`w-5 h-5 ${color || "text-secondary"}`} />;
    case "phone":
      return <Phone className={`w-5 h-5 ${color || "text-secondary"}`} />;
    case "mail":
      return <Mail className={`w-5 h-5 ${color || "text-secondary"}`} />;
    case "clock":
      return <Clock className={`w-5 h-5 ${color || "text-secondary"}`} />;
    case "location":
      return <MapPin className={`w-5 h-5 ${color || "text-secondary"}`} />;
    case "hand":
      return <Hand className={`w-5 h-5 ${color || "text-secondary"}`} />;
    case "heartPlus":
      return <HeartPlus className={`w-5 h-5 ${color || "text-secondary"}`} />;
    case "instagram":
      return <FaInstagram className={`w-7 h-7 ${color || "text-primary"}`} />;
    case "tiktok":
      return <RiTiktokLine className={`w-7 h-7 ${color || "text-primary"}`} />;
    default:
      return null;
  }
};

const TrustIndicator = ({
  icon,
  title,
  text,
  iconBg = false,
}: {
  icon: IconType;
  title: string;
  text?: string;
  iconBg?: boolean;
}) => {
  return (
    <div
      className={`flex items-center gap-3 ${!text && "bg-white/5 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/10"}`}
    >
      <div className={`${iconBg && "bg-secondary/30 p-2 rounded-lg"} `}>
        {getIcon(icon)}
      </div>
      <div>
        <p className={`${!text && "text-sm"} font-semibold`}>{title}</p>
        {text && <p className="text-sm text-white/50">{text}</p>}
      </div>
    </div>
  );
};

export default TrustIndicator;
