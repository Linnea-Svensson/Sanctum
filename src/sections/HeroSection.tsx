import { links } from "../App";
import Button from "../components/Button";
import TrustIndicator, { type IconType } from "../components/TrustIndicator";

const heroTrustIndicators = [
  {
    icon: "check",
    title: "Legitimerad kiropraktor",
  },

  {
    icon: "creditcard",
    title: "Friskvårdsbidrag & Epassi",
  },
  {
    icon: "check",
    title: "Erfarenhet inom rehabilitering",
  },
  {
    icon: "star",
    title: "5.0 • 300+ omdömen på Bokadirekt",
  },
];

const HeroSection = () => {
  return (
    <section
      className="h-[70vh] w-full relative  bg-linear-to-br from-[#0a0a0a] via-[#1a1a1a] to-[#141414]"
      id="hero"
    >
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-10 w-96 h-96 bg-primary/20 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-20 left-10 w-80 h-80 bg-secondary/20 rounded-full blur-3xl"></div>
      </div>
      {/*   <img
        src="/hero.avif"
        alt=""
        className="max-h-full w-full object-cover flex opacity-70"
      /> */}
      <div className="absolute top-1/2 -translate-y-1/2  w-full grid grid-cols-2">
        <div className="flex flex-col gap-8 pl-40">
          <h1 className="font-bold text-5xl">
            Från smärta till funktion – Rehabilitering och träning i Solna
          </h1>
          <p>
            Tegen Rehab erbjuder individanpassad rehabilitering med kiropraktik,
            massage och träning för alla åldrar och nivåer i hjärtat av Solna
            Centrum. Som en del av CrossFit Tegen kan vi ta dig hela vägen från
            smärta och skada till en starkare, mer hållbar kropp.
          </p>
          <div className="grid grid-cols-2 gap-4">
            {heroTrustIndicators.map((indicator, i) => (
              <TrustIndicator
                key={i}
                icon={indicator.icon as IconType}
                title={indicator.title}
              />
            ))}
          </div>
          <div className="flex gap-4">
            <Button
              title="Boka tid"
              primary
              href={links.bokadirekt}
              externalLink
            />
            <Button title="Se behandlingar" href={links.services} />
          </div>
        </div>
        <div className="w-full h-full flex items-center justify-center">
          <img
            src="/sanctum_round_logo.png"
            alt="Sanctum logo"
            className="w-[50%] h-auto"
          />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
