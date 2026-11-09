import { Fragment } from "react";
import { DriverName, Notice, Position, TableCard, TeamName } from "./RaceUI";

/** "1:23.456" → 83.456 seconds (null when no time was set). */
function toSeconds(time) {
  if (!time) return null;
  const parts = String(time).split(":");
  const secs = parts.length === 2 ? Number(parts[0]) * 60 + Number(parts[1]) : Number(parts[0]);
  return Number.isFinite(secs) ? secs : null;
}

const SESSIONS = ["Q1", "Q2", "Q3"];

/** Last session a driver took part in (Q3 for the top 10, Q2 for 11-15, Q1 for the rest). */
function lastSession(r) {
  if (r.Q3 !== undefined) return "Q3";
  if (r.Q2 !== undefined) return "Q2";
  return "Q1";
}

/**
 * Qualifying classification: Q1 / Q2 / Q3 times, the fastest time of each session
 * highlighted, gap to the fastest driver of the session each driver went out in,
 * and a separator where drivers were knocked out.
 */
export default function QualifyingTable({ rows }) {
  if (rows.length === 0) {
    return <Notice>Les qualifications n'ont pas encore eu lieu.</Notice>;
  }

  const best = Object.fromEntries(
    SESSIONS.map((q) => {
      const times = rows.map((r) => toSeconds(r[q])).filter((t) => t !== null);
      return [q, times.length ? Math.min(...times) : null];
    })
  );
  const hasSession = (q) => best[q] !== null;

  const gap = (r) => {
    const q = lastSession(r);
    const t = toSeconds(r[q]);
    if (t === null || best[q] === null) return null;
    return t - best[q];
  };

  const cols = SESSIONS.filter(hasSession);

  return (
    <TableCard>
      <div className="overflow-x-auto">
        <table className="f1-table">
          <thead>
            <tr>
              <th className="w-16">Pos</th>
              <th>Pilote</th>
              <th className="hidden lg:table-cell">Écurie</th>
              {cols.map((q) => (
                <th key={q} className="hidden text-right sm:table-cell">
                  {q}
                </th>
              ))}
              <th className="text-right sm:hidden">Temps</th>
              <th className="text-right" title="Écart avec le plus rapide de la dernière session disputée">
                Écart
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const q = lastSession(r);
              const prev = rows[i - 1];
              const knockedOut = prev && lastSession(prev) !== q;
              const g = gap(r);
              return (
                <Fragment key={r.Driver.driverId}>
                  {knockedOut && (
                    <tr aria-hidden>
                      <td colSpan={5 + cols.length} className="!py-1.5">
                        <span className="flex items-center gap-3">
                          <span className="h-px flex-1 bg-accent/40" />
                          <span className="kicker text-[0.65rem] text-accent">Éliminés en {q}</span>
                          <span className="h-px flex-1 bg-accent/40" />
                        </span>
                      </td>
                    </tr>
                  )}
                  <tr>
                    <td>
                      <Position value={r.position} />
                    </td>
                    <td>
                      <DriverName driver={r.Driver} constructor={r.Constructor} />
                    </td>
                    <td className="hidden lg:table-cell">
                      <TeamName constructor={r.Constructor} />
                    </td>
                    {cols.map((s) => {
                      const t = toSeconds(r[s]);
                      const fastest = t !== null && t === best[s];
                      return (
                        <td key={s} className="num hidden text-right sm:table-cell">
                          {r[s] ? (
                            fastest ? (
                              <span
                                className="rounded bg-violet-600 px-1.5 py-0.5 font-bold text-white"
                                title={`Meilleur temps de la ${s}`}
                              >
                                {r[s]}
                              </span>
                            ) : (
                              <span className={s === q ? "text-ink" : "text-muted"}>{r[s]}</span>
                            )
                          ) : (
                            <span className="text-faint">{r[s] === "" ? "Pas de temps" : "—"}</span>
                          )}
                        </td>
                      );
                    })}
                    <td className="num text-right sm:hidden">
                      {r[q] ? (
                        <span className={toSeconds(r[q]) === best[q] ? "font-bold text-violet-500" : "text-ink"}>
                          {r[q]}
                        </span>
                      ) : (
                        <span className="text-faint">—</span>
                      )}
                      <span className="block text-[0.65rem] text-faint">{q}</span>
                    </td>
                    <td className="num text-right text-sm">
                      {g === null ? (
                        <span className="text-faint">—</span>
                      ) : g === 0 ? (
                        <span className="font-bold text-ink">{q === "Q3" ? "Pole" : "—"}</span>
                      ) : (
                        <span className="text-muted">+{g.toFixed(3)}</span>
                      )}
                    </td>
                  </tr>
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </TableCard>
  );
}
