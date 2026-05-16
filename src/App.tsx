import Start from "./pages/Start";

export const primaryColor = "#b8956a";

export const links = {
  bokadirekt:
    "https://www.bokadirekt.se/places/sanctum-kiropraktik-halsa-135763",
  services: "#services",
};

function App() {
  return (
    <div className="bg-black h-screen w-screen flex items-start justify-center">
      <Start />
    </div>
  );
}

export default App;
