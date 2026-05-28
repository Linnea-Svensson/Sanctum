import SectionHeader from "../components/SectionHeader";
import ServiceCardNew from "../components/ServiceCardNew";
import type { IconType } from "../components/TrustIndicator";

const services = [
  {
    title: "Kiropraktik",
    text: "Evidensbaserad kiropraktisk behandling för rygg-, nacke- och ledbesvär. Manuell terapi för optimal funktion.",
    icon: "stethoscope",
  },
  {
    title: "Idrottsmassage",
    text: "Djupmassage för idrottare och aktiva. Förebygger skador, förbättrar återhämtning och prestationsförmåga.",
    icon: "hand",
  },
  {
    title: "Dry needling",
    text: "Behandling med tunna nålar för att minska muskelspänningar, lindra smärta och förbättra rörlighet samt återhämtning.",
    icon: "heartPlus",
  },
  {
    title: "Rehabilitering",
    text: "Individanpassad rehab efter skada eller operation. Gradvis återgång till full funktion och styrka.",
    icon: "zap",
  },
  {
    title: "Förebyggande behandling",
    text: "Proaktiv vård för att undvika skador och besvär. Regelbunden underhållsbehandling för optimal hälsa.",
    icon: "sparkles",
  },
  {
    title: "Postur & hållning",
    text: "Bedömning och korrigering av kroppshållning. Speciellt för kontorsarbete och ensidiga belastningar.",
    icon: "move",
  },
];

const ServicesSection = () => {
  return (
    <div
      className="h-fit flex items-center justify-center scroll-m-16 relative"
      id="services"
    >
      <img
        src="/photos/6.jpg"
        alt=""
        aria-hidden="true"
        className="w-full h-full absolute top-0 left-0 object-cover opacity-30"
      />
      <div className="w-full px-6 lg:w-3/4 md:px-6 flex flex-col h-full py-10 items-center justify-start z-10">
        <SectionHeader title="Våra" boldPart="behandlingar" />
        <p>
          Individanpassade behandlingar för din unika situation och mål. Vi
          kombinerar behandling, träning och återhämtning för att hjälpa dig må
          bättre, prestera bättre och hålla över tid.
        </p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 w-full h-fit mt-10 gap-6">
          {services.map((service, i) => (
            <ServiceCardNew
              key={service.title}
              title={service.title}
              text={service.text}
              icon={service.icon as IconType}
              color={
                i % 2 === 0
                  ? "text-primary bg-primary/15"
                  : "text-secondary bg-secondary/15"
              }
            />
          ))}
          {/*           <ServiceCard
            title="Kiropraktisk Behandling"
            text="Undersökning och behandling av rygg, nacke och leder.
Vi fokuserar på att minska smärta, förbättra rörlighet och återställa kroppens funktion."
            img="/kiro.avif"
          />
          <ServiceCard
            title="Idrotts- & behandlingsmassage"
            text="Djupgående massage för att minska spänningar, öka cirkulationen och påskynda återhämtning.
Passar både dig som tränar mycket och dig med stelhet eller smärta i vardagen."
            img="/massage.avif"
          /> */}
        </div>
      </div>
    </div>
  );
};

export default ServicesSection;
