import { Link, useLocation } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
import SeasonSelefctor from "./SeasonSelector";
import { 
  MenuIcon, 
  HomeIcon, 
  UserIcon, 
  UsersIcon, 
  MapPinIcon,
  NewspaperIcon,
  AwardIcon,
  EarthIcon,
} from "lucide-react";

  export default function Navbar({ collapsed, setCollapsed }) {
  const location = useLocation(); 

  const isActive = (path) => location.pathname === path;

  return (
    <nav
    className={`
    fixed top-0 left-0
    bg-gray-100 dark:bg-gray-900 shadow p-4 flex flex-col gap-6
    h-screen
    transition-all duration-300
    ${collapsed ? "w-20" : "w-64"}
    `}>
      <div className="flex justify-between items-center mb-4">
        {!collapsed && (
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            ApexF1
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
          className={`
            px-4 py-2 rounded flex items-center gap-3 transition-colors duration-300
            ${isActive("/") ? "bg-red-600 text-white" : "bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-red-600 hover:text-white"}
          `}
        >
          <HomeIcon size={20} />
          {!collapsed && "Home"}
        </Link>

        <Link
          to="/drivers"
          className={`
            px-4 py-2 rounded flex items-center gap-3 transition-colors duration-300
            ${isActive("/drivers") ? "bg-red-600 text-white" : "bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-red-600 hover:text-white"}
          `}
        >
          <UserIcon size={20} />
          {!collapsed && "Pilotes"}
        </Link>

        <Link
          to="/teams"
          className={`
            px-4 py-2 rounded flex items-center gap-3 transition-colors duration-300
            ${isActive("/teams") ? "bg-red-600 text-white" : "bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-red-600 hover:text-white"}
          `}
        >
          <UsersIcon size={20} />
          {!collapsed && "Équipes"}
        </Link>

        <Link
          to="/results"
          className={`
            px-4 py-2 rounded flex items-center gap-3 transition-colors duration-300
            ${isActive("/results") ? "bg-red-600 text-white" : "bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-red-600 hover:text-white"}
          `}
        >
          <AwardIcon size={20} />
          {!collapsed && "Résultats"}
        </Link>

        <Link
          to="/tracks"
          className={`
            px-4 py-2 rounded flex items-center gap-3 transition-colors duration-300
            ${isActive("/tracks") ? "bg-red-600 text-white" : "bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-red-600 hover:text-white"}
          `}
        >
          <MapPinIcon size={20} />
          {!collapsed && "Circuits"}
        </Link>

        <Link
          to="/news"
          className={`
            px-4 py-2 rounded flex items-center gap-3 transition-colors duration-300
            ${isActive("/news") ? "bg-red-600 text-white" : "bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-red-600 hover:text-white"}
          `}
        >
          <NewspaperIcon size={20} />
          {!collapsed && "Actualités"}
        </Link>

        <Link
          to="/calendrier"
          className={`
            px-4 py-2 rounded flex items-center gap-3 transition-colors duration-300
            ${isActive("/calendrier") ? "bg-red-600 text-white" : "bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-red-600 hover:text-white"}
          `}
        >
          <EarthIcon size={20} />
          {!collapsed && "3D Calendrier"}
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
      <SeasonSelefctor collapsed={collapsed} />
      <ThemeToggle collapsed={collapsed} />
    </nav>
  );
}
