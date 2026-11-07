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
  const isFullScreenPage = location.pathname === "/calendrier";

  return (
    <>
      <Navbar collapsed={collapsed} setCollapsed={setCollapsed} />

      <main
        className={`main-scrollbar h-screen overflow-y-auto bg-canvas transition-[margin] duration-300
          ${collapsed ? "ml-20" : "ml-64"}`}
      >
        <div
          key={location.pathname}
          className={isFullScreenPage ? "" : "mx-auto max-w-[1400px] px-6 py-8 md:px-10 md:py-10"}
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
        </div>
      </main>
    </>
  );
}

function App() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-canvas">
        <Layout collapsed={collapsed} setCollapsed={setCollapsed} />
      </div>
    </BrowserRouter>
  );
}

export default App;
