const PrivacyPolicy = () => {
  return (
    <div className="w-full flex items-center justify-center">
      <div className="flex flex-col gap-4 w-full max-w-2xl px-6 items-start justify-center min-h-screen py-16">
        <img
          src="sanctum_round_logo.png"
          alt="sanctum logo"
          className="h-auto w-80 mb-10 mx-auto"
        />
        <p>
          Sanctum Kiropraktik & Hälsa värnar om din personliga integritet och
          behandlar personuppgifter i enlighet med Dataskyddsförordningen (GDPR)
          samt gällande svensk lagstiftning inom hälso- och sjukvård.
        </p>
        <p>
          När du kontaktar oss, bokar en tid eller genomför en behandling kan vi
          komma att behandla uppgifter såsom namn, telefonnummer, e-postadress,
          bokningsinformation och i vissa fall hälsouppgifter samt
          journalinformation. Uppgifterna används för att kunna hantera
          bokningar, genomföra behandlingar, föra patientjournal, hantera
          betalningar samt ge en trygg och professionell vård.
        </p>
        <p>
          Journaluppgifter och andra känsliga personuppgifter behandlas med hög
          sekretess och sparas enligt de krav som ställs i Patientdatalagen. Vi
          delar aldrig dina personuppgifter med obehöriga tredje parter.
        </p>
        <p>
          Vår webbplats kan använda cookies och externa tjänster, exempelvis
          kartfunktioner och analysverktyg, för att förbättra funktionalitet och
          användarupplevelse.
        </p>
        <p>
          Du har rätt att få information om vilka personuppgifter vi behandlar
          om dig, begära rättelse av felaktiga uppgifter samt i vissa fall
          begära att uppgifter raderas eller begränsas enligt GDPR.
        </p>
        <p>
          Har du frågor kring hur vi hanterar personuppgifter är du välkommen
          att kontakta oss via [e-postadress] eller [telefonnummer].
        </p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
