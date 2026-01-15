import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useState } from "react"; 
import Navbar from "./composant/NavBar";
import EquipesPage from "./page/EquipesPage";
import PilotesPage from "./page/PilotesPage";
import CircuitPage from "./page/CircuitPage";
import HomePage from "./page/HomePage";
import ResultPage from "./page/ResultPage";
import ActuPage from "./page/ActuPage";
import CalendrierPage from "./page/3DCalendrierPage";

function Layout({ collapsed, setCollapsed }) {
  const location = useLocation();
  const isFullScreenPage = location.pathname === '/calendrier';

  return (
    <>
      <Navbar collapsed={collapsed} setCollapsed={setCollapsed} />

      <main
        className={`
          h-screen
          overflow-y-auto
          ${isFullScreenPage ? 'p-0' : 'p-6'}
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
          <Route path="/calendrier" element={<CalendrierPage />} />
        </Routes>
      </main>
    </>
  );
}

function App() {
  const [collapsed, setCollapsed] = useState(false);
  
  return (
    <BrowserRouter>
      <div className="min-h-screen">
        <Layout collapsed={collapsed} setCollapsed={setCollapsed} />
      </div>
    </BrowserRouter>
  );
}

export default App;