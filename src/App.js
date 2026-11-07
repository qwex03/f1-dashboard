import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import Navbar from "./composant/NavBar";
import MobileNav from "./composant/MobileNav";
import EquipesPage from "./page/EquipesPage";
import PilotesPage from "./page/PilotesPage";
import CircuitPage from "./page/CircuitPage";
import HomePage from "./page/HomePage";
import ResultPage from "./page/ResultPage";
import ActuPage from "./page/ActuPage";
import CalendrierPage from "./page/3DCalendrierPage";
import PiloteDetailPage from "./page/PiloteDetailPage";
import CircuitDetailPage from "./page/CircuitDetailPage";

function Layout({ collapsed, setCollapsed }) {
  const location = useLocation();
  const isFullScreenPage = location.pathname === "/calendrier";
  const mainRef = useRef(null);

  // The page scrolls inside <main>, so reset it when the route changes
  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 });
  }, [location.pathname]);

  return (
    <>
      <Navbar collapsed={collapsed} setCollapsed={setCollapsed} />
      <MobileNav />

      <main
        ref={mainRef}
        className={`main-scrollbar h-[100dvh] overflow-y-auto bg-canvas transition-[margin] duration-300
          pt-[calc(3.5rem+env(safe-area-inset-top))] pb-[calc(4rem+env(safe-area-inset-bottom))] md:pt-0 md:pb-0
          ${collapsed ? "md:ml-20" : "md:ml-64"}`}
      >
        <div
          key={location.pathname}
          className={isFullScreenPage ? "" : "mx-auto max-w-[1400px] px-4 py-6 sm:px-6 md:px-10 md:py-10"}
        >
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/drivers" element={<PilotesPage />} />
            <Route path="/drivers/:driverId" element={<PiloteDetailPage />} />
            <Route path="/teams" element={<EquipesPage />} />
            <Route path="/tracks" element={<CircuitPage />} />
            <Route path="/tracks/:circuitId" element={<CircuitDetailPage />} />
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
