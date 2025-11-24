import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./composant/NavBar";
import EquipesPage from "./page/EquipesPage";
import PilotesPage from "./page/PilotesPage";

function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen">
        <Navbar />

        <main className="flex-grow p-6 dark:bg-gray-800 bg-white transition-colors duration-300">
          <Routes>
            <Route path="/drivers" element={<PilotesPage />} />
            <Route path="/teams" element={<EquipesPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
