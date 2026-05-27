import {
  Phone,
  Mail,
  MapPin,
  Globe,
  Briefcase,
  ChevronRight,
  UserPlus,
} from "lucide-react";
import { FaInstagram } from "react-icons/fa";
import { RiTiktokFill } from "react-icons/ri";

const contact = {
  name: "Kendi Johansson",
  title: "Leg. Kiropraktor | Massör | PT",
  bio: "Leg. kiropraktor med fokus på behandling, rörelse och hållbar träning. Jag hjälper dig från behandlingsbänk till träningsbänk.",
  phoneLabel: "0763444610",
  phone: "+46763444610",
  email: "info@sanctumkiropraktik.se",
  website: "www.sanctumkiropraktik.se",
  websiteUrl: "https://www.sanctumkiropraktik.se",
  address: "Kemistvägen, 10, Stockholms län, 183 79, Sverige",
  company: "Sanctum Kiropraktik & Hälsa AB",
  photo: "/kendi.jpg",
};

const mapUrl =
  "https://www.google.com/maps/search/?api=1&query=" +
  encodeURIComponent("Kemistvägen 10, 183 79 Täby, Sverige");

const social = [
  {
    icon: <Globe className="w-6 h-6 text-neutral-900" />,
    iconWrap: "bg-white",
    label: "Web",
    sub: "BokaDirekt",
    href: "https://www.bokadirekt.se",
  },
  {
    icon: <FaInstagram className="w-6 h-6 text-white" />,
    iconWrap: "bg-linear-to-tr from-[#feda75] via-[#d62976] to-[#4f5bd5]",
    label: "Instagram",
    href: "https://www.instagram.com/sanctum_kiropraktik/",
  },
  {
    icon: <RiTiktokFill className="w-6 h-6 text-white" />,
    iconWrap: "bg-black ring-1 ring-white/15",
    label: "TikTok",
    href: "https://www.tiktok.com/@sanctum_kiropraktik",
  },
];

const downloadVCard = () => {
  const vcf = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    "N:Johansson;Kendi;;;",
    `FN:${contact.name}`,
    `ORG:${contact.company}`,
    `TITLE:${contact.title}`,
    `TEL;TYPE=CELL:${contact.phone}`,
    `EMAIL;TYPE=WORK:${contact.email}`,
    `URL:${contact.websiteUrl}`,
    "ADR;TYPE=WORK:;;Kemistvägen 10;Täby;Stockholms län;183 79;Sverige",
    "END:VCARD",
  ].join("\n");

  const blob = new Blob([vcf], { type: "text/vcard;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "kendi-johansson.vcf";
  link.click();
  URL.revokeObjectURL(url);
};

const ActionButton = ({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) => (
  <a
    href={href}
    aria-label={label}
    className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-lg hover:bg-white/90 transition"
  >
    {children}
  </a>
);

const ContactRow = ({
  icon,
  label,
  value,
  href,
  children,
  last = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
  children?: React.ReactNode;
  last?: boolean;
}) => {
  const body = (
    <div
      className={`flex items-center gap-4 py-5 ${last ? "" : "border-b border-neutral-500"}`}
    >
      <div className="shrink-0 w-12 h-12 rounded-full bg-white flex items-center justify-center">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-neutral-300">{label}</p>
        <p className="font-semibold wrap-break-word leading-snug">{value}</p>
        {children}
      </div>
    </div>
  );

  return href ? (
    <a href={href} className="block">
      {body}
    </a>
  ) : (
    body
  );
};

const VCard = () => {
  return (
    <div className="min-h-screen w-full bg-black flex justify-center">
      <div className="relative w-full min-h-screen pb-28">
        {/* Header */}
        <header className="bg-linear-to-b from-[#639b8f] via-[#34685f] to-95% to-black px-6 pt-14 pb-8 flex flex-col items-center text-center">
          <img
            src={contact.photo}
            alt={contact.name}
            className="w-36 h-36 rounded-full object-cover ring-4 ring-primary shadow-xl"
          />
          <h1 className="mt-6 text-3xl font-bold text-white">{contact.name}</h1>
          <p className="mt-3 text-lg font-medium text-white/90">
            {contact.title}
          </p>
          <div className="mt-7 flex gap-5">
            <ActionButton href={`tel:${contact.phone}`} label="Ring">
              <Phone className="w-6 h-6 text-neutral-800" />
            </ActionButton>
            <ActionButton href={`mailto:${contact.email}`} label="Maila">
              <Mail className="w-6 h-6 text-neutral-800" />
            </ActionButton>
            <ActionButton href={mapUrl} label="Hitta hit">
              <MapPin className="w-6 h-6 text-neutral-800" />
            </ActionButton>
          </div>
        </header>

        {/* Bio */}
        <p className="text-center text-neutral-400 leading-relaxed px-8 py-7 max-w-sm mx-auto">
          {contact.bio}
        </p>

        {/* Contact card */}
        <div className="mx-4 rounded-3xl bg-[#161616] text-white px-5 shadow-sm">
          <ContactRow
            icon={<Phone className="w-5 h-5 text-neutral-800" />}
            label={contact.phoneLabel}
            value={contact.phone}
            href={`tel:${contact.phone}`}
          />
          <ContactRow
            icon={<Mail className="w-5 h-5 text-neutral-800" />}
            label="E-postadress"
            value={contact.email}
            href={`mailto:${contact.email}`}
          />
          <ContactRow
            icon={<Globe className="w-5 h-5 text-neutral-800" />}
            label="Hemsida"
            value={contact.website}
            href={contact.websiteUrl}
          />
          <ContactRow
            icon={<MapPin className="w-5 h-5 text-neutral-800" />}
            label="Plats"
            value={contact.address}
          >
            <a
              href={mapUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-block mt-2 px-4 py-1.5 rounded-full bg-white text-sm font-medium text-neutral-700 hover:bg-neutral-200 transition"
            >
              Visa på kartan
            </a>
          </ContactRow>
          <ContactRow
            icon={<Briefcase className="w-5 h-5 text-neutral-800" />}
            label={contact.company}
            value={contact.title}
            last
          />
        </div>

        {/* Hitta mig på */}
        <div className="px-4 mt-9">
          <h2 className="text-2xl font-semibold text-white mb-5">
            Hitta mig på
          </h2>
          <div className="flex flex-col gap-3">
            {social.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-4 bg-[#161616] rounded-2xl px-4 py-4 hover:bg-[#1f1f1f] transition"
              >
                <span
                  className={`w-11 h-11 rounded-xl flex items-center justify-center ${s.iconWrap}`}
                >
                  {s.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white">{s.label}</p>
                  {s.sub && <p className="text-sm text-neutral-400">{s.sub}</p>}
                </div>
                <ChevronRight className="w-5 h-5 text-neutral-500" />
              </a>
            ))}
          </div>
        </div>

        {/* Add contact bar */}
        <div className="fixed bottom-0 bg-black left-0 rounded-lg overflow-hidden p-4 w-full">
          <button
            onClick={downloadVCard}
            className="relative w-full flex items-center justify-center gap-3 bg-primary text-black font-bold py-5 hover:bg-[#262626] transition rounded-lg"
          >
            <UserPlus className="w-6 h-6" />
            <p>Lägg till kontakt</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default VCard;
