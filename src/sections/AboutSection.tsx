import SectionHeader from "../components/SectionHeader";
import TrustIndicator, { type IconType } from "../components/TrustIndicator";

export type TrustIndicatorType = {
  icon: IconType;
  title: string;
  text: string;
};

const trustIndicators: TrustIndicatorType[] = [
  {
    icon: "heart",
    title: "Helheltsperspektiv",
    text: "Personlig vård & behandling",
  },
  {
    icon: "activity",
    title: "Idrottserfarenhet",
    text: "Skador & prestation",
  },
  {
    icon: "award",
    title: "Evidensbaserat",
    text: "Modern behandling",
  },
  {
    icon: "check",
    title: "Högt betyg",
    text: "Nöjda klienter",
  },
];

const AboutSection = () => {
  return (
    <section id="about" className="grid lg:grid-cols-2 py-10">
      <div className="items-center justify-center flex flex-col gap-6 h-full relative">
        <img
          src="/kendi.jpg"
          alt="Sanctum Logo"
          className="max-w-[35%] h-auto rounded-3xl shadow-sm border border-white/10"
        />
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/10 absolute bottom-0">
          <TrustIndicator
            icon="award"
            title="Kendi Johansson"
            text="Legitimerad kiropraktor"
            iconBg
          />
        </div>
      </div>
      <div className="flex flex-col px-32 items-center">
        {/*      <img
          src="/sanctum_round_logo.png"
          alt="Sanctum Logo"
          className="max-w-80 h-auto"
        /> */}
        <SectionHeader title="Välkommen till" boldPart="Sanctum" />
        <div className="flex flex-col gap-6 mb-6">
          <p>
            På Sanctum kombinerar vi evidensbaserad kiropraktik med ett
            holistiskt synsätt på hälsa. Vi tror på att kroppen har en
            fantastisk förmåga att läka sig själv när den får rätt
            förutsättningar.
          </p>
          <p>
            Med flerårig erfarenhet av att behandla både vardagsbesvär och
            idrottsskador, erbjuder vi individanpassade behandlingar som
            fokuserar på långsiktiga resultat. Vår filosofi bygger på att förstå
            roten till problemen, inte bara behandla symtomen.
          </p>
          <p>
            Oavsett om du kommer till oss med ryggsmärta, nackspänningar,
            idrottsskada eller vill förbättra din prestationsförmåga, så tar vi
            oss tid att lyssna, undersöka och skapa en behandlingsplan som
            passar just dig.
          </p>
        </div>
        <div className="grid grid-cols-2 w-full border-t-[0.5px] border-primary/30 pt-6 gap-6">
          {trustIndicators.map((indicator, index) => (
            <TrustIndicator
              key={index}
              icon={indicator.icon as IconType}
              title={indicator.title}
              text={indicator.text}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
