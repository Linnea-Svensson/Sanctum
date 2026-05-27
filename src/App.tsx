import Start from "./pages/Start";

export const primaryColor = "#b8956a";

export const links = {
  bokadirekt:
    "https://www.bokadirekt.se/places/sanctum-kiropraktik-halsa-135763",
  services: "#services",
};

function App() {
  return (
    <div className="bg-black min-h-screen w-full flex items-start justify-center overflow-x-hidden">
      <Start />
    </div>
  );
}

export default App;
