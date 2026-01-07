import { useSeason } from "../context/SeasonContext";

function SeasonSelector() {
  const { season, setSeason } = useSeason();
  const currentYear = new Date().getFullYear();
  const startYear = 1950;
  const endYear = currentYear;
  const seasons = [];
  for (let y = endYear; y >= startYear; y--) {
    seasons.push(y);
  }

  return (
    <select
      value={season}
      onChange={(e) => setSeason(+e.target.value)}
      className="
        bg-white 
        border border-gray-300 
        rounded-lg 
        px-4 py-2 
        text-gray-700 
        shadow-sm 
        focus:outline-none 
        focus:ring-2 
        focus:ring-blue-500 
        focus:border-blue-500
        transition
        duration-150
        ease-in-out
        cursor-pointer
      "
    >
      {seasons.map((year) => (
        <option key={year} value={year}>
          {year}
        </option>
      ))}
    </select>
  );
}

export default SeasonSelector;
