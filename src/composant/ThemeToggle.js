import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle({ collapsed }) {
  const [darkMode, setDarkMode] = useState(() => {
    try {
      return localStorage.getItem("theme") !== "light";
    } catch {
      return true;
    }
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    try {
      localStorage.setItem("theme", darkMode ? "dark" : "light");
    } catch {}
  }, [darkMode]);

  const Icon = darkMode ? Moon : Sun;

  return (
    <button
      onClick={() => setDarkMode(!darkMode)}
      title={darkMode ? "Passer en thème clair" : "Passer en thème sombre"}
      className={`flex items-center gap-3 h-10 rounded-lg text-sm text-muted hover:text-ink hover:bg-raised transition-colors ${
        collapsed ? "justify-center w-10 mx-auto" : "px-3 w-full"
      }`}
    >
      <Icon size={18} />
      {!collapsed && <span>{darkMode ? "Thème sombre" : "Thème clair"}</span>}
    </button>
  );
}
