import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./composant/NavBar";
import EquipesPage from "./page/EquipesPage";
import PilotesPage from "./page/PilotesPage";
import CircuitPage from "./page/CircuitPage";

function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen">
        <Navbar />

        <main className="flex-grow p-6 dark:bg-gray-800 bg-white transition-colors duration-300">
          <Routes>
            <Route path="/drivers" element={<PilotesPage />} />
            <Route path="/teams" element={<EquipesPage />} />
            <Route path="/tracks" element={<CircuitPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
