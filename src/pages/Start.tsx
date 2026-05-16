import { Navbar } from "../components/Navbar";
import AboutSection from "../sections/AboutSection";
import ContactSection from "../sections/ContactSection";
import FooterSection from "../sections/FooterSection";
import HeroSection from "../sections/HeroSection";
import ReviewsSection from "../sections/ReviewsSection";
import ServicesSection from "../sections/ServicesSection";

const Start = () => {
  return (
    <div className="w-full ">
      <Navbar />
      <HeroSection />
      <AboutSection />
      <ServicesSection />
      <ReviewsSection />
      <ContactSection />
      <FooterSection />
    </div>
  );
};

export default Start;
