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
        pointColor={() => "red"}
        pointAltitude={0.02}
        pointRadius={0.8}
        onPointClick={(point) => focusGP(point)}
      />

      {selectedGP && (
        <div className="absolute top-1/2 left-1/2 z-20 w-80 max-w-[90%] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/30 bg-white/10 p-6 text-white shadow-2xl backdrop-blur-md animate-fadeIn">
          <h2 className="mb-2 text-2xl font-extrabold">{selectedGP.gp}</h2>
          <p className="mb-1 text-sm">
            <span className="font-semibold">Circuit:</span> {selectedGP.circuit}
          </p>
          <p className="mb-1 text-sm">
            <span className="font-semibold">Ville:</span> {selectedGP.city}
          </p>
          <p className="mb-4 text-sm">
            <span className="font-semibold">Date:</span> {selectedGP.date}
          </p>
          <button
            onClick={() => setSelectedGP(null)}
            className="w-full rounded-xl bg-red-600 py-2 font-semibold shadow-md transition-colors duration-200 hover:bg-red-500"
          >
            Fermer
          </button>
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 z-10 border-t border-white/20 bg-black/70 px-4 py-4 text-white backdrop-blur-md">
        <div className="mb-3 flex items-center justify-between gap-4">
          <h2 className="text-lg font-bold">Prochains Grands Prix</h2>
          {selectedGP && (
            <p className="hidden text-sm text-white/70 sm:block">
              Position : {selectedGP.gp}
            </p>
          )}
        </div>

        <div className="flex gap-3 overflow-x-auto pb-1">
          {upcomingGPs.length === 0 && (
            <p className="text-sm text-white/70">
              Aucun Grand Prix a venir dans le calendrier.
            </p>
          )}

          {upcomingGPs.map((gp) => {
            const isSelected = selectedGP?.gp === gp.gp;

            return (
              <button
                key={gp.gp}
                onClick={() => focusGP(gp)}
                className={`min-w-64 rounded-lg border px-4 py-3 text-left transition ${
                  isSelected
                    ? "border-red-400 bg-red-600 text-white shadow-lg"
                    : "border-white/20 bg-white/10 text-white hover:border-red-400 hover:bg-white/20"
                }`}
              >
                <span className="block truncate text-sm font-bold">{gp.gp}</span>
                <span className="mt-1 block truncate text-xs opacity-80">
                  {gp.circuit}
                </span>
                <span className="mt-2 block text-xs font-semibold">{gp.date}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default CalendrierPage;
