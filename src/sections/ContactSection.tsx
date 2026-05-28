import ContainerCard from "../components/ContainerCard";
import SectionHeader from "../components/SectionHeader";
import { getIcon } from "../components/TrustIndicator";

const ContactSection = () => {
  return (
    <section
      id="contact"
      className="bg-black pt-6 w-full scroll-m-16 bg-cover bg-center bg-[linear-gradient(rgba(0,0,0,0.7),rgba(0,0,0,0.7)),url('/photos/outside.jpg')]"
    >
      <SectionHeader title="Kontakta" boldPart="oss" />
      <div className="grid lg:grid-cols-2 px-6 md:px-14 pb-6 gap-6 h-full w-full">
        <div>
          <div className="overflow-hidden h-72 lg:h-full rounded-3xl border shadow-lg">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2028.0368693872076!2d18.08356387802895!3d59.4491364746725!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x465f9ba4aae3ea11%3A0x96c15685ac02946f!2sKemistv%C3%A4gen%2010%2C%20183%2079%20T%C3%A4by!5e0!3m2!1ssv!2sse!4v1778176008724!5m2!1ssv!2sse"
              width="100%"
              height="100%"
              loading="lazy"
            ></iframe>
          </div>
        </div>
        <ContainerCard>
          <div className="flex flex-col gap-6">
            <h3 className="z-10">Kontaktinformation</h3>
            <div className="flex gap-6 border-b border-primary/30 pb-6">
              <div
                className={
                  "bg-secondary/20 p-2 rounded-lg w-14 h-14 flex items-center justify-center"
                }
              >
                {getIcon("location", "text-secondary h-7 w-7")}
              </div>
              <div className="flex flex-col justify-center gap-1">
                <p className="font-bold mb-2">Besöksadress</p>
                <div className="flex flex-col">
                  <p>Kemistvägen 10</p>
                  <p>183 79 Täby</p>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-6 border-b border-primary/30 pb-6">
              <div className="flex gap-6">
                <div
                  className={
                    "bg-secondary/20 p-2 rounded-lg w-14 h-14 flex items-center justify-center"
                  }
                >
                  {getIcon("phone", "text-secondary h-7 w-7")}
                </div>
                <div className="flex flex-col justify-center gap-1">
                  <p className="font-bold">Telefon</p>
                  <p>076-344 46 10</p>
                </div>
              </div>
              <div className="flex gap-6">
                <div
                  className={
                    "bg-secondary/20 p-2 rounded-lg w-14 h-14 flex items-center justify-center"
                  }
                >
                  {getIcon("mail", "text-secondary h-7 w-7")}
                </div>
                <div className="flex flex-col justify-center gap-1">
                  <p className="font-bold">E-post</p>
                  <p>info@sanctumkiropraktik.se</p>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-6">
              <div className="flex gap-6">
                <div
                  className={
                    "bg-secondary/20 p-2 rounded-lg w-14 h-14 flex items-center justify-center"
                  }
                >
                  {getIcon("clock", "text-secondary h-7 w-7")}
                </div>
                <div className="flex flex-col justify-center gap-1 w-full max-w-xs">
                  <p className="font-bold mb-2">Öppettider</p>
                  <div className="flex items-center justify-between w-full">
                    <p>Måndag - Onsdag</p>
                    <p>Stängt</p>
                  </div>
                  <div className="flex items-center justify-between w-full">
                    <p>Torsdag - Fredag</p>
                    <p>16:00 - 21:00</p>
                  </div>
                  <div className="flex items-center justify-between w-full">
                    <p>Lördag - Söndag</p>
                    <p>12:00 - 17:00</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ContainerCard>
      </div>
    </section>
  );
};

export default ContactSection;
