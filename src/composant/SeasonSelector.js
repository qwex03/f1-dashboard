import { useSeason } from "../context/SeasonContext";

function SeasonSelector() {
  const { season, setSeason } = useSeason();

  return (
    <select value={season} onChange={(e) => setSeason(+e.target.value)}>
      <option value={2025}>2025</option>
      <option value={2024}>2024</option>
      <option value={2023}>2023</option>
      <option value={2022}>2022</option>
      <option value={2021}>2021</option>
    </select>
  );
}

export default SeasonSelector;