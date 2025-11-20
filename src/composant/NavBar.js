import { useState } from "react";
import ThemeToggle from "./ThemeToggle";
import { Link } from "react-router-dom";
import { 
  MenuIcon, 
  HomeIcon, 
  UserIcon, 
  UsersIcon, 
  MapPinIcon 
} from "lucide-react";

export default function Navbar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <nav
      className={`
        bg-gray-100 dark:bg-gray-900 shadow p-4 flex flex-col gap-6 min-h-screen 
        transition-all duration-300 
        ${collapsed ? "w-20" : "w-64"}
      `}
    >
      <div className="flex justify-between items-center mb-4">
        {!collapsed && (
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            F1 Dashboard
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="px-2 py-2 rounded bg-gray-300 dark:bg-gray-700 text-black dark:text-white transition-colors duration-300 flex items-center"
        >
          <MenuIcon size={20} />
        </button>
      </div>

      <hr className="border-gray-300 dark:border-gray-700 mb-1" />

       <h2
        className={`text-xs font-semibold uppercase tracking-wider 
                    text-gray-500 dark:text-gray-400 transition-opacity duration-200
                    ${collapsed ? "opacity-0" : "opacity-100"}`}
        >
        Liens
        </h2>

      <div className="flex flex-col gap-3">

        <Link
          to="/"
          className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-red-600 hover:text-white transition-colors duration-300 flex items-center gap-3"
        >
          <HomeIcon size={20} />
          {!collapsed && "Home"}
        </Link>

        <Link
          to="/drivers"
          className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-red-600 hover:text-white transition-colors duration-300 flex items-center gap-3"
        >
          <UserIcon size={20} />
          {!collapsed && "Pilotes"}
        </Link>

        <Link
          to="/teams"
          className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-red-600 hover:text-white transition-colors duration-300 flex items-center gap-3"
        >
          <UsersIcon size={20} />
          {!collapsed && "Équipes"}
        </Link>

        <Link
          to="/circuits"
          className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-red-600 hover:text-white transition-colors duration-300 flex items-center gap-3"
        >
          <MapPinIcon size={20} />
          {!collapsed && "Circuits"}
        </Link>
      </div>

      <hr className="border-gray-300 dark:border-gray-700 mb-4" />

      <h2
        className={`text-xs font-semibold uppercase tracking-wider 
                    text-gray-500 dark:text-gray-400 transition-opacity duration-200
                    ${collapsed ? "opacity-0" : "opacity-100"}`}
        >
        Paramètres
        </h2>

      <ThemeToggle collapsed={collapsed} />

    </nav>


    
  );
}
