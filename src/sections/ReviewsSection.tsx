import { Star } from "lucide-react";
import { links } from "../App";
import { Review } from "../components/Review";
import SectionHeader from "../components/SectionHeader";

const reviews = [
  {
    name: "Fethullah D.",
    rating: 5,
    text: "Jag kan starkt rekommendera Kendi, en kunnig och duktig kiropraktor som fixade mitt ryggskott. Förutom behandlingen lär han även ut hur man kan förbättra hållningen i ryggen och hur man kan förebygga framtida skador. Fem stjärnor! Tack Kendi",
    treatment: "Kiropraktisk behandling",
  },
  {
    name: "Nadia R.",
    rating: 5,
    text: "Sjukt bra bemötande, kändes som jag blev en ny människa efter mitt besök hos Kendi. Haft problem med ländryggen länge men redan direkt efter besöket kändes ryggen hel igen. Kommer garanterat tillbaka!",
    treatment: "Kiropraktisk behandling",
  },
  {
    name: "Frida S.",
    rating: 5,
    text: "Kendi är alltid lika kompetens och hitta kreativa knep kring fysiska låsningar och besvär. Min värk i armen släppte ganska snabbt efter besöket. Jag fick också med mig bra tips på övningar och stretch.",
    treatment: "Kiropraktisk behandling",
  },
  {
    name: "Olga T.",
    rating: 5,
    text: "Kendi är en otroligt trevlig och inlyssnande kiropraktor som verkligen tar sig tid att förstå ens besvär. Professionell i sitt bemötande och med en imponerande kunskap inom sitt område. Man känner sig trygg och väl omhändertagen, och hans expertis märks tydligt i både förklaringar och behandlingar.",
    treatment: "Kiropraktisk behandling",
  },
  {
    name: "Åse J.",
    rating: 5,
    text: "Magiska händer. Kom dit stel som en pinne pga diskbråck och gick därifrån som en geléråtta. Fick många bra övningar att göra hemma för att stärka bål/rygg. Rekommenderar varmt Kendi.",
    treatment: "Kiropraktisk behandling",
  },
  {
    name: "Robin H.",
    rating: 5,
    text: "Vill man på riktigt få ordning på sin kropp ska man ta sig till Kendi. Utöver behandling får du veta orsak, och hur du i framtiden undviker dina besvär. Sen är bemötandet helt otroligt bra.",
    treatment: "Kiropraktisk behandling",
  },
];

const ReviewsSection = () => {
  return (
    <section
      className="h-fit bg-linear-to-b from-[#141414] to-[#0a0a0a] flex items-center justify-center py-6 flex-col scroll-m-16"
      id="reviews"
    >
      <SectionHeader title="Vad säger" boldPart="våra klienter?" />
      <div className="flex gap-6 mb-8">
        <div className="flex flex-col gap-1 items-center justify-center">
          <div className="flex gap-1">
            {Array.from({ length: 5 }, (_, i) => (
              <Star className="text-star fill-star h-5 w-5" key={"star " + i} />
            ))}
          </div>
          <p className="text-3xl text-primary mt-1">5/5</p>
          <p className="leading-3 text-sm">Genomsnittbetyg</p>
        </div>
        <div className="h-full min-h-18 min-w-[0.5px] bg-primary/50 my-auto"></div>
        <div className="flex flex-col gap-1 items-center justify-center">
          <p className="text-3xl text-primary">300+</p>
          <p className="text-sm">Recensioner</p>
          <a href={links.bokadirekt} className="text-secondary text-sm">
            via Bokadirekt
          </a>
        </div>
      </div>
      <div className="w-full px-6 lg:w-3/4 md:px-6 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reviews.map((review, index) => (
          <Review
            key={index}
            name={review.name}
            rating={review.rating}
            text={review.text}
            treatment={review.treatment}
          />
        ))}
      </div>
    </section>
  );
};

export default ReviewsSection;
