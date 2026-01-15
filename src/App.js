import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react"; 
import Navbar from "./composant/NavBar";
import EquipesPage from "./page/EquipesPage";
import PilotesPage from "./page/PilotesPage";
import CircuitPage from "./page/CircuitPage";
import HomePage from "./page/HomePage";
import ResultPage from "./page/ResultPage";
import ActuPage from "./page/ActuPage";
import TestPage from "./page/TestPage";

function App() {
  const [collapsed, setCollapsed] = useState(false);
  
  return (
    <BrowserRouter>
      <div className="min-h-screen">
        <Navbar collapsed={collapsed} setCollapsed={setCollapsed} />

        <main
          className={`
            h-screen
            overflow-y-auto
            p-6
            dark:bg-gray-800 bg-white
            transition-all duration-300
            ${collapsed ? "ml-20" : "ml-64"}
          `}
        >
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/drivers" element={<PilotesPage />} />
            <Route path="/teams" element={<EquipesPage />} />
            <Route path="/tracks" element={<CircuitPage />} />
            <Route path="/results" element={<ResultPage />} />
            <Route path="/news" element={<ActuPage />} />
            <Route path="/test" element={<TestPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;