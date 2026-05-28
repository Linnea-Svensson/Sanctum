import { getIcon, type IconType } from "../components/TrustIndicator";

const FooterSection = () => {
  return (
    <section
      className="h-fit bg-linear-to-b from-[#141414] to-[#0a0a0a] flex flex-col items-start justify-center "
      id="footer"
    >
      <div className="flex flex-col lg:flex-row gap-10 lg:gap-4 items-center lg:items-start justify-evenly py-10 px-6 w-full h-full">
        <div className="w-fit flex items-center justify-center flex-col gap-6 h-full ">
          <div className="flex gap-6 items-center justify-center w-fit ">
            <img
              src="/sanctum.png"
              alt="sanctum logo footer"
              className="max-w-48"
            />
            {/*  <h3 className="text-2xl">Sanctum</h3> */}
          </div>
          {/*   <img
            src="/sanctum_round_logo.png"
            alt="sanctum logo footer"
            className="max-w-12"
          /> */}
          <p className="max-w-[18rem] text-center">
            Din partner för optimal hälsa. Professionell kiropraktik och
            personlig vård i Stockholm.
          </p>
          <p>Org.nr: 559580-7321</p>
        </div>
        <div className="w-fit flex items-center justify-start flex-col gap-6">
          <h3>Följ oss</h3>
          <div className="flex gap-6">
            <SocialMediaBtn
              icon="instagram"
              href="https://www.instagram.com/sanctum_kiropraktik/"
            />
            <SocialMediaBtn
              icon="tiktok"
              href="https://www.tiktok.com/@sanctum_kiropraktik"
            />
          </div>
          {/*    <p className="px-10">
            Tips, rörelse, återhämtning och satisfying kiropraktiska justeringar
            — följ oss för mer.
          </p> */}
        </div>
        <div className="w-fit flex items-center justify-start flex-col gap-6">
          <h3>Länkar</h3>
          <div className="flex flex-col items-start justify-center gap-4">
            <a href="#services">Behandlingar</a>
            <a href="#reviews">Omdömen</a>
            <a href="/privacypolicy">Integritetspolicy</a>
          </div>
        </div>
        <div className="w-fit flex items-center justify-start flex-col gap-6">
          <h3>Öppettider</h3>
          <div className="flex flex-col items-start justify-center gap-4">
            <p>Måndag - Onsdag: Stängt</p>
            <p>Torsdag - Fredag: 16:00 - 21:00</p>
            <p>Lördag -Söndag: 12:00 - 17:00</p>
          </div>
        </div>
        <div className="w-fit flex items-center justify-center flex-col gap-6">
          <h3>Kontakt</h3>
          <div className="flex flex-col gap-2">
            <div className="flex gap-4 items-center justify-start">
              {getIcon("location", "text-primary")}
              <div className="flex flex-col">
                <p>Kemistvägen 10</p>
                <p>183 79 Täby</p>
              </div>
            </div>
            <div className="flex gap-4 items-center justify-start">
              {getIcon("phone", "text-primary")}
              <p>076-344 46 10</p>
            </div>
            <div className="flex gap-4 items-center justify-start">
              {getIcon("mail", "text-primary")}
              <p>info@sanctumkiropraktik.se</p>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t w-full border-white/40 py-4 flex items-center justify-center">
        <p className="text-xs">
          © 2026 Sanctum Kiropraktik & Hälsa. Alla rättigheter förbehållna.
        </p>
      </div>
    </section>
  );
};

const SocialMediaBtn = ({ icon, href }: { icon: IconType; href: string }) => {
  return (
    <a
      href={href}
      target="_blank"
      className="w-12 h-12 flex items-center justify-center bg-stone-800 rounded-lg hover:bg-stone-800/70"
    >
      {getIcon(icon)}
    </a>
  );
};

export default FooterSection;
