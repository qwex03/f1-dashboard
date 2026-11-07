import { useEffect, useRef, useState } from "react";
import Globe from "react-globe.gl";
import * as THREE from "three";
import gpData from "../json/calendar.json";

const MONTHS = {
  jan: 0,
  january: 0,
  feb: 1,
  february: 1,
  mar: 2,
  march: 2,
  apr: 3,
  april: 3,
  may: 4,
  jun: 5,
  june: 5,
  jul: 6,
  july: 6,
  aug: 7,
  august: 7,
  sep: 8,
  sept: 8,
  september: 8,
  oct: 9,
  october: 9,
  nov: 10,
  november: 10,
  dec: 11,
  december: 11,
};

function parseGPDateRange(dateRange) {
  const normalized = dateRange
    .replace(/[^0-9A-Za-z\s]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/\s+/g, " ")
    .trim();
  const parts = normalized.match(
    /^(\d{1,2})(?:\s+([A-Za-z]+))?\s*-\s*(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/
  );

  if (!parts) return null;

  const [, startDay, startMonthName, endDay, endMonthName, year] = parts;
  const endMonth = MONTHS[endMonthName.toLowerCase()];
  const startMonth = startMonthName
    ? MONTHS[startMonthName.toLowerCase()]
    : endMonth;

  if (startMonth === undefined || endMonth === undefined) return null;

  return {
    start: new Date(Number(year), startMonth, Number(startDay)),
    end: new Date(Number(year), endMonth, Number(endDay), 23, 59, 59),
  };
}

function getUpcomingGPs() {
  const today = new Date();

  return gpData
    .map((gp) => ({
      ...gp,
      dateRange: parseGPDateRange(gp.date),
    }))
    .filter((gp) => gp.dateRange && gp.dateRange.end >= today)
    .sort((a, b) => a.dateRange.start - b.dateRange.start);
}

function CalendrierPage() {
  const globeRef = useRef();
  const [selectedGP, setSelectedGP] = useState(null);
  const upcomingGPs = getUpcomingGPs();

  const focusGP = (gp) => {
    setSelectedGP(gp);
    globeRef.current?.pointOfView(
      {
        lat: gp.lat,
        lng: gp.lng,
        altitude: 1.6,
      },
      1200
    );
  };

  useEffect(() => {
    if (!globeRef.current) return undefined;

    const scene = globeRef.current.scene();
    const starCount = 100000;
    const starGeometry = new THREE.BufferGeometry();
    const starVertices = [];

    for (let i = 0; i < starCount; i += 1) {
      const x = (Math.random() - 0.5) * 2000;
      const y = (Math.random() - 0.5) * 2000;
      const z = (Math.random() - 0.5) * 2000;
      starVertices.push(x, y, z);
    }

    starGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(starVertices, 3)
    );

    const starCanvas = document.createElement("canvas");
    starCanvas.width = 64;
    starCanvas.height = 64;
    const ctx = starCanvas.getContext("2d");

    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, "white");
    gradient.addColorStop(0.2, "white");
    gradient.addColorStop(0.4, "rgba(255,255,255,0.5)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);

    const starTexture = new THREE.CanvasTexture(starCanvas);
    const starMaterial = new THREE.PointsMaterial({
      map: starTexture,
      size: 2,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    return () => {
      scene.remove(stars);
      starGeometry.dispose();
      starMaterial.dispose();
      starTexture.dispose();
    };
  }, []);

  return (
    <div className="relative h-screen w-full overflow-hidden">
      <Globe
        ref={globeRef}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
        backgroundColor="#000000"
        showAtmosphere={true}
        pointsData={gpData}
        pointLat="lat"
        pointLng="lng"
        pointColor={(p) => (selectedGP?.gp === p.gp ? "#ffffff" : "#ff1e16")}
        atmosphereColor="#ff6a5c"
        atmosphereAltitude={0.18}
        pointAltitude={0.02}
        pointRadius={0.7}
        pointLabel={(p) => p.gp}
        onPointClick={(point) => focusGP(point)}
      />

      {/* Title overlay */}
      <div className="pointer-events-none absolute left-6 top-6 z-10 md:left-10 md:top-10">
        <p className="mb-2 flex items-center gap-2 font-display text-sm font-semibold uppercase tracking-[0.2em] text-[#ff1e16]">
          <span className="inline-block h-[3px] w-6 bg-[#ff1e16]" />
          Saison {upcomingGPs[0]?.dateRange.start.getFullYear() ?? ""}
        </p>
        <h1 className="font-display text-5xl font-extrabold italic uppercase leading-[0.9] tracking-tight text-white md:text-7xl">
          Calendrier
          <span className="block text-white/40">autour du monde</span>
        </h1>
        <p className="mt-3 max-w-xs text-sm text-white/60">
          Tournez le globe et cliquez sur un circuit pour le découvrir.
        </p>
      </div>

      {selectedGP && (
        <div className="absolute right-6 top-6 z-20 w-80 max-w-[90%] overflow-hidden rounded-xl border border-white/15 bg-black/70 text-white shadow-2xl backdrop-blur-md animate-rise md:right-10 md:top-10">
          <div className="h-1 bg-[#ff1e16]" />
          <div className="p-5">
            <p className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
              {selectedGP.city}
            </p>
            <h2 className="mt-1 font-display text-3xl font-extrabold uppercase leading-none tracking-tight">
              {selectedGP.gp.replace("Grand Prix", "GP")}
            </h2>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between gap-4 border-t border-white/10 pt-2">
                <dt className="text-white/55">Circuit</dt>
                <dd className="text-right">{selectedGP.circuit}</dd>
              </div>
              <div className="flex justify-between gap-4 border-t border-white/10 pt-2">
                <dt className="text-white/55">Dates</dt>
                <dd className="font-mono text-right">{selectedGP.date}</dd>
              </div>
            </dl>
            <button
              onClick={() => setSelectedGP(null)}
              className="mt-5 h-10 w-full rounded-lg border border-white/20 font-semibold text-white transition-colors hover:bg-white hover:text-black"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black via-black/85 to-transparent px-6 pb-6 pt-16 text-white md:px-10">
        <div className="mb-3 flex items-center justify-between gap-4">
          <h2 className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-white/70">
            Prochains Grands Prix
          </h2>
          <span className="font-mono text-xs text-white/50">{upcomingGPs.length} à venir</span>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
          {upcomingGPs.length === 0 && (
            <p className="text-sm text-white/70">Aucun Grand Prix à venir dans le calendrier.</p>
          )}

          {upcomingGPs.map((gp, i) => {
            const isSelected = selectedGP?.gp === gp.gp;

            return (
              <button
                key={gp.gp}
                onClick={() => focusGP(gp)}
                className={`w-60 shrink-0 rounded-xl border px-4 py-3 text-left transition-colors ${
                  isSelected
                    ? "border-[#ff1e16] bg-[#ff1e16] text-white"
                    : "border-white/15 bg-white/[0.06] text-white hover:border-white/40"
                }`}
              >
                <span className="flex items-center justify-between font-mono text-[11px] text-white/60">
                  <span>{gp.date}</span>
                  {i === 0 && !isSelected && <span className="text-[#ff1e16]">● Prochain</span>}
                </span>
                <span className="mt-1 block truncate font-display text-lg font-bold uppercase leading-tight tracking-tight">
                  {gp.gp.replace("Grand Prix", "GP")}
                </span>
                <span className="block truncate text-xs text-white/60">{gp.circuit}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default CalendrierPage;
