import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle({ collapsed }) {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved === "dark";
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  return (
    <button
      onClick={() => setDarkMode(!darkMode)}
      className={`px-4 py-2 rounded bg-gray-300 dark:bg-gray-700 
                 text-black dark:text-white transition-colors duration-300 
                 flex items-center gap-2`}
    >
      {darkMode ? <Moon size={20} /> : <Sun size={20} />}

      {!collapsed && (
        <span className="text-sm">
          {darkMode ? "Thème sombre" : "Thème clair"}
        </span>
      )}
    </button>
  );
}
