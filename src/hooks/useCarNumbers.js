import useFetch from "./useFetch";
import { API } from "../utils/api";

/**
 * Number each driver actually raced with in the selected season.
 * The API's `permanentNumber` is the driver's personal number: it is empty or
 * outdated for the reigning world champion, who races with #1 instead
 * (and for anyone who changed number). The race results carry the real one.
 * Returns `numberOf(driver)`, falling back to `permanentNumber`.
 */
export default function useCarNumbers(season) {
  const { data } = useFetch(`${API}/${season}/last/results/`);
  const results = data?.MRData?.RaceTable?.Races?.[0]?.Results ?? [];
  const byDriver = Object.fromEntries(results.map((r) => [r.Driver.driverId, r.number]));
  return (driver) => (driver ? byDriver[driver.driverId] || driver.permanentNumber || null : null);
}
