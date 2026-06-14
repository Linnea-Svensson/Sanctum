import SectionHeader from "../components/SectionHeader";
import { useFaqs } from "../api/useFaqs";

const LocalAreaSection = () => {
  // Managed from the dashboard FAQ editor.
  const { faqs } = useFaqs();

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

        {faqs.length > 0 && (
          <div className="w-full">
            <h3 className="mb-6 text-center">Vanliga frågor</h3>
            <div className="flex flex-col gap-4">
              {faqs.map((faq) => (
                <details
                  key={faq.id}
                  className="group bg-white/5 border border-primary/20 rounded-2xl px-6 py-4"
                >
                  <summary className="flex items-center justify-between cursor-pointer font-bold list-none">
                    {faq.question}
                    <span className="text-primary transition-transform group-open:rotate-45 text-2xl leading-none">
                      +
                    </span>
                  </summary>
                  <p className="mt-4 whitespace-pre-line">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default LocalAreaSection;
