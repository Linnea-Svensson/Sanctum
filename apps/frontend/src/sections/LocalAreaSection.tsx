import SectionHeader from "../components/SectionHeader";

const faqs = [
  {
    question: "Var ligger er kiropraktormottagning i Täby?",
    answer:
      "Vår mottagning ligger på Kemistvägen 10, 183 79 Täby, med goda parkeringsmöjligheter och nära kommunikationer. Vi tar emot klienter från hela Täby med omnejd, inklusive Näsbypark, Roslags-Näsby, Viggbyholm och Arninge.",
  },
  {
    question: "Behöver jag remiss för att besöka en kiropraktor i Täby?",
    answer:
      "Nej, du behöver ingen remiss. Du bokar enkelt din tid direkt via Bokadirekt och kommer till oss på Sanctum när det passar dig.",
  },
  {
    question: "Vilka besvär behandlar ni?",
    answer:
      "Vi behandlar bland annat ryggsmärta, nacksmärta, huvudvärk, ischias, axel- och ledbesvär samt idrottsskador. Behandlingen anpassas alltid individuellt efter dina behov och mål.",
  },
  {
    question: "Kan jag använda friskvårdsbidrag eller Epassi?",
    answer:
      "Ja, du kan använda ditt friskvårdsbidrag samt betala med Epassi för både kiropraktik och idrottsmassage hos oss i Täby.",
  },
];

const LocalAreaSection = () => {
  return (
    <section
      id="kiropraktor-taby"
      className="w-full scroll-m-16 py-14 px-6 lg:px-0"
    >
      <div className="max-w-[1100px] mx-auto flex flex-col items-center">
        <SectionHeader title="Kiropraktor i" boldPart="Täby" />
        <div className="flex flex-col gap-6 mb-10">
          <p>
            Söker du en legitimerad <strong>kiropraktor i Täby</strong>? Hos
            Sanctum på Kemistvägen 10 möter du Kendi Johansson – legitimerad
            kiropraktor med bakgrund inom idrott och rehabilitering. Alla är
            välkomna till oss, oavsett var du bor. Många av våra klienter kommer
            från Täby med omnejd – som Täby Centrum, Näsbypark, Roslags-Näsby,
            Viggbyholm, Gribbylund och Arninge – samt från grannkommunerna
            Danderyd, Vallentuna och Åkersberga.
          </p>
          <p>
            Mottagningen ligger centralt i Täby med goda parkeringsmöjligheter
            och enkel tillgång med kollektivtrafik. Du behöver ingen remiss –
            boka din tid direkt via Bokadirekt och använd gärna ditt
            friskvårdsbidrag eller betala med Epassi.
          </p>
        </div>

        <div className="w-full">
          <h3 className="mb-6 text-center">Vanliga frågor</h3>
          <div className="flex flex-col gap-4">
            {faqs.map((faq) => (
              <details
                key={faq.question}
                className="group bg-white/5 border border-primary/20 rounded-2xl px-6 py-4"
              >
                <summary className="flex items-center justify-between cursor-pointer font-bold list-none">
                  {faq.question}
                  <span className="text-primary transition-transform group-open:rotate-45 text-2xl leading-none">
                    +
                  </span>
                </summary>
                <p className="mt-4">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default LocalAreaSection;
